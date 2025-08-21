import { Either, left, right } from "fp-ts/lib/Either";
import { getProblemJson } from "../../../payloads/error";
import { MandateRepository } from "../repositories/mandateRepository";
import { ExpressFailure } from "../../../utils/expressDTO";
import { Mandate } from "../models/Mandate";

export const checkAndVerifyExistingMandate = (
  iun: string,
  mandateId: string | undefined,
  taxId: string
): Either<ExpressFailure, Mandate> => {
  if (mandateId == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "User mismatch",
        `The specified notification does not belong to the user that is requesting it (${iun}) (${taxId})`
      )
    });
  }

  const mandate = MandateRepository.getFirstValidMandate(mandateId, iun, taxId);
  if (mandate == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "No valid mandate",
        `There is no valid mandate to access requested data belonging to notification (${mandateId}) (${iun}) (${taxId})`
      )
    });
  }

  return right(mandate);
};
