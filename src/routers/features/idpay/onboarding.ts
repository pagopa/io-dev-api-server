import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getInitiativeDataResponseByServiceId } from "../../../payloads/features/idpay/onboarding/get-initiative-data";
import { IDPayInitiativeID } from "../../../payloads/features/idpay/onboarding/ids";
import { getOnboardingStatusResponseByInitiativeId } from "../../../payloads/features/idpay/onboarding/onboarding-status";
import { addIdPayHandler } from "./router";
import {
  checkPrerequisitesResponseByInitiativeId,
  getPrerequisitesErrorDTO,
  prerequisitesErrorByInitiativeId
} from "../../../payloads/features/idpay/onboarding/check-prerequisites";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { OnboardingPutDTO } from "../../../../generated/definitions/idpay/OnboardingPutDTO";
import { DetailsEnum } from "../../../../generated/definitions/idpay/PrerequisitesErrorDTO";

/**
 * Retrieves the initiative ID starting from the corresponding service ID
 */
addIdPayHandler("get", "/onboarding/service/:serviceId", (req, res) =>
  pipe(
    O.fromNullable(req.params.serviceId),
    O.chain(serviceId => {
      const initiative = getInitiativeDataResponseByServiceId[serviceId];
      return O.fromNullable(initiative);
    }),
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
    O.fromNullable(req.params.initiativeId),
    O.chain(initiativeId => {
      const status = getOnboardingStatusResponseByInitiativeId[initiativeId];
      return O.fromNullable(status);
    }),
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
    O.map(body => body.initiativeId),
    O.chain(initiativeId =>
      Object.values(IDPayInitiativeID).includes(
        initiativeId as IDPayInitiativeID
      )
        ? O.some(initiativeId)
        : O.none
    ),
    O.fold(
      () => res.status(400).json(getIdPayError(400)),
      _ => res.sendStatus(204)
    )
  )
);

/**
 * Check the initiative prerequisites
 */
addIdPayHandler("put", "/onboarding/initiative", (req, res) => {
  const initiativeId = pipe(
    OnboardingPutDTO.decode(req.body),
    O.fromEither,
    O.map(body => body.initiativeId)
  );

  if (O.isNone(initiativeId)) {
    return res.status(400).json(getIdPayError(400));
  }

  const prerequisitesError =
    prerequisitesErrorByInitiativeId[initiativeId.value];

  if (prerequisitesError !== undefined) {
    return res.status(403).json(getPrerequisitesErrorDTO(prerequisitesError));
  }

  return pipe(
    initiativeId,
    O.chain(initiativeId =>
      Object.values(IDPayInitiativeID).includes(
        initiativeId as IDPayInitiativeID
      )
        ? O.some(initiativeId)
        : O.none
    ),
    O.chain(initiativeId => {
      const prerequisites =
        checkPrerequisitesResponseByInitiativeId[initiativeId];
      return O.fromNullable(prerequisites);
    }),
    O.fold(
      () => res.status(404).json(getIdPayError(400)),
      prerequisites => res.status(200).json(prerequisites)
    )
  );
});

/**
 * Save the consensus of both PDND and self-declaration
 */
addIdPayHandler("put", "/onboarding/consent", (req, res) =>
  pipe(
    OnboardingPutDTO.decode(req.body),
    O.fromEither,
    O.map(body => body.initiativeId),
    O.chain(initiativeId =>
      Object.values(IDPayInitiativeID).includes(
        initiativeId as IDPayInitiativeID
      )
        ? O.some(initiativeId)
        : O.none
    ),
    O.fold(
      () => res.status(400).json(getIdPayError(400)),
      _ => res.sendStatus(202)
    )
  )
);
