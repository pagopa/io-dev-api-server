import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";

export type MessageOnDB =
  | CreatedMessageWithContentAndAttachments
  | CreatedMessageWithContent;

// tslint:disable-next-line: readonly-array no-let
let inboxMessages: MessageOnDB[] = [];
// tslint:disable-next-line: readonly-array no-let
let archivedMessages: MessageOnDB[] = [];

/**
 * Move the message with ID to the archived collection.
 */
function archive(id: string): boolean {
  const index = inboxMessages.findIndex(message => message.id === id);
  if (index < 0) {
    return false;
  }
  const [toArchived] = inboxMessages.splice(index, 1);
  const destinationIndex = archivedMessages.findIndex(
    message => message.id < id
  );
  archivedMessages.splice(destinationIndex, 0, toArchived);
  return true;
}

/**
 * Move the message with ID to the inbox collection.
 */
function unarchive(id: string): boolean {
  const index = archivedMessages.findIndex(message => message.id === id);
  if (index < 0) {
    return false;
  }
  const [toArchived] = archivedMessages.splice(index, 1);
  const destinationIndex = inboxMessages.findIndex(message => message.id < id);
  inboxMessages.splice(destinationIndex, 0, toArchived);
  return true;
}

// tslint:disable-next-line: readonly-array no-let
function persist(messages: MessageOnDB[]): void {
  inboxMessages = inboxMessages
    .concat(messages)
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

function findAllInbox(): ReadonlyArray<MessageOnDB> {
  return inboxMessages as ReadonlyArray<MessageOnDB>;
}

function findAllArchived(): ReadonlyArray<MessageOnDB> {
  return archivedMessages as ReadonlyArray<MessageOnDB>;
}

/**
 * Find one message given its ID, whether it is in the inbox or archived.
 */
function findOneById(id: string): MessageOnDB | null {
  return (
    inboxMessages.find(message => message.id === id) ||
    archivedMessages.find(message => message.id === id) ||
    null
  );
}

function dropAll(): void {
  inboxMessages = [];
  archivedMessages = [];
}

export default {
  archive,
  persist,
  findAllArchived,
  findAllInbox,
  findOneById,
  unarchive,
  dropAll
};
