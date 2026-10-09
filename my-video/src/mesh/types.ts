// Описание одного ролика МЭШ. Новый ролик = новый файл с объектом MeshVideoConfig
// в src/videos/ и папка с материалами в public/videos/<id>/.
// Все времена — в секундах озвучки.

export type Rect = { x: number; y: number; w: number; h: number };

export type IconName =
  | "info"
  | "pencil"
  | "text"
  | "rotate"
  | "check"
  | "emoji"
  | "camera"
  | "image"
  | "folder"
  | "file"
  | "plus"
  | "external"
  | "clock"
  | "journal"
  | "link"
  | "users"
  | "calendar"
  | "search";

// Подсветка элемента на скриншоте (координаты — в пикселях исходного скриншота)
export type Mark = {
  at: number;
  rect: Rect;
  // Касание пальцем (телефон) или клик курсором (ноутбук). По умолчанию true.
  tap?: boolean;
};

// Сцена = один скриншот на устройстве (обычно одна фраза озвучки)
export type Scene = {
  start: number;
  screen: string; // путь относительно public/videos/<id>/
  marks?: Mark[];
  // На какую часть экрана смотреть (y в пикселях скриншота). По умолчанию — центр первой подсветки.
  focusY?: number;
};

/* ── Правая панель: шаги и копии элементов интерфейса ── */

type At = { at?: number }; // когда блок появляется (по умолчанию — вместе с шагом)

export type Block =
  | ({ kind: "text"; text: string } & At) // связка: «в расписании», «и выберите, как…»
  | ({ kind: "button"; label: string; icon?: IconName; variant?: "primary" | "outline" | "soft" | "link"; before?: string; color?: string } & At)
  | ({ kind: "card"; meta?: string; title: string; icon?: IconName; bar?: boolean } & At) // карточка урока/файла
  | ({ kind: "fields"; rows: { label: string; value: string }[] } & At) // данные с галочками
  | ({ kind: "field"; label: string; value?: string } & At) // поле формы
  | ({ kind: "options"; items: { at: number; text: string; icon?: IconName }[] }) // варианты, сменяются по голосу
  | ({ kind: "chips"; items: string[]; selected?: string; selectAt?: number } & At) // оценки 2 3 4 5
  | ({ kind: "icons"; items: IconName[]; activeAt?: { at: number; index: number }[] } & At) // панель инструментов
  | ({ kind: "flow"; from: { title: string; value: string }; to: { title: string; value: string } } & At) // A → B
  | ({ kind: "fact"; top?: string; big: string; bottom?: string; icon?: IconName } & At) // крупная цифра
  | ({ kind: "note"; text: string } & At); // мелкая сноска внизу

export type Step = {
  start: number;
  // Номер шага в трекере. Несколько записей с одним n — продолжение шага (трекер не двигается).
  n: number;
  // Надпись над заголовком. По умолчанию «ШАГ n ИЗ N». Для пояснений — «АВТОМАТИЧЕСКИ» и т. п.
  eyebrow?: string;
  title: string;
  blocks?: Block[];
  // «Готово!» — все шаги в трекере отмечаются галочками
  done?: boolean;
};

export type MeshVideoConfig = {
  id: string;
  service: {
    name: string;
    color: string; // цвет сервиса — фон, трекер, подсветки
    logo: string; // путь к логотипу относительно public/videos/<id>/
  };
  // Цвет кнопок приложения для копий интерфейса (по умолчанию — цвет сервиса)
  uiColor?: string;
  device: "phone" | "laptop";
  url?: string; // адрес в строке браузера (для ноутбука)
  screenSize: { w: number; h: number }; // размер скриншотов в пикселях
  cover: string; // обложка 1920×1080
  voice: string; // озвучка (mp3)
  durationSec: number; // длина озвучки (ffprobe)
  coverEnd: number; // конец вступительной фразы — до этого момента висит обложка
  finalStart: number; // с этого момента — финал с логотипом
  scenes: Scene[];
  steps: Step[];
};
