"""Накладывает на скриншот сетку с подписями координат — чтобы точно снять rect для подсветок.

Запуск:  python3 -I grid.py <скриншот.png> <выход.png> [шаг=50]
Подписи — в пикселях исходного скриншота (ровно то, что пишется в marks[].rect).
"""
import sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
step = int(sys.argv[3]) if len(sys.argv) > 3 else 50
im = Image.open(src).convert("RGB")
d = ImageDraw.Draw(im, "RGBA")
w, h = im.size
for x in range(0, w, step):
    d.line([(x, 0), (x, h)], fill=(255, 0, 0, 90 if x % (step * 2) else 160), width=1)
    if x % (step * 2) == 0:
        d.text((x + 2, 2), str(x), fill=(255, 0, 0, 255))
for y in range(0, h, step):
    d.line([(0, y), (w, y)], fill=(255, 0, 0, 90 if y % (step * 2) else 160), width=1)
    if y % (step * 2) == 0:
        d.text((2, y + 2), str(y), fill=(255, 0, 0, 255))
im.save(dst)
print(w, h)
