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

const lollipopInfoEhemeral: LollipopInfo = {
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

export const clearLollipopInfo = () =>
  Object.keys(lollipopInfo).forEach(key => {
    // eslint-disable-next-line functional/immutable-data
    lollipopInfo[key as keyof LollipopInfo] = undefined;
  });

export function setLollipopInfo(
  assertionRef: string | undefined,
  publicKey: jose.JWK | undefined
) {
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.lollipopAssertionRef =
    `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${assertionRef}` as AssertionRef;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.lollipopPublicKey = publicKey;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.instantiationDate = new Date();
}

export function setLollipopInfoEphemeral(
  assertionRef: string | undefined,
  publicKey: jose.JWK | undefined
) {
  // eslint-disable-next-line functional/immutable-data
  lollipopInfoEhemeral.lollipopAssertionRef =
    `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${assertionRef}` as AssertionRef;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfoEhemeral.lollipopPublicKey = publicKey;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfoEhemeral.instantiationDate = new Date();
}

export const clearEphemeralLollipopInfo = () =>
  Object.keys(lollipopInfoEhemeral).forEach(key => {
    // eslint-disable-next-line functional/immutable-data
    lollipopInfoEhemeral[key as keyof LollipopInfo] = undefined;
  });

export function concretizeEphemeralInfo() {
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.lollipopAssertionRef = lollipopInfoEhemeral.lollipopAssertionRef;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.lollipopPublicKey = lollipopInfoEhemeral.lollipopPublicKey;
  // eslint-disable-next-line functional/immutable-data
  lollipopInfo.instantiationDate = lollipopInfoEhemeral.instantiationDate;

  clearEphemeralLollipopInfo();
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
