/* Start a narration script for a recap video:  node tools/narration-skeleton.js <name> [--force]
   Reads the page (captions and scene lengths exactly as recorded) and writes videos/narration/<name>.json with the whole recipe of
   the approved example (TODO.md, "How the example was made"): the local Qwen3-TTS voice clone, 0.5 s pauses, warped timing,
   the music on downbeats, no progress bar. Every scene gets one line per caption as ["spoken", "caption"]: the spoken part starts
   as the caption and is yours to rewrite as a short plain sentence or two; leave the caption (second part) as it is. Title and
   recap cards have no captions: they get an "at" list (the original-time seconds each line starts) and plain strings. Refuses to
   overwrite a script that exists unless you pass --force. Check the result with  node tools/narration-check.js <name>. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { serve, launch, openVideo, root } from "./video-lib.js";

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
if (!name) {
  console.error("usage: node tools/narration-skeleton.js <name> [--force]");
  process.exit(2);
}
const out = join(root, "videos", "narration", `${name}.json`);
if (existsSync(out) && !args.includes("--force")) {
  console.error(`${out} exists; pass --force to replace it`);
  process.exit(1);
}
const { server, base } = await serve();
const browser = await launch();
let scenes;
try {
  const { page } = await openVideo(browser, base, name, { raw: true });
  scenes = await page.evaluate(() =>
    VID.scenes.map((s) => ({ dur: s.dur, kicker: s.kicker || "", caps: s.caps || [] })),
  );
} finally {
  await browser.close();
  server.close();
}
const last = scenes.length - 1;
const script = {
  engine: "qwen",
  voices: {
    qwen: {
      model: "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
      language: "English",
      ref: "videos/voice-ref/narrator.wav",
      ref_text: readFileSync(join(root, "videos", "voice-ref", "narrator.txt"), "utf8").trim(),
    },
  },
  pace: { pause: 0.5, lead: 0.5, tail: 0.8, speed: 1.0, warp: true, minStretch: 0.55 },
  music: {
    file: "videos/music/theme.mp3",
    beats: "videos/music/theme.beats.json",
    snap: "downbeats",
    start: 0,
    volume: 0.22,
  },
  look: { bar: false },
  scenes: scenes.map((s, i) => {
    if (s.caps.length) return { lines: s.caps.map(([, , text]) => [text, text]) };
    if (i === 0) return { at: [0.9], lines: ["TITLE: one or two sentences that say what this lecture is about."] };
    if (i === last)
      return {
        at: [0.9, 2.0, 3.1],
        lines: ["RECAP ROW 1", "RECAP ROW 2", "RECAP ROW 3"],
      };
    return { lines: ["(this scene has no captions)"] };
  }),
};
writeFileSync(out, JSON.stringify(script, null, 1) + "\n");
console.log(`${out}: ${scenes.length} scenes, ${scenes.reduce((n, s) => n + s.caps.length, 0)} caption lines`);
