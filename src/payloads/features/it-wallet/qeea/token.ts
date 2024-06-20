import { TokenResponse } from "../../../../../generated/definitions/itwallet/qeea/TokenResponse";

export const TOKEN_RESPONSE: TokenResponse = {
  access_token:
    "eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImM5NTBjMGU2ZmRlYjVkZTUwYTUwMDk2YjI0N2FmMDNjIn0.eyJpc3MiOiJodHRwczovL2VpZC1wcm92aWRlci53YWxsZXQuaXB6cy5pdCIsInN1YiI6ImQ0ZTBiYjM4N2FhMjU1NmZmMzA2OTI1ZmRmYjlhNzY1IiwiYXVkIjoiaHR0cHM6Ly9laWQtcHJvdmlkZXIud2FsbGV0LmlwenMuaXQvY3JlZGVudGlhbCIsImlhdCI6MTcxNTg0MjU2MCwiZXhwIjoxNzc4OTE0NTYwLCJqdGkiOiJmOTY1NWNlYi1jNjVjLTQwMjUtOTM3OC1iNjY3MmI2MTQ5YmciLCJjbGllbnRfaWQiOiI0N2I5ODIzNjk3OTFkMDgwMDNhNzI4M2YwNTljYjBkMSIsImNuZiI6eyJqa3QiOiI5NTE1NzRhZWUxYmI3OTA3YWUxZWMzMTA5ZGIyYjIyNSJ9fQ.d8Dd-pn2s3AlTX-CZltIlCDZhy6wdNJBUVs0b1S5hDtXdYIqlkqCs-6k-sXDoV0Uw3aUmM2m-slQM80lBkJfZQ",
  token_type: "DPoP",
  expires_in: 3600,
  c_nonce: "ts_EtUQs0ieiIS1NYNBHEQSoy3ct4gpy-4FZKwHilkY",
  c_nonce_expires_in: 86400,
  authorization_details: [
    {
      type: "openid_credential",
      credential_configuration_id: "PersonIdentificationData"
    }
  ]
};
