import { addTransactionsHandler } from "./router";

// TRANSACTIONS

/**
 * Retrieve the paged transaction list from biz events.
 */
addTransactionsHandler("get", "/transactions", (req, res) =>
  res.status(200).json({})
);

/**
 * Retrieve the transaction details given its id.
 */
addTransactionsHandler("get", "/transactions/{transactionId}", (req, res) =>
  res.status(200).json({})
);

/**
 * Disable the transaction details given its id.
 */
addTransactionsHandler(
  "post",
  "/transactions/{transactionId}/disable",
  (req, res) => res.status(200).json({})
);

// BIZ EVENTS

/**
 * Retrieve the biz-event given the organization fiscal code and IUV.
 */
addTransactionsHandler(
  "get",
  "/events/organizations/{organization-fiscal-code}/iuvs/{iuv}",
  (req, res) => res.status(200).json({})
);

/**
 * Retrieve the biz-event given its id.
 */
addTransactionsHandler("get", "/events/{biz-event-id}", (req, res) =>
  res.status(200).json({})
);

// RECEIPTS

/**
 * The organization get the receipt for the creditor institution using IUR
 */
addTransactionsHandler(
  "get",
  "/organizations/{organizationfiscalcode}/receipts/{iur}",
  (req, res) => res.status(200).json({})
);

/**
 * The organization get the receipt for the creditor institution using IUV and IUR.
 */
addTransactionsHandler(
  "get",
  "/organizations/{organizationfiscalcode}/receipts/{iur}/paymentoptions/{iuv}",
  (req, res) => res.status(200).json({})
);
