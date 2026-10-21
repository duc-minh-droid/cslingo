# Task: write the narration script for CSLingo recap videos

You are writing the **spoken narration** for silent, captioned 1080x1080 recap videos in the CSLingo repo (`/home/user/cslingo`). A
voice (a local clone of one fixed narrator voice) will read your sentences later; you only write text. Do not try to run any
text-to-speech, do not render videos, and do not use git (no commit, push, checkout, stash, reset, `add -A`). Other agents are
writing other videos' scripts in the same working tree at the same time: touch **only** your own `videos/narration/<name>.json` files.

## The delivery to copy (approved by the owner)
- The narrator tells the concept as a **short, plain story**: short factual sentences, about 135 words a minute, about half a second
  between sentences. No hype, no stressed key word in every line, no "wow", no "let's dive in", no rhetorical questions, no jokes.
  Calm and clear, like a good teacher talking to one student.
- Good example lines (from the approved clip): "For billions of years, nature has been solving hard problems. So we copy it."
  "In an ant colony, the shorter trail collects more scent." "Small steps add up. That is called cumulative selection."
  "Picture a landscape, where height means how good a solution is." The full approved example script is
  `videos/music/lecture-1-test.narration.json`: read its first two scenes before you start.
- **One spoken line per caption** (a line is one or two short sentences, usually 8 to 30 words, never more than 38). The line is read
  while that caption and its animation play, so it must describe what is on screen at that moment, in the order it happens.
- **Say what the picture shows**, name each step of an algorithm as it happens ("Now the pivot goes to its final place."), then say
  the point of it in plain words. Keep every fact and every number consistent with the captions and with what the scene draws; never
  invent a number. Where a caption is terse ("Monkey: 1.2 x 10^40 tries"), the spoken line expands it into a sentence.
- **Write for the ear.** Spell numbers as words ("twenty-eight", "about ten to the forty", "three of five"), spell out symbols and
  names a voice would mangle ("big O of n squared", "P one and P two", "the two-phase commit", "A, B and C" as in "A B and C" is fine),
  no digits, no maths symbols, no code, no abbreviations the voice cannot say (write "for example", "that is"). UK spelling.
  Binary strings are read digit by digit ("one zero one one"). Avoid parentheses, colons and bullet-like fragments.
- Vary the sentence openings and do not repeat the caption word for word; the caption stays on screen, the voice adds the story.
- Length: the narrated video will run at the speed of the voice, so a video grows from about 2 minutes to about 3 to 4.5 minutes.
  Aim for that. Do not pad and do not squeeze; a line the picture does not need can be one short sentence.

## Files and tools
- Pages: `videos/<name>.html` (names: `lecture-1`..`lecture-8` Nature-Inspired, `algo-1`..`algo-10` Algorithms, `ds-1`..`ds-7` Data
  Science). Scenes live in `videos/l<N>/` (lectures), `videos/a<N>/` (algorithms), `videos/d<N>/` (data science), one file per scene
  (`scene-NN-*.js`); the header comment of each scene file says exactly what is drawn and when. Read the scene files for what is on
  screen, and the lesson sources for the facts (`js/content/nic/`, `js/content/algo/`, `js/content/ds/`; the storyboards are in
  `videos/_plan/<name>.json` for ds and algo videos). The lesson text is the source of truth for definitions.
- Existing scripts for `lecture-1`..`lecture-6` are in `videos/narration/` in an older, wordier style: rewrite every line in the style
  above (keep one line per caption). For every other video start from a skeleton:
  `node tools/narration-skeleton.js <name>` (add `--force` to replace an existing script; it fills in all the settings: voice,
  pacing, music, no progress bar). In the skeleton every caption line is `["spoken", "caption"]`: **rewrite only the first
  element** (the spoken text); leave the second (the on-screen caption) exactly as it is. If you rewrite an existing lecture-1..6
  script, regenerate it with `--force` first so it has the full settings, then write the lines.
- Scene 0 is the title card and the last scene is the recap card; neither has captions, so they have an `"at"` list (the second, in
  original animation time, at which each line starts) and plain-string lines. Title: one or two sentences saying what the lecture is
  about (the approved example: "Lecture one. Nature-inspired computing. This is how evolution became a way of solving problems.").
  Recap: three lines, one per row, spoken when each row appears; open the recap scene file, read when the three rows appear (its header
  comment gives the times, for example "rows slide in at 0.8 / 1.9 / 3.0") and set `"at"` to those times plus 0.1. Each recap line
  restates the row's rule in one short sentence; the video can end after the third line (the "Next: Workshop" tag needs no words).
- Check every script: `node tools/narration-check.js <name>` must report no ERROR; read its warnings and fix those that matter
  (digits, symbols, over-long lines). It prints the estimated narrated length of each scene and of the video.
- Never edit scene files, captions, `videos/audio/*`, `tools/*` or anything outside your own narration JSON files. If a caption is
  wrong or a scene looks broken, say so in your final report instead of changing it.

## Report
When all your scripts pass the checker, reply with a short report: one line per video (name, lines, estimated minutes), and any
problems you noticed in captions or scenes (file and what is wrong). Do not paste the scripts.
