import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MeshVideoConfig } from "../mesh/types";
import { StepPanel, Tracker, stepEnd } from "../mesh/Panel";
import { FONT, clamp } from "../mesh/theme";

// Мобильный дневник · Ученик · «Как отправить работу на проверку» — версия под новую озвучку.
// Картинка — исходный ролик, каждая фраза растянута/сжата под новую озвучку (±25%);
// поверх — трекер и карточки шагов в стиле МЭШ, конфетти на «Готово!», тихие звуки.

const DIR = "videos/send-work-v2";

// Начала фраз: в исходном ролике и в новой озвучке (transcript.json), одна фраза — один сегмент
const OLD = [0, 4.73, 9.57, 12.02, 17.23, 19.4, 21.99, 24.25, 29.34, 32.44, 35.49, 38.24, 39.46, 43.48];
const NEW = [0, 4.23, 8.65, 11.04, 16.31, 18.29, 20.55, 22.34, 27.32, 30.16, 33.29, 35.87, 36.83, 40.3];
const FINAL_OLD = [43.48, 46.4]; // финал с логотипом — без изменений
export const SEND_WORK_V2_DURATION = NEW[NEW.length - 1] + (FINAL_OLD[1] - FINAL_OLD[0]);

const cfg: MeshVideoConfig = {
  id: "send-work-v2",
  service: { name: "Мобильный дневник", color: "#A23CC9", logo: "" },
  uiColor: "#3F6FF0",
  device: "phone",
  screenSize: { w: 1, h: 1 },
  cover: "",
  voice: "",
  durationSec: SEND_WORK_V2_DURATION,
  coverEnd: 4.23,
  finalStart: 40.3,
  scenes: [],
  panel: { left: 1040, width: 740, trackerTop: 140, contentTop: 250 },
  steps: [
    {
      start: 4.23,
      n: 1,
      title: "Откройте урок",
      blocks: [
        { kind: "text", text: "в «Дневнике МЭШ»", at: 5.55 },
        { kind: "card", meta: "2 урок", title: "Физика", at: 6.47 },
      ],
    },
    { start: 8.65, n: 2, title: "Нажмите", blocks: [{ kind: "button", label: "Прикрепить файл", icon: "file", variant: "soft", at: 9.4 }] },
    // «+5 минут» — инфографика исходного ролика справа, панель прячем
    { start: 11.04, n: 2, title: "", hidden: true },
    { start: 16.31, n: 3, title: "Нажмите", blocks: [{ kind: "button", label: "Загрузить", variant: "outline", at: 17.1 }] },
    { start: 18.29, n: 3, title: "Выберите", blocks: [{ kind: "options", items: [{ at: 19.2, text: "Сделать снимок", icon: "camera" }] }] },
    // Рука с телефоном, страницы, «до 10 фотографий» — графика исходника
    { start: 20.55, n: 3, title: "", hidden: true },
    {
      start: 30.16,
      n: 4,
      eyebrow: "При необходимости",
      title: "Выберите",
      blocks: [
        { kind: "text", text: "вариант работы", at: 31.6 },
        { kind: "options", items: [{ at: 32.2, text: "Вариант 2" }] },
      ],
    },
    { start: 33.29, n: 5, title: "Нажмите", blocks: [{ kind: "button", label: "Отправить на проверку", variant: "primary", at: 34.2 }] },
    {
      start: 35.87,
      n: 5,
      done: true,
      title: "Готово!",
      blocks: [{ kind: "card", title: "На проверке", icon: "check", bar: false, at: 36.9 }],
    },
  ],
};

// Тихие эффекты: «поп» на карточках, щелчки на нажатиях, мягкий удар на «Готово!»
const SFX: { at: number; s: string; gain: number }[] = [
  ...[4.23, 8.65, 16.31, 18.29, 30.16, 33.29].map((at) => ({ at: at + 0.05, s: "pop", gain: 0.12 })),
  { at: 9.68, s: "click", gain: 0.18 },
  { at: 17.33, s: "click", gain: 0.18 },
  { at: 19.34, s: "click", gain: 0.18 },
  { at: 21.4, s: "click", gain: 0.22 }, // «щёлк» камеры
  { at: 32.07, s: "click", gain: 0.16 },
  { at: 34.5, s: "click", gain: 0.18 },
  { at: 36.2, s: "hit", gain: 0.12 },
  { at: 36.25, s: "pop", gain: 0.16 },
  { at: 40.45, s: "whoosh", gain: 0.08 },
];

/* ── Сдвиг телефона влево ──
   Положение телефона в исходнике (центр по X), найдено по кадрам (низкая насыщенность цвета).
   Двигаем кадр так, чтобы телефон стоял на PHONE_X, но только влево: где он и так слева — не трогаем. */
const PHONE_X = 700;
const TRACK: [number, number][] = [
  [4.3, 967.5], [19.8, 967.5], [19.9, 924.5], [20.0, 756.5], [20.1, 587.5], [20.2, 544.5],
  [32.2, 544.5], [32.3, 587.5], [32.4, 756.5], [32.5, 924.5], [32.6, 967.5], [44.0, 967.5],
];

// Время исходника, которое показывается в момент t новой версии
const oldTime = (t: number) => {
  const last = NEW[NEW.length - 1];
  if (t >= last) return FINAL_OLD[0] + (t - last);
  const i = Math.max(0, NEW.findIndex((n, k) => t >= n && t < NEW[k + 1]));
  return OLD[i] + ((t - NEW[i]) * (OLD[i + 1] - OLD[i])) / (NEW[i + 1] - NEW[i]);
};

const shiftAt = (t: number) => {
  const o = oldTime(t);
  if (o < TRACK[0][0]) return 0; // обложка
  const c = interpolate(o, TRACK.map((k) => k[0]), TRACK.map((k) => k[1]), clamp);
  const s = Math.min(0, PHONE_X - c);
  // телефон уходит перед логотипом — плавно возвращаем кадр на место
  return s * interpolate(o, [44.0, 44.4], [1, 0], clamp);
};

// Видеодорожка: исходник по сегментам-фразам
const Track: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const src = staticFile(`${DIR}/source.mp4`);
  return (
    <>
      {NEW.slice(0, -1).map((ns, i) => (
        <Sequence key={`seg${i}`} name={`фраза ${i + 1}`} from={sec(ns)} durationInFrames={sec(NEW[i + 1]) - sec(ns)} premountFor={fps}>
          <Video src={src} muted trimBefore={sec(OLD[i])} playbackRate={(OLD[i + 1] - OLD[i]) / (NEW[i + 1] - ns)} style={{ width: 1920, height: 1080 }} />
        </Sequence>
      ))}
      <Sequence name="финал" from={sec(NEW[NEW.length - 1])} premountFor={fps}>
        <Video src={src} muted trimBefore={sec(FINAL_OLD[0])} style={{ width: 1920, height: 1080 }} />
      </Sequence>
    </>
  );
};

const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame / fps - at;
  if (k < 0 || k > 2.4) return null;
  // Брендбук МЭШ: малиновый, жёлтый, голубой, персиковый + цвет сервиса; округлые фигуры
  const cols = ["#A23CC9", "#C64488", "#FFAA00", "#409EA9", "#FA8E7A", "#FFFFFF"];
  return (
    <AbsoluteFill>
      {Array.from({ length: 40 }).map((_, i) => {
        const a = -Math.PI / 2 + ((i / 40) * 2 - 1) * 1.25;
        const v = 700 + ((i * 131) % 500);
        const x = 1570 + Math.cos(a) * v * k * 0.75;
        const y = 560 + Math.sin(a) * v * k + 900 * k * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18,
              height: i % 3 ? 18 : 36,
              borderRadius: 9,
              background: cols[i % cols.length],
              rotate: `${k * 500 + i * 37}deg`,
              opacity: interpolate(k, [1.6, 2.4], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const SendWorkV2: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const sec = (s: number) => Math.round(s * fps);
  const shift = shiftAt(frame / fps);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, fontVariantNumeric: "lining-nums", fontFeatureSettings: '"lnum" 1' }}>
      {/* Исходный ролик, сдвинутый так, чтобы телефон стоял левее */}
      <AbsoluteFill style={{ translate: `${shift}px 0px` }}>
        <Track />
      </AbsoluteFill>
      {/* Освободившаяся полоса справа: крайние 6 px кадра, растянутые на ширину сдвига */}
      {shift < -0.5 ? (
        <div style={{ position: "absolute", right: 0, top: 0, width: 6, height: 1080, overflow: "hidden", scale: `${-shift / 6} 1`, transformOrigin: "right center" }}>
          <div style={{ position: "absolute", left: -1914, top: 0, width: 1920, height: 1080 }}>
            <Track />
          </div>
        </div>
      ) : null}

      {/* Моушен поверх: трекер и карточки шагов */}
      <Tracker cfg={cfg} />
      {cfg.steps.map((st, i) => {
        if (st.hidden) return null;
        const len = sec(stepEnd(cfg, i)) - sec(st.start);
        return (
          <Sequence key={`st${i}`} name={`шаг: ${st.title}`} from={sec(st.start)} durationInFrames={len} premountFor={fps}>
            <StepPanel cfg={cfg} step={st} len={len} />
          </Sequence>
        );
      })}
      <Confetti at={35.95} />

      <Audio src={staticFile(`${DIR}/voice.mp3`)} />
      <Audio src={staticFile(`${DIR}/music.wav`)} volume={0.035} />
      {SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={sec(s.at)} premountFor={fps}>
          <Audio src={staticFile(`motion/sfx/${s.s}.wav`)} volume={s.gain} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
