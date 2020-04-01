import bodyParser from "body-parser";
import { Application } from "express";
import express, { Response } from "express";
import fs from "fs";
import morgan from "morgan";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";
import { UserDataProcessing } from "../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../generated/definitions/backend/UserDataProcessingStatus";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";
import { backendInfo, backendStatus } from "./payloads/backend";
import { getProblemJson, notFound } from "./payloads/error";
import { loginWithToken } from "./payloads/login";
import {
  getMessageWithContent,
  getMessageWithoutContentList
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
import { validatePayload } from "./utils/validator";

// fiscalCode used within the client communication
export const fiscalCode = "RSSMRA83A12H501D";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
// create express server
const app: Application = express();
// set middlewares
// if you want to add a delay in your server, use delayer (utils/delay_middleware)
// app.use(delayer(3000 as Millisecond));
// set middleware logging
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
app.use(bodyParser.json());
const responseHandler = new ResponseHandler(app);

app.get("/", (_, res) => {
  res.send(`Hi. This is ${packageJson.name}`);
});

app.get("/login", (_, res) => {
  res.redirect(loginWithToken);
});
app.post("/logout", (_, res) => {
  res.status(200).send("ok");
});

app.get("/info", (_, res) => {
  res.json(backendInfo);
});

app.get("/ping", (_, res) => {
  res.send("ok");
});

// backend service status
app.get("/status/backend.json", (_, res) => {
  res.json(backendStatus);
});

export const services = getServices(20);
const totalMessages = 5;
export const messages = getMessageWithoutContentList(
  totalMessages,
  services,
  fiscalCode
);

// tslint:disable-next-line: no-let
let currentProfile = getProfile(fiscalCode).payload;

type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;
export const messagesWithContent = messages.payload.items.map((msg, idx) => {
  // all messages have a due date 1 month different from each other
  return getMessageWithContent(
    fiscalCode,
    services[idx % services.length].service_id,
    msg.id
  );
});
export const servicesTuple = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);
export const wallets = getWallets();
export const transactions = getTransactions(5);
export const staticContentRootPath = "/static_contents";

/** wallet content */
app.get("/wallet/v1/users/actions/start-session", (_, res) => {
  res.json(sessionToken);
});

app.get("/wallet/v1/wallet", (_, res) => {
  res.json(wallets);
});

app.get("/wallet/v1/transactions", (_, res) => {
  res.json(transactions);
});

/** static contents */
app.get(`${staticContentRootPath}/services/:service_id`, (req, res) => {
  const serviceId = req.params.service_id.replace(".json", "");
  if (serviceId === "servicesByScope") {
    res.json(servicesByScope.payload);
    return;
  }
  res.json(getServiceMetadata(serviceId, servicesTuple.payload).payload);
});

const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

app.get(
  `${staticContentRootPath}/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

app.get(`${staticContentRootPath}/logos/services/:service_id`, (_, res) => {
  // ignoring service id and send always the same image
  sendFile("assets/imgs/logos/services/service_1.png", res);
});

app.get(`${staticContentRootPath}/municipalities/:A/:B/:CODE`, (_, res) => {
  res.json(municipality);
});

// it should be usefull to reset some states
app.get("/reset", (_, res) => {
  // reset profile
  currentProfile = getProfile(fiscalCode).payload;
  // reset user shoice
  userChoices = initialUserChoice;
  res.send("ok - reset");
});

/** IO backend API handlers */

responseHandler
  .addHandler("get", "/session", session)
  .addCustomHandler("get", "/profile", _ => {
    return { payload: currentProfile, isJson: true };
  })
  .addHandler("put", "/installations/:installationID", getSuccessResponse())
  .addCustomHandler("post", "/profile", req => {
    // the server profile is merged with
    // the one coming from request. Furthermore this profile's version is increased by 1

    const clintProfileIncresed = {
      ...req.body,
      version: parseInt(req.body.version, 10) + 1
    };
    currentProfile = validatePayload(InitializedProfile, {
      ...currentProfile,
      ...clintProfileIncresed
    });
    return {
      payload: currentProfile,
      isJson: true
    };
  })
  .addHandler("get", "/user-metadata", userMetadata)
  .addCustomHandler("post", "/user-metadata", req => {
    // simply return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  })
  // return a message
  .addHandler("get", "/messages", messages)
  // return a mock message with content (always found!)
  .addCustomHandler("get", "/messages/:id", req => {
    // retrieve the service_id from the messages list
    const msgIndex = messages.payload.items.findIndex(
      item => item.id === req.params.id
    );
    return messagesWithContent[msgIndex];
  })
  // return 10 mock services
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
