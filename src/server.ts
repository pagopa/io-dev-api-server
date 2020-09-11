import bodyParser from "body-parser";
import { Application } from "express";
import express from "express";
import morgan from "morgan";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { fiscalCode, staticContentRootPath } from "./global";
import { getProblemJson, notFound } from "./payloads/error";
import {
  getMessages,
  withDueDate,
  withMessageContent,
} from "./payloads/message";
import { ResponseHandler } from "./payloads/response";
import {
  getServices,
  getServicesByScope,
  getServicesTuple,
} from "./payloads/service";
import { session } from "./payloads/session";
import { publicRouter } from "./routers/public";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { walletRouter } from "./routers/wallet";
import {
  frontMatter1CTA,
  frontMatter2CTA,
  frontMatter2CTA2,
  frontMatterInvalid,
  messageMarkdown,
} from "./utils/variables";
import { profileRouter } from "./routers/profile";
import { miscRouter } from "./routers/misc";

// create express server
const app: Application = express();
app.use(bodyParser.json());
// set middlewares
// if you want to add a delay in your server, use a global delayer (utils/delay_middleware)
// app.use(delayer(500 as Millisecond));

// set middleware logger
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
// add routers
app.use(bonusVacanze);
app.use(staticContentRootPath, servicesMetadataRouter);
app.use(publicRouter);
app.use(miscRouter);
app.use(walletRouter);
app.use(profileRouter);

const responseHandler = new ResponseHandler(app);

// setting IO backend behavior (NOTE: all exported variables and functions it's because they should be tested, to ensure the expected behavior)
// profile

// services and messages
export const services = getServices(5);
const totalMessages = 5;
export const messages = getMessages(totalMessages, services, fiscalCode);
const now = new Date();
const hourAhead = new Date(now.getTime() + 60 * 1000 * 60);
export const servicesTuple = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);
const messageContents: ReadonlyArray<string> = [
  "",
  frontMatter2CTA,
  frontMatter1CTA,
  frontMatterInvalid,
  frontMatter2CTA2,
];
export const messagesWithContent = messages.payload.items.map((item, idx) => {
  const withContent = withMessageContent(
    item,
    `Subject - test ${idx + 1}`,
    messageContents[idx % messageContents.length] + messageMarkdown // add front matter prefix
  );
  const withDD = withDueDate(withContent, hourAhead);
  return withDD;
});

responseHandler
  .addHandler("get", "/session", session)
  // return messages
  .addCustomHandler("get", "/messages", (_) => messages)
  // return a mock message with content (always found!)
  .addCustomHandler("get", "/messages/:id", (req) => {
    // retrieve the messageIndex from id
    const msgIndex = messages.payload.items.findIndex(
      (item) => item.id === req.params.id
    );
    if (msgIndex === -1) {
      return getProblemJson(404, "message not found");
    }
    return { payload: messagesWithContent[msgIndex], isJson: true };
  })
  // return services
  .addHandler("get", "/services", servicesTuple)
  /* 
    //how to send "too many requests" response
    .addHandler("get", "/services", getProblemJson(429, "too many requests"))
  */
  // return a mock service with the same requested id (always found!)
  .addCustomHandler("get", "/services/:service_id", (req) => {
    const service = services.find(
      (item) => item.service_id === req.params.service_id
    );

    return { payload: service || notFound.payload };
  });

export default app;
