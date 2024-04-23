import { nonEmptyArray } from "fp-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { FeaturedItem } from "../../../../generated/definitions/services/FeaturedItem";
import { FeaturedItems } from "../../../../generated/definitions/services/FeaturedItems";
import ServicesDB from "../../../persistence/services";
import { getInstitutionsResponsePayload } from "./get-institutions";

/**
 * Returns a random ordered array subset.
 * @param array starting array of type T
 * @param size array subset size (if `size` greater than `array`, it returns empty array subset)
 * @returns
 */
const getRandomArraySubset = <T>(array: T[], size: number): T[] =>
  pipe(
    O.some(array),
    O.fromPredicate(arr => O.isSome(arr) && size <= array.length),
    O.fold(
      () => [],
      () => {
        const remainingItems = [...array];
        return pipe(
          nonEmptyArray.range(1, size),
          A.map(() => {
            const randomIndex = Math.floor(
              Math.random() * remainingItems.length
            );
            const selectedItem = remainingItems[randomIndex];
            // eslint-disable-next-line functional/immutable-data
            remainingItems.splice(randomIndex, 1);
            return selectedItem;
          })
        );
      }
    )
  );

export const getFeaturedItemsResponsePayload = (): FeaturedItems => {
  // take some casual national service
  const selectedNationalServices = getRandomArraySubset(
    ServicesDB.getNationalServices(),
    1
  );
  // take some casual special service
  const selectedSpecialServices = getRandomArraySubset(
    ServicesDB.getSpecialServices(),
    3
  );
  // take some casual institutions
  const featuredIntitutions = getRandomArraySubset(
    Array.from(getInstitutionsResponsePayload().institutions),
    1
  );

  /**
   * Reduced national services to FeaturedService[] (add organization_name for layout testing purpose)
   */
  const featuredNationalServices: FeaturedItem[] = pipe(
    selectedNationalServices,
    A.reduce([] as FeaturedItem[], (accumulator, service) => [
      ...accumulator,
      {
        id: service.service_id,
        name: service.service_name,
        version: service.version,
        organization_name: service.organization_name
      }
    ])
  );

  /**
   * Reduce special services to FeaturedService[]
   */
  const featuredSpecialServices: FeaturedItem[] = pipe(
    selectedSpecialServices,
    A.reduce([] as FeaturedItem[], (accumulator, service) => [
      ...accumulator,
      {
        id: service.service_id,
        name: service.service_name,
        version: service.version
      }
    ])
  );

  // returns randomly ordered featured items
  const featuredItems = pipe(
    [
      ...featuredSpecialServices,
      ...featuredIntitutions,
      ...featuredNationalServices
    ],
    arr => getRandomArraySubset(arr, arr.length)
  );

  return {
    items: featuredItems
  };
};
