import { Either, left, right } from "fp-ts/lib/Either";
import { ParsedQs } from "qs";
import { ExpressFailure } from "../../../utils/expressDTO";
import { getProblemJson } from "../../../payloads/error";

export const mandateIdOrUndefinedFromQuery = (
  query: ParsedQs
): string | undefined => {
  const { mandateId: requestMandateId } = query;
  return typeof requestMandateId === "string" ? requestMandateId : undefined;
};

export const tosVersionOrUndefinedFromQuery = (
  query: ParsedQs
): Either<ExpressFailure, string> => {
  const { version: versionQuery } = query;
  const version =
    typeof versionQuery === "string" && versionQuery.trim().length > 0
      ? versionQuery
      : undefined;
  if (version == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad version",
        `Query parameter 'version' is either missing or in a bad format (${version})`
      )
    });
  }
  return right(version);
};
