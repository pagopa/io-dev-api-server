/**
 * this router serves all public API (those ones don't need session)
 */
import * as zlib from "zlib";
import { randomUUID } from "crypto";
import { JwkPublicKey, parseJwkOrError } from "@pagopa/ts-commons/lib/jwk";
import chalk from "chalk";
import { Response, Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as jose from "jose";
import { parseStringPromise } from "xml2js";
import { assetsFolder, ioDevServerConfig } from "../config";
import { WALLET_PAYMENT_PATH } from "../features/payments/utils/payment";
import { backendInfo } from "../payloads/backend";
import {
  AppUrlLoginScheme,
  errorRedirectUrl,
  loginLolliPopRedirect,
  redirectUrl
} from "../payloads/login";
import { WALLET_ONBOARDING_PATH } from "../features/payments/utils/onboarding";
import { addHandler } from "../payloads/response";
import { clearSessionTokens } from "../payloads/session";
import { clearAppInfo, setAppInfo } from "../persistence/appInfo";
import {
  clearEphemeralLollipopInfo,
  clearLollipopInfo,
  concretizeEphemeralInfo,
  setLollipopInfo,
  setLollipopInfoEphemeral
} from "../persistence/lollipop";
import {
  clearLoginSessionTokenInfo,
  createOrRefreshEverySessionToken,
  getLoginSessionToken,
  setSessionAuthenticationProvider,
  setSessionLoginType
} from "../persistence/sessionInfo";
import { readFileAsJSON, sendFileFromRootPath } from "../utils/file";
import {
  setProfileEmailAlreadyTaken,
  setProfileEmailValidated
} from "../persistence/profile/profile";
import { addApiAuthV1Prefix } from "../utils/strings";
import { resetCgn } from "./features/cgn";
import { isFeatureFlagWithMinVersionEnabled } from "./features/featureFlagUtils";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";

export const publicRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";
const DEFAULT_HEADER_LOLLIPOP_PUB_KEY = "x-pagopa-lollipop-pub-key";
const ISSUER_URL = "";
const REDIRECT_URI = "";
const CLIENT_ID = "";
const CLIENT_SECRET = "";
const CIE_IDP =
  "https://preproduzione.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";
const SPID_IDP = "https://idp.uat.oneid.pagopa.it";

type OidcConfig = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  [key: string]: unknown;
};

type TokenResponse = {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in?: number;
  [key: string]: unknown;
};

type OidcClaims = Record<string, unknown>;

// eslint-disable-next-line functional/no-let, no-underscore-dangle
let _config: OidcConfig | undefined;

const getOidcConfig = async (): Promise<OidcConfig> => {
  if (_config) {
    return _config;
  }

  if (!ISSUER_URL) {
    throw new Error("OIDC_ISSUER env variable is required");
  }

  const discoveryUrl = new URL(
    ".well-known/openid-configuration",
    ISSUER_URL
  ).toString();

  const response = await fetch(discoveryUrl);

  if (!response.ok) {
    throw new Error(
      `OIDC discovery failed: ${response.status} ${response.statusText}`
    );
  }

  _config = (await response.json()) as OidcConfig;
  return _config;
};

export function buildAuthorizationUrl(
  oidcConfig: OidcConfig,
  state: string,
  nonce: string,
  idpType: "CIE" | "SPID" = "SPID"
): URL {
  if (!REDIRECT_URI) {
    throw new Error("REDIRECT_URI env variable is required");
  }

  const idp = idpType === "CIE" ? CIE_IDP : SPID_IDP;
  if (!idp) {
    throw new Error("IDP env variable is required");
  }

  const authUrl = new URL(oidcConfig.authorization_endpoint);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", "openid");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("idp", idp);
  authUrl.searchParams.set("client_id", CLIENT_ID);
  return authUrl;
}

addHandler(
  publicRouter,
  "get",
  addApiAuthV1Prefix("/login"),
  async (req, res) => {
    const config = await getOidcConfig();
    setAppInfo(req);
    setSessionLoginType(req);
    setSessionAuthenticationProvider(req);

    const lollipopPublicKeyHeaderValue = req.get(
      DEFAULT_HEADER_LOLLIPOP_PUB_KEY
    );
    const lollipopHashAlgorithmHeaderValue = req.get(
      "x-pagopa-lollipop-pub-key-hash-algo"
    );
    if (!lollipopPublicKeyHeaderValue || !lollipopHashAlgorithmHeaderValue) {
      res.sendStatus(400);
      return;
    }

    const jwkPK = parseJwkOrError(lollipopPublicKeyHeaderValue);

    if (E.isLeft(jwkPK) || !JwkPublicKey.is(jwkPK.right)) {
      res.sendStatus(400);
      return;
    }

    const thumbprint = await jose.calculateJwkThumbprint(
      jwkPK.right,
      DEFAULT_LOLLIPOP_HASH_ALGORITHM
    );

    setLollipopInfoEphemeral(thumbprint, jwkPK.right);

    const state = randomUUID({ disableEntropyCache: true });
    const nonce = randomUUID({ disableEntropyCache: true });

    const authUrl = buildAuthorizationUrl(config, state, nonce, "CIE");

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: true,
      path: "/"
    };
    res.cookie("oidc_state", state, cookieOpts);
    res.cookie("oidc_nonce", nonce, cookieOpts);

    res.redirect(authUrl.href);
  }
);

// Handle OIDC callback

export async function exchangeCode(
  oidcConfig: OidcConfig,
  req: { query: Record<string, unknown>; url: string },
  expectedState: string,
  _nonce: string
): Promise<{
  tokens: TokenResponse;
  claims: OidcClaims;
}> {
  const receivedState = req.query.state as string | undefined;
  if (receivedState !== expectedState) {
    throw new Error("State mismatch: possible CSRF attack");
  }

  const code = req.query.code as string | undefined;
  if (!code) {
    throw new Error("Missing authorization code in callback");
  }

  const clientId = CLIENT_ID;
  const clientSecret = CLIENT_SECRET;

  const basicCredentials = Buffer.from(
    `${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI
  });

  const tokenResponse = await fetch(oidcConfig.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicCredentials}`
    },
    body: body.toString()
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(
      `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} — ${errorBody}`
    );
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;

  if (!tokens.id_token) {
    throw new Error("Token response missing id_token");
  }

  const claims = jose.decodeJwt(tokens.id_token) as OidcClaims;

  return { tokens, claims };
}

addHandler(publicRouter, "get", "/callback", async (req, res) => {
  try {
    const config = await getOidcConfig();

    const expectedState = req.cookies.oidc_state as string | undefined;
    const nonce = req.cookies.oidc_nonce as string | undefined;

    if (!expectedState || !nonce) {
      // TODO: da capire cosa tornare veramente
      res
        .status(400)
        .type("html")
        .send(
          "<h1>Error</h1><p>Missing session cookies. Please try logging in again.</p>"
        );
      return;
    }

    res.clearCookie("oidc_state", { path: "/" });
    res.clearCookie("oidc_nonce", { path: "/" });

    // TODO: Token exchange: use recevied tokens to authenticate user and create session
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { claims, tokens } = await exchangeCode(
      config,
      req,
      expectedState,
      nonce
    );
    concretizeEphemeralInfo();
    createOrRefreshEverySessionToken();

    const token = getLoginSessionToken() ?? "";
    const urlLoginScheme = isFeatureFlagWithMinVersionEnabled("nativeLogin")
      ? AppUrlLoginScheme.native
      : AppUrlLoginScheme.webview;
    const baseURL = `${urlLoginScheme}://${req.headers.host}`;
    const urlInstance = new URL(redirectUrl, baseURL);

    if (ioDevServerConfig.global.sendSessionTokenAsQueryParam) {
      // eslint-disable-next-line functional/immutable-data
      urlInstance.searchParams.append("token", token);
    }
    // eslint-disable-next-line functional/immutable-data
    urlInstance.hash = `token=${token}`;

    const url = urlInstance.toString();
    res.redirect(url);
    return;
  } catch (err) {
    res
      .status(500)
      .type("html")
      .send(`<h1>Authentication Error</h1><pre>${err}</pre>`);
  }
});

addHandler(publicRouter, "get", "/idp-login", (req, res) => {
  const urlLoginScheme = isFeatureFlagWithMinVersionEnabled("nativeLogin")
    ? AppUrlLoginScheme.native
    : AppUrlLoginScheme.webview;

  const baseURL = `${urlLoginScheme}://${req.headers.host}`;

  if (req.query.authorized === "1" || ioDevServerConfig.global.autoLogin) {
    concretizeEphemeralInfo();
    createOrRefreshEverySessionToken();

    const token = getLoginSessionToken() ?? "";
    const urlInstance = new URL(redirectUrl, baseURL);

    if (ioDevServerConfig.global.sendSessionTokenAsQueryParam) {
      // eslint-disable-next-line functional/immutable-data
      urlInstance.searchParams.append("token", token);
    }
    // eslint-disable-next-line functional/immutable-data
    urlInstance.hash = `token=${token}`;

    const url = urlInstance.toString();
    res.redirect(url);
    return;
  }
  if (req.query.error && typeof req.query.error === "string") {
    clearEphemeralLollipopInfo();

    const urlInstance = new URL(errorRedirectUrl, baseURL);

    if (req.query.error.includes("errorMessage:")) {
      const errorMessage = req.query.error.split(":")[1];
      // eslint-disable-next-line functional/immutable-data
      urlInstance.searchParams.append("errorMessage", errorMessage);
    } else {
      const errorCode = req.query.error;
      // eslint-disable-next-line functional/immutable-data
      urlInstance.searchParams.append("errorCode", errorCode);
    }

    const url = urlInstance.toString();
    res.redirect(url);
    return;
  }
  sendFileFromRootPath("assets/html/login.html", res);
});

addHandler(publicRouter, "get", "/error.html", (req, res) => {
  sendFileFromRootPath("assets/html/error.html", res);
});

addHandler(publicRouter, "get", WALLET_ONBOARDING_PATH, (req, res) => {
  sendFileFromRootPath("assets/wallet/wallet_onboarding.html", res);
});

addHandler(publicRouter, "get", WALLET_PAYMENT_PATH, (req, res) => {
  sendFileFromRootPath("assets/wallet/wallet_payment.html", res);
});

addHandler(publicRouter, "get", "/assets/imgs/how_to_login.png", (_, res) => {
  sendFileFromRootPath("assets/imgs/how_to_login.png", res);
});

addHandler(publicRouter, "post", addApiAuthV1Prefix("/logout"), (_, res) => {
  clearAppInfo();
  clearLollipopInfo();
  clearLoginSessionTokenInfo();
  clearSessionTokens();
  res.status(200).send({ message: "ok" });
});

addHandler(publicRouter, "get", "/info", (_, res) => res.json(backendInfo));

// test login
addHandler(
  publicRouter,
  "post",
  addApiAuthV1Prefix("/test-login"),
  async (req, res) => {
    const { password } = req.body;
    if (password === "error") {
      res.status(500).json({ token: getLoginSessionToken() });
    } else if (password === "delay") {
      setTimeout(() => {
        res.json({ token: getLoginSessionToken() });
      }, 3000);
    } else {
      const lollipopPublicKeyHeaderValue = req.get(
        DEFAULT_HEADER_LOLLIPOP_PUB_KEY
      );
      const jwkPK = parseJwkOrError(lollipopPublicKeyHeaderValue);

      if (E.isLeft(jwkPK) || !JwkPublicKey.is(jwkPK.right)) {
        res.sendStatus(400);
        return;
      }
      const thumbprint = await jose.calculateJwkThumbprint(
        jwkPK.right,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM
      );
      setLollipopInfo(thumbprint, jwkPK.right);

      createOrRefreshEverySessionToken();
      res.json({ token: getLoginSessionToken() });
    }
  }
);

addHandler(publicRouter, "get", "/paywebview", (_, res) => {
  sendFileFromRootPath("assets/imgs/how_to_login.png", res);
});

// it should be useful to reset some states
addHandler(publicRouter, "get", "/reset", (_, res) => {
  type emptyFunc = () => void;
  const resets: ReadonlyArray<readonly [emptyFunc, string]> = [
    [resetProfile, "bonus vacanze"],
    [resetCgn, "cgn"],
    [resetWalletV2, "walletV2"]
  ];
  res.send(
    "<h2>reset:</h2>" +
      resets
        .map(r => {
          r[0]();
          return `<li>${r[1]}</li>`;
        })
        .join("<br/>")
  );
});

addHandler(publicRouter, "get", "/donate", (req, res) => {
  sendFileFromRootPath("assets/html/donate.html", res);
});

addHandler(publicRouter, "get", "/donations/availabledonations", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(readFileAsJSON(assetsFolder + "/data/availableDonations.json"));
});

// TEMP disabled during demo, to avoid confusion with the real login flow
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleLollipopLoginRedirect = (
  res: Response,
  samlRequest: string,
  thumbprint?: string
) => {
  const base64EncodedSAMLReq = zlib
    .deflateRawSync(samlRequest)
    .toString("base64");
  void debugSamlRequestIfNeeded(base64EncodedSAMLReq, thumbprint);

  const redirectUrl = `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(
    base64EncodedSAMLReq
  )}`;
  res.redirect(redirectUrl);
};

const debugSamlRequestIfNeeded = async (
  samlReq: string,
  thumbprint?: string
) => {
  if (!ioDevServerConfig.global.logSAMLRequest) {
    return;
  }

  const decoded = decodeURIComponent(samlReq);

  const deflated = zlib
    .inflateRawSync(Buffer.from(decoded, "base64"))
    .toString();

  // eslint-disable-next-line no-console
  console.log(chalk.bgBlack(chalk.green(`Deflated samlReq: ${deflated}`)));

  const xmlToJson = await parseStringPromise(deflated);

  const authnRequest = xmlToJson["samlp:AuthnRequest"];
  if (authnRequest) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.bgBlack(
        chalk.green(`Authn Request Algorithm-Id: ${authnRequest.$.ID}`)
      )
    );
  }
  if (thumbprint) {
    // eslint-disable-next-line no-console
    console.log(chalk.bgBlack(chalk.green(`Stored Thumbprint: ${thumbprint}`)));
  }
};

addHandler(publicRouter, "post", "/validate-profile-email", (req, res) => {
  if (req.body && req.body.value !== undefined) {
    setProfileEmailValidated(req.body.value);
    res.status(200).send({ message: "OK" });
  } else {
    res.status(500).send({ message: "KO" });
  }
});

addHandler(publicRouter, "post", "/set-email-already-taken", (req, res) => {
  if (req.body && req.body.value !== undefined) {
    setProfileEmailAlreadyTaken(req.body.value);
    res.status(200).send({ message: "OK" });
  } else {
    res.status(500).send({ message: "KO" });
  }
});
