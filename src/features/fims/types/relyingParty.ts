export type RelyingParty = {
  id: string;
  scopes: ReadonlyArray<"openid" | "profile">;
  responseType: "id_token";
  redirectUris: ReadonlyArray<string>;
  responseMode: "form_post";
};

export type RelyingPartyRequest = {
  relyingPartyId: string;
  nonce: string;
  state: string;
};
