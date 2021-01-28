import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { BPay } from "../../../../generated/definitions/pagopa/walletv2/BPay";
import { BPayInfo } from "../../../../generated/definitions/pagopa/walletv2/BPayInfo";
import { BPayRequest } from "../../../../generated/definitions/pagopa/walletv2/BPayRequest";
import { RestSatispayResponse } from "../../../../generated/definitions/pagopa/walletv2/RestSatispayResponse";
import { WalletTypeEnum } from "../../../../generated/definitions/pagopa/walletv2/WalletV2";
import { addHandler } from "../../../payloads/response";
import { generateWalletV2FromSatispayOrBancomatPay } from "../../../payloads/wallet_v2";
import {
  addWalletV2,
  appendWalletPrefix,
  bPayResponse,
  walletV2Response
} from "../index";

export const bpayRouter = Router();
// add the given list of bpay to the wallet
addHandler(
  bpayRouter,
  "post",
  appendWalletPrefix("/bpay/add-wallets"),
  (req, res) => {
    const maybeBPayList = BPayRequest.decode(req.body);
    maybeBPayList.fold(
      () => {
        res.sendStatus(400);
      },
      bpay => {
        fromNullable(bpay.data).foldL(
          () => {
            res.sendStatus(400);
          },
          (bPayList: ReadonlyArray<BPay>) => {
            const walletData = walletV2Response.data ?? [];
            // all method different from the adding ones
            const walletsBPay = walletData.filter(
              w =>
                w.walletType !== WalletTypeEnum.BPay ||
                (w.walletType === WalletTypeEnum.BPay &&
                  !bPayList.some(
                    (bp: BPay) => bp.uidHash === (w.info as BPayInfo).uidHash
                  ))
            );
            const w2BpayList = bPayList.map(bp =>
              generateWalletV2FromSatispayOrBancomatPay(bp, WalletTypeEnum.BPay)
            );
            addWalletV2([...walletsBPay, ...w2BpayList], false);
            res.json({ data: w2BpayList });
          }
        );
      }
    );
  }
);

// return the bpay owned by the citizen
addHandler(bpayRouter, "get", appendWalletPrefix("/bpay/list"), (req, res) =>
  res.json(bPayResponse)
);
