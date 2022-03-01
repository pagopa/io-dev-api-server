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
  withPaymentData
} from "./payloads/message";
import MessagesDB from "./persistence/messages";
import { eucovidCertAuthResponses } from "./routers/features/eu_covid_cert";
import { services } from "./routers/service";
import {
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter1CTABonusCgn,
  frontMatter2CTA2,
  frontMatterBonusVacanze,
  messageMarkdown
} from "./utils/variables";

const getRandomServiceId = (): string => {
  if (services.length === 0) {
    throw new Error(
      "to create messages, at least one sender service must exist!"
    );
  }
  return faker.random.arrayElement(services).service_id;
};

const getNewMessage = (
  subject: string,
  markdown: string,
  prescriptionData?: PrescriptionData,
  euCovidCert?: EUCovidCert
): CreatedMessageWithContent =>
  withContent(
    createMessage(
      ioDevServerConfig.profile.attrs.fiscal_code,
      getRandomServiceId()
    ),
    subject,
    markdown,
    prescriptionData,
    euCovidCert
  );

// tslint:disable-next-line: readonly-array
const createMessages = (): Array<
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
    prescriber_fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code
  };
  const now = new Date();

  /* with CTAs */
  if (ioDevServerConfig.messages.withCTA) {
    output.push(
      getNewMessage(`2 nested CTA`, frontMatter2CTA2 + messageMarkdown)
    );
    output.push(
      getNewMessage(
        `2 CTA bonus vacanze`,
        frontMatterBonusVacanze + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA start BPD`,
        frontMatter1CTABonusBpd + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA IBAN BPD`,
        frontMatter1CTABonusBpdIban + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA start CGN`,
        frontMatter1CTABonusCgn + messageMarkdown
      )
    );
  }

  /* with EUCovidCert */
  if (ioDevServerConfig.messages.withEUCovidCert) {
    eucovidCertAuthResponses.forEach(config => {
      const [authCode, description] = config;

      output.push(
        getNewMessage(
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
      `💊 medical prescription - ${count}`,
      messageMarkdown,
      medicalPrescription
    );

  const barcodeReceipt = fs
    .readFileSync("assets/messages/barcodeReceipt.svg")
    .toString("base64");

  /* medical */
  range(1, ioDevServerConfig.messages.medicalCount).forEach(count => {
    output.push(medicalMessage(count));
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
  range(1, ioDevServerConfig.messages.standardMessageCount).forEach(count =>
    output.push(getNewMessage(`standard message - ${count}`, messageMarkdown))
  );

  /* due date */
  range(1, ioDevServerConfig.messages.withValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(`🕙✅ due date valid - ${count}`, messageMarkdown),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.withInValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(`🕙❌ due date invalid - ${count}`, messageMarkdown),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  /* payments */
  range(
    1,
    ioDevServerConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(
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
    ioDevServerConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(
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
    ioDevServerConfig.messages.paymentWithExpiredDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙 payment - expired - ${count}`, messageMarkdown),
          false
        ),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

  range(
    1,
    ioDevServerConfig.messages.paymentWithValidDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙✅ payment message - ${count}`, messageMarkdown),
          true
        ),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.paymentsCount).forEach(count =>
    output.push(
      withPaymentData(
        getNewMessage(`💰✅ payment - ${count} `, messageMarkdown),
        true
      )
    )
  );

  range(1, ioDevServerConfig.messages.legalCount).forEach((count, idx) => {
    const isOdd = count % 2 > 0;
    const message = getNewMessage(
      `⚖️ Legal -${isOdd ? "" : "without HTML"} ${count}`,
      messageMarkdown
    );
    const mvlMsgId = message.id;
    const attachments = getMvlAttachments(mvlMsgId, ["pdf", "png", "jpg"]);
    output.push(withLegalContent(message, message.id, attachments, isOdd));
  });

  return output;
};

export default function init() {
  MessagesDB.persist(createMessages());

  if (ioDevServerConfig.messages.archivedMessageCount > 0) {
    _.shuffle(MessagesDB.findAllInbox())
      .slice(0, ioDevServerConfig.messages.archivedMessageCount)
      .forEach(({ id }) => MessagesDB.archive(id));
  }

  if (ioDevServerConfig.messages.liveMode) {
    // if live updates is on, we prepend new messages to the collection
    const count = ioDevServerConfig.messages.liveMode.count || 2;
    const interval = ioDevServerConfig.messages.liveMode.interval || 2000;
    setInterval(() => {
      const nextMessages = createMessages();

      MessagesDB.persist(
        _.shuffle(nextMessages).slice(
          0,
          Math.min(count, nextMessages.length - 1)
        )
      );
    }, interval);
  }
}
