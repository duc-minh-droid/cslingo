# TODO

## Recap videos: narrate every video exactly like the example clip

Added 2026-10-20. The pipeline is built and the example clip is approved by the owner ("perfect"); the remaining job is to do the
same to every video.

### Phases and progress (updated as work is done)

Work in this order; each phase ends with something that runs and is committed.

1. **Phase 0, ship the silent videos.** Lecture 6 and 7 Data Science videos, the lesson fixes and the 28 px kicker go live first.
   _Status: done, lecture 7 and the fixes are live on both sites (PR #69)._
2. **Phase 1, voice pipeline ready.** Done: `tools/narration-skeleton.js` (a script per video with the whole recipe and one line per
   caption), `tools/narration-check.js` (line counts, symbols, estimated length), `tools/tts/verify.py` (faster-whisper word-for-word
   check, deletes bad clips), `tools/voice-video.sh <name>` (narrate, verify up to three rounds, record, poster), the title-card pill
   moved so a voice-over caption cannot overlap it. Done: the CPU TTS environment is installed in `tools/tts/.venv` and the models are cached. Speed test on this 4-CPU machine
   (no GPU): about 13 s of speech in 130 s, roughly ten times slower than real time.
3. **Phase 2, write the narration scripts** for all 25 videos (4 agents: `lecture-1..8`, `algo-1..5`, `algo-6..10`, `ds-1..7`;
   brief in `videos/_plan/NARRATION_TASK.md`). _Status: done, all 25 scripts pass `tools/narration-check.js` with no warnings
   (3.3 to 5.0 minutes each when narrated; `lecture-6` and `algo-5` have four recap rows, so do not regenerate their scripts)._
4. **Phase 3, voice and record every video.** _Done 2026-10-22: Thomas ran `tools/voice-all.sh` on the RTX 4060 machine and pushed all
   25 narrated videos (2:55 to 4:34 each, voice, music, no progress bar, no caption on the recap card)._
5. **Phase 4, review and ship.** _Done: `node tools/narrated-minutes.js --write` put the lengths into the three `videos.js` manifests, so the app
   calls every video narrated; full check, PR and merge follow the commit that added this line. Still to do by ear: listen to the flagged
   words below, and re-voice anything that sounds wrong._

### Re-voicing a video, or voicing a new one (on the machine with the RTX 4060)

Everything is on the branch `main-hcicsk` and in `main` once merged (all 25 narration scripts, the tools, the fixed title cards). From the repo root, in
**Git Bash** (or any bash; the scripts find `tools/tts/.venv/Scripts/python` on Windows by themselves, or set `TTS_PYTHON`):

```bash
git fetch origin && git checkout main-hcicsk && git pull
# once: the packages the checker and the renderer need (PyTorch with CUDA is already in the venv; if not: tools/tts/README.md)
tools/tts/.venv/Scripts/python -m pip install -r tools/tts/requirements.txt     # faster-whisper, imageio-ffmpeg, qwen-tts ...
npm install && npx playwright install chromium                                  # the recorder needs Chromium

# one video first, then listen to it and look at it (lecture-1 is the approved example: compare with videos/out/lecture-1-test.mp4)
tools/voice-video.sh lecture-1

# the rest, one after another (finished videos are skipped, so you can stop and restart it any time)
tools/voice-all.sh lecture-1 lecture-2 lecture-3 lecture-4 lecture-6 lecture-7 lecture-8 \
  ds-1 ds-2 ds-3 ds-4 ds-5 ds-6 ds-7 \
  algo-1 algo-2 algo-3 algo-4 algo-5 algo-6 algo-7 algo-8 algo-9 algo-10 2>&1 | tee voice-all.log
```

What `tools/voice-video.sh <name>` does: checks the script, voices every line with the cloned narrator (`tools/narrate.js`), checks each clip with
faster-whisper (`tools/tts/verify.py`) and re-voices any that do not come back word for word (up to three rounds), then records
`videos/out/<name>.mp4` with the music and writes `videos/out/<name>-poster.png`. Clips are cached in `videos/audio/clips/` (git-ignored), so an
interrupted run resumes. Expect roughly 5 to 10 minutes of recording per video (`WORKERS=8 tools/voice-all.sh ...` uses more CPU cores for it) plus
the voice; the GPU speed has not been measured, the CPU here needed about 15 to 40 minutes per video.

When a few videos are finished (and each time you want to save progress):

```bash
node tools/narrated-minutes.js --write          # lists the narrated videos and puts their lengths into js/content/{nic,ds,algo}/videos.js
npx prettier --write js/content/nic/videos.js js/content/ds/videos.js js/content/algo/videos.js
npm run check                                   # lint, format, the whole suite (about 12 minutes)
git add -A && git commit -m "Narrated videos: <names>" && git push
```

then open a pull request to `main` and merge it as for any change (the app switches each narrated video from "Silent explainer, two minutes" to
"Narrated explainer, about N minutes" by itself). Each mp4 is about 5 to 10 MB.

If something goes wrong:
- **"lines still do not verify after three rounds"**: the log prints the wanted and the heard words. Edit that sentence in
  `videos/narration/<name>.json` (shorter, no hyphen, a hard word spelled the way it sounds), keep the caption (second element) as it is, run
  `tools/voice-video.sh <name>` again: only the changed line is voiced again.
- **A line sounds wrong or a scene drags**: edit its spoken text the same way and re-run. Look at any moment of a narrated video with
  `node tools/video-still.js <name> 10,60,120 /tmp/stills` (the page follows the voice once `tools/narrate.js` has run) and open the PNGs.
- **Do not regenerate a script with `tools/narration-skeleton.js --force`** unless you mean to write it again: `lecture-6` and `algo-5` have four recap rows.
- **To start a video over**: delete `videos/audio/<name>.json`, then run `tools/voice-video.sh <name>`. `git checkout videos/audio/<name>.js videos/audio/<name>.json videos/out/<name>.mp4` puts the silent version back.

Things the writing agents flagged, worth a listen: "Dijkstra", "PageRank", "A star" and single letters read as letters (algo-1, algo-2, algo-3,
algo-5); a few scenes where the speech is much longer than the animation (algo-5 scenes 4 and 7, about 46 to 50 s spoken against 17 s drawn);
captions that start late or overlap in the silent versions (algo-1 scene 3, algo-2 scene 9, algo-5 scene 2: the narration re-times them anyway).
The recap card has no caption on purpose (the voice only): its own tag sits where a caption would be.

### The task

Redo **every** recap video the way `videos/out/lecture-1-test.mp4` was made (that clip covers Lecture 1 scenes 0-1 only). Same
voice, same delivery, same music treatment, same look, same tools and settings; "How the example was made" below is the recipe.

Videos (25): `lecture-1` to `lecture-8` (Nature-Inspired), `algo-1` to `algo-10` (Algorithms) and `ds-1` to `ds-7` (Data Science), pages
`videos/<name>.html`. Narration scripts (`videos/narration/<name>.json`) now exist for all 25 (written 2026-10-21 in the delivery style below); the silent
versions are recorded, wired into the app and live, and `lecture-5` is the first narrated one.
The Data Science videos use the `ds-N` names, their audio stubs are `videos/audio/ds-N.js` and their scenes are in `videos/dN/`.

**Inputs** (in the repo; `.vercelignore` keeps them off the deployed site):
- **Voice:** `videos/voice-ref/narrator.wav` + its transcript `videos/voice-ref/narrator.txt` (cut from `videos/voice-ref/example.mp3`).
- **Delivery to imitate:** `videos/voice-ref/example.mp3`.
- **Music:** `videos/music/theme.mp3` and its beats `videos/music/theme.beats.json`. The track is long: each video uses only the part
  it needs.
- **Example:** `videos/out/lecture-1-test.mp4`, with its script `videos/music/lecture-1-test.narration.json` and timing
  `videos/music/lecture-1-test.timing.json`.

**Requirements** (all shown in the example):
1. **Voice:** cloned from `narrator.wav` with Qwen3-TTS 1.7B Base (`"ref"` + `"ref_text"`), the same voice on every line of every
   video. Runs locally (`tools/tts/.venv`).
2. **Delivery:** like `example.mp3`: about 135 words a minute, plain storytelling sentences, about 0.5 s pauses between sentences,
   no stress on individual words, no hype.
3. **Script:** rewrite every line of `videos/narration/<name>.json` in that style (the concept told as a short story, each step of
   the algorithm named as it happens on screen), keeping one spoken line per caption so it stays in sync. Algorithms videos have no
   narration script yet: create `videos/narration/algo-N.json` with one line per caption of each scene (title/recap cards use
   `"at"`, as in `lecture-1.json`). Keep the facts the captions show; captions can stay as they are or be shortened.
4. **Pacing and sync:** `"pace": {"pause": 0.5, "lead": 0.5, "tail": 0.8, "speed": 1.0, "warp": true, "minStretch": 0.55}`. The voice
   drives the clock; each stretch of animation between two captions is re-timed to its sentence. Each line starts with its
   caption/animation and ends before the next.
5. **Music:** `"music": {"file": "videos/music/theme.mp3", "beats": "videos/music/theme.beats.json", "snap": "downbeats",
   "start": 0, "volume": 0.22}`: under the voice, ducked while the narrator speaks, faded out at the end, scene cuts on downbeats.
6. **Look:** `"look": {"bar": false}` (no moving bar along the top). No white or light text on coloured components (chips, nodes,
   pills): use the dark `--*-on` text tokens; check every video (lecture-1, lecture-3 and algo-2 were already clean).
7. **Fix seen in the example:** on the title card the caption overlaps the "CSLingo · explainer" pill; move one of them.

### Setup (any machine, including a cloud agent)
- `bash tools/tts/setup.sh` (Linux/macOS; Windows: the commands in `tools/tts/README.md`) creates `tools/tts/.venv` with PyTorch
  (CUDA build if `nvidia-smi` exists, else CPU) and `tools/tts/requirements.txt`. Then
  `export TTS_PYTHON=tools/tts/.venv/bin/python` and `export FFMPEG=$($TTS_PYTHON -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')`.
- Rendering needs Playwright's Chromium (`npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_PATH`).
- The first voice run downloads Qwen3-TTS 1.7B Base (about 4.5 GB) from Hugging Face. Without a GPU, `tools/tts/speak.py` runs it on
  the CPU in float32: it works but is much slower than the RTX 4060 (about a minute for 5 lines), so voice one video at a time.

### Steps
1. For each video: write/rewrite `videos/narration/<name>.json` (requirements 1-6).
2. `node tools/narrate.js <name>` (no `--only`: voice every scene).
3. Check every voiced line with faster-whisper (CPU, `small.en`): it must come back word for word; re-voice any line that does not.
4. Spot-check sync with `node tools/video-still.js <name> ...` at a few caption start times.
5. Render the whole video (no `--scenes`):
   `node tools/render-video.js <name>` (with `FFMPEG` set as in Setup)
   (writes `videos/out/<name>.mp4`); the narration also updates `videos/audio/<name>.js`, which the page reads.
6. Fix the title-card overlap (requirement 7) and any light-on-colour text found, then re-render the affected videos.
7. Update `videos/README.md` (new lengths, how to narrate, where the voice and music settings live), run `npm test`.
8. Owner reviews a couple of finished videos before anything is merged.

### Pipeline (already built)
- `tools/narrate.js --engine qwen|chatterbox|kokoro|fake` voices each caption line; the open-source engines run locally
  through `tools/tts/speak.py` (one batch per video, model loads once). Setup and engine notes: `tools/tts/README.md`.
- Pacing: `"pace"` in each narration script (`pause`, `lead`, `tail`, `speed`, `warp`, `minStretch`), a per-line `pause`, `--pace N`.
- Beat sync: `tools/tts/beats.py <track>` writes beat times; `"music": {"beats": ..., "snap": "downbeats"}` puts every cut on one.
- `tools/render-video.js` mixes the music under the voice (only the stretch needed, ducked, faded out), 48 kHz stereo.
- `"look": {"bar": false}` in a script hides the progress bar (`.no-bar` in `videos/engine.js` / `videos/video.css`).
- Quick tests: `narrate.js --only A-B` voices only scenes A..B; `render-video.js --scenes A-B` records only them.
- TTS environment: `tools/tts/.venv` (made by `tools/tts/setup.sh` from `tools/tts/requirements.txt`), gitignored; models in the
  Hugging Face cache.

### How the example was made

Clip: `videos/out/lecture-1-test.mp4`, 34.3 s, 1080x1080, H.264 + AAC 48 kHz stereo: Lecture 1 scenes 0-1 (16 s of the original
video), narrated in the cloned voice, music under it, scene cuts on downbeats (9.29 s and 34.27 s), no progress bar.

**Voice:** Qwen3-TTS 1.7B **Base**, cloned from `videos/voice-ref/narrator.wav` (13.4 s cut from `videos/voice-ref/example.mp3`,
6.8-20.2 s, where the speech starts) with its transcript `videos/voice-ref/narrator.txt` as `ref_text`. One reference = one
consistent voice on every line. All files local, gitignored.

**Delivery, learned from `videos/voice-ref/example.mp3`:** about 135 words per minute, plain declarative storytelling sentences,
pauses of about 0.5 s between sentences (max about 1 s), no emphasis on individual words. Write the narration that way: short
factual sentences that tell the concept as a story ("For billions of years, nature has been solving hard problems. So we copy
it."), not hype and not a stressed key word in every line.

Settings: `videos/music/lecture-1-test.narration.json` (the narration script used; local) and
`videos/music/lecture-1-test.timing.json` (the timing it produced). Differences from the committed `videos/narration/lecture-1.json`:
- `"engine": "qwen"`, `"voices": {"qwen": {"model": "Qwen/Qwen3-TTS-12Hz-1.7B-Base", "language": "English",
  "ref": "videos/voice-ref/narrator.wav", "ref_text": "<contents of narrator.txt>"}}`
- `"pace": {"pause": 0.5, "lead": 0.5, "tail": 0.8, "speed": 1.0, "warp": true, "minStretch": 0.55}`: the voice drives the clock
  and each stretch of animation between two captions is re-timed to fit its sentence (`warp`), never more than 1/0.55 = 1.8x
  faster than the original.
- `"music": {"file": "videos/music/theme.mp3", "beats": "videos/music/theme.beats.json", "snap": "downbeats", "start": 0, "volume": 0.22}`
- `"look": {"bar": false}`: hides the moving progress bar (the engine adds `.no-bar` to the frame).
- Scenes 0-1 lines rewritten in the delivery style above (the other scenes were voiced as silent placeholders).

```bash
# once: beat times of the track (first 300 s); reference transcript (faster-whisper small.en on CPU)
$TTS_PYTHON tools/tts/beats.py videos/music/theme.mp3 --start 0 --length 300
# use the test script, voice scenes 0-1 (the rest silent placeholders), then record just those scenes
cp videos/music/lecture-1-test.narration.json videos/narration/lecture-1.json
node tools/narrate.js lecture-1 --only 0-1
node tools/render-video.js lecture-1 videos/out/lecture-1-test.mp4 --scenes 0-1
git checkout videos/narration/lecture-1.json videos/audio/lecture-1.js   # put the committed files back
```

Notes from the tests:
- v1 (Qwen VoiceDesign, slow) and v2 (VoiceDesign, "intense") were rejected: VoiceDesign invents a slightly different voice on
  every call (two voices in one clip), and the "hit every key term" instruction over-stressed every word. Cloning from one
  reference fixed both.
- Check each voiced line with faster-whisper (CPU, `small.en`): all 5 test lines came back word for word.
- Qwen VoiceDesign has no speed parameter: `speed` > 1 adds "Speak fast..." to its description, < 1 "Speak slowly..."; the Base
  clone ignores `speed` (it follows the reference's pace).
- `tools/narrate.js` reads the page with `?raw=1` (original scene lengths and captions), so re-running never compounds timings.
- White text on coloured fills: a scan of lecture-1, lecture-3 and algo-2 found none (scenes already use the dark `--*-on` tokens).
- On the title card the caption overlaps the "CSLingo · explainer" pill; move one of them when redoing the title cards.
- Models download to the Hugging Face cache on first use (about 4.5 GB each); `tools/tts/speak.py` sets
  `HF_HUB_DISABLE_IMPLICIT_TOKEN=1` because an expired stored login broke the public download. faster-whisper's GPU path needs
  CUDA 12 cuBLAS, which is not installed, so it runs on CPU (fast enough for checks).

## Other open items

Added 2026-10-21.

- **Data Science lecture 7 (Paxos) video** (`ds-7`): recorded and wired. Check on the live site that the bonus node after the
  lecture 7 boss quiz plays `videos/out/ds-7.mp4` and shows its poster.
- **Remove the four stray files** `/log4.txt`, `/log5.txt`, `/log10.txt` and `/log11.txt` from the filesystem root of the
  development machine (they are outside the repo; the assistant's sandbox is not allowed to delete files at `/`).
- **Revoke the old ElevenLabs and Gemini API keys** in their dashboards. They were pasted into a chat once. The local `.env.local`
  and the ElevenLabs engine in `tools/narrate.js` have been deleted; the voice pipeline is local only (Qwen3-TTS, Chatterbox, Kokoro).
- **App work still open:** "Bigger bets" (Profile overview, offline service worker, phase picker) and the "Shell polish" list.
