#!/usr/bin/env bash
# Ставит распознавание речи (Whisper small через sherpa-onnx) — один раз на контейнер.
# Модель берётся с GitHub Releases: huggingface в облачных контейнерах обычно закрыт.
set -euo pipefail
DIR="${1:-${TMPDIR:-/tmp}/mesh-asr}"
mkdir -p "$DIR"
if [ ! -f "$DIR/sherpa-onnx-whisper-small/small-encoder.int8.onnx" ]; then
  curl -sSL -o "$DIR/w.tar.bz2" https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
  tar xjf "$DIR/w.tar.bz2" -C "$DIR" && rm "$DIR/w.tar.bz2"
fi
python3 -c "import sherpa_onnx, soundfile" 2>/dev/null || pip install -q sherpa-onnx soundfile
echo "$DIR"
