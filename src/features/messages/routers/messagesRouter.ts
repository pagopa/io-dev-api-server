import * as path from "path";
import { Router } from "express";
import { identity, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as A from "fp-ts/lib/ReadonlyArray";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import _ from "lodash";
import { TagEnum as PNCategoryTagEnum } from "../../../../generated/definitions/backend/MessageCategoryPN";
import { ThirdPartyMessageWithContent } from "../../../../generated/definitions/backend/ThirdPartyMessageWithContent";
import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { getThirdPartyMessagePrecondition } from "../persistence/messagesPayload";
import { addHandler } from "../../../payloads/response";
import MessagesDB from "../persistence/messagesDatabase";
import { GetMessagesParameters } from "../../../types/parameters";
import {
  fileExists,
  isPDFFile,
  sendFileFromRootPath
} from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import MessagesService, {
  getMessageCategory
} from "../services/messagesService";
import PaymentsDB from "../../../persistence/payments";
import {
  isProcessedPayment,
  ProcessablePayment,
  ProcessedPayment
} from "../../../types/PaymentStatus";
import {
  Detail_v2Enum,
  DetailEnum
} from "../../../../generated/definitions/backend/PaymentProblemJson";
import { PaymentInfoNotFoundResponse } from "../../../../generated/definitions/backend/PaymentInfoNotFoundResponse";
import { PaymentInfoResponse } from "../../../../generated/definitions/backend/PaymentInfoResponse";
import {
  httpStatusCodeFromDetailV2Enum,
  payloadFromDetailV2Enum
} from "../../payments/types/failure";
import { PaymentInfoConflictResponse } from "../../../../generated/definitions/backend/PaymentInfoConflictResponse";
import { PaymentInfoBadGatewayResponse } from "../../../../generated/definitions/backend/PaymentInfoBadGatewayResponse";
import { PaymentInfoUnavailableResponse } from "../../../../generated/definitions/backend/PaymentInfoUnavailableResponse";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

const messageNotFoundError = "message not found";
const attachmentPollingData = new Map<string, [Date, Date]>();

addHandler(messageRouter, "get", addApiV1Prefix("/messages"), (req, res) => {
  if (configResponse.getMessagesResponseCode !== 200) {
    res.sendStatus(configResponse.getMessagesResponseCode);
    return;
  }
  const paginatedQuery = GetMessagesParameters.decode({
    // default pageSize = 100
    pageSize: req.query.page_size ?? "100",
    // default enrichResultData = false
    enrichResultData: (req.query.enrich_result_data ?? false) === "true",
    maximumId: req.query.maximum_id,
    minimumId: req.query.minimum_id,
    getArchived: (req.query.archived ?? false) === "true"
  });
  if (E.isLeft(paginatedQuery)) {
    // bad request
    res.sendStatus(400);
    return;
  }

  const params = paginatedQuery.right;
  const orderedList =
    pipe(
      paginatedQuery,
      E.map(p => p.getArchived),
      E.getOrElseW(() => false)
    ) === true
      ? MessagesDB.findAllArchived()
      : MessagesDB.findAllInbox();

  // eslint-disable-next-line functional/no-let, no-undef-init
  let indexes:
    | { startIndex: number; endIndex: number; backward: boolean }
    | undefined = undefined;
  try {
    indexes = MessagesService.computeGetMessagesQueryIndexes(
      params,
      orderedList
    );
  } catch (e) {
    return res.sendStatus(400).json(getProblemJson(400, `${e}`));
  }

  // either not enough parameters or out-of-bound
  if (indexes === undefined) {
    return res.json({ items: [] });
  }

  const enrichResultData = params.enrichResultData ?? true;
  const slice = _.slice(orderedList, indexes.startIndex, indexes.endIndex);
  const items = MessagesService.getPublicMessages(
    slice,
    enrichResultData,
    false,
    ioDevServerConfig
  );

  // the API doesn't return 'next' for previous page
  if (indexes.backward) {
    return res.json({
      items,
      prev: orderedList[indexes.startIndex]?.id
    });
  }

  return res.json({
    items,
    prev: orderedList[indexes.startIndex]?.id,
    next: orderedList[indexes.endIndex]
      ? slice[slice.length - 1]?.id
      : undefined
  });
});

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages/:id"),
  (req, res) => {
    if (configResponse.getMessageResponseCode !== 200) {
      res.sendStatus(configResponse.getMessagesResponseCode);
      return;
    }
    // retrieve the messageIndex from id
    const message = MessagesDB.getMessageById(req.params.id);
    if (O.isNone(message)) {
      res.status(404).json(getProblemJson(404, messageNotFoundError));
      return;
    }
    const response = MessagesService.getPublicMessages(
      [message.value],
      req.query.public_message === "true",
      true,
      ioDevServerConfig
    )[0];
    res.json(response);
  }
);

addHandler(
  messageRouter,
  "put",
  addApiV1Prefix("/messages/:id/message-status"),
  (req, res) => {
    if (configResponse.getMessageResponseCode !== 200) {
      res.sendStatus(configResponse.getMessagesResponseCode);
      return;
    }
    const { change_type, is_archived, is_read } = req.body;
    if (is_archived === undefined && is_read === undefined) {
      return res.status(400).json(getProblemJson(400, "Invalid payload"));
    }
    // eslint-disable-next-line functional/no-let
    let result = false;

    switch (change_type) {
      case "archiving":
        if (is_archived === true) {
          result = MessagesDB.archive(req.params.id);
        }
        if (is_archived === false) {
          result = MessagesDB.unarchive(req.params.id);
        }
        break;
      case "reading":
        // note: is_read can only be set to true
        if (is_read) {
          result = MessagesDB.setReadMessage(req.params.id);
        }
        break;
      case "bulk":
        if (is_archived === true) {
          result = MessagesDB.archive(req.params.id);
        }
        if (is_archived === false) {
          result = MessagesDB.unarchive(req.params.id);
        }
        if (is_read) {
          result = MessagesDB.setReadMessage(req.params.id);
        }
        break;
      default:
        return res.status(400).json(getProblemJson(400, "Invalid payload"));
    }

    if (result) {
      return res.status(200).json({ message: "ok" });
    }
    return res.status(404).json({ message: "ok" });
  }
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/third-party-messages/:id"),
  lollipopMiddleware((req, res) =>
    pipe(
      configResponse.getThirdPartyMessageResponseCode === 200,
      B.fold(
        () => res.sendStatus(configResponse.getThirdPartyMessageResponseCode),
        () =>
          pipe(
            MessagesDB.getMessageById(req.params.id),
            O.chain(message =>
              pipe(ThirdPartyMessageWithContent.decode(message), O.fromEither)
            ),
            O.fold(
              () =>
                res.status(404).json(getProblemJson(404, messageNotFoundError)),
              message => res.json(message)
            )
          )
      )
    )
  )
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/third-party-messages/:messageId/attachments/*"),
  lollipopMiddleware((req, res) =>
    pipe(
      req.params.messageId,
      MessagesDB.getMessageById,
      O.fold(
        () => res.status(404).json(getProblemJson(404, messageNotFoundError)),
        message =>
          pipe(
            ThirdPartyMessageWithContent.decode(message),
            E.fold(
              errors =>
                res
                  .status(500)
                  .json(
                    getProblemJson(
                      500,
                      `Decode failed for message with id (${req.params.messageId})`,
                      JSON.stringify(errors)
                    )
                  ),
              thirdPartyMessageWithContent =>
                pipe(
                  thirdPartyMessageWithContent.third_party_message,
                  O.fromNullable,
                  O.chainNullableK(
                    thirdPartyMessage => thirdPartyMessage.attachments
                  ),
                  O.map(attachments =>
                    pipe(
                      attachments,
                      A.findFirst(attachment =>
                        attachment.url.endsWith(req.params[0])
                      )
                    )
                  ),
                  O.flatten,
                  O.fold(
                    () =>
                      res
                        .status(404)
                        .json(
                          getProblemJson(
                            404,
                            `Attachment not found for url (${req.params[0]})`
                          )
                        ),
                    attachment =>
                      pipe(
                        path.resolve("."),
                        executionFolderAbsolutePath =>
                          path.join(
                            executionFolderAbsolutePath,
                            attachment.url
                          ),
                        attachmentAbsolutePath =>
                          pipe(
                            fileExists(attachmentAbsolutePath),
                            B.fold(
                              () =>
                                res
                                  .status(500)
                                  .json(
                                    getProblemJson(
                                      500,
                                      `Attachment file does not exist (${attachmentAbsolutePath})`
                                    )
                                  ),
                              () =>
                                pipe(
                                  isPDFFile(attachmentAbsolutePath),
                                  E.fold(
                                    error =>
                                      res
                                        .status(500)
                                        .json(
                                          getProblemJson(
                                            500,
                                            `Unable to check requested attachment (${attachmentAbsolutePath})`,
                                            JSON.stringify(error)
                                          )
                                        ),
                                    B.foldW(
                                      () =>
                                        res
                                          .status(415)
                                          .json(
                                            getProblemJson(
                                              415,
                                              "Not a supported PDF attachment"
                                            )
                                          ),
                                      () =>
                                        MessagesService.handleAttachment(
                                          attachment,
                                          attachmentPollingData,
                                          ioDevServerConfig,
                                          (contentType, fileRelativePath) =>
                                            pipe(
                                              res.setHeader(
                                                "Content-Type",
                                                contentType
                                              ),
                                              resWithHeaders =>
                                                sendFileFromRootPath(
                                                  fileRelativePath,
                                                  resWithHeaders
                                                )
                                            ),
                                          retryAfterSeconds =>
                                            res
                                              .setHeader(
                                                "retry-after",
                                                retryAfterSeconds
                                              )
                                              .status(503)
                                              .json(
                                                getProblemJson(
                                                  503,
                                                  `Retry-after: ${retryAfterSeconds}s`
                                                )
                                              )
                                        )
                                    )
                                  )
                                )
                            )
                          )
                      )
                  )
                )
            )
          )
      )
    )
  )
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/third-party-messages/:id/precondition"),
  lollipopMiddleware((req, res) =>
    pipe(
      req.params.id,
      MessagesDB.getMessageById,
      O.fold(
        () => res.status(404).json(getProblemJson(404, messageNotFoundError)),
        message =>
          pipe(
            message,
            getMessageCategory,
            O.fromNullable,
            O.chainNullableK(category => category.tag),
            // TODO: we must replace this check with a more generic one
            // see https://pagopa.atlassian.net/browse/IOCOM-188
            O.map(tag => tag === PNCategoryTagEnum.PN),
            O.chain(O.fromPredicate(identity)),
            O.fold(
              () =>
                res
                  .status(500)
                  .json(
                    getProblemJson(500, "requested message is not of pn type")
                  ),
              () => res.status(200).json(getThirdPartyMessagePrecondition())
            )
          )
      )
    )
  )
);

addHandler(messageRouter, "post", addApiV1Prefix("/message"), (_, res) =>
  pipe(MessagesService.createMessage(), MessagesDB.addNewMessage, newMessage =>
    res.status(201).json(newMessage)
  )
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/payment-requests/:rptId"),
  (req, res) => {
    const rptId = req.params.rptId;
    const maybePaymentStatus = PaymentsDB.getPaymentStatus(rptId);
    if (O.isNone(maybePaymentStatus)) {
      res
        .status(404)
        .json(getProblemJson(404, `Payment with rptdId (${rptId}) not found`));
      return;
    }

    const isTest = req.query.test;
    if (isTest == null) {
      // This is not the real backend behavior, but it is here in
      // order to make sure that the request is properly formatted
      res
        .status(400)
        .json(getProblemJson(400, "Missing 'isTest' query parameter"));
      return;
    }

    const paymentStatus = maybePaymentStatus.value;
    if (isProcessedPayment(paymentStatus)) {
      res.status(500).json(paymentStatus.status);
    } else {
      res.status(200).json(paymentStatus.data);
    }
  },
  () => Math.ceil(500 + 1000 * Math.random())
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/payment-info/:rptId"),
  (req, res) => {
    const rptId = req.params.rptId;
    const maybePaymentStatus = PaymentsDB.getPaymentStatus(rptId);
    if (O.isNone(maybePaymentStatus)) {
      const fakeProcessedPayment: ProcessedPayment = {
        status: {
          detail_v2: Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO,
          detail: DetailEnum.PAYMENT_UNKNOWN
        },
        type: "processed"
      };
      const [statusCode, payload] =
        processedPaymentToStatusCodeAndPayload(fakeProcessedPayment);
      res.status(statusCode).json(payload);
      return;
    }

    const isTest = req.query.test;
    if (isTest == null) {
      // This is not the real backend behavior, but it is here in
      // order to make sure that the request is properly formatted
      res
        .status(400)
        .json(getProblemJson(400, "Missing 'isTest' query parameter"));
      return;
    }

    const paymentStatus = maybePaymentStatus.value;
    if (isProcessedPayment(paymentStatus)) {
      const [statusCode, payload] =
        processedPaymentToStatusCodeAndPayload(paymentStatus);
      res.status(statusCode).json(payload);
    } else {
      const [statusCode, payload] =
        processablePaymentToStatusCodeAndPayload(paymentStatus);
      res.status(statusCode).json(payload);
    }
  },
  () => Math.ceil(500 + 1000 * Math.random())
);

const processablePaymentToStatusCodeAndPayload = (
  payment: ProcessablePayment
): [number, string | PaymentInfoResponse] => {
  const payloadEither = PaymentInfoResponse.decode({
    amount: payment.data.importoSingoloVersamento,
    description: payment.data.causaleVersamento,
    dueDate: payment.data.dueDate,
    paFiscalCode:
      payment.data.enteBeneficiario?.identificativoUnivocoBeneficiario,
    paName: payment.data.enteBeneficiario?.denominazioneBeneficiario,
    rptId: payment.data.codiceContestoPagamento
  });
  if (E.isLeft(payloadEither)) {
    return [500, readableReport(payloadEither.left)];
  }
  return [200, payloadEither.right];
};

const processedPaymentToStatusCodeAndPayload = (
  payment: ProcessedPayment
): [number, string | ReturnType<typeof payloadFromDetailV2Enum>] => {
  const detailV2Enum = payment.status.detail_v2;
  const statusCode = httpStatusCodeFromDetailV2Enum(detailV2Enum);
  const payload = payloadFromDetailV2Enum(detailV2Enum);
  // eCommerce API has been mapped by IO-Backend so we must make
  // sure that type conversion is correct by validating the
  // different types that maps the same instance's content
  if (statusCode === 404) {
    const paymentInfoNotFoundResponseEither =
      PaymentInfoNotFoundResponse.decode(payload);
    if (E.isLeft(paymentInfoNotFoundResponseEither)) {
      return [500, readableReport(paymentInfoNotFoundResponseEither.left)];
    }
  } else if (statusCode === 409) {
    const paymentInfoConflictResponse =
      PaymentInfoConflictResponse.decode(payload);
    if (E.isLeft(paymentInfoConflictResponse)) {
      return [500, readableReport(paymentInfoConflictResponse.left)];
    }
  } else if (statusCode === 502) {
    const paymentInfoBadGatewayResponse =
      PaymentInfoBadGatewayResponse.decode(payload);
    if (E.isLeft(paymentInfoBadGatewayResponse)) {
      return [500, readableReport(paymentInfoBadGatewayResponse.left)];
    }
  } else if (statusCode === 503) {
    const paymentInfoUnavailableResponse =
      PaymentInfoUnavailableResponse.decode(payload);
    if (E.isLeft(paymentInfoUnavailableResponse)) {
      return [500, readableReport(paymentInfoUnavailableResponse.left)];
    }
  } else if (statusCode === 400 || statusCode === 401) {
    // eCommerce 400 and 401 status codes are mapped to 500 on IOBackend,
    // since 401 is a FastLogin error and 400 is a server-to-server error
    return [500, payload];
  }
  return [statusCode, payload];
};
