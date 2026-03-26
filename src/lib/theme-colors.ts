/**
 * Material Design 3 Color Palette
 * Synced with Android app theme
 * Uses HSL format for Tailwind integration
 */

// Light Mode Colors
export const lightColors = {
  primary: "#006C4C",
  onPrimary: "#FFFFFF",
  primaryContainer: "#89F8C7",
  onPrimaryContainer: "#002114",

  secondary: "#6D5E00",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FBE465",
  onSecondaryContainer: "#211B00",

  surface: "#F5FBF5",
  onSurface: "#171D1A",
  surfaceVariant: "#DEE5DE",
  onSurfaceVariant: "#404943",
  outline: "#707973",

  error: "#BA1A1A",
  onError: "#FFFFFF",
};

// Dark Mode Colors
export const darkColors = {
  primary: "#6CDBAC",
  onPrimary: "#003825",
  primaryContainer: "#005138",
  onPrimaryContainer: "#89F8C7",

  secondary: "#DEC84C",
  onSecondary: "#393000",
  secondaryContainer: "#524600",
  onSecondaryContainer: "#FBE465",

  surface: "#0E1512",
  onSurface: "#DEE4DF",
  surfaceVariant: "#404943",
  onSurfaceVariant: "#BFC9C1",
  outline: "#8A938C",

  error: "#FFBAB",
  onError: "#690005",
};

// HSL Values for CSS Variables
export const colorHSL = {
  light: {
    primary: "159 100% 21%",
    onPrimary: "0 0% 100%",
    primaryContainer: "151 93% 68%",
    onPrimaryContainer: "159 100% 8%",

    secondary: "48 100% 21%",
    onSecondary: "0 0% 100%",
    secondaryContainer: "48 97% 68%",
    onSecondaryContainer: "48 100% 7%",

    surface: "150 50% 97%",
    onSurface: "150 14% 10%",
    surfaceVariant: "150 35% 87%",
    onSurfaceVariant: "150 8% 26%",
    outline: "150 5% 45%",

    error: "0 83% 50%",
    onError: "0 0% 100%",
  },
  dark: {
    primary: "151 71% 60%",
    onPrimary: "159 100% 11%",
    primaryContainer: "159 100% 16%",
    onPrimaryContainer: "151 93% 68%",

    secondary: "48 90% 61%",
    onSecondary: "48 100% 11%",
    secondaryContainer: "48 100% 16%",
    onSecondaryContainer: "48 97% 68%",

    surface: "150 20% 5%",
    onSurface: "150 40% 86%",
    surfaceVariant: "150 8% 26%",
    onSurfaceVariant: "150 24% 76%",
    outline: "150 8% 58%",

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
