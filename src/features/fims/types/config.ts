import * as t from "io-ts";

export const ProviderConfig = t.intersection([
  t.type({
    federationCookieName: t.string,
    idTokenRawPrivateKey: t.string,
    idTokenRawPublicKey: t.string,
    idTokenSigningAlgorithm: t.string,
    idTokenTTLMilliseconds: t.number,
    interactionCookieKey: t.string,
    interactionResumeCookieKey: t.string,
    interactionResumeSignatureCookieKey: t.string,
    interactionSignatureCookieKey: t.string,
    interactionTTLMilliseconds: t.number,
    sessionCookieKey: t.string,
    sessionLegacyCookieKey: t.string,
    sessionLegacySignatureCookieKey: t.string,
    sessionSignatureCookieKey: t.string,
    sessionTTLMilliseconds: t.number
  }),
  t.partial({
    ignoreFederationCookiePresence: t.boolean,
    ignoreFederationCookieValue: t.boolean,
    useLaxInsteadOfNoneForSameSiteOnSessionCookies: t.boolean
  })
]);

export const RelyingPartiesConfig = t.intersection([
  t.type({
    id: t.string,
    redirectUri: t.readonlyArray(t.string),
    scopes: t.readonlyArray(
      t.union([t.literal("openid"), t.literal("profile")])
    )
  }),
  t.partial({})
]);

export const FIMSConfig = t.intersection([
  t.type({
    provider: ProviderConfig,
    relyingParties: t.readonlyArray(RelyingPartiesConfig)
  }),
  t.partial({})
]);

export type ProviderConfig = t.TypeOf<typeof ProviderConfig>;
export type RelyingPartiesConfig = t.TypeOf<typeof RelyingPartiesConfig>;
export type FIMSConfig = t.TypeOf<typeof FIMSConfig>;
