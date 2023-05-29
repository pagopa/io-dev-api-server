import fs from "fs";
import { faker } from "@faker-js/faker/locale/it";
import { range } from "fp-ts/lib/NonEmptyArray";
import _ from "lodash";
import { CreatedMessageWithContent } from "../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { EUCovidCert } from "../generated/definitions/backend/EUCovidCert";
import { MessageAttachment } from "../generated/definitions/backend/MessageAttachment";
import { MessageSubject } from "../generated/definitions/backend/MessageSubject";
import { PrescriptionData } from "../generated/definitions/backend/PrescriptionData";
import { ThirdPartyMessageWithContent } from "../generated/definitions/backend/ThirdPartyMessageWithContent";
import { CreatedMessageWithContentAndEnrichedData } from "../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";
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
  frontMatterCTAFCISignatureRequestExpired,
  frontMatterCTAFCISignatureRequestNoFields,
  frontMatterCTAFCISignatureRequestRejected,
  frontMatterCTAFCISignatureRequestSigned,
  frontMatterCTAFCISignatureRequestSignedExpired,
  frontMatterCTAFCISignatureRequestWaitQtsp,
  frontMatterCTAFCISignatureRequestCanceled,
  messageFciMarkdown,
  messageFciSignedMarkdown,
  messageMarkdown
} from "./utils/variables";
import { pnServiceId } from "./payloads/services/special/pn/factoryPn";

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
  euCovidCert?: EUCovidCert
): CreatedMessageWithContent =>
  withContent(
    createMessage(customConfig.profile.attrs.fiscal_code, getServiceId()),
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
): CreatedMessageWithContent =>
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
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.withCTA) {
    output.push(
      getNewMessage(
        customConfig,
        `2 nested CTA`,
        frontMatter2CTA2 + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `2 CTA bonus vacanze`,
        frontMatterBonusVacanze + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `1 CTA start BPD`,
        frontMatter1CTABonusBpd + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `1 CTA IBAN BPD`,
        frontMatter1CTABonusBpdIban + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `1 CTA start CGN`,
        frontMatter1CTABonusCgn + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `1 CTA v2 CGN details`,
        frontMatter1CTAV2BonusCgnDetails + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `1 CTA start FISM SSO`,
        frontMatter1CTAFims + messageMarkdown
      )
    );
  }
};

const createMessagesWithEUCovidCert = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.withEUCovidCert) {
    eucovidCertAuthResponses.forEach(config => {
      const [authCode, description] = config;

      output.push(
        getNewMessage(
          customConfig,
          `🏥 EUCovidCert - ${description}`,
          messageMarkdown,
          undefined,
          {
            auth_code: authCode
          }
        )
      );
    });
  }
};

const createMessagesWithObsoleteMedicalPrescriptions = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.medicalCount > 0) {
    const medicalPrescription: PrescriptionData = {
      nre: "050A00854698121",
      iup: "0000X0NFM",
      prescriber_fiscal_code: customConfig.profile.attrs.fiscal_code
    };

    const medicalMessage = (count: number) =>
      getNewMessage(
        customConfig,
        `💊 medical prescription - ${count}`,
        messageMarkdown,
        medicalPrescription
      );

    const barcodeReceipt = fs
      .readFileSync("assets/messages/barcodeReceipt.svg")
      .toString("base64");
    range(1, customConfig.messages.medicalCount).forEach(count => {
      const baseMessage = medicalMessage(count);
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
      output.push({
        ...baseMessage,
        content: {
          ...baseMessage.content,
          subject: `💊 medical prescription with attachments - ${count}` as MessageSubject,
          attachments
        }
      });
    });
  }
};

const createMessagesWithFirmaConIOWaitForSignature = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.waitForSignatureCount > 0) {
    range(1, customConfig.messages.fci.waitForSignatureCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_SIGNATURE] - ${count}`,
          frontMatterCTAFCISignatureRequest + messageFciMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIOExpired = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.expiredCount > 0) {
    range(1, customConfig.messages.fci.expiredCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [EXPIRED] - ${count}`,
          frontMatterCTAFCISignatureRequestExpired + messageFciMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIOQTSP = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.waitForQtspCount > 0) {
    range(1, customConfig.messages.fci.waitForQtspCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_QTSP] - ${count} `,
          frontMatterCTAFCISignatureRequestWaitQtsp + messageFciMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIOExpired90 = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.expired90Count > 0) {
    range(1, customConfig.messages.fci.expired90Count).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [90 days expired] ${count} `,
          frontMatterCTAFCISignatureRequestSignedExpired +
            messageFciSignedMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIOCanceled = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.canceledCount > 0) {
    range(1, customConfig.messages.fci.canceledCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [CANCELED] ${count} `,
          frontMatterCTAFCISignatureRequestCanceled + messageFciSignedMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIOSigned = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.signedCount > 0) {
    range(1, customConfig.messages.fci.signedCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [SIGNED] - ${count} `,
          frontMatterCTAFCISignatureRequestSigned + messageFciSignedMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIORejected = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.rejectedCount > 0) {
    range(1, customConfig.messages.fci.rejectedCount).forEach(count => {
      output.push(
        getNewMessage(
          customConfig,
          `Comune di Controguerra - Richiesta di Firma [REJECTED] - ${count} `,
          frontMatterCTAFCISignatureRequestRejected + messageFciSignedMarkdown
        )
      );
    });
  }
};

const createMessagesWithFirmaConIONoSignatureFields = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.fci.noSignatureFieldsCount > 0) {
    range(1, customConfig.messages.fci.noSignatureFieldsCount).forEach(
      count => {
        output.push(
          getNewMessage(
            customConfig,
            `Comune di Controguerra - Richiesta di Firma [WITH NO SIGNATURE FIELDS] - ${count} `,
            frontMatterCTAFCISignatureRequestNoFields + messageFciMarkdown
          )
        );
      }
    );
  }
};

const createMessagesWithStandard = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.standardMessageCount > 0) {
    range(1, customConfig.messages.standardMessageCount).forEach(count =>
      output.push(
        getNewMessage(
          customConfig,
          `standard message - ${count}`,
          messageMarkdown
        )
      )
    );
  }
};

const createMessagesWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.withValidDueDateCount > 0) {
    range(1, customConfig.messages.withValidDueDateCount).forEach(count =>
      output.push(
        withDueDate(
          getNewMessage(
            customConfig,
            `🕙✅ due date valid - ${count}`,
            messageMarkdown
          ),
          new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
        )
      )
    );
  }
};

const createMessagesWithInvalidDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.withInValidDueDateCount > 0) {
    range(1, customConfig.messages.withInValidDueDateCount).forEach(count =>
      output.push(
        withDueDate(
          getNewMessage(
            customConfig,
            `🕙❌ due date invalid - ${count}`,
            messageMarkdown
          ),
          new Date(date.getTime() - 60 * 1000 * 60 * 24 * 8)
        )
      )
    );
  }
};

const createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (
    customConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount > 0
  ) {
    range(
      1,
      customConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount
    ).forEach(count =>
      output.push(
        withDueDate(
          withPaymentData(
            getNewMessage(
              customConfig,
              `💰🕙❌ payment - expired - invalid after due date - ${count}`,
              messageMarkdown
            ),
            true
          ),
          new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
        )
      )
    );
  }
};

const createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (
    customConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount > 0
  ) {
    range(
      1,
      customConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount
    ).forEach(count =>
      output.push(
        withDueDate(
          withPaymentData(
            getNewMessage(
              customConfig,
              `💰🕙✅ payment - valid - invalid after due date - ${count}`,
              messageMarkdown
            ),
            true
          ),
          new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
        )
      )
    );
  }
};

const createMessagesWithPaymentWithExpiredDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.paymentWithExpiredDueDateCount > 0) {
    range(
      1,
      customConfig.messages.paymentWithExpiredDueDateCount
    ).forEach(count =>
      output.push(
        withDueDate(
          withPaymentData(
            getNewMessage(
              customConfig,
              `💰🕙 payment - expired - ${count}`,
              messageMarkdown
            ),
            false
          ),
          new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
        )
      )
    );
  }
};

const createMessagesWithPaymentWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.paymentWithValidDueDateCount > 0) {
    range(
      1,
      customConfig.messages.paymentWithValidDueDateCount
    ).forEach(count =>
      output.push(
        withDueDate(
          withPaymentData(
            getNewMessage(
              customConfig,
              `💰🕙✅ payment message - ${count}`,
              messageMarkdown
            ),
            true
          ),
          new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
        )
      )
    );
  }
};

const createMessagesWithPayments = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.paymentsCount > 0) {
    range(1, customConfig.messages.paymentsCount).forEach(count =>
      output.push(
        withPaymentData(
          getNewMessage(
            customConfig,
            `💰✅ payment - ${count} `,
            messageMarkdown
          ),
          true
        )
      )
    );
  }
};

const createMessagesWithPN = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (
    customConfig.services.specialServices.pn &&
    customConfig.messages.pnCount > 0
  ) {
    range(1, customConfig.messages.pnCount).forEach(_ => {
      const sender = "Comune di Milano";
      const subject = "infrazione al codice della strada";
      const abstract =
        "È stata notificata una infrazione al codice per un veicolo intestato a te: i dettagli saranno consultabili nei documenti allegati.";
      output.push(
        getNewPnMessage(
          customConfig,
          sender,
          subject,
          abstract,
          messageMarkdown
        )
      );
    });
  }
};

const createMessagesWithRemoteAttachments = (
  customConfig: IoDevServerConfig,
  output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  >
) => {
  if (customConfig.messages.withRemoteAttachments > 0) {
    range(1, customConfig.messages.withRemoteAttachments).forEach(index => {
      output.push(
        getNewRemoteAttachmentsMessage(
          customConfig,
          `Sender ${index}`,
          `Subject ${index}: remote attachments`,
          messageMarkdown,
          1 + (index % remoteAttachmentFileCount)
        )
      );
    });
  }
};

const createMessages = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndEnrichedData[] => {
  const now = new Date();
  const output: CreatedMessageWithContentAndEnrichedData[] = [];

  /* with CTAs */
  createMessagesWithCTA(customConfig, output);

  /* with EUCovidCert */
  createMessagesWithEUCovidCert(customConfig, output);

  /* medical */
  createMessagesWithObsoleteMedicalPrescriptions(customConfig, output);

  /* Firma con IO */
  createMessagesWithFirmaConIOWaitForSignature(customConfig, output);
  createMessagesWithFirmaConIOExpired(customConfig, output);
  createMessagesWithFirmaConIOQTSP(customConfig, output);
  createMessagesWithFirmaConIOExpired90(customConfig, output);
  createMessagesWithFirmaConIOSigned(customConfig, output);
  createMessagesWithFirmaConIORejected(customConfig, output);
  createMessagesWithFirmaConIONoSignatureFields(customConfig, output);
  createMessagesWithFirmaConIOCanceled(customConfig, output);

  /* standard message */
  createMessagesWithStandard(customConfig, output);

  /* due date */
  createMessagesWithValidDueDate(customConfig, now, output);
  createMessagesWithInvalidDueDateCount(customConfig, now, output);

  /* payments */
  createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate(
    customConfig,
    now,
    output
  );
  createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate(
    customConfig,
    now,
    output
  );
  createMessagesWithPaymentWithExpiredDueDateCount(customConfig, now, output);
  createMessagesWithPaymentWithValidDueDate(customConfig, now, output);
  createMessagesWithPayments(customConfig, output);

  createMessagesWithPN(customConfig, output);

  createMessagesWithRemoteAttachments(customConfig, output);

  return output;
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
