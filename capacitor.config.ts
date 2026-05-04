import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.quicksalehub.app",
  appName: "Quick Sales Hub",
  webDir: "public",
  server: {
    url: "https://www.quicksalehub.com",
    cleartext: false,
  },
};

export default config;
