import bodyParser from "body-parser";
import express, { Application } from "express";
import morgan from "morgan";
import { globalDelay } from "./global";
import { bpd } from "./routers/features/bdp";
import { bpdAward } from "./routers/features/bdp/award";
import { bpdRanking } from "./routers/features/bdp/ranking/v1";
import { bpdRankingV2 } from "./routers/features/bdp/ranking/v2";
import { bpdWinningTransactionsV1 } from "./routers/features/bdp/winning-transactions/v1";
import { bpdWinningTransactionsV2 } from "./routers/features/bdp/winning-transactions/v2";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { cgnRouter } from "./routers/features/cgn";
import { messageRouter } from "./routers/message";
import { miscRouter } from "./routers/misc";
import { paymentRouter } from "./routers/payment";
import { profileRouter } from "./routers/profile";
import { publicRouter } from "./routers/public";
import { serviceRouter } from "./routers/service";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { sessionRouter } from "./routers/session";
import { walletRouter } from "./routers/wallet";
import { wallet2Router } from "./routers/walletsV2";
import { dashboardWalletV2Router } from "./routers/walletsV2/configDashboard";
import { bancomatRouter } from "./routers/walletsV2/methods/bancomat";
import { bpayRouter } from "./routers/walletsV2/methods/bpay";
import { cobadgeRouter } from "./routers/walletsV2/methods/cobadge";
import { satispayRouter } from "./routers/walletsV2/methods/satispay";
import { delayer } from "./utils/delay_middleware";
// create express server
const app: Application = express();
// parse body request as json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// set middlewares
// if you want to add a delay in your server, use a global delayer (utils/delay_middleware)
app.use(delayer(globalDelay));
// set middleware logger
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);

[
  publicRouter,
  profileRouter,
  sessionRouter,
  messageRouter,
  serviceRouter,
  walletRouter,
  wallet2Router,
  satispayRouter,
  bpayRouter,
  bancomatRouter,
  cobadgeRouter,
  dashboardWalletV2Router,
  paymentRouter,
  servicesMetadataRouter,
  bonusVacanze,
  miscRouter,
  bpd,
  bpdAward,
  bpdRanking,
  bpdRankingV2,
  bpdWinningTransactionsV1,
  bpdWinningTransactionsV2,
  cgnRouter
].forEach(r => app.use(r));

export default app;
