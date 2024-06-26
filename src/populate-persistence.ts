import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { faker } from "@faker-js/faker/locale/it";
import _ from "lodash";
import { CreatedMessageWithContentAndAttachments } from "../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { EUCovidCert } from "../generated/definitions/backend/EUCovidCert";
import { ThirdPartyMessageWithContent } from "../generated/definitions/backend/ThirdPartyMessageWithContent";
import { FiscalCode } from "../generated/definitions/backend/FiscalCode";
import { CreatedMessageWithContent } from "../generated/definitions/backend/CreatedMessageWithContent";
import { ioDevServerConfig } from "./config";
import {
  createMessage,
  withContent,
  withDueDate,
  withPaymentData,
  withRemoteContent
} from "./features/messages/persistence/messagesPayload";
import ServicesDB from "./persistence/services";
import MessagesDB from "./features/messages/persistence/messagesDatabase";
import { eucovidCertAuthResponses } from "./routers/features/eu_covid_cert";
import { IoDevServerConfig } from "./types/config";
import { getRandomValue } from "./utils/random";
import {
  frontMatter1CTABonusCgn,
  frontMatter1CTAFims,
  frontMatter1CTAV2BonusCgnDetails,
  frontMatter2CTA2,
  frontMatterCTAFCISignatureRequest,
  frontMatterCTAFCISignatureRequestCancelled,
  frontMatterCTAFCISignatureRequestExpired,
  frontMatterCTAFCISignatureRequestNoFields,
  frontMatterCTAFCISignatureRequestRejected,
  frontMatterCTAFCISignatureRequestSigned,
  frontMatterCTAFCISignatureRequestSignedExpired,
  frontMatterCTAFCISignatureRequestWaitQtsp,
  messageFciMarkdown,
  messageFciSignedMarkdown,
  messageMarkdown
} from "./utils/variables";
import {
  createPNMessages,
  createPNOptInMessage
} from "./features/pn/payloads/messages";
import { MessageTemplateWrapper } from "./features/messages/types/messageTemplateWrapper";
import { MessageTemplate } from "./features/messages/types/messageTemplate";
import { initializeServiceLogoMap } from "./routers/services_metadata";

const getServiceId = (): string => {
  const servicesSummaries = ServicesDB.getSummaries(true);
  if (servicesSummaries.length === 0) {
    throw new Error(
      "to create messages, at least one sender service must exist!"
    );
  }
  return getRandomValue(
    servicesSummaries[0].service_id,
    faker.helpers.arrayElement(servicesSummaries).service_id,
    "messages"
  );
};

export const getNewMessage = (
  customConfig: IoDevServerConfig,
  subject: string,
  markdown: string,
  euCovidCert?: EUCovidCert,
  serviceId?: string
): CreatedMessageWithContentAndAttachments =>
  withContent(
    createMessage(
      customConfig.profile.attrs.fiscal_code,
      serviceId ?? getServiceId()
    ),
    subject,
    markdown,
    euCovidCert
  );

const createMessagesWithCTA = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.messages.withCTA,
    B.fold(
      () => [],
      () => [
        getNewMessage(
          customConfig,
          `2 nested CTA`,
          frontMatter2CTA2 + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA start CGN`,
          frontMatter1CTABonusCgn + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA v2 CGN details`,
          frontMatter1CTAV2BonusCgnDetails + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA start FIMS SSO`,
          frontMatter1CTAFims + messageMarkdown
        )
      ]
    )
  );

const createMessagesWithEUCovidCert = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.messages.withEUCovidCert,
    B.fold(
      () => [],
      () =>
        eucovidCertAuthResponses.reduce(
          (acc: CreatedMessageWithContentAndAttachments[], config) => {
            const [authCode, description] = config;

            return [
              ...acc,
              getNewMessage(
                customConfig,
                `🏥 EUCovidCert - ${description}`,
                messageMarkdown,
                {
                  auth_code: authCode
                }
              )
            ];
          },
          []
        )
    )
  );

const createMessagesWithFirmaConIOWaitForSignature = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.waitForSignatureCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_SIGNATURE] - ${index}`,
      frontMatterCTAFCISignatureRequest + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOExpired = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.expiredCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [EXPIRED] - ${index}`,
      frontMatterCTAFCISignatureRequestExpired + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOQTSP = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.waitForQtspCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_QTSP] - ${index} `,
      frontMatterCTAFCISignatureRequestWaitQtsp + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOExpired90 = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.expired90Count, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [90 days expired] ${index} `,
      frontMatterCTAFCISignatureRequestSignedExpired + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIOSigned = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.signedCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [SIGNED] - ${index} `,
      frontMatterCTAFCISignatureRequestSigned + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIORejected = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.rejectedCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [REJECTED] - ${index} `,
      frontMatterCTAFCISignatureRequestRejected + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIONoSignatureFields = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.noSignatureFieldsCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WITH NO SIGNATURE FIELDS] - ${index} `,
      frontMatterCTAFCISignatureRequestNoFields + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIONCancelled = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.fci.canceledCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [CANCELLED] - ${index} `,
      frontMatterCTAFCISignatureRequestCancelled + messageFciMarkdown
    )
  );

const createMessagesWithStandard = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.standardMessageCount, index =>
    getNewMessage(customConfig, `standard message - ${index}`, messageMarkdown)
  );

const createMessagesWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.withValidDueDateCount, index =>
    withDueDate(
      getNewMessage(
        customConfig,
        `🕙✅ due date valid - ${index}`,
        messageMarkdown
      ),
      new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

const createMessagesWithInvalidDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.withInValidDueDateCount, index =>
    withDueDate(
      getNewMessage(
        customConfig,
        `🕙❌ due date invalid - ${index}`,
        messageMarkdown
      ),
      new Date(date.getTime() - 60 * 1000 * 60 * 24 * 8)
    )
  );

const createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(
    customConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount,
    index =>
      pipe(
        getNewMessage(
          customConfig,
          `💰🕙❌ payment - expired - invalid after due date - ${index}`,
          messageMarkdown
        ),
        createdMessageWithContentAndAttachments =>
          withPaymentData(createdMessageWithContentAndAttachments, true),
        E.fold(
          error => {
            throw error;
          },
          createdMessageWithContent =>
            withDueDate(
              createdMessageWithContent,
              new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
            )
        )
      )
  );

const createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(
    customConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount,
    index =>
      pipe(
        getNewMessage(
          customConfig,
          `💰🕙✅ payment - valid - invalid after due date - ${index}`,
          messageMarkdown
        ),
        createdMessageWithContentAndAttachments =>
          withPaymentData(createdMessageWithContentAndAttachments, true),
        E.fold(
          error => {
            throw error;
          },
          createdMessageWithContent =>
            withDueDate(
              createdMessageWithContent,
              new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
            )
        )
      )
  );

const createMessagesWithPaymentWithExpiredDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentWithExpiredDueDateCount, index =>
    pipe(
      getNewMessage(
        customConfig,
        `💰🕙 payment - expired - ${index}`,
        messageMarkdown
      ),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, false),
      E.fold(
        error => {
          throw error;
        },
        createdMessageWithContent =>
          withDueDate(
            createdMessageWithContent,
            new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
          )
      )
    )
  );

const createMessagesWithPaymentWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentWithValidDueDateCount, index =>
    pipe(
      getNewMessage(
        customConfig,
        `💰🕙✅ payment message - ${index}`,
        messageMarkdown
      ),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, true),
      E.fold(
        error => {
          throw error;
        },
        createdMessageWithContent =>
          withDueDate(
            createdMessageWithContent,
            new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
          )
      )
    )
  );

const createMessagesWithPayments = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentsCount, index =>
    pipe(
      getNewMessage(customConfig, `💰✅ payment - ${index} `, messageMarkdown),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, true),
      E.fold(
        error => {
          throw error;
        },
        _ => _
      )
    )
  );

const createMessageWithRemoteContent = (
  template: MessageTemplate,
  fiscalCode: FiscalCode,
  templateIndex: number,
  messageIndex: number,
  markdown: string
): CreatedMessageWithContent | ThirdPartyMessageWithContent =>
  pipe(
    {
      sender: `Sender - ${templateIndex} / ${messageIndex}`,
      subject: "Message with remote content"
    },
    sharedData =>
      pipe(
        createMessage(fiscalCode, getServiceId()),
        createdMessageWithoutContent =>
          withContent(
            createdMessageWithoutContent,
            `${sharedData.sender}: ${sharedData.subject}`,
            markdown
          ),
        createdMessageWithContent =>
          pipe(
            template,
            O.fromPredicate(t => t.hasRemoteContent || t.attachmentCount > 0),
            O.fold(
              () => createdMessageWithContent,
              () =>
                withRemoteContent(template, createdMessageWithContent, markdown)
            )
          )
      )
  );

const createMessagesWithRemoteContent = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.messages.messageTemplateWrappers,
    O.fromNullable,
    O.map(messageTemplateWrappers =>
      pipe(
        messageTemplateWrappers as MessageTemplateWrapper[],
        A.mapWithIndex((templateIndex, messageTemplateWrapper) =>
          A.makeBy(messageTemplateWrapper.count, messageIndex =>
            createMessageWithRemoteContent(
              messageTemplateWrapper.template,
              customConfig.profile.attrs.fiscal_code,
              templateIndex,
              messageIndex,
              messageMarkdown
            )
          )
        ),
        A.flatten
      )
    ),
    O.getOrElse(() => [] as CreatedMessageWithContentAndAttachments[])
  );

const createMessages = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] => {
  const now = new Date();

  return [
    /* with CTAs */
    ...createMessagesWithCTA(customConfig),

    /* with EUCovidCert */
    ...createMessagesWithEUCovidCert(customConfig),

    /* Firma con IO */
    ...createMessagesWithFirmaConIOWaitForSignature(customConfig),
    ...createMessagesWithFirmaConIOExpired(customConfig),
    ...createMessagesWithFirmaConIOQTSP(customConfig),
    ...createMessagesWithFirmaConIOExpired90(customConfig),
    ...createMessagesWithFirmaConIOSigned(customConfig),
    ...createMessagesWithFirmaConIORejected(customConfig),
    ...createMessagesWithFirmaConIONoSignatureFields(customConfig),
    ...createMessagesWithFirmaConIONCancelled(customConfig),

    /* standard message */
    ...createMessagesWithStandard(customConfig),

    /* due date */
    ...createMessagesWithValidDueDate(customConfig, now),
    ...createMessagesWithInvalidDueDateCount(customConfig, now),

    /* payments */
    ...createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate(
      customConfig,
      now
    ),
    ...createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate(
      customConfig,
      now
    ),
    ...createMessagesWithPaymentWithExpiredDueDateCount(customConfig, now),
    ...createMessagesWithPaymentWithValidDueDate(customConfig, now),
    ...createMessagesWithPayments(customConfig),

    ...createPNOptInMessage(customConfig),
    ...createPNMessages(customConfig),

    ...createMessagesWithRemoteContent(customConfig)
  ];
};

/**
 * Initialize the services and messages persistence layer.
 * Default on config.json if custom config not defined.
 *
 * @param customConfig
 */
export default function init(customConfig = ioDevServerConfig) {
  initializeServiceLogoMap();
  ServicesDB.createServices(customConfig);

  const messages = createMessages(customConfig);
  MessagesDB.persist(messages);

  if (customConfig.messages.archivedMessageCount > 0) {
    const allInboxMessages = MessagesDB.findAllInbox();
    const archivableInboxMessages = allInboxMessages.filter(
      message => !ServicesDB.isSpecialService(message.sender_service_id)
    );
    _.shuffle(archivableInboxMessages)
      .slice(0, customConfig.messages.archivedMessageCount)
      .forEach(({ id }) => MessagesDB.archive(id));
  }

  if (customConfig.messages.liveMode) {
    // if live updates is on, we prepend new messages to the collection
    const count = customConfig.messages.liveMode.count || 2;
    const interval = customConfig.messages.liveMode.interval || 2000;
    setInterval(() => {
      const nextMessages = createMessages(customConfig);
      const nextShuffledMessages = _.shuffle(nextMessages).slice(
        0,
        Math.min(count, nextMessages.length - 1)
      );
      MessagesDB.persist(nextShuffledMessages);
    }, interval);
  }
}
