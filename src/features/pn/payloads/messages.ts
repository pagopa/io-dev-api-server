import { identity, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { faker } from "@faker-js/faker/locale/it";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import {
  IoDevServerConfig,
  PNMessageTemplate,
  PNMessageTemplateWrapper
} from "../../../types/config";
import { ThirdPartyMessageWithContent } from "../../../../generated/definitions/backend/ThirdPartyMessageWithContent";
import ServicesDB from "../../../persistence/services";
import PaymentDB from "../../../persistence/payments";
import { messageMarkdown } from "../../../utils/variables";
import {
  createMessage,
  thirdPartyAttachmentFromAbsolutePathArray,
  withContent
} from "../../../payloads/message";
import { getRandomValue } from "../../../utils/random";
import { CreatedMessageWithContent } from "../../../../generated/definitions/backend/CreatedMessageWithContent";
import { OrganizationName } from "../../../../generated/definitions/backend/OrganizationName";
import { FiscalCode } from "../../../../generated/definitions/backend/FiscalCode";
import { OrganizationFiscalCode } from "../../../../generated/definitions/backend/OrganizationFiscalCode";
import { NotificationRecipient } from "../types/notificationRecipient";
import { PaymentDataWithRequiredPayee } from "../../../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import { PaymentStatus } from "../../../types/PaymentStatus";
import { currentProfile } from "../../../payloads/profile";
import { eitherMakeBy } from "../../../utils/array";
import { rptId } from "../../../utils/payment";
import { Detail_v2Enum } from "../../../../generated/definitions/backend/PaymentProblemJson";
import { listDir } from "../../../utils/file";
import { ThirdPartyAttachment } from "../../../../generated/definitions/backend/ThirdPartyAttachment";
import { assetsFolder } from "../../../config";
import {
  pnOptInCTA,
  pnOptInServiceId,
  pnServiceId
} from "../services/services";
import { getNewMessage } from "../../../populate-persistence";

export const createPNOptInMessage = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.messages.pnOptInMessage ?? false,
    B.fold(
      () => [],
      () => [
        getNewMessage(
          customConfig,
          `PN OptIn CTA`,
          pnOptInCTA + messageMarkdown,
          undefined,
          undefined,
          pnOptInServiceId
        )
      ]
    )
  );

export const createPNMessages = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.services.specialServices.pn,
    O.fromPredicate(identity),
    O.chain(_ =>
      pipe(
        customConfig.messages.pnMessageTemplateWrappers,
        O.fromNullable,
        O.map(pnMessageTemplateWrappers =>
          A.flatten(
            pipe(
              pnMessageTemplateWrappers as PNMessageTemplateWrapper[],
              A.mapWithIndex((templateIndex, pnMessageTemplateWrapper) =>
                A.makeBy(pnMessageTemplateWrapper.count, messageIndex =>
                  createPnMessage(
                    pnMessageTemplateWrapper.template,
                    customConfig.profile.attrs.fiscal_code,
                    templateIndex,
                    messageIndex,
                    messageMarkdown
                  )
                )
              )
            )
          )
        )
      )
    ),
    O.getOrElse(() => [] as CreatedMessageWithContentAndAttachments[])
  );

const createPnMessage = (
  template: PNMessageTemplate,
  fiscalCode: FiscalCode,
  templateIndex: number,
  messageIndex: number,
  markdown: string
): ThirdPartyMessageWithContent =>
  pipe(
    ServicesDB.getService(pnServiceId),
    O.fromNullable,
    O.fold(
      () => {
        throw Error(
          `getNewPnMessage: unable to find service PN service with id (${pnServiceId})`
        );
      },
      pnService =>
        pipe(
          {
            sender: `Comune di Milano - ${templateIndex} / ${messageIndex}`,
            subject: "infrazione al codice della strada"
          },
          sharedData =>
            pipe(
              createMessage(fiscalCode, pnServiceId),
              createdMessageWithoutContent =>
                withContent(
                  createdMessageWithoutContent,
                  `${sharedData.sender}: ${sharedData.subject}`,
                  markdown
                ),
              createdMessageWithContent =>
                pipe(
                  createPNMessageWithContent(
                    template,
                    createdMessageWithContent,
                    pnService.organization_fiscal_code,
                    pnService.organization_name,
                    faker.helpers.replaceSymbols("######-#-####-####-#"),
                    sharedData.sender,
                    sharedData.subject,
                    "È stata notificata una infrazione al codice per un veicolo intestato a te: i dettagli saranno consultabili nei documenti allegati.",
                    getRandomValue(new Date(), faker.date.past(), "messages")
                  ),
                  E.fold(
                    errors => {
                      throw Error(errors.toString());
                    },
                    _ => _
                  )
                )
            )
        )
    )
  );

const createPNMessageWithContent = (
  template: PNMessageTemplate,
  message: CreatedMessageWithContent,
  organization_fiscal_code: OrganizationFiscalCode,
  organizationName: OrganizationName,
  iun: string,
  senderDenomination: string | undefined,
  subject: string,
  abstract: string | undefined,
  sentAt: Date
): E.Either<string[], ThirdPartyMessageWithContent> =>
  pipe(
    createPNRecipients(organization_fiscal_code, organizationName, template),
    E.map(pnRecipients => ({
      ...message,
      third_party_message: {
        attachments: createPNAttachments(),
        details: {
          iun,
          senderDenomination,
          subject,
          abstract,
          sentAt,
          notificationStatusHistory: createPNTimeline(),
          recipients: pnRecipients
        }
      }
    }))
  );

const createPNRecipients = (
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: OrganizationName,
  template: PNMessageTemplate
): E.Either<string[], NotificationRecipient[]> =>
  pipe(
    E.right([] as NotificationRecipient[]),
    E.chain(accumulator =>
      createPNRecipientsAndAccumulate(
        accumulator,
        template.unrelatedPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessablePayment(
            rptId(paymentDataWithRequiredPayee),
            paymentDataWithRequiredPayee.amount,
            paymentDataWithRequiredPayee.payee.fiscal_code,
            organizationName
          )
        ),
        "VLRCMD74S01B655P" as FiscalCode
      )
    ),
    E.chain(accumulator =>
      createPNRecipientsAndAccumulate(
        accumulator,
        template.unpaidValidPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessablePayment(
            rptId(paymentDataWithRequiredPayee),
            paymentDataWithRequiredPayee.amount,
            paymentDataWithRequiredPayee.payee.fiscal_code,
            organizationName
          )
        )
      )
    ),
    E.chain(accumulator =>
      createPNRecipientsAndAccumulate(
        accumulator,
        template.unpaidExpiredPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode, true),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PAA_PAGAMENTO_SCADUTO
          )
        )
      )
    ),
    E.chain(accumulator =>
      createPNRecipientsAndAccumulate(
        accumulator,
        template.failedPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PPT_IBAN_NON_CENSITO
          )
        )
      )
    ),
    E.chain(accumulator =>
      createPNRecipientsAndAccumulate(
        accumulator,
        template.paidPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
          )
        )
      )
    )
  );

const createPNRecipientsAndAccumulate = (
  accumulator: NotificationRecipient[],
  count: number,
  paymentDataGenerator: () => E.Either<string[], PaymentDataWithRequiredPayee>,
  maybePaymentStatusGenerator: O.Option<
    (input: PaymentDataWithRequiredPayee) => PaymentStatus
  >,
  fiscalCode: FiscalCode = currentProfile.fiscal_code
) =>
  pipe(
    eitherMakeBy(count, _ =>
      createPNMessageRecipient(
        pipe(
          paymentDataGenerator(),
          E.map(paymentDataWithRequiredPayee =>
            pipe(
              maybePaymentStatusGenerator,
              O.map(paymentStatusGenerator =>
                paymentStatusGenerator(paymentDataWithRequiredPayee)
              ),
              _ => paymentDataWithRequiredPayee
            )
          )
        ),
        fiscalCode
      )
    ),
    E.map(notificationRecipients => [...accumulator, ...notificationRecipients])
  );

const createPNMessageRecipient = (
  paymentDataWithRequiredPayee: E.Either<
    string[],
    PaymentDataWithRequiredPayee
  >,
  fiscalCode: FiscalCode
): E.Either<string[], NotificationRecipient> =>
  pipe(
    paymentDataWithRequiredPayee,
    E.map(paymentDataWithRequiredPayee => ({
      taxId: fiscalCode,
      denomination: `${currentProfile.name} ${currentProfile.family_name}`,
      payment: {
        noticeCode: paymentDataWithRequiredPayee.notice_number,
        creditorTaxId: paymentDataWithRequiredPayee.payee.fiscal_code
      }
    }))
  );

const createPNAttachments = (): ReadonlyArray<ThirdPartyAttachment> =>
  pipe(
    listDir(assetsFolder + "/messages/pn/attachments"),
    thirdPartyAttachmentFromAbsolutePathArray
  );

const createPNTimeline = () => [
  {
    status: "ACCEPTED",
    activeFrom: "2022-07-07T13:26:59.494+00:00",
    relatedTimelineElements: [
      "TPAK-PJUT-RALE-202207-X-1_request_accepted",
      "TPAK-PJUT-RALE-202207-X-1_aar_gen_0",
      "TPAK-PJUT-RALE-202207-X-1_send_courtesy_message_0_index_0",
      "TPAK-PJUT-RALE-202207-X-1_get_address0_source_DigitalAddressSourceInt.PLATFORM(value=PLATFORM)_attempt_0"
    ]
  },
  {
    status: "DELIVERING",
    activeFrom: "2022-07-07T13:27:15.913+00:00",
    relatedTimelineElements: [
      "TPAK-PJUT-RALE-202207-X-1_send_digital_domicile0_source_DigitalAddressSourceInt.SPECIAL(value=SPECIAL)_attempt_1",
      "TPAK-PJUT-RALE-202207-X-1_get_address0_source_DigitalAddressSourceInt.SPECIAL(value=SPECIAL)_attempt_0"
    ]
  },
  {
    status: "VIEWED",
    activeFrom: "2022-07-07T14:26:22.669+00:00",
    relatedTimelineElements: ["TPAK-PJUT-RALE-202207-X-1_notification_viewed_0"]
  }
];
