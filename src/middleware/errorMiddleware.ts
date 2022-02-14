import { NextFunction, Request, Response } from "express-serve-static-core";
import * as faker from "faker";
import { ioDevServerConfig } from "../config";

export const errorMiddleware = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (ioDevServerConfig.global.responseError === undefined) {
    next();
    return;
  }
  const random = faker.datatype.number({ min: 0, max: 1, precision: 0.01 });
  console.log("random", random);
  const { chance, codes } = ioDevServerConfig.global.responseError;
  if (random > chance) {
    next();
    return;
  }
  const errorCode = faker.random.arrayElement(codes);
  console.log("errorCode", errorCode);
  res.sendStatus(errorCode);
};
