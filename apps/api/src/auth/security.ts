import { randomBytes, createHash } from "node:crypto";
import { hash as argonHash, verify as argonVerify, Algorithm } from "@node-rs/argon2";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return argonHash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argonVerify(hash, password);
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseDurationToMs(duration: string): number {
  const match = duration.trim().match(/^(\d+)\s*([smhd])$/i);

  if (!match) {
    throw new Error(`Duracao invalida: ${duration}. Use formatos como 15m, 7d.`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;

  return value * 24 * 60 * 60 * 1000;
}

export function expiresAtFromDuration(duration: string): Date {
  return new Date(Date.now() + parseDurationToMs(duration));
}
