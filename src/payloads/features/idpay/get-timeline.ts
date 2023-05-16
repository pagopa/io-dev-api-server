import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { TimelineDTO } from "../../../../generated/definitions/idpay/TimelineDTO";
import { initiativeTimeline } from "../../../persistence/idpay";

export const getTimelineResponse = (
  initiativeId: string,
  pageNo: number = 0,
  pageSize: number = 3
): O.Option<TimelineDTO> =>
  pipe(
    initiativeTimeline[initiativeId],
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
