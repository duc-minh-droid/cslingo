# CSLingo explainer videos

Two animated explainers (square 1080 x 1080, no audio, on-screen captions), one per Nature-Inspired lecture:

| Video | Page | Length | Output |
|---|---|---|---|
| Lecture 5: Encodings | `lecture-5.html` | 1:42 | `out/lecture-5.mp4` |
| Lecture 6: Genetic programming | `lecture-6.html` | 1:56 | `out/lecture-6.mp4` |

- **Preview:** `python serve.py 8651`, then open `http://localhost:8651/videos/lecture-5.html` (space plays and pauses, ← → jump 1 s, `[` `]` jump scenes, the slider scrubs).
- **Look at a frame:** `node tools/video-still.js lecture-5 s3@4.5,s5@8 /tmp/stills` (scene number `@` seconds into it, or absolute seconds; `info` lists the scenes).
- **Record:** `FFMPEG=/path/to/ffmpeg node tools/render-video.js lecture-5` (needs an ffmpeg with libx264; the Playwright one cannot encode H.264, `pip install imageio-ffmpeg` ships one).
- **How it works:** `engine.js` is a deterministic timeline: every scene is a pure function of its local time, so any frame can be drawn in any order. Scenes live in `l5/` and `l6/` (one file per scene, shared drawing helpers in `common.js`), the title and recap cards in `cards.js`, the look in `video.css` (CSLingo colour roles, sticker look, Nunito). Add a scene by creating the file and listing it in the page.
