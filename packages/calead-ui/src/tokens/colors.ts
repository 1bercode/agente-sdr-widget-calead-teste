export const colors = {
  brand: {
    bg: "#0F172A",
    accent: "#4F46E5",
    accentSoft: "#EEF2FF",
    accentHover: "#4338CA",
  },
  glass: {
    /** Superfície principal — dark frosted glass neutro multi-tenant */
    surface: "rgba(24, 24, 28, 0.88)",
    surfaceElevated: "rgba(30, 30, 36, 0.92)",
    chip: "rgba(38, 38, 44, 0.78)",
    border: "rgba(255, 255, 255, 0.1)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    textPrimary: "rgba(255, 255, 255, 0.92)",
    textSecondary: "rgba(255, 255, 255, 0.55)",
    textMuted: "rgba(255, 255, 255, 0.38)",
    bubbleUser: "rgba(255, 255, 255, 0.14)",
    bubbleAssistant: "rgba(255, 255, 255, 0.08)",
    mic: "#2F4F44",
    micHover: "#3A6356",
  },
  surface: {
    white: "#FFFFFF",
    muted: "#F8FAFC",
    border: "#E2E8F0",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    inverse: "#FFFFFF",
    muted: "#94A3B8",
  },
  status: {
    success: "#10B981",
    successSoft: "#D1FAE5",
    warning: "#F59E0B",
    warningSoft: "#FEF3C7",
    error: "#EF4444",
    errorSoft: "#FEE2E2",
  },
} as const;

export type BrandColor = keyof typeof colors.brand;
