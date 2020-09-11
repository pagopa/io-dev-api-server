import supertest from "supertest";
import { CreatedMessageWithoutContent } from "../../../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { basePath } from "../../../generated/definitions/backend_api_paths";
import app from "../../server";
import { messages } from "../message";
const request = supertest(app);

it("messages should return a valid messages list", async done => {
  const response = await request.get(`${basePath}/messages`);
  expect(response.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value).toEqual(messages.payload);
  }
  done();
});

it("messages should return a valid message with content", async done => {
  const messageId = messages.payload.items[0].id;
  const response = await request.get(`${basePath}/messages/${messageId}`);
  expect(response.status).toBe(200);
  const message = CreatedMessageWithoutContent.decode(response.body);
  expect(message.isRight()).toBeTruthy();
  if (message.isRight()) {
    expect(message.value.id).toBe(messageId);
  }
  done();
});
