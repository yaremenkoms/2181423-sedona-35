import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig, Mark, Scene } from "./types";
import { clamp } from "./theme";

export const sceneEnd = (cfg: MeshVideoConfig, i: number) => cfg.scenes[i + 1]?.start ?? cfg.finalStart;

export const asset = (cfg: MeshVideoConfig, p: string) => staticFile(`videos/${cfg.id}/${p}`);

// Подсветка элемента: рамка в цвете сервиса + касание/клик
const Highlight: React.FC<{ mark: Mark; until: number; scale: number; color: string; device: "phone" | "laptop" }> = ({
  mark,
  until,
  scale,
  color,
  device,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < mark.at - 0.05 || t > until) return null;

  const local = frame - Math.round(mark.at * fps);
  const p = spring({ frame: local, fps, config: { damping: 15, stiffness: 170 } });
  const out = interpolate(t, [until - 0.2, until], [1, 0], clamp);
  const r = mark.rect;
  const pad = 6 / scale;
  const tap = mark.tap !== false && device === "phone";
  const tapLocal = local - Math.round(0.3 * fps);
  const tapP = interpolate(tapLocal, [0, 5, 18], [0, 1, 0], clamp);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: (r.x - pad) * scale,
          top: (r.y - pad) * scale,
          width: (r.w + pad * 2) * scale,
          height: (r.h + pad * 2) * scale,
          borderRadius: Math.min(16, ((r.h + pad * 2) * scale) / 2),
          border: `${device === "phone" ? 3.5 : 3}px solid ${color}`,
          boxShadow: `0 0 0 4px rgba(255,255,255,0.65), 0 6px 22px rgba(0,0,0,0.12)`,
          opacity: p * out,
          scale: interpolate(p, [0, 1], [1.08, 1]),
          boxSizing: "border-box",
        }}
      />
      {tap ? (
        <div
          style={{
            position: "absolute",
            left: (r.x + r.w / 2) * scale - 22,
            top: (r.y + r.h / 2) * scale - 22,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(120,120,130,0.55)",
            opacity: tapP,
            scale: interpolate(tapP, [0, 1], [1.4, 1]),
          }}
        />
      ) : null}
    </>
  );
};

const SceneScreen: React.FC<{ cfg: MeshVideoConfig; scene: Scene; index: number; scale: number }> = ({ cfg, scene, index, scale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const start = scene.start;
  const end = sceneEnd(cfg, index);
  // Смена экрана — короткое растворение поверх предыдущего
  const sameAsPrev = index > 0 && cfg.scenes[index - 1].screen === scene.screen;
  const fadeIn = index === 0 || sameAsPrev ? 1 : interpolate(t, [start, start + 0.25], [0, 1], clamp);
  if (t < start - 0.01 || t > end + 0.3) return null;

  const marks = scene.marks ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
      <Img src={asset(cfg, scene.screen)} style={{ width: cfg.screenSize.w * scale, height: cfg.screenSize.h * scale, display: "block" }} />
      {marks.map((m, i) => (
        <Highlight key={i} mark={m} until={marks[i + 1]?.at ?? end} scale={scale} color={cfg.service.color} device={cfg.device} />
      ))}
    </div>
  );
};

// Все скриншоты ролика, сменяющиеся по сценам
export const ScreenStack: React.FC<{ cfg: MeshVideoConfig; scale: number }> = ({ cfg, scale }) => (
  <div style={{ position: "relative", width: cfg.screenSize.w * scale, height: cfg.screenSize.h * scale, overflow: "hidden", background: "white" }}>
    {cfg.scenes.map((s, i) => (
      <SceneScreen key={i} cfg={cfg} scene={s} index={i} scale={scale} />
    ))}
  </div>
);
