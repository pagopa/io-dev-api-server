import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { validatePayload } from "../../src/utils/validator";

const info = { minAppVersion: "2.0.0", version: "2.1.2" };
export const backendInfo = validatePayload(ServerInfo, info);
