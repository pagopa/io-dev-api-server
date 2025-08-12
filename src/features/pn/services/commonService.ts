import { IncomingHttpHeaders } from "node:http";
import { Request, Response } from "express";
import { Either, isLeft, left, Left, right } from "fp-ts/lib/Either";
import { ExpressFailure } from "../types/expressFailure";
import { getProblemJson } from "../../../payloads/error";
import {
  checkAndValidateLollipopHeaders,
  LollipopHeaders
} from "./lollipopService";

export const checkAndValidateLollipopAndTaxId = (
  request: Request,
  response: Response
): boolean => {
  const lollipopHeadersEither = checkAndValidateLollipopHeaders(
    request.headers
  );
  if (handleLeftEitherIfNeeded(lollipopHeadersEither, response)) {
    return false;
  }
  const taxIdEither = checkAndValidateTaxIdHeader(
    request.headers,
    lollipopHeadersEither.right
  );
  return !handleLeftEitherIfNeeded(taxIdEither, response);
};

export const handleLeftEitherIfNeeded = (
  inputEither: Either<ExpressFailure, unknown>,
  res: Response
): inputEither is Left<ExpressFailure> => {
  if (isLeft(inputEither)) {
    res.status(inputEither.left.httpStatusCode).json(inputEither.left.reason);
    return true;
  }
  return false;
};

const checkAndValidateTaxIdHeader = (
  headers: IncomingHttpHeaders,
  lollipopHeaders: LollipopHeaders
): Either<ExpressFailure, string> => {
  const taxIdHeader = headers["x-pagopa-cx-taxid"];
  if (taxIdHeader == null || typeof taxIdHeader !== "string") {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Missing 'x-pagopa-cx-taxid' header",
        `Missing or bad value for header 'x-pagopa-cx-taxid' (${taxIdHeader})`
      )
    });
  }
  const lollipopTaxId = lollipopHeaders["x-pagopa-lollipop-user-id"];
  if (taxIdHeader.toUpperCase() !== lollipopTaxId.toUpperCase()) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad value for 'x-pagopa-cx-taxid' header",
        `Value for header 'x-pagopa-cd-taxid' does not match value of header 'x-pagopa-lollipop-user-id' (${taxIdHeader} != ${lollipopTaxId})`
      )
    });
  }
  return right(taxIdHeader);
};
