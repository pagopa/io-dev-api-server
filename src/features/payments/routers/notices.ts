import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { NoticeListWrapResponse } from "../../../../generated/definitions/pagopa/transactions/NoticeListWrapResponse";
import { ioDevServerConfig } from "../../../config";
import { sendFileFromRootPath } from "../../../utils/file";
import NoticesDB from "../persistence/notices";
import { addNoticesHandler } from "./router";

const CONTINUATION_TOKEN_HEADER = "x-continuation-token";
const DEFAULT_SIZE = 10;
const { hideReceiptResponseCode } = ioDevServerConfig.features.payments;
const { pdfNotFoundResponse } = ioDevServerConfig.features.receipts;

addNoticesHandler("get", "/paids", (req, res) => {
  const size = req.query.size ? Number(req.query.size) : DEFAULT_SIZE;
  const offset = isNaN(Number(req.headers[CONTINUATION_TOKEN_HEADER]))
    ? 0
    : Number(req.headers[CONTINUATION_TOKEN_HEADER]);
  const response: NoticeListWrapResponse = {
    notices: NoticesDB.getUserNotices().slice(offset, offset + size)
  };
  const continuationToken =
    NoticesDB.getUserNotices().length > offset + size
      ? (offset + size).toString()
      : undefined;
  pipe(
    response.notices,
    O.fromNullable,
    O.chain(O.fromPredicate(transactions => transactions.length > 0)),
    O.fold(
      () =>
        res.status(404).json({
          title: "No transactions found",
          status: 404,
          detail: "No transactions found for the user"
        }),
      _ => {
        if (continuationToken) {
          res.setHeader(CONTINUATION_TOKEN_HEADER, continuationToken);
        }
        return res.status(200).json(response);
      }
    )
  );
});

addNoticesHandler("get", "/paids/:eventId", (req, res) => {
  pipe(
    req.params.eventId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      eventId => {
        const transaction = NoticesDB.getNoticeDetails(eventId);
        return pipe(
          transaction,
          O.fold(
            () => res.sendStatus(404),
            transaction => res.status(200).json(transaction)
          )
        );
      }
    )
  );
});

addNoticesHandler("get", "/paids/:eventId/pdf", (req, res) => {
  pipe(
    req.params.eventId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      eventId => {
        if (pdfNotFoundResponse) {
          return res
            .status(pdfNotFoundResponse.status)
            .json(pdfNotFoundResponse);
        }
        const transaction = NoticesDB.getNoticeDetails(eventId);
        return pipe(
          transaction,
          O.fold(
            () =>
              res.status(404).json({
                title: "Attachment not found",
                status: 404,
                detail:
                  "Attachment of 321 for bizEvent with id 123 is still generating",
                code: "AT_404_002"
              }),
            _ => {
              sendFileFromRootPath(
                "assets/payments/receipts/loremIpsum.pdf",
                res
              );
              return res;
            }
          )
        );
      }
    )
  );
});

addNoticesHandler("post", "/paids/:eventId/disable", (req, res) => {
  pipe(
    req.params.eventId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      eventId => {
        if (hideReceiptResponseCode === 200) {
          NoticesDB.removeUserNotice(eventId);
        }
        return res.sendStatus(hideReceiptResponseCode);
      }
    )
  );
});
