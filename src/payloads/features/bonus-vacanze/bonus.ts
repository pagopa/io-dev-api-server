import { randomBytes } from "crypto";
import * as fs from "fs";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { BonusActivationStatusEnum } from "../../../../generated/definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../generated/definitions/bonus_vacanze/BonusActivationWithQrCode";
import { BonusCode } from "../../../../generated/definitions/bonus_vacanze/BonusCode";

import { dsuData } from "./eligibility";

const qrCodeBonusVacanzeSvg =
  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMyAyMyI+PHBhdGggZmlsbD0iYmxhY2siIGQ9Ik0xIDFoN3Y3aC03ek05IDFoMXYxaC0xek0xMSAxaDJ2MWgtMXYxaC0ydi0xaDF6TTE1IDFoN3Y3aC03ek0yIDJ2NWg1di01ek0xNiAydjVoNXYtNXpNMyAzaDN2M2gtM3pNOSAzaDF2MWgtMXpNMTIgM2gxdjJoMXY0aC0xdi0yaC0xdjNoLTF2MWgxdi0xaDF2MWgxdjFoLTF2MWgydi0xaDF2MmgtNHYtMmgtMXYxaC0xdi0yaC0xdi0xaDF2LTFoMXYtMmgtMXYxaC0xdi0yaDF2LTJoMnpNMTcgM2gzdjNoLTN6TTEgOWgxdjFoLTF6TTMgOWgxdjFoLTF6TTcgOWgydjFoLTJ6TTE2IDloMXYxaC0xek0xOSA5aDF2MWgtMXpNMjEgOWgxdjJoLTJ2LTFoMXpNNCAxMGgydjFoLTF2MWgtMXpNMTQgMTBoMnYxaC0yek0xIDExaDJ2MWgtMXYxaDF2LTFoMXYxaDF2LTFoMXYtMWgzdjFoLTJ2MWgtMXYxaC01ek0xNyAxMWgxdjFoMXYxaDF2MmgtMXYtMWgtMXYtMWgtMXpNMTkgMTFoMXYxaC0xek0yMCAxMmgydjZoLTF2LTJoLTF2LTFoMXYtMmgtMXpNNyAxM2gxdjFoLTF6TTkgMTNoMXYzaC0xek0xNiAxNGgydjFoLTF2MWgtM3YtMWgyek0xIDE1aDd2N2gtN3pNMTEgMTVoMXYxaC0xek0xOCAxNWgxdjFoLTF6TTIgMTZ2NWg1di01ek0xMyAxNmgxdjFoLTF6TTE5IDE2aDF2MWgtMXpNMyAxN2gzdjNoLTN6TTExIDE3aDF2MWgtMXpNMTQgMTdoNXYxaC0xdjNoLTF2LTFoLTF2LTFoLTF2MWgxdjJoLTR2LTFoLTJ2LTFoMXYtMWgxdi0xaDF2MWgxek0xMCAxOGgxdjFoLTF6TTE5IDE4aDF2MWgtMXpNOSAxOWgxdjFoLTF6TTIwIDE5aDJ2M2gtM3YtMWgydi0xaC0xek0xMyAyMHYxaDF2LTF6TTkgMjFoMXYxaC0xeiIvPjwvc3ZnPg==";

const qrCodeBonusVacanzePng = fs
  .readFileSync("assets/bonus-vacanze/qr_code_bonus_vacanze.png")
  .toString("base64");

// Bonus codes are made of characters picked from the following alphabet
export const ALPHABET = "ACEFGHLMNPRUV3469";
const ALPHABET_LEN = ALPHABET.length;
// Bonus codes have a length of 12 characthers
export const BONUSCODE_LENGTH = 12;

/**
 * Generates a new random bonus code
 */
export function genRandomBonusCode(
  length: number = BONUSCODE_LENGTH
): BonusCode {
  const randomBuffer = randomBytes(length);
  const code = [...Array.from(randomBuffer)]
    .map(b => ALPHABET[b % ALPHABET_LEN])
    .join("");
  return code as BonusCode;
}

export const getActiveBonus = (
  applicantFiscalCode: FiscalCode
): BonusActivationWithQrCode => ({
  id: genRandomBonusCode(),
  applicant_fiscal_code: applicantFiscalCode,
  qr_code: [
    {
      mime_type: "image/png",
      content: qrCodeBonusVacanzePng
    },
    {
      mime_type: "image/svg+xml",
      content: qrCodeBonusVacanzeSvg
    }
  ],
  dsu_request: dsuData,
  created_at: new Date(),
  redeemed_at: new Date(),
  status: BonusActivationStatusEnum.ACTIVE
});
