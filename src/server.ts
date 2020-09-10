import bodyParser from "body-parser";
import { Application } from "express";
import express from "express";
import morgan from "morgan";
import { UserDataProcessing } from "../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../generated/definitions/backend/UserDataProcessingStatus";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";
import {
  bonusVacanze,
  resetBonusVacanze,
} from "./routers/features/bonus-vacanze";
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
import { userMetadata } from "./payloads/userMetadata";
import { publicRouter } from "./routers/public";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { walletRouter } from "./routers/wallet";
import { validatePayload } from "./utils/validator";
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
// if you want to add a delay in your server, use delayer (utils/delay_middleware)
//app.use(delayer(500 as Millisecond));
// set middleware logging

app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
// add routers for
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

// change this directory to serve differents files

// define user UserDataProcessing (download / delete)
// to handle e remember user choice
type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined,
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;

// public API

/** wallet content */

/** static contents */

// it should be useful to reset some states
app.get("/reset", (_, res) => {
  // reset profile
  // TO DO RESTORE
  // currentProfile = getProfile(fiscalCode).payload;
  // reset user shoice
  userChoices = initialUserChoice;
  resetBonusVacanze();
  res.send("ok - reset");
});

/** IO backend API handlers */
responseHandler
  .addHandler("get", "/session", session)
  .addHandler("get", "/user-metadata", userMetadata)
  .addCustomHandler("post", "/user-metadata", (req) => {
    // simply validate and return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  })
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
  })
  .addCustomHandler("get", "/user-data-processing/:choice", (req) => {
    const choice = req.params.choice as UserDataProcessingChoiceEnum;
    if (userChoices[choice] === undefined) {
      return getProblemJson(404);
    }
    return { payload: userChoices[choice] };
  })
  .addCustomHandler("post", "/user-data-processing", (req) => {
    const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
    const choice = payload.choice;
    if (userChoices[choice] !== undefined) {
      return { payload: userChoices[choice] };
    }
    const data: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 1,
    };
    userChoices = {
      DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
      DELETE: choice === "DELETE" ? data : userChoices.DELETE,
    };
    return { payload: userChoices[choice] };
  })
  // return positive feedback on request to receive a new email to verify the email address
  .addHandler("post", "/email-validation-process", {
    status: 202,
    payload: undefined,
  });

export default app;
