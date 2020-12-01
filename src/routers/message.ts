import { Router } from "express";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  base64png,
  base64svg,
  getMessages,
  withDueDate,
  withMessageContent,
  withPaymentData
} from "../payloads/message";
import { installCustomHandler, installHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import {
  frontMatter1CTA,
  frontMatter1CTABonusBpd,
  frontMatter2CTA,
  messageMarkdown
} from "../utils/variables";
import { services } from "./service";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { MessageAttachment } from "../../generated/definitions/backend/MessageAttachment";

export const messageRouter = Router();
const totalMessages = 10;
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
  const attachments: ReadonlyArray<MessageAttachment> = [
    { name: "attachment1", content: base64png, mime_type: "image/png" },
    {
      name: "attachment2",
      content: base64svg,
      mime_type: "image/svg+xml"
    }
  ];

  const medicalPrescriptionMessage = withMessageContent(
    nextMessage(),
    `medical prescription`,
    messageMarkdown,
    medicalPrescription
  );

  const messageDefault = withMessageContent(
    nextMessage(),
    `default message`,
    messageMarkdown
  );

  const message2NestedCta = withMessageContent(
    nextMessage(),
    `with 2 nested CTA`,
    frontMatter2CTA + messageMarkdown
  );

  const message1NestedCta = withMessageContent(
    nextMessage(),
    `with 1 nested CTA`,
    frontMatter1CTA + messageMarkdown
  );

  const message1NestedCtaBonusBpd = withMessageContent(
    nextMessage(),
    `with 1 nested CTA BPD`,
    frontMatter1CTABonusBpd + messageMarkdown
  );

  const withContent1 = withMessageContent(
    nextMessage(),
    `with payment [valid]`,
    messageMarkdown
  );
  const message1 = withDueDate(
    withPaymentData(withContent1, true),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
  );

  const withContent2 = withMessageContent(
    nextMessage(),
    `with payment [expiring]`,
    messageMarkdown
  );
  const message2 = withDueDate(
    withPaymentData(withContent2, true),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 3)
  );

  const withContent3 = withMessageContent(
    nextMessage(),
    `with payment [expired]`,
    messageMarkdown
  );
  const message3 = withDueDate(
    withPaymentData(withContent3, true),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  const withContent4 = withMessageContent(
    nextMessage(),
    `with payment [expiring] without invalid after due date`,
    messageMarkdown
  );
  const message4 = withDueDate(
    withPaymentData(withContent4, false),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 3)
  );

  const withContent5 = withMessageContent(
    nextMessage(),
    `with payment [expired] without invalid after due date`,
    messageMarkdown
  );
  const message5 = withDueDate(
    withPaymentData(withContent5, false),
    new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
  );

  const withContent6 = withMessageContent(
    nextMessage(),
    `with payment [valid] without invalid after due date`,
    messageMarkdown
  );
  const message6 = withDueDate(
    withPaymentData(withContent6, false),
    new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
  );

  return [
    messageDefault,
    message2NestedCta,
    message1NestedCta,
    message1NestedCtaBonusBpd,
    medicalPrescriptionMessage,
    message1,
    message2,
    message3,
    message4,
    message5,
    message6
  ];
};

messagesWithContent = createMessages();

installCustomHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages"),
  (req, res) => {
    res.json({
      items: messages.payload.items
    });
  }
);

installHandler(messageRouter, "get", addApiV1Prefix("/messages/:id"), req => {
  // retrieve the messageIndex from id
  const msgIndex = messages.payload.items.findIndex(
    item => item.id === req.params.id
  );
  if (msgIndex === -1) {
    return getProblemJson(404, "message not found");
  }
  return { payload: messagesWithContent[msgIndex], isJson: true };
});
