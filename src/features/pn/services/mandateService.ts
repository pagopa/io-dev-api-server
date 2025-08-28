import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { getProblemJson } from "../../../payloads/error";
import { MandateRepository } from "../repositories/mandateRepository";
import { ExpressFailure } from "../../../utils/expressDTO";
import { Mandate } from "../models/Mandate";
import { CreateMandateBody } from "../types/createMandateBody";
import { AARRepository } from "../repositories/aarRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { ValidationCode } from "../models/ValidationCode";
import { AcceptMandateBody } from "../types/acceptMandateBody";

export const checkAndVerifyExistingMandate = (
  iun: string,
  mandateId: string | undefined,
  taxId: string
): Either<ExpressFailure, Mandate> => {
  if (mandateId == null) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "User mismatch",
        `The specified notification does not belong to the user that is requesting it (${iun}) (${taxId})`
      )
    });
  }

  const mandate = MandateRepository.getFirstValidMandate(mandateId, iun, taxId);
  if (mandate == null) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "No valid mandate",
        `There is no valid mandate to access requested data belonging to notification (${mandateId}) (${iun}) (${taxId})`
      )
    });
  }

  return right(mandate);
};

export const checkAndCreateTemporaryMandate = (
  body: object,
  mandateId: string,
  taxId: string
): Either<ExpressFailure, Mandate> => {
  const acceptMandateBodyEither = AcceptMandateBody.decode(body);
  if (isLeft(acceptMandateBodyEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad body",
        `Unable to decode request body: it's either missing or has a bad data structure (${readableReportSimplified(
          acceptMandateBodyEither.left
        )})`
      )
    });
  }

  const validationCode = MandateRepository.getValidationCode(mandateId);
  if (validationCode == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Validation Code not found",
        `Unable to find a Validation Code associated with the provided 'mandateId' (${mandateId})`
      )
    });
  }

  // TODO CIE data validation

  const signedVerificationCode =
    acceptMandateBodyEither.right.signed_verification_code;
  // TODO decode signedVerificationCode
  if (signedVerificationCode !== validationCode.validationCode) {
    MandateRepository.deleteValidationCode(mandateId);
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "Bad signed verification code",
        `Provided signed verification code does not match the original validation code (${signedVerificationCode})`
      )
    });
  }

  if (validationCode.timeToLive <= new Date()) {
    MandateRepository.deleteValidationCode(mandateId);
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "Validation Code expired",
        `Provided signed verification code has expired (${signedVerificationCode})`
      )
    });
  }

  MandateRepository.deleteValidationCode(mandateId);
  const temporaryMandate = MandateRepository.createTemporaryMandate(
    mandateId,
    validationCode.notificationIUN,
    taxId
  );
  return right(temporaryMandate);
};

export const checkAndCreateValidationCode = (
  body: object,
  taxId: string
): Either<ExpressFailure, ValidationCode> => {
  const createMandateBodyEither = CreateMandateBody.decode(body);
  if (isLeft(createMandateBodyEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad body",
        `Unable to decode request body: it's either missing or has a bad data structure (${readableReportSimplified(
          createMandateBodyEither.left
        )})`
      )
    });
  }
  const notificationIun = createMandateBodyEither.right.iun;
  const qrCodeContent = createMandateBodyEither.right.qrcode;
  const aar = AARRepository.getAAR(notificationIun, qrCodeContent);
  if (aar == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad 'iun' and/or 'qrcode'",
        `Unable to find an AAR associated with provided 'iun' and 'qrcode' (${notificationIun}) (${qrCodeContent})`
      )
    });
  }

  const notification = NotificationRepository.getNotification(notificationIun);
  if (notification == null) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Notification not found",
        `Unable to find a Notification associated to the AAR. Check you config file for any IUN mismatch between 'sendAARs' and 'sendNotifications' (${notificationIun})`
      )
    });
  }
  if (notification.recipientFiscalCode === taxId) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "No mandate needed",
        `Requested Notification already belong to this user. There is no need to create a mandate (${notificationIun}) (${taxId})`
      )
    });
  }

  const activeMandates = MandateRepository.getActiveMandates(
    notificationIun,
    taxId
  );
  if (activeMandates.length > 0) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "Existing mandate",
        `There is already an existing Mandate for the requested notification and user (${notificationIun}) (${taxId})`
      )
    });
  }

  const validationCode = MandateRepository.createValidationCode(
    notificationIun,
    qrCodeContent
  );
  return right(validationCode);
};
