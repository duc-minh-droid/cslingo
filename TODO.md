# TODO

## Recap videos: open-source voice-over, longer cut, new look

Added 2026-10-20. Not started.

**Goal:** every recap video (`videos/lecture-N.html`, `videos/algo-N.html`) gets a spoken explanation, in the style of an anime
explainer (Jujutsu Kaisen-like: a dramatic narrator who explains the concept, with a theme-music bed under it).

1. **Open-source TTS.** Replace the ElevenLabs call in `tools/narrate.js` with an open-source engine that runs locally (candidates
   to compare: Piper, Kokoro, XTTS-v2, F5-TTS). Keep the existing contract: one clip per caption, cached by a hash of
   text + voice + model in `videos/audio/clips/`, clip lengths measured, scene lengths derived from them, outputs
   `videos/audio/<name>.js` and `.json`. No API key, no paid service.
2. **Longer videos.** Rewrite `videos/narration/*.json` so each video explains its topic properly (target roughly 3 to 5
   minutes, up from about 2). Scene lengths must follow the spoken line lengths, not the other way round.
3. **Voice synced to the explanation.** Each spoken line starts with the caption/animation it describes and ends before the
   next one begins; check with `tools/video-still.js` at the line start times, and with a whole-video render per lecture.
4. **JJK-style delivery.** Narrator tone: calm, confident, a little theatrical, "let me explain" framing, named techniques/steps
   for the algorithms. Theme music: a looping instrumental bed ducked under the voice, mixed in `tools/render-video.js`.
   *Licensing:* use original or royalty-free/CC0 music in a similar mood and a generic synthetic narrator voice. Do not
   use ripped Jujutsu Kaisen tracks or clone a real voice actor; the videos are published on the live site.
5. **Look.** Remove the moving bar along the top of the video frame. Fix white text on coloured components (chips, nodes,
   pills): use the dark `--*-on` text tokens for text on a coloured fill so it stays readable.
6. **Done when:** all videos re-rendered to `videos/out/`, `videos/README.md` updated (lengths, how to narrate, which TTS and
   music), `npm test` passes, and the videos play with voice on the live site.
