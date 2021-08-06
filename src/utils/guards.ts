import { fromNullable } from "fp-ts/lib/Option";

export const isDefined = <T, O extends NonNullable<T>>(value: T): value is O =>
  fromNullable(value).isSome();
