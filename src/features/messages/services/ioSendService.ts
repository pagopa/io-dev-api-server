import { IncomingHttpHeaders } from "http";
import { ParsedQs } from "qs";
import MessagesService from "../services/messagesService";
import { ioDevServerConfig } from "../../../config";

export const mandateIdOrUndefinedFromQuery = (
  query: ParsedQs
): string | undefined => {
  const { mandateId: requestMandateId } = query;
  return typeof requestMandateId === "string" ? requestMandateId : undefined;
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
  "Content-Type": contentTypeHeaderFromHeaders(headers, contentType),
  ...ioSourceHeaderFromRequestHeaders(headers)
});

export const ioSourceHeaderFromRequestHeaders = (
  headers: IncomingHttpHeaders
): Record<string, string> => {
  const ioSourceHeader = headers["x-pagopa-pn-io-src"];
  if (ioSourceHeader != null && typeof ioSourceHeader === "string") {
    return {
      "x-pagopa-pn-io-src": ioSourceHeader
    };
  }
  return {};
};

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
