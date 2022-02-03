import { Plugin } from "../core/server";

export const MiscPlugin: Plugin = async ({ handleRoute, sendFile }) => {
  handleRoute("get", "/myportal_playground.html", (_, res) => {
    sendFile("assets/html/myportal_playground.html", res);
  });
};
