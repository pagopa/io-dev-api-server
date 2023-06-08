/**
 * this router serves fastLogin API
 */

import { Router } from "express";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { addHandler } from "../../../payloads/response";
import {
  generateNewNonce,
  getNonceInfo
} from "../../../features/fastLogin/nonceHandler";
import { refreshTokenWithFastLogin } from "../../../features/fastLogin/fastLoginHandler";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";

export const fastLoginRouter = Router();

addHandler(
  fastLoginRouter,
  "post",
  "/v1/fast-login/generate-nonce",
  (_, res) => {
    generateNewNonce();
    const nonce = getNonceInfo().nonce;
    res.status(200).send({ nonce });
  }
);

addHandler(
  fastLoginRouter,
  "post",
  "/v1/fast-login",
  lollipopMiddleware((req, res) =>
    pipe(
      refreshTokenWithFastLogin(req),
      O.fromNullable,
      O.fold(
        () => res.status(401),
        token => res.status(200).send({ token })
      )
    )
  )
);
