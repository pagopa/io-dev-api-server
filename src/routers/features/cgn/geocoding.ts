import * as faker from "faker";
import { range } from "fp-ts/lib/Array";
import { AutocompleteResultItem } from "../../../../generated/definitions/cgn/geo/AutocompleteResultItem";
import { LookupResponse } from "../../../../generated/definitions/cgn/geo/LookupResponse";
import { Plugin } from "../../../core/server";
import { addApiV1Prefix } from "../../../utils/strings";

const addPrefix = (path: string) => addApiV1Prefix(`/geo${path}`);

const addresses = range(0, 10000).map<AutocompleteResultItem>(_ => ({
  id: faker.datatype.uuid(),
  title: faker.address.streetAddress(true),
  address: {
    label: faker.address.streetAddress(false),
    city: faker.address.city(),
    countryCode: faker.address.countryCode(),
    countryName: faker.address.country(),
    county: faker.address.county(),
    postalCode: faker.address.zipCodeByState("IT")
  }
}));

export const CGNGeocodingPlugin: Plugin = async ({ handleRoute }) => {
  handleRoute("get", addPrefix("/autocomplete"), (req, res) => {
    const address = req.query.queryAddress as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    const resultArray: ReadonlyArray<AutocompleteResultItem> = addresses
      .filter(ari => ari.title.includes(address))
      .slice(0, limit);

    return res.status(200).json({ items: resultArray });
  });

  handleRoute("get", addPrefix("/lookup"), (req, res) => {
    const lookupID = req.query.id;
    const foundResult = addresses.find(address => address.id === lookupID);
    if (foundResult) {
      const response: LookupResponse = {
        title: foundResult.title,
        address: foundResult.address,
        position: {
          lat: parseFloat(faker.address.latitude()),
          lng: parseFloat(faker.address.longitude())
        }
      };

      return res.status(200).json(response);
    }

    res.sendStatus(404);
  });
};
