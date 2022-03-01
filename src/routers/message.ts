import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { __, match, not } from "ts-pattern";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { LegalMessageWithContent } from "../../generated/definitions/backend/LegalMessageWithContent";
import { PublicMessage } from "../../generated/definitions/backend/PublicMessage";
import { ioDevServerConfig } from "../config";
import { getProblemJson } from "../payloads/error";
import { getCategory } from "../payloads/message";
import { addHandler } from "../payloads/response";
import MessagesDB from "../persistence/messages";
import { GetMessagesParameters } from "../types/parameters";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { services } from "./service";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

/* helper function to build messages response */
const getPublicMessages = (
  items: ReadonlyArray<CreatedMessageWithContent>,
  enrichData: boolean
): ReadonlyArray<PublicMessage> => {
  return items.map(m => {
    const senderService = services.find(
      s => s.service_id === m.sender_service_id
    );
    const extraData = enrichData
      ? {
          service_name: senderService!.service_name,
          organization_name: senderService!.organization_name,
          message_title: m.content.subject,
          category: getCategory(m)
        }
      : {};
    return {
      id: m.id,
      fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code,
      created_at: m.created_at,
      sender_service_id: m.sender_service_id,
      time_to_live: m.time_to_live,
      ...extraData
    };
  });
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
    getArchived: Boolean(req.query.get_archived)
  });
  if (E.isLeft(paginatedQuery)) {
    // bad request
    res.sendStatus(400);
    return;
  }

  const params = paginatedQuery.value;
  const orderedList =
    paginatedQuery.map(p => p.getArchived).value === true
      ? MessagesDB.findAllArchived()
      : MessagesDB.findAllInbox();

  const toMatch = { maximumId: params.maximumId, minimumId: params.minimumId };
  const indexes:
    | { startIndex: number; endIndex: number; backward: boolean }
    | undefined = match(toMatch)
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
        return {
          startIndex: startIndex + 1,
          endIndex: startIndex + 1 + params.pageSize!,
          backward: false
        };
      }
    })
    .with({ minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // index found and it isn't the first item (can't go back)
      if (endIndex > 0) {
        return {
          startIndex: Math.max(0, endIndex - (1 + params.pageSize!)),
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

  // either not enough parameters or out-of-bound
  if (indexes === undefined) {
    return res.json({ items: [] });
  }

  const slice = _.slice(orderedList, indexes.startIndex, indexes.endIndex);
  const items = getPublicMessages(slice, params.enrichResultData!);

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
    if (message === undefined) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }
    res.json(message);
  }
);

addHandler(
  messageRouter,
  "put",
  addApiV1Prefix("/messages/:id"),
  (req, res) => {
    if (configResponse.getMessageResponseCode !== 200) {
      res.sendStatus(configResponse.getMessagesResponseCode);
      return;
    }
    const { is_archived, is_read } = req.body;
    if (is_archived === undefined && is_read === undefined) {
      return res.json(getProblemJson(400, "Invalid payload"));
    }

    // tslint:disable-next-line: no-let
    let result = false;
    if (is_archived === true) {
      result = MessagesDB.archive(req.params.id);
    }
    if (is_archived === false) {
      result = MessagesDB.unarchive(req.params.id);
    }

    // note: is_read can only be set to true
    if (is_read) {
      result = MessagesDB.setReadMessage(req.params.id);
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
  addApiV1Prefix("/legal-messages/:id"),
  (req, res) => {
    if (configResponse.getMVLMessageResponseCode !== 200) {
      res.sendStatus(configResponse.getMVLMessageResponseCode);
      return;
    }
    // retrieve the messageIndex from id
    const message = MessagesDB.findOneById(req.params.id);
    if (message === undefined) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }
    if (!LegalMessageWithContent.is(message)) {
      // act as the IO backend
      res.json(getProblemJson(500, "requested message is not of legal type"));
      return;
    }
    res.json(message);
  }
);

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/legal-messages/:legalMessageId/attachments/:attachmentId"),
  (req, res) => {
    // find the message by the given legalMessageID
    const message = MessagesDB.findOneById(req.params.legalMessageId);
    const legalMessage = LegalMessageWithContent.decode(message);
    // ensure message exists and it has a legal content
    if (message === undefined || E.isLeft(legalMessage)) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }
    // find the attachment by the given attachmentId
    const attachment = legalMessage.value.legal_message.eml.attachments.find(
      a => a.id === req.params.attachmentId
    );
    if (attachment === undefined) {
      res.json(getProblemJson(404, "attachment not found"));
      return;
    }
    res.setHeader("Content-Type", attachment.content_type);
    sendFile(`assets/messages/mvl/attachments/${attachment.name}`, res);
  }
);
