import { Router } from "express";
import { installHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import {
  getServices,
  getServicesByScope,
  getServicesTuple,
} from "../payloads/service";
import {
  getMessages,
  withDueDate,
  withMessageContent,
} from "../payloads/message";
import { fiscalCode } from "../global";
import {
  frontMatter1CTA,
  frontMatter2CTA,
  frontMatter2CTA2,
  frontMatterInvalid,
  messageMarkdown,
} from "../utils/variables";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { getProblemJson } from "../payloads/error";

export const messageRouter = Router();
export const services = getServices(5);
const totalMessages = 5;
export const messages = getMessages(totalMessages, services, fiscalCode);
export const servicesTuple = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);
let messagesWithContent: CreatedMessageWithContent[] = [];

const createMessages = () => {
  const now = new Date();
  const hourAhead = new Date(now.getTime() + 60 * 1000 * 60);
  const messageContents: ReadonlyArray<string> = [
    "",
    frontMatter2CTA,
    frontMatter1CTA,
    frontMatterInvalid,
    frontMatter2CTA2,
  ];
  return messages.payload.items.map((item, idx) => {
    const withContent = withMessageContent(
      item,
      `Subject - test ${idx + 1}`,
      messageContents[idx % messageContents.length] + messageMarkdown // add front matter prefix
    );
    const withDD = withDueDate(withContent, hourAhead);
    return withDD;
  });
};

messagesWithContent = createMessages();

installHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages"),
  (_) => messages
);

installHandler(messageRouter, "get", addApiV1Prefix("/messages/:id"), (req) => {
  // retrieve the messageIndex from id
  const msgIndex = messages.payload.items.findIndex(
    (item) => item.id === req.params.id
  );
  if (msgIndex === -1) {
    return getProblemJson(404, "message not found");
  }
  return { payload: messagesWithContent[msgIndex], isJson: true };
});
