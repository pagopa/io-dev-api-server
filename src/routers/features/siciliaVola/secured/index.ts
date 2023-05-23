
import fs from "fs";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { AeroportiAmmessiInputBean } from "../../../../../generated/definitions/siciliaVola/AeroportiAmmessiInputBean";
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


// eslint-disable-next-line functional/no-let
let vouchersBeneficiary: ReadonlyArray<VoucherBeneficiarioOutputBean>;

// eslint-disable-next-line functional/no-let
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

    if (E.isLeft(maybeParams)) {
      res.sendStatus(500);
      return;
    }

    const vouchersParams = maybeParams.right;
    if (
      vouchersParams.pageNum === undefined ||
      vouchersParams.elementsXPage === undefined
    ) {
      res.sendStatus(500);
      return;
    }

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

    vouchersBeneficiary =
      vouchersBeneficiary !== undefined
        ? vouchersBeneficiary.concat(newVouchers)
        : newVouchers.listaRisultati ?? [];

    lastId += vouchersParams.elementsXPage;

    res.json(newVouchers);
  }
);

/**
 * Get the airport destination list given a state
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/aeroportiAmmessi"),
  (req, res) => {
    const aeroportiAmmessiInputBean = req.body;
    const maybeAeroportiAmmessiInputBean = AeroportiAmmessiInputBean.decode(
      aeroportiAmmessiInputBean
    );
    if (E.isLeft(maybeAeroportiAmmessiInputBean)) {
      // validate the body value
      res.sendStatus(500);
      return;
    }

    res.json(getAereoportiSede(5));
  }
);

/**
 * Delete a voucher
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/annullaVoucher"),
  (req, res) => {
    const { codiceVoucher } = req.body;
    const maybeVoucherId = t.Integer.decode(codiceVoucher);
    if (E.isLeft(maybeVoucherId)) {
      // validate the body value
      res.sendStatus(500);
      return;
    }

    if (vouchersBeneficiary) {
      vouchersBeneficiary = vouchersBeneficiary.filter(
        v => v.idVoucher !== maybeVoucherId.right
      );
    }
    res.json({});
  },
  2000
);

/**
 * Get the voucher in pdf (base64) format
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/stampaVoucher"),
  (req, res) => {
    const { codiceVoucher } = req.body;
    const maybeVoucherId = t.Integer.decode(codiceVoucher);
    if (E.isLeft(maybeVoucherId)) {
      // validate the body value
      res.sendStatus(500);
      return;
    }
    const voucherPdf = fs
      .readFileSync("assets/siciliaVola/bonus_sicilia.pdf")
      .toString("base64");

    res.send({ data: voucherPdf });
  }
);
