"""Beat times of a music track, for cutting the recap videos on the beat:

    python tools/tts/beats.py videos/music/<track>.mp3 [--start 12.0] [--length 240]

Writes videos/music/<track>.beats.json: {"tempo": bpm, "start": s, "beats": [s, ...], "downbeats": [s, ...]}, times counted from
--start (the point of the track the video begins at), so tools/narrate.js can stretch each scene to end on the next beat.
Needs librosa (pip install librosa, in the TTS venv: tools/tts/README.md).
"""

import argparse
import json
from pathlib import Path

import librosa
import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("track")
    ap.add_argument("--start", type=float, default=0.0, help="seconds into the track where the video starts")
    ap.add_argument("--length", type=float, default=None, help="only analyse this many seconds")
    a = ap.parse_args()
    y, sr = librosa.load(a.track, sr=22050, offset=a.start, duration=a.length)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beats = librosa.frames_to_time(frames, sr=sr).tolist()
    tempo = float(np.atleast_1d(tempo)[0])  # newer librosa returns an array
    out = Path(a.track).with_suffix(".beats.json")
    out.write_text(
        json.dumps(
            {
                "tempo": round(tempo, 1),
                "start": a.start,
                "beats": [round(b, 3) for b in beats],
                "downbeats": [round(b, 3) for b in beats[::4]],
            }
        )
    )
    print(f"{out}: {len(beats)} beats at {tempo:.1f} bpm")


if __name__ == "__main__":
    main()
