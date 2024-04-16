/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { Response, Router } from "express";
import { v4 } from "uuid";
import { TokenSigner } from "jsontokens";
import { addHandler } from "../../../payloads/response";
import { FIMSToken } from "../../../payloads/session";
import {
  InteractionData,
  OIdCData,
  SessionData
} from "../types/authentication";
import { getRelyingParty } from "./relyingPartyRouter";

export const fimsProviderRouter = Router();

const FIMSTokenCookieNameGenerator = () => "X-IO-Federation-Token";
// TODO move to Config file
const skipFIMSTokenKeyValidation = () => false;
// TODO move to Config file
const skipFIMSTokenValueValidation = () => true;
// TODO move to Config file
const interactionTTLMilliseconds = () => 5 * 60 * 1000;
// TODO move to Config file
const sessionTTLMilliseconds = () => 1 * 60 * 1000;
// TODO move to Config file
const jwtTTLMilliseconds = () => 15 * 60 * 1000;
// TODO move to Config file
const useLaxInsteadOfNoneForSessionCookieSameSite = () => true;
export const jwtSigningAlgorithm = () => "ES256K";
// TODO move to Config file
const jwtRawPrivateKey = () =>
  "278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f";
// TODO move to Config file
export const jwtRawPublicKey = () =>
  "03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479";

const interactionCookieKey = () => "_interaction";
const interactionSignatureCookieKey = () => "_interaction.sig";
const interactionResumeCookieKey = () => "_interaction_resume";
const interactionResumeSignatureCookieKey = () => "_interaction_resume.sig";
const sessionCookieKey = () => "_session";
const sessionSignatyreCookieKey = () => "_session.sig";
const sessionLegacyCookieKey = () => "_session.legacy";
const sessionLegacySignatureCookieKey = () => "_session.legacy.sig";

const providerRequests = new Map<string, Map<string, OIdCData>>();
const interactionIds = new Map<string, OIdCData>();

addHandler(
  fimsProviderRouter,
  "get",
  "/fims/provider/oauth/authorize",
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

    const authorizationRedirectUri = `/fims/provider/interaction/${interactionId}`;
    const cookieExpirationTime = new Date(
      new Date().getTime() + interactionTTLMilliseconds()
    );
    res
      .cookie(interactionCookieKey(), interactionData.interaction, {
        path: `/fims/provider/interaction/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie(
        interactionSignatureCookieKey(),
        interactionData.interactionSignature,
        {
          path: `/fims/provider/interaction/${interactionId}`,
          expires: cookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        }
      )
      .cookie(interactionResumeCookieKey(), interactionData.interactionResume, {
        path: `/fims/provider/oauth/authorize/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie(
        interactionResumeSignatureCookieKey(),
        interactionData.interactionResumeSignature,
        {
          path: `/fims/provider/oauth/authorize/${interactionId}`,
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
  "/fims/provider/interaction/:id",
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

    if (oidcData.firstInteraction) {
      const cookiesToValidate = {
        [interactionCookieKey()]: oidcData.firstInteraction?.interaction,
        [interactionSignatureCookieKey()]:
          oidcData.firstInteraction?.interactionSignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      const redirectUri = `/fims/provider/oauth/authorize/${requestInteractionId}`;
      res.redirect(303, redirectUri);
      return;
    } else if (oidcData.secondInteraction && oidcData.session) {
      const cookiesToValidate = {
        [interactionCookieKey()]: oidcData.secondInteraction?.interaction,
        [interactionSignatureCookieKey()]:
          oidcData.secondInteraction?.interactionSignature,
        [sessionCookieKey()]: oidcData.session?.session,
        [sessionSignatyreCookieKey()]: oidcData.session?.sessionSignature,
        [sessionLegacyCookieKey()]: oidcData.session?.sessionLegacy,
        [sessionLegacySignatureCookieKey()]:
          oidcData.session?.sessionLegacySignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

      const abortRedirectUri = `/fims/provider/interaction/${requestInteractionId}/abort`;
      const confirmRedirectUri = `/fims/provider/interaction/${requestInteractionId}/confirm`;
      res.status(200).send(`
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
      <p>I seguenti dati stanno per essere condivisi con <strong>TODO LINK RELYING PARTY HERE</strong></p>
      <p><strong>TODO LINK SCOPES HERE</strong></p>
      <form autocomplete="off" action="${confirmRedirectUri}" method="post">
        <div>
          <input id="checkbox10" type="checkbox" name="to_remember" aria-labelledby="checkbox10-help">
          <label for="checkbox10">Non richiedere più</label>
        </div>
        <br/>
        <div>
          <a href="${abortRedirectUri}">Annulla</a>
          <button autotype="button">Conferma</button>
        </div>
      </form>
    </div>
  </body>
  </html>
    `);
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
  "/fims/provider/interaction/:id/confirm",
  (req, res) => {
    const contentType = req.headers["content-type"];
    if (contentType !== "application/x-www-form-urlencoded") {
      res.status(400).send({
        message: `Content-type (${contentType}) is not supported`
      });
      return;
    }

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
      res.status(500).send({
        message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
      });
      return;
    }

    // Cookie validation
    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    const cookiesToValidate = {
      [interactionCookieKey()]: oidcData.secondInteraction?.interaction,
      [interactionSignatureCookieKey()]:
        oidcData.secondInteraction?.interactionSignature,
      [sessionCookieKey()]: oidcData.session?.session,
      [sessionSignatyreCookieKey()]: oidcData.session?.sessionSignature,
      [sessionLegacyCookieKey()]: oidcData.session?.sessionLegacy,
      [sessionLegacySignatureCookieKey()]:
        oidcData.session?.sessionLegacySignature
    };
    if (!validateCookies(cookiesToValidate, cookies, res)) {
      return;
    }

    const redirectUri = `/fims/provider/oauth/authorize/${requestInteractionId}`;
    res.redirect(303, redirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "get",
  "/fims/provider/interaction/:id/abort",
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

    // TODO replace by redirecting to the relying party with an abort
    res
      .clearCookie(interactionCookieKey())
      .clearCookie(interactionSignatureCookieKey())
      .clearCookie(interactionResumeCookieKey())
      .clearCookie(interactionResumeSignatureCookieKey())
      .clearCookie(sessionCookieKey())
      .clearCookie(sessionSignatyreCookieKey())
      .clearCookie(sessionLegacyCookieKey())
      .clearCookie(sessionLegacySignatureCookieKey())
      .status(200).send(`
  <!DOCTYPE html>
  <html>
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
  "/fims/provider/oauth/authorize/:id",
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

    if (currentOidcData.firstInteraction) {
      const cookiesToValidate = {
        [interactionResumeCookieKey()]:
          currentOidcData.firstInteraction?.interactionResume,
        [interactionResumeSignatureCookieKey()]:
          currentOidcData.firstInteraction?.interactionResumeSignature
      };
      if (!validateCookies(cookiesToValidate, cookies, res)) {
        return;
      }

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
        ...currentOidcData,
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

      const interactionRedirectUri = `/fims/provider/interaction/${interactionId}`;
      const interactionCookieExpirationTime = new Date(
        new Date().getTime() + interactionTTLMilliseconds()
      );
      const sessionCookieExpirationTime = new Date(
        new Date().getTime() + sessionTTLMilliseconds()
      );
      res
        .cookie(interactionCookieKey(), interactionData.interaction, {
          path: `/fims/provider/interaction/${interactionId}`,
          expires: interactionCookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie(
          interactionSignatureCookieKey(),
          interactionData.interactionSignature,
          {
            path: `/fims/provider/interaction/${interactionId}`,
            expires: interactionCookieExpirationTime,
            sameSite: "lax",
            httpOnly: true
          }
        )
        .cookie(
          interactionResumeCookieKey(),
          interactionData.interactionResume,
          {
            path: `/fims/provider/oauth/authorize/${interactionId}`,
            expires: interactionCookieExpirationTime,
            sameSite: "lax",
            httpOnly: true
          }
        )
        .cookie(
          interactionResumeSignatureCookieKey(),
          interactionData.interactionResumeSignature,
          {
            path: `/fims/provider/oauth/authorize/${interactionId}`,
            expires: interactionCookieExpirationTime,
            sameSite: "lax",
            httpOnly: true
          }
        )
        .cookie(sessionCookieKey(), sessionData.session, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: sameSitePolicyForSessionCookie(),
          httpOnly: true
        })
        .cookie(sessionSignatyreCookieKey(), sessionData.sessionSignature, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: sameSitePolicyForSessionCookie(),
          httpOnly: true
        })
        .cookie(sessionLegacyCookieKey(), sessionData.sessionLegacy, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          httpOnly: true
        })
        .cookie(
          sessionLegacySignatureCookieKey(),
          sessionData.sessionLegacySignature,
          {
            path: `/fims/provider`,
            expires: sessionCookieExpirationTime,
            httpOnly: true
          }
        )
        .redirect(303, interactionRedirectUri);
      return;
    } else if (currentOidcData.secondInteraction && currentOidcData.session) {
      // This case happens as a redirect of the /confirm endpoint

      // Cookie validation
      const cookiesToValidate = {
        [interactionResumeCookieKey()]:
          currentOidcData.secondInteraction?.interactionResume,
        [interactionResumeSignatureCookieKey()]:
          currentOidcData.secondInteraction?.interactionResumeSignature,
        [sessionCookieKey()]: currentOidcData.session?.session,
        [sessionSignatyreCookieKey()]:
          currentOidcData.session?.sessionSignature,
        [sessionLegacyCookieKey()]: currentOidcData.session?.sessionLegacy,
        [sessionLegacySignatureCookieKey()]:
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

      const relyingPartyRedirectUri = currentOidcData.redirectUri;
      const relyingPartyNonce = currentOidcData.nonce;
      const relyingPartyState = currentOidcData.state;
      const issuer = `${req.protocol}://${req.get("host")}`;
      // TODO retrieve from profile (or configuration?)
      const tokenPayload = {
        sub: "SMTJHN50P01D222E",
        family_name: "Smith",
        given_name: "John",
        name: "John Smith",
        nonce: relyingPartyNonce,
        s_hash: "NotImplemented", // TODO?
        aud: relyingPartyId,
        exp: new Date(new Date().getTime() + jwtTTLMilliseconds()).getTime(),
        iat: new Date().getTime(),
        iss: issuer
      };
      const idToken = new TokenSigner(
        jwtSigningAlgorithm(),
        jwtRawPrivateKey()
      ).sign(tokenPayload);

      const newSessionId = v4();
      const invalidationExpirationTime = new Date(1970, 0, 1, 0, 0, 0);
      const sessionCookieExpirationTime = new Date(
        new Date().getTime() + sessionTTLMilliseconds()
      );
      res
        .cookie(interactionResumeCookieKey(), "", {
          path: `/fims/provider/oauth/authorize/${requestInteractionId}`,
          expires: invalidationExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie(interactionResumeSignatureCookieKey(), v4(), {
          path: `/fims/provider/oauth/authorize/${requestInteractionId}`,
          expires: invalidationExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie(sessionCookieKey(), newSessionId, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: sameSitePolicyForSessionCookie(),
          httpOnly: true
        })
        .cookie(sessionSignatyreCookieKey(), v4(), {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: sameSitePolicyForSessionCookie(),
          httpOnly: true
        })
        .cookie(sessionLegacyCookieKey(), newSessionId, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          httpOnly: true
        })
        .cookie(sessionLegacySignatureCookieKey(), v4(), {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          httpOnly: true
        })
        .status(200).send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FIMS Provider: submit callback</title>
    <script>document.addEventListener('DOMContentLoaded', function () { document.forms[0].submit() });</script>
  </head>
  <body>
    <form method="post" action="${relyingPartyRedirectUri}">
      <input type="hidden" name="id_token" value="${idToken}"/>
      <input type="hidden" name="state" value="${relyingPartyState}"/>
      <noscript>Your browser does not support JavaScript or you've disabled it.<br/>
        <button autofocus type="submit">Continue</button>
      </noscript>
    </form>
  </body>
  </html>
      `);
      return;
    }

    res.status(500).send({
      message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
    });
  },
  () => Math.random() * 2500
);

const validateFIMSToken = (cookies: Record<string, unknown>, res: Response) => {
  if (skipFIMSTokenKeyValidation()) {
    return true;
  }
  const fimsTokenCookieName = FIMSTokenCookieNameGenerator();
  const requestFimsToken = cookies[fimsTokenCookieName];
  if (!requestFimsToken) {
    res
      .status(400)
      .send({ message: `Missing '${fimsTokenCookieName}' cookie in request` });
    return false;
  }
  if (skipFIMSTokenValueValidation()) {
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
  useLaxInsteadOfNoneForSessionCookieSameSite() ? "lax" : "none";

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
