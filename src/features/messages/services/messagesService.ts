import { IncomingHttpHeaders } from "node:http";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { isRight } from "fp-ts/lib/Either";
import { __, match, not } from "ts-pattern";
import { IoDevServerConfig } from "../../../types/config";
import { ThirdPartyAttachment } from "../../../../generated/definitions/backend/ThirdPartyAttachment";
import { defaultContentType } from "../persistence/messagesPayload";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { PublicMessage } from "../../../../generated/definitions/backend/PublicMessage";
import { CreatedMessageWithContentAndEnrichedData } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { sendServiceId } from "../../pn/services/dataService";
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
import { ioDevServerConfig } from "../../../config";
import { nextMessageIdAndCreationDate } from "../utils";
import { HasPreconditionEnum } from "../../../../generated/definitions/backend/HasPrecondition";
import { APIKey } from "../../pn/models/APIKey";

export const getMessageCategory = (
  message: CreatedMessageWithContent
): MessageCategory => {
  if ("category" in message) {
    const messageCategoryEither = MessageCategory.decode(message.category);
    if (isRight(messageCategoryEither)) {
      const messageCategory = messageCategoryEither.right;
      if (messageCategory.tag === "PN") {
        return {
          id: messageCategory.id,
          tag: messageCategory.tag
        };
      }
      return messageCategoryEither.right;
    }
  }
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
    senderService.id === sendServiceId
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
            service_name: senderService.name,
            organization_name: senderService.organization.name,
            organization_fiscal_code: senderService.organization.fiscal_code,
            message_title: content.subject,
            category: getMessageCategory(message),
            is_read,
            is_archived,
            has_attachments,
            has_precondition:
              message.content.third_party_data?.has_precondition ===
                HasPreconditionEnum.ALWAYS ||
              (message.content.third_party_data?.has_precondition ===
                HasPreconditionEnum.ONCE &&
                !is_read)
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

const createMessage = () =>
  pipe(
    ServicesDB.getLocalServices(),
    localServices =>
      pipe(
        localServices.length,
        length => Math.min(Math.floor(Math.random() * length), length - 1),
        randomServiceIndex => localServices[randomServiceIndex]
      ),
    localService =>
      pipe(
        nextMessageIdAndCreationDate(),
        ({ id, created_at }) =>
          ({
            id,
            fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code,
            created_at,
            content: {
              subject: `Created on ${new Date().toTimeString()}`,
              markdown: `Message content that was created on ${new Date().toTimeString()}\n\nJust some more content to make sure that it has a viable length`
            },
            sender_service_id: localService.id
          } as CreatedMessageWithContentAndAttachments)
      )
  );

const handleAttachment = (
  attachment: ThirdPartyAttachment,
  attachmentPollingData: Map<string, [Date, Date]>,
  config: IoDevServerConfig,
  sendAttachmentCallback: (contentType: string, relativePath: string) => void,
  sendRetryAfterCallback: (retryAfterSeconds: number) => void
) => {
  const url = attachment.url;
  const isF24 = url.includes("/f24/");
  if (isF24) {
    // The getter also checks for expiration (if so, it generates a whole
    // new tuple so that the attachment is not ready for download yet)
    const pollingAndExpirationDatesTuple = getPollingAndExpirationTuple(
      attachment.url,
      attachmentPollingData,
      config
    );
    const isReadyForDownload = pollingAndExpirationDatesTuple[0] < new Date();
    if (isReadyForDownload) {
      sendAttachment(
        attachment.url,
        attachment.content_type,
        sendAttachmentCallback
      );
    } else {
      const retryAfterSeconds =
        config.messages.attachmentRetryAfterSeconds ?? 3;
      sendRetryAfterCallback(retryAfterSeconds);
    }
  } else {
    sendAttachment(
      attachment.url,
      attachment.content_type,
      sendAttachmentCallback
    );
  }
};

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
) => {
  const pollingAndExpirationDatesTuple =
    attachmentPollingData.get(attachmentUrl);
  if (pollingAndExpirationDatesTuple != null) {
    const hasNotExpiredYet = new Date() < pollingAndExpirationDatesTuple[1];
    if (hasNotExpiredYet) {
      return pollingAndExpirationDatesTuple;
    }
  }
  return generateAndSavePollingAndExpirationTuple(
    attachmentUrl,
    attachmentPollingData,
    config
  );
};

const generateAndSavePollingAndExpirationTuple = (
  attachmentUrl: string,
  attachmentPollingData: Map<string, [Date, Date]>,
  config: IoDevServerConfig
) => {
  const pollingAndExpirationTuple = generatePollingAndExpirationTuple(config);
  attachmentPollingData.set(attachmentUrl, pollingAndExpirationTuple);
  return pollingAndExpirationTuple;
};

const generatePollingAndExpirationTuple = (
  config: IoDevServerConfig
): [Date, Date] => {
  const pollingDate = generatePollingDate(config);
  const expirationDate = generateExpirationDate(pollingDate, config);
  return [pollingDate, expirationDate];
};

const generatePollingDate = (config: IoDevServerConfig) => {
  const pollingDelaySeconds =
    config.messages.attachmentAvailableAfterSeconds ?? 0;
  return new Date(new Date().getTime() + 1000 * pollingDelaySeconds);
};

const generateExpirationDate = (
  pollingStartDate: Date,
  config: IoDevServerConfig
) => {
  const expiredDelaySeconds =
    config.messages.attachmentExpiredAfterSeconds ?? 24 * 60 * 60;
  return new Date(pollingStartDate.getTime() + 1000 * expiredDelaySeconds);
};

const lollipopClientHeadersFromHeaders = (
  headers: IncomingHttpHeaders
): Record<string, string> =>
  [
    "x-pagopa-lollipop-original-method",
    "x-pagopa-lollipop-original-url",
    "signature-input",
    "signature"
  ].reduce((accumulatedHeaders, headerName) => {
    const headerValue = headers[headerName];
    if (headerValue != null) {
      return {
        ...accumulatedHeaders,
        [headerName]: headerValue
      };
    }
    return accumulatedHeaders;
  }, {});

const generateFakeLollipopServerHeaders = (
  fiscalCode: string
): Record<string, string> => ({
  // (sha256-[A-Za-z0-9-_=]{1,44}) | (sha384-[A-Za-z0-9-_=]{1,66}) | (sha512-[A-Za-z0-9-_=]{1,88})
  "x-pagopa-lollipop-assertion-ref":
    "sha256-olqj0f6xO-LHyWM1sTOK-c17Qdi37g_MvefmdjMlZAg",
  // SAML | OIDC
  "x-pagopa-lollipop-assertion-type": "SAML",
  "x-pagopa-lollipop-auth-jwt":
    "eyJrdHkiOiJFQyIsInkiOiJPa01mUXpTTE9iQ24xcjZlYm1nQUFYemIxbkRpSlozV0VwdEVEQ1JUaVNrPSIsImNydiI6IlAtMjU2IiwieCI6IlQ2dDBTSWJCd0pBdy9ON2N4ZjhldTdEYlJmbTQyZkZCL0pGVjBCcjVYSGs9In0=",
  //  Base64url encode of a JWK Public Key
  "x-pagopa-lollipop-public-key":
    "e2t0eToiRUMiLHk6Ik9rTWZRelNMT2JDbjFyNmVibWdBQVh6YjFuRGlKWjNXRXB0RURDUlRpU2s9IixjcnY6IlAtMjU2Iix4OiJUNnQwU0liQndKQXcvTjdjeGY4ZXU3RGJSZm00MmZGQi9KRlYwQnI1WEhrPSJ9",
  "x-pagopa-lollipop-user-id": fiscalCode
});

const sendAPIKeyHeader = (): Record<string, string> => ({
  "x-api-key": APIKey
});

const sendTaxIdHeader = (fiscalCode: string): Record<string, string> => ({
  "x-pagopa-cx-taxid": fiscalCode
});

export default {
  computeGetMessagesQueryIndexes,
  createMessage,
  generateFakeLollipopServerHeaders,
  getMessageCategory,
  getPublicMessages,
  handleAttachment,
  lollipopClientHeadersFromHeaders,
  sendAPIKeyHeader,
  sendTaxIdHeader
};
