import { ErrorDTO } from "../../../../generated/definitions/idpay/ErrorDTO";

type ErrorCodes = 400 | 401 | 403 | 404;

export const getIdPayError = (
  code: ErrorCodes,
  message: string = ""
): ErrorDTO => ({
  code: code.toString(),
  message
});
