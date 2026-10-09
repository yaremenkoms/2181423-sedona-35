import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig, Side } from "./types";
import { asset } from "./ScreenStack";
import { clamp, palette } from "./theme";

// Брендбук: иконки линейные, строго в фирменном цвете
const ICONS: Record<string, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  photo: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.8 2.8L16.5 9" />
    </>
  ),
  journal: (
    <>
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <path d="M5 18a2 2 0 0 1 2-2h11M9 8h6M9 11h4" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
};

const FactBlock: React.FC<{ side: Extract<Side, { type: "fact" }>; color: string }> = ({ side, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pal = palette(color);
  const a = spring({ frame, fps, config: { damping: 16, stiffness: 150 } });
  const b = spring({ frame, fps, delay: 5, config: { damping: 12, stiffness: 160 } });
  const c = spring({ frame, fps, delay: 10, config: { damping: 16, stiffness: 150 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: a, translate: `${(1 - a) * 30}px 0` }}>
        {side.icon ? (
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={pal.deep} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            {ICONS[side.icon]}
          </svg>
        ) : null}
        {side.top ? <div style={{ color: pal.deep, fontSize: 34, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>{side.top}</div> : null}
      </div>
      <div
        style={{
          color: pal.deep,
          fontSize: 118,
          fontWeight: 800,
          lineHeight: 1,
          marginTop: 6,
          letterSpacing: -2,
          opacity: b,
          scale: interpolate(b, [0, 1], [0.7, 1]),
          transformOrigin: "left center",
          whiteSpace: "pre-line",
        }}
      >
        {side.big}
      </div>
      {side.bottom ? (
        <div style={{ color: pal.ink, fontSize: 38, fontWeight: 600, marginTop: 10, opacity: c, translate: `0 ${(1 - c) * 16}px`, whiteSpace: "pre-line" }}>
          {side.bottom}
        </div>
      ) : null}
    </div>
  );
};

const ImageBlock: React.FC<{ cfg: MeshVideoConfig; side: Extract<Side, { type: "image" }> }> = ({ cfg, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  return (
    <Img
      src={asset(cfg, side.src)}
      style={{
        width: side.width ?? 560,
        scale: interpolate(p, [0, 1], [0.6, 1]),
        opacity: p,
        translate: `0 ${Math.sin(frame / 25) * 8}px`,
      }}
    />
  );
};

// Блок справа от устройства. Живёт внутри <Sequence> сцены.
export const SideContent: React.FC<{ cfg: MeshVideoConfig; side: Side; len: number }> = ({ cfg, side, len }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [len - 8, len], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 1130, top: 0, width: 720, height: 1080, display: "flex", alignItems: "center", opacity: out }}>
      {side.type === "fact" ? <FactBlock side={side} color={cfg.service.color} /> : <ImageBlock cfg={cfg} side={side} />}
    </div>
  );
};
