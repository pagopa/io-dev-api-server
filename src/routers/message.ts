import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
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
import { fileExists, isPDFFile, sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { pnServiceId } from "../payloads/services/special/pn/factoryPn";
import ServicesDB from "../persistence/services";
import { CreatedMessageWithContentAndEnrichedData } from "../../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

const messageNotFoundError = "message not found";

/* helper function to build messages response */
const getPublicMessages = (
  items: ReadonlyArray<CreatedMessageWithContentAndEnrichedData>,
  enrichData: boolean,
  withContent: boolean
): ReadonlyArray<PublicMessage> =>
  items.map(m => {
    const serviceId = m.sender_service_id;
    const senderService = ServicesDB.getService(serviceId);
    if (!senderService) {
      throw Error(
        `message.getPublicMessages: unabled to find service with id (${serviceId})`
      );
    }
    const extraData = enrichData
      ? {
          service_name: senderService.service_name,
          organization_name: senderService.organization_name,
          message_title: m.content.subject,
          category: getCategory(m),
          is_read: m.is_read,
          is_archived: m.is_archived,
          has_attachments: m.has_attachments,
          has_precondition: senderService.service_id === pnServiceId
        }
      : {};
    const content = withContent
      ? {
          content: m.content
        }
      : {};
    return {
      id: m.id,
      fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code,
      created_at: m.created_at,
      sender_service_id: m.sender_service_id,
      time_to_live: m.time_to_live,
      ...extraData,
      ...content
    };
  });

const computeGetMessagesQueryIndexes = (
  params: GetMessagesParameters,
  orderedList: ReadonlyArray<CreatedMessageWithContentAndEnrichedData>
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
    const message = MessagesDB.findOneById(req.params.id);
    if (message === null) {
      res.status(404).json(getProblemJson(404, messageNotFoundError));
      return;
    }
    const response = getPublicMessages(
      [message],
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
  (req, res) => {
    if (configResponse.getThirdPartyMessageResponseCode !== 200) {
      res.sendStatus(configResponse.getThirdPartyMessageResponseCode);
      return;
    }

    const message = MessagesDB.findOneById(req.params.id);

    const thirdPartyMessage = pipe(
      ThirdPartyMessageWithContent.decode(message),
      O.fromEither,
      O.toUndefined
    );

    if (thirdPartyMessage) {
      res.json(thirdPartyMessage);
    } else {
      res.status(404).json(getProblemJson(404, messageNotFoundError));
    }
  }
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/third-party-messages/:messageId/attachments/:attachmentId"),
  (req, res) => {
    // find the message by the given messageId
    const message = MessagesDB.findOneById(req.params.messageId);
    const thirdPartyMessage = ThirdPartyMessageWithContent.decode(message);
    // ensure message exists and it has a valid content
    if (!message || E.isLeft(thirdPartyMessage)) {
      res.status(404).json(getProblemJson(404, messageNotFoundError));
      return;
    }
    // find the attachment by the given attachmentId
    const attachment =
      thirdPartyMessage.right.third_party_message?.attachments?.find(
        a => a.id === req.params.attachmentId
      );
    if (attachment === undefined) {
      res.status(404).json(getProblemJson(404, "attachment not found"));
      return;
    }
    const messageCategory = getCategory(message);
    const categoryTag = messageCategory?.tag;
    const attachmentFolderName =
      categoryTag === PNCategoryTagEnum.PN ? "pn" : "remote";
    const attachmentAbsolutePath = `assets/messages/${attachmentFolderName}/attachments/${attachment.name}`;
    if (!fileExists(attachmentAbsolutePath)) {
      // The real IO-backend replies with a 500 if the attachment is not found so we must replicate the same behaviour
      res.status(500).json(getProblemJson(500, "attachment gone"));
      return;
    }
    try {
      const isAttachmentASupportedPDF = isPDFFile(attachmentAbsolutePath);
      if (!isAttachmentASupportedPDF) {
        res
          .status(415)
          .json(getProblemJson(415, "Not a supported PDF attachment"));
        return;
      }
    } catch (e) {
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            `Unable to check requested attachment (${(e as Error).message})`
          )
        );
      return;
    }
    res.setHeader(
      "Content-Type",
      attachment.content_type ?? defaultContentType
    );
    sendFile(attachmentAbsolutePath, res);
  },
  3000
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/third-party-messages/:id/precondition"),
  (req, res) =>
    pipe(
      req.params.id,
      MessagesDB.findOneById,
      O.fromNullable,
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
);
