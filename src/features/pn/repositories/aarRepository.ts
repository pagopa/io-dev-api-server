/* eslint-disable functional/immutable-data */
import { v4 as uuid } from "uuid";
import { AAR } from "../models/AAR";
import { SendConfig } from "../types/sendConfig";

const aars = new Array<AAR>();

export interface IAARRepository {
  getAAR: (notificationIun: string, qrCodeContent: string) => AAR | undefined;
  getAARByQRCodeContent: (qrCodeContent: string) => AAR | undefined;
  getAARList: () => ReadonlyArray<AAR>;
  initializeIfNeeded: (configuration: SendConfig) => void;
  updateAARTOSByInternalId: (internalId: string) => AAR | undefined;
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
      internalId: uuid(),
      notificationIUN,
      qrCodeContent,
      tosAccepted: !!aarConfiguration.tosAccepted
    };
    aars.push(aar);
  });
};

const getAAR = (notificationIun: string, qrCodeContent: string) =>
  aars.find(
    aar =>
      aar.notificationIUN === notificationIun &&
      aar.qrCodeContent === qrCodeContent
  );

const getAARList = (): ReadonlyArray<AAR> => aars.map(aar => ({ ...aar }));

const updateAARTOSByInternalId = (internalId: string): AAR | undefined => {
  const aar = aars.find(aar => aar.internalId === internalId);
  if (aar == null) {
    return undefined;
  }
  aar.tosAccepted = true;
  return aar;
};

const getAARByQRCodeContent = (qrCodeContent: string): AAR | undefined =>
  aars.find(aar => aar.qrCodeContent === qrCodeContent);

export const AARRepository: IAARRepository = {
  getAAR,
  getAARByQRCodeContent,
  getAARList,
  initializeIfNeeded,
  updateAARTOSByInternalId
};
