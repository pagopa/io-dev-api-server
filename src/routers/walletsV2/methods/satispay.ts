import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Satispay } from "../../../../generated/definitions/pagopa/walletv2/Satispay";
import { WalletTypeEnum } from "../../../../generated/definitions/pagopa/walletv2/WalletV2";
import {
  generateWalletV2FromSatispayOrBancomatPay,
  satispay
} from "../../../payloads/wallet_v2";
import { appendWalletV1Prefix } from "../../../utils/wallet";

import { Plugin } from "../../../core/server";

import { addWalletV2, getWalletV2, walletV2Config } from "../index";

export const SatispayPlugin: Plugin = async ({ handleRoute }) => {
  // return the satispay owned by the user
  handleRoute(
    "get",
    appendWalletV1Prefix("/satispay/consumers"),
    (req, res) => {
      if (walletV2Config.citizenSatispay) {
        res.json({ data: satispay });
        return;
      }
      res.sendStatus(404);
    }
  );

  // add the given satispay to the wallet
  handleRoute(
    "post",
    appendWalletV1Prefix("/satispay/add-wallet"),
    (req, res) => {
      return pipe(
        req.body.data,
        Satispay.decode,
        E.fold(
          () => res.sendStatus(400),
          si => {
            const walletData = getWalletV2();
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
        )
      );
    }
  );
};
