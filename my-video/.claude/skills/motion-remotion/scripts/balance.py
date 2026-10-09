"""Баланс голоса и музыки по 4-секундным окнам (правило: голос на 5–6 дБ громче фона).

    python3 -I balance.py <voice.mp3> <music.wav> <gain_музыки_из_конфига>
"""
import subprocess, sys
import numpy as np

def pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

voice, music = pcm(sys.argv[1]), pcm(sys.argv[2]) * float(sys.argv[3])
n = min(len(voice), len(music)); win = 16000 * 4
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
bad = 0
for i in range(0, n - win // 2, win):
    v, m = db(voice[i:i + win]), db(music[i:i + win])
    d = v - m
    if v < -30:  # голоса почти нет (вступление/финал) — музыка здесь и должна звучать
        print(f"{i / 16000:5.1f}–{(i + win) / 16000:5.1f} с: без голоса, музыка {m:6.1f} дБ"); continue
    flag = "" if d >= 5 else "  ← музыка слишком громкая"
    bad += d < 5
    print(f"{i / 16000:5.1f}–{(i + win) / 16000:5.1f} с: голос {v:6.1f} дБ, музыка {m:6.1f} дБ, разница {d:5.1f}{flag}")
print("OK" if not bad else f"Окон с перегрузом: {bad} — уменьши music.gain в конфиге")
