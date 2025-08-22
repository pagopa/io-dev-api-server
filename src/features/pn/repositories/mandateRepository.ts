/* eslint-disable functional/immutable-data */
import { ulid } from "ulid";
import { fakerIT as faker } from "@faker-js/faker";
import { Mandate } from "../models/Mandate";
import { SendConfig } from "../types/sendConfig";
import { ValidationCode } from "../models/ValidationCode";

const defaultMandateTimeToLiveSeconds = 120;
const defaultValidationCodeTimeToLiveSeconds = 60;

const mandates = new Array<Mandate>();
const settings = new Map<
  "mandateTimeToLiveSeconds" | "validationCodeTimeToLiveSeconds",
  number
>();
// eslint-disable-next-line sonarjs/no-unused-collection
const validationCodes = new Map<string, ValidationCode>();

export interface IMandateRepository {
  createValidationCode: (
    notificationIun: string,
    qrCodeContent: string
  ) => ValidationCode;
  initializeIfNeeded: (
    configuration: SendConfig,
    profileFiscalCode: string
  ) => void;
  getActiveMandates: (
    notificationIUN: string,
    representativeFiscalCode: string
  ) => ReadonlyArray<Mandate>;
  getFirstValidMandate: (
    mandateId: string,
    notificationIUN: string,
    representativeFiscalCode: string
  ) => Mandate | undefined;
  getMandateList: () => ReadonlyArray<Mandate>;
}

const getValidationCodeTimeToLiveSeconds = (): number =>
  settings.get("validationCodeTimeToLiveSeconds") ??
  defaultValidationCodeTimeToLiveSeconds;

const createValidationCode = (
  notificationIun: string,
  qrCodeContent: string
): ValidationCode => {
  const validationCodeTimeToLiveSeconds = getValidationCodeTimeToLiveSeconds();
  const timeToLive = new Date();
  timeToLive.setTime(
    timeToLive.getTime() + 1000 * validationCodeTimeToLiveSeconds
  );
  const validationCode: ValidationCode = {
    mandateId: ulid(),
    notificationIUN: notificationIun,
    qrCodeContent,
    timeToLive,
    validationCode: faker.word.sample()
  };
  validationCodes.set(validationCode.mandateId, validationCode);
  return validationCode;
};

const initializeIfNeeded = (
  configuration: SendConfig,
  profileFiscalCode: string
): void => {
  if (mandates.length > 0) {
    return;
  }
  settings.set(
    "mandateTimeToLiveSeconds",
    configuration.mandateTimeToLiveSeconds ?? defaultMandateTimeToLiveSeconds
  );
  settings.set(
    "validationCodeTimeToLiveSeconds",
    configuration.validationCodeTimeToLiveSeconds ??
      defaultValidationCodeTimeToLiveSeconds
  );
  configuration.sendMandates.forEach(mandateConfiguration => {
    const iun = mandateConfiguration.iun;
    const mandate: Mandate = {
      mandateId: ulid(),
      notificationIUN: iun,
      representativeFiscalCode: profileFiscalCode,
      // This is a permant mandate, so it does not use the
      // 'mandateTimeToLiveSeconds', which is use for
      // temporary mandates
      timeToLive: faker.date.future({ years: 5 })
    };
    mandates.push(mandate);
  });
};

const getActiveMandates = (
  notificationIUN: string,
  representativeFiscalCode: string
): ReadonlyArray<Mandate> =>
  mandates.filter(
    mandate =>
      mandate.notificationIUN === notificationIUN &&
      mandate.representativeFiscalCode.toUpperCase() ===
        representativeFiscalCode.toUpperCase() &&
      new Date() < mandate.timeToLive
  );

const getFirstValidMandate = (
  mandateId: string,
  notificationIUN: string,
  representativeFiscalCode: string
): Mandate | undefined =>
  mandates.find(
    mandate =>
      mandate.notificationIUN === notificationIUN &&
      mandate.mandateId === mandateId &&
      mandate.representativeFiscalCode === representativeFiscalCode &&
      new Date() < mandate.timeToLive
  );

const getMandateList = (): ReadonlyArray<Mandate> =>
  mandates.map(mandate => ({ ...mandate }));

export const MandateRepository: IMandateRepository = {
  createValidationCode,
  initializeIfNeeded,
  getActiveMandates,
  getFirstValidMandate,
  getMandateList
};
