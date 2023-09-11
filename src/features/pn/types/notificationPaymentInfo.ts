import { OrganizationFiscalCode } from "../../../../generated/definitions/backend/OrganizationFiscalCode";
import { PaymentNoticeNumber } from "../../../../generated/definitions/backend/PaymentNoticeNumber";

export type NotificationPaymentInfo = {
  noticeCode: PaymentNoticeNumber;
  creditorTaxId: OrganizationFiscalCode;
};
