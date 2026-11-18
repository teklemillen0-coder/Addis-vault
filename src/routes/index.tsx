import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The marketplace keeps cart, language, theme and purchases on the device, so it renders in the browser.
const AddisVaultApp = lazy(() => import("@/AddisVaultApp"));

const TITLE = "Addis-Vault — AI App Builder";
const DESCRIPTION =
  "Build, preview, import, and export apps with your own AI provider keys in Addis-Vault.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <img src="/icon.svg" alt="" className="h-12 w-12 animate-pulse" />
      <p className="font-display text-sm font-semibold text-muted-foreground">Addis-Vault</p>
    </div>
  );
}

function Index() {
  return (
    <ClientOnly fallback={<AppLoading />}>
      <Suspense fallback={<AppLoading />}>
        <AddisVaultApp />
      </Suspense>
    </ClientOnly>
  );
}
