"""Check every voiced line of a narrated video with faster-whisper (CPU, small.en):  python tools/tts/verify.py <name>

Reads videos/narration/<name>.json (the spoken lines) and videos/audio/<name>.json (the clip files tools/narrate.js made), transcribes
each clip and compares it with the spoken text word for word (case, punctuation and hyphens ignored). A clip that does not match well
enough is deleted, so the next `node tools/narrate.js <name>` voices that line again; the exit code is 1 when any clip failed.
A line passes when no word was dropped, added or changed (one slip is allowed on a line of 25 words or more); whisper's own
mishearings of rare words are forgiven when the letters are nearly the same (see mistakes()).
"""

import difflib
import json
import os
import re
import sys

os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def words(text):
    text = text.lower().replace("-", " ").replace("’", "'")
    return re.findall(r"[a-z']+", text)


def mistakes(want, got):
    """Words the voice dropped, added or changed. A swapped stretch counts as right when the letters are nearly the same once the
    spaces are ignored (whisper hears "encodings" as "in codings"); a missing or extra word always counts."""
    n = 0
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, want, got, autojunk=False).get_opcodes():
        if op == "equal":
            continue
        a, b = want[a0:a1], got[b0:b1]
        if op == "replace" and difflib.SequenceMatcher(None, "".join(a), "".join(b)).ratio() >= 0.8:
            continue
        n += max(len(a), len(b))
    return n


def spoken(line):
    if isinstance(line, str):
        return line
    if isinstance(line, list):
        return line[0]
    return line["say"]


def main():
    name = sys.argv[1]
    script = json.load(open(os.path.join(ROOT, "videos", "narration", name + ".json"), encoding="utf8"))
    timing = json.load(open(os.path.join(ROOT, "videos", "audio", name + ".json"), encoding="utf8"))
    if timing.get("fake"):
        print("the timing file was made with the fake engine: nothing to verify")
        return 0
    from faster_whisper import WhisperModel

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    bad = 0
    total = 0
    for i, (sc, tm) in enumerate(zip(script["scenes"], timing["scenes"])):
        for j, (line, clip) in enumerate(zip(sc["lines"], tm["clips"])):
            path = clip["file"] if os.path.isabs(clip["file"]) else os.path.join(ROOT, clip["file"])
            if not os.path.exists(path):
                continue
            want = words(spoken(line))
            segs, _ = model.transcribe(path, language="en", beam_size=5, vad_filter=False)
            got = words(" ".join(s.text for s in segs))
            errors = mistakes(want, got)
            total += 1
            if errors > (1 if len(want) >= 25 else 0):
                bad += 1
                os.remove(path)
                print(f"scene {i} line {j + 1}: {errors} wrong\n{' ' * 4}wanted: {' '.join(want)}\n{' ' * 4}heard:  {' '.join(got)}")
    print(f"{name}: {total - bad}/{total} lines verified" + (f", {bad} deleted for re-voicing" if bad else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
