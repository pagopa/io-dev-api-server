import { ProblemJson } from "@pagopa/ts-commons/lib/responses";

export const logExpressWarning = (
  statusCode: number,
  problemJson: ProblemJson
) =>
  // eslint-disable-next-line no-console
  console.warn(
    `\x1b[1;38;5;202m\n  Http Status Code: ${statusCode}\n  Http Body:\n    Status: ${problemJson.status}\n    Title: ${problemJson.title}\n    Details: ${problemJson.detail}\n\x1b[0m`
  );
