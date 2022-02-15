import { Router } from "express";
import faker from "faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { DiscountBucketCode } from "../../../../generated/definitions/cgn/merchants/DiscountBucketCode";
import { OfflineMerchant } from "../../../../generated/definitions/cgn/merchants/OfflineMerchant";
import { OfflineMerchantSearchRequest } from "../../../../generated/definitions/cgn/merchants/OfflineMerchantSearchRequest";
import { OnlineMerchant } from "../../../../generated/definitions/cgn/merchants/OnlineMerchant";
import { OnlineMerchantSearchRequest } from "../../../../generated/definitions/cgn/merchants/OnlineMerchantSearchRequest";
import { ProductCategoryEnum } from "../../../../generated/definitions/cgn/merchants/ProductCategory";
import { getProblemJson } from "../../../payloads/error";
import {
  generateMerchantsAll,
  offlineMerchants,
  onlineMerchants
} from "../../../payloads/features/cgn/merchants";
import { addHandler } from "../../../payloads/response";
import { sendFile } from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";
import { publicRouter } from "../../public";

export const cgnMerchantsRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/cgn/operator-search${path}`);

const merchantsAll = generateMerchantsAll();

const filterMerchants = <T extends OnlineMerchant | OfflineMerchant>(
  merchants: ReadonlyArray<T>,
  productCategories?: ReadonlyArray<ProductCategoryEnum>,
  merchantName?: string
): ReadonlyArray<T> => {
  const filters = (merchant: T): boolean =>
    pipe(
      O.fromNullable(merchantName),
      O.fold(
        () => true,
        mn => merchant.name.includes(mn)
      )
    ) &&
    pipe(
      O.fromNullable(productCategories),
      O.fold(
        () => true,
        pc => merchant.productCategories.some(cat => pc.includes(cat))
      )
    );

  return merchants.filter(filters);
};

addHandler(
  cgnMerchantsRouter,
  "post",
  addPrefix("/online-merchants"),
  (req, res) => {
    if (OnlineMerchantSearchRequest.is(req.body)) {
      return res.status(200).json({
        items: filterMerchants<OnlineMerchant>(
          onlineMerchants.items,
          req.body.productCategories,
          req.body.merchantName
        )
      });
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
      return res.status(200).json({
        items: filterMerchants<OfflineMerchant>(
          offlineMerchants.items,
          req.body.productCategories,
          req.body.merchantName
        )
      });
    }
    return res.status(500);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/merchants/:merchantId"),
  (req, res) => {
    const merchIndex = merchantsAll.findIndex(
      item => item.id === req.params.merchantId
    );
    if (merchIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }

    const foundMerchant = merchantsAll[merchIndex];

    res.json(foundMerchant);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/discount-bucket-code/:discountId"),
  (req, res) => {
    const discountBucketCode: DiscountBucketCode = {
      code: faker.datatype.string().toString() as NonEmptyString
    };
    res.json(discountBucketCode);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/published-product-categories"),
  (req, res) => {
    const categories: ReadonlyArray<ProductCategoryEnum> = [
      ...onlineMerchants.items,
      ...offlineMerchants.items
    ].flatMap(item => item.productCategories);
    const categoriesSet = new Set(categories);

    res.json({ items: Array.from(categoriesSet) });
  }
);
/**
 * just for test purposes an html page that works as
 * the landing Page of a discount for merchant reading the referrer header
 */
addHandler(publicRouter, "get", "/merchant_landing", (req, res) => {
  console.log("Referer header", req.header("referer"));
  sendFile("assets/html/merchants_landing_page.html", res);
});
