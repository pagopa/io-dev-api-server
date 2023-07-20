import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { OnboardingPutDTO } from "../../../../generated/definitions/idpay/OnboardingPutDTO";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import {
  getCheckPrerequisitesResponseByInitiativeId,
  getPrerequisitesErrorByInitiativeId
} from "../../../payloads/features/idpay/check-prerequisites";
import { getInitiativeDataResponseByServiceId } from "../../../payloads/features/idpay/get-initiative-data";
import { getOnboardingStatusResponseByInitiativeId } from "../../../payloads/features/idpay/onboarding-status";
import {
  initiativeIdFromString,
  serviceIdFromString
} from "../../../payloads/features/idpay/utils";
import { addIdPayHandler } from "./router";

/**
 * Retrieves the initiative ID starting from the corresponding service ID
 */
addIdPayHandler("get", "/onboarding/service/:serviceId", (req, res) =>
  pipe(
    req.params.serviceId,
    O.fromNullable,
    O.chain(serviceIdFromString),
    O.chain(getInitiativeDataResponseByServiceId),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

/**
 * Returns the actual onboarding status
 */
addIdPayHandler("get", "/onboarding/:initiativeId/status", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.map(getOnboardingStatusResponseByInitiativeId),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      status => res.status(200).json(status)
    )
  )
);

/**
 * Acceptance of Terms & Conditions
 */
addIdPayHandler("put", "/onboarding/", (req, res) =>
  pipe(
    OnboardingPutDTO.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.status(400).json(getIdPayError(400)),
      flow(
        O.some,
        O.map(({ initiativeId }) => initiativeId),
        O.chain(initiativeIdFromString),
        O.fold(
          () => res.status(404).json(getIdPayError(404)), // Initiative not found
          flow(
            O.some,
            O.chain(getPrerequisitesErrorByInitiativeId),
            O.fold(
              () => res.sendStatus(204),
              prerequisitesError => res.status(403).json(prerequisitesError) // Initiative with prerequisites error
            )
          )
        )
      )
    )
  )
);

/**
 * Check the initiative prerequisites
 */
addIdPayHandler("put", "/onboarding/initiative", (req, res) =>
  pipe(
    OnboardingPutDTO.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.status(400).json(getIdPayError(400)), // Wrong request body
      flow(
        O.some,
        O.map(({ initiativeId }) => initiativeId),
        O.chain(initiativeIdFromString),
        O.fold(
          () => res.status(404).json(getIdPayError(404)), // Initiative not found
          initiativeId =>
            pipe(
              initiativeId,
              O.some,
              O.chain(getPrerequisitesErrorByInitiativeId),
              O.fold(
                () =>
                  pipe(
                    initiativeId,
                    O.some,
                    O.chain(getCheckPrerequisitesResponseByInitiativeId),
                    O.fold(
                      () => res.sendStatus(202), // Initiative without prerequisites
                      prerequisites => res.status(200).json(prerequisites) // Prerequisites found
                    )
                  ),
                prerequisitesError => res.status(403).json(prerequisitesError) // Initiative with prerequisites error
              )
            )
        )
      )
    )
  )
);

/**
 * Save the consensus of both PDND and self-declaration
 */
addIdPayHandler("put", "/onboarding/consent", (req, res) =>
  pipe(
    OnboardingPutDTO.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.status(400).json(getIdPayError(400)),
      flow(
        O.some,
        O.map(({ initiativeId }) => initiativeId),
        O.chain(initiativeIdFromString),
        O.fold(
          () => res.status(404).json(getIdPayError(404)),
          _ => res.sendStatus(202)
        )
      )
    )
  )
);
