import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { IbanPutDTO } from "../../../../generated/definitions/idpay/IbanPutDTO";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { IDPayInitiativeID } from "../../../payloads/features/idpay/types";
import { initiativeIdFromString } from "../../../payloads/features/idpay/utils";
import { addIbanToInitiative } from "../../../payloads/features/idpay/wallet/data";
import { getInitiativeBeneficiaryDetailResponse } from "../../../payloads/features/idpay/wallet/get-initiative-beneficiary-detail";
import { getWalletResponse } from "../../../payloads/features/idpay/wallet/get-wallet";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/wallet/get-wallet-detail";
import { addIdPayHandler } from "./router";
import { getInstrumentListResponse } from "../../../payloads/features/idpay/wallet/get-instrument-list";

const initiativeIdExists = (id: O.Option<IDPayInitiativeID>) =>
  pipe(
    id,
    O.chain(getWalletDetailResponse),
    O.map(_ => id),
    O.flatten
  );

/**
 * Returns the list of active initiatives of a citizen
 */
addIdPayHandler("get", "/wallet/", (req, res) =>
  res.status(200).json(getWalletResponse())
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
    O.chain(initiativeIdExists),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiativeId =>
        pipe(
          IbanPutDTO.decode(req.body),
          O.fromEither,
          O.fold(
            () => res.status(400).json(getIdPayError(400)),
            ({ iban }) => {
              addIbanToInitiative(initiativeId, iban);
              return res.sendStatus(200);
            }
          )
        )
    )
  )
);

/**
 *  Returns the list of payment instruments associated to the initiative by the citizen
 */
addIdPayHandler("get", "/wallet/:initiativeId/instruments", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.map(initiativeIdFromString),
    O.chain(initiativeIdExists),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      flow(
        getInstrumentListResponse,
        O.fold(
          () => res.status(200).json({ instrumentList: [] }),
          data => res.status(200).json(data)
        )
      )
    )
  )
);

/**
 *  Association of a payment instrument to an initiative
 *  TODO association (idk how)
 */
addIdPayHandler(
  "put",
  "/wallet/:initiativeId/instruments/:walletId",
  (req, res) =>
    pipe(
      req.params.initiativeId,
      O.fromNullable,
      O.map(initiativeIdFromString),
      O.chain(initiativeIdExists),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        initiativeId =>
          pipe(
            req.params.walletId,
            O.fromNullable,
            O.fold(
              () => res.status(400).json(getIdPayError(400)),
              walletId => res.sendStatus(200)
            )
          )
      )
    )
);
