export type RelyingParty = {
  id: string;
  isInternal: boolean;
  scopes: ReadonlyArray<"openid" | "profile">;
  responseType: "id_token";
  redirectUris: ReadonlyArray<string>; // TODO use relative path (i.e. compose protocol, host, port and base path dinamically)
  responseMode: "form_post";
  serviceId: string;
  displayName: string;
};

export type RelyingPartyRequest = {
  relyingPartyId: string;
  nonce: string;
  state: string;
};
