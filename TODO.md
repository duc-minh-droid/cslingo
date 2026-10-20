# TODO

## Recap videos: narrate every video exactly like the example clip

Added 2026-10-20. The pipeline is built and the example clip is approved by the owner ("perfect"); the remaining job is to do the
same to every video.

### The task

Redo **every** recap video the way `videos/out/lecture-1-test.mp4` was made (that clip covers Lecture 1 scenes 0-1 only). Same
voice, same delivery, same music treatment, same look, same tools and settings; "How the example was made" below is the recipe.

Videos (16): `lecture-1` to `lecture-6` (Nature-Inspired) and `algo-1` to `algo-10` (Algorithms), pages `videos/<name>.html`.

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
- `tools/narrate.js --engine qwen|chatterbox|kokoro|eleven|fake` voices each caption line; the open-source engines run locally
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
