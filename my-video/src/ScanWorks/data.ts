// Все времена — в секундах исходного ролика. Границы шагов совпадают
// с паузами в озвучке, поэтому менять их нельзя без сдвига звука.

export type Rect = { x: number; y: number; w: number; h: number };

export type Focus = {
  start: number;
  end: number;
  // Область на экране телефона (в пикселях исходной записи экрана 437×856)
  rect: Rect;
  label: string;
};

export type Step = {
  start: number;
  end: number;
  stage: 0 | 1 | 2;
  title: string;
  hint?: string;
  // Подсказка, которая появляется позже начала шага (по озвучке)
  lateHint?: { at: number; text: string };
  focuses: Focus[];
  options?: { at: number; text: string; icon: "camera" | "image" | "folder" }[];
  done?: boolean;
  journal?: boolean;
};

export const DURATION = 61.96;
export const INTRO_END = 9.45;
export const SCREEN_VIDEO_FROM = 10.45; // до этого момента телефон в исходнике ещё «въезжает»
export const OUTRO_START = 60.3;

// Где в исходном кадре 1920×1080 находится экран телефона
export const SRC_SCREEN = { x: 717, y: 114, w: 437, h: 856 };

export const STAGES = ["Загрузка", "Проверка", "Отметка"] as const;

const ROW = (y: number, h: number): Rect => ({ x: 0, y, w: 437, h });

export const STEPS: Step[] = [
  {
    start: 9.45,
    end: 14.5,
    stage: 0,
    title: "Откройте урок\nв расписании",
    lateHint: { at: 12.3, text: "и нажмите на значок урока" },
    focuses: [
      { start: 10.5, end: 12.3, rect: ROW(360, 100), label: "Урок в расписании" },
      { start: 12.4, end: 14.5, rect: { x: 122, y: 124, w: 80, h: 62 }, label: "Значок урока" },
    ],
  },
  {
    start: 14.5,
    end: 16.65,
    stage: 0,
    title: "Откройте\nкарточку урока",
    hint: "Здесь собраны все материалы",
    focuses: [{ start: 14.9, end: 16.65, rect: ROW(80, 110), label: "Карточка урока" }],
  },
  {
    start: 16.65,
    end: 19.1,
    stage: 0,
    title: "Перейдите\nв реестр",
    hint: "Кнопка «Перейти в реестр»",
    focuses: [{ start: 16.8, end: 19.1, rect: ROW(298, 66), label: "Перейти в реестр" }],
  },
  {
    start: 19.1,
    end: 22.0,
    stage: 0,
    title: "Данные урока —\nавтоматически",
    hint: "Заполнять их повторно не нужно",
    focuses: [{ start: 19.6, end: 22.0, rect: ROW(252, 66), label: "Данные урока" }],
  },
  {
    start: 22.0,
    end: 25.2,
    stage: 0,
    title: "Найдите\nученика",
    hint: "и нажмите «Прикрепите файлы»",
    focuses: [{ start: 22.3, end: 25.2, rect: ROW(326, 62), label: "Прикрепите файлы" }],
  },
  {
    start: 25.2,
    end: 33.3,
    stage: 0,
    title: "Добавьте\nфайл",
    hint: "Выберите, как добавить работу:",
    focuses: [
      { start: 25.5, end: 29.1, rect: { x: 10, y: 446, w: 146, h: 194 }, label: "Добавить файл" },
      { start: 29.1, end: 30.4, rect: ROW(686, 52), label: "Сделать фото" },
      { start: 30.4, end: 31.95, rect: ROW(740, 54), label: "Из галереи" },
      { start: 31.95, end: 33.3, rect: ROW(794, 54), label: "Из файлов" },
    ],
    options: [
      { at: 29.1, text: "Сделать фото", icon: "camera" },
      { at: 30.4, text: "Из галереи", icon: "image" },
      { at: 31.95, text: "Из файлов", icon: "folder" },
    ],
  },
  {
    start: 33.3,
    end: 38.15,
    stage: 0,
    title: "Скан уже\nв реестре",
    hint: "Добавляется автоматически\nсразу после загрузки",
    focuses: [{ start: 33.8, end: 38.15, rect: { x: 148, y: 446, w: 154, h: 194 }, label: "Скан работы" }],
  },
  {
    start: 38.15,
    end: 42.05,
    stage: 1,
    title: "Перейдите\nк проверке",
    hint: "Кнопка «Перейти к проверке»",
    focuses: [{ start: 38.4, end: 42.05, rect: ROW(748, 60), label: "Перейти к проверке" }],
  },
  {
    start: 42.05,
    end: 45.75,
    stage: 1,
    title: "Оставьте пометки\nпрямо на фото",
    hint: "Затем нажмите на галочку ✓",
    focuses: [{ start: 42.3, end: 45.75, rect: ROW(784, 66), label: "Инструменты проверки" }],
  },
  {
    start: 45.75,
    end: 49.55,
    stage: 2,
    title: "Нажмите на поле\n«Отметка»",
    hint: "В карточке проверенной работы",
    focuses: [{ start: 46.0, end: 49.55, rect: ROW(322, 64), label: "Поле «Отметка»" }],
  },
  {
    start: 49.55,
    end: 54.6,
    stage: 2,
    title: "Выберите форму\nконтроля и отметку",
    lateHint: { at: 52.3, text: "Затем нажмите «Сохранить»" },
    focuses: [
      { start: 49.8, end: 52.3, rect: ROW(378, 206), label: "Форма контроля и отметка" },
      { start: 52.3, end: 54.6, rect: ROW(790, 54), label: "Сохранить" },
    ],
  },
  {
    start: 54.6,
    end: 55.7,
    stage: 2,
    title: "Готово!",
    hint: "Отметка выставлена",
    done: true,
    focuses: [],
  },
  {
    start: 55.7,
    end: 60.3,
    stage: 2,
    title: "Отметка попадёт\nв журнал",
    hint: "Автоматически — без лишних действий",
    journal: true,
    focuses: [{ start: 57.0, end: 60.3, rect: ROW(206, 58), label: "Отметка в реестре" }],
  },
];

// Номер шага внутри своего этапа (для бейджа «Шаг 2 из 7»)
export const stepNumberInStage = (index: number) => {
  const step = STEPS[index];
  const same = STEPS.filter((s) => s.stage === step.stage && !s.done);
  return { n: same.indexOf(step) + 1, total: same.length };
};
