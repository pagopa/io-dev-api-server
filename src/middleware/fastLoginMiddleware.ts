import { NextFunction, Request, Response } from "express-serve-static-core";
import { isSessionTokenValid } from "../persistence/sessionInfo";


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
  if (isSessionTokenValid()) {
    next();
    return;
  } 
  res.sendStatus(401);
 
  
};
