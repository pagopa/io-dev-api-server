import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { ProviderConfig } from "../types/config";

export const providerConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ProviderConfig => config.features.fims.provider;

export const baseProviderPath = () => "/fims/provider";
