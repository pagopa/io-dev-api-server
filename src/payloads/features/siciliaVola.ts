import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { AeroportoSedeBean } from "../../../generated/definitions/siciliaVola/AeroportoSedeBean";
import { ListaVoucherBeneficiarioOutputBean } from "../../../generated/definitions/siciliaVola/ListaVoucherBeneficiarioOutputBean";
import { VoucherBeneficiarioOutputBean } from "../../../generated/definitions/siciliaVola/VoucherBeneficiarioOutputBean";

export const getVouchersBeneficiary = (
  size: number
): ListaVoucherBeneficiarioOutputBean => {
  const voucher: ReadonlyArray<VoucherBeneficiarioOutputBean> = range(
    0,
    size - 1
  ).map(i => ({
    idVoucher: i,
    aeroportoDest: faker.address.city(),
    dataVolo: faker.date.future()
  }));

  return {
    size,
    listaRisultati: voucher
  };
};

export const getAereoportiSede = (
  size: number
): ReadonlyArray<AeroportoSedeBean> => {
  return range(0, size - 1).map(_ => ({
    codIATA: faker.lorem.word(3),
    denominazione: faker.address.city(),
    sigla: faker.random.words(1)
  }));
};
