import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";

export const getCustomContentSignatureBase = (
  signatureInput: string,
  challengeHex: string,
  headerName: string
) =>
  pipe(
    signatureInput.split(","),
    A.filterWithIndex((index, value) => {
      return value.indexOf(`sig${index + 1}=("${headerName}")`) >= 0;
    }),
    A.head,
    O.fold(
      () => undefined,
      sigInput =>
        `"${headerName}": ${challengeHex}\n"@signature-params": ${sigInput.replace(
          /^sig\d=/,
          ""
        )}`
    )
  );

export function getValueToVerify2(
  signatureInput: string,
  challengeHex: string,
  headerName: string
) {
  const signatureInputArray = signatureInput.split(",");
  for (let index = 0; index < signatureInputArray.length; index++) {
    const signatureInput = signatureInputArray[index];
    const startWith = `sig${index + 1}=`;
    if (signatureInput.indexOf(`${startWith}("${headerName}")`) >= 0) {
      let signatureParams = signatureInput.replace(startWith, "");
      return `"${headerName}": ${challengeHex}\n"@signature-params": ${signatureParams}`;
    }
  }
}
