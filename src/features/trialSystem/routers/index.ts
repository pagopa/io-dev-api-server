/* eslint-disable functional/immutable-data */
import { Router } from "express";
import { addApiV1Prefix } from "../../../utils/strings";
import { addHandler } from "../../../payloads/response";
import { Subscription } from "../../../../generated/definitions/trial_system/Subscription";
import { TrialId } from "../../../../generated/definitions/trial_system/TrialId";
import { SubscriptionStateEnum } from "../../../../generated/definitions/trial_system/SubscriptionState";
import { ioDevServerConfig } from "../../../config";
export const trialSystemRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/trials${path}`);

const trials: Record<TrialId, Subscription> = {};

const loadTrials = () =>
  Object.entries(ioDevServerConfig.features.trials || {})?.forEach(
    ([trialId, state]) => {
      trials[trialId as TrialId] = {
        trialId: trialId as TrialId,
        state,
        createdAt: new Date()
      };
    }
  );

addHandler(
  trialSystemRouter,
  "post",
  addPrefix("/:trialId/subscriptions"),
  (req, res) => {
    const currentTrial = trials[req.params.trialId as TrialId];

    if (!currentTrial) {
      return res.status(400);
    }

    if (currentTrial.state !== SubscriptionStateEnum.UNSUBSCRIBED) {
      return res.status(409).json({
        detail: "The resource already exists.",
        title: "Conflict"
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

loadTrials();
