import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2A3FFF",
          "blue-dark": "#1A2FE0",
          "blue-light": "#4D5FFF",
          "blue-bg": "#EEF0FF",
          yellow: "#FFB800",
          "yellow-dark": "#E5A500",
          "yellow-light": "#FFD54F",
          "yellow-bg": "#FFF8E1",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.12)",
        toast: "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
