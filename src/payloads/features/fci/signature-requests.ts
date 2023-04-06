import { ulid } from "ulid";
import { faker } from "@faker-js/faker/locale/it";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";
import { DossierTitle } from "../../../../generated/definitions/fci/DossierTitle";
import { SignatureRequestListView } from "../../../../generated/definitions/fci/SignatureRequestListView";
import { getRandomEnumValue } from "../../utils/random";
import { SignatureRequestList } from "../../../../generated/definitions/fci/SignatureRequestList";

const now = new Date();

const createRandomSignatureRequest = (): SignatureRequestListView => ({
  id: ulid() as SignatureRequestListView["id"],
  status: getRandomEnumValue(SignatureRequestStatusEnum),
  created_at: new Date(),
  dossier_id: faker.datatype.uuid() as SignatureRequestListView["dossier_id"],
  dossier_title: faker.random.words(5) as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  signer_id: ulid() as SignatureRequestListView["signer_id"],
  updated_at: new Date()
});

export const signatureRequestList: SignatureRequestList = {
  items: Array.from({ length: 5 }, () =>
    createRandomSignatureRequest()
  ) as Array<SignatureRequestListView>
};
