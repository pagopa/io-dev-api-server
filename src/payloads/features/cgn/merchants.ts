import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { faker } from "@faker-js/faker/locale/it";
import { range } from "fp-ts/lib/NonEmptyArray";
import { Address } from "../../../../generated/definitions/cgn/merchants/Address";
import { Discount } from "../../../../generated/definitions/cgn/merchants/Discount";
import {
  DiscountCodeType,
  DiscountCodeTypeEnum
} from "../../../../generated/definitions/cgn/merchants/DiscountCodeType";
import { Merchant } from "../../../../generated/definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../generated/definitions/cgn/merchants/OfflineMerchant";
import { OfflineMerchants } from "../../../../generated/definitions/cgn/merchants/OfflineMerchants";
import { OnlineMerchant } from "../../../../generated/definitions/cgn/merchants/OnlineMerchant";
import { OnlineMerchants } from "../../../../generated/definitions/cgn/merchants/OnlineMerchants";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../generated/definitions/cgn/merchants/ProductCategory";
import { getRandomValue } from "../../../utils/random";
import { serverUrl } from "../../../utils/server";
import { ALL_NATIONAL_ADDRESSES_TEXT } from "./utils";

const availableCategories: ReadonlyArray<ProductCategory> = [
  ProductCategoryEnum.cultureAndEntertainment,
  ProductCategoryEnum.health,
  ProductCategoryEnum.learning,
  ProductCategoryEnum.sports,
  ProductCategoryEnum.home,
  ProductCategoryEnum.telephonyAndInternet,
  ProductCategoryEnum.bankingServices,
  ProductCategoryEnum.travelling,
  ProductCategoryEnum.sustainableMobility,
  ProductCategoryEnum.jobOffers
];

const discountTypes: ReadonlyArray<DiscountCodeType> = [
  DiscountCodeTypeEnum.api,
  DiscountCodeTypeEnum.bucket,
  DiscountCodeTypeEnum.static,
  DiscountCodeTypeEnum.landingpage
];

// eslint-disable-next-line functional/no-let
let millis = new Date().getTime();

const generateRandomCategoriesList = (): ReadonlyArray<ProductCategoryEnum> => {
  const categoriesArray = range(
    0,
    faker.datatype.number({ min: 1, max: 3 })
  ).map<ProductCategory>(
    __ =>
      availableCategories[
        faker.datatype.number({
          min: 0,
          max: availableCategories.length - 1
        })
      ]
  );
  const categoriesSet = new Set(categoriesArray);

  return [...Array.from(categoriesSet)];
};

export const onlineMerchants: OnlineMerchants = {
  items: range(
    0,
    faker.datatype.number({ min: 1, max: 15 })
  ).map<OnlineMerchant>(_ => {
    faker.seed(millis++);
    const discountType =
      discountTypes[
        faker.datatype.number({ min: 0, max: discountTypes.length - 1 })
      ];
    const newDiscounts = faker.datatype.boolean();
    return {
      discountCodeType: discountType,
      id: faker.datatype.number().toString() as NonEmptyString,
      name: `${faker.company.name()} [Online]` as NonEmptyString,
      productCategories: generateRandomCategoriesList(),
      websiteUrl: faker.internet.url() as NonEmptyString,
      newDiscounts,
      numberOfNewDiscounts: newDiscounts
        ? faker.datatype.number({ min: 1, max: 99 })
        : undefined
    };
  })
};

export const offlineMerchants: OfflineMerchants = {
  items: range(
    0,
    faker.datatype.number({ min: 1, max: 15 })
  ).map<OfflineMerchant>(_ => {
    faker.seed(millis++);
    const newDiscounts = faker.datatype.boolean();
    return {
      id: faker.datatype.number().toString() as NonEmptyString,
      name: `${faker.company.name()} [Offline]` as NonEmptyString,
      productCategories: generateRandomCategoriesList(),
      address: {
        full_address: faker.address.streetAddress(true) as NonEmptyString,
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude())
      },
      distance: faker.datatype.number({
        min: 0,
        max: 50000
      }) as NonNegativeInteger,
      newDiscounts,
      numberOfNewDiscounts: newDiscounts
        ? faker.datatype.number({ min: 1, max: 99 })
        : undefined
    };
  })
};

const discountUrl =
  `http://${serverUrl}/merchant_landing` as Discount["discountUrl"];

const generateDiscountMethod = (discountCodeType: DiscountCodeTypeEnum) => {
  switch (discountCodeType) {
    case "static":
      return {
        staticCode: faker.datatype.string().toString() as NonEmptyString,
        discountUrl: getRandomValue(false, faker.datatype.boolean(), "global")
          ? discountUrl
          : undefined
      };
    case "landingpage":
      return {
        landingPageReferrer: faker.datatype.string(
          6
        ) as Discount["landingPageReferrer"],
        landingPageUrl: discountUrl
      };
    case "api":
    case "bucket":
      return {
        discountUrl: getRandomValue(false, faker.datatype.boolean(), "global")
          ? discountUrl
          : undefined
      };
    default:
      return {};
  }
};

const generateDiscount = (
  productCategories: ReadonlyArray<ProductCategoryEnum>,
  discountCodeType?: DiscountCodeTypeEnum
) => {
  const discountCategories = Array.from(
    new Set(
      range(0, faker.datatype.number({ min: 1, max: 4 })).map<ProductCategory>(
        __ =>
          productCategories[
            faker.datatype.number({
              min: 0,
              max: productCategories.length - 1
            })
          ]
      )
    )
  );
  const discount: Discount = {
    id: faker.datatype.number().toString() as NonEmptyString,
    name: faker.commerce.productName() as NonEmptyString,
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    discount: getRandomValue(false, faker.datatype.boolean(), "global")
      ? faker.datatype.number({ min: 10, max: 30 })
      : undefined,
    description: getRandomValue(false, faker.datatype.boolean(), "global")
      ? (faker.lorem.lines(1) as NonEmptyString)
      : undefined,
    condition: getRandomValue(false, faker.datatype.boolean(), "global")
      ? (faker.lorem.lines(1) as NonEmptyString)
      : undefined,
    productCategories: discountCategories,
    isNew: faker.datatype.boolean()
  };

  return {
    ...discount,
    ...(discountCodeType ? generateDiscountMethod(discountCodeType) : {})
  };
};

export const generateMerchantDetail = (
  merchant: OnlineMerchant | OfflineMerchant
): Merchant => {
  if (OnlineMerchant.is(merchant)) {
    return {
      id: merchant.id,
      name: merchant.name,
      websiteUrl: merchant.websiteUrl,
      imageUrl: faker.image.imageUrl() as NonEmptyString,
      description: faker.lorem.paragraphs(2) as NonEmptyString,
      discountCodeType: merchant.discountCodeType,
      discounts: range(
        0,
        faker.datatype.number({ min: 1, max: 4 })
      ).map<Discount>(_ =>
        generateDiscount(merchant.productCategories, merchant.discountCodeType)
      ),
      allNationalAddresses: true
    };
  } else {
    const addresses = range(0, faker.datatype.number({ min: 0, max: 3 }));
    return {
      id: merchant.id,
      name: merchant.name,
      addresses: addresses.map<Address>(_ => ({
        full_address:
          addresses.length === 1
            ? (ALL_NATIONAL_ADDRESSES_TEXT as NonEmptyString)
            : (faker.address.streetAddress(true) as NonEmptyString)
      })),
      imageUrl: faker.image.imageUrl() as NonEmptyString,
      description: faker.lorem.paragraphs(2) as NonEmptyString,
      discounts: range(
        0,
        faker.datatype.number({ min: 1, max: 4 })
      ).map<Discount>(_ => generateDiscount(merchant.productCategories)),
      websiteUrl: faker.internet.url() as NonEmptyString,
      allNationalAddresses: addresses.length === 1
    };
  }
};

export const generateMerchantsAll = (): ReadonlyArray<Merchant> => {
  const merchants: ReadonlyArray<OnlineMerchant | OfflineMerchant> = [
    ...onlineMerchants.items,
    ...offlineMerchants.items
  ];

  return merchants.map(m => generateMerchantDetail(m));
};
