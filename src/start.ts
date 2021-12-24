import chalk from "chalk";
import child_process from "child_process";
import { cli } from "cli-ux";
import figlet from "figlet";
import { fromNullable } from "fp-ts/lib/Option";
import { ioDevServerConfig } from "./config";
import { routes } from "./payloads/response";
import { createMockServer } from "./server";
import { readFileAsJSON } from "./utils/file";
import { interfaces, serverHostname, serverPort } from "./utils/server";
import * as O from "fp-ts/lib/Option";
import { Millisecond } from "@pagopa/ts-commons/lib/units";

import { bpd } from "./routers/features/bdp";
import { bpdAward } from "./routers/features/bdp/award";
import { bpdRanking } from "./routers/features/bdp/ranking/v1";
import { bpdRankingV2 } from "./routers/features/bdp/ranking/v2";
import { bpdWinningTransactionsV1 } from "./routers/features/bdp/winning-transactions/v1";
import { bpdWinningTransactionsV2 } from "./routers/features/bdp/winning-transactions/v2";
import { bonusVacanze } from "./routers/features/bonus-vacanze";
import { cgnRouter } from "./routers/features/cgn";
import { cgnGeoRouter } from "./routers/features/cgn/geocoding";
import { cgnMerchantsRouter } from "./routers/features/cgn/merchants";
import { euCovidCertRouter } from "./routers/features/eu_covid_cert";
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

// read package.json to print some info
const packageJson = readFileAsJSON("./package.json");

const app = createMockServer({
  delay: O.some(ioDevServerConfig.global.delay as Millisecond),
  logger: true,
  routers: [
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
    svRouter
  ]
});

app.listen(serverPort, serverHostname, async () => {
  child_process.exec("git branch --show-current", (err, stdout) => {
    console.log(
      chalk.blue(
        `running on git branch "${chalk.bgRedBright(stdout.replace("\n", ""))}"`
      )
    );

    cli.table([...routes], {
      method: {
        minWidth: 6,
        header: "method"
      },
      path: {
        header: "path"
      },
      description: {
        header: "description",
        get(row): any {
          return (
            fromNullable(row.description)
              // tslint:disable-next-line:no-nested-template-literals
              .map(d => `(${d})`)
              .getOrElse("")
          );
        }
      }
    });
    console.log(
      chalk.bgBlue(chalk.white(figlet.textSync(packageJson.pretty_name)))
    );
    console.log(
      chalk.bgBlack(
        chalk.green(
          `\n${packageJson.pretty_name} is running on\n${Object.keys(interfaces)
            .map(
              ni =>
                // tslint:disable-next-line:no-nested-template-literals
                `- ${chalk.underline(`http://${interfaces[ni]}:${serverPort}`)}`
            )
            .join("\n")}`
        )
      )
    );
  });
});
