import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Брендбук МЭШ: основная гарнитура — Raleway
export const FONT = "Raleway";

const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

// Дополнительная гарнитура — Roboto: ею набраны копии элементов интерфейса
export const UI_FONT = "Roboto";

for (const weight of ["300", "400", "500", "700", "800", "900"]) {
  loadFont({ family: FONT, url: staticFile(`fonts/raleway-cyrillic-${weight}-normal.woff2`), weight, unicodeRange: CYRILLIC });
  loadFont({ family: FONT, url: staticFile(`fonts/raleway-latin-${weight}-normal.woff2`), weight, unicodeRange: LATIN });
}
for (const weight of ["400", "500", "700"]) {
  loadFont({ family: UI_FONT, url: staticFile(`fonts/roboto-cyrillic-${weight}-normal.woff2`), weight, unicodeRange: CYRILLIC });
  loadFont({ family: UI_FONT, url: staticFile(`fonts/roboto-latin-${weight}-normal.woff2`), weight, unicodeRange: LATIN });
}

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── Работа с цветом сервиса ── */

const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

// t=0 → исходный цвет, t=1 → второй цвет
export const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

export const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Палитра ролика, выведенная из одного цвета сервиса
export const palette = (color: string) => ({
  base: color,
  deep: mix(color, "#000000", 0.18), // текст инфографики на светлом фоне
  light: mix(color, "#FFFFFF", 0.62),
  pale: mix(color, "#FFFFFF", 0.85),
  ink: mix(color, "#0B0F2E", 0.55), // пояснения — темнее для контраста
  title: mix(color, "#0A0420", 0.62), // крупные заголовки шагов
  sub: mix(color, "#0A0420", 0.3), // связки под заголовком
  eyebrow: mix(color, "#FFFFFF", 0.25), // «ШАГ 1 ИЗ 6»
});

// Цвета копий интерфейса
export const UI = {
  text: "#1B1C29",
  muted: "#8A8FA3",
  card: "#FFFFFF",
  success: "#22B05A",
};

// Геометрия кадра
export const W = 1920;
export const H = 1080;
