/**
 * this router serves all public API (those ones don't need session)
 */

import { backendInfo } from "../payloads/backend";

import {
  errorRedirectUrl,
  loginSessionToken,
  loginWithToken
} from "../payloads/login";

import { resetBpd } from "./features/bdp";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetCgn } from "./features/cgn";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";

import { Plugin } from "../core/server";

import * as t from "io-ts";

export const PublicPluginOptions = t.interface({
  global: t.interface({
    autoLogin: t.boolean
  })
});

export type PublicPluginOptions = t.TypeOf<typeof PublicPluginOptions>;

export const PublicPlugin: Plugin<PublicPluginOptions> = async (
  { handleRoute, sendFile },
  options
) => {
  handleRoute("get", "/login", (req, res) => {
    if (req.query.authorized === "1" || options.global.autoLogin) {
      res.redirect(loginWithToken);
      return;
    }
    if (req.query.error) {
      res.redirect(`${errorRedirectUrl}${req.query.error}`);
      return;
    }
    sendFile("assets/html/login.html", res);
  });

  handleRoute("get", "/assets/imgs/how_to_login.png", (_, res) => {
    sendFile("assets/imgs/how_to_login.png", res);
  });

  handleRoute("post", "/logout", (_, res) => {
    res.status(200).send({ message: "ok" });
  });

  handleRoute("get", "/info", (_, res) => {
    res.json(backendInfo);
  });

  handleRoute("get", "/ping", (_, res) => {
    res.send("ok");
  });

  handleRoute("post", "/test-login", (_, res) => {
    res.json({ token: loginSessionToken });
  });

  handleRoute("get", "/paywebview", (_, res) => {
    sendFile("assets/imgs/how_to_login.png", res);
  });

  handleRoute("get", "/reset", (_, res) => {
    type emptyFunc = () => void;
    const resets: ReadonlyArray<readonly [emptyFunc, string]> = [
      [resetProfile, "bonus vacanze"],
      [resetBonusVacanze, "user delete/download"],
      [resetBpd, "bdp"],
      [resetCgn, "cgn"],
      [resetWalletV2, "walletV2"]
    ];
    res.send(
      "<h2>reset:</h2>" +
        resets
          .map(r => {
            r[0]();
            return `<li>${r[1]}</li>`;
          })
          .join("<br/>")
    );
  });
};
