import { v4 } from "uuid";
import { TokenVerifier, decodeToken } from "jsontokens";
import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { RelyingParty, RelyingPartyRequest } from "../types/relyingParty";
import {
  baseRelyingPartyPath,
  generateUserProfileHTML,
  relyingPartiesConfig,
  tokenPayloadToUrl
} from "../services/relyingPartyService";
import { baseProviderPath, providerConfig } from "../services/providerService";
import ServicesDB from "../../../persistence/services";

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
  "get",
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

    const requestHeaders = req.headers;
    const lollipopMethod = requestHeaders[
      "x-pagopa-lollipop-original-method"
    ] as string;
    if (!lollipopMethod || lollipopMethod.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-method'`
      });
      return;
    }
    const lollipopOriginalUrl = requestHeaders[
      "x-pagopa-lollipop-original-url"
    ] as string;
    if (!lollipopOriginalUrl || lollipopOriginalUrl.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-url'`
      });
      return;
    }
    const lollipopAuthorizationCode = requestHeaders[
      "x-pagopa-lollipop-custom-authorization_code"
    ] as string;
    if (
      !lollipopAuthorizationCode ||
      lollipopAuthorizationCode.trim().length === 0
    ) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-custom-authorization_code'`
      });
      return;
    }

    const state = req.query.state as string;
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

    const nonce = req.query.nonce as string;
    if (!nonce) {
      res.status(400).send({ message: `Missing parameter 'nonce' in request` });
      return;
    }
    if (nonce !== relyingPartyRequest.nonce) {
      res.status(400).send({
        message: `Bad nonce value (${nonce}) for Relying Party with id (${relyingPartyId}) with state (${state})`
      });
      return;
    }

    const fakeIdToken = req.query.authorization_code as string;
    if (!fakeIdToken) {
      res
        .status(400)
        .send({ message: `Missing parameter 'authorization_code' in request` });
      return;
    }

    const config = providerConfig();
    const verified = new TokenVerifier(
      config.idTokenSigningAlgorithm,
      config.idTokenRawPublicKey
    ).verify(fakeIdToken);
    if (!verified) {
      res.status(400).send({ message: `Received ID token cannot be verified` });
      return;
    }

    try {
      const tokenData = decodeToken(fakeIdToken);
      const tokenPayload = tokenData.payload as Record<string, unknown>;
      const payloadNonce = tokenPayload.nonce as string;
      if (payloadNonce !== relyingPartyRequest.nonce) {
        res.status(400).send({
          message: `Bad nonce value (${payloadNonce}) for Relying Party with id (${relyingPartyId}) with state (${state})`
        });
        return;
      }

      relyingPartyCurrentRequests.delete(state);

      const authenticatedUrl = tokenPayloadToUrl(
        tokenPayload,
        `${req.protocol}://${
          req.headers.host
        }${baseRelyingPartyPath()}/authenticatedPage`
      );
      res.redirect(302, authenticatedUrl);
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

addHandler(
  fimsRelyingPartyRouter,
  "get",
  `${baseRelyingPartyPath()}/authenticatedPage`,
  (req, res) => {
    const query = req.query;
    const userProfileHTML = generateUserProfileHTML(query);
    res.status(200).send(userProfileHTML);
  }
);

const findOrLazyLoadRelyingParty = (id: string) => {
  const inMemoryRelyingParty = relyingParties.get(id);
  if (inMemoryRelyingParty) {
    return inMemoryRelyingParty;
  }

  const config = relyingPartiesConfig();
  config.forEach(relyingPartyConfig => {
    const serviceId = relyingPartyConfig.serviceId ?? randomServiceId();
    relyingParties.set(relyingPartyConfig.id, {
      displayName: relyingPartyConfig.registrationName,
      id: relyingPartyConfig.id,
      redirectUris: relyingPartyConfig.redirectUri,
      responseMode: "form_post",
      responseType: "id_token",
      scopes: relyingPartyConfig.scopes,
      serviceId
    });
  });

  return relyingParties.get(id);
};

const randomServiceId = () => {
  const allServices = ServicesDB.getAllServices();
  if (allServices.length > 0) {
    const firstNationalService = allServices[0];
    return firstNationalService.service_id;
  }
  throw new Error(
    "RelyingPartyRouter.randomServiceId: empty service collection. It must have some values at this point"
  );
};
