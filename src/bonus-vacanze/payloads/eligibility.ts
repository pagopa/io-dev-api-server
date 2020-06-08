export const eligibilityCheckSuccessEligible = {
  id: "id_eligibility_success",
  family_members: [
    {
      name: "Mario",
      surname: "Rossi",
      fiscal_code: "EFCMZZ80A12L720R"
    },
    {
      name: "Giulia",
      surname: "Rossi",
      fiscal_code: "ABCMYY82A12L722R"
    },
    {
      name: "Piero",
      surname: "Rossi",
      fiscal_code: "ABCMYY82A12L722R"
    }
  ],
  max_amount: 499, // due to a bug on codec
  max_tax_benefit: 30,
  valid_before: "2020-05-25T00:00:00.000Z",
  status: "ELIGIBLE"
};

export const eligibilityCheckSuccessIneligible = {
  id: "id_eligibility_success",
  status: "INELIGIBLE"
};

export enum ErrorEnum {
  "INVALID_REQUEST" = "INVALID_REQUEST",

  "INTERNAL_ERROR" = "INTERNAL_ERROR",

  "DATA_NOT_FOUND" = "DATA_NOT_FOUND",

  "DATABASE_OFFLINE" = "DATABASE_OFFLINE"
}
export const eligibilityCheckFailure = {
  id: "id_eligibility_success",
  error: ErrorEnum.DATA_NOT_FOUND,
  error_description: "errorDescription"
};
