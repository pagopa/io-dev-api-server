import { CreatedMessageWithContentAndEnrichedData } from "../../generated/definitions/backend/CreatedMessageWithContentAndEnrichedData";

type MessageFromBE = CreatedMessageWithContentAndEnrichedData;

export type MessageOnDB = MessageFromBE;

// eslint-disable-next-line: readonly-array no-let
let inboxMessages: MessageOnDB[] = [];
// eslint-disable-next-line: readonly-array no-let
let archivedMessages: MessageOnDB[] = [];

/**
 * Move the message with ID to the archived collection.
 * Return false if message ID is not in the Inbox.
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
  // eslint-disable-next-line: no-object-mutation
  toArchived.is_archived = true;
  archivedMessages.splice(destinationIndex, 0, toArchived);
  return true;
}

/**
 * Move the message with ID to the inbox collection.
 * Return false if message ID is not in the Archive.
 */
function unarchive(id: string): boolean {
  const index = archivedMessages.findIndex(message => message.id === id);
  if (index < 0) {
    return false;
  }
  const [toInbox] = archivedMessages.splice(index, 1);
  const destinationIndex = inboxMessages.findIndex(message => message.id < id);
  // eslint-disable-next-line: no-object-mutation
  toInbox.is_archived = false;
  inboxMessages.splice(destinationIndex, 0, toInbox);
  return true;
}

/**
 * Persist a list of messages. The extra attributes is_read and is_archived will
 * be added.
 */
// eslint-disable-next-line: readonly-array no-let
function persist(messages: MessageFromBE[]): void {
  inboxMessages = inboxMessages
    .concat(messages.map(m => ({ ...m, is_read: false, is_archived: false })))
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

function findAllInbox(): ReadonlyArray<MessageOnDB> {
  return inboxMessages;
}

function findAllArchived(): ReadonlyArray<MessageOnDB> {
  return archivedMessages;
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

/**
 * Set the message `isRead` status to true. The operation cannot be undone.
 * Return false is the message was not found.
 */
function setReadMessage(id: string): boolean {
  const message = findOneById(id);
  if (message) {
    // eslint-disable-next-line: no-object-mutation
    message.is_read = true;
    return true;
  }
  return false;
}

export default {
  archive,
  dropAll,
  findAllArchived,
  findAllInbox,
  findOneById,
  persist,
  setReadMessage,
  unarchive
};
