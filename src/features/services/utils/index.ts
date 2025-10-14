import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

export type Query = string | qs.ParsedQs | string[] | qs.ParsedQs[] | undefined;

export const extractQuery = (query: Query) =>
  pipe(
    query,
    O.fromNullable,
    O.map(s => parseInt(s as string, 10)),
    O.filter(n => !isNaN(n)),
    O.toUndefined
  );
