import MessagesDB, { MessageOnDB } from "../messages";

const buildMessage = (id: string) => (({ id } as unknown) as MessageOnDB);

describe("the Message persistence", () => {
  beforeEach(() => {
    MessagesDB.dropAll();
  });

  describe("when a list of messages is persisted", () => {
    it("they should be stored inversely sorted by ID", () => {
      const unsortedMessages = ["A1", "C0", "A3"].map(buildMessage);
      MessagesDB.persist(unsortedMessages);
      expect(MessagesDB.findAllInbox()).toEqual([
        { id: "C0" },
        { id: "A3" },
        { id: "A1" }
      ]);
    });
  });

  describe("when a message is archived", () => {
    it("it should be moved from Inbox to Archived collection, sorted", () => {
      MessagesDB.persist(["C", "B", "A"].map(buildMessage));
      expect(MessagesDB.findAllArchived()).toEqual([]);
      MessagesDB.archive("B");
      expect(MessagesDB.findAllInbox()).toEqual([{ id: "C" }, { id: "A" }]);
      expect(MessagesDB.findAllArchived()).toEqual([{ id: "B" }]);
      MessagesDB.archive("C");
      expect(MessagesDB.findAllInbox()).toEqual([{ id: "A" }]);
      expect(MessagesDB.findAllArchived()).toEqual([{ id: "C" }, { id: "B" }]);
    });
  });

  describe("when a message is unarchived", () => {
    it("it should be moved from Archived to Inbox collection, sorted", () => {
      MessagesDB.persist(["C", "B", "A"].map(buildMessage));
      MessagesDB.archive("B");
      MessagesDB.unarchive("B");
      expect(MessagesDB.findAllArchived()).toEqual([]);
      expect(MessagesDB.findAllInbox()).toEqual([
        { id: "C" },
        { id: "B" },
        { id: "A" }
      ]);
    });
  });
});
