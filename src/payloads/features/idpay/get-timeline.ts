import { fakerIT as faker } from "@faker-js/faker";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { TimelineDTO } from "../../../../generated/definitions/idpay/TimelineDTO";
import { initiativeTimeline } from "../../../persistence/idpay";

export const getTimelineResponse = (
  initiativeId: string,
  pageNo: number = 1,
  pageSize: number = 3
): O.Option<TimelineDTO> =>
  pipe(
    initiativeTimeline[initiativeId],
    O.fromNullable,
    O.map(timeline => {
      // limits defined by TimelineDTO
      const totalElements = Math.min(timeline.length, 10);
      const totalPages = Math.min(Math.ceil(totalElements / pageSize), 200);

      const startIndex = pageNo * pageSize;
      const endIndex = startIndex + pageSize;
      const operationList = _.slice(timeline, startIndex, endIndex);

      return {
        lastUpdate: faker.date.recent({ days: 0.05 }),
        operationList,
        pageNo: Math.min(pageNo, 200),
        pageSize: Math.min(pageSize, 50),
        totalElements,
        totalPages
      } as TimelineDTO;
    })
  );
