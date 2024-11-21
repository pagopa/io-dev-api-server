export type OIdCData = {
  id: () => string;
  relyingPartyId: string;
  state: string;
  nonce: string;
  scopes: ReadonlyArray<string>;
  redirectUri: string;
  firstInteraction?: InteractionData;
  secondInteraction?: InteractionData;
  session?: SessionData;
};

export type InteractionData = {
  interaction: string;
  interactionSignature: string;
  interactionResume: string;
  interactionResumeSignature: string;
};

export type SessionData = {
  session: string;
  sessionSignature: string;
  sessionLegacy: string;
  sessionLegacySignature: string;
};

export type OIDCErrorCodes =
  | "unauthorized_client"
  | "access_denied"
  | "unsupported_response_type"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable";
