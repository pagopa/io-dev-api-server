import { NextFunction, Request, Response } from "express-serve-static-core";
import { ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { isSessionTokenValid } from "../persistence/sessionInfo";
import { ErrorDTO } from "../../generated/definitions/idpay/ErrorDTO";

/**
 * if the response error is defined as a global config
 * this middleware returns an error from those ones defined
 * if the current change is less or equal than one defined
 * @param req
 * @param res
 * @param next
 */
export const fastLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isSessionTokenValid(req)) {
    next();
    return;
  }
  res.status(401).send({
    code: 401,
    message: "Unauthorized"
  } as ErrorDTO & ProblemJson);
};
