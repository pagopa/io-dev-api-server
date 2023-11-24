import { paymentRouter } from "../payment/routers";
import { walletV3Router } from "../routers";

export const walletRouter = [walletV3Router, paymentRouter];
