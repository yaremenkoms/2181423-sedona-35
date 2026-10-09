import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mix, rgba } from "./theme";

// Фон: насыщенный цвет сервиса слева (за устройством) → светлый справа (под панелью шагов),
// крупные контурные фигуры. Движение — едва заметное, чтобы ничего не «дёргалось».
const SHAPES: { x: number; y: number; s: number; kind: "diamond" | "square" | "triangle"; r: number; o: number }[] = [
  { x: 110, y: 360, s: 170, kind: "diamond", r: 45, o: 0.5 },
  { x: 1180, y: 660, s: 190, kind: "square", r: -12, o: 0.35 },
  { x: 1640, y: 520, s: 230, kind: "square", r: 18, o: 0.3 },
  { x: 1520, y: 860, s: 160, kind: "triangle", r: 10, o: 0.3 },
  { x: 120, y: 860, s: 90, kind: "square", r: 8, o: 0.35 },
  { x: 1040, y: 60, s: 70, kind: "diamond", r: 45, o: 0.3 },
];

const Outline: React.FC<{ kind: string; s: number }> = ({ kind, s }) => {
  if (kind === "triangle") {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <path d="M10 90 L50 12 L90 90 Z" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
    );
  }
  return <div style={{ width: s, height: s, border: "3px solid #FFFFFF", boxSizing: "border-box" }} />;
};

export const Background: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(100deg, ${mix(color, "#000000", 0.05)} 0%, ${mix(color, "#FFFFFF", 0.3)} 38%, ${mix(color, "#FFFFFF", 0.72)} 68%, ${mix(color, "#FFFFFF", 0.9)} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 1250,
          top: -250,
          width: 900,
          height: 700,
          borderRadius: "50%",
          background: rgba(mix(color, "#FFFFFF", 0.5), 0.45),
          filter: "blur(110px)",
        }}
      />
      {SHAPES.map((sh, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: sh.x,
            top: sh.y,
            rotate: `${sh.r + frame * 0.02 * (i % 2 ? 1 : -1)}deg`,
            opacity: sh.o,
          }}
        >
          <Outline kind={sh.kind} s={sh.s} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
