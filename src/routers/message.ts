import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/CreatedMessageWithoutContentCollection";
import { MessageContentEu_covid_cert } from "../../generated/definitions/backend/MessageContent";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ioDevServerConfig } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  createMessage,
  withContent,
  withDueDate,
  withPaymentData
} from "../payloads/message";
import { addHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import {
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter1CTABonusCgn,
  frontMatter2CTA2,
  frontMatterBonusVacanze,
  messageMarkdown
} from "../utils/variables";
import { eucovidCertAuthResponses } from "./features/eu_covid_cert";
import { services } from "./service";

export const messageRouter = Router();

// tslint:disable-next-line: readonly-array
export const messagesWithContent: CreatedMessageWithContent[] = [];

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
  euCovidCert?: MessageContentEu_covid_cert
): CreatedMessageWithContent =>
  withContent(
    createMessage(
      ioDevServerConfig.profileAttrs.fiscalCode,
      getRandomServiceId()
    ),
    subject,
    markdown,
    prescriptionData,
    euCovidCert
  );

const addMessage = (message: CreatedMessageWithContent) =>
  messagesWithContent.push(message);

const createMessages = () => {
  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: ioDevServerConfig.profileAttrs.fiscalCode
  };
  const now = new Date();

  /* with CTAs */
  if (ioDevServerConfig.messages.withCTA) {
    addMessage(
      getNewMessage(`2 nested CTA`, frontMatter2CTA2 + messageMarkdown)
    );
    addMessage(
      getNewMessage(
        `2 CTA bonus vacanze`,
        frontMatterBonusVacanze + messageMarkdown
      )
    );
    addMessage(
      getNewMessage(
        `1 CTA start BPD`,
        frontMatter1CTABonusBpd + messageMarkdown
      )
    );
    addMessage(
      getNewMessage(
        `1 CTA IBAN BPD`,
        frontMatter1CTABonusBpdIban + messageMarkdown
      )
    );
    addMessage(
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
      addMessage(
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

  /* medical */
  range(1, ioDevServerConfig.messages.medicalCount).map(count =>
    addMessage(
      getNewMessage(
        `💊 medical prescription - ${count}`,
        messageMarkdown,
        medicalPrescription
      )
    )
  );

  /* standard message */
  range(1, ioDevServerConfig.messages.standardMessageCount).map(count =>
    addMessage(getNewMessage(`standard message - ${count}`, messageMarkdown))
  );

  /* due date */
  range(1, ioDevServerConfig.messages.withValidDueDateCount).map(count =>
    addMessage(
      withDueDate(
        getNewMessage(`🕙✅ due date valid - ${count}`, messageMarkdown),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.withInValidDueDateCount).map(count =>
    addMessage(
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
  ).map(count =>
    addMessage(
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
  ).map(count =>
    addMessage(
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
  ).map(count =>
    addMessage(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙 payment - expired - ${count}`, messageMarkdown),
          false
        ),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

  range(1, ioDevServerConfig.messages.paymentWithValidDueDateCount).map(count =>
    addMessage(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙✅ payment message - ${count}`, messageMarkdown),
          true
        ),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.paymentsCount).map(count =>
    addMessage(
      withPaymentData(
        getNewMessage(`💰✅ payment - ${count} `, messageMarkdown),
        true
      )
    )
  );
};

createMessages();
export const getMessageWithoutContent = (): CreatedMessageWithoutContentCollection => ({
  items: messagesWithContent.map(m => ({
    id: m.id,
    fiscal_code: ioDevServerConfig.profileAttrs.fiscalCode,
    created_at: m.created_at,
    sender_service_id: m.sender_service_id,
    time_to_live: m.time_to_live
  }))
});
addHandler(messageRouter, "get", addApiV1Prefix("/messages"), (req, res) => {
  res.json(getMessageWithoutContent());
});

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages/:id"),
  (req, res) => {
    // retrieve the messageIndex from id
    const msgIndex = messagesWithContent.findIndex(
      item => item.id === req.params.id
    );
    if (msgIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
    }
    res.json(messagesWithContent[msgIndex]);
  }
);
