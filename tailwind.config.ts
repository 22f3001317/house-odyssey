import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { sea: "#FBF4E6", ink: "#5A2431", moss: "#8A3B4B", compass: "#E8C875", dusk: "#7A2E3B" },
    fontFamily: {
      display: ['"Avenir Next"', '"Trebuchet MS"', "ui-rounded", "system-ui", "sans-serif"],
      body: ["system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
    },
  } },
  plugins: [],
} satisfies Config;
