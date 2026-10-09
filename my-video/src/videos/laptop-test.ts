import { MeshVideoConfig } from "../mesh/types";

// Технический тест шаблона ноутбука (скриншоты из веб-ролика для Родителя)
export const laptopTest: MeshVideoConfig = {
  id: "laptop-test",
  service: { name: "МЭШ · Родитель", color: "#7B5BE6", logo: "logo.png" },
  uiColor: "#4F6EF0",
  device: "laptop",
  url: "school.mos.ru",
  screenSize: { w: 1656, h: 863 },
  cover: "cover.png",
  voice: "voice.mp3",
  durationSec: 14,
  coverEnd: 3,
  finalStart: 12,
  scenes: [
    { start: 3, screen: "screens/01.png", marks: [{ at: 4.2, rect: { x: 1180, y: 2, w: 190, h: 36 } }] },
    { start: 6, screen: "screens/02.png", marks: [{ at: 6.9, rect: { x: 1156, y: 103, w: 85, h: 26 } }] },
    { start: 9, screen: "screens/03.png", marks: [{ at: 10.0, rect: { x: 1196, y: 518, w: 405, h: 38 } }] },
  ],
  steps: [
    { start: 3, n: 1, title: "Откройте профиль", blocks: [{ kind: "button", label: "Родитель", variant: "soft", icon: "users" }] },
    {
      start: 6,
      n: 2,
      title: "Выберите способ",
      blocks: [
        { kind: "text", text: "приглашения" },
        { kind: "options", items: [{ at: 6.9, text: "Ссылка", icon: "link" }] },
      ],
    },
    {
      start: 9,
      n: 3,
      title: "Скопируйте ссылку",
      blocks: [
        { kind: "button", label: "Скопировать", variant: "primary", at: 9.8 },
        { kind: "fact", top: "Ссылка действует", big: "24 часа", icon: "clock", at: 10.6 },
      ],
    },
  ],
};
