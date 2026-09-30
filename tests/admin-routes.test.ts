import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const adminDir = "src/app/admin";
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

describe("admin routes are never prerendered or left unprotected", () => {
  it("forces dynamic rendering for the whole admin area", () => {
    expect(readFileSync(join(adminDir, "layout.tsx"), "utf8")).toMatch(/export const dynamic = "force-dynamic"/);
  });

  it("checks the session in every admin page and route handler, not only in a layout", () => {
    const entries = files(adminDir).filter((f) => /\/(page\.tsx|route\.ts)$/.test(f));
    expect(entries.length).toBeGreaterThanOrEqual(5);
    for (const f of entries) {
      const src = readFileSync(f, "utf8");
      // The sign-in page is the one place that may be reached without a session.
      const guarded = /requireAdmin\(\)|isAdmin\(\)/.test(src);
      expect(guarded, `${f} must call requireAdmin() or isAdmin()`).toBe(true);
    }
  });

  it("checks the session in every admin server action except sign-in and sign-out", () => {
    const src = readFileSync(join(adminDir, "actions.ts"), "utf8");
    const bodies = src.split(/export async function /).slice(1);
    for (const body of bodies) {
      const name = body.slice(0, body.indexOf("("));
      if (name === "loginAction" || name === "logoutAction") continue;
      expect(body, `${name} must call requireAdmin()`).toMatch(/await requireAdmin\(\)/);
    }
  });

  it("awaits the request and the cookie before deciding anything", () => {
    const src = readFileSync("src/lib/admin/auth.ts", "utf8");
    expect(src.indexOf("await connection()")).toBeGreaterThan(-1);
    expect(src.indexOf("await connection()")).toBeLessThan(src.indexOf("getAdminConfig()"));
  });
});
