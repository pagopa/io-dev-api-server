import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getInitiativeDataResponseByServiceId } from "../../../payloads/features/idpay/onboarding/get-initiative-data";
import {
  IDPayInitiativeID,
  IDPayServiceID
} from "../../../payloads/features/idpay/onboarding/types";
import { getOnboardingStatusResponseByInitiativeId } from "../../../payloads/features/idpay/onboarding/onboarding-status";
import { addIdPayHandler } from "./router";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { OnboardingPutDTO } from "../../../../generated/definitions/idpay/OnboardingPutDTO";
import { DetailsEnum } from "../../../../generated/definitions/idpay/PrerequisitesErrorDTO";
import { Id } from "../../../../generated/definitions/fci/Id";
import {
  getCheckPrerequisitesResponseByInitiativeId,
  getPrerequisitesErrorByInitiativeId
} from "../../../payloads/features/idpay/onboarding/check-prerequisites";

/**
 * Retrieves the initiative ID starting from the corresponding service ID
 */
addIdPayHandler("get", "/onboarding/service/:serviceId", (req, res) =>
  pipe(
    O.fromNullable(req.params.serviceId),
    O.chain(serviceId => {
      const initiative =
        getInitiativeDataResponseByServiceId[serviceId as IDPayServiceID];
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
    O.chain(initiativeId =>
      getOnboardingStatusResponseByInitiativeId(
        initiativeId as IDPayInitiativeID
      )
    ),
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

  if (
    !Object.values(IDPayInitiativeID).includes(
      initiativeId.value as IDPayInitiativeID
    )
  ) {
    return res.status(404).json(getIdPayError(404));
  }

  const prerequisitesError = getPrerequisitesErrorByInitiativeId(
    initiativeId.value as IDPayInitiativeID
  );

  if (O.isSome(prerequisitesError)) {
    return res.status(403).json(prerequisitesError.value);
  }

  return pipe(
    initiativeId,
    O.chain(initiativeId =>
      getCheckPrerequisitesResponseByInitiativeId(
        initiativeId as IDPayInitiativeID
      )
    ),
    O.fold(
      () => res.sendStatus(202),
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
