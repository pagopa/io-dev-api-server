import * as path from "path";
import { Router } from "express";
import { identity, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as A from "fp-ts/lib/ReadonlyArray";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { match, not, __ } from "ts-pattern";
import { TagEnum as PNCategoryTagEnum } from "../../generated/definitions/backend/MessageCategoryPN";
import { PublicMessage } from "../../generated/definitions/backend/PublicMessage";
import { ThirdPartyMessageWithContent } from "../../generated/definitions/backend/ThirdPartyMessageWithContent";
import { ioDevServerConfig } from "../config";
import { getProblemJson } from "../payloads/error";
import {
  defaultContentType,
  getCategory,
  getThirdPartyMessagePrecondition
} from "../payloads/message";
import { addHandler } from "../payloads/response";
import MessagesDB from "../persistence/messages";
import { GetMessagesParameters } from "../types/parameters";
import { fileExists, isPDFFile, sendFileFromRootPath } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import ServicesDB from "../persistence/services";
import { CreatedMessageWithContentAndAttachments } from "../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { CreatedMessageWithContentAndEnrichedData } from "../../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";
import { lollipopMiddleware } from "../middleware/lollipopMiddleware";
import { pnServiceId } from "../features/pn/services/services";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

const messageNotFoundError = "message not found";

/* helper function to build messages response */
const getPublicMessages = (
  messages: ReadonlyArray<CreatedMessageWithContentAndAttachments>,
  withEnrichedData: boolean,
  withContent: boolean
): ReadonlyArray<PublicMessage | CreatedMessageWithContentAndAttachments> =>
  messages.map(message => {
    const serviceId = message.sender_service_id;
    const senderService = ServicesDB.getService(serviceId);
    if (!senderService) {
      throw Error(
        `message.getPublicMessages: unabled to find service with id (${serviceId})`
      );
    }

    const enrichedData = pipe(
      withEnrichedData,
      B.fold(
        () => ({}),
        () => {
          const { content, is_read, is_archived, has_attachments } =
            message as CreatedMessageWithContentAndEnrichedData;

          return {
            service_name: senderService.service_name,
            organization_name: senderService.organization_name,
            message_title: content.subject,
            category: getCategory(message),
            is_read,
            is_archived,
            has_attachments,
            has_precondition: senderService.service_id === pnServiceId
          };
        }
      )
    );

    const content = pipe(
      withContent,
      B.fold(
        () => ({}),
        () => ({
          content: message.content
        })
      )
    );

    return {
      id: message.id,
      fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code,
      created_at: message.created_at,
      sender_service_id: message.sender_service_id,
      time_to_live: message.time_to_live,
      ...enrichedData,
      ...content
    };
  });

const computeGetMessagesQueryIndexes = (
  params: GetMessagesParameters,
  orderedList: ReadonlyArray<CreatedMessageWithContentAndAttachments>
) => {
  const toMatch = { maximumId: params.maximumId, minimumId: params.minimumId };
  return match(toMatch)
    .with({ maximumId: not(__.nullish), minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.maximumId);
      const startIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // if indexes are defined and in the expected order
      if (![startIndex, endIndex].includes(-1) && startIndex < endIndex) {
        return {
          startIndex: startIndex + 1,
          endIndex,
          backward: false
        };
      }
    })
    .with({ maximumId: not(__.nullish) }, () => {
      const startIndex = orderedList.findIndex(m => m.id === params.maximumId);
      // index is defined and not at the end of the list
      if (startIndex !== -1 && startIndex + 1 < orderedList.length) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: startIndex + 1,
          endIndex: startIndex + 1 + pageSize,
          backward: false
        };
      }
    })
    .with({ minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // index found and it isn't the first item (can't go back)
      if (endIndex > 0) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: Math.max(0, endIndex - (1 + pageSize)),
          endIndex,
          backward: true
        };
      }
    })
    .otherwise(() => ({
      startIndex: 0,
      endIndex: params.pageSize as number,
      backward: false
    }));
};

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
    indexes = computeGetMessagesQueryIndexes(params, orderedList);
  } catch (e) {
    return res.sendStatus(400).json(getProblemJson(400, `${e}`));
  }

  // either not enough parameters or out-of-bound
  if (indexes === undefined) {
    return res.json({ items: [] });
  }

  const enrichResultData = params.enrichResultData ?? true;
  const slice = _.slice(orderedList, indexes.startIndex, indexes.endIndex);
  const items = getPublicMessages(slice, enrichResultData, false);

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
    const response = getPublicMessages(
      [message.value],
      req.query.public_message === "true",
      true
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
  addApiV1Prefix(
    "/third-party-messages/:messageId/attachments/:attachmentUrl(*)"
  ),
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
                  O.chain(
                    A.findFirst(attachment =>
                      attachment.url.endsWith(req.params.attachmentUrl)
                    )
                  ),
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
                                        pipe(
                                          res.setHeader(
                                            "Content-Type",
                                            attachment.content_type ??
                                              defaultContentType
                                          ),
                                          resWithHeaders =>
                                            sendFileFromRootPath(
                                              attachment.url,
                                              resWithHeaders
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
            getCategory,
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
