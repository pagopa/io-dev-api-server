import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID } from "./ids";

export const getOnboardingStatusResponseByInitiativeId: {
  [id: string]: OnboardingStatusDTO;
} = {
  [IDPayInitiativeID.ERR_NOT_ELIGIBLE]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO
  },
  [IDPayInitiativeID.ERR_NO_REQUIREMENTS]: {
    status: OnboardingStatusEnum.ONBOARDING_KO
  },
  [IDPayInitiativeID.ERR_ONBOARDED]: {
    status: OnboardingStatusEnum.ONBOARDING_OK
  },
  [IDPayInitiativeID.ERR_UNSUBSCRIBED]: {
    status: OnboardingStatusEnum.UNSUBSCRIBED
  },
  [IDPayInitiativeID.ERR_ON_EVALUATION]: {
    status: OnboardingStatusEnum.ON_EVALUATION
  },
  [IDPayInitiativeID.OK_INVITED]: {
    status: OnboardingStatusEnum.INVITED
  }
};
