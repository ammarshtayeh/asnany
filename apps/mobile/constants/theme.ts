/** Malamih brand theme — matches visual identity mockups */
export const theme = {
  navy: "#0a1628",
  navySoft: "#0f172a",
  teal: "#0c5e47",
  tealLight: "#10b981",
  tealMuted: "#ecfdf5",
  gold: "#d4af37",
  goldLight: "#f59e0b",
  goldMuted: "#fffbeb",
  sky: "#0284c7",
  skyMuted: "#eff6ff",
  purple: "#7c3aed",
  purpleMuted: "#f5f3ff",
  pink: "#db2777",
  pinkMuted: "#fdf2f8",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  text: "#0f172a",
  textMuted: "#64748b",
  textSoft: "#94a3b8",
  white: "#ffffff",
  offerGradient: ["#7c3aed", "#db2777"] as const,
  promoGradient: ["#2563eb", "#7c3aed"] as const,
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 22,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: "#0a1628",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  },
} as const;

/** @deprecated use `theme` — kept for legacy components */
export const colors = {
  ink: theme.navy,
  amber: theme.gold,
  primary: theme.teal,
  background: theme.bg,
  white: theme.white,
  border: theme.border,
} as const;
