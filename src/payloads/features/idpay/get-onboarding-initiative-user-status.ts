import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { onboardedInitiativeStatuses } from "../../../persistence/idpay";
import { UserOnboardingStatusDTO } from "../../../../generated/definitions/idpay/UserOnboardingStatusDTO";

export const getOnboardingInitiativeUserStatus = (): O.Option<
  UserOnboardingStatusDTO[]
> =>
  pipe(
    onboardedInitiativeStatuses,
    O.fromNullable,
    O.map(el => el)
  );
