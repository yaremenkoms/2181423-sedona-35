import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig } from "./types";
import { Background } from "./Background";
import { Laptop, Phone, laptopSize, phoneSize } from "./Devices";
import { StepPanel, Tracker, stepEnd } from "./Panel";
import { asset, sceneEnd } from "./ScreenStack";
import { EASE_IN_OUT, FONT, H, W, clamp } from "./theme";

// Где стоит устройство: слева, панель шагов — справа
const DEVICE_CX = { phone: 640, laptop: 600 };
const LAPTOP_SCALE = 0.66;

// Плавный переход значения на границах сцен (никаких колебаний между ними)
const sceneValue = (cfg: MeshVideoConfig, t: number, v: (i: number) => number, dur = 0.6) => {
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

  const enter = spring({ frame, fps, delay: Math.round((cfg.coverEnd - 0.1) * fps), config: { damping: 200, stiffness: 90 } });
  const leave = interpolate(t, [cfg.finalStart - 0.1, cfg.finalStart + 0.45], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  if (t < cfg.coverEnd - 0.15 || leave >= 1) return null;

  if (isPhone) {
    const s = phoneSize(cfg);
    // Камера: экран телефона выше кадра — проезжаем к области подсветки
    const topFor = (i: number) => {
      const sc = cfg.scenes[i];
      const fy = sc.focusY ?? (sc.marks?.[0] ? sc.marks[0].rect.y + sc.marks[0].rect.h / 2 : cfg.screenSize.h * 0.3);
      const want = H / 2 - (s.bezel + fy * s.scale);
      return Math.max(H - s.h - 60, Math.min(60, want));
    };
    const top = sceneValue(cfg, t, topFor);
    return (
      <div
        style={{
          position: "absolute",
          left: DEVICE_CX.phone - s.w / 2,
          top: top + (1 - enter) * 700 + leave * 900,
          opacity: interpolate(enter, [0, 0.25], [0, 1], clamp) * (1 - leave),
        }}
      >
        <Phone cfg={cfg} />
      </div>
    );
  }

  const s = laptopSize(cfg);
  const dh = s.h + 34;
  return (
    <div
      style={{
        position: "absolute",
        left: DEVICE_CX.laptop - s.w / 2,
        top: H / 2 - dh / 2 + (1 - enter) * 600 + leave * 800,
        width: s.w,
        height: dh,
        scale: LAPTOP_SCALE,
        opacity: interpolate(enter, [0, 0.25], [0, 1], clamp) * (1 - leave),
      }}
    >
      <Laptop cfg={cfg} />
    </div>
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
  const p = spring({ frame, fps, delay: 6, config: { damping: 14, stiffness: 120 } });
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
    <AbsoluteFill style={{ fontFamily: FONT, fontVariantNumeric: "lining-nums", fontFeatureSettings: '"lnum" 1' }}>
      <Background color={cfg.service.color} />

      <DeviceLayer cfg={cfg} />

      <Tracker cfg={cfg} />
      {cfg.steps.map((st, i) => {
        const len = sec(stepEnd(cfg, i)) - sec(st.start);
        return (
          <Sequence key={i} from={sec(st.start)} durationInFrames={len} premountFor={fps}>
            <StepPanel cfg={cfg} step={st} len={len} />
          </Sequence>
        );
      })}

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
