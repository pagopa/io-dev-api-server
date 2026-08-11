/**
 * this router serves fastLogin API
 */

import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { addHandler } from "../../../payloads/response";
import {
  generateNewNonce,
  getNonceInfo
} from "../../../features/fastLogin/nonceHandler";
import { refreshTokenWithFastLogin } from "../../../features/fastLogin/fastLoginHandler";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addApiAuthV1Prefix } from "../../../utils/strings";
import { FastLoginResponse } from "../../../../generated/definitions/session_manager/FastLoginResponse";

export const fastLoginRouter = Router();

addHandler(
  fastLoginRouter,
  "post",
  addApiAuthV1Prefix("/fast-login/nonce/generate"),
  (_, res) => {
    generateNewNonce();
    const nonce = getNonceInfo().nonce;
    res.status(200).send({ nonce });
  }
);

addHandler(
  fastLoginRouter,
  "post",
  addApiAuthV1Prefix("/fast-login"),
  lollipopMiddleware((req, res) => {
    const tokenMaybe = refreshTokenWithFastLogin(req);
    if (!tokenMaybe) {
      res.status(401);
      return;
    }

    const fastLodingResponseEither = FastLoginResponse.decode({
      token: tokenMaybe
    });
    if (E.isLeft(fastLodingResponseEither)) {
      res.status(403);
      return;
    }

    res.status(200).send(fastLodingResponseEither.right);
  })
);
