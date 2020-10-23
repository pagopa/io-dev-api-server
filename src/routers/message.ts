import { Router } from "express";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  getMessages,
  withDueDate,
  withMessageContent
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
const totalMessages = 5;
export const messages = getMessages(totalMessages, services, fiscalCode);
// tslint:disable-next-line: no-let
let messagesWithContent: ReadonlyArray<CreatedMessageWithContent> = [];

const createMessages = () => {
  const now = new Date();
  const hourAhead = new Date(now.getTime() + 60 * 1000 * 60);
  const messageContents: ReadonlyArray<string> = [
    "",
    frontMatter2CTA,
    frontMatter1CTA,
    frontMatterInvalid,
    frontMatter2CTA2
  ];
  return messages.payload.items.map((item, idx) => {
    const withContent = withMessageContent(
      item,
      `Subject - test ${idx + 1}`,
      messageContents[idx % messageContents.length] + messageMarkdown // add front matter prefix
    );
    return withDueDate(withContent, hourAhead);
  });
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
