import { Millisecond } from "@pagopa/ts-commons/lib/units";
import bodyParser from "body-parser";
import express, { Application } from "express";
import morgan from "morgan";
import { ioDevServerConfig } from "./config";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { bpd } from "./routers/features/bdp";
import { bpdAward } from "./routers/features/bdp/award";
import { bpdRanking } from "./routers/features/bdp/ranking/v1";
import { bpdRankingV2 } from "./routers/features/bdp/ranking/v2";
import { bpdWinningTransactionsV1 } from "./routers/features/bdp/winning-transactions/v1";
import { bpdWinningTransactionsV2 } from "./routers/features/bdp/winning-transactions/v2";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { cdcRouter } from "./routers/features/cdc";
import { cgnRouter } from "./routers/features/cgn";
import { cgnGeoRouter } from "./routers/features/cgn/geocoding";
import { cgnMerchantsRouter } from "./routers/features/cgn/merchants";
import { euCovidCertRouter } from "./routers/features/eu_covid_cert";
import { fciRouter } from "./routers/features/fci";
import { svRouter } from "./routers/features/siciliaVola";
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
import { payPalRouter } from "./routers/walletsV3/methods/paypal";
import { delayer } from "./utils/delay_middleware";
import { idpayRouter } from "./routers/features/idpay";
import { lollipopRouter } from "./routers/features/lollipop";
import { fastLoginRouter } from "./routers/features/fastLogin";
import { fastLoginMiddleware } from "./middleware/fastLoginMiddleware";
import { walletV3Router } from "./routers/features/walletV3";
import { pnRouter } from "./features/pn/routers/routers";
// create express server
const app: Application = express();
// parse body request as json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// set middlewares
// if you want to add a delay in your server, use a global delayer (utils/delay_middleware)
app.use(delayer(ioDevServerConfig.global.delay as Millisecond));
// set middleware logger
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
app.use(errorMiddleware);
app.use(fastLoginMiddleware);

[
  publicRouter,
  profileRouter,
  sessionRouter,
  messageRouter,
  serviceRouter,
  walletRouter,
  wallet2Router,
  satispayRouter,
  payPalRouter,
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
  cgnRouter,
  cgnMerchantsRouter,
  cgnGeoRouter,
  euCovidCertRouter,
  svRouter,
  cdcRouter,
  fciRouter,
  pnRouter,
  idpayRouter,
  lollipopRouter,
  fastLoginRouter,
  walletV3Router
].forEach(r => app.use(r));

export default app;
