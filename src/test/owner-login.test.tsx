import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OwnerLoginModal } from "@/components/OwnerLoginModal";
import { Navbar } from "@/components/Navbar";
import { loadAccount } from "@/lib/community-data";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

const successfulSignIn = {
  data: {
    user: { id: "authenticated-user" } as User,
    session: {
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
      token_type: "bearer",
      user: { id: "authenticated-user" } as User,
    } satisfies Session,
  },
  error: null,
};

vi.mock("@/integrations/supabase/is-configured", () => ({
  isSupabaseConfigured: () => true,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock("@/lib/community-data", () => ({
  loadAccount: vi.fn(),
}));

describe("OwnerLoginModal", () => {
  const onClose = vi.fn();
  const onOwnerVerified = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens Owner Dashboard only after the account's admin role is verified", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(successfulSignIn);
    vi.mocked(loadAccount).mockResolvedValue({
      userId: "owner-user",
      email: "owner@example.com",
      isAdmin: true,
      member: null,
    });

    render(<OwnerLoginModal isOpen onClose={onClose} onOwnerVerified={onOwnerVerified} />);
    fireEvent.change(screen.getByLabelText("Owner email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in as Owner" }));

    await waitFor(() => {
      expect(onOwnerVerified).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "owner-user", isAdmin: true }),
      );
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("rejects and signs out an authenticated account without the admin role", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(successfulSignIn);
    vi.mocked(loadAccount).mockResolvedValue({
      userId: "member-user",
      email: "member@example.com",
      isAdmin: false,
      member: null,
    });
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    render(<OwnerLoginModal isOpen onClose={onClose} onOwnerVerified={onOwnerVerified} />);
    fireEvent.change(screen.getByLabelText("Owner email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "member-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in as Owner" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This account does not have the verified Owner admin role.",
    );
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(onOwnerVerified).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Owner login entry point", () => {
  it("opens the dedicated login after five brand taps without opening member registration", () => {
    const onOpenOwnerLogin = vi.fn();
    const onOpenMemberAuth = vi.fn();
    render(
      <Navbar
        lang="en"
        onChangeLang={vi.fn()}
        activeTab="marketplace"
        onSelectTab={vi.fn()}
        cartCount={0}
        onOpenCart={vi.fn()}
        downloadsCount={0}
        theme="light"
        onToggleTheme={vi.fn()}
        isInstalled
        onInstallClick={vi.fn()}
        currentMember={null}
        onOpenMemberAuth={onOpenMemberAuth}
        onOpenOwnerLogin={onOpenOwnerLogin}
      />,
    );

    const brand = screen.getByRole("button", { name: "Addis-Vault" });
    for (let tap = 0; tap < 5; tap++) fireEvent.click(brand);

    expect(onOpenOwnerLogin).toHaveBeenCalledOnce();
    expect(onOpenMemberAuth).not.toHaveBeenCalled();
  });
});
