const familyMembers = [
  {
    name: "Mario",
    surname: "Rossi",
    fiscal_code: "EFCMZZ80A12L720R"
  },
  {
    name: "Giulia",
    surname: "Rossi",
    fiscal_code: "CDCMQQ81A12L721R"
  },
  {
    name: "Piero",
    surname: "Rossi",
    fiscal_code: "ABCMYY82A12L722R"
  }
];

const dsuData = {
  request_id: "request_id",
  isee_type: "isee_id",
  dsu_protocol_id: "dsu_protocol_id",
  dsu_created_at: "2020-05-25T00:00:00.000Z",
  has_discrepancies: false,
  family_members: familyMembers,
  max_amount: 499,
  max_tax_benefit: 30
};

export const mockedElegibilityCheck = {
  max_amount: 499,
  max_tax_benefit: 30,
  id: "d296cf6a-11f8-412b-972a-ede34d629680",
  valid_before: new Date("2020-07-04T12:20:00.000Z"),
  ...dsuData
};

export const eligibilityCheckSuccessEligible = {
  ...mockedElegibilityCheck,
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
