import { Router } from "express";
import * as faker from "faker/locale/it";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/CreatedMessageWithoutContentCollection";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { Timestamp } from "../../generated/definitions/backend/Timestamp";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import {
  createMessage,
  withContent,
  withDueDate,
  withPaymentData
} from "../payloads/message";
import { addHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import {
  frontMatter1CTA,
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusBpdIban,
  frontMatter2CTA,
  frontMatter2CTA2,
  messageMarkdown
} from "../utils/variables";
import { services } from "./service";

export const messageRouter = Router();

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
  prescriptionData?: PrescriptionData
): CreatedMessageWithContent =>
  withContent(
    createMessage(fiscalCode, getRandomServiceId()),
    subject,
    markdown,
    prescriptionData
  );

const addMessage = (message: CreatedMessageWithContent) =>
  messagesWithContent.push(message);

const createMessages = () => {
  const medicalPrescription: PrescriptionData = {
    nre: "050A00854698121",
    iup: "0000X0NFM",
    prescriber_fiscal_code: fiscalCode as FiscalCode
  };
  const now = new Date();

  addMessage(
    getNewMessage(
      `💊 medical prescription`,
      messageMarkdown,
      medicalPrescription
    )
  );
  addMessage(getNewMessage(`standard message`, messageMarkdown));
  addMessage(getNewMessage(`2 nested CTA`, frontMatter2CTA2 + messageMarkdown));
  addMessage(
    getNewMessage(
      `1 nested CTA ISEE bonus vacanze`,
      frontMatter1CTA + messageMarkdown
    )
  );
  addMessage(
    getNewMessage(
      `1 nested CTA start BPD`,
      frontMatter1CTABonusBpd + messageMarkdown
    )
  );
  addMessage(
    getNewMessage(
      `1 nested CTA IBAN BPD`,
      frontMatter1CTABonusBpdIban + messageMarkdown
    )
  );

  addMessage(
    withDueDate(
      withPaymentData(
        getNewMessage(`💰🕙✅ payment message - valid`, messageMarkdown),
        true
      ),
      new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

  addMessage(
    withPaymentData(
      getNewMessage(`💰✅ payment message`, messageMarkdown),
      false
    )
  );

  addMessage(
    withDueDate(
      withPaymentData(
        getNewMessage(
          `💰🕙❌ payment - expired - invalid after due date`,
          messageMarkdown
        ),
        true
      ),
      new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
    )
  );

  addMessage(
    withDueDate(
      withPaymentData(
        getNewMessage(
          `💰🕙❌ payment - expired - not invalid after due date`,
          messageMarkdown
        ),
        false
      ),
      new Date(now.getTime() - 60 * 1000 * 60 * 24 * 3)
    )
  );

  addMessage(
    withDueDate(
      getNewMessage(`🕙✅ due date - valid`, messageMarkdown),
      new Date(now.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

  addMessage(
    withDueDate(
      getNewMessage(`🕙❌ due date - expired`, messageMarkdown),
      new Date(now.getTime() - 60 * 1000 * 60 * 24 * 8)
    )
  );
};

createMessages();
export const getMessageWithoutContent = (): CreatedMessageWithoutContentCollection => ({
  items: messagesWithContent.map(m => ({
    id: m.id,
    fiscal_code: fiscalCode as FiscalCode,
    created_at: m.created_at,
    sender_service_id: m.sender_service_id,
    time_to_live: m.time_to_live
  }))
});
addHandler(messageRouter, "get", addApiV1Prefix("/messages"), (req, res) => {
  res.json(getMessageWithoutContent());
});

addHandler(
  messageRouter,
  "get",
  addApiV1Prefix("/messages/:id"),
  (req, res) => {
    // retrieve the messageIndex from id
    const msgIndex = messagesWithContent.findIndex(
      item => item.id === req.params.id
    );
    if (msgIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
    }
    res.json(messagesWithContent[msgIndex]);
  }
);
