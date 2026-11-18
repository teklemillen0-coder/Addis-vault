import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The marketplace keeps cart, language, theme and purchases on the device, so it renders in the browser.
const AddisVaultApp = lazy(() => import("@/AddisVaultApp"));

const TITLE = "AddisVault — Ethiopian Digital Library & Marketplace";
const DESCRIPTION =
  "Installable Ethiopian digital library & marketplace with Telebirr & CBE checkout, 70+ study, exam, recipe, medical & repair resources, 5-language UI, and Smart Link Downloader.";

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
      <p className="font-display text-sm font-semibold text-muted-foreground">AddisVault</p>
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
