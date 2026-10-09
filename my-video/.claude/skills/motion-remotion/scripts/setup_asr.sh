#!/usr/bin/env bash
# Модель с пословными таймингами (zipformer, русский) — один раз на контейнер. Источник — GitHub Releases.
set -euo pipefail
DIR="${1:-${TMPDIR:-/tmp}/mesh-asr}"
mkdir -p "$DIR"
if [ ! -f "$DIR/sherpa-onnx-zipformer-ru-2024-09-18/encoder.int8.onnx" ]; then
  curl -sSL -o "$DIR/z.tar.bz2" https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-zipformer-ru-2024-09-18.tar.bz2
  tar xjf "$DIR/z.tar.bz2" -C "$DIR" && rm "$DIR/z.tar.bz2"
fi
python3 -c "import sherpa_onnx, soundfile, numpy" 2>/dev/null || pip install -q sherpa-onnx soundfile numpy
echo "$DIR"
