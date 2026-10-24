// Prints a new authenticator secret for the admin sign-in.
// 1. Run: node scripts/admin-totp.mjs
// 2. In Google or Microsoft Authenticator choose "Enter a setup key" and type the key shown
//    (or open the otpauth link on the phone).
// 3. Put the same key in Vercel as ADMIN_TOTP_SECRET and redeploy.
import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
let bits = 0;
let value = 0;
let key = "";
for (const byte of randomBytes(20)) {
  value = (value << 8) | byte;
  bits += 8;
  while (bits >= 5) {
    key += ALPHABET[(value >>> (bits - 5)) & 31];
    bits -= 5;
  }
}
console.log(`Setup key (ADMIN_TOTP_SECRET): ${key}`);
console.log(`otpauth link: otpauth://totp/InstaTickets%20Admin:admin?secret=${key}&issuer=InstaTickets%20Admin`);
