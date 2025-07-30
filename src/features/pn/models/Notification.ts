export interface Notification {
  abstract: string;
  acknowledged: boolean;
  attachments: Document[];
  cancelled: boolean;
  iun: string;
  recipientFiscalCode: string;
  recipients: NotificationRecipient[];
  senderDenomination: string;
  subject: string;
}

export type NotificationHistoryStatus =
  | "IN_VALIDATION"
  | "ACCEPTED"
  | "REFUSED"
  | "DELIVERING"
  | "DELIVERED"
  | "VIEWED"
  | "EFFECTIVE_DATE"
  | "PAID"
  | "UNREACHABLE"
  | "CANCELLED";

export interface NotificationHistory {
  activeFrom: Date;
  relatedTimelineElements: string[];
  status: NotificationHistoryStatus;
}

export type NotificationRecipientType = "PF" | "PG";

export interface NotificationRecipient {
  denomination: string;
  paymentId: string;
  recipientFiscalCode: string;
  type: NotificationRecipientType;
}
