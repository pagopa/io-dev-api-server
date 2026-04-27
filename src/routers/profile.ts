import { Router } from "express";
import { addHandler } from "../payloads/response";
import {
  getProfile,
  getUserMetadata,
  resetUserProfile,
  updateProfile
} from "../persistence/profile/profile";
import {
  getUserChoice,
  resetUserChoice,
  userDataProcessingDelete,
  userDataProcessingUpdate
} from "../persistence/profile/userMetadata";
import { addApiIdentityV1Prefix, addApiV1Prefix } from "../utils/strings";
import { RouteHandler } from "../utils/types";

export const profileRouter = Router();
const dataProcessingUrl = "/user-data-processing/:choice";

const handlePutInstallation: RouteHandler = (_, res) =>
  res.json({ message: "OK" });

const handleGetProfile: RouteHandler = (_, res) => {
  const { status, payload } = getProfile();
  res.status(status).json(payload);
};

const handlePostProfile: RouteHandler = (req, res) => {
  const { status, payload } = updateProfile(req);
  res.status(status).json(payload);
};

const handleGetUserMetadata: RouteHandler = (_, res) =>
  res.json(getUserMetadata());

const handlePostUserMetadata: RouteHandler = (req, res) => {
  res.json(req.body);
};

const handleGetUserDataProcessing: RouteHandler = (req, res) => {
  const choice = getUserChoice(req);
  res.status(choice.status).json(choice.payload);
};

const handlePostUserDataProcessing: RouteHandler = (req, res) => {
  const { status, payload } = userDataProcessingUpdate(req);
  res.status(status).json(payload);
};

const handleDeleteUserDataProcessing: RouteHandler = (req, res) => {
  const { status, payload } = userDataProcessingDelete(req);
  res.status(status).json(payload);
};

const handlePostEmailValidationProcess: RouteHandler = (_, res) => {
  res.sendStatus(202);
};

// --- Route registrations ---

// update installationID (useful information to target device using push notification)
addHandler(
  profileRouter,
  "put",
  addApiV1Prefix("/installations/:installationID"),
  handlePutInstallation
);

addHandler(profileRouter, "get", addApiV1Prefix("/profile"), handleGetProfile);
addHandler(
  profileRouter,
  "get",
  addApiIdentityV1Prefix("/profile"),
  handleGetProfile
);

addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/profile"),
  handlePostProfile
);
addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/profile"),
  handlePostProfile
);

addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/user-metadata"),
  handleGetUserMetadata
);
addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-metadata"),
  handlePostUserMetadata
);

addHandler(
  profileRouter,
  "get",
  addApiV1Prefix(dataProcessingUrl),
  handleGetUserDataProcessing
);
addHandler(
  profileRouter,
  "get",
  addApiIdentityV1Prefix(dataProcessingUrl),
  handleGetUserDataProcessing
);

addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-data-processing"),
  handlePostUserDataProcessing
);
addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/user-data-processing"),
  handlePostUserDataProcessing
);

addHandler(
  profileRouter,
  "delete",
  addApiV1Prefix(dataProcessingUrl),
  handleDeleteUserDataProcessing
);
addHandler(
  profileRouter,
  "delete",
  addApiIdentityV1Prefix(dataProcessingUrl),
  handleDeleteUserDataProcessing
);

addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/email-validation-process"),
  handlePostEmailValidationProcess
);
addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/email-validation-process"),
  handlePostEmailValidationProcess
);

// reset function
export const resetProfile = () => {
  resetUserChoice();
  resetUserProfile();
};
