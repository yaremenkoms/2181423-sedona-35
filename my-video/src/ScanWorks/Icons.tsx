import React from "react";

type P = { size?: number; color?: string; stroke?: number };

export const CameraIcon: React.FC<P> = ({ size = 32, color = "currentColor", stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ImageIcon: React.FC<P> = ({ size = 32, color = "currentColor", stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M21 16l-5-5-8 9" />
  </svg>
);

export const FolderIcon: React.FC<P> = ({ size = 32, color = "currentColor", stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const CheckIcon: React.FC<P> = ({ size = 32, color = "currentColor", stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowDownIcon: React.FC<P> = ({ size = 32, color = "currentColor", stroke = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v15M6 13l6 6 6-6" />
  </svg>
);

// Логотип приложения из исходного ролика: 4 скруглённых квадрата
export const AppLogo: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: "linear-gradient(145deg, #5B7CFF, #2F4BD8)",
      boxShadow: "0 8px 24px rgba(20,30,110,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: size * 0.08,
      padding: size * 0.24,
      boxSizing: "border-box",
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ background: "white", borderRadius: size * 0.06 }} />
    ))}
  </div>
);

export const OPTION_ICONS = { camera: CameraIcon, image: ImageIcon, folder: FolderIcon };
