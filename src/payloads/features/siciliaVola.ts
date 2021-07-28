import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
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
    aeroportoDest: faker.fake("{{address.city}}"),
    dataVolo: faker.date.future()
  }));

  return {
    size,
    listaRisultati: voucher
  };
};
