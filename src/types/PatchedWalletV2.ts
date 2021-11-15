import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { BPayInfo } from "../../generated/definitions/pagopa/BPayInfo";
import { CardInfo } from "../../generated/definitions/pagopa/CardInfo";
import { EnableableFunctions } from "../../generated/definitions/pagopa/EnableableFunctions";
import { SatispayInfo } from "../../generated/definitions/pagopa/SatispayInfo";
import { WalletTypeEnum } from "../../generated/definitions/pagopa/WalletV2";
// required attributes
const PatchedPaymentMethodInfo = t.union([CardInfo, SatispayInfo, BPayInfo]);
const WalletV2O = t.partial({
  updateDate: t.string,
  createDate: t.string,
  onboardingChannel: t.string,
  favourite: t.boolean
});

// optional attributes
const WalletV2R = t.interface({
  enableableFunctions: t.readonlyArray(
    EnableableFunctions,
    "array of enableableFunctions"
  ),
  info: PatchedPaymentMethodInfo,
  idWallet: t.Integer,
  pagoPA: t.boolean,
  walletType: enumType<WalletTypeEnum>(WalletTypeEnum, "walletType")
});

export const PatchedWalletV2 = t.intersection(
  [WalletV2R, WalletV2O],
  "PatchedWalletV2"
);
export type PatchedWalletV2 = t.TypeOf<typeof PatchedWalletV2>;
