import * as O from "fp-ts/lib/Option";
import { getWalletResponse } from "../../../payloads/features/idpay/wallet/get-wallet";
import { addIdPayHandler } from "./router";
import { pipe } from "fp-ts/lib/function";
import { initiativeIdFromString } from "../../../payloads/features/idpay/utils";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/wallet/get-wallet-detail";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getInitiativeBeneficiaryDetailResponse } from "../../../payloads/features/idpay/wallet/get-initiative-beneficiary-detail";

/**
 * Returns the list of active initiatives of a citizen
 */
addIdPayHandler("get", "/wallet/", (req, res) =>
  res.status(200).json(getWalletResponse)
);

/**
 * Returns the detail of an active initiative of a citizen
 */
addIdPayHandler("get", "/wallet/:initiativeId", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.map(initiativeIdFromString),
    O.flatten,
    O.chain(getWalletDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

/**
 *  Returns the detail of an initiative
 */
addIdPayHandler("get", "/wallet/:initiativeId/detail", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.map(initiativeIdFromString),
    O.flatten,
    O.chain(getInitiativeBeneficiaryDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);
