"""Звук для моушен-ролика без сети: музыка и эффекты синтезируются numpy.

    python3 -I synth.py sfx   <папка>                      # библиотека эффектов (один раз)
    python3 -I synth.py music <выход.wav> <длина_с> <дроп_с> [soft] # ре минор, 120 BPM, дроп в <дроп_с>
                                                             # soft — спокойная подложка без бочки (инструкции, обучение)

Эффекты: whoosh (склейка), hit (удар на важном), pop (появление), tick (счётчик/список),
riser (нарастание перед дропом), click (интерфейс), stop (тейп-стоп перед драматической фразой).
"""
import sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)

def save(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], axis=1) if x.ndim == 1 else x
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    return e * np.exp(-np.arange(n) / SR / r)

def lowpass(x, cutoff):
    # однополюсный фильтр; cutoff может быть массивом (развёртка)
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR); y = np.zeros_like(x); p = 0.0
    for i in range(len(x)):
        p = (1 - a[i]) * x[i] + a[i] * p; y[i] = p
    return y

def noise(d): return rng.uniform(-1, 1, int(d * SR))

def sfx(out):
    d = 0.55; n = noise(d); sweep = np.concatenate([np.geomspace(300, 6000, len(n) // 2), np.geomspace(6000, 400, len(n) - len(n) // 2)])
    w = lowpass(n, sweep) * np.sin(np.linspace(0, np.pi, len(n))) ** 2
    save(f"{out}/whoosh.wav", w / np.abs(w).max() * 0.8)

    tt = t(0.9); f = 120 * np.exp(-tt * 9) + 45
    hit = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.35) + lowpass(noise(0.9), 2500) * env(len(tt), 0.001, 0.05) * 0.8
    save(f"{out}/hit.wav", hit / np.abs(hit).max() * 0.95)

    tt = t(0.18); f = 900 * np.exp(-tt * 18) + 500
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.05)
    save(f"{out}/pop.wav", pop * 0.7)

    tt = t(0.06); tick = np.sin(2 * np.pi * 2400 * tt) * env(len(tt), 0.0005, 0.012)
    save(f"{out}/tick.wav", tick * 0.6)

    tt = t(0.05); click = (np.sin(2 * np.pi * 1600 * tt) * 0.6 + noise(0.05) * 0.4) * env(len(tt), 0.0005, 0.008)
    save(f"{out}/click.wav", click * 0.7)

    d = 2.0; tt = t(d); f = np.geomspace(200, 2400, len(tt))
    riser = (lowpass(noise(d), np.geomspace(400, 9000, len(tt))) * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25) * np.linspace(0, 1, len(tt)) ** 2
    save(f"{out}/riser.wav", riser / np.abs(riser).max() * 0.8)

    d = 0.7; tt = t(d); f = 220 * (1 - tt / d) ** 2 + 20
    stop = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 * (1 - tt / d)
    save(f"{out}/stop.wav", lowpass(stop, 1800))

def music(out, length, drop, soft=False):
    bpm = 120; beat = 60 / bpm; n = int(length * SR)
    mix = np.zeros((n, 2))
    def add(x, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0: x, i = x[-i:], 0
        j = min(n, i + len(x))
        if i >= n or j <= i: return
        mix[i:j, 0] += x[: j - i] * gain * (1 - max(0, pan))
        mix[i:j, 1] += x[: j - i] * gain * (1 + min(0, pan))
    nf = lambda m: 440 * 2 ** ((m - 69) / 12)
    # D минор: Dm – Bb – F – C, по такту (4 доли)
    prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (41, [57, 60, 65]), (48, [55, 60, 64])]
    tt_k = t(0.4); kick = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt_k * 30)) / SR) * env(len(tt_k), 0.001, 0.18)
    hat = lowpass(noise(0.05), 9000); hat = (noise(0.05) - hat) * env(len(hat), 0.0005, 0.015)
    clap = lowpass(noise(0.2), 3000) * env(int(0.2 * SR), 0.001, 0.06)
    # сетка от дропа: доля дропа = 0
    first = drop - np.ceil(drop / beat) * beat
    b = 0; at = first
    while at < length:
        bar = int(np.floor(b / 4)); root, chord = prog[bar % 4]; after = at >= drop - 1e-6
        if b % 4 == 0:
            d = beat * 4; tt = t(d)
            pad = sum(np.sin(2 * np.pi * nf(m) * tt + np.sin(2 * np.pi * 0.3 * tt)) for m in chord) / 3
            pad *= np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 0.4)
            add(lowpass(pad, 1400 if after else 700), at, 0.10 if after else 0.08)
        if soft and after:
            # спокойный вариант: арпеджио по аккорду восьмыми, длинный бас, редкий хэт
            for k in range(2):
                m = chord[(b * 2 + k) % 3] + 12
                tt = t(beat * 0.5); pl = np.sin(2 * np.pi * nf(m) * tt) * env(len(tt), 0.004, 0.18)
                add(lowpass(pl, 2500), at + k * beat * 0.5, 0.07, 0.25 if k else -0.25)
            if b % 4 == 0:
                tt = t(beat * 3.8); bass = np.sin(2 * np.pi * nf(root - 12) * tt) * np.minimum(1, tt / 0.05) * np.exp(-tt / 3)
                add(lowpass(bass, 400), at, 0.22)
            if b % 2 == 1: add(hat, at + 0.5 * beat, 0.03, -0.3)
        elif after:
            add(kick, at, 0.55)
            if b % 2 == 1: add(clap, at, 0.18, 0.1)
            for h in (0, 0.5):
                add(hat, at + h * beat, 0.10 if h else 0.06, -0.3)
            tt = t(beat * 0.9); bass = np.sin(2 * np.pi * nf(root - 12) * tt); bass = np.tanh(bass * 2) * env(len(tt), 0.005, 0.25)
            add(lowpass(bass, 600), at, 0.32)
        else:
            if b % 2 == 0: add(hat, at, 0.05, -0.3)
        b += 1; at = first + b * beat
    # затухание в конце
    fade = int(min(2.5, length / 4) * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mix /= max(1e-9, np.abs(mix).max()); mix *= 0.8
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())

if sys.argv[1] == "sfx":
    sfx(sys.argv[2])
else:
    music(sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), len(sys.argv) > 5 and sys.argv[5] == "soft")
