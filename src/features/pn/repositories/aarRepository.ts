/* eslint-disable functional/immutable-data */
import { v4 as uuid } from "uuid";
import { AAR } from "../models/AAR";
import { SendConfig } from "../types/sendConfig";

const aars = new Array<AAR>();

export interface IAARRepository {
  getQRCodes: () => string[];
  initializeIfNeeded: (configuration: SendConfig) => void;
}

const initializeIfNeeded = (configuration: SendConfig) => {
  if (aars.length > 0) {
    return;
  }
  const aarConfigurations = configuration.sendAARs;
  aarConfigurations.forEach(aarConfiguration => {
    const baseUrl =
      configuration.aarQRCodeUrl ?? "https://cittadini.notifichedigitali.it/";
    const notificationIUN = aarConfiguration.iun;
    const aarValue = `${notificationIUN}_PF-${uuid()}_${uuid()}`;
    const base64AARValue = Buffer.from(aarValue).toString("base64");
    const qrCodeContent = `${baseUrl}?aar=${base64AARValue}`;
    const aar: AAR = {
      notificationIUN,
      qrCodeContent,
      tosAccepted: !!aarConfiguration.tosAccepted
    };
    aars.push(aar);
  });
};

const getQRCodes = (): string[] => aars.map(aar => aar.qrCodeContent);

export const AARRepository: IAARRepository = {
  getQRCodes,
  initializeIfNeeded
};
