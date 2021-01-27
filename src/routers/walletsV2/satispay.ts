import { RestSatispayResponse } from "../../../generated/definitions/pagopa/walletv2/RestSatispayResponse";
import { Satispay } from "../../../generated/definitions/pagopa/walletv2/Satispay";
import { WalletTypeEnum } from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { addHandler } from "../../payloads/response";
import {
  generateWalletV2FromSatispayOrBancomatPay,
  satispay
} from "../../payloads/wallet_v2";
import {
  addWalletV2,
  appendWalletPrefix,
  walletV2Config,
  walletV2Response
} from "../wallet_v2";
import { Router } from "express";

export const satispayRouter = Router();

// return the satispay owned by the user
addHandler<RestSatispayResponse>(
  satispayRouter,
  "get",
  appendWalletPrefix("/satispay/consumers"),
  (req, res) => {
    if (walletV2Config.citizenSatispay) {
      res.json({ data: satispay });
      return;
    }
    res.sendStatus(404);
  }
);

// add the given satispay to the wallet
addHandler<RestSatispayResponse>(
  satispayRouter,
  "post",
  appendWalletPrefix("/satispay/add-wallet"),
  (req, res) => {
    const maybeSatispayInfo = Satispay.decode(req.body.data);
    maybeSatispayInfo.fold(
      () => res.sendStatus(400),
      si => {
        const walletData = walletV2Response.data ?? [];
        const walletsWithoutSatispay = walletData.filter(
          w => w.walletType !== WalletTypeEnum.Satispay
        );
        const w2Satispay = generateWalletV2FromSatispayOrBancomatPay(
          { uuid: si.uidSatispayHash },
          WalletTypeEnum.Satispay
        );
        addWalletV2([...walletsWithoutSatispay, w2Satispay], false);
        return res.json({ data: w2Satispay });
      }
    );
  }
);
