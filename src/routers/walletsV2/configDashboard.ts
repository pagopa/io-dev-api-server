import { Router } from "express";
import { BPayInfo } from "../../../generated/definitions/pagopa/walletv2/BPayInfo";
import { CardInfo } from "../../../generated/definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo } from "../../../generated/definitions/pagopa/walletv2/SatispayInfo";
import { WalletTypeEnum } from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { addHandler } from "../../payloads/response";
import { resetCardConfig } from "../../payloads/wallet_v2";
import { sendFile } from "../../utils/file";
import {
  defaultWalletV2Config,
  generateWalletV2Data,
  updateWalletV2Config,
  walletV2Config,
  walletV2Response
} from "./index";

export const dashboardWalletV2Router = Router();

addHandler(
  dashboardWalletV2Router,
  "get",
  "/",
  (_, res) => sendFile("assets/html/wallet2_config.html", res),
  0,
  { description: "WalletV2 config dashboard" }
);

// get walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "get", "/walletv2/config", (_, res) =>
  res.json(walletV2Config)
);

// update walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "post", "/walletv2/config", (req, res) => {
  updateWalletV2Config(req.body);
  resetCardConfig();
  generateWalletV2Data();
  res.json(walletV2Config);
});

// get all payment methods compliant with BPD (dashboard web)
export const getBPDPaymentMethod = () =>
  (walletV2Response.data ?? [])
    .filter(w => (w.enableableFunctions ?? []).some(ef => ef === "BPD"))
    .map(bpd => {
      if (
        bpd.walletType === WalletTypeEnum.Card ||
        bpd.walletType === WalletTypeEnum.Bancomat
      ) {
        return {
          hpan: (bpd.info as CardInfo).hashPan,
          pan: (bpd.info as CardInfo).blurredNumber,
          type: bpd.walletType
        };
      }
      if (bpd.walletType === WalletTypeEnum.Satispay) {
        return {
          hpan: (bpd.info as SatispayInfo).uuid,
          pan: "--",
          type: bpd.walletType
        };
      }
      if (bpd.walletType === WalletTypeEnum.BPay) {
        return {
          hpan: (bpd.info as BPayInfo).uidHash,
          pan: "--",
          type: bpd.walletType
        };
      }
      return {
        hpan: "--",
        pan: "--",
        type: bpd.walletType
      };
    });

// get the hpans of walletv2 that support BPD (dashboard web)
addHandler(dashboardWalletV2Router, "get", "/walletv2/bpd-pans", (req, res) => {
  res.json(getBPDPaymentMethod());
});

// reset walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "get", "/walletv2/reset", (_, res) => {
  updateWalletV2Config(defaultWalletV2Config);
  generateWalletV2Data();
  res.json(walletV2Config);
});
