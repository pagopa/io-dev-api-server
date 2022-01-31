import { Plugin } from "../../../core/server";
import { SiciliaVolaAuthPlugin } from "./auth";
import { SiciliaVolaSecuredPlugin } from "./secured";
import { SiciliaVolaUnsecuredPlugin } from "./unsecured";

export const SiciliaVolaPlugin: Plugin = async ({ use }) => {
  use(SiciliaVolaAuthPlugin);
  use(SiciliaVolaSecuredPlugin);
  use(SiciliaVolaUnsecuredPlugin);
};
