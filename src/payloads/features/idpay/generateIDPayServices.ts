import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import _ from "lodash";
import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import {
  createServiceFromFactory,
  createServiceMetadataFromFactory
} from "../../../features/services/persistence/services/factory";
import { IDPayServiceID } from "./types";

const serviceIds = _.pickBy(IDPayServiceID, (value, key) => isNaN(Number(key)));

export const generateIDPayServices = (): ServiceDetails[] =>
  Object.values(serviceIds).map((serviceId, index) => {
    const paddedId = serviceId.toString().padStart(2, "0");
    return {
      ...createServiceFromFactory(`TESTSRV${paddedId}` as string),
      organization: {
        fiscal_code: index
          .toString()
          .padStart(11, "0") as OrganizationFiscalCode,
        name: `TESTSRV${paddedId}` as NonEmptyString
      },
      metadata: {
        ...createServiceMetadataFromFactory(ScopeTypeEnum.NATIONAL)
      },
      name: `TESTSRV${paddedId}` as NonEmptyString
    };
  });
