import { createServer } from "./core/server";

import { PublicPlugin } from "./routers/public";
import { ProfilePlugin } from "./routers/profile";
import { SessionPlugin } from "./routers/session";
import { ServicePlugin } from "./routers/service";
import { ServiceMetadataPlugin } from "./routers/services_metadata";
import { MiscPlugin } from "./routers/misc";
import { MessagePlugin } from "./routers/message";
import { PaymentPlugin } from "./routers/payment";

import { WalletPlugin } from "./routers/wallet";
import { WalletV2Plugin } from "./routers/walletsV2";
import { WalletV2DashboardPlugin } from "./routers/walletsV2/configDashboard";
import { SatispayPlugin } from "./routers/walletsV2/methods/satispay";
import { PayPalPlugin } from "./routers/walletsV3/methods/paypal";
import { BANCOMATPlugin } from "./routers/walletsV2/methods/bancomat";
import { BANCOMATPayPlugin } from "./routers/walletsV2/methods/bpay";
import { CobadgePlugin } from "./routers/walletsV2/methods/cobadge";

import { BonusVacanzePlugin } from "./routers/features/bonus-vacanze";

import { EUCovidCertPlugin } from "./routers/features/eu_covid_cert";

import { CGNPlugin } from "./routers/features/cgn";
import { CGNMerchantsPlugin } from "./routers/features/cgn/merchants";
import { CGNGeocodingPlugin } from "./routers/features/cgn/geocoding";

import { SiciliaVolaPlugin } from "./routers/features/siciliaVola";

import { BPDPlugin } from "./routers/features/bdp";
import { BPDAwardPlugin } from "./routers/features/bdp/award";
import { BPDRankingV1Plugin } from "./routers/features/bdp/ranking/v1";
import { BPDRankingV2Plugin } from "./routers/features/bdp/ranking/v2";
import { BPDWinningTransactionsV1Plugin } from "./routers/features/bdp/winning-transactions/v1";
import { BPDWinningTransactionsV2Plugin } from "./routers/features/bdp/winning-transactions/v2";

import { IoDevServerConfig } from "./types/config";

export const createIODevServer = (config: IoDevServerConfig) => {
  const server = createServer({
    logger: true
  });

  server
    .use(ServicePlugin, {
      services: {
        response: config.services.response,
        national: config.services.national,
        local: config.services.local
      }
    })
    .after(() => {
      server.use(ServiceMetadataPlugin);
      server.use(MessagePlugin, {
        profile: {
          attrs: config.profile.attrs
        },
        messages: config.messages
      });
    });

  server.use(PublicPlugin, {
    global: {
      autoLogin: config.global.autoLogin
    }
  });

  server
    .use(ProfilePlugin, {
      profile: config.profile
    })
    .after(() => {
      server.use(WalletPlugin, {
        wallet: {
          onboardingCreditCardOutCode:
            config.wallet.onboardingCreditCardOutCode,
          shuffleAbi: config.wallet.shuffleAbi,
          payment: config.wallet.payment
        }
      });

      server
        .use(WalletV2Plugin, {
          wallet: {
            methods: config.wallet.methods
          }
        })
        .after(() => {
          server.use(WalletV2DashboardPlugin, {
            wallet: {
              methods: config.wallet.methods
            }
          });

          server.use(SatispayPlugin);
          server.use(PayPalPlugin);
          server.use(BANCOMATPlugin);
          server.use(BANCOMATPayPlugin);
          server.use(CobadgePlugin);
        });
    });

  server.use(SessionPlugin);

  server.use(MiscPlugin, {
    IODevServerConfig: config
  });

  server.use(PaymentPlugin, {
    profile: {
      attrs: config.profile.attrs
    },
    wallet: {
      paymentOutCode: config.wallet.paymentOutCode,
      onboardingCreditCardOutCode: config.wallet.onboardingCreditCardOutCode,
      verificaError: config.wallet.verificaError
    }
  });

  server.use(BonusVacanzePlugin);
  server.use(EUCovidCertPlugin);

  server.use(CGNPlugin);
  server.use(CGNMerchantsPlugin);
  server.use(CGNGeocodingPlugin);

  server.use(SiciliaVolaPlugin);

  server.use(BPDPlugin, {
    profile: {
      attrs: config.profile.attrs
    }
  });
  server.use(BPDAwardPlugin);
  server.use(BPDRankingV1Plugin);
  server.use(BPDRankingV2Plugin);
  server.use(BPDWinningTransactionsV1Plugin);
  server.use(BPDWinningTransactionsV2Plugin);

  return server;
};
