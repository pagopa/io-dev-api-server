import bodyParser from "body-parser";
import { Application } from "express";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";
import { backendInfo } from "../payloads/backend";
import { loginWithToken } from "../payloads/login";
import {
  getMessageWithContent,
  getMessageWithoutContentList
} from "../payloads/message";
import { getProfile } from "../payloads/profile";
import { ResponseHandler } from "../payloads/response";
import { getService, getServices } from "../payloads/service";
import { session } from "../payloads/session";
import { userMetadata } from "../payloads/userMetadata";
import { validatePayload } from "./utils/validator";

// fiscalCode used within the client communication
export const fiscalCode = "RSSMRA83A12H501D";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
// create express server
export const serverPort = 3000;
const app: Application = express();
// set log middleware
app.use(morgan("tiny"));
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

/** IO backend API handlers */

export const messages = getMessageWithoutContentList(10, fiscalCode);
export const services = getServices(10);

responseHandler
  .addHandler("get", "/session", session)
  .addHandler("get", "/profile", getProfile(fiscalCode))
  .addCustomHandler("post", "/profile", req => {
    // the server profile is merged with
    // the one coming from request. Furthermore this profile's version is increased by 1
    const currentProfile = getProfile(fiscalCode).payload;
    const clintProfileIncresed = {
      ...req.body,
      version: parseInt(req.body.version, 10) + 1
    };
    const payload = validatePayload(InitializedProfile, {
      ...currentProfile,
      ...clintProfileIncresed
    });
    return {
      payload,
      isJson: true
    };
  })
  .addHandler("get", "/user-metadata", userMetadata)
  // return 10 mock messages
  .addHandler("get", "/messages", messages)
  // return a mock message with content (always found!)
  .addCustomHandler("get", "/messages/:id", req => {
    // retrieve the service_id from the messages list
    const serviceId = messages.payload.items.find(
      item => item.id === req.params.id
    )?.sender_service_id;
    return getMessageWithContent(req.params.id, serviceId!, fiscalCode);
  })
  // return 10 mock services
  .addHandler("get", "/services", services)
  // return a mock service with the same requested id (always found!)
  .addCustomHandler("get", "/services/:service_id", req => {
    return getService(req.params.service_id);
  });

export default app;
