import { NextFunction, Request, Response } from "express-serve-static-core";
import * as faker from "faker";
import { ResponseError } from "../core/server";

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