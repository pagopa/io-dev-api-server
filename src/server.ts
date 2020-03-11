import bodyParser from "body-parser";
import { Application } from "express";
import express, { Response } from "express";
import fs from "fs";
import ip from "ip";
import morgan from "morgan";
import { LocalStorage } from "node-localstorage";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";
import { Wallet } from "../generated/definitions/pagopa/Wallet";
import { WalletListResponse } from "../generated/definitions/pagopa/WalletListResponse";
import { backendInfo } from "./payloads/backend";
import { notFound } from "./payloads/error";
import { loginWithToken } from "./payloads/login";
import {
  getMessageWithContent,
  getMessageWithoutContentList
} from "./payloads/message";
import { municipality } from "./payloads/municipality";
import {
  getPaymentActivationsGetResponse,
  getPaymentActivationsPostResponse,
  getPaymentRequestsGetResponse,
  getPaymentResponse,
  getPaymentStatus,
  getPayResponse,
  getPspList,
  getTransactionResponseFirst,
  getTransactionResponseSecond,
  getValidPsp,
  paymentData,
  setPayment
} from "./payloads/payment";
import { getProfile } from "./payloads/profile";
import { ResponseHandler } from "./payloads/response";
import {
  getServiceMetadata,
  getServices,
  getServicesByScope,
  getServicesTuple
} from "./payloads/service";
import { session } from "./payloads/session";
import { getSuccessResponse } from "./payloads/success";
import { userMetadata } from "./payloads/userMetadata";
import {
  getTransactions,
  getValidActionPayCC,
  getValidFavouriteResponse,
  getValidWalletCCResponse,
  getValidWalletResponse,
  getWallet,
  getWalletArray,
  sessionToken
} from "./payloads/wallet";
import { paymentItem, settings } from "./settings";
import { validatePayload } from "./utils/validator";

// fiscalCode used within the client communication
export const fiscalCode = "RSSMRA83A12H501D";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
// create express server
const app: Application = express();
// set middlewares
// if you want to add a delay in your server, use delayer (utils/delay_middleware)
// app.use(delayer(3000 as Millisecond));

// localStorage settings and method
const localStorage = new LocalStorage("./scratch");

/**
 * Wallets
 */

// tslint:disable-next-line: readonly-array
const wallets: Wallet[] = [getWallet(1111), getWallet(2222)];

localStorage.setItem("wallets", JSON.stringify({ wallets }));

/**
 * Payments
 */

localStorage.setItem("payments", JSON.stringify({ payments: [] }));

// set middleware logging
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
app.use(bodyParser.json());
const responseHandler = new ResponseHandler(app);

app.get("/", (_, res) => {
  res.send(`Hi. This is ${packageJson.name}`);
});

app.get("/login", (_, res) => {
  res.redirect(loginWithToken);
});
app.post("/logout", (_, res) => {
  res.status(200).send("ok");
});

app.get("/info", (_, res) => {
  res.json(backendInfo);
});

app.get("/ping", (_, res) => {
  res.send("ok");
});

export const services = getServices(settings.servicesNumber);
export const messages = getMessageWithoutContentList(
  settings.messagesNumber,
  services,
  fiscalCode
);
export const messagesWithContent = messages.payload.items.map((msg, idx) => {
  const now = new Date();
  // all messages have a due date 1 month different from each other
  const dueDate = new Date(now.setMonth(now.getMonth() + idx));
  return getMessageWithContent(
    fiscalCode,
    services[idx % services.length].service_id,
    msg.id,
    dueDate,
    idx
  );
});
export const servicesTuple = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);
export const staticContentRootPath = "/static_contents";

/** wallet content */
export const transactions = getTransactions(5);

app.get("/wallet/v1/users/actions/start-session", (_, res) => {
  res.json(sessionToken);
});

app.get("/wallet/v1/wallet", (_, res) => {
  const data = {
    data: getWalletArray()
  };
  res.json(validatePayload(WalletListResponse, data));
});

// the id card 2222 doesn't can be deleted
app.delete("/wallet/v1/wallet/:id_card", (req, res) => {
  if (req.params.id_card !== "2222") {
    // tslint:disable-next-line: readonly-array
    const data: Wallet[] = getWalletArray();
    const itemToRemove = data.filter((element: Wallet) => {
      return `${element.idWallet}` === req.params.id_card;
    });
    if (itemToRemove.length !== 0) {
      const indexOfItemToRemove = data.indexOf(itemToRemove[0]);
      if (data.splice(indexOfItemToRemove, 1)) {
        localStorage.setItem("wallets", JSON.stringify({ wallets: data }));
        res.status(200).send("ok");
        return;
      } else {
        res.status(404).send("i can't delete this item");
      }
    } else {
      res.status(404).send("item not found");
    }
  } else {
    res.status(404).send("error");
  }
});

app.get("/wallet/v1/transactions", (_, res) => {
  res.json(transactions);
});

// API called when a new card is added
app.post("/wallet/v1/wallet/cc", (req, res) => {
  const data = getWalletArray();
  const pan = req.body.data.creditCard.pan;
  const endPan = pan.substr(pan.length - 4);
  // tslint:disable-next-line: radix
  const idWallet = parseInt(endPan);
  const holder = req.body.data.creditCard.holder;
  const expireMonth = req.body.data.creditCard.expireMonth;
  const expireYear = req.body.data.creditCard.expireYear;
  // tslint:disable-next-line: restrict-plus-operands
  data.push(getWallet(idWallet, holder, expireMonth, expireYear));
  localStorage.setItem("wallets", JSON.stringify({ wallets: data }));

  res.json(getValidWalletCCResponse(idWallet));
});

app.post("/wallet/v1/payments/cc/actions/pay", (req, res) => {
  const idWallet: number = req.body.data.idWallet;
  // tslint:disable-next-line: restrict-plus-operands
  res.json(getValidActionPayCC(idWallet));
});

app.post("/wallet/v1/wallet/:id_card/actions/favourite", (req, res) => {
  res.json(getValidFavouriteResponse(Number(req.params.id_card)));
});

app.get("/wallet/checkout", (_, res) => {
  // In query string we have
  // id = NzA5MDA0ODM0Ng==
  // sessionToken = 3m3Q2h6e8T5w9t3W8b8y1F4t2m6Q9b8d9N6h1f2H2u0g6E7m9d9E3g7w3T3b5a7I4c4h6U4n2b3Z4p3j8D6p4a5G1c4a8K3o0v8P7e0j6R5i1y2J6d0c7N9i6m0U3j9z
  res.redirect(
    `http://${ip.address()}:${
      settings.serverPort
    }/wallet/result?id=7090048555&authorizationCode=00`
  );
});

app.get("/wallet/result", (_, res) => {
  res.redirect(
    `http://${ip.address()}:${settings.serverPort}/wallet/loginMethod`
  );
});

app.get("/wallet/loginMethod", (_, res) => {
  res.status(200).send("ok");
});

/** payment content */
/* const paymentRef: string =
  paymentData.organizationFiscalCode + paymentData.paymentNoticeNumber; */
const paymentRequestsGetResponse = getPaymentRequestsGetResponse();
app.get(`/api/v1/payment-requests/:payment_ref`, (_, res) => {
  res.json(paymentRequestsGetResponse);
});

const paymentActivationsPostResponse = getPaymentActivationsPostResponse();
app.post(`/api/v1/payment-activations`, (_, res) => {
  res.json(paymentActivationsPostResponse);
});

const paymentActivationsGetResponse = getPaymentActivationsGetResponse();
app.get(
  `/api/v1/payment-activations/${paymentData.codiceContestoPagamento}`,
  (_, res) => {
    res.json(paymentActivationsGetResponse);
  }
);

const paymentResponse = getPaymentResponse();
app.get(
  `/wallet/v1/payments/${paymentData.idPagamento}/actions/check`,
  (_, res) => {
    res.json(paymentResponse);
  }
);

const pspList = getPspList();
app.get(`/wallet/v1/psps`, (req, res) => {
  // wallet with id 2222 is the favourite one
  // for create tests case with result 400
  if (
    req.query.paymentType === "CREDIT_CARD" &&
    req.query.idPayment === "ca7d9be4-7da1-442d-92c6-d403d7361f65" &&
    req.query.idWallet === "2222"
  ) {
    res.json(pspList);
  } else {
    res.status(400);
  }
});

app.get(`/wallet/v1/psps/:id_transaction`, (req, res) => {
  // tslint:disable-next-line: radix
  const id = parseInt(req.params.id_transaction);
  res.json(getValidPsp(id));
});

const payRes = getPayResponse();
app.post(
  `/wallet/v1/payments/${paymentData.idPagamento}/actions/pay`,
  (_, res) => {
    res.json(payRes);
  }
);

const transRespFirst = getTransactionResponseFirst();
const transRespSecond = getTransactionResponseSecond();

app.get(`/wallet/v1/transactions/${payRes.data?.orderNumber}`, (_, res) => {
  // Check status transaction
  const statusTransaction = getPaymentStatus(payRes.data?.orderNumber);
  setPayment(payRes.data?.orderNumber, transRespFirst.data?.statusMessage);
  // Change response if not auth
  if (statusTransaction !== "Da autorizzare") {
    res.json(transRespFirst);
  } else {
    res.json(transRespSecond);
  }
});

app.delete(`/wallet/v1/payments/:id_pagamento/actions/delete`, (_, res) => {
  res.status(200).send("ok");
});

app.put(`/wallet/v1/wallet/2222`, (_, res) => {
  res.json(getValidWalletResponse);
});

/** static contents */
app.get(`${staticContentRootPath}/services/:service_id`, (req, res) => {
  const serviceId = req.params.service_id.replace(".json", "");
  if (serviceId === "servicesByScope") {
    res.json(servicesByScope.payload);
    return;
  }
  res.json(getServiceMetadata(serviceId, servicesTuple.payload).payload);
});

const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

app.get(
  `${staticContentRootPath}/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

app.get(`${staticContentRootPath}/logos/services/:service_id`, (_, res) => {
  // ignoring service id and send always the same image
  sendFile("assets/imgs/logos/services/service_1.png", res);
});

app.get(`${staticContentRootPath}/municipalities/:A/:B/:CODE`, (_, res) => {
  res.json(municipality);
});

/** IO backend API handlers */
const currentProfile = getProfile(fiscalCode).payload;
responseHandler
  .addHandler("get", "/session", session)
  .addCustomHandler("get", "/profile", _ => {
    return { payload: currentProfile, isJson: true };
  })
  .addHandler("put", "/installations/:installationID", getSuccessResponse())
  .addCustomHandler("post", "/profile", req => {
    // the server profile is merged with
    // the one coming from request. Furthermore this profile's version is increased by 1
    const clintProfileIncresed = {
      ...req.body,
      version: parseInt(req.body.version, 10) + 1
    };
    const payload = validatePayload(InitializedProfile, {
      ...currentProfile,
      ...clintProfileIncresed
    });
    return {
      payload,
      isJson: true
    };
  })
  .addHandler("get", "/user-metadata", userMetadata)
  .addCustomHandler("post", "/user-metadata", req => {
    // simply return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  })
  // return a message
  .addHandler("get", "/messages", messages)
  // return a mock message with content (always found!)
  .addCustomHandler("get", "/messages/:id", req => {
    // retrieve the service_id from the messages list
    const msgIndex = messages.payload.items.findIndex(
      item => item.id === req.params.id
    );
    return messagesWithContent[msgIndex];
  })
  // return 10 mock services
  .addHandler("get", "/services", servicesTuple)
  /*
    //how to send "too many requests" response
    .addHandler("get", "/services", getProblemJson(429, "too many requests"))
  */
  // return a mock service with the same requested id (always found!)
  .addCustomHandler("get", "/services/:service_id", req => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );
    return { payload: service || notFound.payload };
  });

export default app;
