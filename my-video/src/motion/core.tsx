import React, { createContext, useContext } from "react";
import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* ───────── Шрифты и палитра (стиль моушен-скилла) ───────── */

const CYR = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LAT =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const face = (family: string, file: string, weight: string, style = "normal") => {
  loadFont({ family, url: staticFile(`fonts/${file.replace("SUB", "cyrillic")}.woff2`), weight, style, unicodeRange: CYR });
  loadFont({ family, url: staticFile(`fonts/${file.replace("SUB", "latin")}.woff2`), weight, style, unicodeRange: LAT });
};
for (const w of ["700", "800", "900"]) face("Inter Tight", `inter-tight-SUB-${w}-normal`, w);
for (const w of ["500", "700"]) face("JetBrains Mono", `jetbrains-mono-SUB-${w}-normal`, w);
for (const w of ["500", "700"]) face("Playfair Display", `playfair-display-SUB-${w}-italic`, w, "italic");

export const F = {
  head: "'Inter Tight', sans-serif", // заголовки и числа
  mono: "'JetBrains Mono', monospace", // подписи и данные
  serif: "'Playfair Display', serif", // «возвышенные» слова, курсив
};

export const P = {
  bg: "#07080B",
  ink: "#F4F5F7",
  dim: "#6B7080",
  lime: "#C8FF3E",
  cy: "#46E0FF",
  vio: "#A58BFF",
  pink: "#FF4FB0",
  gold: "#FFC53D",
  hot: "#FF4A2B",
  light: "#F3F1EC",
  lightInk: "#0B0C10",
};
export type Accent = "lime" | "cy" | "vio" | "pink" | "gold" | "hot";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

/* ───────── Слова озвучки ───────── */

export type Word = { text: string; norm: string; start: number; end: number };
export type Words = { duration: number; words: Word[] };

const normalize = (w: string) => w.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");

// W('слово', n) — момент n-го вхождения слова (нормализованного: нижний регистр, без «ё» и знаков)
export const makeW = (data: Words) => (word: string, n = 1): number => {
  const key = normalize(word);
  const hits = data.words.filter((w) => w.norm === key);
  const hit = hits[n - 1];
  if (!hit) throw new Error(`W('${word}', ${n}): слово не найдено в озвучке (вхождений: ${hits.length})`);
  return hit.start;
};

/* ───────── Время внутри сцены ───────── */

// Сцена рендерится в <Sequence>, но все тайминги в сценарии — абсолютные (секунды озвучки)
const SceneCtx = createContext({ start: 0, light: false });
export const SceneProvider = SceneCtx.Provider;
export const useScene = () => useContext(SceneCtx);

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start } = useScene();
  return frame / fps + start;
};

// Пружина, стартующая в абсолютный момент at
export const useSpr = (at: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 14, stiffness: 150, ...config } });
};

/* ───────── Кинетическая типографика ───────── */

// Буквы появляются с blur, подъёмом и пружиной
export const CharsIn: React.FC<{ text: string; at: number; stagger?: number; style?: React.CSSProperties; color?: string }> = ({
  text,
  at,
  stagger = 0.025,
  style,
  color,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", color, ...style }}>
      {Array.from(text).map((ch, i) => {
        const local = Math.round((t - at - i * stagger) * fps);
        const p = spring({ frame: local, fps, config: { damping: 13, stiffness: 170 } });
        const blur = interpolate(local, [0, 8], [14, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(local, [0, 4], [0, 1], clamp),
              translate: `0 ${(1 - p) * 0.55}em`,
              filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// Появление блока целиком: пружина + подъём
export const Pop: React.FC<{ at: number; children: React.ReactNode; from?: "up" | "scale" | "left" | "right"; style?: React.CSSProperties }> = ({
  at,
  children,
  from = "up",
  style,
}) => {
  const p = useSpr(at, { damping: 13, stiffness: 160 });
  const tr =
    from === "scale"
      ? { scale: interpolate(p, [0, 1], [0.4, 1]) }
      : from === "left"
        ? { translate: `${(1 - p) * -120}px 0` }
        : from === "right"
          ? { translate: `${(1 - p) * 120}px 0` }
          : { translate: `0 ${(1 - p) * 80}px` };
  return <div style={{ ...style, ...tr, opacity: interpolate(p, [0, 0.35], [0, 1], clamp) }}>{children}</div>;
};

// Счётчик числа
export const useCount = (from: number, to: number, at: number, dur: number) => {
  const t = useT();
  return Math.round(interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: EASE }));
};
