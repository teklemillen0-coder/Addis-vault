import { afterEach, describe, expect, it, vi } from "vitest";

import { isSupabaseConfigured } from "@/integrations/supabase/is-configured";

describe("Supabase client configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled when either public setting is missing", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-key");

    expect(isSupabaseConfigured()).toBe(false);
  });

  it("is enabled when both public settings are present", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-key");

    expect(isSupabaseConfigured()).toBe(true);
  });
});
