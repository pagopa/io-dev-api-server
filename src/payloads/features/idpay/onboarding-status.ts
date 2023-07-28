import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID } from "./types";
import { initiativeIdFromString } from "./utils";

const onboardingStatuses: {
  [id: number]: OnboardingStatusDTO;
} = {
  [IDPayInitiativeID.INVITED]: {
    status: OnboardingStatusEnum.INVITED,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS]: {
    status: OnboardingStatusEnum.ONBOARDING_KO,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.ERR_STATUS_ONBOARDED]: {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: faker.date.recent(1),
    onboardingOkDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED]: {
    status: OnboardingStatusEnum.UNSUBSCRIBED,
    statusDate: faker.date.recent(1),
    onboardingOkDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.ERR_STATUS_ON_EVALUATION]: {
    status: OnboardingStatusEnum.ON_EVALUATION,
    statusDate: faker.date.recent(1)
  }
};

export const getOnboardingStatusResponseByInitiativeId = (
  id: string
): O.Option<OnboardingStatusDTO> =>
  pipe(
    O.some(id),
    O.chain(initiativeIdFromString),
    O.chain(id => O.fromNullable(onboardingStatuses[id]))
  );
