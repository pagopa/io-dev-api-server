import { ParRequest } from "../../../../../generated/definitions/itwallet/eid/ParRequest";
import { ParResponse } from "../../../../../generated/definitions/itwallet/eid/ParResponse";

export const PAR_REQUEST: ParRequest = {
  response_type: "code",
  client_id: "client_id",
  code_challenge: "code_challenge",
  code_challenge_method: "code_challenge_method",
  request: "request",
  client_assertion_type: "client_assertion_type",
  client_assertion: "client_assertion"
};

export const PAR_RESPONSE: ParResponse = {
  request_uri: "urn:ietf:params:oauth:request_uri:bwc4JK-ESC0w8acc191e-Y1LTC2",
  expires_in: 60
};
