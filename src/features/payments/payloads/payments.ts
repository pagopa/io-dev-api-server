import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { PaymentRequestsGetResponse } from "../../../../generated/definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../generated/definitions/pagopa/ecommerce/RptId";
import ServicesDB from "../../../persistence/services";

export const getPaymentRequestsGetResponse = (
  rptId: RptId
): O.Option<PaymentRequestsGetResponse> =>
  pipe(
    ServicesDB.getSummaries(),
    faker.helpers.arrayElement,
    ({ service_id }) => service_id,
    ServicesDB.getService,
    O.fromNullable,
    O.map((randomService: ServicePublic) => ({
      rptId,
      amount: faker.datatype.number({
        min: 1,
        max: 9999
      }) as PaymentRequestsGetResponse["amount"],
      paFiscalCode: randomService.organization_fiscal_code,
      paName: randomService.organization_name,
      description: faker.finance.transactionDescription(),
      dueDate: faker.date.future()
    }))
  );
