import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scrypt(password, salt, keyLength)) as Buffer;

  return `scrypt$${salt}$${key.toString("base64url")}`;
};

export const verifyPassword = async (password: string, passwordHash: string) => {
  const [scheme, salt, storedKey] = passwordHash.split("$");

  if (scheme !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const key = (await scrypt(password, salt, keyLength)) as Buffer;
  const stored = Buffer.from(storedKey, "base64url");

  return key.length === stored.length && timingSafeEqual(key, stored);
};
