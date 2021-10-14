import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import _ from "lodash";
import { __, match, not } from "ts-pattern";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ioDevServerConfig } from "../config";
import { getProblemJson } from "../payloads/error";
import {
  createMessage,
  withContent,
  withDueDate,
  withPaymentData
} from "../payloads/message";
import { addHandler } from "../payloads/response";
import { GetMessagesParameters } from "../types/parameters";
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
// tslint:disable-next-line: readonly-array
export const messagesWithContent: CreatedMessageWithContent[] = [];

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

const addMessage = (message: CreatedMessageWithContent) =>
  messagesWithContent.push(message);

const createMessages = () => {
  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code
  };
  const now = new Date();

  /* with CTAs */
  if (ioDevServerConfig.messages.withCTA) {
    addMessage(
      getNewMessage(`2 nested CTA`, frontMatter2CTA2 + messageMarkdown)
    );
    addMessage(
      getNewMessage(
        `2 CTA bonus vacanze`,
        frontMatterBonusVacanze + messageMarkdown
      )
    );
    addMessage(
      getNewMessage(
        `1 CTA start BPD`,
        frontMatter1CTABonusBpd + messageMarkdown
      )
    );
    addMessage(
      getNewMessage(
        `1 CTA IBAN BPD`,
        frontMatter1CTABonusBpdIban + messageMarkdown
      )
    );
    addMessage(
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
      addMessage(
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

  /* medical */
  range(1, ioDevServerConfig.messages.medicalCount).forEach(count =>
    addMessage(
      getNewMessage(
        `💊 medical prescription - ${count}`,
        messageMarkdown,
        medicalPrescription
      )
    )
  );

  /* standard message */
  range(1, ioDevServerConfig.messages.standardMessageCount).forEach(count =>
    addMessage(getNewMessage(`standard message - ${count}`, messageMarkdown))
  );

  /* due date */
  range(1, ioDevServerConfig.messages.withValidDueDateCount).forEach(count =>
    addMessage(
      withDueDate(
        getNewMessage(`🕙✅ due date valid - ${count}`, messageMarkdown),
        new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
      )
    )
  );

  range(1, ioDevServerConfig.messages.withInValidDueDateCount).forEach(count =>
    addMessage(
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
    addMessage(
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
    addMessage(
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
    addMessage(
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
    addMessage(
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
    addMessage(
      withPaymentData(
        getNewMessage(`💰✅ payment - ${count} `, messageMarkdown),
        true
      )
    )
  );
};

createMessages();

/* helper function to build messages response */
const getItems = (
  items: ReadonlyArray<CreatedMessageWithContent>,
  enrichData: boolean
) => {
  return items.map(m => {
    const senderService = services.find(
      s => s.service_id === m.sender_service_id
    );
    const extraData = enrichData
      ? {
          service_name: senderService!.service_name,
          organization_name: senderService!.organization_name,
          message_title: m.content.subject
        }
      : {};
    return {
      id: m.id,
      fiscal_code: fiscalCode as FiscalCode,
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
  if (paginatedQuery.isLeft()) {
    // bad request
    res.sendStatus(400);
    return;
  }

  const params = paginatedQuery.value;
  // order messages by creation date (desc)
  const orderedList = _.orderBy(messagesWithContent, "created_at", ["desc"]);

  const toMatch = { maximumId: params.maximumId, minimumId: params.minimumId };
  const indexes: { startIndex: number; endIndex: number } | undefined = match(
    toMatch
  )
    .with({ maximumId: not(__.nullish), minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.maximumId);
      const startIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // if indexes are defined and in the expected order
      if (![startIndex, endIndex].includes(-1) && startIndex < endIndex) {
        return {
          startIndex: startIndex + 1,
          endIndex
        };
      }
    })
    .with({ maximumId: not(__.nullish) }, () => {
      const startIndex = orderedList.findIndex(m => m.id === params.maximumId);
      // index is defined and not at the end of the list
      if (startIndex !== -1 && startIndex + 1 < orderedList.length) {
        return {
          startIndex: startIndex + 1,
          endIndex: startIndex + 1 + params.pageSize!
        };
      }
    })
    .with({ minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // index found and it isn't the first item (can't go back)
      if (endIndex > 0) {
        return {
          startIndex: Math.max(0, endIndex - (1 + params.pageSize!)),
          endIndex
        };
      }
    })
    .otherwise(() => ({
      startIndex: 0,
      endIndex: params.pageSize!
    }));
  // not a valid request with params
  if (indexes === undefined) {
    res.json({ items: [] });
    return;
  }
  const slice = _.slice(orderedList, indexes.startIndex, indexes.endIndex);
  res.json({
    items: getItems(slice, params.enrichResultData!),
    prev: orderedList[indexes.startIndex]?.id,
    next: slice[slice.length - 1]?.id
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
    }
    res.json(message);
  }
);
