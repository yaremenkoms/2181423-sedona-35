import { MeshVideoConfig } from "../mesh/types";

// Мобильный журнал · Учитель · «Скан работ»
// Тайминги сцен = начала фраз озвучки (см. transcript.json рядом с материалами)
export const scanWorks: MeshVideoConfig = {
  id: "scan-works",
  service: { name: "Мобильный журнал", color: "#4F6EF0", logo: "logo.png" },
  device: "phone",
  screenSize: { w: 437, h: 856 },
  cover: "cover.png",
  voice: "voice.mp3",
  durationSec: 62.016,
  coverEnd: 9.45,
  finalStart: 60.3,
  scenes: [
    // «Для этого откройте урок в расписании»
    { start: 9.45, screen: "screens/01.png", marks: [{ at: 10.4, rect: { x: 4, y: 362, w: 429, h: 96 } }] },
    // «и нажмите на значок»
    { start: 12.3, screen: "screens/02.png", marks: [{ at: 12.7, rect: { x: 134, y: 134, w: 58, h: 44 } }] },
    // «Откройте карточку урока»
    { start: 14.5, screen: "screens/03.png" },
    // «Нажмите „Перейти в реестр“»
    { start: 16.65, screen: "screens/04.png", marks: [{ at: 17.0, rect: { x: 12, y: 302, w: 413, h: 58 } }] },
    // «Данные урока подставятся автоматически»
    { start: 19.1, screen: "screens/05.png", marks: [{ at: 19.6, rect: { x: 8, y: 258, w: 421, h: 56 }, tap: false }] },
    // «Найдите ученика и нажмите „Прикрепить“»
    { start: 22.0, screen: "screens/06.png", marks: [{ at: 22.9, rect: { x: 8, y: 330, w: 421, h: 54 } }] },
    // «Нажмите „Добавить файл“ и выберите, как добавить работу»
    { start: 25.2, screen: "screens/07.png", tilt: true, marks: [{ at: 25.7, rect: { x: 12, y: 452, w: 140, h: 182 } }] },
    // «Сделать фото, прикрепить из галереи или из файлов»
    {
      start: 29.1,
      screen: "screens/08.png",
      marks: [
        { at: 29.25, rect: { x: 8, y: 690, w: 421, h: 46 }, tap: false },
        { at: 30.5, rect: { x: 8, y: 744, w: 421, h: 46 }, tap: false },
        { at: 32.05, rect: { x: 8, y: 798, w: 421, h: 46 }, tap: false },
      ],
    },
    // «После загрузки скан работы будет добавлен в реестр автоматически»
    { start: 33.3, screen: "screens/09.png", marks: [{ at: 34.0, rect: { x: 160, y: 452, w: 130, h: 180 }, tap: false }] },
    // «Чтобы проверить работу, нажмите „Перейти к проверке“»
    { start: 38.15, screen: "screens/10.png", marks: [{ at: 39.6, rect: { x: 12, y: 752, w: 413, h: 50 } }] },
    // «Оставьте пометки прямо на фото и нажмите на галочку»
    { start: 42.05, screen: "screens/11.png", tilt: true, marks: [{ at: 44.3, rect: { x: 396, y: 8, w: 40, h: 38 } }] },
    // «Чтобы выставить отметку, нажмите на поле „Отметка“»
    { start: 45.75, screen: "screens/12.png", marks: [{ at: 47.3, rect: { x: 8, y: 328, w: 421, h: 54 } }] },
    // «Выберите форму контроля и отметку»
    {
      start: 49.55,
      screen: "screens/13.png",
      marks: [
        { at: 49.9, rect: { x: 8, y: 384, w: 421, h: 52 } },
        { at: 51.1, rect: { x: 8, y: 484, w: 300, h: 48 } },
      ],
    },
    // «Затем нажмите „Сохранить“»
    { start: 52.3, screen: "screens/14.png", marks: [{ at: 52.7, rect: { x: 12, y: 795, w: 413, h: 46 } }] },
    // «Готово!»
    { start: 54.6, screen: "screens/15.png" },
    // «Отметка, выставленная в реестре, автоматически попадёт в электронный журнал»
    {
      start: 55.7,
      screen: "screens/16.png",
      marks: [{ at: 56.6, rect: { x: 8, y: 210, w: 421, h: 52 }, tap: false }],
      side: { type: "fact", icon: "journal", top: "Отметка", big: "в журнале", bottom: "автоматически", at: 57.4 },
    },
  ],
};
