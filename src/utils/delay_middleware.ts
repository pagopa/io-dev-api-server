import { NextFunction, Request, Response } from "express";
import { Millisecond } from "italia-ts-commons/lib/units";

export const delayer = (delay: Millisecond) => (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  setTimeout(next, delay);
};
