/* import { fakerIT as faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { Notification } from "../models/Notification";
import { SendConfig } from "../types/sendConfig";

const notifications = new Map<string, Notification>();

export const initializeIfNeeded = (
  config: SendConfig,
  devServerUserFiscalCode: string
) => {
  for (const [
    index,
    notificationConfig
  ] of config.sendNotifications.entries()) {
    const abstract = notificationConfig.abstract ?? faker.lorem.paragraphs(2);
    const acknowledged = notificationConfig.acknowledged ?? false;
    const cancelled = notificationConfig.cancelled ?? false;
    const iun = notificationConfig.iun ?? ulid();
    const senderDenomination =
      notificationConfig.senderDenomination ?? faker.company.name();
    const subject = notificationConfig.subject ?? faker.lorem.sentence();
    const userIsRecipient = notificationConfig.userIsRecipient ?? true;
    const notificationFiscalCode = userIsRecipient
      ? devServerUserFiscalCode
      : generateFiscalCodePlaceholder();

    const attachmentsConfig = notificationConfig.attachments;

    const paymentsConfig = notificationConfig.payments;

    const timelineConfig = notificationConfig.timeline;
  }
};

function generateFiscalCodePlaceholder() {
  const fiscalCodeRegex =
    /[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]/;
  return faker.helpers.fromRegExp(fiscalCodeRegex);
}
 */
