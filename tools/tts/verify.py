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


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def spell(n):
    """Whisper writes numbers as digits ("28"); the script spells them ("twenty eight"). Spell digits the way the script does."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " and " + spell(n % 100))
    if n < 1_000_000:
        return spell(n // 1000) + " thousand" + ("" if n % 1000 == 0 else (" and " if n % 1000 < 100 else " ") + spell(n % 1000))
    return str(n)


def words(text):
    text = text.lower().replace("-", " ").replace("’", "'")
    text = text.replace("%", " percent ").replace("²", " squared ").replace("³", " cubed ")
    text = re.sub(r"\bper\s+cent\b", "percent", text)
    text = re.sub(r"\ba\*", "a star ", text)
    text = re.sub(r"(?<=\d),(?=\d{3})", "", text)  # 3,037 -> 3037
    text = re.sub(r"\.(\d+)", lambda m: " point " + " ".join(ONES[int(d)] for d in m.group(1)) + " ", text)
    text = re.sub(r"\b0[01]+\b", lambda m: " " + " ".join(ONES[int(d)] for d in m.group()) + " ", text)
    text = re.sub(r"\d+", lambda m: " " + spell(int(m.group())) + " ", text)
    text = re.sub(r"\ba (hundred|thousand)\b", r"one \1", text)  # "a hundred" and "100" mean the same
    text = re.sub(r"\bone hundred(?: and)? ten\b", "one one zero", text)
    text = re.sub(r"\bone hundred(?: and)? eleven\b", "one one one", text)
    return re.findall(r"[a-z']+", text)


HOMOPHONES = {
    frozenset({"tabu", "taboo", "taboo's", "tabus"}),
    frozenset({"disk", "disc"}),
    frozenset({"disks", "discs"}),
    frozenset({"faults", "false"}),
    frozenset({"fitness", "fit"}),
    frozenset({"route", "root"}),
    frozenset({"routes", "roots"}),
    frozenset({"gene", "jean"}),
    frozenset({"genes", "jeans"}),
    frozenset({"hull", "hall", "whole"}),
    frozenset({"whole", "hole"}),
    frozenset({"weight", "wait"}),
    frozenset({"weights", "waits"}),
    frozenset({"sum", "some"}),
    frozenset({"sums", "somes"}),
    frozenset({"cell", "sell"}),
    frozenset({"cells", "sells"}),
    frozenset({"piece", "peace"}),
    frozenset({"pieces", "peaces"}),
    frozenset({"pair", "pear"}),
    frozenset({"pairs", "pears"}),
    frozenset({"cache", "cash"}),
    frozenset({"clique", "click"}),
    frozenset({"two", "to", "too"}),
    frozenset({"four", "for"}),
    frozenset({"one", "won"}),
    frozenset({"eight", "ate"}),
    frozenset({"right", "write"}),
    frozenset({"rights", "writes"}),
    frozenset({"read", "red"}),
    frozenset({"reads", "reeds", "reds"}),
    frozenset({"no", "know"}),
    frozenset({"new", "knew"}),
    frozenset({"in", "and"}),
    frozenset({"length", "legs"}),
    frozenset({"mew", "mu"}),
    frozenset({"purr", "per"}),
    frozenset({"cy", "psy", "sai", "sigh"}),
    frozenset({"d", "dee"}),
    frozenset({"t", "tea", "tee"}),
    frozenset({"b", "bee"}),
    frozenset({"c", "see", "sea"}),
    frozenset({"p", "pea"}),
    frozenset({"k", "kay"}),
    frozenset({"n", "en"}),
    frozenset({"x", "ex"}),
    frozenset({"q", "queue", "cue"}),
    frozenset({"r", "are"}),
    frozenset({"u", "you"}),
}


def word_same(x, y):
    w1, w2 = x.removesuffix("'s"), y.removesuffix("'s")
    if w1 == w2 or any({x, y} <= h or {w1, w2} <= h for h in HOMOPHONES):
        return True
    return difflib.SequenceMatcher(None, w1, w2).ratio() >= 0.8


def same_sound(a, b):
    if len(a) == len(b) and all(word_same(x, y) for x, y in zip(a, b)):
        return True
    return difflib.SequenceMatcher(None, "".join(a), "".join(b)).ratio() >= 0.8


def mistakes(want, got):
    """Words the voice dropped, added or changed. A swapped stretch counts as right when the letters are nearly the same once the
    spaces are ignored (whisper hears "encodings" as "in codings"); a missing or extra word always counts."""
    n = 0
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, want, got, autojunk=False).get_opcodes():
        if op == "equal":
            continue
        a, b = want[a0:a1], got[b0:b1]
        if op == "replace" and same_sound(a, b):
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
    import librosa
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
            # decode here and hand whisper the samples: its own decoder (PyAV) breaks with some av versions (open() got an
            # unexpected keyword argument 'metadata_errors')
            audio, _ = librosa.load(path, sr=16000, mono=True)
            segs, _ = model.transcribe(audio, language="en", beam_size=5, vad_filter=False)
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
