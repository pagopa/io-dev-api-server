import { IbanListDTO } from "../../../../../generated/definitions/idpay/IbanListDTO";
import { ibanList } from "./data";

export const getIbanListResponse = (): IbanListDTO => ({ ibanList });
