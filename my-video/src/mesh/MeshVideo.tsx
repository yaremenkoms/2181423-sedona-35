import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig } from "./types";
import { Background } from "./Background";
import { Laptop, Phone, laptopSize, phoneSize } from "./Devices";
import { SideContent } from "./Side";
import { asset, sceneEnd } from "./ScreenStack";
import { EASE_IN_OUT, FONT, H, W, clamp } from "./theme";

// Плавный переход значения на границах сцен: v(i) — целевое значение сцены i
const sceneValue = (cfg: MeshVideoConfig, t: number, v: (i: number) => number, dur = 0.5) => {
  let i = cfg.scenes.findIndex((s, k) => t >= s.start && t < sceneEnd(cfg, k));
  if (i < 0) i = t < cfg.scenes[0].start ? 0 : cfg.scenes.length - 1;
  const prev = i > 0 ? v(i - 1) : v(0);
  return interpolate(t, [cfg.scenes[i].start, cfg.scenes[i].start + dur], [prev, v(i)], { ...clamp, easing: EASE_IN_OUT });
};

const DeviceLayer: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const isPhone = cfg.device === "phone";
  const size = isPhone ? phoneSize(cfg) : laptopSize(cfg);
  const dh = isPhone ? size.h : size.h + 34;

  // Появление после обложки и уход перед финалом
  const enter = spring({ frame, fps, delay: Math.round(cfg.coverEnd * fps), config: { damping: 17, stiffness: 110 } });
  const leave = interpolate(t, [cfg.finalStart - 0.1, cfg.finalStart + 0.4], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  if (t < cfg.coverEnd - 0.05 || leave >= 1) return null;

  const hasSide = (i: number) => (cfg.scenes[i].side ? 1 : 0);
  const sideP = sceneValue(cfg, t, hasSide);
  const tiltP = sceneValue(cfg, t, (i) => (cfg.scenes[i].tilt ? 1 : 0), 0.7);

  const baseScale = isPhone ? 1 : 0.9;
  const sideScale = isPhone ? 1 : 0.62;
  const cx = interpolate(sideP, [0, 1], [W / 2, isPhone ? 700 : 640]);
  const scale = interpolate(sideP, [0, 1], [baseScale, sideScale]) * interpolate(enter, [0, 1], [0.3, 1]) * (1 - leave * 0.2);

  // Приближение камеры (ноутбук)
  const zoomScale = sceneValue(cfg, t, (i) => cfg.scenes[i].zoom?.scale ?? 1, 0.7);
  const zoomRect = (i: number) => cfg.scenes[i].zoom?.rect;
  const zx = sceneValue(cfg, t, (i) => {
    const r = zoomRect(i);
    return r ? size.w / 2 - (size.bezel + (r.x + r.w / 2) * size.scale) : 0;
  }, 0.7);
  const zy = sceneValue(cfg, t, (i) => {
    const r = zoomRect(i);
    return r ? dh / 2 - (size.bezel + (isPhone ? 0 : 46) + (r.y + r.h / 2) * size.scale) : 0;
  }, 0.7);

  const float = Math.sin(frame / 40) * 6;

  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <div
        style={{
          position: "absolute",
          left: cx - size.w / 2,
          top: H / 2 - dh / 2 + float,
          width: size.w,
          height: dh,
          scale: scale * zoomScale,
          translate: `${zx * (zoomScale - 1)}px ${zy * (zoomScale - 1)}px`,
          opacity: interpolate(enter, [0, 0.3], [0, 1], clamp) * (1 - leave),
          rotate: `x ${tiltP * 8}deg`,
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ rotate: `y ${tiltP * -18}deg`, width: size.w, height: dh }}>{isPhone ? <Phone cfg={cfg} /> : <Laptop cfg={cfg} />}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cover: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const out = interpolate(t, [cfg.coverEnd - 0.15, cfg.coverEnd + 0.25], [1, 0], clamp);
  const zoom = interpolate(t, [0, cfg.coverEnd], [1, 1.04], clamp) + (1 - out) * 0.06;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: out * fadeIn }}>
      <Img src={asset(cfg, cfg.cover)} style={{ width: W, height: H, scale: zoom }} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay: 6, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img
        src={asset(cfg, cfg.service.logo)}
        style={{
          width: 170,
          borderRadius: 40,
          scale: interpolate(p, [0, 1], [0.5, 1]),
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          boxShadow: "0 30px 60px rgba(20,20,60,0.25)",
        }}
      />
    </AbsoluteFill>
  );
};

export const MeshVideo: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background color={cfg.service.color} />

      <DeviceLayer cfg={cfg} />

      {cfg.scenes.map((s, i) =>
        s.side ? (
          <Sequence
            key={i}
            from={sec(s.side.at ?? s.start)}
            durationInFrames={sec(sceneEnd(cfg, i)) - sec(s.side.at ?? s.start)}
            premountFor={fps}
          >
            <SideContent cfg={cfg} side={s.side} len={sec(sceneEnd(cfg, i)) - sec(s.side.at ?? s.start)} />
          </Sequence>
        ) : null,
      )}

      <Sequence durationInFrames={sec(cfg.coverEnd + 0.4)} premountFor={fps}>
        <Cover cfg={cfg} />
      </Sequence>

      <Sequence from={sec(cfg.finalStart)} premountFor={fps}>
        <Final cfg={cfg} />
      </Sequence>

      <Audio src={asset(cfg, cfg.voice)} />
    </AbsoluteFill>
  );
};

