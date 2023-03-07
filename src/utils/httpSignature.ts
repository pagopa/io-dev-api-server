import * as jose from "jose";
console.log("*** WELCOME ***");

export function getValueToVerify(
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
