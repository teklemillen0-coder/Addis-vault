import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Hidden Owner Security Gate: the PIN lives only in the OWNER_DASHBOARD_PIN secret and is checked
// here together with the caller's admin role. The browser never sees or stores the PIN.

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const attempts = new Map<string, number[]>();

export const verifyOwnerPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { pin: string }) => z.object({ pin: z.string().trim().min(1).max(20) }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const now = Date.now();
    const recent = (attempts.get(context.userId) || []).filter((t) => now - t < 10 * 60_000);
    if (recent.length >= 8) return { ok: false };
    recent.push(now);
    attempts.set(context.userId, recent);

    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const expected = process.env["OWNER_DASHBOARD_PIN"] || "";
    if (!isAdmin || !expected) return { ok: false };
    const ok = safeEqual(data.pin, expected);
    if (ok) attempts.delete(context.userId);
    return { ok };
  });
