import * as fs from "fs";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { BonusActivationStatusEnum } from "../../../generated/definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../generated/definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusCode } from "../../../generated/definitions/bonus_vacanze/BonusCode";
import { dsuData } from "./eligibility";

const qrCodeBonusVacanzeSvg = fs
  .readFileSync("assets/bonus-vacanze/qr-mysecretcode.svg")
  .toString("base64");

const qrCodeBonusVacanzePng = fs
  .readFileSync("assets/bonus-vacanze/qr_code_bonus_vacanze.png")
  .toString("base64");

export const activeBonus: BonusActivationWithQrCode = {
  id: "ACEFGHLMN346" as BonusCode,
  applicant_fiscal_code: "SPNDNL80R11C522K" as FiscalCode,
  qr_code: [
    {
      mime_type: "image/png",
      content: qrCodeBonusVacanzePng
    },
    {
      mime_type: "svg+xml",
      content: qrCodeBonusVacanzeSvg
    }
  ],
  dsu_request: dsuData,
  created_at: new Date(),
  status: BonusActivationStatusEnum.ACTIVE
};
