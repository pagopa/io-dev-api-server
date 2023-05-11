import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import { initiativeList } from "./data";
import { ioDevServerConfig } from "../../../../config";
import { InitiativeDTO } from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { IDPayInitiativeID } from "../types";

const walletConfig = ioDevServerConfig.wallet.idPay;

export const getWalletResponse = (): WalletDTO => {
  let list: InitiativeDTO[] = [];

  if (walletConfig.showConfigured) {
    list.push(initiativeList[IDPayInitiativeID.CONFIGURED]);
  }

  if (walletConfig.showNotConfigured) {
    list.push(initiativeList[IDPayInitiativeID.NOT_CONFIGURED]);
  }

  if (walletConfig.showUnsubscribed) {
    list.push(initiativeList[IDPayInitiativeID.UNSUBSCRIBED]);
  }

  if (walletConfig.showSuspended) {
    list.push(initiativeList[IDPayInitiativeID.SUSPENDED]);
  }

  return {
    initiativeList: list
  };
};
