import { Router } from "express";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  getMessages,
  withDueDate,
  withMessageContent,
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
const totalMessages = 12;
export const messages = getMessages(totalMessages, services, fiscalCode);
// tslint:disable-next-line: no-let
let messagesWithContent: ReadonlyArray<CreatedMessageWithContent> = [];

const createMessages = () => {
  const now = new Date();
  // tslint:disable-next-line: no-let
  let messageIndex = 0;
  const nextMessage = () => {
    const m = messages.payload.items[messageIndex];
    messageIndex++;
    return m;
  };

  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: fiscalCode as FiscalCode
  };

  const messagesWC = new Array();
  const medicalPrescriptionMessage = withMessageContent(
    nextMessage(),
    `medical prescription`,
    messageMarkdown,
    medicalPrescription
  );
  messagesWC.push(medicalPrescriptionMessage);

  const messageDefault = withMessageContent(
    nextMessage(),
    `default message`,
    messageMarkdown
  );
  messagesWC.push(messageDefault);

  const message2NestedCta = withMessageContent(
    nextMessage(),
    `with 2 nested CTA`,
    frontMatter2CTA + messageMarkdown
  );
  messagesWC.push(message2NestedCta);

  const message1NestedCta = withMessageContent(
    nextMessage(),
    `with 1 nested CTA`,
    frontMatter1CTA + messageMarkdown
  );
  messagesWC.push(message1NestedCta);

  const message1NestedCtaBonusBpd = withMessageContent(
    nextMessage(),
    `CTA start BPD`,
    frontMatter1CTABonusBpd + messageMarkdown
  );
  messagesWC.push(message1NestedCtaBonusBpd);

  const message1NestedCtaBonusBpdIban = withMessageContent(
    nextMessage(),
    `CTA IBAN BPD`,
    frontMatter1CTABonusBpdIban + messageMarkdown
  );
  messagesWC.push(message1NestedCtaBonusBpdIban);

  const withContent1 = withMessageContent(
    nextMessage(),
    `with payment [valid]`,
    messageMarkdown
  );
  const message1 = withDueDate(
    withPaymentData(withContent1, true),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
  );
  messagesWC.push(message1);

  const withContent2 = withMessageContent(
    nextMessage(),
    `with payment [expiring]`,
    messageMarkdown
  );
  const message2 = withDueDate(
    withPaymentData(withContent2, true),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message2);

  const withContent3 = withMessageContent(
    nextMessage(),
    `with payment [expired]`,
    messageMarkdown
  );
  const message3 = withDueDate(
    withPaymentData(withContent3, true),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message3);

  const withContent4 = withMessageContent(
    nextMessage(),
    `with payment [expiring] without invalid after due date`,
    messageMarkdown
  );
  const message4 = withDueDate(
    withPaymentData(withContent4, false),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message4);

  const withContent5 = withMessageContent(
    nextMessage(),
    `with payment [expired] without invalid after due date`,
    messageMarkdown
  );
  const message5 = withDueDate(
    withPaymentData(withContent5, false),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  messagesWC.push(message5);

  const withContent6 = withMessageContent(
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
