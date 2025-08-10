import { fakerIT as faker } from "@faker-js/faker";

// eslint-disable-next-line functional/no-let
let nextId = 0;
const nextDate = faker.date.recent({ days: 3 });

export const nextMessageIdAndCreationDate = () => {
  const id = `${nextId++}`.padStart(26, "0");
  nextDate.setHours(nextDate.getHours() + 1);
  return { id, created_at: new Date(nextDate) };
};

export const unknownToString = (input: unknown): string => {
  // 1. Handle null and undefined explicitly for consistent output
  if (input === null) {
    return "Null";
  }
  if (input === undefined) {
    return "Undefined";
  }

  // 2. Handle Error instances to get the core message
  if (input instanceof Error) {
    return input.message;
  }

  // 3. For other objects (including arrays), use JSON.stringify
  if (typeof input === "object") {
    try {
      // This is far more informative than '[object Object]'
      return JSON.stringify(input);
    } catch {
      // This handles errors like circular references
      return "Unserializable Object";
    }
  }

  // 4. Fallback for primitives (string, number, boolean, etc.)
  return String(input);
};
