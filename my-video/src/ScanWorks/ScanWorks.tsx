import React from "react";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BEZEL,
  C,
  CALLOUT,
  EASE_IN_OUT,
  EASE_OUT,
  FONT,
  K,
  PHONE,
  SCREEN_H,
  SCREEN_W,
  clamp,
} from "./theme";
import {
  DURATION,
  Focus,
  INTRO_END,
  OUTRO_START,
  SCREEN_VIDEO_FROM,
  SRC_SCREEN,
  STAGES,
  STEPS,
  Step,
  stepNumberInStage,
} from "./data";
import { AppLogo, ArrowDownIcon, CheckIcon, OPTION_ICONS } from "./Icons";

const SRC = staticFile("source.mp4");

// Секунды → кадры (fps берётся из композиции)
const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

/* ─────────────────────────── Фон ─────────────────────────── */

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const blob = (x: number, y: number, r: number, color: string, phase: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame / 70 + phase) * 60,
        top: y + Math.cos(frame / 90 + phase) * 40,
        width: r,
        height: r,
        borderRadius: "50%",
        background: color,
        filter: "blur(90px)",
        opacity: 0.55,
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.bgFrom} 0%, #4664F0 45%, ${C.bgTo} 100%)`,
        overflow: "hidden",
      }}
    >
      {blob(-200, -250, 800, "#8FA8FF", 0)}
      {blob(1250, 500, 900, "#3A2FD0", 2)}
      {blob(700, 650, 600, "#9EC5FF", 4)}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ─────────────────── Верхняя панель с этапами ─────────────────── */

const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const t = frame / useVideoConfig().fps;

  const appear = interpolate(frame, [sec(INTRO_END - 0.3), sec(INTRO_END + 0.4)], [0, 1], { ...clamp, easing: EASE_OUT });
  const hide = interpolate(frame, [sec(OUTRO_START - 0.2), sec(OUTRO_START + 0.3)], [1, 0], clamp);
  const o = appear * hide;

  const stageRange = (i: number) => {
    const s = STEPS.filter((st) => st.stage === i);
    return [s[0].start, s[s.length - 1].end];
  };

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 140, opacity: o, translate: `0 ${(1 - appear) * -30}px` }}>
      {/* Бренд */}
      <div style={{ position: "absolute", left: 100, top: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <AppLogo size={52} />
        <div style={{ color: C.white, fontSize: 28, fontWeight: 800 }}>Мобильный журнал</div>
        <div
          style={{
            marginLeft: 6,
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            color: C.white,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Учитель · Скан работ
        </div>
      </div>

      {/* Трекер этапов */}
      <div style={{ position: "absolute", right: 100, top: 50, display: "flex", gap: 14 }}>
        {STAGES.map((name, i) => {
          const [a, b] = stageRange(i);
          const p = interpolate(t, [a, b], [0, 1], clamp);
          const active = t >= a && t < b;
          const done = t >= b;
          return (
            <div key={name} style={{ width: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    fontWeight: 800,
                    background: done ? C.success : active ? C.accent : "rgba(255,255,255,0.22)",
                    color: done || active ? C.ink : C.white,
                  }}
                >
                  {done ? <CheckIcon size={18} color={C.ink} stroke={3.4} /> : i + 1}
                </div>
                <div style={{ color: C.white, opacity: active || done ? 1 : 0.6, fontSize: 22, fontWeight: active ? 800 : 700 }}>{name}</div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
                <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 3, background: done ? C.success : C.accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────── Телефон ─────────────────────────── */

// Кадр исходного видео, обрезанный до области rect экрана и увеличенный в z раз
const ScreenCrop: React.FC<{ fromSec: number; rect: { x: number; y: number }; z: number }> = ({ fromSec, rect, z }) => {
  const sec = useSec();
  const { fps } = useVideoConfig();
  return (
    <Video
      src={SRC}
      muted
      trimBefore={sec(fromSec)}
      premountFor={fps}
      style={{
        position: "absolute",
        width: 1920 * z,
        height: 1080 * z,
        left: -(SRC_SCREEN.x + rect.x) * z,
        top: -(SRC_SCREEN.y + rect.y) * z,
        maxWidth: "none",
      }}
    />
  );
};

const FocusHighlight: React.FC<{ focus: Focus }> = ({ focus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = Math.round((focus.end - focus.start) * fps);
  const inP = spring({ frame, fps, config: { damping: 16, stiffness: 160 } });
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const r = focus.rect;
  const pulse = (frame % 36) / 36;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: r.x * K,
          top: r.y * K,
          width: r.w * K,
          height: r.h * K,
          borderRadius: 14,
          boxShadow: `0 0 0 3000px rgba(10,18,70,${0.42 * inP * out})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: r.x * K - 4,
          top: r.y * K - 4,
          width: r.w * K + 8,
          height: r.h * K + 8,
          borderRadius: 16,
          border: `4px solid ${C.accent}`,
          boxShadow: `0 0 24px rgba(255,201,60,0.7)`,
          opacity: inP * out,
          scale: interpolate(inP, [0, 1], [1.12, 1]),
        }}
      />
      {/* Расходящийся импульс — «нажмите здесь» */}
      <div
        style={{
          position: "absolute",
          left: r.x * K - 4,
          top: r.y * K - 4,
          width: r.w * K + 8,
          height: r.h * K + 8,
          borderRadius: 18,
          border: `3px solid ${C.accent}`,
          opacity: (1 - pulse) * 0.7 * out * inP,
          scale: 1 + pulse * 0.08,
        }}
      />
    </>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const { fps } = useVideoConfig();

  // Поза в заставке → рабочая поза
  const move = interpolate(frame, [sec(INTRO_END - 0.55), sec(INTRO_END + 0.35)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const enter = spring({ frame, fps, delay: sec(0.9), config: { damping: 18, stiffness: 90 } });
  const leave = interpolate(frame, [sec(OUTRO_START - 0.3), sec(OUTRO_START + 0.4)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const float = Math.sin(frame / 30) * 8 * (1 - move);

  const left = interpolate(move, [0, 1], [1180, PHONE.left]);
  const top = interpolate(move, [0, 1], [150, PHONE.top]) + (1 - enter) * 700 + leave * 1150 + float;
  const rotate = interpolate(move, [0, 1], [7, 0]);

  const activeFocuses = STEPS.flatMap((s) => s.focuses);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PHONE.w,
        height: PHONE.h,
        rotate: `${rotate}deg`,
        borderRadius: 62,
        background: "linear-gradient(160deg, #2A2F45, #0B0D18)",
        boxShadow: "0 50px 100px rgba(10,15,70,0.45), 0 0 0 2px rgba(255,255,255,0.12) inset",
        opacity: enter,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: BEZEL,
          top: BEZEL,
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 48,
          overflow: "hidden",
          background: "white",
        }}
      >
        <Img src={staticFile("screen_start.png")} style={{ width: SCREEN_W, height: SCREEN_H }} />
        <Sequence from={sec(SCREEN_VIDEO_FROM)} durationInFrames={sec(OUTRO_START + 1) - sec(SCREEN_VIDEO_FROM)} premountFor={fps}>
          <ScreenCrop fromSec={SCREEN_VIDEO_FROM} rect={{ x: 0, y: 0 }} z={K} />
        </Sequence>
        {activeFocuses.map((f) => (
          <Sequence key={`${f.start}`} from={sec(f.start)} durationInFrames={sec(f.end) - sec(f.start)} premountFor={fps}>
            <FocusHighlight focus={f} />
          </Sequence>
        ))}
      </div>
      {/* Динамический остров */}
      <div style={{ position: "absolute", left: PHONE.w / 2 - 55, top: BEZEL + 12, width: 110, height: 30, borderRadius: 15, background: "#05060B" }} />
    </div>
  );
};

/* ─────────────────── Увеличенный фрагмент экрана ─────────────────── */

const Callout: React.FC<{ focus: Focus }> = ({ focus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = Math.round((focus.end - focus.start) * fps);
  const r = focus.rect;
  const z = Math.min(CALLOUT.width / r.w, 300 / r.h, 3);
  const w = r.w * z;
  const h = r.h * z;

  // Центр области на экране телефона в координатах кадра
  const phoneCy = PHONE.top + BEZEL + (r.y + r.h / 2) * K;
  const phoneRx = PHONE.left + BEZEL + (r.x + r.w) * K + 6;
  const cardH = h + 70;
  const cardTop = Math.max(200, Math.min(1000 - cardH, phoneCy - cardH / 2));
  const cardLeft = CALLOUT.left + (CALLOUT.width - w) / 2;
  const cardCy = cardTop + 70 + h / 2;

  const inP = spring({ frame, fps, delay: 3, config: { damping: 18, stiffness: 140 } });
  const line = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE_OUT });
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);

  const midX = (phoneRx + cardLeft) / 2;
  const path = `M ${phoneRx} ${phoneCy} C ${midX} ${phoneCy}, ${midX} ${cardCy}, ${cardLeft - 8} ${cardCy}`;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <path d={path} fill="none" stroke={C.accent} strokeWidth={3} strokeDasharray="1000" strokeDashoffset={1000 * (1 - line)} strokeLinecap="round" />
        <circle cx={phoneRx} cy={phoneCy} r={7 * line} fill={C.accent} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: w,
          opacity: inP,
          translate: `${(1 - inP) * 40}px 0`,
          scale: interpolate(inP, [0, 1], [0.92, 1]),
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 999,
            background: C.accent,
            color: C.ink,
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 16,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 20px rgba(10,15,70,0.25)",
          }}
        >
          {focus.label}
        </div>
        <div
          style={{
            position: "relative",
            width: w,
            height: h,
            borderRadius: 22,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 30px 60px rgba(10,15,70,0.35), 0 0 0 4px rgba(255,255,255,0.9)",
          }}
        >
          <ScreenCrop fromSec={focus.start} rect={r} z={z} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Текст шага ─────────────────────────── */

const RevealLines: React.FC<{ text: string; size: number; delay?: number; weight?: number; color?: string }> = ({
  text,
  size,
  delay = 0,
  weight = 800,
  color = C.white,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div>
      {text.split("\n").map((line, i) => {
        const p = spring({ frame, fps, delay: delay + i * 3, config: { damping: 20, stiffness: 150 } });
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: size * 0.08 }}>
            <div
              style={{
                fontSize: size,
                fontWeight: weight,
                lineHeight: 1.08,
                color,
                letterSpacing: -size * 0.02,
                translate: `0 ${(1 - p) * size * 1.1}px`,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const FadeUp: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay, config: { damping: 20, stiffness: 140 } });
  return <div style={{ ...style, opacity: p, translate: `0 ${(1 - p) * 24}px` }}>{children}</div>;
};

const StepText: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = useSec();
  const len = sec(step.end) - sec(step.start);
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const { n, total } = stepNumberInStage(index);
  const rel = (s: number) => sec(s) - sec(step.start);

  return (
    <div style={{ position: "absolute", left: 110, top: 0, height: 1080, width: 640, display: "flex", flexDirection: "column", justifyContent: "center", opacity: out }}>
      {step.done ? (
        <FadeUp delay={0}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: C.success,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 0 14px rgba(43,196,138,0.25)",
              scale: spring({ frame, fps, config: { damping: 9, stiffness: 180 } }),
            }}
          >
            <CheckIcon size={70} color="white" stroke={3.2} />
          </div>
        </FadeUp>
      ) : (
        <FadeUp delay={0} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div
            style={{
              height: 48,
              minWidth: 48,
              padding: "0 4px",
              borderRadius: 14,
              background: C.accent,
              color: C.ink,
              fontSize: 28,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            {n}
          </div>
          <div style={{ color: C.soft, fontSize: 24, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Шаг {n} из {total} · {STAGES[step.stage]}
          </div>
        </FadeUp>
      )}

      <RevealLines text={step.title} size={step.done ? 96 : 68} delay={2} />

      {step.hint ? (
        <FadeUp delay={10} style={{ marginTop: 22 }}>
          <div style={{ color: C.soft, fontSize: 32, fontWeight: 500, lineHeight: 1.35, whiteSpace: "pre-line" }}>{step.hint}</div>
        </FadeUp>
      ) : null}

      {step.lateHint ? (
        <Sequence from={rel(step.lateHint.at)} layout="none">
          <FadeUp delay={0} style={{ marginTop: 26 }}>
            <div
              style={{
                display: "inline-flex",
                padding: "14px 22px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.16)",
                border: "2px solid rgba(255,255,255,0.35)",
                color: C.white,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              {step.lateHint.text}
            </div>
          </FadeUp>
        </Sequence>
      ) : null}

      {step.options ? (
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
          {step.options.map((opt, i) => {
            const Icon = OPTION_ICONS[opt.icon];
            const t = frame / fps + step.start;
            const next = step.options![i + 1]?.at ?? step.end;
            const active = t >= opt.at && t < next;
            return (
              <FadeUp key={opt.text} delay={rel(opt.at) - 2}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 24px",
                    borderRadius: 18,
                    background: active ? C.accent : "rgba(255,255,255,0.14)",
                    color: active ? C.ink : C.white,
                    fontSize: 30,
                    fontWeight: 800,
                    scale: active ? 1.04 : 1,
                    transformOrigin: "left center",
                  }}
                >
                  <Icon size={32} color={active ? C.ink : C.white} />
                  {opt.text}
                </div>
              </FadeUp>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/* ─────────────────────── «Готово!» на телефоне ─────────────────────── */

const DoneBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 10, stiffness: 170 } });
  const out = interpolate(frame, [26, 33], [1, 0], clamp);
  const cx = PHONE.left + PHONE.w / 2;
  const cy = PHONE.top + PHONE.h / 2;
  const colors = [C.accent, C.success, "#FFFFFF", "#FF7A9A", "#8FD3FF"];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const d = interpolate(frame, [0, 24], [40, 260 + (i % 4) * 40], { ...clamp, easing: EASE_OUT });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(a) * d - 8,
              top: cy + Math.sin(a) * d - 8,
              width: 16,
              height: 16,
              borderRadius: i % 2 ? 4 : 8,
              background: colors[i % colors.length],
              rotate: `${frame * 12 + i * 30}deg`,
              opacity: interpolate(frame, [0, 4, 24], [0, 1, 0], clamp),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: cx - 90,
          top: cy - 90,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: C.success,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: p,
          boxShadow: "0 0 0 20px rgba(43,196,138,0.3), 0 30px 60px rgba(10,15,70,0.35)",
        }}
      >
        <CheckIcon size={110} color="white" stroke={3} />
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────── Отметка уходит в журнал ─────────────────── */

const GradeCard: React.FC<{ title: string; delay: number; gradeDelay: number }> = ({ title, delay, gradeDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay, config: { damping: 18, stiffness: 140 } });
  const g = spring({ frame, fps, delay: gradeDelay, config: { damping: 9, stiffness: 200 } });
  return (
    <div
      style={{
        width: 460,
        height: 120,
        borderRadius: 26,
        background: "white",
        boxShadow: "0 24px 50px rgba(10,15,70,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px 0 32px",
        boxSizing: "border-box",
        opacity: p,
        translate: `${(1 - p) * 40}px 0`,
      }}
    >
      <div style={{ color: C.ink, fontSize: 32, fontWeight: 800 }}>{title}</div>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: "linear-gradient(145deg, #5B7CFF, #2F4BD8)",
          color: "white",
          fontSize: 46,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: g,
        }}
      >
        5
      </div>
    </div>
  );
};

const JournalSync: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const out = interpolate(frame, [len - 8, len], [1, 0], clamp);
  const arrow = interpolate(frame, [sec(1.0), sec(1.6)], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <div style={{ position: "absolute", left: CALLOUT.left + 20, top: 330, opacity: out }}>
      <GradeCard title="Реестр фоторабот" delay={sec(0.15)} gradeDelay={sec(0.45)} />
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", width: 460 }}>
        <div style={{ opacity: arrow, translate: `0 ${(1 - arrow) * -30}px`, color: C.white }}>
          <ArrowDownIcon size={72} color={C.accent} stroke={2.8} />
        </div>
      </div>
      <GradeCard title="Электронный журнал" delay={sec(1.5)} gradeDelay={sec(2.0)} />
    </div>
  );
};

/* ─────────────────────────── Заставка ─────────────────────────── */

const IntroChip: React.FC<{ n: number; text: string; delay: number }> = ({ n, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay, config: { damping: 12, stiffness: 160 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 26px 14px 14px",
        borderRadius: 999,
        background: "white",
        color: C.ink,
        fontSize: 30,
        fontWeight: 800,
        opacity: p,
        scale: interpolate(p, [0, 1], [0.6, 1]),
        boxShadow: "0 16px 36px rgba(10,15,70,0.25)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {n}
      </div>
      {text}
    </div>
  );
};

const FloatingBadge: React.FC<{ x: number; y: number; delay: number; phase: number; children: React.ReactNode }> = ({ x, y, delay, phase, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay, config: { damping: 11, stiffness: 140 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + Math.sin(frame / 22 + phase) * 12,
        scale: p,
        rotate: `${Math.sin(frame / 40 + phase) * 4}deg`,
      }}
    >
      {children}
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const out = interpolate(frame, [sec(INTRO_END - 0.6), sec(INTRO_END)], [1, 0], clamp);
  const shift = interpolate(frame, [sec(INTRO_END - 0.6), sec(INTRO_END)], [0, -80], { ...clamp, easing: EASE_IN_OUT });

  return (
    <AbsoluteFill style={{ opacity: out, translate: `${shift}px 0` }}>
      <div style={{ position: "absolute", left: 130, top: 0, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FadeUp delay={sec(0.2)} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 34 }}>
          <AppLogo size={60} />
          <div style={{ color: C.white, fontSize: 30, fontWeight: 800 }}>Мобильный журнал</div>
          <div style={{ padding: "6px 16px", borderRadius: 999, background: "rgba(255,255,255,0.2)", color: C.white, fontSize: 22, fontWeight: 700 }}>
            для учителя
          </div>
        </FadeUp>
        <RevealLines text={"Скан работ"} size={150} delay={sec(0.45)} />
        <FadeUp delay={sec(1.2)} style={{ marginTop: 18 }}>
          <div style={{ color: C.soft, fontSize: 40, fontWeight: 500, lineHeight: 1.35 }}>
            Как загрузить работу ученика,
            <br />
            проверить её и выставить отметку
          </div>
        </FadeUp>
        <div style={{ display: "flex", gap: 16, marginTop: 54 }}>
          <IntroChip n={1} text="Загрузить" delay={sec(3.0)} />
          <IntroChip n={2} text="Проверить" delay={sec(6.9)} />
          <IntroChip n={3} text="Оценить" delay={sec(8.0)} />
        </div>
      </div>

      {/* Декор вокруг телефона */}
      <FloatingBadge x={1060} y={250} delay={sec(1.6)} phase={0}>
        <div style={{ width: 120, height: 150, borderRadius: 20, background: "white", boxShadow: "0 24px 50px rgba(10,15,70,0.35)", overflow: "hidden" }}>
          <div style={{ height: 52, background: "#127A45", color: "white", fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>JPG</div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
            {[80, 60, 70].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: 9, borderRadius: 5, background: "#D9DFF2" }} />
            ))}
          </div>
        </div>
      </FloatingBadge>
      <FloatingBadge x={1600} y={640} delay={sec(8.0)} phase={2}>
        <div style={{ width: 120, height: 120, borderRadius: 30, background: "linear-gradient(145deg, #FFD86B, #FFB800)", boxShadow: "0 24px 50px rgba(10,15,70,0.35)", color: C.ink, fontSize: 76, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          5
        </div>
      </FloatingBadge>
      <FloatingBadge x={1640} y={230} delay={sec(6.9)} phase={4}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: C.success, boxShadow: "0 24px 50px rgba(10,15,70,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckIcon size={60} color="white" />
        </div>
      </FloatingBadge>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Финал ─────────────────────────── */

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, delay: 6, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ scale: interpolate(p, [0, 1], [0.6, 1]), opacity: p }}>
        <AppLogo size={150} />
      </div>
      <FadeUp delay={12} style={{ marginTop: 34 }}>
        <div style={{ color: C.white, fontSize: 56, fontWeight: 800, textAlign: "center" }}>Мобильный журнал</div>
      </FadeUp>
      <FadeUp delay={18} style={{ marginTop: 12 }}>
        <div style={{ color: C.soft, fontSize: 32, fontWeight: 600, textAlign: "center" }}>Загрузить · Проверить · Оценить</div>
      </FadeUp>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Сборка ─────────────────────────── */

export const ScanWorks: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = useSec();

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />

      <Sequence durationInFrames={sec(INTRO_END)} premountFor={fps}>
        <Intro />
      </Sequence>

      <TopBar />

      {STEPS.map((step, i) => (
        <Sequence key={step.start} from={sec(step.start)} durationInFrames={sec(step.end) - sec(step.start)} premountFor={fps}>
          <StepText step={step} index={i} />
        </Sequence>
      ))}

      <Phone />

      {STEPS.flatMap((s) => (s.journal ? [] : s.focuses)).map((f) => (
        <Sequence key={f.start} from={sec(f.start)} durationInFrames={sec(f.end) - sec(f.start)} premountFor={fps}>
          <Callout focus={f} />
        </Sequence>
      ))}

      {STEPS.filter((s) => s.done).map((s) => (
        <Sequence key="done" from={sec(s.start)} durationInFrames={sec(s.end) - sec(s.start)} premountFor={fps}>
          <DoneBurst />
        </Sequence>
      ))}

      {STEPS.filter((s) => s.journal).map((s) => (
        <Sequence key="journal" from={sec(s.start)} durationInFrames={sec(s.end) - sec(s.start)} premountFor={fps}>
          <JournalSync len={sec(s.end) - sec(s.start)} />
        </Sequence>
      ))}

      <Sequence from={sec(OUTRO_START)} premountFor={fps}>
        <Outro />
      </Sequence>

      {/* Оригинальная озвучка — без изменений */}
      <Audio src={staticFile("voice.m4a")} />
    </AbsoluteFill>
  );
};

export const SCAN_WORKS_DURATION_SEC = DURATION;
