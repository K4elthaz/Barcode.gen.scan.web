/**
 * CBDI-inspired color palette
 * Synced with global CSS variables
 * Uses HSL format for Tailwind integration
 */

// Light Mode Colors
export const lightColors = {
  primary: "#1C6339",
  onPrimary: "#FFFFFF",
  primaryContainer: "#FDEDB7",
  onPrimaryContainer: "#173A26",

  secondary: "#D2A10A",
  onSecondary: "#173A26",
  secondaryContainer: "#FDEDB7",
  onSecondaryContainer: "#173A26",

  surface: "#FBF9F2",
  onSurface: "#183324",
  surfaceVariant: "#EEE8D9",
  onSurfaceVariant: "#4F6255",
  outline: "#DAD0BB",

  error: "#BA1A1A",
  onError: "#FFFFFF",
};

// Dark Mode Colors
export const darkColors = {
  primary: "#94C65D",
  onPrimary: "#102618",
  primaryContainer: "#214D31",
  onPrimaryContainer: "#FDEDB7",

  secondary: "#F0C64A",
  onSecondary: "#102618",
  secondaryContainer: "#6B5205",
  onSecondaryContainer: "#FDEDB7",

  surface: "#0E1B13",
  onSurface: "#F0EADD",
  surfaceVariant: "#263B2E",
  onSurfaceVariant: "#D1C7B4",
  outline: "#55705F",

  error: "#FFBAB",
  onError: "#690005",
};

// HSL Values for CSS Variables
export const colorHSL = {
  light: {
    primary: "145 56% 25%",
    onPrimary: "0 0% 100%",
    primaryContainer: "43 96% 89%",
    onPrimaryContainer: "145 45% 20%",

    secondary: "43 92% 43%",
    onSecondary: "145 32% 14%",
    secondaryContainer: "43 96% 89%",
    onSecondaryContainer: "145 45% 20%",

    surface: "42 38% 97%",
    onSurface: "145 32% 14%",
    surfaceVariant: "43 26% 91%",
    onSurfaceVariant: "145 12% 35%",
    outline: "43 24% 84%",

    error: "0 83% 50%",
    onError: "0 0% 100%",
  },
  dark: {
    primary: "101 39% 55%",
    onPrimary: "145 40% 10%",
    primaryContainer: "145 38% 22%",
    onPrimaryContainer: "43 96% 89%",

    secondary: "43 86% 59%",
    onSecondary: "145 40% 10%",
    secondaryContainer: "43 86% 22%",
    onSecondaryContainer: "43 96% 89%",

    surface: "145 30% 8%",
    onSurface: "43 24% 92%",
    surfaceVariant: "145 15% 20%",
    onSurfaceVariant: "43 16% 76%",
    outline: "145 14% 25%",

    error: "8 100% 73%",
    onError: "0 100% 20%",
  },
};

/**
 * Usage in components:
 * - Use Tailwind classes: bg-primary, text-primary, etc.
 * - Use CSS variables: var(--primary), var(--secondary), etc.
 * - Direct hex values: lightColors.primary, darkColors.primary
 * - Direct HSL: colorHSL.light.primary, colorHSL.dark.primary
 */
