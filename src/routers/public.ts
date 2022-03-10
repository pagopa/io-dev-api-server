/**
 * this router serves all public API (those ones don't need session)
 */
import { Router } from "express";
import { ioDevServerConfig } from "../config";
import { backendInfo } from "../payloads/backend";
import {
  errorRedirectUrl,
  loginSessionToken,
  loginWithToken
} from "../payloads/login";
import { addHandler } from "../payloads/response";
import { sendFile } from "../utils/file";
import { resetBpd } from "./features/bdp";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetCgn } from "./features/cgn";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";

export const publicRouter = Router();

addHandler(publicRouter, "get", "/login", (req, res) => {
  if (req.query.authorized === "1" || ioDevServerConfig.global.autoLogin) {
    res.redirect(loginWithToken);
    return;
  }
  if (req.query.error) {
    res.redirect(`${errorRedirectUrl}${req.query.error}`);
    return;
  }
  sendFile("assets/html/login.html", res);
});

addHandler(publicRouter, "get", "/assets/imgs/how_to_login.png", (_, res) => {
  sendFile("assets/imgs/how_to_login.png", res);
});

addHandler(publicRouter, "post", "/logout", (_, res) => {
  res.status(200).send({ message: "ok" });
});

addHandler(publicRouter, "get", "/info", (_, res) => res.json(backendInfo));

// ping (no longer needed since actually app disables network status checking)
addHandler(publicRouter, "get", "/ping", (_, res) => res.send("ok"));

// test login
addHandler(publicRouter, "post", "/test-login", (_, res) =>
  res.json({ token: loginSessionToken })
);

addHandler(publicRouter, "get", "/paywebview", (_, res) => {
  sendFile("assets/imgs/how_to_login.png", res);
});

// it should be useful to reset some states
addHandler(publicRouter, "get", "/reset", (_, res) => {
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

addHandler(publicRouter, "get", "/donate", (req, res) => {
  sendFile("assets/html/donate.html", res);
});

addHandler(publicRouter, "get", "/donations/availabledonations", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const base64Logo =
    "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";
  res.json([
    {
      name: "Croce Rossa Italiana",
      reason: "Donazione Emergenza Ucraina",
      web_site: "https://cri.it/emergenzaucraina/",
      base64Logo,
      cf: "11111111111",
      paymentDescription: "desc11111111111",
      companyName: "company Croce Rossa Italiana",
      officeName: "office Croce Rossa Italiana ",
      slices: [
        {
          idDonation: "00",
          amount: 500,
          nav: "300001646728922478"
        },
        {
          idDonation: "01",
          amount: 1000,
          nav: "300011646728922494"
        },
        {
          idDonation: "02",
          amount: 2000,
          nav: "300021646728922494"
        },
        {
          idDonation: "03",
          amount: 5000,
          nav: "300031646728922494"
        },
        {
          idDonation: "04",
          amount: 10000,
          nav: "300041646728922494"
        },
        {
          idDonation: "05",
          amount: 20000,
          nav: "300051646728922494"
        }
      ]
    },
    {
      name: "Basilica minore di Santa maria in Sofia",
      reason: "Donazione sostenio Ucraina",
      web_site: "https://bmsms.it/sostegnoucraina/",
      base64Logo,
      cf: "22222222222",
      paymentDescription: "desc222222",
      companyName: "company Basilica minore di Santa maria in Sofia",
      officeName: "office Basilica minore di Santa maria in Sofia ",
      slices: [
        {
          idDonation: "06",
          amount: 500,
          nav: "300061646728922494"
        },
        {
          idDonation: "07",
          amount: 1000,
          nav: "300071646728922494"
        },
        {
          idDonation: "08",
          amount: 2000,
          nav: "300081646728922494"
        },
        {
          idDonation: "09",
          amount: 5000,
          nav: "300091646728922494"
        },
        {
          idDonation: "10",
          amount: 10000,
          nav: "300101646728922494"
        },
        {
          idDonation: "11",
          amount: 20000,
          nav: "300111646728922494"
        }
      ]
    }
  ]);
});
