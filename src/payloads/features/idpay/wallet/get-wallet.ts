import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import { initiativeList } from "./data";

export const getWalletResponse = (): WalletDTO => ({
  initiativeList: Object.values(initiativeList)
});
