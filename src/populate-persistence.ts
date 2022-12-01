import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import fs from "fs";
import _ from "lodash";
import { CreatedMessageWithContent } from "../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { EUCovidCert } from "../generated/definitions/backend/EUCovidCert";
import { MessageAttachment } from "../generated/definitions/backend/MessageAttachment";
import { MessageSubject } from "../generated/definitions/backend/MessageSubject";
import { PrescriptionData } from "../generated/definitions/backend/PrescriptionData";
import { ioDevServerConfig } from "./config";
import {
  createMessage,
  getMvlAttachments,
  withContent,
  withDueDate,
  withLegalContent,
  withPaymentData,
  withPNContent
} from "./payloads/message";
import { pnServiceId } from "./payloads/services/special";
import MessagesDB from "./persistence/messages";
import { eucovidCertAuthResponses } from "./routers/features/eu_covid_cert";
import { services } from "./routers/service";
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
  frontMatterCTAFCISignatureRequestSigned,
  frontMatterCTAFCISignatureRequestWaitQtsp,
  messageFciMarkdown,
  messageFciSignedMarkdown,
  messageMarkdown
} from "./utils/variables";

const getServiceId = (): string => {
  if (services.length === 0) {
    throw new Error(
      "to create messages, at least one sender service must exist!"
    );
  }
  return getRandomValue(
    services[0].service_id,
    faker.random.arrayElement(services).service_id,
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

const createMessages = (
  customConfig: IoDevServerConfig
  // tslint:disable-next-line: readonly-array
): Array<
  CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  // tslint:disable-next-line:no-big-function
> => {
  // tslint:disable-next-line: readonly-array
  const output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  > = [];

  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: customConfig.profile.attrs.fiscal_code
  };
  const now = new Date();

  /* with CTAs */
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
    output.push(
      getNewMessage(
        customConfig,
        `Comune di Controguerra - Carta d'Identità Elettronica - Firma [WAIT_FOR_SIGNATURE]`,
        frontMatterCTAFCISignatureRequest + messageFciMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `Università di Controguerra - Contratto Erasmus - Firma [EXPIRED]`,
        frontMatterCTAFCISignatureRequestExpired + messageFciMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `Università di Cuneo - Contratto Erasmus - Firma [WAIT_FOR_QTSP]`,
        frontMatterCTAFCISignatureRequestWaitQtsp + messageFciMarkdown
      )
    );
    output.push(
      getNewMessage(
        customConfig,
        `Comune di Controguerra - Carta d'identità Elettronica - Documento Firmato`,
        frontMatterCTAFCISignatureRequestSigned + messageFciSignedMarkdown
      )
    );
  }

  /* with EUCovidCert */
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

  /* medical */
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

  /* standard message */
  range(1, customConfig.messages.standardMessageCount).forEach(count =>
    output.push(
      getNewMessage(
        customConfig,
        `standard message - ${count}`,
        messageMarkdown
      )
    )
  );

  /* due date */
  range(1, customConfig.messages.withValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(
          customConfig,
          `🕙✅ due date valid - ${count}`,
          messageMarkdown
        ),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, customConfig.messages.withInValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(
          customConfig,
          `🕙❌ due date invalid - ${count}`,
          messageMarkdown
        ),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  /* payments */
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
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

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
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

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
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

  range(1, customConfig.messages.paymentWithValidDueDateCount).forEach(count =>
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
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

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

  range(1, customConfig.messages.legalCount).forEach(count => {
    const isOdd = count % 2 > 0;
    const message = getNewMessage(
      customConfig,
      `⚖️ Legal -${isOdd ? "" : "without HTML"} ${count}`,
      messageMarkdown
    );
    const mvlMsgId = message.id;
    const attachments = getMvlAttachments(mvlMsgId, ["pdf", "png", "jpg"]);
    output.push(withLegalContent(message, message.id, attachments, isOdd));
  });

  range(1, customConfig.messages.pnCount).forEach(count => {
    const sender = "Comune di Milano";
    const subject = "infrazione al codice della strada";
    const abstract =
      "È stata notificata una infrazione al codice per un veicolo intestato a te: i dettagli saranno consultabili nei documenti allegati.";
    output.push(
      getNewPnMessage(customConfig, sender, subject, abstract, messageMarkdown)
    );
  });

  return output;
};

/**
 * Initialize the messages persistence layer.
 * Default on config.json if custom config not defined.
 *
 * @param customConfig
 */
export default function init(customConfig = ioDevServerConfig) {
  MessagesDB.persist(createMessages(customConfig) as any);

  if (customConfig.messages.archivedMessageCount > 0) {
    _.shuffle(MessagesDB.findAllInbox())
      .slice(0, ioDevServerConfig.messages.archivedMessageCount)
      .forEach(({ id }) => MessagesDB.archive(id));
  }

  if (customConfig.messages.liveMode) {
    // if live updates is on, we prepend new messages to the collection
    const count = customConfig.messages.liveMode.count || 2;
    const interval = customConfig.messages.liveMode.interval || 2000;
    setInterval(() => {
      const nextMessages = createMessages(customConfig);

      MessagesDB.persist(
        _.shuffle(nextMessages).slice(
          0,
          Math.min(count, nextMessages.length - 1)
        ) as any
      );
    }, interval);
  }
}
