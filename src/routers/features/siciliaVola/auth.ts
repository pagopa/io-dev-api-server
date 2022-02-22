import * as faker from "faker";
import { Plugin } from "../../../core/server";
import { addApiV1Prefix } from "../../../utils/strings";

const addPrefix = (path: string) => addApiV1Prefix(`/mitvoucher/auth${path}`);

export const SiciliaVolaAuthPlugin: Plugin = async ({
  handleRoute,
  getRandomValue
}) => {
  /**
   * Get the mit auth token
   */
  handleRoute("get", addPrefix("/token"), (_, res) =>
    res.json({
      token: getRandomValue("svAuthToken", faker.datatype.uuid())
    })
  );
};
