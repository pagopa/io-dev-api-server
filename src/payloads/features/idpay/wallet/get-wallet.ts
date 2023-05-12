import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import { initiatives } from "./data";

export const getWalletResponse = (): WalletDTO => ({
  initiativeList: Object.values(initiatives)
});
