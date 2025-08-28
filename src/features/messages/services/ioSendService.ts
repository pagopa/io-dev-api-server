import { IncomingHttpHeaders } from "http";
import { Either, left, right } from "fp-ts/lib/Either";
import { ParsedQs } from "qs";
import { ExpressFailure } from "../../../utils/expressDTO";
import { getProblemJson } from "../../../payloads/error";
import MessagesService from "../services/messagesService";
import { ioDevServerConfig } from "../../../config";

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

export const generateRequestHeaders = (
  headers: IncomingHttpHeaders,
  contentType: string = "application/json"
): Record<string, string> => ({
  ...MessagesService.lollipopClientHeadersFromHeaders(headers),
  ...MessagesService.generateFakeLollipopServerHeaders(
    ioDevServerConfig.profile.attrs.fiscal_code
  ),
  ...MessagesService.sendAPIKeyHeader(),
  ...MessagesService.sendTaxIdHeader(
    ioDevServerConfig.profile.attrs.fiscal_code
  ),
  // Don't send the default IO Source Header, it must come from the client
  "Content-Type": contentTypeHeaderFromHeaders(headers, contentType)
});

export const contentTypeHeaderFromHeaders = (
  headers: IncomingHttpHeaders,
  defaultValue: string = "application/json"
) => {
  const contentType = headers["content-type"];
  if (contentType != null && contentType.trim().length > 0) {
    return contentType;
  }
  return defaultValue;
};
