import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

export const FONT = "Manrope";

const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

for (const weight of ["500", "700", "800"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/manrope-cyrillic-${weight}-normal.woff2`),
    weight,
    unicodeRange: CYRILLIC,
  });
  loadFont({
    family: FONT,
    url: staticFile(`fonts/manrope-latin-${weight}-normal.woff2`),
    weight,
    unicodeRange: LATIN,
  });
}

export const C = {
  bgFrom: "#2F4BD8",
  bgTo: "#6A8BFF",
  ink: "#0E1A4F",
  white: "#FFFFFF",
  soft: "rgba(255,255,255,0.78)",
  accent: "#FFC93C", // жёлтый — «куда нажимать»
  success: "#2BC48A",
  card: "#FFFFFF",
};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

// Геометрия раскладки 1920×1080
export const K = 0.95; // масштаб записи экрана
export const SCREEN_W = 437 * K;
export const SCREEN_H = 856 * K;
export const BEZEL = 13;
export const PHONE = {
  left: 790,
  top: 168,
  w: SCREEN_W + BEZEL * 2,
  h: SCREEN_H + BEZEL * 2,
};
export const CALLOUT = { left: 1330, width: 500 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
