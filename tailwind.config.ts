import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        calead: {
          bg: "#0F172A",
          accent: "#4F46E5",
          accentSoft: "#EEF2FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
