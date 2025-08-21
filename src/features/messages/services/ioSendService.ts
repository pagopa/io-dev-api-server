import { Request } from "express";

export const mandateIdOrUndefinedFromRequest = (
  req: Request
): string | undefined => {
  const requestMandateId = req.query.mandateId;
  return typeof requestMandateId === "string" ? requestMandateId : undefined;
};
