import { MeshVideoConfig } from "../mesh/types";

// Мобильный журнал · Учитель · «Скан работ»
// Тайминги = начала фраз озвучки (public/videos/scan-works/transcript.json)
export const scanWorks: MeshVideoConfig = {
  id: "scan-works",
  service: { name: "Мобильный журнал", color: "#4F6EF0", logo: "logo.png" },
  uiColor: "#3F5FE0",
  device: "phone",
  screenSize: { w: 437, h: 856 },
  cover: "cover.png",
  voice: "voice.mp3",
  durationSec: 62.016,
  coverEnd: 9.45,
  finalStart: 60.3,

  // Скриншоты на телефоне: одна фраза — один экран
  scenes: [
    { start: 9.45, screen: "screens/01.png", marks: [{ at: 10.4, rect: { x: 8, y: 362, w: 421, h: 96 } }] },
    { start: 12.3, screen: "screens/02.png", marks: [{ at: 12.8, rect: { x: 134, y: 134, w: 58, h: 44 } }] },
    { start: 14.5, screen: "screens/03.png", focusY: 200 },
    { start: 16.65, screen: "screens/04.png", marks: [{ at: 17.1, rect: { x: 12, y: 302, w: 413, h: 58 } }] },
    { start: 19.1, screen: "screens/05.png", marks: [{ at: 19.6, rect: { x: 8, y: 258, w: 421, h: 56 }, tap: false }] },
    { start: 22.0, screen: "screens/06.png", marks: [{ at: 23.0, rect: { x: 8, y: 330, w: 421, h: 54 } }] },
    { start: 25.2, screen: "screens/07.png", marks: [{ at: 25.8, rect: { x: 14, y: 452, w: 138, h: 182 } }] },
    {
      start: 29.1,
      screen: "screens/08.png",
      marks: [
        { at: 29.25, rect: { x: 8, y: 690, w: 421, h: 46 }, tap: false },
        { at: 30.5, rect: { x: 8, y: 744, w: 421, h: 46 }, tap: false },
        { at: 32.05, rect: { x: 8, y: 798, w: 421, h: 46 }, tap: false },
      ],
    },
    { start: 33.3, screen: "screens/09.png", marks: [{ at: 34.0, rect: { x: 160, y: 452, w: 130, h: 180 }, tap: false }] },
    { start: 38.15, screen: "screens/10.png", marks: [{ at: 39.6, rect: { x: 12, y: 752, w: 413, h: 50 } }] },
    { start: 42.05, screen: "screens/11.png", marks: [{ at: 44.3, rect: { x: 388, y: 10, w: 44, h: 40 } }] },
    { start: 45.75, screen: "screens/12.png", marks: [{ at: 47.3, rect: { x: 8, y: 328, w: 421, h: 54 } }] },
    {
      start: 49.55,
      screen: "screens/13.png",
      marks: [
        { at: 49.9, rect: { x: 8, y: 384, w: 421, h: 52 } },
        { at: 51.1, rect: { x: 8, y: 484, w: 300, h: 48 } },
      ],
    },
    { start: 52.3, screen: "screens/14.png", marks: [{ at: 52.7, rect: { x: 12, y: 795, w: 413, h: 46 } }] },
    { start: 54.6, screen: "screens/15.png", focusY: 320 },
    { start: 55.7, screen: "screens/16.png", marks: [{ at: 56.6, rect: { x: 8, y: 210, w: 421, h: 52 }, tap: false }] },
  ],

  // Правая панель: шаги по озвучке
  steps: [
    {
      start: 9.45,
      n: 1,
      title: "Откройте урок",
      blocks: [
        { kind: "text", text: "в расписании" },
        { kind: "card", meta: "3 урок   10:30 – 10:55", title: "Геометрия 8-Б", icon: "info" },
        { kind: "text", text: "и нажмите на значок урока", at: 12.3 },
      ],
    },
    {
      start: 14.5,
      n: 2,
      title: "Откройте\nкарточку урока",
      blocks: [{ kind: "button", before: "и нажмите", label: "Перейти в реестр", icon: "external", variant: "outline", at: 16.65 }],
    },
    {
      start: 19.1,
      n: 2,
      eyebrow: "Автоматически",
      title: "Данные урока",
      blocks: [
        { kind: "text", text: "подставятся сами" },
        {
          kind: "fields",
          rows: [
            { label: "Дата", value: "07.10.2026, 10:30" },
            { label: "Класс", value: "8-Б" },
            { label: "Предмет", value: "Геометрия" },
            { label: "Работа", value: "Самостоятельная" },
          ],
        },
      ],
    },
    {
      start: 22.0,
      n: 3,
      title: "Найдите ученика",
      blocks: [
        { kind: "text", text: "и нажмите" },
        { kind: "button", label: "Прикрепите файлы", variant: "link", color: "#EE6A1F", at: 22.8 },
      ],
    },
    {
      start: 25.2,
      n: 4,
      title: "Нажмите",
      blocks: [
        { kind: "button", label: "Добавить файл", icon: "plus", variant: "soft" },
        { kind: "text", text: "и выберите, как добавить работу:", at: 26.9 },
        {
          kind: "options",
          items: [
            { at: 29.1, text: "Сделать фото", icon: "camera" },
            { at: 30.4, text: "Из галереи", icon: "image" },
            { at: 31.95, text: "Из файлов", icon: "folder" },
          ],
        },
        { kind: "note", text: "не более 10 файлов · PNG, JPEG", at: 29.4 },
      ],
    },
    {
      start: 33.3,
      n: 4,
      eyebrow: "Автоматически",
      title: "Скан в реестре",
      blocks: [
        { kind: "text", text: "сразу после загрузки" },
        { kind: "card", meta: "131 кб", title: "Файл_1.jpg", icon: "image", bar: false },
      ],
    },
    {
      start: 38.15,
      n: 5,
      title: "Проверьте работу",
      blocks: [
        { kind: "text", text: "нажмите" },
        { kind: "button", label: "Перейти к проверке", icon: "pencil", variant: "primary", at: 39.4 },
      ],
    },
    {
      start: 42.05,
      n: 5,
      title: "Оставьте пометки",
      blocks: [
        { kind: "text", text: "прямо на фото" },
        { kind: "icons", items: ["pencil", "text", "rotate", "check"], activeAt: [{ at: 42.6, index: 0 }, { at: 44.3, index: 3 }] },
        { kind: "text", text: "и нажмите на галочку", at: 44.0 },
      ],
    },
    {
      start: 45.75,
      n: 6,
      title: "Нажмите на поле",
      blocks: [{ kind: "field", label: "Отметка", at: 46.9 }],
    },
    {
      start: 49.55,
      n: 6,
      title: "Выберите",
      blocks: [
        { kind: "field", label: "Форма контроля", value: "Проверочная работа" },
        { kind: "text", text: "и отметку", at: 50.6 },
        { kind: "chips", items: ["2", "3", "4", "5"], selected: "5", selectAt: 51.3, at: 50.7 },
        { kind: "button", before: "затем", label: "Сохранить", variant: "primary", at: 52.3 },
      ],
    },
    {
      start: 54.6,
      n: 6,
      done: true,
      title: "Готово!",
    },
    {
      start: 55.7,
      n: 6,
      done: true,
      eyebrow: "Автоматически",
      title: "Отметка в журнале",
      blocks: [{ kind: "flow", from: { title: "Реестр фоторабот", value: "5" }, to: { title: "Электронный журнал", value: "5" }, at: 56.2 }],
    },
  ],
};
