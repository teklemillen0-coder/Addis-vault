import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppErrorBoundary } from "@/components/AppErrorBoundary";

describe("AppErrorBoundary", () => {
  it("shows a refresh fallback when a child throws during render", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenChild(): never {
      throw new Error("client render failure");
    }

    try {
      render(
        <AppErrorBoundary>
          <BrokenChild />
        </AppErrorBoundary>,
      );

      expect(screen.getByRole("heading", { name: "This page didn't load" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Refresh page" })).toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
