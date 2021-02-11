// fiscalCode used within the client communication
import { Millisecond } from "italia-ts-commons/lib/units";
import * as path from "path";

export const isTestEnv = process.env.NODE_ENV === "test";
export const fiscalCode = "TAMMRA80A41H501Y";
export const staticContentRootPath = "/static_contents";
export const assetsFolder = path.resolve(".") + "/assets";
export const globalDelay = 0 as Millisecond;
export const shouldShuffle = false;
// services
export const servicesNumber = 15;
