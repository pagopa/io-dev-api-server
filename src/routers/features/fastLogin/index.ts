/**
 * this router serves fastLogin API
 */

import { Router } from "express";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { addHandler } from "../../../payloads/response";
import {
  generateNewNonce,
  getNonceInfo
} from "../../../features/fastLogin/nonceHandler";
import { refreshTokenWithFastLogin } from "../../../features/fastLogin/fastLoginHandler";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addApiV1Prefix } from "../../../utils/strings";
import { FastLoginResponse } from "../../../../generated/definitions/fast_login/FastLoginResponse";

export const fastLoginRouter = Router();

addHandler(
  fastLoginRouter,
  "post",
  addApiV1Prefix("/fast-login/generate-nonce"),
  (_, res) => {
    generateNewNonce();
    const nonce = getNonceInfo().nonce;
    res.status(200).send({ nonce });
  }
);

addHandler(
  fastLoginRouter,
  "post",
  addApiV1Prefix("/fast-login"),
  lollipopMiddleware((req, res) =>
    pipe(
      refreshTokenWithFastLogin(req),
      O.fromNullable,
      O.fold(
        () => res.status(401),
        token =>
          pipe(
            FastLoginResponse.decode({ token }),
            E.fold(
              () => res.status(403),
              response => res.status(200).send(response)
            )
          )
      )
    )
  )
);
