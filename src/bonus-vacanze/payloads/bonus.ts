import { eligibilityCheckSuccessEligible } from "./eligibility";
enum BonusStatusEnum {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
  "FAILED" = "FAILED",
  "CONSUMED" = "CONSUMED"
}
export const activeBonus = {
  id: "BONUS_ID",
  applicant_fiscal_code: "SPNDNL80R11C522K",
  code: "MYSECRETCODE",
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
