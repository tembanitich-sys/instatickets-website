export type AdminConfig = { password: string; sessionSecret: string };

export const MIN_PASSWORD_LENGTH = 12;
export const MIN_SECRET_LENGTH = 32;

/**
 * Why the admin area cannot be used, or null if it is configured properly.
 * Reported in server logs only; the browser just sees "not available".
 */
export function adminConfigProblem(env: Record<string, string | undefined> = process.env): string | null {
  const { ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: secret } = env;
  if (!password) return "ADMIN_PASSWORD is not set.";
  if (password.length < MIN_PASSWORD_LENGTH) return `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!secret) return "ADMIN_SESSION_SECRET is not set.";
  if (secret.length < MIN_SECRET_LENGTH) return `ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`;
  return null;
}

/** The admin password and session-signing secret, or null (fail closed) if either is missing or weak. */
export function getAdminConfig(env: Record<string, string | undefined> = process.env): AdminConfig | null {
  if (adminConfigProblem(env)) return null;
  return { password: env.ADMIN_PASSWORD!, sessionSecret: env.ADMIN_SESSION_SECRET! };
}
