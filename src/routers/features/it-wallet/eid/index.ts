import { Router } from "express";
import { addApiV1Prefix } from "../../../../utils/strings";
import { addHandler } from "../../../../payloads/response";
import { WELL_KNOWN_RESPONSE } from "../../../../payloads/features/it-wallet/eid/well-known";
import { PAR_RESPONSE } from "../../../../payloads/features/it-wallet/eid/par";
import { CALLBACK_RESPONSE } from "../../../../payloads/features/it-wallet/eid/callback";
import { TOKEN_RESPONSE } from "../../../../payloads/features/it-wallet/eid/token";
import {
  CREDENTIAL_RESPONSE,
  STATUS_RESPONSE
} from "../../../../payloads/features/it-wallet/eid/credential";

export const itwRouter = Router();

export const addItwPrefix = (path: string) =>
  addApiV1Prefix(`/itwallet/eid${path}`);

/**
 * OpenID Connect Federation
 */
addHandler(
  itwRouter,
  "get",
  addItwPrefix("/.well-know/openid-federation"),
  (_, res) => {
    res.status(200).json(WELL_KNOWN_RESPONSE);
  }
);

/**
 * Authorization Server
 */
addHandler(itwRouter, "get", addItwPrefix("/as/par"), (req, res) => {
  // TODO: extract request body params
  res.status(201).json(PAR_RESPONSE);
});

/**
 * Authorize Endpoint
 * @param client_id - The client_id
 * @param request_uri - The request_uri
 * @param idphint - The idphint user choice
 */
addHandler(
  itwRouter,
  "get",
  addItwPrefix("/authorize/:client_id/:request_uri/:idphint"),
  (_, res) => {
    res.status(200).send("authorization_token");
  }
);

/**
 * Callback Endpoint
 */
addHandler(itwRouter, "get", addItwPrefix("/callback"), (_, res) => {
  /* 
  The request header should contain this params
  -H 'FamilyName: Rossi' \
  -H 'FirstName: Mario' \
  -H 'DateOfBirth: 1980-01-01' \
  -H 'PersonIdentifier: RSSMRA80A01H501U' \
  -H 'AuthnLevel: 2' \ */
  res.status(200).send(CALLBACK_RESPONSE);
});

/**
 * Token Endpoint
 */
addHandler(itwRouter, "post", addItwPrefix("/token"), (_, res) => {
  res.status(200).send(TOKEN_RESPONSE);
});

/**
 * Credential - Issuing Endpoint
 */
addHandler(itwRouter, "post", addItwPrefix("/credential"), (_, res) => {
  res.status(200).send(CREDENTIAL_RESPONSE);
});

/**
 * Credential - Status endpoint
 */
addHandler(itwRouter, "post", addItwPrefix("/status"), (_, res) => {
  res.status(200).send(STATUS_RESPONSE);
});

/**
 * Credential - Revoke endpoint
 */
addHandler(itwRouter, "post", addItwPrefix("/revoke"), (_, res) => {
  res.sendStatus(204);
});
