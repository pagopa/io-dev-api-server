import { Router } from "express";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addHandler } from "../../../payloads/response";
import { serverUrl } from "../../../utils/server";
import { addApiV1Prefix } from "../../../utils/strings";
import { generateCheckQRPath } from "../../pn/routers/aarRouter";
import MessagesService from "../services/messagesService";
import { ioDevServerConfig } from "../../../config";
import { unknownToString } from "../../../utils/error";
import { getProblemJson } from "../../../payloads/error";
import { generateNotificationPath } from "../../pn/routers/notificationsRouter";

export const ioSENDRouter = Router();

addHandler(
  ioSENDRouter,
  "post",
  addApiV1Prefix("/send/aar"),
  lollipopMiddleware(async (req, res) => {
    const sendQRCodeUrl = `${serverUrl}${generateCheckQRPath()}`;
    const sendQRCodeBody = JSON.stringify(req.body);
    try {
      const sendQRCodeResponse = await fetch(sendQRCodeUrl, {
        method: "post",
        headers: {
          ...MessagesService.lollipopClientHeadersFromHeaders(req.headers),
          ...MessagesService.generateFakeLollipopServerHeaders(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          ...MessagesService.sendAPIKeyHeader(),
          ...MessagesService.sendTaxIdHeader(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          "Content-Type": "application/json"
        },
        body: sendQRCodeBody
      });

      const contentType = sendQRCodeResponse.headers.get("content-type");
      const responseBodyBuffer = await sendQRCodeResponse.arrayBuffer();
      const body = Buffer.from(responseBodyBuffer);
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.status(sendQRCodeResponse.status).send(body);
    } catch (e) {
      const errorMessage = unknownToString(e);
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            "QRCode unexpected error",
            `Unexpected error while contacting SEND QRCode endpoint (${errorMessage})`
          )
        );
    }
  }),
  () => Math.random() * 500
);

addHandler(
  ioSENDRouter,
  "get",
  addApiV1Prefix("/send/notification/:iun"),
  lollipopMiddleware(async (req, res) => {
    const iun = req.params.iun;
    const requestMandateId = req.query.mandateId;
    const mandateId =
      typeof requestMandateId === "string" ? requestMandateId : undefined;
    const sendNotificationUrl = `${serverUrl}${generateNotificationPath(
      iun,
      mandateId
    )}`;
    try {
      const sendNotificationResponse = await fetch(sendNotificationUrl, {
        headers: {
          ...MessagesService.lollipopClientHeadersFromHeaders(req.headers),
          ...MessagesService.generateFakeLollipopServerHeaders(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          ...MessagesService.sendAPIKeyHeader(),
          ...MessagesService.sendTaxIdHeader(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          ...MessagesService.sendIOSourceHeader("QRCODE"),
          "Content-Type": "application/json"
        }
      });

      const contentType = sendNotificationResponse.headers.get("content-type");
      const responseBodyBuffer = await sendNotificationResponse.arrayBuffer();
      const body = Buffer.from(responseBodyBuffer);
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.status(sendNotificationResponse.status).send(body);
    } catch (e) {
      const errorMessage = unknownToString(e);
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            "Notification unexpected error",
            `Unexpected error while contacting SEND Notification endpoint (${errorMessage})`
          )
        );
    }
  }),
  () => Math.random() * 500
);
