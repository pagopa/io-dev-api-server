import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID } from "./types";
import { initiativeIdFromString } from "./utils";

const onboardingStatuses: {
  [id: number]: OnboardingStatusDTO;
} = {
  [IDPayInitiativeID.OK_INVITED]: {
    status: OnboardingStatusEnum.INVITED,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_STATUS_NOT_ELIGIBLE]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_STATUS_NO_REQUIREMENTS]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_STATUS_ONBOARDED]: {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: faker.date.recent(1),
    onboardingOkDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_STATUS_UNSUBSCRIBED]: {
    status: OnboardingStatusEnum.UNSUBSCRIBED,
    statusDate: faker.date.recent(1),
    onboardingOkDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_STATUS_ON_EVALUATION]: {
    status: OnboardingStatusEnum.ON_EVALUATION,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_ONBOARDING_WAITING_LIST]: {
    status: OnboardingStatusEnum.ONBOARDING_WAITING_LIST,
    statusDate: faker.date.recent(1)
  },
  [IDPayInitiativeID.KO_FAMILY_UNIT_ALREADY_JOINED]: {
    status: OnboardingStatusEnum.ONBOARDING_FAMILY_UNIT_ALREADY_JOINED,
    statusDate: faker.date.recent(1)
  }
};

export const getOnboardingStatusResponseByInitiativeId = (
  id: string
): O.Option<OnboardingStatusDTO> =>
  pipe(
    O.some(id),
    O.map(
      // In case of randomly generated ulid, the status returned is ONBOARDING_OK
      flow(
        initiativeIdFromString,
        O.getOrElse(() => IDPayInitiativeID.KO_STATUS_ONBOARDED)
      )
    ),
    O.chain(id => O.fromNullable(onboardingStatuses[id]))
  );
