import { Millisecond } from "@pagopa/ts-commons/lib/units";
import bodyParser from "body-parser";
import express, { Application } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ioDevServerConfig } from "./config";
import { messageRouter } from "./features/messages/routers/messagesRouter";
import { pnRouter } from "./features/pn/routers/routers";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { fastLoginMiddleware } from "./middleware/fastLoginMiddleware";
import { cdcRouter } from "./routers/features/cdc";
import { cgnRouter } from "./routers/features/cgn";
import { cgnGeoRouter } from "./routers/features/cgn/geocoding";
import { cgnMerchantsRouter } from "./routers/features/cgn/merchants";
import { euCovidCertRouter } from "./routers/features/eu_covid_cert";
import { fastLoginRouter } from "./routers/features/fastLogin";
import { fciRouter } from "./routers/features/fci";
import { idpayRouter } from "./routers/features/idpay";
import { lollipopRouter } from "./routers/features/lollipop";
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
import { walletRouter as newWalletRouter } from "./features/payments";
import { serviceRouter as newServiceRouter } from "./features/services";
import { dashboardHomeRouter } from "./routers/configHomeDashboard/configHomeDashboard";
import { fimsProviderRouter } from "./features/fims/routers/providerRouter";
import { fimsRelyingPartyRouter } from "./features/fims/routers/relyingPartyRouter";

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
app.use(cookieParser());
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
  dashboardHomeRouter,
  paymentRouter,
  servicesMetadataRouter,
  miscRouter,
  cgnRouter,
  cgnMerchantsRouter,
  cgnGeoRouter,
  euCovidCertRouter,
  cdcRouter,
  fciRouter,
  pnRouter,
  idpayRouter,
  lollipopRouter,
  fastLoginRouter,
  newWalletRouter,
  newServiceRouter,
  fimsRelyingPartyRouter,
  fimsProviderRouter
].forEach(r => app.use(r));

export default app;
