import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, rgba } from "./theme";

// Фон в цвете сервиса: насыщенный снизу слева → светлый сверху справа (как на обложках)
// и редкие фирменные фигуры. Брендбук: фигуры не больше 50 px и не накладываются друг на друга.
const SHAPES: { x: number; y: number; s: number; kind: "diamond" | "triangle" | "square" | "dot"; r: number }[] = [
  { x: 210, y: 820, s: 34, kind: "diamond", r: 20 },
  { x: 380, y: 210, s: 30, kind: "triangle", r: -10 },
  { x: 1560, y: 180, s: 36, kind: "square", r: 25 },
  { x: 1720, y: 860, s: 30, kind: "triangle", r: 30 },
  { x: 120, y: 470, s: 14, kind: "dot", r: 0 },
  { x: 1380, y: 950, s: 26, kind: "diamond", r: 10 },
  { x: 760, y: 980, s: 22, kind: "square", r: 15 },
  { x: 1840, y: 520, s: 14, kind: "dot", r: 0 },
];

const Shape: React.FC<{ kind: string; s: number; color: string }> = ({ kind, s, color }) => {
  if (kind === "triangle") {
    return (
      <svg width={s} height={s} viewBox="0 0 10 10">
        <path d="M2 1.5 L8.5 5 L2 8.5 Z" fill={color} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "dot") {
    return <div style={{ width: s, height: s, borderRadius: "50%", background: color }} />;
  }
  if (kind === "square") {
    return <div style={{ width: s, height: s, borderRadius: s * 0.22, border: `3px solid ${color}`, boxSizing: "border-box" }} />;
  }
  return <div style={{ width: s, height: s, borderRadius: s * 0.18, background: color, rotate: "45deg" }} />;
};

export const Background: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(28deg, ${mix(color, "#000000", 0.04)} 0%, ${mix(color, "#FFFFFF", 0.35)} 45%, ${mix(color, "#FFFFFF", 0.72)} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* мягкий свет */}
      <div
        style={{
          position: "absolute",
          left: 900 + Math.sin(frame / 90) * 80,
          top: -300,
          width: 1200,
          height: 1000,
          borderRadius: "50%",
          background: rgba("#FFFFFF", 0.35),
          filter: "blur(120px)",
        }}
      />
      {SHAPES.map((sh, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: sh.x,
            top: sh.y + Math.sin(frame / 45 + i) * 8,
            rotate: `${sh.r + Math.sin(frame / 80 + i) * 6}deg`,
            opacity: 0.32,
          }}
        >
          <Shape kind={sh.kind} s={sh.s} color="#FFFFFF" />
        </div>
      ))}
    </AbsoluteFill>
  );
};
