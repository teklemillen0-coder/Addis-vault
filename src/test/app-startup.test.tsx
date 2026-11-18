import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AddisVaultApp from "@/AddisVaultApp";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

describe("App startup without Supabase environment variables", () => {
  it("renders the default app instead of the error boundary", async () => {
    render(
      <AppErrorBoundary>
        <AddisVaultApp />
      </AppErrorBoundary>,
    );

    expect(await screen.findByRole("heading", { name: "AI App Builder" })).toBeInTheDocument();
  });
});
