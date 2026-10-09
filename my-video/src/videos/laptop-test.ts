import { MeshVideoConfig } from "../mesh/types";

// Технический тест шаблона ноутбука (скриншоты из веб-ролика для Родителя)
export const laptopTest: MeshVideoConfig = {
  id: "laptop-test",
  service: { name: "МЭШ · Родитель", color: "#D94A7C", logo: "logo.png" },
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
    {
      start: 6,
      screen: "screens/02.png",
      marks: [{ at: 6.9, rect: { x: 1156, y: 103, w: 85, h: 26 } }],
      side: { type: "fact", icon: "link", top: "Ссылка действует", big: "24 часа", at: 7.2 },
    },
    {
      start: 9,
      screen: "screens/03.png",
      zoom: { rect: { x: 1150, y: 280, w: 500, h: 420 }, scale: 1.7 },
      marks: [{ at: 10.0, rect: { x: 1196, y: 518, w: 405, h: 38 } }],
    },
  ],
};
