import { Either, isRight, left, right } from "fp-ts/lib/Either";
import { InitializedProfile } from "../../../../generated/definitions/backend/InitializedProfile";
import { AARQRCodeCheckResponse } from "../../../../generated/definitions/pn/aar/AARQRCodeCheckResponse";
import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { getProfile } from "../../../persistence/profile/profile";
import { ExpressFailure } from "../../../utils/expressDTO";
import { AARRepository } from "../repositories/aarRepository";
import { MandateRepository } from "../repositories/mandateRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { UserInfo } from "../../../../generated/definitions/pn/aar/UserInfo";

export type NotificationOrMandateData = AARQRCodeCheckResponse;

export const notificationOrMandateDataFromQRCode = (
  inputQRCodeContent: string,
  taxId: string
): Either<ExpressFailure, NotificationOrMandateData> => {
  const aar = AARRepository.getAARByQRCodeContent(inputQRCodeContent);
  if (aar == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "AAR not found",
        `Unable to find AAR for input QRCode content (${inputQRCodeContent})`
      )
    });
  }
  const notificationIUN = aar.notificationIUN as AARQRCodeCheckResponse["iun"];
  const notification = NotificationRepository.getNotification(notificationIUN);
  if (notification == null) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Notification not found",
        `Input QRCode content has been recognized but no notification exists for its associated IUN. Check your dev-server configuration file for matching iun between AAR and Notifications (${aar.notificationIUN}) (${aar.qrCodeContent})`
      )
    });
  }
  if (notification.recipientFiscalCode.toUpperCase() !== taxId.toUpperCase()) {
    const mandates = MandateRepository.getActiveMandates(
      notificationIUN,
      taxId
    );
    if (mandates.length === 0) {
      return left({
        httpStatusCode: 403,
        reason: {
          iun: notificationIUN,
          denomination: fakeDenominationFromFiscalCode(
            notification.recipientFiscalCode
          )
        }
      });
    }
    const firstValidMandate = mandates[0];
    const firstValidMandateId = firstValidMandate.mandateId;
    return right({
      recipientInfo: recipientInfoFromprofileOrDefault(),
      iun: notificationIUN,
      mandateId: firstValidMandateId
    });
  }
  return right({
    recipientInfo: recipientInfoFromprofileOrDefault(),
    iun: notificationIUN
  });
};

export const fakeDenominationFromFiscalCode = (fiscalCode: string) => {
  const nameInitial = fiscalCode.length > 0 ? fiscalCode[0] : "J";
  const surnameInitial = fiscalCode.length > 3 ? fiscalCode[3] : "S";
  return `${fakeNameFromCharacter(nameInitial)} ${fakeSurnameFromCharacter(
    surnameInitial
  )}`;
};

// eslint-disable-next-line complexity
const fakeNameFromCharacter = (character: string) => {
  switch (character) {
    case "A":
      return "Alice";
    case "B":
      return "Beatrice";
    case "C":
      return "Clara";
    case "D":
      return "Diana";
    case "E":
      return "Ellen";
    case "F":
      return "Fiona";
    case "G":
      return "Grace";
    case "H":
      return "Helen";
    case "I":
      return "Irene";
    case "J":
      return "Jane";
    case "K":
      return "Katherine";
    case "L":
      return "Laura";
    case "M":
      return "Mary";
    case "N":
      return "Nora";
    case "O":
      return "Olivia";
    case "P":
      return "Penelope";
    case "Q":
      return "Quinn";
    case "R":
      return "Rose";
    case "S":
      return "Sophia";
    case "T":
      return "Theresa";
    case "U":
      return "Ursula";
    case "V":
      return "Victoria";
    case "W":
      return "Winifred";
    case "X":
      return "Xena";
    case "Y":
      return "Yvonne";
    case "Z":
      return "Zelda";
    default:
      return "Ellen";
  }
};

// eslint-disable-next-line complexity
const fakeSurnameFromCharacter = (character: string) => {
  switch (character) {
    case "A":
      return "Anderson";
    case "B":
      return "Brown";
    case "C":
      return "Carter";
    case "D":
      return "Davis";
    case "E":
      return "Evans";
    case "F":
      return "Foster";
    case "G":
      return "Green";
    case "H":
      return "Harris";
    case "I":
      return "Irwin";
    case "J":
      return "Johnson";
    case "K":
      return "King";
    case "L":
      return "Lee";
    case "M":
      return "Miller";
    case "N":
      return "Nelson";
    case "O":
      return "Owens";
    case "P":
      return "Parker";
    case "Q":
      return "Quinn";
    case "R":
      return "Ripley";
    case "S":
      return "Scott";
    case "T":
      return "Taylor";
    case "U":
      return "Upton";
    case "V":
      return "Vaughn";
    case "W":
      return "Williams";
    case "X":
      return "Xavier";
    case "Y":
      return "Young";
    case "Z":
      return "Zimmerman";
    default:
      return "Ripley";
  }
};

const recipientInfoFromprofileOrDefault = (): UserInfo => {
  const profileObject = getProfile().payload;
  const initializedProfile = InitializedProfile.decode(profileObject);
  if (isRight(initializedProfile)) {
    return {
      denomination: `${initializedProfile.right.name} ${initializedProfile.right.family_name}`,
      taxId: initializedProfile.right.fiscal_code
    };
  }
  return {
    denomination: `${ioDevServerConfig.profile.attrs.name} ${ioDevServerConfig.profile.attrs.family_name}`,
    taxId: ioDevServerConfig.profile.attrs.fiscal_code
  };
};
