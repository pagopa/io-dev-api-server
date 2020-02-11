import bodyParser from "body-parser";
import { Application } from "express";
import express, { Response } from "express";
import fs from "fs";
import morgan from "morgan";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";
import { backendInfo } from "./payloads/backend";
import { notFound } from "./payloads/error";
import { loginWithToken } from "./payloads/login";
import {
  getMessageWithContent,
  getMessageWithoutContentList
} from "./payloads/message";
import { municipality } from "./payloads/municipality";
import {
  getPaymentActivationsPostResponse,
  getPaymentRequestsGetResponse,
  paymentData,
  getPaymentActivationsGetResponse,
  getPaymentResponse,
  getPspList,
  getTransactionResponseFirst,
  getTransactionResponseSecond,
  getPayResponse
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
import { getTransactions, getWallets, sessionToken, getValidWalletResponse } from "./payloads/wallet";
import { validatePayload } from "./utils/validator";

// fiscalCode used within the client communication
export const fiscalCode = "RSSMRA83A12H501D";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
// create express server
const app: Application = express();
// set middlewares
// if you want to add a delay in your server, use delayer (utils/delay_middleware)

// Create a temporany db
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.db3');
db.serialize(function() {  
	db.run("CREATE TABLE IF NOT EXISTS payments (idTransaction TEXT PRIMARY KEY, status TEXT)");  
});

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

export const services = getServices(10);
export const messages = getMessageWithoutContentList(20, services, fiscalCode);
export const messagesWithContent = messages.payload.items.map((msg, idx) => {
  const now = new Date();
  // all messages have a due date 1 month different from each other
  const dueDate = new Date(now.setMonth(now.getMonth() + idx));
  return getMessageWithContent(
    fiscalCode,
    services[idx % services.length].service_id,
    msg.id,
    dueDate
  );
});
export const servicesTuple = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);
export const staticContentRootPath = "/static_contents";

/** wallet content */
export const wallets = getWallets();
export const transactions = getTransactions(5);
app.get("/wallet/v1/users/actions/start-session", (_, res) => {
  res.json(sessionToken);
});
app.get("/wallet/v1/wallet", (_, res) => {
  res.json(wallets);
});
app.get("/wallet/v1/transactions", (_, res) => {
  res.json(transactions);
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
  // wallet with id 22222 is the favourite one
  req.query.paymentType === "CREDIT_CARD";
  req.query.idPayment === "ca7d9be4-7da1-442d-92c6-d403d7361f65";
  req.query.idWallet === "22222";
  res.json(pspList);
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
let statusTransaction = "";
app.get(`/wallet/v1/transactions/${payRes.data?.orderNumber}`, (_, res) => {
  // Check status transaction
  db.serialize(function() {  
    db.all(
      "SELECT * from payments WHERE idTransaction = " + payRes.data?.orderNumber,
      function(err: any, rows: any) {
        if (err) {
          console.log(err);
        } else {
          if (rows.length > 0) {
            statusTransaction = rows[0].status;
          }
        }
      }
    );
  });
  // Change response if not auth
  if (statusTransaction !== "Da autorizzare") {
    db.serialize(function() {  
      db.run("INSERT OR REPLACE INTO payments VALUES ('"+payRes.data?.orderNumber+"','"+transRespFirst.data?.statusMessage +"')");
    });
    res.json(transRespFirst);
  } else {
    db.serialize(function() {  
      db.run("INSERT OR REPLACE INTO payments VALUES ('"+payRes.data?.orderNumber+"','"+transRespSecond.data?.statusMessage +"')");
    });
    res.json(transRespSecond);
  }
});

app.delete(
  `/wallet/v1/payments/${paymentData.idPagamento}/actions/delete`,
  (_, res) => {
    res.status(200);
  }
);

app.put(
  `/wallet/v1/wallet/22222`,
  (_, res) => {
    res.json(getValidWalletResponse);
  }
);

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

responseHandler
  .addHandler("get", "/session", session)
  .addHandler("get", "/profile", getProfile(fiscalCode))
  .addHandler("put", "/installations/:installationID", getSuccessResponse())
  .addCustomHandler("post", "/profile", req => {
    // the server profile is merged with
    // the one coming from request. Furthermore this profile's version is increased by 1
    const currentProfile = getProfile(fiscalCode).payload;
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
