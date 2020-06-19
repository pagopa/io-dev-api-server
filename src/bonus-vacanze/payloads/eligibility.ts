import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { Dsu } from "../../../generated/definitions/bonus_vacanze/Dsu";
import {
  EligibilityCheckFailure,
  ErrorEnum,
  StatusEnum as EnumFailure
} from "../../../generated/definitions/bonus_vacanze/EligibilityCheckFailure";
import {
  EligibilityCheckSuccessConflict,
  StatusEnum as EnumConflict
} from "../../../generated/definitions/bonus_vacanze/EligibilityCheckSuccessConflict";
import {
  EligibilityCheckSuccessEligible,
  StatusEnum as EnumEligible
} from "../../../generated/definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import {
  EligibilityCheckSuccessIneligible,
  StatusEnum as EnumIneligible
} from "../../../generated/definitions/bonus_vacanze/EligibilityCheckSuccessIneligible";
import { FamilyMembers } from "../../../generated/definitions/bonus_vacanze/FamilyMembers";

const familyMembers: FamilyMembers = [
  {
    name: "Mario" as NonEmptyString,
    surname: "Rossi" as NonEmptyString,
    fiscal_code: "EFCMZZ80A12L720R" as FiscalCode
  },
  {
    name: "Giulia" as NonEmptyString,
    surname: "Rossi" as NonEmptyString,
    fiscal_code: "CDCMQQ81A12L721R" as FiscalCode
  },
  {
    name: "Piero" as NonEmptyString,
    surname: "Rossi" as NonEmptyString,
    fiscal_code: "ABCMYY82A12L722R" as FiscalCode
  },
  // Overflow name
  {
    name: "Maria Giovanni" as NonEmptyString,
    surname: "D'Anassimandro Curtis" as NonEmptyString,
    fiscal_code: "ABCMWW82A12L722R" as FiscalCode
  },
  // Overflow Fiscal Code
  {
    name: "Luigi Mario" as NonEmptyString,
    surname: "Rossi" as NonEmptyString,
    fiscal_code: "ABCMKK82A12L722R" as FiscalCode
  },
  // Overflow name + Fiscal Code
  {
    name: "Vittorio Emanuele" as NonEmptyString,
    surname: "Del Priore Primo" as NonEmptyString,
    fiscal_code: "ABCMZZ82A12L722R" as FiscalCode
  },
  // Overflow name + very short fiscal code
  {
    name: "Maria Antonietta Assunta" as NonEmptyString,
    surname: "Blu" as NonEmptyString,
    fiscal_code: "MMMMYY82A12L722R" as FiscalCode
  }
];

export const dsuData: Dsu = {
  request_id: 1,
  isee_type: "isee_id",
  dsu_protocol_id: "dsu_protocol_id" as NonEmptyString,
  dsu_created_at: "2020-05-25T00:00:00.000Z",
  has_discrepancies: true,
  family_members: familyMembers,
  max_amount: 500,
  max_tax_benefit: 100
};

export const eligibilityCheckSuccessEligible: EligibilityCheckSuccessEligible = {
  id: "d296cf6a-11f8-412b-972a-ede34d629680" as NonEmptyString,
  valid_before: new Date("2020-07-04T12:20:00.000Z"),
  dsu_request: dsuData,
  status: EnumEligible.ELIGIBLE
};

export const eligibilityCheckSuccessIneligible: EligibilityCheckSuccessIneligible = {
  id: "d296cf6a-11f8-412b-972a-ede34d629680" as NonEmptyString,
  status: EnumIneligible.INELIGIBLE
};

export const eligibilityCheckFailure: EligibilityCheckFailure = {
  id: "d296cf6a-11f8-412b-972a-ede34d629680" as NonEmptyString,
  error: ErrorEnum.DATA_NOT_FOUND,
  error_description: "error_description",
  status: EnumFailure.FAILURE
};

export const eligibilityCheckConflict: EligibilityCheckSuccessConflict = {
  id: "d296cf6a-11f8-412b-972a-ede34d629680" as NonEmptyString,
  status: EnumConflict.CONFLICT,
  dsu_request: dsuData
};
