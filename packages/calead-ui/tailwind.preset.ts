import type { Config } from "tailwindcss";
import { colors } from "./src/tokens/colors";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        calead: {
          bg: colors.brand.bg,
          accent: colors.brand.accent,
          accentSoft: colors.brand.accentSoft,
          glass: colors.glass,
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.12)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.32), 0 4px 16px rgba(0, 0, 0, 0.16)",
      },
      backdropBlur: {
        glass: "16px",
        "glass-lg": "24px",
      },
    },
  },
};

export default preset;
