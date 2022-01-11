import * as Op from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";

export const isDefined = <T, O extends NonNullable<T>>(value: T): value is O =>
  pipe(value, Op.fromNullable, Op.isSome);
