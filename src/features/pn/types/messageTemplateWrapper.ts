import * as t from "io-ts";
import { PNMessageTemplate } from "./messageTemplate";

export const PNMessageTemplateWrapper = t.type({
  template: PNMessageTemplate,
  count: t.number
});
export type PNMessageTemplateWrapper = t.TypeOf<
  typeof PNMessageTemplateWrapper
>;
