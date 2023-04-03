import * as O from "fp-ts/lib/Option";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID, IDPayServiceID } from "../types";

const onboardingStatusResponseByInitiativeId: {
  [id: number]: OnboardingStatusDTO;
} = {
  [IDPayInitiativeID.INVITED]: { status: OnboardingStatusEnum.INVITED },
  [IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO
  },
  [IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS]: {
    status: OnboardingStatusEnum.ONBOARDING_KO
  },
  [IDPayInitiativeID.ERR_STATUS_ONBOARDED]: {
    status: OnboardingStatusEnum.ONBOARDING_OK
  },
  [IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED]: {
    status: OnboardingStatusEnum.UNSUBSCRIBED
  },
  [IDPayInitiativeID.ERR_STATUS_ON_EVALUATION]: {
    status: OnboardingStatusEnum.ON_EVALUATION
  }
};

export const getOnboardingStatusResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingStatusDTO> =>
  O.fromNullable(onboardingStatusResponseByInitiativeId[id]);
