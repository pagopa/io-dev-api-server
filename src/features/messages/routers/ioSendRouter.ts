import { Response, Router } from "express";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addHandler } from "../../../payloads/response";
import { serverUrl } from "../../../utils/server";
import { addApiV1Prefix } from "../../../utils/strings";
import {
  generateAcceptToSPath,
  generateCheckQRPath
} from "../../pn/routers/aarRouter";
import MessagesService from "../services/messagesService";
import {
  handleLeftEitherIfNeeded,
  unknownToString
} from "../../../utils/error";
import { getProblemJson } from "../../../payloads/error";
import { generateNotificationPath } from "../../pn/routers/notificationsRouter";
import {
  generateRequestHeaders,
  mandateIdOrUndefinedFromQuery,
  tosVersionOrUndefinedFromQuery
} from "../services/ioSendService";
import { bodyToString } from "../utils";

export const ioSendRouter = Router();

addHandler(
  ioSendRouter,
  "post",
  addApiV1Prefix("/send/aar"),
  lollipopMiddleware(async (req, res) => {
    const sendQRCodeUrl = `${serverUrl}${generateCheckQRPath()}`;
    const sendQRCodeBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendQRCodeBodyEither, res)) {
      return;
    }
    const sendQRCodeFetch = () =>
      fetch(sendQRCodeUrl, {
        method: "post",
        headers: generateRequestHeaders(req.headers),
        body: sendQRCodeBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(sendQRCodeFetch, "QRCode", res);
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "put",
  addApiV1Prefix("/send/tos/:consentType"),
  lollipopMiddleware(async (req, res) => {
    const consentType = req.params.consentType;
    const versionEither = tosVersionOrUndefinedFromQuery(req.query);
    if (handleLeftEitherIfNeeded(versionEither, res)) {
      return;
    }
    const sendAcceptToSUrl = `${serverUrl}${generateAcceptToSPath(
      consentType,
      versionEither.right
    )}`;
    const sendAcceptToSBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendAcceptToSBodyEither, res)) {
      return;
    }
    const sendAcceptToSFetch = () =>
      fetch(sendAcceptToSUrl, {
        method: "put",
        headers: generateRequestHeaders(req.headers, "text/plain"),
        body: sendAcceptToSBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(sendAcceptToSFetch, "ToS", res);
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "get",
  addApiV1Prefix("/send/notification/:iun"),
  lollipopMiddleware(async (req, res) => {
    const iun = req.params.iun;
    const mandateId = mandateIdOrUndefinedFromQuery(req.query);
    const sendNotificationUrl = `${serverUrl}${generateNotificationPath(
      iun,
      mandateId
    )}`;
    const sendNotificationFetch = () =>
      fetch(sendNotificationUrl, {
        headers: generateRequestHeaders(req.headers)
      });
    await fetchSENDDataAndForwardResponse(
      sendNotificationFetch,
      "Notification",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "get",
  addApiV1Prefix("/send/notification/attachment/*"),
  lollipopMiddleware(async (req, res) => {
    const attachmentUrlPath = req.params[0];
    const attachmentUrl = MessagesService.appendAttachmentIdxToAttachmentUrl(
      attachmentUrlPath,
      req.query
    );
    const mandateId = mandateIdOrUndefinedFromQuery(req.query);
    const sendAttachmentEndpointEither =
      MessagesService.checkAndBuildSENDAttachmentEndpoint(
        attachmentUrl,
        mandateId
      );
    if (handleLeftEitherIfNeeded(sendAttachmentEndpointEither, res)) {
      return;
    }
    const sendAttachmentUrl = `${serverUrl}${sendAttachmentEndpointEither.right}`;
    const sendAttachmentFetch = () =>
      fetch(sendAttachmentUrl, {
        headers: generateRequestHeaders(req.headers)
      });
    await fetchSENDDataAndForwardResponse(
      sendAttachmentFetch,
      "Attachment",
      res
    );
  }),
  () => Math.random() * 500
);

const fetchSENDDataAndForwardResponse = async (
  fetchFunction: () => Promise<globalThis.Response>,
  endpointName: string,
  res: Response
) => {
  try {
    const sendQResponse = await fetchFunction();

    const contentType = sendQResponse.headers.get("content-type");
    const responseBodyBuffer = await sendQResponse.arrayBuffer();
    const body = Buffer.from(responseBodyBuffer);
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.status(sendQResponse.status).send(body);
  } catch (e) {
    const errorMessage = unknownToString(e);
    res
      .status(500)
      .json(
        getProblemJson(
          500,
          "QRCode unexpected error",
          `Unexpected error while contacting SEND ${endpointName} endpoint (${errorMessage})`
        )
      );
  }
};
