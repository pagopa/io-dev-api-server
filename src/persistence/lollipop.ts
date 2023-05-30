import * as jose from "jose";
import { AssertionRef } from "../../generated/definitions/backend/AssertionRef";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM } from "../routers/public";

// eslint-disable-next-line functional/no-let
let lollipopAssertionRef: AssertionRef | undefined;
// eslint-disable-next-line functional/no-let
let lollipopPublicKey: jose.JWK | undefined;

export function getAssertionRef() {
  return lollipopAssertionRef;
}

export function setAssertionRef(key: string | undefined) {
  lollipopAssertionRef =
    `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${key}` as AssertionRef;
}

export function getPublicKey() {
  return lollipopPublicKey;
}

export function setPublicKey(key: jose.JWK | undefined) {
  lollipopPublicKey = key;
}
