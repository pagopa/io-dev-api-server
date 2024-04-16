import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { RelyingPartiesConfig } from "../types/config";

export const relyingPartiesConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ReadonlyArray<RelyingPartiesConfig> => config.features.fims.relyingParties;

export const baseRelyingPartyPath = () => "/fims/relyingParty";
