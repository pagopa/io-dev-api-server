/* eslint-disable functional/immutable-data */
import { Router } from "express";
import { addApiV1Prefix } from "../../../utils/strings";
import { addHandler } from "../../../payloads/response";
import { Subscription } from "../../../../generated/definitions/trial_systwem/Subscription";
import { TrialId } from "../../../../generated/definitions/trial_systwem/TrialId";
import { SubscriptionStateEnum } from "../../../../generated/definitions/trial_systwem/SubscriptionState";

export const trialSystemRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/trials${path}`);

const trials: Record<TrialId, Subscription> = {};

addHandler(
  trialSystemRouter,
  "post",
  addPrefix("/:trialId/subscriptions"),
  (req, res) => {
    const currentTrial = trials[req.params.trialId as TrialId];

    if (currentTrial) {
      return res.status(200).json({
        ...currentTrial,
        state: SubscriptionStateEnum.SUBSCRIBED
      });
    }

    trials[req.params.trialId as TrialId] = {
      trialId: req.params.trialId as TrialId,
      state: SubscriptionStateEnum.SUBSCRIBED,
      createdAt: new Date()
    };

    res.status(201).json({
      trialId: req.params.trialId as TrialId,
      state: SubscriptionStateEnum.SUBSCRIBED,
      createdAt: new Date()
    } as Subscription);
  }
);

addHandler(
  trialSystemRouter,
  "get",
  addPrefix("/:trialId/subscriptions"),
  (req, res) => {
    const currentTrial = trials[req.params.trialId as TrialId];

    if (currentTrial) {
      return res.status(200).json(currentTrial);
    }

    res.sendStatus(404);
  }
);
