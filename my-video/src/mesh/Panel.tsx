import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Block, MeshVideoConfig, Step } from "./types";
import { Icon } from "./Icons";
import { EASE_IN_OUT, UI, UI_FONT, clamp, mix, palette, rgba } from "./theme";

export const PANEL = { left: 1170, width: 680, trackerTop: 150, contentTop: 262 };

export const stepEnd = (cfg: MeshVideoConfig, i: number) => cfg.steps[i + 1]?.start ?? cfg.finalStart;
const totalSteps = (cfg: MeshVideoConfig) => Math.max(...cfg.steps.map((s) => s.n));

/* ───────── Трекер шагов ───────── */

export const Tracker: React.FC<{ cfg: MeshVideoConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const N = totalSteps(cfg);
  const pal = palette(cfg.service.color);
  const first = cfg.steps[0].start;
  if (t < first - 0.3 || t > cfg.finalStart + 0.4) return null;

  const appear = interpolate(t, [first - 0.3, first + 0.3], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const leave = interpolate(t, [cfg.finalStart - 0.1, cfg.finalStart + 0.4], [1, 0], clamp);

  // Сколько шагов пройдено (дробное — для плавной заливки линий)
  let progress = 0;
  let current = 1;
  cfg.steps.forEach((s, i) => {
    if (t < s.start) return;
    const prevN = i > 0 ? (cfg.steps[i - 1].done ? N + 1 : cfg.steps[i - 1].n) : 1;
    const target = s.done ? N + 1 : s.n;
    current = target;
    progress = interpolate(t, [s.start, s.start + 0.45], [prevN - 1, target - 1], { ...clamp, easing: EASE_IN_OUT });
  });

  const size = 58;
  const gap = (PANEL.width - size) / (N - 1);

  return (
    <div style={{ position: "absolute", left: PANEL.left, top: PANEL.trackerTop, width: PANEL.width, height: size, opacity: appear * leave }}>
      {Array.from({ length: N - 1 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, progress - i));
        return (
          <div key={`l${i}`} style={{ position: "absolute", left: size / 2 + gap * i, top: size / 2 - 2.5, width: gap, height: 5, borderRadius: 3, background: rgba("#FFFFFF", 0.6) }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 3, background: cfg.service.color }} />
          </div>
        );
      })}
      {Array.from({ length: N }).map((_, i) => {
        const k = i + 1;
        const done = progress >= k - 0.001 && k < current;
        const active = k === current;
        const pop = active
          ? spring({ frame: frame - Math.round((cfg.steps.find((s) => s.n === k)?.start ?? 0) * fps), fps, config: { damping: 11, stiffness: 180 } })
          : 1;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: gap * i,
              top: 0,
              width: size,
              height: size,
              borderRadius: "50%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              background: done ? cfg.service.color : active ? "#FFFFFF" : rgba("#FFFFFF", 0.55),
              border: active ? `5px solid ${cfg.service.color}` : "none",
              color: active ? pal.title : rgba(cfg.service.color, 0.75),
              boxShadow: active ? `0 0 0 8px ${rgba(cfg.service.color, 0.18)}, 0 10px 24px ${rgba(pal.title, 0.18)}` : "none",
              scale: active ? interpolate(pop, [0, 1], [0.7, 1.08]) : 1,
            }}
          >
            {done ? <Icon name="check" size={28} color="#FFFFFF" stroke={3.2} /> : k}
          </div>
        );
      })}
    </div>
  );
};

/* ───────── Копии элементов интерфейса ───────── */

const cardStyle: React.CSSProperties = {
  background: UI.card,
  borderRadius: 26,
  boxShadow: "0 18px 44px rgba(30,20,80,0.14)",
  fontFamily: UI_FONT,
  color: UI.text,
};

const useNow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

const BlockView: React.FC<{ block: Block; cfg: MeshVideoConfig; stepStart: number }> = ({ block, cfg, stepStart }) => {
  // Внутри <Sequence> шага кадр локальный — переводим в абсолютное время озвучки
  const t = useNow().t + stepStart;
  const ui = cfg.uiColor ?? cfg.service.color;
  const pal = palette(cfg.service.color);

  switch (block.kind) {
    case "text":
      return <div style={{ color: pal.sub, fontSize: 44, fontWeight: 700, lineHeight: 1.2 }}>{block.text}</div>;

    case "note":
      return <div style={{ color: pal.sub, fontSize: 30, fontWeight: 600, opacity: 0.85 }}>{block.text}</div>;

    case "button": {
      const v = block.variant ?? "soft";
      const color = block.color ?? ui;
      const btn: React.CSSProperties =
        v === "primary"
          ? { ...cardStyle, background: color, color: "#FFFFFF", boxShadow: `0 18px 40px ${rgba(color, 0.4)}` }
          : v === "outline"
            ? { ...cardStyle, border: `5px solid ${color}`, color: UI.text }
            : v === "link"
              ? { ...cardStyle, color }
              : cardStyle;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {block.before ? <div style={{ color: pal.sub, fontSize: 44, fontWeight: 700 }}>{block.before}</div> : null}
          <div style={{ ...btn, display: "inline-flex", alignItems: "center", gap: 20, padding: "24px 40px", fontSize: 46, fontWeight: 500 }}>
            {block.icon ? (
              v === "soft" ? (
                <div style={{ width: 66, height: 66, borderRadius: "50%", background: mix(ui, "#FFFFFF", 0.9), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={block.icon} size={38} color={ui} stroke={2.2} />
                </div>
              ) : (
                <Icon name={block.icon} size={44} color={v === "primary" ? "#FFFFFF" : color} stroke={2.2} />
              )
            ) : null}
            {block.label}
          </div>
        </div>
      );
    }

    case "card":
      return (
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 26, padding: "28px 36px" }}>
          {block.bar !== false ? <div style={{ width: 7, alignSelf: "stretch", borderRadius: 4, background: ui }} /> : null}
          <div style={{ flex: 1 }}>
            {block.meta ? <div style={{ color: UI.muted, fontSize: 34, marginBottom: 6 }}>{block.meta}</div> : null}
            <div style={{ fontSize: 46, fontWeight: 700 }}>{block.title}</div>
          </div>
          {block.icon ? <Icon name={block.icon} size={62} color={ui} stroke={1.8} /> : null}
        </div>
      );

    case "fields":
      return (
        <div style={{ ...cardStyle, padding: "18px 36px" }}>
          {block.rows.map((r, i) => {
            const start = (block.at ?? stepStart) + 0.25 + i * 0.22;
            const p = interpolate(t, [start, start + 0.25], [0, 1], clamp);
            return (
              <div key={r.label} style={{ display: "flex", alignItems: "center", padding: "16px 0", fontSize: 38 }}>
                <div style={{ width: 200, color: UI.muted }}>{r.label}</div>
                <div style={{ flex: 1, fontWeight: 500 }}>{r.value}</div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: UI.success,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: p,
                  }}
                >
                  <Icon name="check" size={30} color="#FFFFFF" stroke={3.2} />
                </div>
              </div>
            );
          })}
        </div>
      );

    case "field":
      return (
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", padding: "26px 36px", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: block.value ? UI.muted : UI.text, fontSize: block.value ? 32 : 44, fontWeight: block.value ? 400 : 500 }}>{block.label}</div>
            {block.value ? <div style={{ fontSize: 44, fontWeight: 500, marginTop: 4 }}>{block.value}</div> : null}
          </div>
          {!block.value ? <div style={{ width: 70, height: 70, borderRadius: 16, border: `3px solid ${mix(UI.muted, "#FFFFFF", 0.4)}` }} /> : null}
        </div>
      );

    case "options": {
      const shown = block.items.filter((it) => t >= it.at);
      const item = shown[shown.length - 1] ?? block.items[0];
      const since = t - item.at;
      const p = interpolate(since, [0, 0.25], [0, 1], clamp);
      return (
        <div
          style={{
            ...cardStyle,
            border: `5px solid ${ui}`,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "26px 36px",
            fontSize: 46,
            opacity: p,
            translate: `0 ${(1 - p) * 14}px`,
          }}
        >
          {item.icon ? <Icon name={item.icon} size={46} color={ui} stroke={2.2} /> : null}
          {item.text}
        </div>
      );
    }

    case "chips": {
      const selected = block.selected && (block.selectAt === undefined || t >= block.selectAt) ? block.selected : undefined;
      return (
        <div style={{ display: "flex", gap: 22 }}>
          {block.items.map((c) => {
            const on = c === selected;
            const p = on ? interpolate(t, [block.selectAt ?? 0, (block.selectAt ?? 0) + 0.2], [0, 1], clamp) : 0;
            return (
              <div
                key={c}
                style={{
                  ...cardStyle,
                  width: 108,
                  height: 108,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  fontWeight: 500,
                  background: on ? ui : UI.card,
                  color: on ? "#FFFFFF" : UI.text,
                  scale: 1 + Math.sin(p * Math.PI) * 0.1,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      );
    }

    case "icons": {
      const act = (block.activeAt ?? []).filter((a) => t >= a.at).pop();
      return (
        <div style={{ ...cardStyle, background: "#15161C", display: "inline-flex", gap: 14, padding: 14 }}>
          {block.items.map((ic, i) => (
            <div
              key={ic + i}
              style={{
                width: 92,
                height: 92,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: act?.index === i ? ui : "transparent",
              }}
            >
              <Icon name={ic} size={48} color="#FFFFFF" stroke={2} />
            </div>
          ))}
        </div>
      );
    }

    case "flow": {
      const start = block.at ?? stepStart;
      const arrow = interpolate(t, [start + 0.6, start + 1.0], [0, 1], { ...clamp, easing: EASE_IN_OUT });
      const second = interpolate(t, [start + 0.9, start + 1.3], [0, 1], clamp);
      const row = (title: string, value: string, o: number) => (
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 30px 24px 36px", opacity: o, translate: `0 ${(1 - o) * 20}px` }}>
          <div style={{ fontSize: 42, fontWeight: 500 }}>{title}</div>
          <div style={{ width: 82, height: 82, borderRadius: 20, background: ui, color: "#FFFFFF", fontSize: 50, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>{value}</div>
        </div>
      );
      return (
        <div>
          {row(block.from.title, block.from.value, 1)}
          <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", opacity: arrow, translate: `0 ${(1 - arrow) * -20}px` }}>
            <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={cfg.service.color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v15M6 13l6 6 6-6" />
            </svg>
          </div>
          {row(block.to.title, block.to.value, second)}
        </div>
      );
    }

    case "fact":
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {block.icon ? <Icon name={block.icon} size={56} color={pal.title} stroke={1.8} /> : null}
            {block.top ? <div style={{ color: pal.title, fontSize: 34, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{block.top}</div> : null}
          </div>
          <div style={{ color: cfg.service.color, fontSize: 130, fontWeight: 900, lineHeight: 1.05 }}>{block.big}</div>
          {block.bottom ? <div style={{ color: pal.sub, fontSize: 40, fontWeight: 700 }}>{block.bottom}</div> : null}
        </div>
      );
  }
};

/* ───────── Панель шага ───────── */

const Appear: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const { frame, fps } = useNow();
  const p = spring({ frame, fps, delay, config: { damping: 18, stiffness: 150 } });
  return <div style={{ ...style, opacity: p, translate: `0 ${(1 - p) * 34}px` }}>{children}</div>;
};

// Живёт внутри <Sequence> шага: frame 0 = начало шага
export const StepPanel: React.FC<{ cfg: MeshVideoConfig; step: Step; len: number }> = ({ cfg, step, len }) => {
  const { frame, fps } = useNow();
  const pal = palette(cfg.service.color);
  const N = totalSteps(cfg);
  const out = interpolate(frame, [len - 7, len], [1, 0], clamp);
  const lift = interpolate(frame, [len - 7, len], [0, -24], clamp);

  const longest = Math.max(...step.title.split("\n").map((l) => l.length));
  const titleSize = Math.min(118, Math.floor(PANEL.width / (longest * 0.63)));
  const eyebrow = step.eyebrow ?? (step.done ? undefined : `Шаг ${step.n} из ${N}`);
  const rel = (at?: number) => (at === undefined ? undefined : Math.round((at - step.start) * fps));

  return (
    <div style={{ position: "absolute", left: PANEL.left, top: PANEL.contentTop, width: PANEL.width, opacity: out, translate: `0 ${lift}px` }}>
      {eyebrow ? (
        <Appear delay={0}>
          <div style={{ color: step.eyebrow ? mix("#E0457B", cfg.service.color, 0.35) : pal.eyebrow, fontSize: 34, fontWeight: 800, letterSpacing: 6, textTransform: "uppercase", marginBottom: 8 }}>
            {eyebrow}
          </div>
        </Appear>
      ) : null}
      <Appear delay={2}>
        <div style={{ color: pal.title, fontSize: titleSize, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, whiteSpace: "pre-line", marginBottom: 30 }}>{step.title}</div>
      </Appear>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 30 }}>
        {(step.blocks ?? []).map((b, i) => {
          const at = "at" in b ? b.at : b.kind === "options" ? b.items[0].at : undefined;
          const d = rel(at) ?? 6 + i * 4;
          return (
            <Appear key={i} delay={d} style={{ alignSelf: b.kind === "card" || b.kind === "fields" || b.kind === "field" || b.kind === "options" || b.kind === "flow" ? "stretch" : "flex-start" }}>
              <BlockView block={b} cfg={cfg} stepStart={step.start} />
            </Appear>
          );
        })}
      </div>
    </div>
  );
};
