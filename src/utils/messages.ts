import { PaymentData } from "../../generated/definitions/backend/PaymentData";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";

export const getRptID = (service: ServicePublic, paymentData: PaymentData) =>
  `${service.organization_fiscal_code}${paymentData.notice_number}`;
