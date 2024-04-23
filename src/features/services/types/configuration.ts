import { WithinRangeNumber } from "@pagopa/ts-commons/lib/numbers";
import * as t from "io-ts";
import { HttpResponseCode } from "../../../types/httpResponseCode";

export const ServiceConfiguration = t.type({
  // configure number of featured items
  featuredItemsSize: WithinRangeNumber(0, 6),
  // configure some API response error code
  response: t.type({
    // 200 success with payload
    featuredItemsResponseCode: HttpResponseCode,
    institutionsResponseCode: HttpResponseCode
  })
});

export type ServiceConfiguration = t.TypeOf<typeof ServiceConfiguration>;
