import { fakerIT as faker } from "@faker-js/faker";

// eslint-disable-next-line functional/no-let
let nextId = 0;
const nextDate = faker.date.recent({ days: 3 });

export const nextMessageIdAndCreationDate = () => {
  const id = `${nextId++}`.padStart(26, "0");
  nextDate.setHours(nextDate.getHours() + 1);
  return { id, created_at: new Date(nextDate) };
};
