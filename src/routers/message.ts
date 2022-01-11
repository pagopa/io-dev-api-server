import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import fs from "fs";
import _ from "lodash";
import { __, match, not } from "ts-pattern";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
import { LegalMessageWithContent } from "../../generated/definitions/backend/LegalMessageWithContent";
import { MessageAttachment } from "../../generated/definitions/backend/MessageAttachment";
import { MessageSubject } from "../../generated/definitions/backend/MessageSubject";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { PublicMessage } from "../../generated/definitions/backend/PublicMessage";
import { ioDevServerConfig } from "../config";
import { getProblemJson } from "../payloads/error";
import {
  createMessage,
  getCategory,
  getMvlAttachments,
  withContent,
  withDueDate,
  withLegalContent,
  withPaymentData
} from "../payloads/message";
import { addHandler } from "../payloads/response";
import { GetMessagesParameters } from "../types/parameters";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import {
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter1CTABonusCgn,
  frontMatter2CTA2,
  frontMatterBonusVacanze,
  messageMarkdown
} from "../utils/variables";
import { eucovidCertAuthResponses } from "./features/eu_covid_cert";
import { services } from "./service";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

const getRandomServiceId = (): string => {
  if (services.length === 0) {
    throw new Error(
      "to create messages, at least one sender service must exist!"
    );
  }
  return faker.random.arrayElement(services).service_id;
};

const getNewMessage = (
  subject: string,
  markdown: string,
  prescriptionData?: PrescriptionData,
  euCovidCert?: EUCovidCert
): CreatedMessageWithContent =>
  withContent(
    createMessage(
      ioDevServerConfig.profile.attrs.fiscal_code,
      getRandomServiceId()
    ),
    subject,
    markdown,
    prescriptionData,
    euCovidCert
  );

// tslint:disable-next-line: readonly-array
const createMessages = (): Array<
  CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  // tslint:disable-next-line:no-big-function
> => {
  // tslint:disable-next-line: readonly-array
  const output: Array<
    CreatedMessageWithContentAndAttachments | CreatedMessageWithContent
  > = [];

  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code
  };
  const now = new Date();

  /* with CTAs */
  if (ioDevServerConfig.messages.withCTA) {
    output.push(
      getNewMessage(`2 nested CTA`, frontMatter2CTA2 + messageMarkdown)
    );
    output.push(
      getNewMessage(
        `2 CTA bonus vacanze`,
        frontMatterBonusVacanze + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA start BPD`,
        frontMatter1CTABonusBpd + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA IBAN BPD`,
        frontMatter1CTABonusBpdIban + messageMarkdown
      )
    );
    output.push(
      getNewMessage(
        `1 CTA start CGN`,
        frontMatter1CTABonusCgn + messageMarkdown
      )
    );
  }

  /* with EUCovidCert */
  if (ioDevServerConfig.messages.withEUCovidCert) {
    eucovidCertAuthResponses.forEach(config => {
      const [authCode, description] = config;

      output.push(
        getNewMessage(
          `🏥 EUCovidCert - ${description}`,
          messageMarkdown,
          undefined,
          {
            auth_code: authCode
          }
        )
      );
    });
  }

  const medicalMessage = (count: number) =>
    getNewMessage(
      `💊 medical prescription - ${count}`,
      messageMarkdown,
      medicalPrescription
    );

  const barcodeReceipt = fs
    .readFileSync("assets/messages/barcodeReceipt.svg")
    .toString("base64");

  /* medical */
  range(1, ioDevServerConfig.messages.medicalCount).forEach(count => {
    output.push(medicalMessage(count));
    const baseMessage = medicalMessage(count);
    const attachments: ReadonlyArray<MessageAttachment> = [
      {
        name: "prescription A",
        content: "up, down, strange, charm, bottom, top",
        mime_type: "text/plain"
      },
      {
        name: "prescription B",
        content: barcodeReceipt,
        mime_type: "image/svg+xml"
      }
    ];
    output.push({
      ...baseMessage,
      content: {
        ...baseMessage.content,
        subject: `💊 medical prescription with attachments - ${count}` as MessageSubject,
        attachments
      }
    });
  });

  /* standard message */
  range(1, ioDevServerConfig.messages.standardMessageCount).forEach(count =>
    output.push(getNewMessage(`standard message - ${count}`, messageMarkdown))
  );

  /* due date */
  range(1, ioDevServerConfig.messages.withValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(`🕙✅ due date valid - ${count}`, messageMarkdown),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.withInValidDueDateCount).forEach(count =>
    output.push(
      withDueDate(
        getNewMessage(`🕙❌ due date invalid - ${count}`, messageMarkdown),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  /* payments */
  range(
    1,
    ioDevServerConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(
            `💰🕙❌ payment - expired - invalid after due date - ${count}`,
            messageMarkdown
          ),
          true
        ),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

  range(
    1,
    ioDevServerConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(
            `💰🕙✅ payment - valid - invalid after due date - ${count}`,
            messageMarkdown
          ),
          true
        ),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(
    1,
    ioDevServerConfig.messages.paymentWithExpiredDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙 payment - expired - ${count}`, messageMarkdown),
          false
        ),
        new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
      )
    )
  );

  range(
    1,
    ioDevServerConfig.messages.paymentWithValidDueDateCount
  ).forEach(count =>
    output.push(
      withDueDate(
        withPaymentData(
          getNewMessage(`💰🕙✅ payment message - ${count}`, messageMarkdown),
          true
        ),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.paymentsCount).forEach(count =>
    output.push(
      withPaymentData(
        getNewMessage(`💰✅ payment - ${count} `, messageMarkdown),
        true
      )
    )
  );

  range(1, ioDevServerConfig.messages.legalCount).forEach((count, idx) => {
    const message = getNewMessage(`⚖️ Legal - ${count} `, messageMarkdown);
    const mvlMsgId = message.id;
    const attachments = getMvlAttachments(mvlMsgId, ["pdf", "png"]);
    output.push(withLegalContent(message, message.id, attachments));
  });

  return output;
};

// tslint:disable-next-line: readonly-array
export const messagesWithContent: ReturnType<typeof createMessages> = createMessages();

if (ioDevServerConfig.messages.liveMode) {
  // if live updates is on, we prepend new messages to the collection
  const count = ioDevServerConfig.messages.liveMode.count || 2;
  const interval = ioDevServerConfig.messages.liveMode.interval || 2000;
  setInterval(() => {
    const nextMessages = createMessages();

    messagesWithContent.unshift(
      ..._.shuffle(nextMessages).slice(
        0,
        Math.min(count, nextMessages.length - 1)
      )
    );
  }, interval);
}

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
    minimumId: req.query.minimum_id
  });
  if (E.isLeft(paginatedQuery)) {
    // bad request
    res.sendStatus(400);
    return;
  }

  const params = paginatedQuery.value;
  // order messages by creation date (desc)
  const orderedList = _.orderBy(messagesWithContent, "created_at", ["desc"]);

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
    const message = messagesWithContent.find(item => item.id === req.params.id);
    if (message === undefined) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }
    res.json(message);
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
    const message = messagesWithContent.find(item => item.id === req.params.id);
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
    // find the message by the given legalID
    const message = messagesWithContent.find(
      ld =>
        (ld as LegalMessageWithContent).legal_message?.cert_data.data
          .envelope_id === req.params.legalMessageId
    );
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
