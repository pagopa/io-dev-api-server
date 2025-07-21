import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import {
  createServiceFromFactory,
  createServiceMetadataFromFactory
} from "../../../features/services/persistence/services/factory";
import { IDPayServiceID } from "./types";

const serviceIds = Object.values(IDPayServiceID).filter(
  v => typeof v === "number"
) as number[];

export const generateIDPayServices = (): ServiceDetails[] =>
  serviceIds.map((serviceId, index) => ({
    ...createServiceFromFactory(`TESTSRV${serviceId}` as string),
    organization: {
      fiscal_code: index.toString().padStart(11, "0") as OrganizationFiscalCode,
      name: `TESTSRV${serviceId}` as NonEmptyString
    },
    metadata: {
      ...createServiceMetadataFromFactory(ScopeTypeEnum.NATIONAL)
    },
    name: `TESTSRV${serviceId}` as NonEmptyString
  }));
