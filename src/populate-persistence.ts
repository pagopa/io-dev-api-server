import fs from "fs";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as B from "fp-ts/lib/boolean";
import { faker } from "@faker-js/faker/locale/it";
import _ from "lodash";
import { CreatedMessageWithContentAndAttachments } from "../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { EUCovidCert } from "../generated/definitions/backend/EUCovidCert";
import { MessageAttachment } from "../generated/definitions/backend/MessageAttachment";
import { MessageSubject } from "../generated/definitions/backend/MessageSubject";
import { PrescriptionData } from "../generated/definitions/backend/PrescriptionData";
import { ThirdPartyMessageWithContent } from "../generated/definitions/backend/ThirdPartyMessageWithContent";
import { ioDevServerConfig } from "./config";
import {
  createMessage,
  remoteAttachmentFileCount,
  withContent,
  withDueDate,
  withPaymentData,
  withPNContent,
  withRemoteAttachments
} from "./payloads/message";
import ServicesDB from "./persistence/services";
import MessagesDB from "./persistence/messages";
import { eucovidCertAuthResponses } from "./routers/features/eu_covid_cert";
import { IoDevServerConfig } from "./types/config";
import { getRandomValue } from "./utils/random";
import {
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter1CTABonusCgn,
  frontMatter1CTAFims,
  frontMatter1CTAV2BonusCgnDetails,
  frontMatter2CTA2,
  frontMatterBonusVacanze,
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
  pnOptInCTA,
  pnOptInServiceId,
  pnServiceId
} from "./payloads/services/special/pn/factoryPn";

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

const getNewMessage = (
  customConfig: IoDevServerConfig,
  subject: string,
  markdown: string,
  prescriptionData?: PrescriptionData,
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
    prescriptionData,
    euCovidCert
  );

const getNewPnMessage = (
  customConfig: IoDevServerConfig,
  sender: string,
  subject: string,
  abstract: string,
  markdown: string
): CreatedMessageWithContentAndAttachments =>
  withPNContent(
    withContent(
      createMessage(customConfig.profile.attrs.fiscal_code, pnServiceId),
      `${sender}: ${subject}`,
      markdown
    ),
    faker.helpers.replaceSymbols("######-#-####-####-#"),
    sender,
    subject,
    abstract,
    getRandomValue(new Date(), faker.date.past(), "messages")
  );

const getNewRemoteAttachmentsMessage = (
  customConfig: IoDevServerConfig,
  sender: string,
  subject: string,
  markdown: string,
  attachmentCount: number
): ThirdPartyMessageWithContent =>
  withRemoteAttachments(
    withContent(
      createMessage(customConfig.profile.attrs.fiscal_code, getServiceId()),
      `${sender}: ${subject}`,
      markdown
    ),
    attachmentCount
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
          `2 CTA bonus vacanze`,
          frontMatterBonusVacanze + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA start BPD`,
          frontMatter1CTABonusBpd + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA IBAN BPD`,
          frontMatter1CTABonusBpdIban + messageMarkdown
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
          `1 CTA start FISM SSO`,
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
                undefined,
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

const createMessagesWithObsoleteMedicalPrescriptions = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] => {
  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: customConfig.profile.attrs.fiscal_code
  };

  const barcodeReceipt = fs
    .readFileSync("assets/messages/barcodeReceipt.svg")
    .toString("base64");

  return A.makeBy(customConfig.messages.medicalCount, index => {
    const baseMessage = getNewMessage(
      customConfig,
      `💊 medical prescription - ${index}`,
      messageMarkdown,
      medicalPrescription
    );
    const attachments: ReadonlyArray<MessageAttachment> = [
      {
        name: "prescription A",
        content: "up, down, strange, charm, bottom, top",
        mime_type: "text/plain"
      },
      {
        name: "prescription B",
        content: barcodeReceipt,
        mime_type: "image/svg+xml"
      }
    ];

    return {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        subject:
          `💊 medical prescription with attachments - ${index}` as MessageSubject,
        attachments
      }
    };
  });
};

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
      withDueDate(
        withPaymentData(
          getNewMessage(
            customConfig,
            `💰🕙❌ payment - expired - invalid after due date - ${index}`,
            messageMarkdown
          ),
          true
        ),
        new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
  );

const createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(
    customConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount,
    index =>
      withDueDate(
        withPaymentData(
          getNewMessage(
            customConfig,
            `💰🕙✅ payment - valid - invalid after due date - ${index}`,
            messageMarkdown
          ),
          true
        ),
        new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
  );

const createMessagesWithPaymentWithExpiredDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentWithExpiredDueDateCount, index =>
    withDueDate(
      withPaymentData(
        getNewMessage(
          customConfig,
          `💰🕙 payment - expired - ${index}`,
          messageMarkdown
        ),
        false
      ),
      new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
    )
  );

const createMessagesWithPaymentWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentWithValidDueDateCount, index =>
    withDueDate(
      withPaymentData(
        getNewMessage(
          customConfig,
          `💰🕙✅ payment message - ${index}`,
          messageMarkdown
        ),
        true
      ),
      new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

const createMessagesWithPayments = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.paymentsCount, index =>
    withPaymentData(
      getNewMessage(customConfig, `💰✅ payment - ${index} `, messageMarkdown),
      true
    )
  );

const createPNOptInMessage = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.messages.pnOptInMessage,
    B.fold(
      () => [],
      () => [
        getNewMessage(
          customConfig,
          `PN OptIn CTA`,
          pnOptInCTA + messageMarkdown,
          undefined,
          undefined,
          pnOptInServiceId
        )
      ]
    )
  );

const createMessagesWithPN = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.services.specialServices.pn,
    B.fold(
      () => [],
      () =>
        A.makeBy(customConfig.messages.pnCount, index => {
          const sender = `"Comune di Milano - ${index} `;
          const subject = "infrazione al codice della strada";
          const abstract =
            "È stata notificata una infrazione al codice per un veicolo intestato a te: i dettagli saranno consultabili nei documenti allegati.";

          return getNewPnMessage(
            customConfig,
            sender,
            subject,
            abstract,
            messageMarkdown
          );
        })
    )
  );

const createMessagesWithRemoteAttachments = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  A.makeBy(customConfig.messages.withRemoteAttachments, index =>
    getNewRemoteAttachmentsMessage(
      customConfig,
      `Sender ${index}`,
      `Subject ${index}: remote attachments`,
      messageMarkdown,
      1 + (index % remoteAttachmentFileCount)
    )
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

    /* medical */
    ...createMessagesWithObsoleteMedicalPrescriptions(customConfig),

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
    ...createMessagesWithPN(customConfig),

    ...createMessagesWithRemoteAttachments(customConfig)
  ];
};

/**
 * Initialize the services and messages persistence layer.
 * Default on config.json if custom config not defined.
 *
 * @param customConfig
 */
export default function init(customConfig = ioDevServerConfig) {
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
