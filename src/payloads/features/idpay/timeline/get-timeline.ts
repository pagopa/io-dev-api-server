import * as O from "fp-ts/lib/Option";
import { TimelineDTO } from "../../../../../generated/definitions/idpay/TimelineDTO";
import { IDPayInitiativeID } from "../types";
import { operationList } from "./data";
import faker from "faker/locale/it";

export const getTimelineResponse = (
  initiativeId: IDPayInitiativeID,
  pageNo: number = 0,
  pageSize: number = 3
): O.Option<TimelineDTO> => {
  const totalElements = operationList.length;
  const totalPages = Math.floor(totalElements / pageSize);

  return O.some({
    lastUpdate: faker.date.recent(0.05),
    operationList,
    pageNo,
    pageSize,
    totalElements,
    totalPages
  });
};
