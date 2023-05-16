import { IbanListDTO } from "../../../../../generated/definitions/idpay/IbanListDTO";
import { getIbanList } from "./data";

export const getIbanListResponse = (): IbanListDTO => ({
  ibanList: getIbanList()
});
