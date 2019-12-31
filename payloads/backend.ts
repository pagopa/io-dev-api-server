import { ServerInfo } from "../generated/definitions/backend/ServerInfo";
import { validatePayload } from "../utils/validator";

const info = { minAppVersion: "0.0.0", version: "2.1.2" };
export const backendInfo = validatePayload(ServerInfo, info);
