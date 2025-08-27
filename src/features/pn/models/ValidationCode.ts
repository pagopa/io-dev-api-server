export interface ValidationCode {
  mandateId: string;
  notificationIUN: string;
  qrCodeContent: string;
  timeToLive: Date;
  validationCode: string;
}
