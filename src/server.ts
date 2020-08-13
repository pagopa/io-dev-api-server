import bodyParser from "body-parser";
import { Application } from "express";
import express, { Response } from "express";
import { takeEnd } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import { Millisecond } from "italia-ts-commons/lib/units";
import morgan from "morgan";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";
import { UserDataProcessing } from "../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../generated/definitions/backend/UserDataProcessingStatus";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";
import { basePath } from "../generated/definitions/backend_api_paths";
import { TransactionListResponse } from "../generated/definitions/pagopa/TransactionListResponse";
import { Wallet } from "../generated/definitions/pagopa/Wallet";
import { bonusVacanze, resetBonusVacanze } from "./features/bonus-vacanze/apis";
import { availableBonuses } from "./features/bonus-vacanze/payloads/availableBonuses";
import { fiscalCode, staticContentRootPath } from "./global";
import { backendInfo, backendStatus } from "./payloads/backend";
import { contextualHelpData } from "./payloads/contextualHelp";
import { getProblemJson, notFound } from "./payloads/error";
import { loginWithToken } from "./payloads/login";
import {
  getMessages,
  withDueDate,
  withMessageContent,
  withPaymentData
} from "./payloads/message";
import { municipality } from "./payloads/municipality";
import { getProfile } from "./payloads/profile";
import { ResponseHandler } from "./payloads/response";
import {
  getServiceMetadata,
  getServices,
  getServicesByScope,
  getServicesTuple
} from "./payloads/service";
import { session } from "./payloads/session";
import { getSuccessResponse } from "./payloads/success";
import { userMetadata } from "./payloads/userMetadata";
import { getTransactions, getWallets, sessionToken } from "./payloads/wallet";
import { publicRouter } from "./routers/public";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { walletPath, walletRouter } from "./routers/wallet";
import { delayer } from "./utils/delay_middleware";
import { validatePayload } from "./utils/validator";
import {
  frontMatter1CTA,
  frontMatter2CTA,
  frontMatter2CTA2,
  frontMatterInvalid,
  messageMarkdown
} from "./utils/variables";
import { profileRouter } from "./routers/profile";

// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
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
app.use(`${basePath}/bonus/vacanze`, bonusVacanze);
app.use(staticContentRootPath, servicesMetadataRouter);
app.use("/", publicRouter);
app.use(walletPath, walletRouter);
app.use(basePath, profileRouter);

const responseHandler = new ResponseHandler(app);

// setting IO backend behavior (NOTE: all exported variables and functions it's because they should be tested, to ensure the expected behavior)
// profile

// services and messages
export const services = getServices(20);
const totalMessages = 1;
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
  frontMatter2CTA2
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
    | undefined
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;

// public API
app.get("/", (_, res) => {
  res.send(`Hi. This is ${packageJson.name}`);
});

app.get("/login", (_, res) => {
  res.redirect(loginWithToken);
});
app.post("/logout", (_, res) => {
  res.status(200).send("ok");
});

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
  .addCustomHandler("post", "/user-metadata", req => {
    // simply validate and return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  })
  // return messages
  .addCustomHandler("get", "/messages", _ => messages, 3000 as Millisecond)
  // return a mock message with content (always found!)
  .addCustomHandler("get", "/messages/:id", req => {
    // retrieve the messageIndex from id
    const msgIndex = messages.payload.items.findIndex(
      item => item.id === req.params.id
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
  .addCustomHandler("get", "/services/:service_id", req => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );
    return { payload: service || notFound.payload };
  })
  .addCustomHandler("get", "/user-data-processing/:choice", req => {
    const choice = req.params.choice as UserDataProcessingChoiceEnum;
    if (userChoices[choice] === undefined) {
      return getProblemJson(404);
    }
    return { payload: userChoices[choice] };
  })
  .addCustomHandler("post", "/user-data-processing", req => {
    const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
    const choice = payload.choice;
    if (userChoices[choice] !== undefined) {
      return { payload: userChoices[choice] };
    }
    const data: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 1
    };
    userChoices = {
      DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
      DELETE: choice === "DELETE" ? data : userChoices.DELETE
    };
    return { payload: userChoices[choice] };
  })
  // return positive feedback on request to receive a new email to verify the email address
  .addHandler("post", "/email-validation-process", {
    status: 202,
    payload: undefined
  });

export default app;
