import { Router } from "express";
import { addApiV1Prefix } from "../../../../utils/strings";
import { addHandler } from "../../../../payloads/response";
import { WELL_KNOWN_RESPONSE } from "../../../../payloads/features/it-wallet/qeea/well-known";
import { PAR_RESPONSE } from "../../../../payloads/features/it-wallet/qeea/par";
import { CALLBACK_RESPONSE } from "../../../../payloads/features/it-wallet/qeea/callback";
import { TOKEN_RESPONSE } from "../../../../payloads/features/it-wallet/qeea/token";
import {
  CREDENTIAL_RESPONSE,
  STATUS_RESPONSE
} from "../../../../payloads/features/it-wallet/qeea/credential";
import { REQUEST_OBJECT } from "../../../../payloads/features/it-wallet/qeea/rp";

export const itwRouter = Router();

export const addItwPrefix = (path: string) =>
  addApiV1Prefix(`/itwallet/qeea${path}`);

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
 * AS - PAR
 */
addHandler(itwRouter, "get", addItwPrefix("/as/par"), (req, res) => {
  // TODO: extract request body params
  res.status(201).json(PAR_RESPONSE);
});

/**
 * AS - Authorize Endpoint
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
 * AS -Callback Endpoint
 */
addHandler(
  itwRouter,
  "get",
  addItwPrefix("/callback/:response_code"),
  (_, res) => {
    /* 
  The request header should contain this params
  -H 'FamilyName: Rossi' \
  -H 'FirstName: Mario' \
  -H 'DateOfBirth: 1980-01-01' \
  -H 'PersonIdentifier: RSSMRA80A01H501U' \
  -H 'AuthnLevel: 2' \ */
    res.status(200).send(CALLBACK_RESPONSE);
  }
);

/**
 * AS - Token Endpoint
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

/**
 * RP - login
 */
addHandler(itwRouter, "get", addItwPrefix("/login/:state"), (_, res) => {
  res.sendStatus(200); // TODO: add response
});

/**
 * RP - request uri
 * endpoint to download RequestObject
 */
addHandler(
  itwRouter,
  "get",
  addItwPrefix("/request_uri/:random_value"),
  (_, res) => {
    res.status(200).send(REQUEST_OBJECT); // TODO: add response
  }
);

/**
 * RP - The RP Wallet endpoint for presenting the WTE and the eID Verifiable Credential
 */
addHandler(itwRouter, "post", addItwPrefix("/response_uri"), (req, res) => {
  const response_code = req.body.response;
  // TODO make response object
  res.status(200).send({
    redirect_uri: `https://it-wallet-eaa-provider.example.it/callback#response_code=${response_code}`
  }); // TODO: add response
});
