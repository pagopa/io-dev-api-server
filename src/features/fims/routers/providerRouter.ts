/* eslint-disable complexity */
import { Response, Router } from "express";
import { v4 } from "uuid";
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
const skipFIMSTokenValueValidation = () => true;
// TODO move to Config file
const interactionTTLMilliseconds = () => 5 * 60 * 1000;
// TODO move to Config file
const sessionTTLMilliseconds = () => 1 * 60 * 1000;

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
      res
        .status(400)
        .send({
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
      res
        .status(400)
        .send({
          message: `Relying Party does not allow response type (${responseType})`
        });
      return;
    }

    if (!relyingParty.redirectUris.includes(String(redirectUri))) {
      res
        .status(400)
        .send({
          message: `Relying Party does not allow redirect uri (${redirectUri})`
        });
      return;
    }

    if (relyingParty.responseMode !== responseMode) {
      res
        .status(400)
        .send({
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
      res
        .status(500)
        .send({
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
      res
        .status(400)
        .send({
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
      .cookie("_interaction", interactionData.interaction, {
        path: `/fims/provider/interaction/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie("_interaction.sig", interactionData.interactionSignature, {
        path: `/fims/provider/interaction/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie("_interaction_resume", interactionData.interactionResume, {
        path: `/fims/provider/oauth/authorize/${interactionId}`,
        expires: cookieExpirationTime,
        sameSite: "lax",
        httpOnly: true
      })
      .cookie(
        "_interaction_resume.sig",
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
      res
        .status(400)
        .send({
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
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const cookieInteractionId = cookies["_interaction"];
      if (!cookieInteractionId) {
        res
          .status(400)
          .send({ message: `Missing cookie with name '_interaction'` });
        return;
      }
      if (cookieInteractionId !== oidcData.firstInteraction?.interaction) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction' (${cookieInteractionId}) does not match saved one`
          });
        return;
      }

      const cookieInteractionIdSignature = cookies["_interaction.sig"];
      if (!cookieInteractionIdSignature) {
        res
          .status(400)
          .send({ message: `Mising cookie with name '_interaction.sig'` });
        return;
      }
      if (
        cookieInteractionIdSignature !==
        oidcData.firstInteraction?.interactionSignature
      ) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction.sig' (${cookieInteractionIdSignature}) does not match saved one`
          });
        return;
      }

      const redirectUri = `/fims/provider/oauth/authorize/${requestInteractionId}`;
      res.redirect(303, redirectUri);
      return;
    } else if (oidcData.secondInteraction) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const cookieInteractionId = cookies["_interaction"];
      if (!cookieInteractionId) {
        res
          .status(400)
          .send({ message: `Missing cookie with name '_interaction'` });
        return;
      }
      if (cookieInteractionId !== oidcData.secondInteraction?.interaction) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction' (${cookieInteractionId}) does not match saved one`
          });
        return;
      }

      const cookieInteractionIdSignature = cookies["_interaction.sig"];
      if (!cookieInteractionIdSignature) {
        res
          .status(400)
          .send({ message: `Mising cookie with name '_interaction.sig'` });
        return;
      }
      if (
        cookieInteractionIdSignature !==
        oidcData.secondInteraction?.interactionSignature
      ) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction.sig' (${cookieInteractionIdSignature}) does not match saved one`
          });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const cookieSession = cookies["_session"];
      if (!cookieSession) {
        res.status(400).send({ message: `Mising cookie with name '_session'` });
        return;
      }
      if (cookieSession !== oidcData.session?.session) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_session' (${cookieSession}) does not match saved one`
          });
        return;
      }

      const cookieSessionSignature = cookies["_session.sig"];
      if (!cookieSessionSignature) {
        res
          .status(400)
          .send({ message: `Mising cookie with name '_session.sig'` });
        return;
      }
      if (cookieSessionSignature !== oidcData.session?.sessionSignature) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_session.sig' (${cookieSessionSignature}) does not match saved one`
          });
        return;
      }

      const cookieSessionLegacy = cookies["_session.legacy"];
      if (!cookieSessionLegacy) {
        res
          .status(400)
          .send({ message: `Mising cookie with name '_session.legacy'` });
        return;
      }
      if (cookieSessionLegacy !== oidcData.session?.sessionLegacy) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_session.legacy' (${cookieSessionLegacy}) does not match saved one`
          });
        return;
      }

      const cookieSessionLegacySignature = cookies["_session.legacy.sig"];
      if (!cookieSessionLegacySignature) {
        res
          .status(400)
          .send({ message: `Mising cookie with name '_session.legacy.sig'` });
        return;
      }
      if (
        cookieSessionLegacySignature !==
        oidcData.session?.sessionLegacySignature
      ) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_session.legacy.sig' (${cookieSessionLegacySignature}) does not match saved one`
          });
        return;
      }

      const abortRedirectUri = `/fims/provider/interaction/${requestInteractionId}/abort`;
      const confirmRedirectUri = `/fims/provider/interaction/${requestInteractionId}/confirm`;
      res.status(200).send(`
    <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
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

    res
      .status(500)
      .send({
        message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
      });
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "get",
  "/fims/provider/interaction/:id/confirm",
  (req, res) => {
    // TODO
    //res.status(200).send("<html><head><title>FIMS Provider</title></head><body><div>WiP</div></body></html>");
  },
  () => Math.random() * 2500
);

addHandler(
  fimsProviderRouter,
  "get",
  "/fims/provider/interaction/:id/abort",
  (req, res) => {
    // TODO
    //res.status(200).send("<html><head><title>FIMS Provider</title></head><body><div>WiP</div></body></html>");
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
      res
        .status(400)
        .send({
          message: `Interaction Id (${requestInteractionId}) not found`
        });
      return;
    }

    const cookies = req.cookies;
    if (!validateFIMSToken(cookies, res)) {
      return;
    }

    if (currentOidcData.firstInteraction) {
      // Cookie validation
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const cookieInteractionResume = cookies["_interaction_resume"];
      if (!cookieInteractionResume) {
        res
          .status(400)
          .send({ message: `Missing cookie with name '_interaction_resume'` });
        return;
      }
      if (
        cookieInteractionResume !==
        currentOidcData.firstInteraction?.interactionResume
      ) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction_resume' (${cookieInteractionResume}) does not match saved one`
          });
        return;
      }

      const cookieInteractionResumeSignature =
        cookies["_interaction_resume.sig"];
      if (!cookieInteractionResumeSignature) {
        res
          .status(400)
          .send({
            message: `Mising cookie with name '_interaction_resume.sig'`
          });
        return;
      }
      if (
        cookieInteractionResumeSignature !==
        currentOidcData.firstInteraction?.interactionResumeSignature
      ) {
        res
          .status(400)
          .send({
            message: `Value of cookie with name '_interaction_resume.sig' (${cookieInteractionResumeSignature}) does not match saved one`
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
      const sessionData: SessionData = {
        session: v4(),
        sessionSignature: v4(),
        sessionLegacy: v4(),
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
        .cookie("_interaction", interactionData.interaction, {
          path: `/fims/provider/interaction/${interactionId}`,
          expires: interactionCookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie("_interaction.sig", interactionData.interactionSignature, {
          path: `/fims/provider/interaction/${interactionId}`,
          expires: interactionCookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie("_interaction_resume", interactionData.interactionResume, {
          path: `/fims/provider/oauth/authorize/${interactionId}`,
          expires: interactionCookieExpirationTime,
          sameSite: "lax",
          httpOnly: true
        })
        .cookie(
          "_interaction_resume.sig",
          interactionData.interactionResumeSignature,
          {
            path: `/fims/provider/oauth/authorize/${interactionId}`,
            expires: interactionCookieExpirationTime,
            sameSite: "lax",
            httpOnly: true
          }
        )
        .cookie("_session", sessionData.session, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: "none",
          httpOnly: true
        })
        .cookie("_session.sig", sessionData.sessionSignature, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          sameSite: "none",
          httpOnly: true
        })
        .cookie("_session.legacy", sessionData.sessionLegacy, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          httpOnly: true
        })
        .cookie("_session.legacy.sig", sessionData.sessionLegacySignature, {
          path: `/fims/provider`,
          expires: sessionCookieExpirationTime,
          httpOnly: true
        })
        .redirect(303, interactionRedirectUri);
      return;
    } else if (currentOidcData.secondInteraction) {
      // TODO
    }

    res
      .status(500)
      .send({
        message: `Internal inconsistency for Interaction Id (${requestInteractionId})`
      });
  },
  () => Math.random() * 2500
);

// res.status(200).send("<html><head><title>FIMS Provider</title></head><body><div>WiP</div></body></html>");

const validateFIMSToken = (cookies: Record<string, unknown>, res: Response) => {
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
    res
      .status(401)
      .send({
        message: `'${fimsTokenCookieName}' with value (${requestFimsTokenString}) does not match`
      });
    return false;
  }
  return true;
};
