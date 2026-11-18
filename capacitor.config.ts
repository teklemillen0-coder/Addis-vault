import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.addisvault.app",
  appName: "Addis-Vault",
  webDir: "dist/client",
  server: {
    url: "https://workers.dev",
    cleartext: false,
  },
};

export default config;
