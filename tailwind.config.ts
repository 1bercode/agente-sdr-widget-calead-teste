import type { Config } from "tailwindcss";
import caleadPreset from "./packages/calead-ui/tailwind.preset";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/calead-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [caleadPreset as Config],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
