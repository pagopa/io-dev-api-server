import * as t from "io-ts";

export const MessageTemplate = t.intersection([
  t.type({
    hasRemoteContent: t.boolean,
    attachmentCount: t.number
  }),
  t.partial({
    subjectWordCount: t.number
  })
]);
export type MessageTemplate = t.TypeOf<typeof MessageTemplate>;
