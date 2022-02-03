import { PublicPluginOptions } from "../routers/public";
import { ServicePluginOptions } from "../routers/service";
import { MessagePluginOptions } from "../routers/message";
import { ProfilePluginOptions } from "../routers/profile";
import { PaymentPluginOptions } from "../routers/payment";
import { WalletPluginOptions } from "../routers/wallet";
import { WalletV2PluginOptions } from "../routers/walletsV2";
import { PayPalPluginOptions } from "../routers/walletsV3/methods/paypal";
import { BPDPluginOptions } from "../routers/features/bdp";

// TODO: right now we can't build a io-ts decoder, because "io-ts"'s intersection
// has a limit of 5 types. We have to update "io-ts" to the latest version or maybe
// build our custom intersection combinator function.

export type IODevelopmentPluginOptions = PublicPluginOptions &
  ServicePluginOptions &
  MessagePluginOptions &
  ProfilePluginOptions &
  PaymentPluginOptions &
  WalletPluginOptions &
  WalletV2PluginOptions &
  PayPalPluginOptions &
  BPDPluginOptions;

export type AllorRandomValueKeys = keyof IODevelopmentPluginOptions;
