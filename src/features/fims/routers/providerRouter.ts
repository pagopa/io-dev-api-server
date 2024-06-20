import { Request, Response, Router } from "express";
import { v4 } from "uuid";
import { TokenSigner } from "jsontokens";
import { addHandler } from "../../../payloads/response";
import { FIMSToken } from "../../../payloads/session";
import {
  InteractionData,
  OIdCData,
  SessionData
} from "../types/authentication";
import {
  baseProviderPath,
  generateIdTokenRedirectHTML,
  providerConfig,
  translationForScope
} from "../services/providerService";
import { getRelyingParty } from "./relyingPartyRouter";

export const fimsProviderRouter = Router();

const providerRequests = new Map<string, Map<string, OIdCData>>();
const interactionIds = new Map<string, OIdCData>();

addHandler(
  fimsProviderRouter,
  "get",
  `${baseProviderPath()}/oauth/authorize`,
  (req, res) => {
    // Required parameters
    const relyingPartyId = req.query.client_id;
    if (!relyingPartyId) {
      res
        .status(400)
        .send({ message: "Missing 'client_id' parameter in request" });
      return;
    }
    const scopes = req.query.scope;
    if (!scopes) {
      res.status(400).send({ message: "Missing 'scope' parameter in request" });
      return;
    }
    const responseType = req.query.response_type;
    if (!responseType) {
      res
        .status(400)
        .send({ message: "Missing 'response_type' parameter in request" });
      return;
    }
    const redirectUri = req.query.redirect_uri;
    if (!redirectUri) {
      res
        .status(400)
        .send({ message: "Missing 'redirect_uri' parameter in request" });
      return;
    }
    const responseMode = req.query.response_mode;
    if (!responseMode) {
      res
        .status(400)
        .send({ message: "Missing 'response_mode' parameter in request" });
      return;
    }
    const nonce = req.query.nonce;
    if (!nonce) {
      res.status(400).send({ message: "Missing 'nonce' parameter in request" });
      return;
    }
    const state = req.query.state;
    if (!state) {
      res.status(400).send({ message: "Missing 'state' parameter in request" });
      return;
    }

    // Relying Party registration conformance
    const relyingParty = getRelyingParty(String(relyingPartyId));
    if (!relyingParty) {
      res.status(400).send({
        message: `Relying Party with id (${relyingPartyId}) not found`
      });
      return;
    }
    const requestScopes = String(scopes).split(" ");
    const relyingPartyScopes = new Set<string>(relyingParty.scopes);
    if (
      requestScopes.length === 0 ||
      !requestScopes.every(requestScope => relyingPartyScopes.has(requestScope))
    ) {
      res
        .status(400)
        .send({ message: `Relying Party does not allow requested scopes` });
      return;
    }
    if (relyingParty.responseType !== responseType) {
      res.status(400).send({
        message: `Relying Party does not allow response type (${responseType})`
      });
      return;
    }

    if (!relyingParty.redirectUris.includes(String(redirectUri))) {
      res.status(400).send({
        message: `Relying Party does not allow redirect uri (${redirectUri})`
      });
      return;
    }

    if (relyingParty.responseMode !== responseMode) {
      res.status(400).send({
        message: `Relying Party does not allow response mode (${responseMode})`
      });
      return;
    }

    // FIMS Token
    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    // OIdC session
    const relyingPartyIdString = String(relyingPartyId);
    if (!providerRequests.has(relyingPartyIdString)) {
      providerRequests.set(relyingPartyIdString, new Map<string, OIdCData>());
    }
    const providerOIdCsForRelyingParty =
      providerRequests.get(relyingPartyIdString);
    if (!providerOIdCsForRelyingParty) {
      res.status(500).send({
        message: "Unable to allocate OIdC data for current Relying Party"
      });
      return;
    }

    const interactionId = v4();
    const interactionData: InteractionData = {
      interaction: interactionId,
      interactionResumeSignature: v4(),
      interactionResume: interactionId,
      interactionSignature: v4()
    };
    const oidcData: OIdCData = {
      id: () => `${relyingPartyId}${state}${nonce}`,
      relyingPartyId: relyingPartyIdString,
      nonce: String(nonce),
      state: String(state),
      scopes: requestScopes,
      redirectUri: String(redirectUri),
      firstInteraction: interactionData
    };
    const oidcDataId = oidcData.id();
    if (providerRequests.has(oidcDataId)) {
      res.status(400).send({
        message: `Bad state (${state}) and nonce (${nonce}) for current request`
      });
      return;
    }
    providerRequests.set(oidcDataId, providerOIdCsForRelyingParty);
    interactionIds.set(interactionId, oidcData);

    const config = providerConfig();
    const authorizationRedirectUri = `${baseProviderPath()}/interaction/${interactionId}`;
    const cookieExpirationTime = new Date(
      new Date().getTime() + config.interactionTTLMilliseconds
    );
    res
      .cookie(config.interactionCookieKey, interactionData.interaction, {
        path: `${baseProviderPath()}/interaction/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie(
        config.interactionSignatureCookieKey,
        interactionData.interactionSignature,
        {
          path: `${baseProviderPath()}/interaction/${interactionId}`,
          expires: cookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        }
      )
      .cookie(
        config.interactionResumeCookieKey,
        interactionData.interactionResume,
        {
          path: `${baseProviderPath()}/oauth/authorize/${interactionId}`,
          expires: cookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        }
      )
      .cookie(
        config.interactionResumeSignatureCookieKey,
        interactionData.interactionResumeSignature,
        {
          path: `${baseProviderPath()}/oauth/authorize/${interactionId}`,
          expires: cookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        }
      )
      .redirect(303, authorizationRedirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "get",
  `${baseProviderPath()}/interaction/:id`,
  (req, res) => {
    const requestInteractionId = req.params.id;
    const oidcData = interactionIds.get(requestInteractionId);
    if (!oidcData) {
      res.status(400).send({
        message: `Interaction Id (${requestInteractionId}) not found`
      });
      return;
    }

    // Cookie validation
    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    // Header validation
    const requestHeaders = req.headers;
    const acceptLanguage = requestHeaders["accept-language"] as string;
    if (!acceptLanguage || acceptLanguage.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty header 'Accept-Language': (${acceptLanguage})`
      });
      return;
    }

    const config = providerConfig();
    if (oidcData.firstInteraction) {
      const cookiesToValidate = {
        [config.interactionCookieKey]: oidcData.firstInteraction?.interaction,
        [config.interactionSignatureCookieKey]:
          oidcData.firstInteraction?.interactionSignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      const redirectUri = `${baseProviderPath()}/oauth/authorize/${requestInteractionId}`;
      res.redirect(303, redirectUri);
      return;
    } else if (oidcData.secondInteraction && oidcData.session) {
      const cookiesToValidate = {
        [config.interactionCookieKey]: oidcData.secondInteraction?.interaction,
        [config.interactionSignatureCookieKey]:
          oidcData.secondInteraction?.interactionSignature,
        [config.sessionCookieKey]: oidcData.session?.session,
        [config.sessionSignatureCookieKey]: oidcData.session?.sessionSignature,
        [config.sessionLegacyCookieKey]: oidcData.session?.sessionLegacy,
        [config.sessionLegacySignatureCookieKey]:
          oidcData.session?.sessionLegacySignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      const relyingParty = getRelyingParty(oidcData.relyingPartyId);
      if (!relyingParty) {
        res.status(500).send({
          message: `Internal inconsistency for Interaction Id (${requestInteractionId}): unable to find Relying Party (${oidcData.relyingPartyId})`
        });
        return;
      }

      const consentData = {
        _links: {
          abort: {
            href: `${baseProviderPath()}/interaction/${requestInteractionId}/abort`
          },
          confirm: {
            href: `${baseProviderPath()}/interaction/${requestInteractionId}/confirm`
          }
        },
        service_id: relyingParty.serviceId,
        redirect: {
          display_name: relyingParty.displayName
        },
        type: "consent",
        user_metadata: oidcData.scopes.map(scope => ({
          name: scope,
          display_name: translationForScope(scope)
        }))
      };
      res.status(200).send(consentData);
      return;
    }

    res.status(500).send({
      message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
    });
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "post",
  `${baseProviderPath()}/interaction/:id/confirm`,
  (req, res) => {
    const requestInteractionId = req.params.id;
    const oidcData = interactionIds.get(requestInteractionId);
    if (!oidcData) {
      res.status(400).send({
        message: `Interaction Id (${requestInteractionId}) not found`
      });
      return;
    }

    if (
      requestInteractionId !== oidcData.secondInteraction?.interaction ||
      !oidcData.session
    ) {
      res.status(400).send({
        message: `Bad Interaction Id (${requestInteractionId}) for current state`
      });
      return;
    }

    // Cookie validation
    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    const config = providerConfig();
    const cookiesToValidate = {
      [config.interactionCookieKey]: oidcData.secondInteraction?.interaction,
      [config.interactionSignatureCookieKey]:
        oidcData.secondInteraction?.interactionSignature,
      [config.sessionCookieKey]: oidcData.session?.session,
      [config.sessionSignatureCookieKey]: oidcData.session?.sessionSignature,
      [config.sessionLegacyCookieKey]: oidcData.session?.sessionLegacy,
      [config.sessionLegacySignatureCookieKey]:
        oidcData.session?.sessionLegacySignature
    };
    if (!validateCookies(cookiesToValidate, cookies, res)) {
      return;
    }

    const redirectUri = `${baseProviderPath()}/oauth/authorize/${requestInteractionId}`;
    res.redirect(303, redirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "post",
  `${baseProviderPath()}/interaction/:id/abort`,
  (req, res) => {
    const requestInteractionId = req.params.id;
    const currentOidcData = interactionIds.get(requestInteractionId);
    if (!currentOidcData) {
      res.status(400).send({
        message: `Interaction Id (${requestInteractionId}) not found`
      });
      return;
    }

    interactionIds.delete(requestInteractionId);

    const relyingPartyId = currentOidcData.relyingPartyId;
    const providerOIdCsForRelyingParty = providerRequests.get(relyingPartyId);
    const currentOIdCDataId = currentOidcData.id();
    providerOIdCsForRelyingParty?.delete(currentOIdCDataId);

    const config = providerConfig();
    // TODO replace by redirecting to the relying party with an abort
    res
      .clearCookie(config.interactionCookieKey)
      .clearCookie(config.interactionSignatureCookieKey)
      .clearCookie(config.interactionResumeCookieKey)
      .clearCookie(config.interactionResumeSignatureCookieKey)
      .clearCookie(config.sessionCookieKey)
      .clearCookie(config.sessionSignatureCookieKey)
      .clearCookie(config.sessionLegacyCookieKey)
      .clearCookie(config.sessionLegacySignatureCookieKey)
      .status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FIMS Provider: aborted</title>
  </head>
  <body>
    <h1>Your request has been aborted</h1>
  </body>
  </html>
    `);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "get",
  `${baseProviderPath()}/oauth/authorize/:id`,
  (req, res) => {
    const requestInteractionId = req.params.id;
    const currentOidcData = interactionIds.get(requestInteractionId);
    if (!currentOidcData) {
      res.status(400).send({
        message: `Interaction Id (${requestInteractionId}) not found`
      });
      return;
    }

    // Cookie validation
    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    const config = providerConfig();
    if (currentOidcData.firstInteraction) {
      const cookiesToValidate = {
        [config.interactionResumeCookieKey]:
          currentOidcData.firstInteraction?.interactionResume,
        [config.interactionResumeSignatureCookieKey]:
          currentOidcData.firstInteraction?.interactionResumeSignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      responseFromOAuthAuthorizeFirstInteraction(
        requestInteractionId,
        currentOidcData,
        res
      );
      return;
    } else if (currentOidcData.secondInteraction && currentOidcData.session) {
      // This case happens as a redirect of the /confirm endpoint
      const cookiesToValidate = {
        [config.interactionResumeCookieKey]:
          currentOidcData.secondInteraction?.interactionResume,
        [config.interactionResumeSignatureCookieKey]:
          currentOidcData.secondInteraction?.interactionResumeSignature,
        [config.sessionCookieKey]: currentOidcData.session?.session,
        [config.sessionSignatureCookieKey]:
          currentOidcData.session?.sessionSignature,
        [config.sessionLegacyCookieKey]: currentOidcData.session?.sessionLegacy,
        [config.sessionLegacySignatureCookieKey]:
          currentOidcData.session?.sessionLegacySignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      interactionIds.delete(requestInteractionId);

      const relyingPartyId = currentOidcData.relyingPartyId;
      const providerOIdCsForRelyingParty = providerRequests.get(relyingPartyId);
      const currentOIdCDataId = currentOidcData.id();
      providerOIdCsForRelyingParty?.delete(currentOIdCDataId);

      responseFromOAuthAuthorizeSecondInteraction(
        requestInteractionId,
        currentOidcData,
        req,
        res
      );
      return;
    }

    res.status(500).send({
      message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
    });
  },
  () => Math.random() * 2500
);

const responseFromOAuthAuthorizeFirstInteraction = (
  requestInteractionId: string,
  currentOIdCData: OIdCData,
  res: Response
) => {
  const interactionId = v4();
  const interactionData: InteractionData = {
    interaction: interactionId,
    interactionResumeSignature: v4(),
    interactionResume: interactionId,
    interactionSignature: v4()
  };
  const sessionId = v4();
  const sessionData: SessionData = {
    session: sessionId,
    sessionSignature: v4(),
    sessionLegacy: sessionId,
    sessionLegacySignature: v4()
  };
  const oidcData: OIdCData = {
    ...currentOIdCData,
    firstInteraction: undefined,
    secondInteraction: interactionData,
    session: sessionData
  };
  const providerOIdCsForRelyingParty = providerRequests.get(
    oidcData.relyingPartyId
  );
  providerOIdCsForRelyingParty?.set(oidcData.id(), oidcData);
  interactionIds.delete(requestInteractionId);
  interactionIds.set(interactionId, oidcData);

  const config = providerConfig();
  const interactionRedirectUri = `${baseProviderPath()}/interaction/${interactionId}`;
  const interactionCookieExpirationTime = new Date(
    new Date().getTime() + config.interactionTTLMilliseconds
  );
  const sessionCookieExpirationTime = new Date(
    new Date().getTime() + config.sessionTTLMilliseconds
  );
  res
    .cookie(config.interactionCookieKey, interactionData.interaction, {
      path: `${baseProviderPath()}/interaction/${interactionId}`,
      expires: interactionCookieExpirationTime,
      sameSite: "lax",
      httpOnly: true
    })
    .cookie(
      config.interactionSignatureCookieKey,
      interactionData.interactionSignature,
      {
        path: `${baseProviderPath()}/interaction/${interactionId}`,
        expires: interactionCookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      }
    )
    .cookie(
      config.interactionResumeCookieKey,
      interactionData.interactionResume,
      {
        path: `${baseProviderPath()}/oauth/authorize/${interactionId}`,
        expires: interactionCookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      }
    )
    .cookie(
      config.interactionResumeSignatureCookieKey,
      interactionData.interactionResumeSignature,
      {
        path: `${baseProviderPath()}/oauth/authorize/${interactionId}`,
        expires: interactionCookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      }
    )
    .cookie(config.sessionCookieKey, sessionData.session, {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      sameSite: sameSitePolicyForSessionCookie(),
      httpOnly: true
    })
    .cookie(config.sessionSignatureCookieKey, sessionData.sessionSignature, {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      sameSite: sameSitePolicyForSessionCookie(),
      httpOnly: true
    })
    .cookie(config.sessionLegacyCookieKey, sessionData.sessionLegacy, {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      httpOnly: true
    })
    .cookie(
      config.sessionLegacySignatureCookieKey,
      sessionData.sessionLegacySignature,
      {
        path: `${baseProviderPath()}`,
        expires: sessionCookieExpirationTime,
        httpOnly: true
      }
    )
    .redirect(303, interactionRedirectUri);
};

const responseFromOAuthAuthorizeSecondInteraction = (
  requestInteractionId: string,
  currentOIdCData: OIdCData,
  req: Request,
  res: Response
) => {
  const config = providerConfig();
  const isImplicitCodeFlow = config.implicitCodeFlow;
  const relyingPartyRedirectUri = currentOIdCData.redirectUri;
  const relyingPartyNonce = currentOIdCData.nonce;
  const relyingPartyState = currentOIdCData.state;
  const issuer = `${req.protocol}://${req.get("host")}`;
  // TODO retrieve from profile (or configuration?)
  const tokenPayload = {
    sub: "SMTJHN50P01D222E",
    family_name: "Smith",
    given_name: "John",
    name: "John Smith",
    nonce: relyingPartyNonce,
    s_hash: "NotImplemented", // TODO?
    aud: currentOIdCData.relyingPartyId,
    exp: new Date(
      new Date().getTime() + config.idTokenTTLMilliseconds
    ).getTime(),
    iat: new Date().getTime(),
    iss: issuer
  };
  const idToken = new TokenSigner(
    config.idTokenSigningAlgorithm,
    config.idTokenRawPrivateKey
  ).sign(tokenPayload);

  const newSessionId = v4();
  const invalidationExpirationTime = new Date(1970, 0, 1, 0, 0, 0);
  const sessionCookieExpirationTime = new Date(
    new Date().getTime() + config.sessionTTLMilliseconds
  );

  const commonResponse = res
    .cookie(config.interactionResumeCookieKey, "", {
      path: `${baseProviderPath()}/oauth/authorize/${requestInteractionId}`,
      expires: invalidationExpirationTime,
      sameSite: "lax",
      httpOnly: true
    })
    .cookie(config.interactionResumeSignatureCookieKey, v4(), {
      path: `${baseProviderPath()}/oauth/authorize/${requestInteractionId}`,
      expires: invalidationExpirationTime,
      sameSite: "lax",
      httpOnly: true
    })
    .cookie(config.sessionCookieKey, newSessionId, {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      sameSite: sameSitePolicyForSessionCookie(),
      httpOnly: true
    })
    .cookie(config.sessionSignatureCookieKey, v4(), {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      sameSite: sameSitePolicyForSessionCookie(),
      httpOnly: true
    })
    .cookie(config.sessionLegacyCookieKey, newSessionId, {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      httpOnly: true
    })
    .cookie(config.sessionLegacySignatureCookieKey, v4(), {
      path: `${baseProviderPath()}`,
      expires: sessionCookieExpirationTime,
      httpOnly: true
    });

  const relyingPartyURLInstance = new URL(relyingPartyRedirectUri);
  if (isImplicitCodeFlow) {
    const responseHTMLBody = generateIdTokenRedirectHTML(
      relyingPartyURLInstance.href,
      idToken,
      relyingPartyState
    );
    commonResponse.status(200).send(responseHTMLBody);
  } else {
    relyingPartyURLInstance.searchParams.set("authorization_code", idToken);
    relyingPartyURLInstance.searchParams.set("nonce", relyingPartyNonce);
    relyingPartyURLInstance.searchParams.set("state", relyingPartyState);
    commonResponse.redirect(303, relyingPartyURLInstance.href);
  }
};

const validateFIMSToken = (cookies: Record<string, unknown>, res: Response) => {
  const config = providerConfig();
  if (config.ignoreFederationCookiePresence) {
    return true;
  }
  const fimsTokenCookieName = config.federationCookieName;
  const requestFimsToken = cookies[fimsTokenCookieName];
  if (!requestFimsToken) {
    res
      .status(400)
      .send({ message: `Missing '${fimsTokenCookieName}' cookie in request` });
    return false;
  }
  if (config.ignoreFederationCookieValue) {
    return true;
  }
  const requestFimsTokenString = String(requestFimsToken);
  const fimsToken = FIMSToken();
  if (requestFimsTokenString !== fimsToken) {
    res.status(401).send({
      message: `'${fimsTokenCookieName}' with value (${requestFimsTokenString}) does not match`
    });
    return false;
  }
  return true;
};

const sameSitePolicyForSessionCookie = () =>
  providerConfig().useLaxInsteadOfNoneForSameSiteOnSessionCookies
    ? "lax"
    : "none";

const validateCookies = (
  mandatoryCookies: Record<string, string>,
  requestCookies: Record<string, unknown>,
  res: Response
) => {
  // eslint-disable-next-line guard-for-in
  for (const mandatoryCookieKey in mandatoryCookies) {
    const cookieValue = requestCookies[mandatoryCookieKey];
    if (!cookieValue) {
      res.status(400).send({
        message: `Mising cookie with name '${mandatoryCookieKey}'`
      });
      return false;
    }
    const mandatoryCookieValue = mandatoryCookies[mandatoryCookieKey];
    if (cookieValue !== mandatoryCookieValue) {
      res.status(400).send({
        message: `Value of cookie with name '${mandatoryCookieKey}' (${cookieValue}) does not match exptected one (${mandatoryCookieValue})`
      });
      return false;
    }
  }
  return true;
};
