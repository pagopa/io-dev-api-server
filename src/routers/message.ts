import { Router } from "express";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  getMessages,
  withDueDate,
  withMessageContent,
  withPaymentData
} from "../payloads/message";
import { installHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import {
  frontMatter1CTA,
  frontMatter2CTA,
  frontMatter2CTA2,
  frontMatterInvalid,
  messageMarkdown
} from "../utils/variables";
import { services } from "./service";

export const messageRouter = Router();
const totalMessages = 8;
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
    message1,
    message2,
    message3,
    message4,
    message5,
    message6
  ];
};

messagesWithContent = createMessages();

installHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages"),
  _ => messages
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
