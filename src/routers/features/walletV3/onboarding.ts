import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";

import { WalletCreateRequest } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateRequest";
import { generateOnboardingWalletData } from "../../../utils/wallet";
import { addWalletV3Handler } from "./router";

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addWalletV3Handler("post", "/", (req, res) => {
  pipe(
    WalletCreateRequest.decode(req.body),
    E.fold(
      () => res.sendStatus(400),
      () => res.json(generateOnboardingWalletData())
    )
  );
});
