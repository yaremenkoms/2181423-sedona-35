import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Accent, EASE, EASE_IO, F, P, SceneProvider, Words, clamp } from "./core";

export type Trans = "cut" | "up" | "left" | "zoom" | "zoomIn" | "fade";
export type SfxName = "whoosh" | "hit" | "pop" | "tick" | "riser" | "click" | "stop";

export type SceneDef = {
  id: string;
  from: number; // секунды озвучки
  to: number;
  in?: Trans;
  out?: Trans;
  glow?: Accent; // цвет свечения и акцент субтитров
  light?: boolean; // светлая сцена-контраст
  nocap?: boolean; // скрыть субтитры
  flash?: boolean; // белая вспышка на входе
  el: React.ReactNode;
};

export type MotionConfig = {
  id: string;
  width: number;
  height: number;
  voice: string; // путь в public/
  words: Words;
  endPad: number; // хвост после озвучки, с
  music?: { file: string; gain?: number };
  chapters?: { at: number; title: string }[];
  scenes: SceneDef[];
  sfx?: { at: number; s: SfxName; gain?: number }[];
  shake?: number[]; // моменты встряски кадра
};

export const motionDuration = (cfg: MotionConfig) => cfg.words.duration + cfg.endPad;

const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const activeScene = (cfg: MotionConfig, t: number) => cfg.scenes.find((s) => t >= s.from && t < s.to);

/* ───────── Фон ───────── */

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: P.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.11) 2px, transparent 2px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 80%)",
      }}
    />
  </AbsoluteFill>
);

const Glow: React.FC<{ color: string; light?: boolean }> = ({ color, light }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {light ? <AbsoluteFill style={{ background: P.light }} /> : null}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          width: 1500,
          height: 1500,
          marginLeft: -750,
          marginTop: -750,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}${light ? "30" : "55"} 0%, ${color}00 62%)`,
          scale: 1 + Math.sin(frame / 50) * 0.04,
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────── Переходы ───────── */

const SceneShell: React.FC<{ def: SceneDef; len: number; children: React.ReactNode }> = ({ def, len, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const IN = 9;
  const OUT = 7;
  const pin = interpolate(frame, [0, IN], [0, 1], { ...clamp, easing: EASE });
  const pout = interpolate(frame, [len - OUT, len], [0, 1], { ...clamp, easing: EASE_IO });

  const style: React.CSSProperties = {};
  const tin = def.in ?? "fade";
  const tout = def.out ?? "fade";
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let op = 1;
  let blur = 0;
  if (tin === "up") ty += (1 - pin) * height * 0.35;
  if (tin === "left") tx += (1 - pin) * width;
  if (tin === "zoom") {
    sc *= interpolate(pin, [0, 1], [1.35, 1]);
    blur += (1 - pin) * 18;
  }
  if (tin === "zoomIn") sc *= interpolate(pin, [0, 1], [0.6, 1]);
  if (tin !== "cut" && tin !== "left") op *= pin;
  if (tout === "up") ty -= pout * height * 0.3;
  if (tout === "left") tx -= pout * width;
  if (tout === "zoom") sc *= interpolate(pout, [0, 1], [1, 0.75]);
  if (tout === "zoomIn") {
    sc *= interpolate(pout, [0, 1], [1, 1.6]);
    blur += pout * 16;
  }
  if (tout !== "cut" && tout !== "left") op *= 1 - pout;
  style.translate = `${tx}px ${ty}px`;
  style.scale = sc;
  style.opacity = op;
  if (blur > 0.2) style.filter = `blur(${blur}px)`;

  const flash = def.flash ? interpolate(frame, [0, 6], [0.85, 0], clamp) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: op }}>
        <Glow color={P[def.glow ?? "vio"]} light={def.light} />
      </AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

/* ───────── Главы и прогресс (шапка 170–230) ───────── */

const Chapters: React.FC<{ cfg: MotionConfig }> = ({ cfg }) => {
  const t = useTime();
  const { width } = useVideoConfig();
  const ch = cfg.chapters ?? [];
  if (!ch.length || t < ch[0].at - 0.3) return null;
  const cur = [...ch].reverse().find((c) => t >= c.at) ?? ch[0];
  const idx = ch.indexOf(cur);
  const sc = activeScene(cfg, t);
  const ink = sc?.light ? P.lightInk : P.ink;
  const appear = interpolate(t, [ch[0].at - 0.3, ch[0].at + 0.2], [0, 1], clamp);
  const end = cfg.words.duration;
  const hide = interpolate(t, [end - 0.2, end + 0.3], [1, 0], clamp);
  const sw = interpolate(t, [cur.at, cur.at + 0.35], [0, 1], { ...clamp, easing: EASE });
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 170, height: 60, opacity: appear * hide, color: ink }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
        <div style={{ overflow: "hidden", height: 40 }}>
          <div style={{ translate: `0 ${(1 - sw) * 40}px` }}>
            {String(idx + 1).padStart(2, "0")} · {cur.title.toUpperCase()}
          </div>
        </div>
        <div style={{ opacity: 0.55 }}>
          {String(idx + 1).padStart(2, "0")}/{String(ch.length).padStart(2, "0")}
        </div>
      </div>
      <div style={{ marginTop: 14, height: 5, borderRadius: 3, background: sc?.light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.14)", width: width - 160 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 3,
            width: `${Math.min(1, t / end) * 100}%`,
            background: P[sc?.glow ?? "lime"],
          }}
        />
      </div>
    </div>
  );
};

/* ───────── Субтитры (зона 1545–1700) — ровно текст пользователя ───────── */

type Group = { start: number; words: Words["words"] };
const groupWords = (words: Words["words"]): Group[] => {
  const out: Group[] = [];
  let cur: Words["words"] = [];
  let len = 0;
  words.forEach((w, i) => {
    cur.push(w);
    len += w.text.length + 1;
    const next = words[i + 1];
    const endPunct = /[.!?…:]["»]?$/.test(w.text);
    const pause = next ? next.start - w.end > 0.35 : true;
    if (endPunct || len > 22 || pause || !next || (/,["»]?$/.test(w.text) && len > 12)) {
      out.push({ start: cur[0].start, words: cur });
      cur = [];
      len = 0;
    }
  });
  return out;
};

const Captions: React.FC<{ cfg: MotionConfig }> = ({ cfg }) => {
  const t = useTime();
  const groups = React.useMemo(() => groupWords(cfg.words.words), [cfg.words.words]);
  const sc = activeScene(cfg, t);
  if (sc?.nocap) return null;
  const gi = groups.findIndex((g, i) => t >= g.start - 0.05 && t < (groups[i + 1]?.start ?? g.words[g.words.length - 1].end + 0.6) - 0.05);
  if (gi < 0) return null;
  const g = groups[gi];
  const lastEnd = g.words[g.words.length - 1].end;
  if (t > lastEnd + 0.6 && !groups[gi + 1]) return null;
  const accent = P[sc?.glow ?? "lime"];
  const light = sc?.light;
  const appear = interpolate(t, [g.start - 0.05, g.start + 0.12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1545,
        height: 155,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 18px",
        textAlign: "center",
        fontFamily: F.head,
        fontWeight: 800,
        fontSize: 62,
        lineHeight: 1.12,
        opacity: appear,
        translate: `0 ${(1 - appear) * 16}px`,
      }}
    >
      {g.words.map((w, i) => {
        const now = t >= w.start && (i === g.words.length - 1 || t < g.words[i + 1].start);
        const said = t >= w.start;
        return (
          <span
            key={i}
            style={{
              color: now ? (light ? P.lightInk : P.bg) : said ? (light ? P.lightInk : P.ink) : light ? "rgba(11,12,16,0.35)" : "rgba(244,245,247,0.35)",
              background: now ? accent : "transparent",
              borderRadius: 12,
              padding: "0 10px",
              margin: "0 -10px",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/* ───────── Сборка ───────── */

export const MotionVideo: React.FC<{ cfg: MotionConfig }> = ({ cfg }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  const sec = (s: number) => Math.round(s * fps);

  const shakeAt = (cfg.shake ?? []).find((s) => t >= s && t < s + 0.3);
  const k = shakeAt !== undefined ? 1 - (t - shakeAt) / 0.3 : 0;
  const shake = k > 0 ? `${Math.sin(frame * 2.3) * 14 * k}px ${Math.cos(frame * 3.1) * 10 * k}px` : "0px 0px";

  const autoWhoosh = cfg.scenes.slice(1).map((s) => ({ at: s.from - 0.12, s: "whoosh" as SfxName, gain: 0.28 }));
  const sfx = [...autoWhoosh, ...(cfg.sfx ?? [])];

  return (
    <AbsoluteFill style={{ fontFamily: F.head, color: P.ink }}>
      <Backdrop />
      <AbsoluteFill style={{ translate: shake }}>
        {cfg.scenes.map((s) => {
          const len = sec(s.to) - sec(s.from);
          return (
            <Sequence key={s.id} name={s.id} from={sec(s.from)} durationInFrames={len} premountFor={fps}>
              <SceneProvider value={{ start: s.from, light: !!s.light }}>
                <SceneShell def={s} len={len}>
                  {s.el}
                </SceneShell>
              </SceneProvider>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Chapters cfg={cfg} />
      <Captions cfg={cfg} />

      <Audio src={staticFile(cfg.voice)} />
      {cfg.music ? <Audio src={staticFile(cfg.music.file)} volume={cfg.music.gain ?? 0.3} /> : null}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, sec(s.at))} premountFor={fps}>
          <Audio src={staticFile(`motion/sfx/${s.s}.wav`)} volume={s.gain ?? 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
