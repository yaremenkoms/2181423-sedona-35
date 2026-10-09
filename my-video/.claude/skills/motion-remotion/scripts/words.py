"""Пословные тайминги озвучки, выровненные по тексту пользователя.

    python3 -I words.py <папка_модели> <voice.mp3> <text.txt> > words.json

Текст пользователя — главный источник: в субтитрах будет ровно он (с запятыми, «ё», числами).
Распознавание (zipformer RU) даёт только время. Слова, которые модель не расслышала,
получают время интерполяцией между соседями пропорционально длине.
Выход: {"duration": 46.4, "words": [{"text": "Откройте", "norm": "откройте", "start": 4.8, "end": 5.3}, ...]}
"""
import difflib, json, os, re, subprocess, sys, tempfile

import numpy as np
import sherpa_onnx
import soundfile as sf

model_dir, audio, text_path = sys.argv[1], sys.argv[2], sys.argv[3]
d = os.path.join(model_dir, "sherpa-onnx-zipformer-ru-2024-09-18") + "/"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=d + "encoder.int8.onnx", decoder=d + "decoder.int8.onnx", joiner=d + "joiner.int8.onnx",
    tokens=d + "tokens.txt", num_threads=4, decoding_method="greedy_search",
)

wav = os.path.join(tempfile.mkdtemp(), "a.wav")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", audio, "-ac", "1", "-ar", "16000", wav], check=True)
a, sr = sf.read(wav, dtype="float32")
dur = len(a) / sr

def norm(w):
    w = w.lower().replace("ё", "е")
    return re.sub(r"[^\w]", "", w)

# Куски по паузам (≤ 8 с), с запасом 0.15 с слева — иначе модель теряет первое слово
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "highpass=f=150,silencedetect=noise=-32dB:d=0.18", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
cuts = [0.0] + [(s + e) / 2 for s, e in zip(st, en)] + [dur]
bounds, prev = [], 0.0
for c in sorted(set(cuts[1:])):
    if c - prev >= 0.6 or c == dur:
        bounds.append((prev, c)); prev = c

pauses = list(zip(st, en))

def speech_start(c):
    # Конец паузы, внутри которой проходит граница куска (иначе сама граница)
    for ps, pe in pauses:
        if ps - 0.01 <= c <= pe + 0.01:
            return pe
    return c

asr = []  # (norm, start)
for s, e in bounds:
    floor = speech_start(s) if s > 0 else (en[0] if pauses and st[0] < 0.05 else 0.0)
    s0 = max(0.0, s - 0.15)
    pad = np.zeros(int(0.3 * sr), dtype="float32")
    x = rec.create_stream(); x.accept_waveform(sr, np.concatenate([pad, a[int(s0 * sr):int(e * sr)], pad])); rec.decode_stream(x)
    r = x.result
    word, t0 = "", None
    for tok, ts in zip(r.tokens, r.timestamps):
        t = max(floor, s0 + ts - 0.3)
        if tok.startswith(" ") or tok.startswith("▁"):
            if word: asr.append((norm(word), t0))
            word, t0 = tok.strip(" ▁"), t
        else:
            if t0 is None: t0 = t
            word += tok
    if word: asr.append((norm(word), t0))

user = re.findall(r"\S+", open(text_path, encoding="utf-8").read())
un = [norm(w) for w in user]
an = [w for w, _ in asr]
times = [None] * len(user)
sm = difflib.SequenceMatcher(a=un, b=an, autojunk=False)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        times[blk.a + k] = asr[blk.b + k][1]
# Близкие, но не совпавшие слова (падежи, опечатки распознавания) — по похожести внутри непарных участков
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "replace":
        for i in range(i1, i2):
            best = max(range(j1, j2), key=lambda j: difflib.SequenceMatcher(a=un[i], b=an[j]).ratio())
            if difflib.SequenceMatcher(a=un[i], b=an[best]).ratio() > 0.6:
                times[i] = asr[best][1]

# Интерполяция пропусков и монотонность
known = [i for i, t in enumerate(times) if t is not None]
if not known:
    sys.exit("Не удалось сопоставить ни одного слова — проверь текст и аудио")
for i in range(len(times)):
    if times[i] is None:
        L = max([k for k in known if k < i], default=None)
        R = min([k for k in known if k > i], default=None)
        tl = times[L] if L is not None else 0.0
        tr = times[R] if R is not None else min(dur, (times[L] if L is not None else 0) + 0.4 * (i - (L or 0) + 1))
        li = L if L is not None else -1
        ri = R if R is not None else len(times)
        span = sum(len(un[k]) + 1 for k in range(li + 1, ri)) or 1
        acc = sum(len(un[k]) + 1 for k in range(li + 1, i))
        times[i] = tl + (tr - tl) * (acc + 0.5) / (span + 1)
for i in range(1, len(times)):
    times[i] = max(times[i], times[i - 1] + 0.02)

words = []
for i, w in enumerate(user):
    end = times[i + 1] if i + 1 < len(user) else min(dur, times[i] + 0.6)
    end = min(end, times[i] + 1.2)
    words.append({"text": w, "norm": un[i], "start": round(times[i], 3), "end": round(end, 3)})
matched = len(known)
print(json.dumps({"duration": round(dur, 3), "matched": f"{matched}/{len(user)}", "words": words}, ensure_ascii=False, indent=1))
