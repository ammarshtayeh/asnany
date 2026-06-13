import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const PREFIX = "pbkdf2_sha256";
const ITERATIONS = 120000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url");
  return `${PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

export function isPasswordHash(value: string | null | undefined) {
  return Boolean(value?.startsWith(`${PREFIX}$`));
}

export function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;

  if (!isPasswordHash(stored)) {
    return password === stored;
  }

  const [, iterationsText, salt, expectedHash] = stored.split("$");
  const iterations = Number(iterationsText);
  if (!iterations || !salt || !expectedHash) return false;

  const actual = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("base64url");
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expectedHash);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
