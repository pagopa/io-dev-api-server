import bodyParser from "body-parser";
import { Application, Router } from "express";
import express from "express";
import morgan from "morgan";
import { bpd } from "./routers/features/bdp";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { messageRouter } from "./routers/message";
import { miscRouter } from "./routers/misc";
import { paymentRouter } from "./routers/payment";
import { profileRouter } from "./routers/profile";
import { publicRouter } from "./routers/public";
import { serviceRouter } from "./routers/service";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { sessionRouter } from "./routers/session";
import { walletRouter } from "./routers/wallet";

// create express server
const app: Application = express();
// parse body request as json
app.use(bodyParser.json());

// set middlewares
// if you want to add a delay in your server, use a global delayer (utils/delay_middleware)
// app.use(delayer(500 as Millisecond));

// set middleware logger
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);

const routers: ReadonlyArray<Router> = [
  publicRouter,
  profileRouter,
  sessionRouter,
  messageRouter,
  serviceRouter,
  walletRouter,
  paymentRouter,
  servicesMetadataRouter,
  bonusVacanze,
  miscRouter,
  bpd
];
// add routers
routers.forEach(r => app.use(r));

export default app;
