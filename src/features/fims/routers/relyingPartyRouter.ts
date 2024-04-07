import { v4 } from "uuid";
import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { RelyingParty, RelyingPartyRequest } from "../types/relyingParty";

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
  "/fims/relyingParty/:id/landingPage",
  (req, res) => {
    initializeIfNeeded();
    const relyingPartyId = req.params.id;
    const relyingParty = relyingParties.get(relyingPartyId);
    if (!relyingParty) {
      res
        .status(404)
        .send({
          message: `Relying Party with id (${relyingPartyId}) not found`
        });
      return;
    }
    const scopes = relyingParty.scopes.join(" ");
    const relyingPartyRequest: RelyingPartyRequest = {
      id: relyingPartyId,
      nonce: v4(),
      state: v4()
    };
    if (!relyingPartyRequests.has(relyingPartyId)) {
      relyingPartyRequests.set(
        relyingPartyId,
        new Map<string, RelyingPartyRequest>()
      );
    }
    const relyingPartyRequestMap = relyingPartyRequests.get(relyingPartyId);
    relyingPartyRequestMap?.set(relyingPartyRequest.state, relyingPartyRequest);
    const fimsProviderRedirectUri = `/fims/provider/oauth/authorize?client_id=${relyingParty.id}&scope=${scopes}&response_type=${relyingParty.responseType}&redirect_uri=${relyingParty.redirectUris[0]}&response_mode=${relyingParty.responseMode}&nonce=${relyingPartyRequest.nonce}&state=${relyingPartyRequest.state}`;
    const encodedFimsProviderRedirectUri = encodeURI(fimsProviderRedirectUri);
    res.redirect(303, encodedFimsProviderRedirectUri);
  },
  () => Math.random() * 2500
);

const initializeIfNeeded = () => {
  // TODO move to config file
  if (relyingParties.size === 0) {
    relyingParties.set("1", {
      id: "1",
      redirectUris: ["http://localhost:3000/fims/relyingParty/1/redirectUri"],
      responseMode: "form_post",
      responseType: "id_token",
      scopes: ["openid", "profile"]
    });
  }
};
