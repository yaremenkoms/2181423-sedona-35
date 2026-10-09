import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig } from "./types";
import { ScreenStack } from "./ScreenStack";
import { EASE_IN_OUT, clamp } from "./theme";

/* ───────── Телефон ───────── */

// Телефон крупный, как в эталоне: выше кадра, камера проезжает к нужной части экрана
export const PHONE_SCREEN_H = 1120;

export const phoneSize = (cfg: MeshVideoConfig) => {
  const scale = PHONE_SCREEN_H / cfg.screenSize.h;
  const sw = cfg.screenSize.w * scale;
  const bezel = 18;
  return { scale, sw, sh: PHONE_SCREEN_H, w: sw + bezel * 2, h: PHONE_SCREEN_H + bezel * 2, bezel };
};

export const Phone: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const s = phoneSize(cfg);
  return (
    <div
      style={{
        position: "relative",
        width: s.w,
        height: s.h,
        borderRadius: 84,
        background: "linear-gradient(150deg, #3A3D48 0%, #15161C 40%, #2A2C34 100%)",
        boxShadow: "0 60px 120px rgba(20,20,60,0.35), inset 0 0 0 2px rgba(255,255,255,0.18), inset 0 0 0 6px #0C0D12",
      }}
    >
      <div style={{ position: "absolute", left: s.bezel, top: s.bezel, borderRadius: 66, overflow: "hidden" }}>
        <ScreenStack cfg={cfg} scale={s.scale} />
      </div>
      <div style={{ position: "absolute", left: s.w / 2 - 80, top: s.bezel + 16, width: 160, height: 44, borderRadius: 22, background: "#05060A" }} />
    </div>
  );
};

/* ───────── Ноутбук ───────── */

export const LAPTOP_SCREEN_W = 1280;
const CHROME_H = 46;

export const laptopSize = (cfg: MeshVideoConfig) => {
  const scale = LAPTOP_SCREEN_W / cfg.screenSize.w;
  const sh = cfg.screenSize.h * scale;
  const bezel = 22;
  return { scale, sw: LAPTOP_SCREEN_W, sh, bezel, w: LAPTOP_SCREEN_W + bezel * 2, h: sh + CHROME_H + bezel * 2 };
};

// Курсор едет к каждой подсветке и «кликает» в момент её появления
const Cursor: React.FC<{ cfg: MeshVideoConfig; scale: number }> = ({ cfg, scale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const marks = cfg.scenes.flatMap((s) => (s.marks ?? []).filter((m) => m.tap !== false));
  if (marks.length === 0) return null;

  const center = (i: number) => {
    const r = marks[i].rect;
    return { x: (r.x + r.w * 0.6) * scale, y: (r.y + r.h * 0.6) * scale };
  };
  const rest = { x: cfg.screenSize.w * scale * 0.55, y: cfg.screenSize.h * scale * 0.7 };

  let pos = rest;
  let click = -1;
  for (let i = 0; i < marks.length; i++) {
    const from = i === 0 ? rest : center(i - 1);
    const to = center(i);
    const arrive = marks[i].at;
    if (t < arrive - 0.75) {
      pos = from;
      break;
    }
    const p = interpolate(t, [arrive - 0.75, arrive], [0, 1], { ...clamp, easing: EASE_IN_OUT });
    pos = { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
    if (t >= arrive && t < arrive + 0.5) click = (t - arrive) / 0.5;
  }

  return (
    <>
      {click >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: pos.x - 30,
            top: pos.y - 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `3px solid ${cfg.service.color}`,
            opacity: 1 - click,
            scale: 0.4 + click * 0.8,
          }}
        />
      ) : null}
      <svg
        width={34}
        height={44}
        viewBox="0 0 17 22"
        style={{ position: "absolute", left: pos.x - 3, top: pos.y - 2, scale: click >= 0 && click < 0.3 ? 0.88 : 1, transformOrigin: "0 0" }}
      >
        <path d="M1 1 L1 17 L5 13.2 L8 20 L10.6 18.9 L7.7 12.3 L13 12.3 Z" fill="#111" stroke="white" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const Laptop: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const s = laptopSize(cfg);
  return (
    <div style={{ position: "relative", width: s.w, height: s.h + 34 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          bottom: 34,
          borderRadius: 36,
          background: "#1F2B4D",
          boxShadow: "0 50px 100px rgba(20,20,60,0.3)",
        }}
      >
        <div style={{ position: "absolute", left: s.bezel, top: s.bezel, width: s.sw, borderRadius: 16, overflow: "hidden", background: "#F3F4F7" }}>
          {/* Строка браузера */}
          <div style={{ height: CHROME_H, display: "flex", alignItems: "center", padding: "0 18px", gap: 8, background: "#F3F4F7" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
            ))}
            <div
              style={{
                margin: "0 auto",
                width: 560,
                height: 28,
                borderRadius: 8,
                background: "#E6E8EE",
                color: "#3C3F48",
                fontSize: 15,
                fontFamily: "Roboto, Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cfg.url ?? "school.mos.ru"}
            </div>
            <div style={{ width: 55 }} />
          </div>
          <div style={{ position: "relative" }}>
            <ScreenStack cfg={cfg} scale={s.scale} />
            <Cursor cfg={cfg} scale={s.scale} />
          </div>
        </div>
      </div>
      {/* Основание */}
      <div
        style={{
          position: "absolute",
          left: -70,
          right: -70,
          bottom: 0,
          height: 46,
          borderRadius: "0 0 40px 40px",
          background: "linear-gradient(#E3E6EE, #C9CDD8)",
          boxShadow: "0 30px 60px rgba(20,20,60,0.25)",
        }}
      />
    </div>
  );
};
