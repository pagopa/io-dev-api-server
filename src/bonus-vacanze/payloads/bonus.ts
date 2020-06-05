import * as fs from "fs";
import { eligibilityCheckSuccessEligible } from "./eligibility";
enum BonusStatusEnum {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
  "FAILED" = "FAILED",
  "CONSUMED" = "CONSUMED"
}

const qrCodeBonusVacanzeSvg = fs
  .readFileSync("assets/imgs/bonus-vacanze/qr-mysecretcode.svg")
  .toString("base64");

const qrCodeBonusVacanzePng = fs
  .readFileSync("assets/imgs/bonus-vacanze/qr_code_bonus_vacanze.png")
  .toString("base64");

export const activeBonus = {
  id: "BONUS_ID",
  applicant_fiscal_code: "SPNDNL80R11C522K",
  code: "MYSECRETCODE",
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
  dsu_request: {
    ...eligibilityCheckSuccessEligible,
    request_id: "request_id",
    isee_type: "isee_id",
    dsu_protocol_id: "dsu_protocol_id",
    dsu_created_at: "2020-05-25T00:00:00.000Z",
    has_discrepancies: false
  },
  updated_at: "2020-07-04T12:20:00.000Z",
  status: BonusStatusEnum.ACTIVE
};
