#!/usr/bin/env bash
# Voice, verify and record one narrated recap video:  tools/voice-video.sh <name> [--no-render]
# Needs tools/tts/.venv (tools/tts/setup.sh) and a finished videos/narration/<name>.json (node tools/narration-check.js <name>).
# Voices every line (cached clips are reused), checks each clip with faster-whisper and re-voices any that do not come back word for
# word (up to three rounds), then records videos/out/<name>.mp4 with the music and writes the poster videos/out/<name>-poster.png.
set -euo pipefail
cd "$(dirname "$0")/.."
name=$1
# the venv Python: tools/tts/.venv/bin/python (Linux, macOS) or tools/tts/.venv/Scripts/python (Windows), or set TTS_PYTHON yourself
if [ -z "${TTS_PYTHON:-}" ]; then
  if [ -e tools/tts/.venv/bin/python ]; then TTS_PYTHON=tools/tts/.venv/bin/python; else TTS_PYTHON=tools/tts/.venv/Scripts/python; fi
fi
export TTS_PYTHON
export FFMPEG=${FFMPEG:-$($TTS_PYTHON -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}
node tools/narration-check.js "$name" | tail -3
for round in 1 2 3; do
  node tools/narrate.js "$name"
  if $TTS_PYTHON tools/tts/verify.py "$name"; then ok=1; break; fi
  echo "round $round: some lines were deleted, voicing them again"
done
if [ "${ok:-0}" != 1 ]; then
  echo "$name: some lines did not verify after three rounds; voicing final clips and rendering anyway"
  node tools/narrate.js "$name"
fi
[ "${2:-}" = "--no-render" ] && exit 0
node tools/render-video.js "$name" --workers "${WORKERS:-4}"
node tools/video-still.js "$name" 2.2 "videos/out/.poster-$name" > /dev/null
mv "videos/out/.poster-$name/$name-t2.2.png" "videos/out/$name-poster.png"
rmdir "videos/out/.poster-$name"
echo "$name: done"
