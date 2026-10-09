"""Расшифровка озвучки по фразам с таймингами.

Режет звук по паузам (ffmpeg silencedetect), распознаёт каждую фразу Whisper small
и печатает JSON: [{"start": 9.45, "end": 12.3, "text": "..."}].

Запуск:  python3 -I transcribe.py <папка_модели> <voice.mp3> [> transcript.json]
"""
import json, re, subprocess, sys, tempfile, os

import sherpa_onnx
import soundfile as sf

model_dir, audio = sys.argv[1], sys.argv[2]
m = os.path.join(model_dir, "sherpa-onnx-whisper-small", "small-")
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=m + "encoder.int8.onnx", decoder=m + "decoder.int8.onnx", tokens=m + "tokens.txt",
    language="ru", task="transcribe", num_threads=4,
)

wav = os.path.join(tempfile.mkdtemp(), "a.wav")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", audio, "-ac", "1", "-ar", "16000", wav], check=True)
a, sr = sf.read(wav, dtype="float32")
dur = len(a) / sr

# Паузы речи. highpass убирает басы фоновой музыки.
log = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", wav, "-af", "highpass=f=200,silencedetect=noise=-30dB:d=0.25", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
pauses = list(zip(starts, ends))

cuts = [0.0] + [round((s + e) / 2, 2) for s, e in pauses] + [round(dur, 2)]
segs = []
for s, e in zip(cuts, cuts[1:]):
    if segs and e - segs[-1][0] < 1.2:  # слишком короткие куски склеиваем
        segs[-1] = (segs[-1][0], e)
    else:
        segs.append((s, e))

out = []
for s, e in segs:
    st = rec.create_stream()
    st.accept_waveform(sr, a[int(s * sr):int(e * sr)])
    rec.decode_stream(st)
    out.append({"start": s, "end": e, "text": st.result.text.strip()})

# Точное начало речи в каждом куске (конец предыдущей паузы) — по нему ставим смену экрана
for seg in out:
    speech = [e for s, e in pauses if seg["start"] - 0.01 <= e <= seg["end"]]
    seg["speech_start"] = round(speech[0], 2) if speech and speech[0] - seg["start"] < 1.0 else seg["start"]

print(json.dumps({"duration": round(dur, 3), "phrases": out}, ensure_ascii=False, indent=1))
