import { basePath } from "../payloads/response";

export const uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const a = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const b = c === "x" ? a : (a & 0x3) | 0x8;
    return b.toString(16);
  });

export const addApiV1Prefix = (path: string) => `${basePath}${path}`;
