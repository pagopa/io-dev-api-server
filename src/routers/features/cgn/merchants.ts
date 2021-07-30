import { Router } from "express";
import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Discount } from "../../../../generated/definitions/cgn/merchants/Discount";
import { Merchant } from "../../../../generated/definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../generated/definitions/cgn/merchants/OfflineMerchant";
import { OfflineMerchants } from "../../../../generated/definitions/cgn/merchants/OfflineMerchants";
import { OfflineMerchantSearchRequest } from "../../../../generated/definitions/cgn/merchants/OfflineMerchantSearchRequest";
import { OnlineMerchant } from "../../../../generated/definitions/cgn/merchants/OnlineMerchant";
import { OnlineMerchants } from "../../../../generated/definitions/cgn/merchants/OnlineMerchants";
import { OnlineMerchantSearchRequest } from "../../../../generated/definitions/cgn/merchants/OnlineMerchantSearchRequest";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../generated/definitions/cgn/merchants/ProductCategory";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";

export const cgnMerchantsRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/cgn-operator-search${path}`);

const productCategories: ReadonlyArray<ProductCategory> = [
  ProductCategoryEnum.books,
  ProductCategoryEnum.arts,
  ProductCategoryEnum.connectivity,
  ProductCategoryEnum.health,
  ProductCategoryEnum.sports,
  ProductCategoryEnum.entertainments,
  ProductCategoryEnum.transportation,
  ProductCategoryEnum.travels
];

// tslint:disable-next-line: no-let
let millis = new Date().getTime();
export const onlineMerchants: OnlineMerchants = {
  items: range(1, 100).map<OnlineMerchant>(_ => {
    faker.seed(millis++);
    return {
      id: faker.datatype.number().toString() as NonEmptyString,
      name: faker.company.companyName() as NonEmptyString,
      productCategories: range(1, 3).map<ProductCategory>(
        __ =>
          productCategories[
            faker.datatype.number({ min: 0, max: productCategories.length - 1 })
          ]
      ),
      websiteUrl: faker.internet.url() as NonEmptyString
    };
  })
};

export const offlineMerchants: OfflineMerchants = {
  items: range(1, 100).map<OfflineMerchant>(_ => {
    faker.seed(millis++);
    return {
      id: faker.datatype.number().toString() as NonEmptyString,
      name: faker.company.companyName() as NonEmptyString,
      productCategories: range(1, 3).map<ProductCategory>(
        // tslint:disable-next-line:no-shadowed-variable
        _ =>
          productCategories[
            faker.datatype.number({ min: 0, max: productCategories.length - 1 })
          ]
      ),
      address: {
        full_address: faker.address.streetAddress(true) as NonEmptyString,
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude())
      },
      distance: faker.datatype.number({
        min: 0,
        max: 50000
      }) as NonNegativeInteger
    };
  })
};

addHandler(
  cgnMerchantsRouter,
  "post",
  addPrefix("/online-merchants"),
  (req, res) => {
    if (OnlineMerchantSearchRequest.is(req.body)) {
      // tslint:disable-next-line:no-shadowed-variable
      const { productCategories, merchantName } = req.body;
      const merchantsFilteredByName = onlineMerchants.items.filter(om =>
        fromNullable(merchantName).fold(true, mn => om.name.includes(mn))
      );

      const filteredMerchants = merchantsFilteredByName.filter(m =>
        fromNullable(productCategories).fold(true, pc => {
          return m.productCategories.some(cat => pc.includes(cat));
        })
      );
      return res.status(200).json({ items: filteredMerchants });
    }
    return res.status(500);
  }
);

addHandler(
  cgnMerchantsRouter,
  "post",
  addPrefix("/offline-merchants"),
  (req, res) => {
    if (OfflineMerchantSearchRequest.is(req.body)) {
      const {
        // tslint:disable-next-line:no-shadowed-variable
        productCategories,
        merchantName
      } = req.body;

      const merchantsFilteredByName = offlineMerchants.items.filter(m =>
        fromNullable(merchantName).fold(true, mn => m.name.includes(mn))
      );

      const filteredMerchants = merchantsFilteredByName.filter(m =>
        fromNullable(productCategories).fold(true, pc => {
          return m.productCategories.some(cat => pc.includes(cat));
        })
      );

      return res.status(200).json({ items: filteredMerchants });
    }
    return res.status(500);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/merchants/:merchantId"),
  (req, res) => {
    const merchants: ReadonlyArray<OnlineMerchant | OfflineMerchant> = [
      ...offlineMerchants.items,
      ...onlineMerchants.items
    ];

    const merchIndex = merchants.findIndex(
      item => item.id === req.params.merchantId
    );
    if (merchIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
    }

    const foundMerchant = merchants[merchIndex];

    if (OnlineMerchant.is(foundMerchant)) {
      const onlineMerchant: Merchant = {
        id: foundMerchant.id,
        name: foundMerchant.name,
        websiteUrl: foundMerchant.websiteUrl,
        imageUrl: faker.image.imageUrl() as NonEmptyString,
        description: faker.lorem.paragraphs(2) as NonEmptyString,
        discounts: range(1, 3).map<Discount>(_ => ({
          name: faker.commerce.productName() as NonEmptyString,
          startDate: faker.date.past().toISOString(),
          endDate: faker.date.future().toISOString(),
          discount: faker.datatype.number({ min: 10, max: 30 }),
          description: faker.lorem.lines(1) as NonEmptyString,
          staticCode: faker.random.boolean()
            ? (faker.datatype.number().toString() as NonEmptyString)
            : undefined,
          productCategories: range(1, 3).map<ProductCategory>(
            // tslint:disable-next-line:no-shadowed-variable
            _ =>
              productCategories[
                faker.datatype.number({
                  min: 0,
                  max: productCategories.length - 1
                })
              ]
          )
        }))
      };
      res.json(onlineMerchant);
    } else {
      const offlineMerchant: Merchant = {
        id: foundMerchant.id,
        name: foundMerchant.name,
        addresses: [foundMerchant.address],
        imageUrl: faker.image.imageUrl() as NonEmptyString,
        description: faker.lorem.paragraphs(2) as NonEmptyString,
        discounts: range(1, 3).map<Discount>(_ => ({
          name: faker.commerce.productName() as NonEmptyString,
          startDate: faker.date.past().toISOString(),
          endDate: faker.date.future().toISOString(),
          discount: faker.datatype.number({ min: 10, max: 30 }),
          description: faker.lorem.lines(1) as NonEmptyString,
          productCategories: range(1, 3).map<ProductCategory>(
            // tslint:disable-next-line:no-shadowed-variable
            _ =>
              productCategories[
                faker.datatype.number({
                  min: 0,
                  max: productCategories.length - 1
                })
              ]
          )
        }))
      };
      res.json(offlineMerchant);
    }
  }
);
