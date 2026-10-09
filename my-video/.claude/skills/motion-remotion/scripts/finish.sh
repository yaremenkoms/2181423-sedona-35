#!/usr/bin/env bash
# Нормализация громкости готового ролика до −14 LUFS (стандарт соцсетей). Видео не перекодируется.
#   bash finish.sh out/raw.mp4 out/final.mp4
set -euo pipefail
ffmpeg -v error -y -i "$1" -map 0:v -map 0:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$2"
ffmpeg -hide_banner -i "$2" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
