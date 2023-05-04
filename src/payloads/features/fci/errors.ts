import { faker } from "@faker-js/faker/locale/it";

export const errorWithStatusCode = (statusCode: number) => ({
  type: "https://example.com/problem/constraint-violation",
  title: faker.random.words(5),
  status: statusCode,
  detail: faker.random.words(10),
  instance: faker.random.word()
});
