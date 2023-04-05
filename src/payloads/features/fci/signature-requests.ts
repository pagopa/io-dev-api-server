import { EmailString, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import faker from "faker/locale/it";
import { SignatureRequestDetailView } from "../../../../generated/definitions/fci/SignatureRequestDetailView";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";
import { DossierTitle } from "../../../../generated/definitions/fci/DossierTitle";
import { serverUrl } from "../../../utils/server";
import { SignatureRequestListView } from "../../../../generated/definitions/fci/SignatureRequestListView";
import { getRandomEnumValue } from "../../utils/random";
import { SignatureRequestList } from "../../../../generated/definitions/fci/SignatureRequestList";

const now = new Date();

const createRandomSignatureRequest = (): SignatureRequestListView => ({
  id: faker.datatype.uuid() as SignatureRequestDetailView["id"],
  status: getRandomEnumValue(SignatureRequestStatusEnum),
  created_at: new Date(),
  dossier_id: faker.datatype.uuid() as SignatureRequestDetailView["dossier_id"],
  dossier_title: faker.random.words(5) as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  signer_id: faker.datatype.uuid() as SignatureRequestDetailView["signer_id"],
  updated_at: new Date()
});

export const signatureRequestList: SignatureRequestList = {
  items: Array.from({ length: 5 }, () =>
    createRandomSignatureRequest()
  ) as SignatureRequestListView[]
};
