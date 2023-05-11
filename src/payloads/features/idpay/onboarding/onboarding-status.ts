import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { OnboardingStatusDTO } from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import { IDPayInitiativeID } from "../types";
import { onboardingStatuses } from "./data";

export const getOnboardingStatusResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingStatusDTO> =>
  pipe(
    id,
    O.some,
    O.chain(id => O.fromNullable(onboardingStatuses[id])),
    O.map(status => ({ status }))
  );
