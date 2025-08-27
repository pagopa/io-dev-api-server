import { Response } from "express";
import { Either, isLeft, Left } from "fp-ts/lib/Either";
import { logExpressWarning } from "./logging";
import { ExpressFailure } from "./expressDTO";

export const handleLeftEitherIfNeeded = (
  inputEither: Either<ExpressFailure, unknown>,
  res: Response
): inputEither is Left<ExpressFailure> => {
  if (isLeft(inputEither)) {
    const httpStatusCode = inputEither.left.httpStatusCode;
    const problemJson = inputEither.left.reason;
    logExpressWarning(httpStatusCode, problemJson);
    res.status(httpStatusCode).json(problemJson);
    return true;
  }
  return false;
};

export const unknownToString = (input: unknown): string => {
  // 1. Handle null and undefined explicitly for consistent output
  if (input === null) {
    return "Null";
  }
  if (input === undefined) {
    return "Undefined";
  }

  // 2. Handle Error instances to get the core message
  if (input instanceof Error) {
    return input.message;
  }

  // 3. For other objects (including arrays), use JSON.stringify
  if (typeof input === "object") {
    try {
      // This is far more informative than '[object Object]'
      return JSON.stringify(input);
    } catch {
      // This handles errors like circular references
      return "Unserializable Object";
    }
  }

  // 4. Fallback for primitives (string, number, boolean, etc.)
  return String(input);
};
