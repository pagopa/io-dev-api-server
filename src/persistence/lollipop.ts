import * as jose from "jose";
import { AssertionRef } from "../../generated/definitions/backend/AssertionRef";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM } from "../routers/public";

let lollipopAssertionRef: AssertionRef | undefined = undefined;

let lollipopPublicKey: jose.JWK | undefined = undefined;

export function getAssertionRef() {
  return lollipopAssertionRef;
}

export function setAssertionRef(key: string | undefined) {
  lollipopAssertionRef = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${key}` as AssertionRef;
}

export function getPublicKey() {
  return lollipopPublicKey;
}

export function setPublicKey(key: jose.JWK | undefined) {
  lollipopPublicKey = key;
}
