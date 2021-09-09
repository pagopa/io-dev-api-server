import { Router } from "express";
import * as t from "io-ts";
import { VoucherBeneficiarioInputBean } from "../../../../../generated/definitions/siciliaVola/VoucherBeneficiarioInputBean";
import { VoucherBeneficiarioOutputBean } from "../../../../../generated/definitions/siciliaVola/VoucherBeneficiarioOutputBean";
import {
  getAereoportiSede,
  getPossibleVoucherStates,
  getVouchersBeneficiary
} from "../../../../payloads/features/siciliaVola";
import { addHandler } from "../../../../payloads/response";
import { addApiV1Prefix } from "../../../../utils/strings";

export const securedSvRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/secured${path}`);

// tslint:disable-next-line: no-let prefer-const
let vouchersBeneficiary: ReadonlyArray<VoucherBeneficiarioOutputBean>;
// tslint:disable-next-line: no-let prefer-const
let lastId = 0;

/**
 * Get the possible voucher states
 */
addHandler(
  securedSvRouter,
  "get",
  addPrefix("/beneficiario/statiVoucher"),
  (_, res) => res.json(getPossibleVoucherStates)
);

/**
 * Get the voucher list
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/ricercaVoucher"),
  (req, res) => {
    const maybeParams = VoucherBeneficiarioInputBean.decode(
      req.body.voucherBeneficiarioInputBean
    );

    if (maybeParams.isLeft()) {
      res.sendStatus(500);
      return;
    }

    const vouchersParams = maybeParams.value;
    if (
      vouchersParams.pageNum === undefined ||
      vouchersParams.elementsXPage === undefined
    ) {
      res.sendStatus(500);
      return;
    }

    console.log(vouchersParams.pageNum, vouchersParams.elementsXPage);
    if (vouchersParams.pageNum > 5) {
      res.sendStatus(500);
      return;
    }

    if (vouchersParams.pageNum === 0) {
      lastId = 0;
      vouchersBeneficiary = [];
    }
    const newVouchers = getVouchersBeneficiary(
      vouchersParams.elementsXPage,
      lastId
    );

    res.json(newVouchers);

    vouchersBeneficiary =
      vouchersBeneficiary !== undefined
        ? vouchersBeneficiary.concat(newVouchers)
        : newVouchers.listaRisultati ?? [];

    lastId += vouchersParams.elementsXPage;
    return;
  }
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
    const maybeVoucherId = t.Integer.decode(voucherId);
    if (maybeVoucherId.isLeft()) {
      // validate the body value
      res.sendStatus(500);
      return;
    }

    if (vouchersBeneficiary) {
      vouchersBeneficiary = vouchersBeneficiary.filter(
        v => v.idVoucher !== maybeVoucherId.value
      );
    }
    res.sendStatus(200);
    return;
  }
);
