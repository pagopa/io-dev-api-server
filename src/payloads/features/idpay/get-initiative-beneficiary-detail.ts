import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { AccumulatedTypeEnum } from "../../../../generated/definitions/idpay/AccumulatedAmountDTO";
import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { RewardValueTypeEnum } from "../../../../generated/definitions/idpay/RewardValueDTO";
import { TimeTypeEnum } from "../../../../generated/definitions/idpay/TimeParameterDTO";
import { initiatives } from "../../../persistence/idpay";
import { getRandomEnumValue } from "../../utils/random";

import ServicesDB from "./../../../persistence/services";

const generateRandomInitiativeDetailDTO = (
  initiative: InitiativeDTO
): InitiativeDetailDTO => {
  const serviceSummaries = ServicesDB.getSummaries();

  return {
    initiativeName: initiative.initiativeName,
    status: initiative.status,
    description: faker.lorem.paragraphs(6),
    ruleDescription: faker.lorem.paragraphs(4),
    endDate: initiative.endDate,
    rankingStartDate: faker.date.past(1),
    rankingEndDate: faker.date.future(1),
    rewardRule: {
      rewardValueType: getRandomEnumValue(RewardValueTypeEnum),
      rewardValue: faker.datatype.number(100)
    },
    refundRule: {
      accumulatedAmount: {
        accumulatedType: getRandomEnumValue(AccumulatedTypeEnum),
        refundThreshold: faker.datatype.number({ min: 10, max: 50 })
      },
      timeParameter: { timeType: getRandomEnumValue(TimeTypeEnum) }
    },
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
