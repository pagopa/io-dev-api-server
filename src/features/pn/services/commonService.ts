import { IncomingHttpHeaders } from "node:http";
import { Request, Response } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { ExpressFailure } from "../../../utils/expressDTO";
import { getProblemJson } from "../../../payloads/error";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
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
