import { randomUUID } from "crypto";
import { ioDevServerConfig } from "../../config";

export const QTSP_NONCE_EXPIRING_MS =
  ioDevServerConfig.messages.fci.response.nonceDurationSeconds * 1000;

const qtspNonceExpirations = new Map<string, Date>();

const cleanupExpiredQtspNonces = (referenceDate: Date) => {
  qtspNonceExpirations.forEach((expiresAt, nonce) => {
    if (expiresAt <= referenceDate) {
      qtspNonceExpirations.delete(nonce);
    }
  });
};

const generateQtspNonce = () =>
  `devnonce-${randomUUID({ disableEntropyCache: true })}`;

export const generateAndStoreQtspNonce = (now = new Date()) => {
  cleanupExpiredQtspNonces(now);
  const nonce = generateQtspNonce();
  qtspNonceExpirations.set(
    nonce,
    new Date(now.getTime() + QTSP_NONCE_EXPIRING_MS)
  );
  return nonce;
};

export type QtspNonceValidationResult = "valid" | "expired" | "missing";

export const getQtspNonceValidationResult = (
  nonce: string,
  now = new Date()
): QtspNonceValidationResult => {
  const expiration = qtspNonceExpirations.get(nonce);

  if (expiration === undefined) {
    cleanupExpiredQtspNonces(now);
    return "missing";
  }

  if (expiration <= now) {
    qtspNonceExpirations.delete(nonce);
    cleanupExpiredQtspNonces(now);
    return "expired";
  }

  cleanupExpiredQtspNonces(now);
  return "valid";
};

export const isStoredQtspNonceValid = (nonce: string, now = new Date()) =>
  getQtspNonceValidationResult(nonce, now) === "valid";

export const getQtspNonceExpirations = () => qtspNonceExpirations;
