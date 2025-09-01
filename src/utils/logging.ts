import { ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { unknownToString } from "./error";

export const logExpressWarning = (
  statusCode: number,
  problemJson: ProblemJson | object
) => {
  if (
    "status" in problemJson ||
    "title" in problemJson ||
    "detail" in problemJson
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      `\x1b[1;38;5;202m\n  Http Status Code: ${statusCode}\n  Http Body:\n    Status: ${problemJson.status}\n    Title: ${problemJson.title}\n    Details: ${problemJson.detail}\n\x1b[0m`
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `\x1b[1;38;5;202m\n  Http Status Code: ${statusCode}\n  Http Body:\n    ${unknownToString(
        problemJson
      )}\n\x1b[0m`
    );
  }
};
