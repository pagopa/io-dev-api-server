import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { AuthPaymentResponseDTO } from "../../../../generated/definitions/idpay/AuthPaymentResponseDTO";
import { payments } from "../../../persistence/idpay";

export const putAuthPaymentResponse = (
  trxCode: string
): O.Option<AuthPaymentResponseDTO> =>
  pipe(
    payments.find(p => p.trxCode === trxCode),
    O.fromNullable
  );
