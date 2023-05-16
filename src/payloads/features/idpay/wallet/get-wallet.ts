import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import { getInitiatives } from "./data";

export const getWalletResponse = (): WalletDTO => ({
  initiativeList: getInitiatives()
});
