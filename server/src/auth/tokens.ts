import { createHash, randomBytes } from "node:crypto";
import { sign, verify } from "hono/jwt";

import { getRequiredEnv } from "../config";

const accessTokenSeconds = 15 * 60;
export const refreshTokenDays = 30;

export interface AccessTokenClaims {
  sub: string;
  tokenType: "access";
  exp: number;
}

export const createAccessToken = (userId: string) =>
  sign(
    {
      sub: userId,
      tokenType: "access",
      exp: Math.floor(Date.now() / 1000) + accessTokenSeconds,
    } satisfies AccessTokenClaims,
    getRequiredEnv("JWT_SECRET"),
  );

export const verifyAccessToken = async (token: string) => {
  const payload = await verify(token, getRequiredEnv("JWT_SECRET"), "HS256");

  if (typeof payload.sub !== "string" || payload.tokenType !== "access") {
    throw new Error("Invalid access token");
  }

  return payload.sub;
};

export const createRefreshToken = () => randomBytes(32).toString("base64url");

export const hashRefreshToken = (token: string) =>
  createHash("sha256").update(token).digest("base64url");

export const refreshTokenExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenDays);
  return expiresAt;
};
