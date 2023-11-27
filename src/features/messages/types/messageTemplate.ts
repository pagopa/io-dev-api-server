import * as t from "io-ts";

export const MessageTemplate = t.type({
  hasRemoteContent: t.boolean,
  attachmentCount: t.number
});
export type MessageTemplate = t.TypeOf<typeof MessageTemplate>;
