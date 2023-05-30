import { faker } from "@faker-js/faker/locale/it";
import { range } from "fp-ts/lib/NonEmptyArray";
import { AeroportoSedeBean } from "../../../generated/definitions/siciliaVola/AeroportoSedeBean";
import { ListaVoucherBeneficiarioOutputBean } from "../../../generated/definitions/siciliaVola/ListaVoucherBeneficiarioOutputBean";
import { StatoVoucherBean } from "../../../generated/definitions/siciliaVola/StatoVoucherBean";
import { VoucherBeneficiarioOutputBean } from "../../../generated/definitions/siciliaVola/VoucherBeneficiarioOutputBean";

export const getPossibleVoucherStates: StatoVoucherBean = [
  { idStato: 2, statoDesc: "UTILIZZATO" },
  { idStato: 1, statoDesc: "DISPONIBILE" },
  { idStato: 4, statoDesc: "SCADUTO" },
  { idStato: 3, statoDesc: "ANNULLATO" }
];

export const getVouchersBeneficiary = (
  size: number,
  lastId: number
): ListaVoucherBeneficiarioOutputBean => {
  const voucher: ReadonlyArray<VoucherBeneficiarioOutputBean> =
    size > 0
      ? range(0, size - 1).map(i => ({
          idVoucher: lastId + 1 + i,
          aeroportoDest: faker.address.city(),
          dataVolo: faker.date.future()
        }))
      : [];

  return {
    size,
    listaRisultati: voucher
  };
};

export const getAereoportiSede = (
  size: number
): ReadonlyArray<AeroportoSedeBean> =>
  size > 0
    ? range(0, size - 1).map(_ => ({
        codIATA: faker.lorem.word(3),
        denominazione: faker.address.city(),
        sigla: faker.random.words(1)
      }))
    : [];
