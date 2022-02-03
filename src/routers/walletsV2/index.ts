import { DeletedWalletsResponse } from "../../../generated/definitions/pagopa/DeletedWalletsResponse";
import { EnableableFunctionsEnum } from "../../../generated/definitions/pagopa/EnableableFunctions";
import { PspDataListResponse } from "../../../generated/definitions/pagopa/PspDataListResponse";
import {
  WalletTypeEnum,
  WalletV2
} from "../../../generated/definitions/pagopa/WalletV2";
import { AbiListResponse } from "../../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { RestBPayResponse } from "../../../generated/definitions/pagopa/walletv2/RestBPayResponse";
import { RestPanResponse } from "../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/WalletV2ListResponse";
import { assetsFolder } from "../../config";
import { Plugin } from "../../core/server";
import {
  abiData,
  generateBancomatPay,
  generateCards,
  generatePaypalInfo,
  generatePrivativeFromWalletV2,
  generateSatispayInfo,
  generateWalletV2FromCard,
  generateWalletV2FromPaypal,
  generateWalletV2FromSatispayOrBancomatPay,
  privativeIssuers
} from "../../payloads/wallet_v2";

import { readFileAsJSON } from "../../utils/file";
import { validatePayload } from "../../utils/validator";
import { appendWalletV2Prefix, appendWalletV3Prefix } from "../../utils/wallet";
import { PayPalPlugin, PayPalPluginOptions } from "../walletsV3/methods/paypal";
import { WalletV2DashboardPlugin } from "./configDashboard";
import { BANCOMATPlugin } from "./methods/bancomat";
import { BANCOMATPayPlugin } from "./methods/bpay";
import { CobadgePlugin } from "./methods/cobadge";
import { SatispayPlugin } from "./methods/satispay";

import * as t from "io-ts";

// TODO: support for shuffle ABI

export const abiResponse: AbiListResponse = {
  data: abiData
};

// tslint:disable-next-line: no-let
export let pansResponse: RestPanResponse = {
  data: { data: [], messages: [] } // card array
};

// tslint:disable-next-line: no-let
export let bPayResponse: RestBPayResponse = {
  data: []
};

// tslint:disable-next-line: no-let
let walletV2Response: WalletV2ListResponse = {
  data: []
};

// some utils functions
export const getWalletV2 = (): ReadonlyArray<WalletV2> =>
  walletV2Response.data ?? [];
/**
 * return true if the wallet relative to the given idWallet has been deleted
 * this functions updates the wallets list
 * @param idWallet
 */
export const removeWalletV2 = (idWallet: number): boolean => {
  const wallets = getWalletV2();
  const currentLength = wallets.length;
  const updateWallets = wallets.filter(w => w.idWallet !== idWallet);
  // update wallet Response
  walletV2Response = {
    data: updateWallets
  };
  return updateWallets.length < currentLength;
};

export const findWalletById = (idWallet: number): WalletV2 | undefined => {
  const wallets = getWalletV2();
  return wallets.find(w => w.idWallet === idWallet);
};

// tslint:disable-next-line: no-let
let walletBancomat: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletCreditCards: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletCreditCardsCoBadges: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let citizenCreditCardCoBadge: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let citizenPrivativeCard: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let privativeCards: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletSatispay: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletPaypal: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletBancomatPay: ReadonlyArray<WalletV2> = [];

export const WalletMethodConfig = t.interface({
  // bancomats enrolled
  walletBancomatCount: t.number,
  // creditcards enrolled
  walletCreditCardCount: t.number,
  // creditcards-cobadge enrolled
  walletCreditCardCoBadgeCount: t.number,
  // privative enrolled
  privativeCount: t.number,
  // satispay enrolled
  satispayCount: t.number,
  // paypal enrolled
  paypalCount: t.number,
  // bancomat pay enrolled
  bPayCount: t.number,
  // bancomat owned by the citizen (shown when he/she search about them)
  citizenBancomatCount: t.number,
  // bancomat pay owned by the citizen (shown when he/she search about them)
  citizenBPayCount: t.number,
  // creditcards-cobadge pay owned by the citizen (shown when he/she search about them)
  citizenCreditCardCoBadgeCount: t.number,
  // if true -> citizen has satispay (when he/she search about it)
  citizenSatispay: t.boolean,
  // if true -> citizen has privative cards (when he/she search about it)
  citizenPrivative: t.boolean,
  // if true -> citizen has paypal (when he/she search about it)
  citizenPaypal: t.boolean
});

export type WalletMethodConfig = t.TypeOf<typeof WalletMethodConfig>;

const defaultWalletV2Config: WalletMethodConfig = {
  walletBancomatCount: 0,
  walletCreditCardCount: 1,
  walletCreditCardCoBadgeCount: 0,
  privativeCount: 0,
  satispayCount: 0,
  paypalCount: 0,
  bPayCount: 0,
  citizenSatispay: true,
  citizenBancomatCount: 1,
  citizenBPayCount: 1,
  citizenCreditCardCoBadgeCount: 1,
  citizenPrivative: true,
  citizenPaypal: true
};

// tslint:disable-next-line: no-let
export let walletV2Config: WalletMethodConfig = defaultWalletV2Config;

export const updateWalletV2Config = (config: WalletMethodConfig) => {
  walletV2Config = config;
};

// the bancomat owned by the citizen
const citizenBancomat = () =>
  generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenBancomatCount,
    WalletTypeEnum.Bancomat
  );

// add a list of walletv2 to the current ones
export const addWalletV2 = (
  wallets: ReadonlyArray<WalletV2>,
  append: boolean = true
) => {
  if (!append) {
    walletV2Response = { data: wallets };
    return;
  }
  walletV2Response = {
    data: [...wallets, ...(walletV2Response.data ?? [])]
  };
};

export const generateWalletV2Data = () => {
  // bancomat owned by the citizen but not added in his wallet
  pansResponse = {
    data: { data: citizenBancomat() }
  };

  bPayResponse = {
    data: generateBancomatPay(
      abiResponse.data ?? [],
      walletV2Config.citizenBPayCount
    )
  };

  const FA_BPD: ReadonlyArray<EnableableFunctionsEnum> = [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.BPD
  ];

  // add bancomat
  walletBancomat = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletBancomatCount,
    WalletTypeEnum.Bancomat
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false, FA_BPD)
  );
  // add credit cards
  walletCreditCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCardCount,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card, true));
  // add credit cards co-badge
  walletCreditCardsCoBadges = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCardCoBadgeCount,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card, false, FA_BPD));
  // cobadge owned by the citizen
  citizenCreditCardCoBadge = generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenCreditCardCoBadgeCount,
    WalletTypeEnum.Card
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Card, false, [
      EnableableFunctionsEnum.FA,
      EnableableFunctionsEnum.BPD
    ])
  );
  // add privative cards
  privativeCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.privativeCount,
    WalletTypeEnum.Card
  ).map((c, idx) =>
    generatePrivativeFromWalletV2(
      generateWalletV2FromCard(c, WalletTypeEnum.Card, false, FA_BPD),
      idx
    )
  );

  citizenPrivativeCard = generateCards(
    abiResponse.data ?? [],
    // if privative is enabled generate a full deck of all privative types
    walletV2Config.citizenPrivative ? privativeIssuers.length : 0,
    WalletTypeEnum.Card
  ).map((c, idx) =>
    generatePrivativeFromWalletV2(
      generateWalletV2FromCard(c, WalletTypeEnum.Card, false, FA_BPD),
      idx
    )
  );

  // add satispay
  walletSatispay = generateSatispayInfo(walletV2Config.satispayCount).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(
      c,
      WalletTypeEnum.Satispay,
      FA_BPD
    )
  );

  // add paypal
  walletPaypal = generatePaypalInfo(walletV2Config.paypalCount).map(c =>
    generateWalletV2FromPaypal(c, [EnableableFunctionsEnum.pagoPA])
  );

  // add bancomatPay
  walletBancomatPay = generateBancomatPay(
    abiResponse.data ?? [],
    walletV2Config.bPayCount
  ).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.BPay, FA_BPD)
  );

  // set a credit card as favorite
  if (walletCreditCards.length > 0) {
    const firstCard = walletCreditCards[0];
    walletCreditCards = [
      ...walletCreditCards.filter(w => w.idWallet !== firstCard.idWallet),
      { ...firstCard, favourite: true }
    ];
  }

  addWalletV2(
    [
      ...privativeCards,
      ...walletBancomat,
      ...walletCreditCards,
      ...walletCreditCardsCoBadges,
      ...walletSatispay,
      ...walletPaypal,
      ...walletBancomatPay
    ],
    false
  );
};

// reset function
export const resetWalletV2 = () => {
  generateWalletV2Data();
};

// at the server startup
generateWalletV2Data();

export const WalletV2PluginOptions = t.interface({
  wallet: t.interface({
    methods: WalletMethodConfig
  })
});

export type WalletV2PluginOptions = t.TypeOf<typeof WalletV2PluginOptions>;

export const WalletV2Plugin: Plugin<WalletV2PluginOptions> = async (
  { handleRoute, use },
  options
) => {
  updateWalletV2Config(options.wallet.methods);

  // return the list of wallets
  handleRoute("get", appendWalletV2Prefix("/wallet"), (_, res) =>
    res.json(walletV2Response)
  );

  // PM compliance: despite the endpoint is v3, the payment methods list returned by this API includes methods of type v2
  // v3 is the same of v2 but in addition it includes paypal ¯\_(ツ)_/¯
  handleRoute("get", appendWalletV3Prefix("/wallet"), (_, res) =>
    res.json(walletV2Response)
  );

  // remove from wallet all these methods that have a specific function enabled (BPD, PagoPA, etc..)
  handleRoute(
    "delete",
    appendWalletV2Prefix("/wallet/delete-wallets"),
    (req, res) => {
      const service = req.query.service as EnableableFunctionsEnum;
      // tslint:disable-next-line: readonly-array
      const deletedWallets: number[] = [];
      const walletsToDelete = getWalletV2().filter(w =>
        (w.enableableFunctions ?? []).includes(service)
      );
      walletsToDelete.forEach(w => {
        const idWallet = w.idWallet ?? -1;
        if (removeWalletV2(idWallet)) {
          deletedWallets.push(idWallet);
        }
      });
      const response: DeletedWalletsResponse = {
        data: {
          deletedWallets: deletedWallets.length,
          notDeletedWallets: walletsToDelete.length - deletedWallets.length
        }
      };
      res.json(response);
    }
  );

  /**
   * return the list of psp from a given payment id and wallet id
   */
  handleRoute(
    "get",
    appendWalletV2Prefix("/payments/:idPayment/psps"),
    (_, res) => {
      const psp = validatePayload(
        PspDataListResponse,
        readFileAsJSON(assetsFolder + "/pm/psp/pspV2.json")
      );
      res.json(psp);
    }
  );

  use(WalletV2DashboardPlugin, options);
  use(SatispayPlugin);
  use(BANCOMATPlugin);
  use(BANCOMATPayPlugin);
  use(CobadgePlugin);
};
