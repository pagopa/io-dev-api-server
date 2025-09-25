import { AARQRCodeCheckResponse } from "../../../../generated/definitions/pn/aar/AARQRCodeCheckResponse";

export interface AAR {
  internalId: string;
  notificationIUN: AARQRCodeCheckResponse["iun"];
  qrCodeContent: string;
}
