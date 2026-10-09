import math, subprocess, sys, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = "/tmp/claude-0/-home-user-2181423-sedona-35/250f4e6a-5f59-59c8-aaeb-29836f811fdc"
AUDIO = sys.argv[1]
OUT = sys.argv[2]
ONLY = [float(x) for x in sys.argv[3:]]  # preview times

W, H, FPS = 1080, 1920, 30
DUR = 41.72
BG = (17, 21, 34)
AMBER = (245, 183, 60)
WHITE = (255, 255, 255)
RED = (235, 87, 87)
FD = "/usr/share/fonts/opentype/inter/"
F_HEAD = ImageFont.truetype(FD + "InterDisplay-ExtraBold.otf", 78)
F_CHIP = ImageFont.truetype(FD + "InterDisplay-Bold.otf", 58)
F_SMALL = ImageFont.truetype(FD + "InterDisplay-SemiBold.otf", 38)
F_CTA = ImageFont.truetype(FD + "InterDisplay-Black.otf", 150)
F_CTA2 = ImageFont.truetype(FD + "InterDisplay-ExtraBold.otf", 64)

IMGS = {i: Image.open(f"{BASE}/images/{i}.png").convert("RGB") for i in (1, 2, 3, 4)}

def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

def back(x):  # ease-out-back
    x = max(0.0, min(1.0, x)); c = 1.4
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def lerp(a, b, k):
    return a + (b - a) * k

# ---------- background ----------
bg = Image.new("RGB", (W, H), BG)
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((-300, 900, 900, 2200), fill=(70, 50, 20))
gd.ellipse((500, -300, 1500, 700), fill=(30, 40, 80))
glow = glow.filter(ImageFilter.GaussianBlur(220))
bg = Image.blend(bg, Image.eval(glow, lambda v: v), 0.0)
bg = Image.fromarray(__import__("numpy").clip(
    __import__("numpy").asarray(bg, dtype="int16") + __import__("numpy").asarray(glow, dtype="int16"), 0, 255).astype("uint8"))
bd = ImageDraw.Draw(bg)
# brand pill
pill = "Tutor Planner"
tw = bd.textlength(pill, font=F_SMALL)
bd.rounded_rectangle((W / 2 - tw / 2 - 28, 150, W / 2 + tw / 2 + 28, 212), 31, outline=(90, 96, 120), width=2)
bd.text((W / 2, 181), pill, font=F_SMALL, fill=(200, 205, 220), anchor="mm")

# ---------- headline text ----------
PHRASES = [
    (0.00, 2.00, "Понедельник, *девять утра*"),
    (2.00, 5.10, "Одна вкладка — и я знаю, *кто мне должен*"),
    (5.10, 6.50, "Вот мой *дашборд*"),
    (6.50, 9.10, "Кто заплатил *на этой неделе* — здесь"),
    (9.10, 11.05, "Кто должен — *сразу видно*"),
    (11.05, 12.90, "Листать *ничего не надо*"),
    (12.90, 15.60, "Все уроки недели *в одном месте*"),
    (15.60, 19.55, "Домашка — в карточке ученика, *не теряется в чатах*"),
    (19.55, 21.80, "И всё *связано* друг с другом"),
    (21.80, 26.45, "Раньше всё это было в голове, в заметках и *в трёх таблицах*"),
    (26.45, 29.45, "Теперь — *одна вкладка.* И всё."),
    (29.45, 31.45, "Я сделала этот планер *сама*"),
    (31.45, 35.85, "Для себя и репетиторов, которым надоело *держать всё в голове*"),
    (35.85, 37.05, "Хотите *так же?*"),
    (37.05, 39.15, "Пишите *«ХОЧУ»* в комментариях"),
    (39.15, DUR + 1, "Пришлю доступ *на 2 недели бесплатно*"),
]

def render_rich(text, font, maxw, line_h):
    words = []
    hl = False
    for tok in re.split(r"(\*)", text):
        if tok == "*":
            hl = not hl; continue
        if hl and tok.strip():
            words.append((tok.strip(), True))
        else:
            for w in tok.split():
                words.append((w, hl))
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    sp = d.textlength(" ", font=font)
    lines, cur, curw = [], [], 0
    for w, h in words:
        ww = d.textlength(w, font=font)
        if cur and curw + sp + ww > maxw:
            lines.append((cur, curw)); cur, curw = [], 0
        curw = curw + (sp if cur else 0) + ww
        cur.append((w, h, ww))
    if cur: lines.append((cur, curw))
    img = Image.new("RGBA", (maxw + 40, line_h * len(lines) + 30), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    for i, (ln, lw) in enumerate(lines):
        x = (img.width - lw) / 2
        for w, h, ww in ln:
            dr.text((x, 10 + i * line_h), w, font=font, fill=AMBER if h else WHITE)
            x += ww + sp
    sh = img.copy()
    alpha = sh.split()[3].filter(ImageFilter.GaussianBlur(10))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0)); shadow.putalpha(alpha.point(lambda v: v * 0.7))
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.alpha_composite(shadow, (0, 4)); out.alpha_composite(img)
    return out

PH_IMG = [render_rich(t, F_HEAD, 960, 92) for _, _, t in PHRASES]
HEAD_CY = 380  # center of headline block

def draw_headline(frame, t):
    for (t0, t1, _), im in zip(PHRASES, PH_IMG):
        if t0 <= t < t1:
            k = 1.0 if t0 == 0 else ease((t - t0) / 0.18)
            s = 1.0 if t0 == 0 else 0.9 + 0.1 * back((t - t0) / 0.28)
            im2 = im if abs(s - 1) < 1e-3 else im.resize((int(im.width * s), int(im.height * s)), Image.BICUBIC)
            if k < 1:
                a = im2.split()[3].point(lambda v: int(v * k)); im2 = im2.copy(); im2.putalpha(a)
            frame.alpha_composite(im2, (int(W / 2 - im2.width / 2), int(HEAD_CY - im2.height / 2)))

# ---------- card (screen) ----------
CW, CH = 860, 1040
CX, CY = W // 2, 550 + CH // 2
RAD = 46
mask_cache = {}
def rmask(w, h, r):
    key = (w, h, r)
    if key not in mask_cache:
        m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
        mask_cache[key] = m
    return mask_cache[key]

# shots: (t_start, img, (cx, cy, w), drift_zoom, highlight box or None)
SHOTS = [
    (0.00, 4, (251, 330, 502), 0.93, None),
    (5.10, 4, (251, 304, 502), 1.0, None),
    (6.50, 4, (366, 200, 300), 0.95, (255, 92, 480, 272)),
    (9.10, 4, (251, 690, 502), 0.95, (18, 668, 484, 718)),
    (11.05, 4, (251, 520, 502), 0.97, None),
    (12.90, 3, (251, 300, 480), 0.95, (8, 170, 492, 398)),
    (15.60, 3, (251, 760, 480), 0.95, (8, 574, 492, 870)),
    (19.55, 2, (251, 560, 470), 0.95, (20, 425, 490, 662)),
    (21.80, None, None, 1, None),
    (26.45, 4, (251, 304, 502), 0.92, None),
    (29.45, 3, (251, 120, 470), 0.97, (8, 78, 492, 162)),
    (31.45, 1, (251, 760, 470), 0.94, (8, 655, 492, 830)),
    (35.85, None, None, 1, None),
    (DUR + 5, None, None, 1, None),
]

def shot_at(t):
    for i in range(len(SHOTS) - 1):
        if SHOTS[i][0] <= t < SHOTS[i + 1][0]:
            return i
    return len(SHOTS) - 2

def view_of(i, t):
    t0, img, v, dz, _ = SHOTS[i]
    t1 = SHOTS[i + 1][0]
    prev = SHOTS[i - 1] if i > 0 else None
    cx, cy, w = v
    p = (t - t0) / max(0.01, t1 - t0)
    w = w * lerp(1, dz, p)
    if prev and prev[1] == img and prev[2]:
        k = ease((t - t0) / 0.7)
        pv = prev[2]
        pw = pv[2] * prev[3]
        cx, cy, w = lerp(pv[0], cx, k), lerp(pv[1], cy, k), lerp(pw, w, k)
    return cx, cy, w

def render_view(img_id, cx, cy, w):
    src = IMGS[img_id]
    h = w * CH / CW
    cx = min(max(cx, w / 2), src.width - w / 2) if w <= src.width else src.width / 2
    cy = min(max(cy, h / 2), src.height - h / 2)
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    out = src.resize((CW, CH), Image.LANCZOS, box=box)
    out = out.filter(ImageFilter.UnsharpMask(1.6, 70, 2))
    if box[0] < 0 or box[2] > src.width:  # fill outside with page color
        pass
    return out, box

def card_content(t):
    i = shot_at(t)
    t0, img, v, dz, hlb = SHOTS[i]
    if img is None:
        return None, None
    cx, cy, w = view_of(i, t)
    out, box = render_view(img, cx, cy, w)
    # crossfade from previous different image
    prev = SHOTS[i - 1] if i > 0 else None
    if prev and prev[1] not in (None, img) and t - t0 < 0.35:
        pcx, pcy, pw = view_of(i - 1, t0 - 0.001)
        pimg, _ = render_view(prev[1], pcx, pcy, pw)
        k = ease((t - t0) / 0.35)
        out = Image.blend(pimg, out, k)
        # slight slide
    if hlb:
        k = ease((t - t0 - 0.55) / 0.25)
        if k > 0:
            sx = CW / (box[2] - box[0]); sy = CH / (box[3] - box[1])
            x0 = (hlb[0] - box[0]) * sx; y0 = (hlb[1] - box[1]) * sy
            x1 = (hlb[2] - box[0]) * sx; y1 = (hlb[3] - box[1]) * sy
            pulse = 1 + 0.5 * (0.5 + 0.5 * math.sin((t - t0) * 6))
            ov = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
            od = ImageDraw.Draw(ov)
            # dim outside
            dim = Image.new("RGBA", (CW, CH), (10, 14, 28, int(110 * k)))
            hole = Image.new("L", (CW, CH), 255)
            ImageDraw.Draw(hole).rounded_rectangle((x0 - 6, y0 - 6, x1 + 6, y1 + 6), 22, fill=0)
            dim.putalpha(Image.eval(hole, lambda v: int(v / 255 * 110 * k)))
            od.rounded_rectangle((x0 - 8, y0 - 8, x1 + 8, y1 + 8), 24, outline=AMBER + (int(255 * k),), width=int(6 * pulse))
            out = out.convert("RGBA"); out.alpha_composite(dim); out.alpha_composite(ov); out = out.convert("RGB")
    return out, i

def card_state(t):
    """scale, alpha, yoffset for card"""
    s, a, dy = 1.0, 1.0, 0
    # intro
    s = min(s, 0.97 + 0.03 * ease(t / 1.5))
    # exit before chaos scene, return after
    for (ta, tb) in ((21.80, 26.45), (35.85, 99)):
        if ta - 0.0 <= t < tb:
            k = ease((t - ta) / 0.35); a = min(a, 1 - k); s = min(s, 1 - 0.12 * k); dy = 80 * k
        if tb <= t < tb + 0.5:
            k = back((t - tb) / 0.45); a = min(a, ease((t - tb) / 0.25)); s = min(s, 0.85 + 0.15 * k)
    return s, a, dy

last_card = [None, None]
def draw_card(frame, t):
    s, a, dy = card_state(t)
    if a <= 0.01:
        return
    content, i = card_content(t)
    if content is None:
        content = last_card[0]
    else:
        last_card[0] = content
    if content is None:
        return
    cw, ch = int(CW * s), int(CH * s)
    c = content if (cw, ch) == (CW, CH) else content.resize((cw, ch), Image.BICUBIC)
    x, y = CX - cw // 2, int(CY - ch // 2 + dy)
    # shadow + border
    sh = Image.new("RGBA", (cw + 120, ch + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((60, 75, cw + 60, ch + 75), RAD, fill=(0, 0, 0, int(160 * a)))
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    frame.alpha_composite(sh, (x - 60, y - 60))
    border = Image.new("RGBA", (cw + 16, ch + 16), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle((0, 0, cw + 15, ch + 15), RAD + 8, fill=(255, 255, 255, int(40 * a)))
    frame.alpha_composite(border, (x - 8, y - 8))
    m = rmask(cw, ch, int(RAD * s))
    if a < 1:
        m = m.point(lambda v: int(v * a))
    layer = c.convert("RGBA"); layer.putalpha(m)
    frame.alpha_composite(layer, (x, y))

# ---------- chaos scene ----------
CHIPS = [
    (22.30, "в голове", (300, 760), -6, (88, 70, 160)),
    (23.20, "заметки", (760, 900), 5, (52, 120, 110)),
    (24.20, "таблица №1", (330, 1080), 4, (40, 110, 70)),
    (24.75, "таблица №2", (720, 1230), -5, (40, 110, 70)),
    (25.30, "таблица №3", (380, 1400), 3, (40, 110, 70)),
    (23.70, "чаты", (790, 640), -4, (60, 90, 150)),
]
chip_cache = {}
def chip_img(text, color):
    if text not in chip_cache:
        d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        tw = d.textlength(text, font=F_CHIP)
        im = Image.new("RGBA", (int(tw) + 110, 130), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle((10, 10, im.width - 10, 120), 34, fill=color + (255,), outline=(255, 255, 255, 60), width=3)
        dr.text((im.width / 2, 65), text, font=F_CHIP, fill=WHITE, anchor="mm")
        chip_cache[text] = im
    return chip_cache[text]

def draw_chaos(frame, t):
    if not (21.9 <= t < 26.45):
        return
    out_k = ease((t - 26.05) / 0.38)
    strike_k = ease((t - 25.6) / 0.35)
    for t0, text, (x, y), rot, col in CHIPS:
        if t < t0: continue
        k = back((t - t0) / 0.35)
        a = ease((t - t0) / 0.2) * (1 - out_k)
        if a <= 0: continue
        im = chip_img(text, col)
        wob = rot + 2.5 * math.sin((t - t0) * 2.2 + x)
        s = max(0.05, 0.6 + 0.4 * k) * (1 - 0.3 * out_k)
        im2 = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BICUBIC)
        if strike_k > 0:
            im2 = im2.copy(); dr = ImageDraw.Draw(im2)
            dr.line((14 * s, im2.height / 2, 14 * s + (im2.width - 28 * s) * strike_k, im2.height / 2), fill=RED + (255,), width=max(2, int(9 * s)))
        im2 = im2.rotate(wob, resample=Image.BICUBIC, expand=True)
        if a < 1:
            al = im2.split()[3].point(lambda v: int(v * a)); im2.putalpha(al)
        dx = (x - W / 2) * 0.5 * out_k; dyy = (y - 1050) * 0.5 * out_k
        frame.alpha_composite(im2, (int(x - dx - im2.width / 2), int(y - dyy - im2.height / 2)))

# ---------- CTA ----------
def draw_cta(frame, t):
    if t < 36.0:
        return
    # comment bubble with ХОЧУ
    k = back((t - 37.15) / 0.45); a = ease((t - 37.15) / 0.2)
    if a > 0:
        bw, bh = 760, 300
        im = Image.new("RGBA", (bw + 40, bh + 80), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle((20, 20, bw + 20, bh + 20), 60, fill=(255, 255, 255, 255))
        dr.polygon(((120, bh + 10), (110, bh + 75), (190, bh + 15)), fill=(255, 255, 255, 255))
        dr.text((bw / 2 + 20, bh / 2 + 20), "ХОЧУ", font=F_CTA, fill=(20, 24, 38), anchor="mm")
        s = 0.5 + 0.5 * k
        im = im.resize((int(im.width * s), int(im.height * s)), Image.BICUBIC)
        if a < 1:
            im.putalpha(im.split()[3].point(lambda v: int(v * a)))
        frame.alpha_composite(im, (int(W / 2 - im.width / 2), int(900 - im.height / 2)))
    # badge
    k = back((t - 39.3) / 0.45); a = ease((t - 39.3) / 0.2)
    if a > 0:
        txt = "14 дней бесплатно"
        d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        tw = d.textlength(txt, font=F_CTA2)
        im = Image.new("RGBA", (int(tw) + 120, 150), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle((0, 0, im.width - 1, 149), 75, fill=AMBER + (255,))
        dr.text((im.width / 2, 75), txt, font=F_CTA2, fill=(20, 24, 38), anchor="mm")
        s = 0.5 + 0.5 * k
        im = im.resize((int(im.width * s), int(im.height * s)), Image.BICUBIC)
        im = im.rotate(-3, resample=Image.BICUBIC, expand=True)
        if a < 1:
            im.putalpha(im.split()[3].point(lambda v: int(v * a)))
        frame.alpha_composite(im, (int(W / 2 - im.width / 2), int(1250 - im.height / 2)))
    # hint arrow text
    a = ease((t - 36.1) / 0.3)
    if a > 0 and t < 37.15 + 0.1:
        pass

def progress(frame, t):
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle((90, 112, 990, 118), 3, fill=(255, 255, 255, 40))
    d.rounded_rectangle((90, 112, 90 + 900 * min(1, t / DUR), 118), 3, fill=AMBER + (220,))

def frame_at(t):
    f = bg.convert("RGBA")
    draw_card(f, t)
    draw_chaos(f, t)
    draw_cta(f, t)
    draw_headline(f, t)
    progress(f, t)
    return f.convert("RGB")

if ONLY:
    for tt in ONLY:
        frame_at(tt).save(f"{BASE}/scratchpad/prev_{tt:05.2f}.png")
    sys.exit()

n = int(DUR * FPS)
p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                      "-i", "-", "-i", AUDIO, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                      "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for i in range(n):
    p.stdin.write(frame_at(i / FPS).tobytes())
    if i % 150 == 0: print(i, n, flush=True)
p.stdin.close(); p.wait()
print("done", p.returncode)
