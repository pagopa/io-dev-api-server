export type RelyingParty = {
  id: string;
  scopes: ReadonlyArray<"openid" | "profile">;
  responseType: "id_token";
  redirectUris: ReadonlyArray<string>; // TODO use relative path (i.e. compose protocol, host, port and base path dinamically)
  responseMode: "form_post";
  serviceId: string;
  displayName: string;
  // TODO failure callbackUrl
  // TODO programmatic flow flag
};

export type RelyingPartyRequest = {
  relyingPartyId: string;
  nonce: string;
  state: string;
};
