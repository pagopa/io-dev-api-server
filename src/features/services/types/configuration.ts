import * as t from "io-ts";
import { HttpResponseCode } from "../../../types/httpResponseCode";

export const ServiceConfiguration = t.interface({
  // configure some API response error code
  response: t.interface({
    // 200 success with payload
    institutionsResponseCode: HttpResponseCode,
    // 200 success with payload
    servicesByInstitutionIdResponseCode: HttpResponseCode
  })
});

export type ServiceConfiguration = t.TypeOf<typeof ServiceConfiguration>;
