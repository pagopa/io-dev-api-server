import { Application } from "express";
import { loginWithToken } from "./payloads/login";
import { backendInfo } from "./payloads/backend";
import { session } from "./payloads/session";
import { profile, fiscalCode } from "./payloads/profile";
import { userMetadata } from "./payloads/userMetadata";
import {
  messagesResponseOk,
  messagesResponseNotFound,
  messagesResponseOkList,
  getMessage
} from "./payloads/message";
import { handleResponse, ResponseHandler } from "./payloads/response";

// read package.json to print some info
const fs = require("fs");
const packageJson = JSON.parse(fs.readFileSync("./package.json"));
// define server port
const serverPort = 3000;
const express = require("express");
const app: Application = express();
const responseHandler = new ResponseHandler(app);

app.get("/", (_, res) => {
  res.send(`Hi. This is ${packageJson.name}`);
});

app.get("/login", (_, res) => {
  res.redirect(loginWithToken);
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
  .addHandler("get", "/profile", profile)
  .addHandler("get", "/user-metadata", userMetadata)
  .addHandler("get", "/messages", messagesResponseOkList(10))
  .addCustomHandler("get", "/messages/:id", req => {
    return getMessage(req.params.id, fiscalCode);
  });

app.listen(serverPort, async function() {
  console.log(
    `${packageJson.name} is running on http://127.0.0.1:${serverPort}`
  );
});
