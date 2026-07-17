/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../src/**/*.{js,ts,jsx,tsx}", "../stories/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        calead: {
          bg: "#0F172A",
          accent: "#4F46E5",
          accentSoft: "#EEF2FF",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.12)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.32), 0 4px 16px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [],
};
