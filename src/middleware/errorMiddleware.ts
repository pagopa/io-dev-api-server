import { NextFunction, Request, Response } from "express-serve-static-core";
import * as faker from "faker";
import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";

const ErrorCodes = WithinRangeNumber(400, 600);

export const ResponseError = t.interface({
  // the probability that server will response with an error
  chance: WithinRangeNumber(0, 1),
  // a bucket of error codes. If the server will response with an error, a random one will be picked
  codes: t.readonlyArray(ErrorCodes)
});

export type ResponseError = t.TypeOf<typeof ResponseError>;

/**
 * if the response error is defined as a global config
 * this middleware returns an error from those ones defined
 * if the current change is less or equal than one defined
 * @param _
 * @param res
 * @param next
 */
export const errorMiddleware = (responseError: ResponseError) => (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (responseError === undefined) {
    next();
    return;
  }
  const random = faker.datatype.number({ min: 0, max: 1, precision: 0.01 });
  const { chance, codes } = responseError;
  // out of the chance, do nothing
  if (random > chance) {
    next();
    return;
  }
  // pick an error code randomly
  const errorCode = faker.random.arrayElement(codes);
  res.sendStatus(errorCode);
};
