import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { IResponse } from "italia-ts-commons/lib/responses";
import { IOResponse } from "../payloads/response";

/**
 * check if the given payload is a right representation of the static type T
 * if it is not, an exception will be raised, otherwise an object of type T
 * will be returned
 */
export const validatePayload = <T, O, I>(
  codec: t.Type<T, O, I>,
  payload: any
) => {
  const maybeValidPayload = codec.decode(payload);
  if (maybeValidPayload.isLeft()) {
    throw Error(PathReporter.report(maybeValidPayload).toString());
  }
  return maybeValidPayload.value;
};

export const validateAndCreatePayload = <T, O, I>(
  codec: t.Type<T, O, I>,
  payload: any,
  statusCode: number = 200
): IOResponse<T> => {
  const maybeValidPayload = codec.decode(payload);
  if (maybeValidPayload.isLeft()) {
    throw Error(PathReporter.report(maybeValidPayload).toString());
  }
  return { payload: maybeValidPayload.value, isJson: true, status: statusCode };
};

export const toPayload = <T>(
  payload: T,
  statusCode: number = 200
): IOResponse<T> => ({ payload, isJson: true, status: statusCode });
