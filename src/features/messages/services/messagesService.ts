import { identity, pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { __, match, not } from "ts-pattern";
import { IoDevServerConfig } from "../../../types/config";
import { ThirdPartyAttachment } from "../../../../generated/definitions/backend/ThirdPartyAttachment";
import { defaultContentType } from "../persistence/messagesPayload";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { PublicMessage } from "../../../../generated/definitions/backend/PublicMessage";
import { CreatedMessageWithContentAndEnrichedData } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";
import ServicesDB from "../../../persistence/services";
import { pnServiceId } from "../../pn/services/services";
import { GetMessagesParameters } from "../../../types/parameters";
import { CreatedMessageWithContent } from "../../../../generated/definitions/backend/CreatedMessageWithContent";
import { MessageCategory } from "../../../../generated/definitions/backend/MessageCategory";
import { ThirdPartyMessageWithContent } from "../../../../generated/definitions/backend/ThirdPartyMessageWithContent";
import { TagEnum as TagEnumBase } from "../../../../generated/definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "../../../../generated/definitions/backend/MessageCategoryPayment";
import {
  MessageCategoryPN,
  TagEnum as TagEnumPN
} from "../../../../generated/definitions/backend/MessageCategoryPN";
import { rptIdFromServiceAndPaymentData } from "../../../utils/payment";

export const getMessageCategory = (
  message: CreatedMessageWithContent
): MessageCategory => {
  const { eu_covid_cert, payment_data } = message.content;
  const serviceId = message.sender_service_id;
  const senderService = ServicesDB.getService(serviceId);
  if (!senderService) {
    throw Error(
      `message.getCategory: unabled to find service with id (${serviceId})`
    );
  }
  if (
    ThirdPartyMessageWithContent.is(message) &&
    senderService.service_id === pnServiceId
  ) {
    return {
      tag: TagEnumPN.PN,
      original_sender: message.third_party_message.details?.senderDenomination,
      id: message.third_party_message.details?.iun,
      original_receipt_date: message.third_party_message.details?.sentAt,
      summary: message.third_party_message.details?.subject
    } as MessageCategoryPN;
  }
  if (eu_covid_cert?.auth_code) {
    return {
      tag: TagEnumBase.EU_COVID_CERT
    };
  }
  if (payment_data) {
    return {
      tag: TagEnumPayment.PAYMENT,
      rptId: rptIdFromServiceAndPaymentData(senderService, payment_data)
    };
  }
  return {
    tag: TagEnumBase.GENERIC
  };
};

/* helper function to build messages response */
const getPublicMessages = (
  messages: ReadonlyArray<CreatedMessageWithContentAndAttachments>,
  withEnrichedData: boolean,
  withContent: boolean,
  config: IoDevServerConfig
): ReadonlyArray<PublicMessage | CreatedMessageWithContentAndAttachments> =>
  messages.map(message => {
    const serviceId = message.sender_service_id;
    const senderService = ServicesDB.getService(serviceId);
    if (!senderService) {
      throw Error(
        `message.getPublicMessages: unabled to find service with id (${serviceId})`
      );
    }

    const enrichedData = pipe(
      withEnrichedData,
      B.fold(
        () => ({}),
        () => {
          const { content, is_read, is_archived, has_attachments } =
            message as CreatedMessageWithContentAndEnrichedData;

          return {
            service_name: senderService.service_name,
            organization_name: senderService.organization_name,
            message_title: content.subject,
            category: getMessageCategory(message),
            is_read,
            is_archived,
            has_attachments,
            has_precondition: senderService.service_id === pnServiceId
          };
        }
      )
    );

    const content = pipe(
      withContent,
      B.fold(
        () => ({}),
        () => ({
          content: message.content
        })
      )
    );

    return {
      id: message.id,
      fiscal_code: config.profile.attrs.fiscal_code,
      created_at: message.created_at,
      sender_service_id: message.sender_service_id,
      time_to_live: message.time_to_live,
      ...enrichedData,
      ...content
    };
  });

const computeGetMessagesQueryIndexes = (
  params: GetMessagesParameters,
  orderedList: ReadonlyArray<CreatedMessageWithContentAndAttachments>
) => {
  const toMatch = { maximumId: params.maximumId, minimumId: params.minimumId };
  return match(toMatch)
    .with({ maximumId: not(__.nullish), minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.maximumId);
      const startIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // if indexes are defined and in the expected order
      if (![startIndex, endIndex].includes(-1) && startIndex < endIndex) {
        return {
          startIndex: startIndex + 1,
          endIndex,
          backward: false
        };
      }
    })
    .with({ maximumId: not(__.nullish) }, () => {
      const startIndex = orderedList.findIndex(m => m.id === params.maximumId);
      // index is defined and not at the end of the list
      if (startIndex !== -1 && startIndex + 1 < orderedList.length) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: startIndex + 1,
          endIndex: startIndex + 1 + pageSize,
          backward: false
        };
      }
    })
    .with({ minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // index found and it isn't the first item (can't go back)
      if (endIndex > 0) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: Math.max(0, endIndex - (1 + pageSize)),
          endIndex,
          backward: true
        };
      }
    })
    .otherwise(() => ({
      startIndex: 0,
      endIndex: params.pageSize as number,
      backward: false
    }));
};

export const handleAttachment = (
  attachment: ThirdPartyAttachment,
  attachmentPollingData: Map<string, [Date, Date]>,
  config: IoDevServerConfig,
  sendAttachmentCallback: (contentType: string, relativePath: string) => void,
  sendRetryAfterCallback: (retryAfterSeconds: number) => void
) =>
  pipe(
    attachment.url,
    S.includes("/f24/"),
    B.fold(
      () =>
        sendAttachment(
          attachment.url,
          attachment.content_type,
          sendAttachmentCallback
        ),
      () =>
        pipe(
          getPollingAndExpirationTuple(
            attachment.url,
            attachmentPollingData,
            config
          ),
          O.fromPredicate(
            pollingAndExpirationDatesTuple =>
              pollingAndExpirationDatesTuple[0] < new Date()
          ),
          O.fold(
            () =>
              pipe(
                config.messages.attachmentRetryAfterSeconds,
                O.fromNullable,
                O.getOrElse(() => 3),
                sendRetryAfterCallback
              ),
            () =>
              sendAttachment(
                attachment.url,
                attachment.content_type,
                sendAttachmentCallback
              )
          )
        )
    )
  );

const sendAttachment = (
  attachmentUrl: string,
  contentType: string | undefined,
  sendAttachmentCallback: (contentType: string, relativePath: string) => void
) =>
  pipe(
    contentType,
    O.fromNullable,
    O.getOrElse(() => defaultContentType),
    contentType => sendAttachmentCallback(contentType, attachmentUrl)
  );

const getPollingAndExpirationTuple = (
  attachmentUrl: string,
  attachmentPollingData: Map<string, [Date, Date]>,
  config: IoDevServerConfig
) =>
  pipe(
    attachmentPollingData.get(attachmentUrl),
    O.fromNullable,
    O.chain(
      O.fromPredicate(
        pollingAndExpirationDatesTuple =>
          new Date() < pollingAndExpirationDatesTuple[1]
      )
    ),
    O.fold(
      () =>
        generateAndSavePollingAndExpirationTuple(
          attachmentUrl,
          attachmentPollingData,
          config
        ),
      identity
    )
  );

const generateAndSavePollingAndExpirationTuple = (
  attachmentUrl: string,
  attachmentPollingData: Map<string, [Date, Date]>,
  config: IoDevServerConfig
) =>
  pipe(config, generatePollingAndExpirationTuple, pollingAndExpirationTuple =>
    pipe(
      attachmentPollingData.set(attachmentUrl, pollingAndExpirationTuple),
      () => pollingAndExpirationTuple
    )
  );

const generatePollingAndExpirationTuple = (
  config: IoDevServerConfig
): [Date, Date] =>
  pipe(config, generatePollingDate, pollingDate =>
    pipe(generateExpirationDate(pollingDate, config), expirationDate => [
      pollingDate,
      expirationDate
    ])
  );

const generatePollingDate = (config: IoDevServerConfig) =>
  pipe(
    config.messages.attachmentAvailableAfterSeconds,
    O.fromNullable,
    O.getOrElse(() => 0),
    pollingDelaySeconds =>
      new Date(new Date().getTime() + 1000 * pollingDelaySeconds)
  );

const generateExpirationDate = (
  pollingStartDate: Date,
  config: IoDevServerConfig
) =>
  pipe(
    config.messages.attachmentExpiredAfterSeconds,
    O.fromNullable,
    O.getOrElse(() => 24 * 60 * 60),
    expiredDelaySeconds =>
      new Date(pollingStartDate.getTime() + 1000 * expiredDelaySeconds)
  );

export default {
  computeGetMessagesQueryIndexes,
  getMessageCategory,
  getPublicMessages,
  handleAttachment
};
