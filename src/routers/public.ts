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
  res.json([
    {
      name: "Croce Rossa Italiana",
      reason: "Donazione Emergenza Ucraina",
      web_site: "https://cri.it/emergenzaucraina/",
      base64Logo: "/9j/4AAQSk",
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
      base64Logo: "/9j/4AAQSkZJR",
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
