import * as O from "fp-ts/lib/Option";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID, IDPayServiceID } from "../types";

export const getOnboardingStatusResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingStatusDTO> => {
  switch (id) {
    case IDPayInitiativeID.INVITED:
      return O.some({ status: OnboardingStatusEnum.INVITED });
    case IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE:
      return O.some({ status: OnboardingStatusEnum.ELIGIBLE_KO });
    case IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS:
      return O.some({ status: OnboardingStatusEnum.ONBOARDING_KO });
    case IDPayInitiativeID.ERR_STATUS_ONBOARDED:
      return O.some({ status: OnboardingStatusEnum.ONBOARDING_OK });
    case IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED:
      return O.some({ status: OnboardingStatusEnum.UNSUBSCRIBED });
    case IDPayInitiativeID.ERR_STATUS_ON_EVALUATION:
      return O.some({ status: OnboardingStatusEnum.ON_EVALUATION });
    default:
      return O.none;
  }
};
