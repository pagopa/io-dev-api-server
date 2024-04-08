import { v4 } from "uuid";
import { TokenVerifier, decodeToken } from "jsontokens";
import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { RelyingParty, RelyingPartyRequest } from "../types/relyingParty";
import { jwtRawPublicKey, jwtSigningAlgorithm } from "./providerRouter";

export const fimsRelyingPartyRouter = Router();

const relyingParties = new Map<string, RelyingParty>();
const relyingPartyRequests = new Map<
  string,
  Map<string, RelyingPartyRequest>
>();

export const getRelyingParty = (id: string) => relyingParties.get(id);

addHandler(
  fimsRelyingPartyRouter,
  "get",
  "/fims/relyingParty/:id/landingPage",
  (req, res) => {
    initializeIfNeeded();
    const relyingPartyId = req.params.id;
    const relyingParty = relyingParties.get(relyingPartyId);
    if (!relyingParty) {
      res.status(404).send({
        message: `Relying Party with id (${relyingPartyId}) not found`
      });
      return;
    }
    const scopes = relyingParty.scopes.join(" ");
    const state = v4();
    const relyingPartyRequest: RelyingPartyRequest = {
      relyingPartyId,
      nonce: v4(),
      state
    };
    if (!relyingPartyRequests.has(relyingPartyId)) {
      relyingPartyRequests.set(
        relyingPartyId,
        new Map<string, RelyingPartyRequest>()
      );
    }
    const relyingPartyRequestMap = relyingPartyRequests.get(relyingPartyId);
    relyingPartyRequestMap?.set(relyingPartyRequest.state, relyingPartyRequest);
    const fimsProviderRedirectUri = `/fims/provider/oauth/authorize?client_id=${relyingParty.id}&scope=${scopes}&response_type=${relyingParty.responseType}&redirect_uri=${relyingParty.redirectUris[0]}&response_mode=${relyingParty.responseMode}&nonce=${relyingPartyRequest.nonce}&state=${relyingPartyRequest.state}`;
    const encodedFimsProviderRedirectUri = encodeURI(fimsProviderRedirectUri);
    res.redirect(303, encodedFimsProviderRedirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsRelyingPartyRouter,
  "post",
  "/fims/relyingParty/:id/redirectUri",
  (req, res) => {
    const relyingPartyId = req.params.id;
    const relyingPartyCurrentRequests =
      relyingPartyRequests.get(relyingPartyId);
    if (!relyingPartyCurrentRequests) {
      res.status(400).send({
        message: `Relying Party with id (${relyingPartyId}) not found`
      });
      return;
    }

    const contentType = req.headers["content-type"];
    if (contentType !== "application/x-www-form-urlencoded") {
      res.status(400).send({
        message: `Content-type (${contentType}) is not supported`
      });
      return;
    }

    const state = req.body.state;
    if (!state) {
      res.status(400).send({ message: `Missing parameter 'state' in request` });
      return;
    }
    const relyingPartyRequest = relyingPartyCurrentRequests.get(state);
    if (!relyingPartyRequest) {
      res.status(400).send({
        message: `No active request for state (${state}) on Relying Party with id (${relyingPartyId})`
      });
      return;
    }

    const idToken = req.body.id_token;
    if (!idToken) {
      res
        .status(400)
        .send({ message: `Missing parameter 'id_token' in request` });
      return;
    }

    // TODO from config
    const signingAlgorithm = jwtSigningAlgorithm();
    const rawPublicKey = jwtRawPublicKey();
    const verified = new TokenVerifier(signingAlgorithm, rawPublicKey).verify(
      idToken
    );
    if (!verified) {
      res.status(400).send({ message: `Received ID token cannot be verified` });
      return;
    }

    try {
      const tokenData = decodeToken(idToken);
      const tokenPayload = tokenData.payload as Record<string, unknown>;
      const nonce = tokenPayload.nonce as string;
      if (nonce !== relyingPartyRequest.nonce) {
        res.status(400).send({
          message: `Bad nonce value (${nonce}) for Relying Party with id (${relyingPartyId}) with state (${state})`
        });
        return;
      }

      const fullName = tokenPayload.name as string;
      const name = tokenPayload.given_name as string;
      const surname = tokenPayload.family_name as string;
      const fiscalCode = tokenPayload.sub as string;
      const signatureHash = tokenPayload.s_hash as string;
      const audienceId = tokenPayload.aud as string;
      const issuer = tokenPayload.iss as string;
      const issuedOn = tokenPayload.iat as number;
      const expiresOn = tokenPayload.exp as number;

      relyingPartyCurrentRequests.delete(state);

      res.send(200).send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FIMS Provider: aborted</title>
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
      <li>Issued on: ${new Date(issuedOn)}</li>
      <li>Expires on: ${new Date(expiresOn)}</li>
    </ul>
  </body>
  </html>
      `);
    } catch (e) {
      res.send(400).send({
        message: `Unable to decode token. Error is (${
          e instanceof Error ? e.message : "unknown error"
        })`
      });
    }
  },
  () => Math.random() * 2500
);

const initializeIfNeeded = () => {
  // TODO move to config file
  if (relyingParties.size === 0) {
    const relyingPartyId = "1";
    relyingParties.set(relyingPartyId, {
      id: relyingPartyId,
      redirectUris: [
        `http://localhost:3000/fims/relyingParty/${relyingPartyId}/redirectUri`
      ],
      responseMode: "form_post",
      responseType: "id_token",
      scopes: ["openid", "profile"]
    });
  }
};
