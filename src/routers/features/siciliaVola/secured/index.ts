import { Router } from "express";
import * as t from "io-ts";
import { ListaVoucherBeneficiarioOutputBean } from "../../../../../generated/definitions/siciliaVola/ListaVoucherBeneficiarioOutputBean";
import {
  getAereoportiSede,
  getVouchersBeneficiary
} from "../../../../payloads/features/siciliaVola";
import { addHandler } from "../../../../payloads/response";
import { addApiV1Prefix } from "../../../../utils/strings";

export const securedSvRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/secured${path}`);

// tslint:disable-next-line: no-let prefer-const
let vouchersBeneficiary: ListaVoucherBeneficiarioOutputBean = getVouchersBeneficiary(
  5
);

/**
 * Get the voucher list
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/ricercaVoucher"),
  (_, res) => res.json(vouchersBeneficiary)
);

/**
 * Get the airport destination list given a region
 */
addHandler(
  securedSvRouter,
  "get",
  addPrefix("/beneficiario/aeroportiSede/:region_id"),
  (_, res) => res.json(getAereoportiSede(5))
);

/**
 * Get the airport destination list given a state
 */
addHandler(
  securedSvRouter,
  "get",
  addPrefix("/beneficiario/aeroportiStato/:state_id"),
  (_, res) => res.json(getAereoportiSede(5))
);

/**
 * Delete a voucher
 */
addHandler(
  securedSvRouter,
  "get",
  addPrefix("/beneficiario/annullaVoucher"),
  (req, res) => {
    const { voucherId } = req.body;
    if (t.Integer.decode(voucherId).isLeft()) {
      // validate the body value
      res.sendStatus(500);
      return;
    }

    if (vouchersBeneficiary.listaRisultati) {
      vouchersBeneficiary = {
        ...vouchersBeneficiary,
        listaRisultati: vouchersBeneficiary.listaRisultati.filter(
          v => v.idVoucher !== voucherId
        )
      };
    }
    res.sendStatus(200);
    return;
  }
);
