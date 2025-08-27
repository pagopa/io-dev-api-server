/* eslint-disable functional/immutable-data */
import { ulid } from "ulid";
import { fakerIT as faker } from "@faker-js/faker";
import { Mandate } from "../models/Mandate";
import { SendConfig } from "../types/sendConfig";

const mandates = new Array<Mandate>();

export interface IMandateRepository {
  initializeIfNeeded: (
    configuration: SendConfig,
    profileFiscalCode: string
  ) => void;
  getActiveMandates: (
    notificationIUN: string,
    representativeFiscalCode: string
  ) => ReadonlyArray<Mandate>;
}

const initializeIfNeeded = (
  configuration: SendConfig,
  profileFiscalCode: string
): void => {
  if (mandates.length > 0) {
    return;
  }
  configuration.sendMandates.forEach(mandateConfiguration => {
    const iun = mandateConfiguration.iun;
    const mandate: Mandate = {
      mandateId: ulid(),
      notificationIUN: iun,
      representativeFiscalCode: profileFiscalCode,
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

export const MandateRepository: IMandateRepository = {
  initializeIfNeeded,
  getActiveMandates
};
