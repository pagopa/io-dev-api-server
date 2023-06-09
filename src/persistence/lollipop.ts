import * as jose from "jose";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { AssertionRef } from "../../generated/definitions/backend/AssertionRef";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM } from "../routers/public";
import { ioDevServerConfig } from "../config";
import { getDateMsDifference } from "../utils/date";

type LollipopInfo = {
  lollipopAssertionRef: AssertionRef | undefined;
  lollipopPublicKey: jose.JWK | undefined;
  instantiationDate: Date | undefined;
};

const lollipopInfo: LollipopInfo = {
  lollipopAssertionRef: undefined,
  lollipopPublicKey: undefined,
  instantiationDate: undefined
};

export function getAssertionRef() {
  return lollipopInfo.lollipopAssertionRef;
}

export function getPublicKey() {
  return lollipopInfo.lollipopPublicKey;
}

export function setLollipopInfo(
  assertionRef: string | undefined,
  publicKey: jose.JWK | undefined
) {
  lollipopInfo.lollipopAssertionRef =
    `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${assertionRef}` as AssertionRef;
  lollipopInfo.lollipopPublicKey = publicKey;
  lollipopInfo.instantiationDate = new Date();
}

// if is a ttl is defined in config for assertion ref, it checks its expiration, otherwise it is considered infinite
export const isAssertionRefStillValid = () =>
  pipe(
    ioDevServerConfig.features.lollipop.assertionRefValidityMS,
    O.fromNullable,
    O.fold(
      () => true,
      validity =>
        !!lollipopInfo.instantiationDate &&
        getDateMsDifference(new Date(), lollipopInfo.instantiationDate) <
          validity
    )
  );
