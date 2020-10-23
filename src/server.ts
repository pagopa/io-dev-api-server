import bodyParser from "body-parser";
import { Application, Router } from "express";
import express from "express";
import morgan from "morgan";
import { staticContentRootPath } from "./global";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { messageRouter } from "./routers/message";
import { miscRouter } from "./routers/misc";
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

const routers: ReadonlyArray<readonly [Router, string?]> = [
  [publicRouter],
  [profileRouter],
  [sessionRouter],
  [messageRouter],
  [serviceRouter],
  [walletRouter],
  [servicesMetadataRouter, staticContentRootPath],
  [bonusVacanze],
  [miscRouter]
];
// add routers
routers.forEach(r => app.use(r[1] || "", r[0]));

export default app;
