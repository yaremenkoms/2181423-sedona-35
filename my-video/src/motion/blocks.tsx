import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { Accent, CharsIn, F, P, Pop, clamp, useCount, useScene, useSpr, useT } from "./core";

/* ───────── Текст ───────── */

export const Kicker: React.FC<{ at: number; text: string; color?: Accent }> = ({ at, text, color = "lime" }) => (
  <Pop at={at}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        fontFamily: F.mono,
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 3,
        color: P[color],
        border: `2px solid ${P[color]}55`,
        borderRadius: 999,
        padding: "10px 24px",
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: P[color] }} />
      {text}
    </div>
  </Pop>
);

export type Line = { text: string; at: number; color?: Accent | "ink"; serif?: boolean; size?: number };

// Заголовок из строк: каждая строка появляется в момент своего слова
export const Title: React.FC<{ lines: Line[]; align?: "left" | "center"; size?: number }> = ({ lines, align = "left", size = 150 }) => {
  const { light } = useScene();
  return (
    <div style={{ textAlign: align, lineHeight: 1.0 }}>
      {lines.map((l, i) => {
        const color = l.color && l.color !== "ink" ? P[l.color] : light ? P.lightInk : P.ink;
        return (
          <div key={i} style={{ marginTop: i ? 8 : 0 }}>
            <CharsIn
              text={l.text}
              at={l.at}
              color={color}
              style={{
                fontFamily: l.serif ? F.serif : F.head,
                fontStyle: l.serif ? "italic" : "normal",
                fontWeight: l.serif ? 500 : 900,
                fontSize: l.size ?? (l.serif ? size * 0.85 : size),
                letterSpacing: l.serif ? 0 : -size * 0.035,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export const Mono: React.FC<{ at: number; text: string; color?: Accent | "dim"; size?: number }> = ({ at, text, color = "dim", size = 34 }) => (
  <Pop at={at}>
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: size, letterSpacing: 3, color: color === "dim" ? P.dim : P[color] }}>{text}</div>
  </Pop>
);

/* ───────── Числа ───────── */

export const Counter: React.FC<{ at: number; to: number; prefix?: string; unit?: string; color?: Accent; size?: number; dur?: number }> = ({
  at,
  to,
  prefix = "",
  unit,
  color = "lime",
  size = 420,
  dur = 0.8,
}) => {
  const n = useCount(0, to, at, dur);
  const p = useSpr(at, { damping: 10, stiffness: 140 });
  const { light } = useScene();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 24, opacity: interpolate(p, [0, 0.3], [0, 1], clamp), scale: interpolate(p, [0, 1], [0.6, 1]) }}>
      <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 0.9, color: P[color], letterSpacing: -size * 0.05, textShadow: `0 0 80px ${P[color]}66` }}>
        {prefix}
        {n}
      </div>
      {unit ? <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: size * 0.28, color: light ? P.lightInk : P.ink }}>{unit}</div> : null}
    </div>
  );
};

/* ───────── Телефон и интерфейс (рисуются кодом) ───────── */

export const Phone: React.FC<{ at: number; children: React.ReactNode; accent?: string; title?: string; scale?: number }> = ({
  at,
  children,
  accent = "#8B5CF6",
  title = "Дневник",
  scale = 1,
}) => {
  const p = useSpr(at, { damping: 16, stiffness: 120 });
  return (
    <div
      style={{
        width: 640,
        height: 1240,
        borderRadius: 96,
        padding: 18,
        background: "linear-gradient(160deg,#2B2F3C,#0C0D12)",
        boxShadow: `0 0 0 2px rgba(255,255,255,0.12), 0 60px 140px rgba(0,0,0,0.6), 0 0 120px ${accent}33`,
        scale: scale * interpolate(p, [0, 1], [0.85, 1]),
        translate: `0 ${(1 - p) * 300}px`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 80, overflow: "hidden", background: "#F4F4F8", position: "relative" }}>
        <div style={{ background: accent, height: 230, padding: "86px 44px 0", color: "white", boxSizing: "border-box" }}>
          <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 52 }}>{title}</div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: 22, width: 190, height: 50, marginLeft: -95, borderRadius: 25, background: "#05060A" }} />
        <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export const AppCard: React.FC<{ at: number; meta: string; title: string; active?: number; color?: string }> = ({ at, meta, title, active, color = "#8B5CF6" }) => {
  const t = useT();
  const on = active !== undefined && t >= active;
  const p = useSpr(active ?? 1e9, { damping: 12, stiffness: 200 });
  return (
    <Pop at={at}>
      <div
        style={{
          background: "white",
          borderRadius: 32,
          padding: "28px 32px",
          boxShadow: on ? `0 0 0 6px ${color}, 0 20px 50px ${color}55` : "0 8px 24px rgba(20,20,40,0.08)",
          scale: on ? 1 + Math.sin(Math.min(1, p) * Math.PI) * 0.05 : 1,
          display: "flex",
          gap: 22,
          alignItems: "center",
        }}
      >
        <div style={{ width: 8, alignSelf: "stretch", borderRadius: 4, background: color }} />
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: "#8A8FA3" }}>{meta}</div>
          <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 44, color: "#15161F", marginTop: 4 }}>{title}</div>
        </div>
      </div>
    </Pop>
  );
};

// Кнопка интерфейса с нажатием в момент tapAt (пружинное «вдавливание» + кольцо)
export const AppButton: React.FC<{ at: number; label: string; tapAt?: number; color?: string; size?: number; ghost?: boolean }> = ({
  at,
  label,
  tapAt,
  color = P.lime,
  size = 56,
  ghost,
}) => {
  const t = useT();
  const press = tapAt !== undefined ? interpolate(t, [tapAt, tapAt + 0.08, tapAt + 0.3], [0, 1, 0], clamp) : 0;
  const ring = tapAt !== undefined ? interpolate(t, [tapAt, tapAt + 0.6], [0, 1], clamp) : 0;
  const dark = color === P.lime || color === P.gold || color === P.cy;
  return (
    <Pop at={at} from="scale">
      <div style={{ position: "relative", display: "inline-block" }}>
        {ring > 0 && ring < 1 ? (
          <div style={{ position: "absolute", inset: -10, borderRadius: 999, border: `4px solid ${color}`, opacity: 1 - ring, scale: 1 + ring * 0.25 }} />
        ) : null}
        <div
          style={{
            fontFamily: F.head,
            fontWeight: 800,
            fontSize: size,
            padding: `${size * 0.42}px ${size * 0.9}px`,
            borderRadius: 999,
            background: ghost ? "transparent" : color,
            border: ghost ? `4px solid ${color}` : "none",
            color: ghost ? color : dark ? P.bg : "white",
            scale: 1 - press * 0.07,
            boxShadow: ghost ? "none" : `0 20px 60px ${color}55`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </Pop>
  );
};

export const Chips: React.FC<{ at: number; items: string[]; pick?: { at: number; index: number }; color?: Accent }> = ({ at, items, pick, color = "vio" }) => {
  const t = useT();
  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
      {items.map((it, i) => {
        const on = pick && t >= pick.at && pick.index === i;
        return (
          <Pop key={it} at={at + i * 0.08} from="scale">
            <div
              style={{
                fontFamily: F.head,
                fontWeight: 800,
                fontSize: 50,
                padding: "22px 38px",
                borderRadius: 26,
                background: on ? P[color] : "rgba(255,255,255,0.08)",
                color: on ? P.bg : P.ink,
                border: `3px solid ${on ? P[color] : "rgba(255,255,255,0.18)"}`,
                scale: on ? 1.08 : 1,
              }}
            >
              {it}
            </div>
          </Pop>
        );
      })}
    </div>
  );
};

/* ───────── Работа на бумаге, страницы, фото ───────── */

export const Paper: React.FC<{ seed?: number; w?: number; tint?: string }> = ({ seed = 0, w = 420, tint = "#FFFFFF" }) => (
  <div style={{ width: w, height: w * 1.35, background: tint, borderRadius: 18, padding: w * 0.08, boxSizing: "border-box", boxShadow: "0 30px 70px rgba(0,0,0,0.45)" }}>
    <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: w * 0.075, color: "#2B3A8C", marginBottom: w * 0.04 }}>Задание {seed + 1}</div>
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: w * 0.022,
          width: `${55 + ((i * 37 + seed * 13) % 40)}%`,
          background: "#3B4AA0",
          opacity: 0.55,
          borderRadius: 4,
          marginBottom: w * 0.055,
        }}
      />
    ))}
  </div>
);

export const PageStack: React.FC<{ times: number[] }> = ({ times }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: 520, height: 640 }}>
      {times.map((at, i) => {
        const shown = t >= at;
        return (
          <Pop key={i} at={at} from="right" style={{ position: "absolute", left: i * 46, top: i * 30, rotate: `${(i - 1) * 4}deg`, opacity: shown ? 1 : 0 }}>
            <Paper seed={i} w={430} />
          </Pop>
        );
      })}
    </div>
  );
};

// Видоискатель камеры со снимком (вспышка в shotAt)
export const Camera: React.FC<{ at: number; shotAt: number }> = ({ at, shotAt }) => {
  const t = useT();
  const flash = interpolate(t, [shotAt, shotAt + 0.05, shotAt + 0.45], [0, 1, 0], clamp);
  const corners = [
    { left: 0, top: 0, borderLeft: 1, borderTop: 1 },
    { right: 0, top: 0, borderRight: 1, borderTop: 1 },
    { left: 0, bottom: 0, borderLeft: 1, borderBottom: 1 },
    { right: 0, bottom: 0, borderRight: 1, borderBottom: 1 },
  ];
  const lock = useSpr(shotAt - 0.5, { damping: 12, stiffness: 160 });
  return (
    <Pop at={at} from="scale">
      <div style={{ position: "relative", width: 700, height: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ rotate: "-4deg" }}>
          <Paper w={480} />
        </div>
        <div style={{ position: "absolute", inset: interpolate(lock, [0, 1], [0, 70]) }}>
          {corners.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                ...("left" in c ? { left: 0 } : { right: 0 }),
                ...("top" in c ? { top: 0 } : { bottom: 0 }),
                borderColor: P.lime,
                borderStyle: "solid",
                borderWidth: `${"borderTop" in c ? 8 : 0}px ${"borderRight" in c ? 8 : 0}px ${"borderBottom" in c ? 8 : 0}px ${"borderLeft" in c ? 8 : 0}px`,
                borderRadius: 14,
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", inset: -40, background: "white", opacity: flash, borderRadius: 40 }} />
      </div>
    </Pop>
  );
};

// Сетка фото: n миниатюр появляются по очереди за dur секунд
export const PhotoGrid: React.FC<{ at: number; n: number; dur?: number; color?: Accent }> = ({ at, n, dur = 1.2, color = "lime" }) => {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 150px)", gap: 22 }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = at + (i / n) * dur;
        const on = t >= a;
        return (
          <Pop key={i} at={a} from="scale">
            <div
              style={{
                width: 150,
                height: 190,
                borderRadius: 20,
                background: on ? "#FFFFFF" : "transparent",
                border: `3px solid ${P[color]}`,
                padding: 16,
                boxSizing: "border-box",
              }}
            >
              {[70, 50, 62, 40].map((w, k) => (
                <div key={k} style={{ height: 8, width: `${w}%`, background: "#3B4AA0", opacity: 0.5, borderRadius: 4, marginBottom: 18 }} />
              ))}
            </div>
          </Pop>
        );
      })}
    </div>
  );
};

/* ───────── Эмоции ───────── */

export const BigCheck: React.FC<{ at: number; color?: Accent; size?: number }> = ({ at, color = "lime", size = 380 }) => {
  const p = useSpr(at, { damping: 9, stiffness: 160 });
  const t = useT();
  const draw = interpolate(t, [at + 0.1, at + 0.45], [0, 1], clamp);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: P[color],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: p,
        boxShadow: `0 0 0 30px ${P[color]}22, 0 0 160px ${P[color]}88`,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={P.bg} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={24} strokeDashoffset={24 * (1 - draw)} />
      </svg>
    </div>
  );
};

export const Confetti: React.FC<{ at: number; n?: number }> = ({ at, n = 46 }) => {
  const t = useT();
  const { width } = useVideoConfig();
  const k = t - at;
  if (k < 0 || k > 2.2) return null;
  const cols = [P.lime, P.cy, P.vio, P.pink, P.gold];
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.3;
        const v = 900 + ((i * 97) % 600);
        const x = width / 2 + Math.cos(a) * v * k;
        const y = 760 + Math.sin(a) * v * k * 0.8 + 900 * k * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 22,
              height: i % 2 ? 22 : 44,
              borderRadius: i % 3 ? 6 : 11,
              background: cols[i % cols.length],
              rotate: `${k * 600 + i * 40}deg`,
              opacity: interpolate(k, [1.4, 2.2], [1, 0], clamp),
            }}
          />
        );
      })}
    </>
  );
};

/* ───────── Раскладка ───────── */

// Контентная зона: между шапкой (230) и субтитрами (1545)
export const Zone: React.FC<{ children: React.ReactNode; justify?: "center" | "flex-start"; align?: "center" | "flex-start"; pad?: number; gap?: number }> = ({
  children,
  justify = "center",
  align = "center",
  pad = 90,
  gap = 40,
}) => (
  <div
    style={{
      position: "absolute",
      left: pad,
      right: pad,
      top: 270,
      height: 1240,
      display: "flex",
      flexDirection: "column",
      justifyContent: justify,
      alignItems: align,
      gap,
    }}
  >
    {children}
  </div>
);
