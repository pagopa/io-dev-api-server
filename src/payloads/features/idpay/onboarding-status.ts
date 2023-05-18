import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID } from "./types";

const onboardingStatuses: {
  [id: number]: OnboardingStatusEnum;
} = {
  [IDPayInitiativeID.INVITED]: OnboardingStatusEnum.INVITED,
  [IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE]: OnboardingStatusEnum.ELIGIBLE_KO,
  [IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS]:
    OnboardingStatusEnum.ONBOARDING_KO,
  [IDPayInitiativeID.ERR_STATUS_ONBOARDED]: OnboardingStatusEnum.ONBOARDING_OK,
  [IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED]:
    OnboardingStatusEnum.UNSUBSCRIBED,
  [IDPayInitiativeID.ERR_STATUS_ON_EVALUATION]:
    OnboardingStatusEnum.ON_EVALUATION
};

export const getOnboardingStatusResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingStatusDTO> =>
  pipe(
    id,
    O.some,
    O.chain(id => O.fromNullable(onboardingStatuses[id])),
    O.map(status => ({ status }))
  );
