import { validatePayload } from "../utils/validator";
import { ServerInfo } from "../generated/definitions/backend/ServerInfo";

const info = { minAppVersion: "0.0.0", version: "2.1.2" };
export const backendInfo = validatePayload(ServerInfo, info);
