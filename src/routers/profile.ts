import { Router } from "express";
import { addHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
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

export const profileRouter = Router();

// update installationID (useful information to target device using push notification)
addHandler(
  profileRouter,
  "put",
  addApiV1Prefix("/installations/:installationID"),
  (_, res) => res.json({ message: "OK" })
);

// get profile
addHandler(profileRouter, "get", addApiV1Prefix("/profile"), (_, res) => {
  const { status, payload } = getProfile();
  res.status(status).json(payload);
});

// update profile
addHandler(profileRouter, "post", addApiV1Prefix("/profile"), (req, res) => {
  const { status, payload } = updateProfile(req);
  res.status(status).json(payload);
});

// User metadata
addHandler(profileRouter, "get", addApiV1Prefix("/user-metadata"), (_, res) =>
  res.json(getUserMetadata())
);

addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-metadata"),
  (req, res) => {
    res.json(req.body);
  }
);

// User data processing (DOWNLOAD / DELETE)
addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/user-data-processing/:choice"),
  (req, res) => {
    const choice = getUserChoice(req);
    res.status(choice.status).json(choice.payload);
  }
);
addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-data-processing"),
  (req, res) => {
    const { status, payload } = userDataProcessingUpdate(req);
    res.status(status).json(payload);
  }
);

addHandler(
  profileRouter,
  "delete",
  addApiV1Prefix("/user-data-processing/:choice"),
  (req, res) => {
    const { status, payload } = userDataProcessingDelete(req);
    res.status(status).json(payload);
  }
);

// Email validation
// return positive feedback on request to receive a new email message to verify his/her email
addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/email-validation-process"),
  (_, res) => {
    res.sendStatus(202);
  }
);

// reset function
export const resetProfile = () => {
  resetUserChoice();
  resetUserProfile();
};
