import { Router } from "express";
import { addHandler } from "../../payloads/response";
import {
  customSetEmailValidated,
  profileCustomConfiguration
} from "../../persistence/profile/profileCustomConfig";

export const mailDashboardRouter = Router();

addHandler(mailDashboardRouter, "post", "/configEmail", (req, res) => {
  const value = req.body as profileCustomConfiguration;
  customSetEmailValidated(value.is_email_validated);
  res.redirect("/");
});
