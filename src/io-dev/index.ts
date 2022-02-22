import { Plugin } from "../core/server";

import { PublicPlugin } from "../routers/public";

import { ServicePlugin } from "../routers/service";
import { ServiceMetadataPlugin } from "../routers/services_metadata";

import { MessagePlugin } from "../routers/message";
import { ProfilePlugin } from "../routers/profile";
import { SessionPlugin } from "../routers/session";
import { PaymentPlugin } from "../routers/payment";

import { WalletPlugin } from "../routers/wallet";
import { WalletV2Plugin } from "../routers/walletsV2";

import { BPDPlugin } from "../routers/features/bdp";
import { BonusVacanzePlugin } from "../routers/features/bonus-vacanze";
import { EUCovidCertPlugin } from "../routers/features/eu_covid_cert";
import { CGNPlugin } from "../routers/features/cgn";
import { CGNMerchantsPlugin } from "../routers/features/cgn/merchants";
import { CGNGeocodingPlugin } from "../routers/features/cgn/geocoding";
import { SiciliaVolaPlugin } from "../routers/features/siciliaVola";
import { BPDAwardPlugin } from "../routers/features/bdp/award";
import { BPDRankingV1Plugin } from "../routers/features/bdp/ranking/v1";
import { BPDRankingV2Plugin } from "../routers/features/bdp/ranking/v2";
import { BPDWinningTransactionsV1Plugin } from "../routers/features/bdp/winning-transactions/v1";
import { BPDWinningTransactionsV2Plugin } from "../routers/features/bdp/winning-transactions/v2";

import { MiscPlugin } from "../routers/misc";
import { PayPalPlugin } from "../routers/walletsV3/methods/paypal";

import { IODevelopmentPluginOptions } from "./config";

export { IODevelopmentPluginOptions };

export const IODevelopmentPlugin: Plugin<IODevelopmentPluginOptions> = async (
  app,
  options
) => {
  app.handleRoute("get", "/config", (_, res) => {
    res.json({ options });
  });

  app.use(PublicPlugin, {
    global: {
      autoLogin: true
    }
  });

  app
    .use(ServicePlugin, {
      services: options.services
    })
    .after(() => {
      app.use(ServiceMetadataPlugin);
      app.use(MessagePlugin, {
        profile: {
          attrs: options.profile.attrs
        },
        messages: options.messages
      });
    });

  app.use(SessionPlugin);

  app
    .use(ProfilePlugin, {
      profile: options.profile
    })
    .after(() => {
      app.use(WalletPlugin, {
        wallet: {
          onboardingCreditCardOutCode:
            options.wallet.onboardingCreditCardOutCode,
          shuffleAbi: options.wallet.shuffleAbi,
          payment: options.wallet.payment,
          allowRandomValues: options.wallet.allowRandomValues
        }
      });
      app
        .use(WalletV2Plugin, {
          wallet: {
            methods: options.wallet.methods,
            allowRandomValues: options.wallet.allowRandomValues
          }
        })
        .after(() => {
          app.use(PayPalPlugin, {
            wallet: {
              methods: options.wallet.methods,
              allowRandomValues: options.wallet.allowRandomValues
            }
          });
        });
    });

  app.use(PaymentPlugin, {
    profile: {
      attrs: options.profile.attrs
    },
    wallet: {
      paymentOutCode: options.wallet.paymentOutCode,
      onboardingCreditCardOutCode: options.wallet.onboardingCreditCardOutCode,
      verificaError: options.wallet.verificaError
    }
  });

  app.use(MiscPlugin);

  app.use(BonusVacanzePlugin, {
    profile: {
      attrs: options.profile.attrs
    }
  });

  app.use(EUCovidCertPlugin);

  app.use(CGNPlugin, {
    services: {
      allowRandomValues: options.services.allowRandomValues
    }
  });

  app.use(CGNMerchantsPlugin);
  app.use(CGNGeocodingPlugin);

  app.use(SiciliaVolaPlugin);

  app.use(BPDPlugin, {
    profile: {
      attrs: options.profile.attrs
    }
  });

  app.use(BPDAwardPlugin);
  app.use(BPDRankingV1Plugin);
  app.use(BPDRankingV2Plugin);
  app.use(BPDWinningTransactionsV1Plugin);
  app.use(BPDWinningTransactionsV2Plugin);
};
