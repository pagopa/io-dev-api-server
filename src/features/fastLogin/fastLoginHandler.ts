import { Request } from "express";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { createOrRefreshSessionToken } from "../../persistence/sessionInfo";
import { checkNonceFromRequest, getNonceInfo } from "./nonceHandler";

export const refreshTokenWithFastLogin = (request: Request) =>
  pipe(
    checkNonceFromRequest(request, getNonceInfo()),
    B.fold(
      () => undefined,
      () => createOrRefreshSessionToken()
    )
  );
