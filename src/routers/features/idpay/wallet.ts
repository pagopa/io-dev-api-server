import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { IbanPutDTO } from "../../../../generated/definitions/idpay/IbanPutDTO";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { IDPayInitiativeID } from "../../../payloads/features/idpay/types";
import { initiativeIdFromString } from "../../../payloads/features/idpay/utils";
import {
  addIbanToInitiative,
  addInstrumentToInitiative,
  removeInstrumentFromInitiative,
  unsubscribeFromInitiative
} from "../../../payloads/features/idpay/wallet/data";
import { getInitiativeBeneficiaryDetailResponse } from "../../../payloads/features/idpay/wallet/get-initiative-beneficiary-detail";
import { getWalletResponse } from "../../../payloads/features/idpay/wallet/get-wallet";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/wallet/get-wallet-detail";
import { addIdPayHandler } from "./router";
import { getInstrumentListResponse } from "../../../payloads/features/idpay/wallet/get-instrument-list";
import { getWalletStatusResponse } from "../../../payloads/features/idpay/wallet/get-wallet-status";
import { getInitiativeWithInstrumentResponse } from "../../../payloads/features/idpay/wallet/get-initiatives-with-instrument";
import { getWalletV2 } from "../../walletsV2";

const initiativeIdExists = (id: IDPayInitiativeID) =>
  pipe(
    id,
    O.some,
    O.chain(getWalletDetailResponse),
    O.map(_ => id)
  );

const getWalletInstrument = (id: string) =>
  pipe(
    id,
    O.some,
    O.map(id => parseInt(id)),
    O.chain(id => O.fromNullable(getWalletV2().find(w => w.idWallet === id)))
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
    O.chain(initiativeIdFromString),
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
    O.chain(initiativeIdFromString),
    O.chain(getInitiativeBeneficiaryDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

/**
 *  Returns the actual wallet status
 */
addIdPayHandler("get", "/wallet/:initiativeId/status", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(initiativeIdFromString),
    O.chain(getWalletStatusResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      status => res.status(200).json(status)
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
    O.chain(initiativeIdFromString),
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
    O.chain(initiativeIdFromString),
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
 */
addIdPayHandler(
  "put",
  "/wallet/:initiativeId/instruments/:walletId",
  (req, res) =>
    pipe(
      req.params.initiativeId,
      O.fromNullable,
      O.chain(initiativeIdFromString),
      O.chain(initiativeIdExists),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        initiativeId =>
          pipe(
            req.params.walletId,
            O.fromNullable,
            O.chain(getWalletInstrument),
            O.fold(
              () => res.status(404).json(getIdPayError(404)),
              wallet => {
                const result = addInstrumentToInitiative(initiativeId, wallet);
                return res.sendStatus(result ? 200 : 403);
              }
            )
          )
      )
    )
);

/**
 *   Delete a payment instrument from an initiative
 */
addIdPayHandler(
  "delete",
  "/wallet/:initiativeId/instruments/:instrumentId",
  (req, res) =>
    pipe(
      req.params.initiativeId,
      O.fromNullable,
      O.chain(initiativeIdFromString),
      O.chain(initiativeIdExists),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        initiativeId =>
          pipe(
            req.params.instrumentId,
            O.fromNullable,
            O.fold(
              () => res.status(400).json(getIdPayError(400)),
              instrumentId => {
                const result = removeInstrumentFromInitiative(
                  initiativeId,
                  instrumentId
                );
                return res.sendStatus(result ? 200 : 403);
              }
            )
          )
      )
    )
);

/**
 *   Returns the initiatives list associated to a payment instrument
 */
addIdPayHandler("get", "/wallet/instrument/:walletId/initiatives", (req, res) =>
  pipe(
    req.params.walletId,
    O.fromNullable,
    O.chain(getInitiativeWithInstrumentResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      data => res.status(200).json(data)
    )
  )
);

/**
 *   Unsubscribe to an initiative
 */
addIdPayHandler("delete", "/wallet/:initiativeId/unsubscribe", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(initiativeIdFromString),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiativeId => {
        const result = unsubscribeFromInitiative(initiativeId);
        return res.sendStatus(result ? 200 : 403);
      }
    )
  )
);
