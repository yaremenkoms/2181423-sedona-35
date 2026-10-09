// Описание одного ролика МЭШ. Новый ролик = новый файл с объектом MeshVideoConfig
// в src/videos/ и папка с материалами в public/videos/<id>/.
// Все времена — в секундах озвучки.

export type Rect = { x: number; y: number; w: number; h: number };

// Подсветка элемента на скриншоте (координаты — в пикселях исходного скриншота)
export type Mark = {
  at: number;
  rect: Rect;
  // Показать касание пальцем (телефон) или клик курсором (ноутбук). По умолчанию true.
  tap?: boolean;
};

// Что показать рядом с устройством. Только когда об этом говорит диктор.
export type Side =
  | {
      type: "fact";
      icon?: "clock" | "photo" | "file" | "check" | "journal" | "link" | "users" | "calendar";
      top?: string; // маленькая подпись сверху, капсом
      big: string; // главное: цифра или 1–2 слова
      bottom?: string; // пояснение снизу
      at?: number; // когда появиться (по умолчанию — начало сцены)
    }
  | {
      type: "image"; // иллюстрация от команды (PNG с прозрачностью)
      src: string;
      width?: number;
      at?: number;
    };

export type Scene = {
  start: number;
  // Путь к скриншоту относительно public/videos/<id>/
  screen: string;
  marks?: Mark[];
  side?: Side;
  // Лёгкий 3D-наклон устройства — для динамики, не чаще раза в 3–4 сцены
  tilt?: boolean;
  // Ноутбук: приблизить камеру к области скриншота
  zoom?: { rect: Rect; scale: number };
};

export type MeshVideoConfig = {
  id: string;
  service: {
    name: string;
    color: string; // основной цвет сервиса — фон, подсветки, инфографика
    logo: string; // путь к логотипу относительно public/videos/<id>/
  };
  device: "phone" | "laptop";
  url?: string; // адрес в строке браузера (для ноутбука)
  screenSize: { w: number; h: number }; // размер скриншотов в пикселях
  cover: string; // обложка 1920×1080
  voice: string; // озвучка (mp3)
  durationSec: number; // длина озвучки (ffprobe)
  coverEnd: number; // конец вступительной фразы — до этого момента висит обложка
  finalStart: number; // с этого момента — финал с логотипом
  scenes: Scene[];
};
