import { ulid } from "ulid";
import { addPlatformHandler } from "./router";

// Generates a new pagoPA platform session token
addPlatformHandler("post", "/session", (_, res) =>
  res.status(200).json({ sessionToken: ulid() })
);