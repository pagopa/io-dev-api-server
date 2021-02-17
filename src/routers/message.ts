import { Router } from "express";
import * as faker from "faker/locale/it";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { fiscalCode } from "../global";
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
  frontMatter1CTA,
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter2CTA,
  messageMarkdown
} from "../utils/variables";
import { services } from "./service";

export const messageRouter = Router();

// tslint:disable-next-line
let messagesWithContent: CreatedMessageWithContent[] = [];

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
  prescriptionData?: PrescriptionData
): CreatedMessageWithContent =>
  withContent(
    createMessage(fiscalCode, getRandomServiceId()),
    subject,
    markdown,
    prescriptionData
  );

const addMessage = (message: CreatedMessageWithContent) =>
  messagesWithContent.push(message);

const createMessages = () => {
  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: fiscalCode as FiscalCode
  };

  const medicalPrescriptionMessage = getNewMessage(
    `medical prescription`,
    messageMarkdown,
    medicalPrescription
  );

  addMessage(getNewMessage(`default message`, messageMarkdown));
  addMessage(
    getNewMessage(`with 2 nested CTA`, frontMatter2CTA + messageMarkdown)
  );
  addMessage(
    getNewMessage(`with 1 nested CTA`, frontMatter1CTA + messageMarkdown)
  );
  addMessage(
    getNewMessage(`CTA start BPD`, frontMatter1CTABonusBpd + messageMarkdown)
  );
  addMessage(
    getNewMessage(`CTA IBAN BPD`, frontMatter1CTABonusBpdIban + messageMarkdown)
  );
  const now = new Date();
  addMessage(
    withDueDate(
      withPaymentData(
        getNewMessage(`with payment [valid]`, messageMarkdown),
        true
      ),
      new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

  const message1 = withDueDate(
    withPaymentData(withContent1, true),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
  );
  messagesWC.push(message1);

  const withContent2 = withContent(
    nextMessage(),
    `only due date`,
    messageMarkdown
  );
  const message2 = withDueDate(withContent2, new Date());

  messagesWC.push(message2);

  const withContent3 = withContent(
    nextMessage(),
    `with payment [expired]`,
    messageMarkdown
  );
  const message3 = withDueDate(
    withPaymentData(withContent3, true),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message3);

  const withContent4 = withContent(
    nextMessage(),
    `with payment [expiring] without invalid after due date`,
    messageMarkdown
  );
  const message4 = withDueDate(
    withPaymentData(withContent4, false),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message4);

  const withContent5 = withContent(
    nextMessage(),
    `with payment [expired] without invalid after due date`,
    messageMarkdown
  );
  const message5 = withDueDate(
    withPaymentData(withContent5, false),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message5);

  const withContent6 = withContent(
    nextMessage(),
    `with payment [valid] without invalid after due date`,
    messageMarkdown
  );
  const message6 = withDueDate(
    withPaymentData(withContent6, false),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
  );
  messagesWC.push(message6);

  return messagesWC;
};

messagesWithContent = createMessages();

addHandler(messageRouter, "get", addApiV1Prefix("/messages"), (req, res) => {
  res.json({
    items: messages.payload.items
  });
});

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages/:id"),
  (req, res) => {
    // retrieve the messageIndex from id
    const msgIndex = messages.payload.items.findIndex(
      item => item.id === req.params.id
    );
    if (msgIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
    }
    res.json(messagesWithContent[msgIndex]);
  }
);
