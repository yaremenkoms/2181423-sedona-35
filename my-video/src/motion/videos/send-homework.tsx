import React from "react";
import { MotionConfig, MotionVideo } from "../Stage";
import { P, Words, makeW } from "../core";
import { AppButton, AppCard, BigCheck, Camera, Chips, Confetti, Counter, Kicker, Mono, PageStack, Phone, PhotoGrid, Title, Zone } from "../blocks";
import words from "../../../public/motion/send-homework/words.json";

// «Как отправить работу на проверку с телефона» — Reels 9:16 по озвучке эталона МЭШ
const data = words as Words;
const W = makeW(data);
const ID = "motion/send-homework";

const DIARY = "#8B5CF6";

export const sendHomework: MotionConfig = {
  id: "send-homework",
  width: 1080,
  height: 1920,
  voice: `${ID}/voice.mp3`,
  words: data,
  endPad: 2.6,
  music: { file: `${ID}/music.wav`, gain: 0.16 },
  chapters: [
    { at: W("откройте"), title: "Урок" },
    { at: W("нажмите"), title: "Файл" },
    { at: W("нажмите", 2), title: "Фото" },
    { at: W("при"), title: "Отправка" },
  ],
  shake: [W("5"), W("готово")],
  sfx: [
    { at: W("откройте") - 2, s: "riser", gain: 0.22 },
    { at: W("откройте"), s: "hit", gain: 0.35 },
    { at: W("прикрепить"), s: "click", gain: 0.6 },
    { at: W("5"), s: "hit", gain: 0.5 },
    { at: W("загрузить", 2), s: "click", gain: 0.6 },
    { at: W("сделать"), s: "click", gain: 0.6 },
    { at: W("сфотографируйте") + 0.5, s: "hit", gain: 0.35 },
    { at: W("снова"), s: "pop", gain: 0.45 },
    { at: W("сфотографируйте", 2), s: "pop", gain: 0.45 },
    ...Array.from({ length: 10 }, (_, i) => ({ at: W("10") + (i / 10) * 0.9, s: "tick" as const, gain: 0.4 })),
    { at: W("вариант") + 0.35, s: "pop", gain: 0.45 },
    { at: W("проверку", 2), s: "click", gain: 0.6 },
    { at: W("готово"), s: "hit", gain: 0.55 },
    { at: W("знаете"), s: "pop", gain: 0.4 },
  ],
  scenes: [
    {
      id: "hook",
      from: 0,
      to: W("откройте"),
      glow: "vio",
      out: "up",
      el: (
        <Zone align="flex-start" gap={50}>
          <Kicker at={0.1} text="ДНЕВНИК МЭШ" color="vio" />
          <Title
            size={128}
            lines={[
              { text: "Как отправить", at: W("как") },
              { text: "работу", at: W("работу"), color: "lime" },
              { text: "на проверку", at: W("на") },
              { text: "с телефона", at: W("телефона"), serif: true, color: "vio" },
            ]}
          />
        </Zone>
      ),
    },
    {
      id: "lesson",
      from: W("откройте"),
      to: W("нажмите"),
      glow: "vio",
      in: "up",
      out: "zoom",
      el: (
        <Zone gap={34}>
          <Mono at={W("откройте")} text="ОТКРОЙТЕ УРОК" color="lime" size={40} />
          <Phone at={W("откройте")} accent={DIARY} title="Дневник МЭШ" scale={0.86}>
            <AppCard at={W("откройте") + 0.25} meta="1 урок · 09:00" title="Алгебра" color={DIARY} />
            <AppCard at={W("откройте") + 0.4} meta="2 урок · 10:00" title="Физика" color={DIARY} active={W("урок")} />
            <AppCard at={W("откройте") + 0.55} meta="3 урок · 11:00" title="Химия" color={DIARY} />
            <AppCard at={W("откройте") + 0.7} meta="4 урок · 12:00" title="История" color={DIARY} />
          </Phone>
        </Zone>
      ),
    },
    {
      id: "attach",
      from: W("нажмите"),
      to: W("работу", 3),
      glow: "lime",
      in: "zoom",
      out: "left",
      el: (
        <Zone gap={70}>
          <Title align="center" size={160} lines={[{ text: "Нажмите", at: W("нажмите") }]} />
          <AppButton at={W("нажмите") + 0.3} label="Прикрепить файл" tapAt={W("прикрепить")} color={P.lime} size={66} />
        </Zone>
      ),
    },
    {
      id: "five",
      from: W("работу", 3),
      to: W("нажмите", 2),
      glow: "gold",
      in: "left",
      out: "zoomIn",
      el: (
        <Zone gap={36}>
          <Mono at={W("работу", 3)} text="ЗАГРУЗИТЬ МОЖНО" size={40} />
          <Mono at={W("время")} text="ВО ВРЕМЯ УРОКА" color="cy" size={48} />
          <Counter at={W("5")} to={5} prefix="+" unit="мин" color="gold" size={400} />
          <Mono at={W("после")} text="ПОСЛЕ ЗАВЕРШЕНИЯ" color="gold" size={48} />
        </Zone>
      ),
    },
    {
      id: "upload",
      from: W("нажмите", 2),
      to: W("выберите"),
      glow: "pink",
      in: "zoom",
      out: "up",
      el: (
        <Zone gap={70}>
          <Title align="center" size={150} lines={[{ text: "Нажмите", at: W("нажмите", 2) }]} />
          <AppButton at={W("нажмите", 2) + 0.2} label="Загрузить" tapAt={W("загрузить", 2)} color={P.pink} size={72} />
        </Zone>
      ),
    },
    {
      id: "snap",
      from: W("выберите"),
      to: W("сфотографируйте") - 0.35,
      glow: "pink",
      in: "up",
      out: "zoomIn",
      el: (
        <Zone gap={60}>
          <Title align="center" size={130} lines={[{ text: "Выберите", at: W("выберите") }]} />
          <AppButton at={W("выберите") + 0.3} label="Сделать снимок" tapAt={W("сделать")} color={P.pink} ghost size={66} />
        </Zone>
      ),
    },
    {
      id: "camera",
      from: W("сфотографируйте") - 0.35,
      to: W("если"),
      glow: "lime",
      in: "zoom",
      out: "left",
      el: (
        <Zone gap={20}>
          <Camera at={W("сфотографируйте") - 0.35} shotAt={W("сфотографируйте") + 0.5} />
          <Mono at={W("работу", 4)} text="ЩЁЛК — РАБОТА В КАДРЕ" color="lime" size={36} />
        </Zone>
      ),
    },
    {
      id: "pages",
      from: W("если"),
      to: W("можно", 2),
      glow: "cy",
      in: "left",
      out: "zoom",
      el: (
        <Zone gap={40}>
          <Title
            align="center"
            size={120}
            lines={[
              { text: "Если страниц", at: W("если") },
              { text: "несколько", at: W("несколько"), serif: true, color: "cy" },
            ]}
          />
          <PageStack times={[W("несколько") + 0.2, W("снова"), W("сфотографируйте", 2)]} />
          <Mono at={W("загрузить", 3)} text="СНОВА «ЗАГРУЗИТЬ»" color="cy" size={38} />
        </Zone>
      ),
    },
    {
      id: "ten",
      from: W("можно", 2),
      to: W("при"),
      glow: "hot",
      light: true,
      in: "zoomIn",
      out: "up",
      el: (
        <Zone gap={50}>
          <div style={{ color: P.lightInk }}>
            <Mono at={W("можно", 2)} text="МОЖНО ПРИКРЕПИТЬ ДО" size={42} color="hot" />
          </div>
          <div style={{ color: P.lightInk }}>
            <Counter at={W("10")} to={10} unit="фото" color="hot" size={380} dur={0.9} />
          </div>
          <PhotoGrid at={W("10")} n={10} dur={0.9} color="hot" />
        </Zone>
      ),
    },
    {
      id: "variant",
      from: W("при"),
      to: W("нажмите", 4),
      glow: "vio",
      in: "up",
      out: "zoom",
      el: (
        <Zone gap={60}>
          <Mono at={W("при")} text="ПРИ НЕОБХОДИМОСТИ" size={40} />
          <Title
            align="center"
            size={140}
            lines={[
              { text: "Выберите", at: W("выберите", 2) },
              { text: "вариант", at: W("вариант"), serif: true, color: "vio" },
            ]}
          />
          <Chips at={W("вариант")} items={["Вариант 1", "Вариант 2", "Вариант 3"]} pick={{ at: W("вариант") + 0.35, index: 1 }} color="vio" />
        </Zone>
      ),
    },
    {
      id: "send",
      from: W("нажмите", 4),
      to: W("готово"),
      glow: "lime",
      in: "zoom",
      out: "cut",
      el: (
        <Zone gap={70}>
          <Title align="center" size={150} lines={[{ text: "Нажмите", at: W("нажмите", 4) }]} />
          <AppButton at={W("отправить", 2) - 0.2} label="Отправить на проверку" tapAt={W("проверку", 2)} color={P.lime} size={58} />
        </Zone>
      ),
    },
    {
      id: "done",
      from: W("готово"),
      to: W("теперь"),
      glow: "lime",
      flash: true,
      in: "cut",
      out: "zoomIn",
      el: (
        <>
          <Zone gap={60}>
            <BigCheck at={W("готово")} size={360} />
            <Title align="center" size={190} lines={[{ text: "Готово!", at: W("готово") + 0.1, color: "lime" }]} />
          </Zone>
          <Confetti at={W("готово")} />
        </>
      ),
    },
    {
      id: "outro",
      from: W("теперь"),
      to: data.duration + 2.6,
      glow: "vio",
      in: "zoom",
      out: "fade",
      el: (
        <Zone align="flex-start" gap={44}>
          <Title
            size={140}
            lines={[
              { text: "Теперь вы", at: W("теперь") },
              { text: "знаете как", at: W("знаете"), serif: true, color: "vio" },
            ]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>
            <Mono at={W("отправить", 3)} text="01  ПРИКРЕПИТЬ ФАЙЛ" color="lime" size={44} />
            <Mono at={W("самостоятельную", 3)} text="02  СФОТОГРАФИРОВАТЬ" color="pink" size={44} />
            <Mono at={W("работу", 4)} text="03  ОТПРАВИТЬ" color="cy" size={44} />
          </div>
          <div style={{ marginTop: 40 }}>
            <Kicker at={W("телефона", 2) + 0.4} text="СОХРАНИ, ЧТОБЫ НЕ ПОТЕРЯТЬ" color="gold" />
          </div>
        </Zone>
      ),
    },
  ],
};

// Сцены содержат JSX — их нельзя передавать через defaultProps (Remotion сериализует пропсы в JSON)
export const SendHomework: React.FC = () => <MotionVideo cfg={sendHomework} />;
