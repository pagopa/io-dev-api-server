import { NotificationPaymentInfo } from "./notificationPaymentInfo";

export type NotificationRecipient = {
  taxId: string;
  denomination: string;
  payment: NotificationPaymentInfo;
};
