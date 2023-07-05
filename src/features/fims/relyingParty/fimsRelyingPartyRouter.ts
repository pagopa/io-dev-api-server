import { Router } from "express";
import FIMSDB from "../persistence/fimsProvider";
import { addHandler } from "../../../payloads/response";
import { serverUrl } from "../../../utils/server";

export const fimsRelyingPartyRouter = Router();

addHandler(fimsRelyingPartyRouter, "get", "/fims/relyingParty", (req, res) => {
  const requestRelyingPartyId = req.query.clientId as string;

  // TODO replace this. It has to be moved under the provider and this code should just
  // TODO check for a request relyingPartyId as a query parameter and forward it to the
  // TODO provider. If not relyingPartyId is specified, let it pick one randomly from
  // TODO the FIMS database (so make a getAll-FIMS-client method and pick one randomly)
  const fimsClient = FIMSDB.getFIMSClient(requestRelyingPartyId);
  if (!fimsClient) {
    res.status(400).send(`
      <html>
        <head>
          <title>FIMS Client not found</title>
        </head>
        <body>
          <div>
            FIMS client with id (${requestRelyingPartyId}) was not found.
          </div>
        </body>
      </html>
    `);
    return;
  }
  // TODO scope and redirect URI and nonce
  const redirectUrl = `${serverUrl}/fims/oauth/authorize?clientId=${fimsClient.clientId}`;
  res.redirect(303, redirectUrl);
});

addHandler(fimsRelyingPartyRouter, "post", "/fims/rp/callback", (req, res) => {
  const requestIdToken = req.body.idToken;
  if (!requestIdToken) {
    // TODO
    res.sendStatus(403);
    return;
  }
  res.status(200).send(`<html><head><title>Il titolo</title></head><body>Ha funzionato</body></html>`);
});