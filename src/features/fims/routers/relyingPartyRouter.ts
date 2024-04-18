import { v4 } from "uuid";
import { TokenVerifier, decodeToken } from "jsontokens";
import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { RelyingParty, RelyingPartyRequest } from "../types/relyingParty";
import {
  baseRelyingPartyPath,
  generateUserProfileHTML,
  relyingPartiesConfig
} from "../services/relyingPartyService";
import { baseProviderPath, providerConfig } from "../services/providerService";

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
  `${baseRelyingPartyPath()}/:id/landingPage`,
  (req, res) => {
    const relyingPartyId = req.params.id;
    const relyingParty = findOrLazyLoadRelyingParty(relyingPartyId);
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
    const fimsProviderRedirectUri = `${baseProviderPath()}/oauth/authorize?client_id=${
      relyingParty.id
    }&scope=${scopes}&response_type=${relyingParty.responseType}&redirect_uri=${
      relyingParty.redirectUris[0]
    }&response_mode=${relyingParty.responseMode}&nonce=${
      relyingPartyRequest.nonce
    }&state=${relyingPartyRequest.state}`;
    const encodedFimsProviderRedirectUri = encodeURI(fimsProviderRedirectUri);
    res.redirect(303, encodedFimsProviderRedirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsRelyingPartyRouter,
  "post",
  `${baseRelyingPartyPath()}/:id/redirectUri`,
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

    const config = providerConfig();
    const verified = new TokenVerifier(
      config.idTokenSigningAlgorithm,
      config.idTokenRawPublicKey
    ).verify(idToken);
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

      relyingPartyCurrentRequests.delete(state);

      const userProfileHTML = generateUserProfileHTML(tokenPayload);
      res.status(200).send(userProfileHTML);
    } catch (e) {
      res.status(400).send({
        message: `Unable to decode token. Error is (${
          e instanceof Error ? e.message : "unknown error"
        })`
      });
    }
  },
  () => Math.random() * 2500
);

const findOrLazyLoadRelyingParty = (id: string) => {
  const inMemoryRelyingParty = relyingParties.get(id);
  if (inMemoryRelyingParty) {
    return inMemoryRelyingParty;
  }

  const config = relyingPartiesConfig();
  config.forEach(relyingPartyConfig =>
    relyingParties.set(relyingPartyConfig.id, {
      id: relyingPartyConfig.id,
      redirectUris: relyingPartyConfig.redirectUri,
      responseMode: "form_post",
      responseType: "id_token",
      scopes: relyingPartyConfig.scopes
    })
  );

  return relyingParties.get(id);
};
