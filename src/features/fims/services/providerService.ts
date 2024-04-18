import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { ProviderConfig } from "../types/config";

export const providerConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ProviderConfig => config.features.fims.provider;

export const baseProviderPath = () => "/fims/provider";

export const generatePermissionHTML = (
  confirmUrl: string,
  abortUrl: string,
  relyingPartyName?: string,
  scopes?: ReadonlyArray<string>
) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FIMS Provider: user action required</title>
</head>
<body>
  <div>
    <h3>Autorizzi l'invio dei dati?</h3>
    <p>I seguenti dati stanno per essere condivisi con <strong>${relyingPartyName}</strong></p>
    <p><strong>${scopes?.join(" ")}</strong></p>
    <form autocomplete="off" action="${confirmUrl}" method="post">
      <div>
        <input id="checkbox10" type="checkbox" name="to_remember" aria-labelledby="checkbox10-help">
        <label for="checkbox10">Non richiedere più</label>
      </div>
      <br/>
      <div>
        <a href="${abortUrl}">Annulla</a>
        <button autotype="button">Conferma</button>
      </div>
    </form>
  </div>
</body>
</html>
`;

export const generateIdTokenRedirectHTML = (
  redirectUrl: string,
  idToken: string,
  relyingPartyState: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FIMS Provider: submit callback</title>
  <script>document.addEventListener('DOMContentLoaded', function () { document.forms[0].submit() });</script>
</head>
<body>
  <form method="post" action="${redirectUrl}">
    <input type="hidden" name="id_token" value="${idToken}"/>
    <input type="hidden" name="state" value="${relyingPartyState}"/>
    <noscript>Your browser does not support JavaScript or you've disabled it.<br/>
      <button autofocus type="submit">Continue</button>
    </noscript>
  </form>
</body>
</html>
`;
