import { Either, isLeft, right } from "fp-ts/lib/Either";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import {
  ioOrganizationFiscalCode,
  ioOrganizationName
} from "../../services/persistence/services/factory";
import { PaymentsDatabase } from "../../../persistence/payments";
import { ioDevServerConfig } from "../../../config";
import { SendConfig } from "../types/sendConfig";
import { DocumentsRepository } from "./documentRepository";
import { NotificationRepository } from "./notificationRepository";

export const initializeSENDRepositoriesIfNeeded = (
  organizationFiscalCode: OrganizationFiscalCode = ioOrganizationFiscalCode,
  organizationName: string = ioOrganizationName,
  sendConfig: SendConfig = ioDevServerConfig.send,
  userFiscalCode: string = ioDevServerConfig.profile.attrs.fiscal_code
): Either<string, boolean> => {
  const documentsInitializationEither =
    DocumentsRepository.initializeIfNeeded();
  if (isLeft(documentsInitializationEither)) {
    return documentsInitializationEither;
  }

  const notificationsInitializationEither =
    NotificationRepository.initializeIfNeeded(
      sendConfig,
      userFiscalCode,
      DocumentsRepository,
      organizationFiscalCode,
      organizationName,
      PaymentsDatabase
    );
  if (isLeft(notificationsInitializationEither)) {
    return notificationsInitializationEither;
  }
  return right(
    documentsInitializationEither.right ||
      notificationsInitializationEither.right
  );
};
