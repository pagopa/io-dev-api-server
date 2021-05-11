// fiscalCode used within the client communication
import { Millisecond } from "italia-ts-commons/lib/units";
import * as path from "path";

export const fiscalCode = "TAMMRA80A41H501I";
export const profile = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555",
  spid_email: "maria.giovanna.rossi@spid-email.it",
  email: "maria.giovanna.rossi@email.it"
};
export const staticContentRootPath = "/static_contents";
export const assetsFolder = path.resolve(".") + "/assets";
export const globalDelay = 0 as Millisecond;
export const shouldShuffle = false;
// services
export const servicesNumber = 15;
