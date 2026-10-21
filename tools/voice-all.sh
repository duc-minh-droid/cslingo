#!/usr/bin/env bash
# Voice and record several narrated videos one after another:  tools/voice-all.sh <name> [<name> ...]
# Skips a video that is already narrated (its videos/audio/<name>.json is not the fake engine's and videos/out/<name>.mp4 is newer),
# keeps going when one fails, and prints a summary. Run it in the background (nohup) and commit the results as they appear.
# Example:  nohup tools/voice-all.sh lecture-1 lecture-2 ds-1 algo-1 > voice-all.log 2>&1 &
cd "$(dirname "$0")/.."
failed=()
for n in "$@"; do
  a=videos/audio/$n.json
  if [ -f "$a" ] && ! grep -q '"fake": true' "$a" && [ "videos/out/$n.mp4" -nt "$a" ]; then
    echo "== $n: already narrated, skipping"
    continue
  fi
  echo "== $n: $(date '+%H:%M')"
  tools/voice-video.sh "$n" || failed+=("$n")
done
echo "== finished $(date '+%H:%M'); failed: ${failed[*]:-none}"
