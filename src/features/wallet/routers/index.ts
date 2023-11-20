import { Request, Response, Router } from "express";
import { addHandler, SupportedMethod } from "../../../payloads/response";

export const walletV3Router = Router();

export const addWalletV3Prefix = (path: string) =>
  `/payment-wallet/v1/wallets${path}`;
export const addPaymentMethodsPrefix = (path: string) =>
  `/payment-wallet/v1/payment-methods${path}`;

export const addWalletV3Handler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(walletV3Router, method, addWalletV3Prefix(path), handleRequest);

export const addPaymentMethodsHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) =>
  addHandler(
    walletV3Router,
    method,
    addPaymentMethodsPrefix(path),
    handleRequest
  );
