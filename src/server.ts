import bodyParser from "body-parser";
import { Application } from "express";
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
// add routers
app.use(bonusVacanze);
app.use(staticContentRootPath, servicesMetadataRouter);
app.use(publicRouter);
app.use(miscRouter);
app.use(walletRouter);
app.use(profileRouter);
app.use(sessionRouter);
app.use(messageRouter);
app.use(serviceRouter);

export default app;
