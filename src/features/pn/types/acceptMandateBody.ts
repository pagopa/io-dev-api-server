import * as t from "io-ts";

export const MRTDData = t.type({
  dg1: t.string,
  dg11: t.string,
  sod: t.string
});
export type MRTDData = t.TypeOf<typeof MRTDData>;

export const NISData = t.type({
  pub_key: t.string,
  sod: t.string,
  value: t.string
});
export type NISData = t.TypeOf<typeof NISData>;

export const AcceptMandateBody = t.type({
  mrtd_data: MRTDData,
  nis_data: NISData,
  signed_verification_code: t.string
});
export type AcceptMandateBody = t.TypeOf<typeof AcceptMandateBody>;
