import { addHandler } from "../../../payloads/response";
import { RestPanResponse } from "../../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { appendWalletPrefix, pansResponse } from "../index";
import fs from "fs";
import { assetsFolder } from "../../../global";
import * as t from "io-ts";
import { Message } from "../../../../generated/definitions/pagopa/walletv2/Message";
import { bancomatRouter } from "./bancomat";

/**
 * return the cobadge list owned by the citizen
 */
addHandler<RestPanResponse>(
  bancomatRouter,
  "get",
  appendWalletPrefix("/cobadge/pans"),
  (req, res) => {
    const abi = req.query.abi;
    const msg = fs
      .readFileSync(assetsFolder + "/pm/pans/messages.json")
      .toString();
    const response = {
      ...pansResponse,
      data: {
        ...pansResponse.data,
        messages: t.readonlyArray(Message).decode(msg).value
      }
    };
    if (abi === undefined) {
      res.json(response);
      return;
    }
    res.json({
      ...response,
      data: {
        data:
          response.data &&
          response.data.data !== undefined &&
          response.data.data.length > 0
            ? response.data.data.filter(c =>
                c.abi ? c.abi.indexOf(abi) !== -1 : false
              )
            : []
      }
    });
  }
);
