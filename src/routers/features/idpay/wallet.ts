import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { IbanPutDTO } from "../../../../generated/definitions/idpay/IbanPutDTO";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { initiativeIdFromString } from "../../../payloads/features/idpay/utils";
import { getInitiativeBeneficiaryDetailResponse } from "../../../payloads/features/idpay/wallet/get-initiative-beneficiary-detail";
import { getWalletResponse } from "../../../payloads/features/idpay/wallet/get-wallet";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/wallet/get-wallet-detail";
import { addIdPayHandler } from "./router";

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

/**
 *  Association of an IBAN to an initiative
 */
addIdPayHandler("put", "/wallet/:initiativeId/iban", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.map(initiativeIdFromString),
    O.chain(initiativeId =>
      // Checks if id exists in wallet
      pipe(
        initiativeId,
        O.chain(getWalletDetailResponse),
        O.map(_ => initiativeId),
        O.flatten
      )
    ),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiativeId =>
        pipe(
          IbanPutDTO.decode(req.body),
          O.fromEither,
          O.fold(
            () => res.status(400).json(getIdPayError(400)),
            iban => res.sendStatus(200)
          )
        )
    )
  )
);
