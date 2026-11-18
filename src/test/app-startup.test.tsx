import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AddisVaultApp from "@/AddisVaultApp";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

describe("App startup without Supabase environment variables", () => {
  it("renders the paid default-tool gate instead of the error boundary", () => {
    render(
      <AppErrorBoundary>
        <AddisVaultApp />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /VIP All-Access Pass/ })).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong while loading the app")).toBeNull();
  });
});
