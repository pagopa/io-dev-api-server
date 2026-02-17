import { fakerIT as faker } from "@faker-js/faker";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { TransactionInfo } from "../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { NoticeDetailResponse } from "../../../../generated/definitions/pagopa/transactions/NoticeDetailResponse";
import { NoticeListItem } from "../../../../generated/definitions/pagopa/transactions/NoticeListItem";
import { generateRandomInfoNotice } from "../utils/transactions";

const mockedTaxCodes = ["1199250158", "13756881002", "262700362", "31500945"];

const receiptSubjects = [
  "Tassa sui rifiuti",
  "Imposta comunale immobiliare",
  "Bollo auto",
  "Canone RAI",
  "Imposta ipotecaria",
  "Diritti di segreteria",
  "Sanzione amministrativa",
  "Contributi sociali",
  "Tassa di concessione governativa",
  "Imposta di registro",
  "Contributo provinciale",
  "Tassa provinciale per i rifiuti",
  "Diritti di istruttoria",
  "Sanzione traffico",
  "Multa amministrativa"
];

type EventId = NoticeListItem["eventId"];

const userNotices: NoticeListItem[] = [];
const notices = new Map<EventId, NoticeDetailResponse>();

const getUserNotices = () => [...userNotices];

const getNoticeDetails = (eventId: EventId) =>
  pipe(
    notices,
    O.fromNullable,
    O.chain(notices => O.fromNullable(notices.get(eventId)))
  );

const addUserNotice = (transaction: NoticeListItem) => {
  // eslint-disable-next-line functional/immutable-data
  userNotices.push(transaction);
};

const removeUserNotice = (eventId: EventId) => {
  // Remove all notices with the given eventId
  // eslint-disable-next-line functional/immutable-data
  userNotices.splice(
    0,
    userNotices.length,
    ...userNotices.filter(n => n.eventId !== eventId)
  );
  removeNoticeDetails(eventId);
};

const addNoticeDetails = (eventId: EventId, notice: NoticeDetailResponse) => {
  notices.set(eventId, notice);
};

const removeNoticeDetails = (eventId: EventId) => {
  notices.delete(eventId);
};

const generateUserNotice = (
  eventId: EventId,
  idx: number,
  additionalTransactionInfo: Partial<TransactionInfo> = {},
  notice?: NoticeListItem
) => {
  const noticeToAdd = notice || {
    eventId,
    payeeName: faker.company.name(),
    payeeTaxCode:
      mockedTaxCodes[
        faker.number.int({ min: 0, max: mockedTaxCodes.length - 1 })
      ],
    isDebtor: false,
    isPayer: true,
    amount: additionalTransactionInfo.payments?.[0]?.amount.toString() || "",
    noticeDate: new Date(
      new Date().setDate(new Date().getDate() - 2 * idx)
    ).toISOString(),
    isCart: false
  };

  const cartList = Array.from(
    { length: faker.number.int({ min: 1, max: 2 }) },
    () => ({
      subject:
        receiptSubjects[
          faker.number.int({ min: 0, max: receiptSubjects.length - 1 })
        ],
      amount: faker.finance.amount({ min: 1, max: 1000 }),
      payee: {
        name: noticeToAdd.payeeName,
        taxCode: noticeToAdd.payeeTaxCode
      },
      debtor: {
        name: faker.person.fullName(),
        taxCode: faker.string.alphanumeric(16).toUpperCase()
      },
      refNumberType: "IBAN",
      refNumberValue: faker.number
        .int({ min: 100000000000, max: 999999999999 })
        .toString()
    })
  );

  const updatedNotice = notice
    ? noticeToAdd
    : {
        ...noticeToAdd,
        isCart: cartList.length > 1,
        amount: cartList
          .reduce((acc, item) => acc + Number(item.amount), 0)
          .toString()
      };

  addUserNotice(updatedNotice);

  const noticeDetails: NoticeDetailResponse = {
    infoNotice: generateRandomInfoNotice(cartList),
    carts: cartList
  };
  addNoticeDetails(eventId, noticeDetails);
  return updatedNotice;
};

const addMockedCartNotices = () => {
  const cartConfig = [
    {
      count: 5,
      payeeName: "Ministero delle infrastrutture e dei trasporti",
      payeeTaxCode: "97532760580"
    },
    {
      count: 2,
      payeeName: "EC_TE",
      payeeTaxCode: "77777777777"
    }
  ];

  cartConfig.forEach(config => {
    const cartId = faker.string.uuid();
    const cartPrefix = `test-ricevute-carrello-${cartId}-0_CART_`;
    const cartItems = [];

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < config.count; i += 1) {
      const amount = faker.finance.amount({ min: 10, max: 150 });
      const notice: NoticeListItem = {
        eventId: cartPrefix,
        payeeName: config.payeeName,
        payeeTaxCode: config.payeeTaxCode,
        amount,
        noticeDate: new Date(
          new Date().setDate(new Date().getDate() - i)
        ).toISOString(),
        isCart: true,
        isPayer: true,
        isDebtor: false
      };

      // Build cart items for the detail response
      // eslint-disable-next-line functional/immutable-data
      cartItems.push({
        subject:
          receiptSubjects[
            faker.number.int({ min: 0, max: receiptSubjects.length - 1 })
          ],
        amount,
        payee: {
          name: config.payeeName,
          taxCode: config.payeeTaxCode
        },
        debtor: {
          name: faker.person.fullName(),
          taxCode: faker.string.alphanumeric(16).toUpperCase()
        },
        refNumberType: "IBAN",
        refNumberValue: faker.number
          .int({ min: 100000000000, max: 999999999999 })
          .toString()
      });

      addUserNotice(notice);
    }

    // Add notice details once for the entire cart with all items
    const noticeDetails: NoticeDetailResponse = {
      infoNotice: generateRandomInfoNotice(cartItems),
      carts: cartItems
    };
    addNoticeDetails(cartPrefix, noticeDetails);
  });

  // Add some regular (non-cart) notices
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < 5; i += 1) {
    generateUserNotice(faker.string.uuid(), i);
  }
};

const shuffleNotices = () => {
  // eslint-disable-next-line functional/immutable-data
  userNotices.sort(() => faker.number.int({ min: -1, max: 1 }));
};

// At server startup
addMockedCartNotices();
// Comment out to keep notices in order addedMockedCartNotices();
shuffleNotices();

export default {
  addUserNotice,
  getUserNotices,
  getNoticeDetails,
  generateUserNotice,
  removeUserNotice
};
