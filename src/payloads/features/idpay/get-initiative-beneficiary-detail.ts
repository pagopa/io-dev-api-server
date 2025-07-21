import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { initiatives } from "../../../persistence/idpay";

import ServicesDB from "../../../features/services/persistence/servicesDatabase";

const generateRandomInitiativeDetailDTO = (
  initiative: InitiativeDTO
): InitiativeDetailDTO => {
  const serviceSummaries = ServicesDB.getSummaries();

  return {
    initiativeName: initiative.initiativeName,
    status: initiative.status,
    description: faker.lorem.paragraphs(6),
    ruleDescription: faker.lorem.paragraphs(4),
    onboardingStartDate: faker.date.past(6),
    onboardingEndDate: faker.date.future(2),
    privacyLink: faker.internet.url(),
    tcLink: faker.internet.url(),
    logoURL: initiative.logoURL,
    updateDate: faker.date.recent(1),
    serviceId: faker.helpers.arrayElement(serviceSummaries).service_id
  };
};

export const getInitiativeBeneficiaryDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDetailDTO> =>
  pipe(
    initiatives[initiativeId],
    O.fromNullable,
    O.map(generateRandomInitiativeDetailDTO)
  );
