import * as E from "fp-ts/lib/Either";
import fs from "fs";
import * as t from "io-ts";
import { AeroportiAmmessiInputBean } from "../../../../../generated/definitions/siciliaVola/AeroportiAmmessiInputBean";
import { VoucherBeneficiarioInputBean } from "../../../../../generated/definitions/siciliaVola/VoucherBeneficiarioInputBean";
import { VoucherBeneficiarioOutputBean } from "../../../../../generated/definitions/siciliaVola/VoucherBeneficiarioOutputBean";
import { Plugin } from "../../../../core/server";
import {
  getAereoportiSede,
  getPossibleVoucherStates,
  getVouchersBeneficiary
} from "../../../../payloads/features/siciliaVola";
import { addApiV1Prefix } from "../../../../utils/strings";

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/secured${path}`);

// tslint:disable-next-line: no-let prefer-const
let vouchersBeneficiary: ReadonlyArray<VoucherBeneficiarioOutputBean>;
// tslint:disable-next-line: no-let prefer-const
let lastId = 0;

export const SiciliaVolaSecuredPlugin: Plugin = async ({ handleRoute }) => {
  /**
   * Get the possible voucher states
   */
  handleRoute("get", addPrefix("/beneficiario/statiVoucher"), (_, res) =>
    res.json(getPossibleVoucherStates)
  );

  /**
   * Get the voucher list
   */
  handleRoute("post", addPrefix("/beneficiario/ricercaVoucher"), (req, res) => {
    const maybeParams = VoucherBeneficiarioInputBean.decode(
      req.body.voucherBeneficiarioInputBean
    );

    if (E.isLeft(maybeParams)) {
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
  });

  /**
   * Get the airport destination list given a state
   */
  handleRoute(
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
  handleRoute(
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
          v => v.idVoucher !== maybeVoucherId.value
        );
      }
      res.json({});
      return;
    },
    2000
  );

  /**
   * Get the voucher in pdf (base64) format
   */
  handleRoute("post", addPrefix("/beneficiario/stampaVoucher"), (req, res) => {
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
  });
};
