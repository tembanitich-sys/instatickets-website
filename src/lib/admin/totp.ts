import { createHmac, randomBytes } from "node:crypto";

/*
 * Time-based one-time codes (RFC 6238, as used by Google Authenticator, Microsoft
 * Authenticator and 1Password): 6 digits, a new code every 30 seconds, SHA-1.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer | null {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  if (!/^[A-Z2-7]+$/.test(clean)) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function totpCode(secret: Buffer, nowMs: number, step = 0): string {
  const counter = Math.floor(nowMs / 30000) + step;
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(msg).digest();
  const offset = h[h.length - 1] & 15;
  const bin = ((h[offset] & 127) << 24) | (h[offset + 1] << 16) | (h[offset + 2] << 8) | h[offset + 3];
  return String(bin % 1_000_000).padStart(6, "0");
}

/** Accepts the current code or one step either side, to allow for a phone clock that is slightly off. */
export function verifyTotp(secretBase32: string, code: string, nowMs: number): boolean {
  const secret = base32Decode(secretBase32);
  const digits = code.replace(/\s/g, "");
  if (!secret || secret.length < 10 || !/^\d{6}$/.test(digits)) return false;
  return [-1, 0, 1].some((step) => totpCode(secret, nowMs, step) === digits);
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export const otpauthUri = (secret: string, account = "admin") =>
  `otpauth://totp/InstaTickets%20Admin:${encodeURIComponent(account)}?secret=${secret}&issuer=InstaTickets%20Admin&algorithm=SHA1&digits=6&period=30`;
