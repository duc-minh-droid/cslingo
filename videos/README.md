# CSLingo explainer videos

Animated explainers (square 1080 x 1080, on-screen captions; the narrated ones also have a voice-over and music, see "Narration" below), eight of them for the Nature-Inspired lectures:

| Video | Page | Length | Output |
|---|---|---|---|
| Lecture 1: What is NIC? | `lecture-1.html` | 1:52 | `out/lecture-1.mp4` |
| Lecture 2: Why EAs? | `lecture-2.html` | 1:48 | `out/lecture-2.mp4` |
| Lecture 3: Local vs population search | `lecture-3.html` | 1:59 | `out/lecture-3.mp4` |
| Lecture 4: Selection and operators | `lecture-4.html` | 1:57 | `out/lecture-4.mp4` |
| Lecture 5: Encodings | `lecture-5.html` | 1:42 | `out/lecture-5.mp4` |
| Lecture 6: Genetic programming | `lecture-6.html` | 1:56 | `out/lecture-6.mp4` |
| Lecture 7: Swarm intelligence and ant colonies | `lecture-7.html` | 2:09 | `out/lecture-7.mp4` |
| Lecture 8: The Ant System in detail | `lecture-8.html` | 2:09 | `out/lecture-8.mp4` |

- **Preview:** `python serve.py 8651`, then open `http://localhost:8651/videos/lecture-5.html` (space plays and pauses, ← → jump 1 s, `[` `]` jump scenes, the slider scrubs).
- **Look at a frame:** `node tools/video-still.js lecture-5 s3@4.5,s5@8 /tmp/stills` (scene number `@` seconds into it, or absolute seconds; `info` lists the scenes).
- **Record:** `FFMPEG=/path/to/ffmpeg node tools/render-video.js lecture-5` (needs an ffmpeg with libx264; the Playwright one cannot encode H.264, `pip install imageio-ffmpeg` ships one).
- **How it works:** `engine.js` is a deterministic timeline: every scene is a pure function of its local time, so any frame can be drawn in any order. Scenes live in `l1/` to `l8/` (one file per scene, shared drawing helpers in `common.js`), the title and recap cards in `cards.js`, the look in `video.css` (CSLingo colour roles, sticker look, Nunito). Add a scene by creating the file and listing it in the page.

## Narration (voice-over)

Every video has a narration script `narration/<name>.json` (one spoken line per caption; title and recap cards use an `"at"` list) and, once
recorded, a timing file `audio/<name>.json` plus the page script `audio/<name>.js` that makes the pictures wait for the voice. The voice is
one fixed narrator cloned locally (Qwen3-TTS 1.7B Base from `voice-ref/narrator.wav`), about 135 words a minute, with the music `music/theme.mp3`
under it and the scene cuts on its downbeats. Nothing leaves the machine: no API keys are used. The recipe and the reasoning behind it are in `TODO.md`.

- **Set up once:** `tools/tts/setup.sh` (a CPU or CUDA PyTorch in `tools/tts/.venv`, about 5 GB of models from Hugging Face on the first run).
- **New script:** `node tools/narration-skeleton.js <name>` writes the settings and one `["spoken", "caption"]` line per caption; rewrite the spoken part
  as short plain sentences in the style of `narration/lecture-1.json` (write numbers as words, no symbols; the brief is `_plan/NARRATION_TASK.md`), then
  `node tools/narration-check.js <name>` (line counts, symbols, estimated length).
- **Voice and record:** `tools/voice-video.sh <name>` voices every line, checks each clip with faster-whisper (`tools/tts/verify.py`, re-voices the ones that do
  not come back word for word) and records `out/<name>.mp4` and its poster; `tools/voice-all.sh <name> ...` does several in a row and skips finished ones.
  Without a GPU a video takes about 20 to 40 minutes; with the RTX 4060 much less.
- **Settings** sit at the top of each narration script (`pace`, `music`, `look`); the recap card gets no caption (the voice only), because its own tag sits where a caption would be.
- **The app:** a video is announced as narrated, with its real length, once its number is listed in `NARRATED` in `js/content/<course>/videos.js`.

`_plan/` holds the storyboards (`lecture-N.json`), the shared agent briefs and the review notes the videos were built from.

## Data Science videos (`ds-N`)

One explainer per Data Science lecture, same engine and rules: page `videos/ds-N.html`, scenes and helpers in `videos/dN/`, storyboard `videos/_plan/ds-N.json`, output `videos/out/ds-N.mp4` plus `ds-N-poster.png` (a still of the title card, `node tools/video-still.js ds-N 2.2 <dir>`). Record with `FFMPEG=... node tools/render-video.js ds-N`; the lecture is wired into the app by adding `{n, blurb, chapters}` to `VIDEOS` in `js/content/ds/videos.js`. Lectures 1 to 7 are recorded and wired. The agent briefs used to build them are `videos/_plan/DS_*.md` (architect, scene, review, fix).

## Algorithms videos (`algo-N`)

One explainer per Algorithms phase, same engine and rules: page `videos/algo-N.html`, scenes and helpers in `videos/aN/`, storyboard `videos/_plan/algo-N.json`, output `videos/out/algo-N.mp4` plus `algo-N-poster.png` (a still of the title card, `node tools/video-still.js algo-N 2.2 <dir>`). Record with `FFMPEG=... node tools/render-video.js algo-N`. Phases 1 to 10 are recorded and wired into the app (`js/content/algo/videos.js`); phase 11 was removed from the course. `videos/narration/` and `tools/narrate.js` hold the voice-over pipeline (needs a TTS key, see its header).
