import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import supertest from "supertest";

import { CreatedMessageWithoutContent } from "../../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EnrichedMessage } from "../../../generated/definitions/backend/EnrichedMessage";
import { PaginatedPublicMessagesCollection } from "../../../generated/definitions/backend/PaginatedPublicMessagesCollection";
import { ioDevServerConfig } from "../../config";
import { basePath } from "../../payloads/response";
import MessagesDB from "../../persistence/messages";
import populatePersistence from "../../populate-persistence";
import app from "../../server";

const request = supertest(app);

// Dummy helper to improve readability in the individual test
function assertResponseIsRight(body: any): PaginatedPublicMessagesCollection {
  const { items, next, prev } = PaginatedPublicMessagesCollection.decode(body)
    .value as any;
  if (Array.isArray(items)) {
    return { items, next, prev };
  }
  throw new TypeError("invalid body found for messages");
}

const customConfig = _.merge(ioDevServerConfig, {
  // testing messages with a heavily populated DB
  messages: {
    legalCount: 10,
    paymentsCount: 10,
    paymentInvalidAfterDueDateWithValidDueDateCount: 10,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 10,
    paymentWithValidDueDateCount: 10,
    paymentWithExpiredDueDateCount: 10,
    medicalCount: 10,
    withCTA: true,
    withEUCovidCert: true,
    withValidDueDateCount: 10,
    withInValidDueDateCount: 2,
    standardMessageCount: 10,
    archivedMessageCount: 40
  }
});

describe("given the `/messages` endpoint", () => {
  beforeAll(() => {
    populatePersistence(customConfig);
  });

  afterAll(() => {
    MessagesDB.dropAll();
  });

  describe("when a valid request is sent", () => {
    it("a 200 response with the array of items is returned", async () => {
      const response = await request.get(`${basePath}/messages`);
      expect(response.status).toBe(200);
      const list = PaginatedPublicMessagesCollection.decode(response.body);
      expect(E.isRight(list)).toBeTruthy();
      expect(
        (list.value as PaginatedPublicMessagesCollection).items
      ).toBeDefined();
      expect(
        typeof (list.value as PaginatedPublicMessagesCollection).items.length
      ).toBeDefined();
    });
  });

  describe("when the page size is lower than the total number of available items", () => {
    const pageSize = 1;
    it("should return exactly the page size", async () => {
      const response = await request.get(
        `${basePath}/messages?page_size=${pageSize}`
      );
      const { items } = assertResponseIsRight(response.body);
      expect(items.length).toBe(pageSize);
    });

    it("the `next` parameter should be defined ", async () => {
      const response = await request.get(
        `${basePath}/messages?page_size=${pageSize}`
      );
      const { next } = assertResponseIsRight(response.body);
      expect(next).toBeDefined();
    });

    it("the `prev` parameter should be equal to the first message's ID ", async () => {
      const response = await request.get(
        `${basePath}/messages?page_size=${pageSize}`
      );
      const { prev, items } = assertResponseIsRight(response.body);
      expect(prev).toMatch(items[0].id);
    });
  });

  describe("when the page size is greater than the total number of available items", () => {
    const pageSize = 100;
    it("should return fewer items", async () => {
      const response = await request.get(
        `${basePath}/messages?page_size=${pageSize}`
      );
      const { items } = assertResponseIsRight(response.body);
      expect(items.length).toBeLessThan(pageSize);
    });

    it("the `next` parameter should not be defined ", async () => {
      const response = await request.get(
        `${basePath}/messages?page_size=${pageSize}`
      );
      const { next } = assertResponseIsRight(response.body);
      expect(next).not.toBeDefined();
    });
  });

  describe("when `maximum_id` is used", () => {
    it("all the items in the second page must older than the items in the first one", async () => {
      const firstResponse = await request.get(
        `${basePath}/messages?page_size=1`
      );
      const { items, next } = assertResponseIsRight(firstResponse.body);
      const secondResponse = await request.get(
        `${basePath}/messages?maximum_id=${next}`
      );

      const { items: olderItems } = assertResponseIsRight(secondResponse.body);
      expect(
        olderItems.some(({ created_at }) => created_at > items[0].created_at)
      ).toBe(false);
    });
  });

  it("messages should return those items that are younger than specified minimum_id", async () => {
    const response = await request.get(`${basePath}/messages`);
    expect(response.status).toBe(200);
    const list = PaginatedPublicMessagesCollection.decode(response.body);
    expect(E.isRight(list)).toBeTruthy();
    if (E.isRight(list)) {
      for (const m of list.value.items) {
        // ask for those messages younger than this
        const responseYounger = await request.get(
          `${basePath}/messages?minimum_id=${m.id}`
        );
        const listYounger = PaginatedPublicMessagesCollection.decode(
          responseYounger.body
        );
        expect(E.isRight(listYounger)).toBeTruthy();
        if (E.isRight(listYounger)) {
          (listYounger.value.items ?? []).forEach(mo => {
            expect(mo.created_at.getTime()).toBeGreaterThan(
              m.created_at.getTime()
            );
          });
          if (listYounger.value.items.length > 0) {
            // next is never defined for backward navigation
            expect(listYounger.value.next).not.toBeDefined();
            // prev, if defined, should contain the id of the first element
            expect(listYounger.value.prev).toMatch(
              listYounger.value.items[0].id
            );
          }
        }
      }
    }
  });

  it("messages should return a valid message with content with enriched data", async () => {
    const response = await request.get(
      `${basePath}/messages?enrich_result_data=true`
    );
    expect(response.status).toBe(200);
    const list = PaginatedPublicMessagesCollection.decode(response.body);
    expect(E.isRight(list)).toBeTruthy();
    if (E.isRight(list)) {
      expect(list.value.items.every(EnrichedMessage.is)).toBeTruthy();
    }

    const responseDefault = await request.get(
      `${basePath}/messages?enrich_result_data=false`
    );
    expect(responseDefault.status).toBe(200);
    const listDefault = PaginatedPublicMessagesCollection.decode(
      responseDefault.body
    );
    expect(E.isRight(listDefault)).toBeTruthy();
    if (E.isRight(listDefault)) {
      expect(listDefault.value.items.every(EnrichedMessage.is)).toBeFalsy();
    }
  });

  it("messages should return a valid message with content", async () => {
    const messageId = MessagesDB.findAllInbox()[0].id;
    const response = await request.get(`${basePath}/messages/${messageId}`);
    expect(response.status).toBe(200);
    const message = CreatedMessageWithoutContent.decode(response.body);
    expect(E.isRight(message)).toBeTruthy();
    if (E.isRight(message)) {
      expect(message.value.id).toBe(messageId);
    }
  });
});

describe("given the `/messages/:id/message-status` endpoint", () => {
  beforeAll(() => {
    populatePersistence(customConfig);
  });

  afterAll(() => {
    MessagesDB.dropAll();
  });

  [
    { change_type: "bulk", is_read: true, is_archived: true },
    { change_type: "reading", is_read: true },
    { change_type: "archiving", is_archived: true }
  ].forEach(payload => {
    describe(`when a PUT request is performed with ${JSON.stringify(
      payload,
      undefined,
      2
    )}`, () => {
      it("should update the message with the new statuses", async () => {
        const messageId = MessagesDB.findAllInbox()[0].id;
        await request
          .put(`${basePath}/messages/${messageId}/message-status`)
          .send(payload)
          .expect(200);
        const message = await request
          .get(`${basePath}/messages/${messageId}`)
          .query({ public_message: true })
          .expect(200)
          .then(r => r.body);
        if (typeof payload.is_read === "boolean") {
          expect(message.is_read).toBe(payload.is_read);
        }
        if (typeof payload.is_archived === "boolean") {
          expect(message.is_archived).toBe(payload.is_archived);
        }
      });
    });
  });
});

describe("given the `/messages/:id` endpoint", () => {
  beforeAll(() => {
    populatePersistence(customConfig);
  });

  afterAll(() => {
    MessagesDB.dropAll();
  });

  describe("when public_message is true", () => {
    it("then the result contains all the expected properties", async () => {
      const messageId = MessagesDB.findAllInbox()[0].id;
      const message = await request
        .get(`${basePath}/messages/${messageId}`)
        .query({ public_message: true })
        .expect(200)
        .then(r => r.body);
      expect(message.content).toBeDefined();
      expect(message.created_at).toBeDefined();
      expect(message.fiscal_code).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.sender_service_id).toBeDefined();
      expect(message.time_to_live).toBeDefined();
      expect(message.category).toBeDefined();
      expect(message.is_archived).toBeDefined();
      expect(message.is_read).toBeDefined();
      expect(message.message_title).toBeDefined();
      expect(message.organization_name).toBeDefined();
      expect(message.service_name).toBeDefined();
    });
  });

  describe("when public_message is false", () => {
    it("then the result contains just the expected properties", async () => {
      const messageId = MessagesDB.findAllInbox()[0].id;
      const message = await request
        .get(`${basePath}/messages/${messageId}`)
        .query({ public_message: false })
        .expect(200)
        .then(r => r.body);
      expect(message.content).toBeDefined();
      expect(message.created_at).toBeDefined();
      expect(message.fiscal_code).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.sender_service_id).toBeDefined();
      expect(message.time_to_live).toBeDefined();
      expect(message.category).toBeUndefined();
      expect(message.is_archived).toBeUndefined();
      expect(message.is_read).toBeUndefined();
      expect(message.message_title).toBeUndefined();
      expect(message.organization_name).toBeUndefined();
      expect(message.service_name).toBeUndefined();
    });
  });
});
