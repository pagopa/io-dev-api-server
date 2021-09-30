import * as faker from "faker";
import supertest from "supertest";
import { CreatedMessageWithoutContent } from "../../../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { basePath } from "../../payloads/response";
import app from "../../server";
import { messagesWithContent } from "../message";
const request = supertest(app);

it("messages should return a valid messages list", async done => {
  const response = await request.get(`${basePath}/messages`);
  expect(response.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(list.isRight()).toBeTruthy();
  done();
});

it("messages should return a number of items according with the specified pageSize", async done => {
  const responseList = await request.get(`${basePath}/messages`);
  expect(responseList.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    responseList.body
  );
  expect(list.isRight()).toBeTruthy();
  const pageSize = faker.datatype.number({
    min: 0,
    max: (list.value as PaginatedCreatedMessageWithoutContentCollection).items
      .length
  });
  const response = await request.get(
    `${basePath}/messages?page_size=${pageSize}`
  );
  expect(response.status).toBe(200);
  const messages = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(messages.isRight()).toBeTruthy();
  if (messages.isRight()) {
    expect(messages.value.items.length).toBe(pageSize);
  }
  done();
});

it("messages should return those items that are older than specified maximum_id", async done => {
  const response = await request.get(`${basePath}/messages`);
  expect(response.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    for (const m of list.value.items) {
      // ask for those messages older than this
      const responseOlder = await request.get(
        `${basePath}/messages?maximum_id=${m.id}`
      );
      const listOlder = PaginatedCreatedMessageWithoutContentCollection.decode(
        responseOlder.body
      );

      if (listOlder.isRight()) {
        (listOlder.value.items ?? []).forEach(mo => {
          expect(mo.created_at.getTime()).toBeLessThan(m.created_at.getTime());
        });
      }
    }
  }
  done();
});

it("messages should return those items that are younger than specified minimum_id", async done => {
  const response = await request.get(`${basePath}/messages`);
  expect(response.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    for (const m of list.value.items) {
      // ask for those messages younger than this
      const responseYounger = await request.get(
        `${basePath}/messages?minimum_id=${m.id}`
      );
      const listYounger = PaginatedCreatedMessageWithoutContentCollection.decode(
        responseYounger.body
      );
      expect(listYounger.isRight()).toBeTruthy();
      if (listYounger.isRight()) {
        (listYounger.value.items ?? []).forEach(mo => {
          expect(mo.created_at.getTime()).toBeGreaterThan(
            m.created_at.getTime()
          );
        });
      }
    }
  }
  done();
});

it("messages should return a valid message with content", async done => {
  const messageId = messagesWithContent[0].id;
  const response = await request.get(`${basePath}/messages/${messageId}`);
  expect(response.status).toBe(200);
  const message = CreatedMessageWithoutContent.decode(response.body);
  expect(message.isRight()).toBeTruthy();
  if (message.isRight()) {
    expect(message.value.id).toBe(messageId);
  }
  done();
});
