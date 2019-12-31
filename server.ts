import { Application } from "express";
import morgan from "morgan";
import { loginWithToken } from "./payloads/login";
import { backendInfo } from "./payloads/backend";
import { session } from "./payloads/session";
import { getProfile } from "./payloads/profile";
import { userMetadata } from "./payloads/userMetadata";
import {
  messagesResponseOk,
  messagesResponseNotFound,
  messagesResponseOkList,
  getMessage
} from "./payloads/message";
import { handleResponse, ResponseHandler } from "./payloads/response";
import { getService, getServices } from "./payloads/service";
import fs from "fs";

// fiscalCode used within the client communication
const fiscalCode = "ISPXNB32R82Y766E";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
// define server port
const serverPort = 3000;
const express = require("express");
const app: Application = express();
app.use(morgan("tiny"));
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

app.get("/getProfile", (_, res) => {
  res.status(404).send("not found");
});

app.get("/ping", (_, res) => {
  res.send("ok");
});

/** API handlers */
responseHandler
  .addHandler("get", "/session", session)
  .addHandler("get", "/profile", getProfile(fiscalCode))
  .addHandler("get", "/user-metadata", userMetadata)
  // return 10 mock messages
  .addHandler("get", "/messages", messagesResponseOkList(10, fiscalCode))
  // return a mock message with the same requested id (always found!)
  .addCustomHandler("get", "/messages/:id", req => {
    return getMessage(req.params.id, fiscalCode);
  })
  // return 10 mock services
  .addHandler("get", "/services", getServices(10))
  // return a mock service with the same requested id (always found!)
  .addCustomHandler("get", "/services/:service_id", req => {
    return getService(req.params.service_id);
  });

app.listen(serverPort, async function() {
  console.log(
    `${packageJson.name} is running on http://127.0.0.1:${serverPort}`
  );
});
