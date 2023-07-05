import { v4 } from "uuid";
import { IoDevServerConfig } from "../../../types/config";

type FIMSClient = {
  clientId: string;
  redirectUris: string[];
  registeredScopes: string[];
};

const fimsClients = new Map<string, FIMSClient>();

const createFIMSClient = (_: IoDevServerConfig) => {
  const fimsClient = {
    clientId: "4",
    redirectUris: [],
    registeredScopes: []
  };
  fimsClients.set(fimsClient.clientId, fimsClient);
};

const getFIMSClient = (clientId: string) => fimsClients.get(clientId);

export default {
  createFIMSClient,
  getFIMSClient
};