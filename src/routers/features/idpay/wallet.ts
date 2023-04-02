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
import { getWalletResponse } from "../../../payloads/features/idpay/wallet/get-wallet";

/**
 * Returns the list of active initiatives of a citizen
 */
addIdPayHandler("get", "/wallet/", (req, res) =>
  res.status(200).json(getWalletResponse)
);
