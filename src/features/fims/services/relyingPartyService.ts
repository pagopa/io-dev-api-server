import { ParsedQs } from "qs";
import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { RelyingPartiesConfig } from "../types/config";

export const relyingPartiesConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ReadonlyArray<RelyingPartiesConfig> => config.features.fims.relyingParties;

export const baseRelyingPartyPath = () => "/fims/relyingParty";

export const tokenPayloadToUrl = (
  tokenPayload: Record<string, unknown>,
  baseUrl: string
) => {
  const fullName = tokenPayload.name as string;
  const name = tokenPayload.given_name as string;
  const surname = tokenPayload.family_name as string;
  const fiscalCode = tokenPayload.sub as string;
  const signatureHash = tokenPayload.s_hash as string;
  const audienceId = tokenPayload.aud as string;
  const issuer = tokenPayload.iss as string;
  const issuedOn = tokenPayload.iat as number;
  const expiresOn = tokenPayload.exp as number;

  const url = new URL(baseUrl);
  url.searchParams.set("fullname", fullName);
  url.searchParams.set("name", name);
  url.searchParams.set("surname", surname);
  url.searchParams.set("fiscalCode", fiscalCode);
  url.searchParams.set("signatureHash", signatureHash);
  url.searchParams.set("audienceId", audienceId);
  url.searchParams.set("issuer", issuer);
  url.searchParams.set("issuedOn", `${issuedOn}`);
  url.searchParams.set("expiresOn", `${expiresOn}`);

  return url.href;
};

export const generateUserProfileHTML = (query: ParsedQs) => {
  const fullName = query.fullname;
  const name = query.name;
  const surname = query.surname;
  const fiscalCode = query.fiscalCode;
  const signatureHash = query.signatureHash;
  const audienceId = query.audienceId;
  const issuer = query.issuer;
  const issuedOn = query.issuedOn;
  const expiresOn = query.expiresOn;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relying Party: authenticated</title>
</head>
<body>
  <h1>Your data</h1>
  <ul>
    <li>Full name: ${fullName}</li>
    <li>Name: ${name}</li>
    <li>Surname: ${surname}</li>
    <li>Fiscal Code: ${fiscalCode}</li>
    <li>Signature Hash: ${signatureHash}</li>
    <li>Audience Id: ${audienceId}</li>
    <li>Issuer: ${issuer}</li>
    <li>Issued on: ${new Date(Number(issuedOn))}</li>
    <li>Expires on: ${new Date(Number(expiresOn))}</li>
  </ul>
</body>
</html>
`;
};
