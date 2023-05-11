import * as O from "fp-ts/lib/Option";
import { faker } from "@faker-js/faker/locale/it";
import _ from "lodash";
import { pipe } from "fp-ts/lib/function";
import { TimelineDTO } from "../../../../../generated/definitions/idpay/TimelineDTO";
import { IDPayInitiativeID } from "../types";
import { timeline } from "./data";

export const getTimelineResponse = (
  initiativeId: IDPayInitiativeID,
  pageNo: number = 0,
  pageSize: number = 3
): O.Option<TimelineDTO> =>
  pipe(
    timeline[initiativeId],
    O.fromNullable,
    O.map(timeline => {
      const totalElements = timeline.length;
      const totalPages = Math.ceil(totalElements / pageSize);

      const startIndex = pageNo * pageSize;
      const endIndex = startIndex + pageSize;
      const operationList = _.slice(timeline, startIndex, endIndex);

      return {
        lastUpdate: faker.date.recent(0.05),
        operationList,
        pageNo,
        pageSize,
        totalElements,
        totalPages
      };
    })
  );
