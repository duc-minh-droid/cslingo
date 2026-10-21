/* Voice-over for a recap video:  node tools/narrate.js <lecture-N|algo-N> [--engine qwen|chatterbox|kokoro|fake] [--pace 1.4]
   Reads videos/narration/<name>.json (one spoken line per caption, or {at, lines} for the title and recap cards), makes one clip
   per line, measures it, and works out how long every scene must be so the picture waits for the voice. Writes
   videos/audio/<name>.js (read by the page: scene lengths and captions) and videos/audio/<name>.json (clip start times and the
   music cue, read by tools/render-video.js). Clips are cached in videos/audio/clips/ by a hash of engine + voice + text, so a
   re-run only voices the lines that changed.

   Engines (--engine, or "engine" in the script, or TTS_ENGINE):
     qwen | chatterbox | kokoro   open-source, run locally by tools/tts/speak.py (see tools/tts/README.md for the setup)
     fake                         silent clips of a plausible length, to test timing with no model at all
   --only A-B voices only scenes A..B with the engine (others fake), for a quick test of one stretch.
   Pacing (all optional, in the script's "pace" object; --pace N multiplies every gap):
     pause  quiet gap between two sentences (s, default 0.6)     lead  before the first sentence of a scene (default 0.7)
     tail   hold after the last sentence of a scene (default 1.0) speed  speaking rate passed to the engine (default 0.9)
     warp   true: the voice drives the clock and each stretch of animation between two captions is re-timed to fit its
            sentence (faster, dramatic narration); false (default): the whole scene is stretched evenly
     minStretch  lowest animation speed-up allowed (default 1 = never faster than the original; 0.7 lets a fast voice
                 drive a scene up to ~1.4x quicker)
   A line can be "text", ["spoken", "caption"] or {say, cap, pause}: its own pause (s) is held after it.
   Music beat sync: with "music": {"beats": "videos/music/<track>.beats.json"} (made by tools/tts/beats.py) every scene is
   stretched so the cut to the next scene lands on a beat. */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { serve, launch, openVideo, root } from "./video-lib.js";

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const PYTHON = process.env.TTS_PYTHON || "python";
const LOCAL = ["qwen", "chatterbox", "kokoro"];

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const name = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!name) {
  console.error("usage: node tools/narrate.js <lecture-N|algo-N> [--engine qwen|chatterbox|kokoro|fake] [--pace 1.4]");
  process.exit(2);
}
const script = JSON.parse(readFileSync(join(root, "videos", "narration", `${name}.json`), "utf8"));
const engine = opt("engine") || (args.includes("--fake") ? "fake" : script.engine || process.env.TTS_ENGINE || "fake");
if (![...LOCAL, "fake"].includes(engine)) throw new Error(`unknown engine ${engine}`);
const P = { pause: 0.6, lead: 0.7, tail: 1.0, speed: 0.9, minStretch: 1, ...(script.pace || {}) };
const scale = +(opt("pace") || 1);
// --only 2-4 voices just those scenes with the engine (the rest get fake clips): a quick test of one stretch of a video
const only = opt("only") ? opt("only").split("-").map(Number) : null;
const engOf = (i) => (!only || (i >= only[0] && i <= (only[1] ?? only[0])) ? engine : "fake");
const voiceOf = (eng) => script.voices?.[eng] || {};
const dirOf = (eng) => join(root, "videos", "audio", eng === "fake" ? "fake" : "clips");
mkdirSync(dirOf(engine), { recursive: true });
mkdirSync(dirOf("fake"), { recursive: true });
const run = (cmd, a, o = {}) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 1 << 26, ...o });

/** Length of a clip: WAV from its header (no ffmpeg needed), anything else through ffmpeg. */
function seconds(file) {
  if (file.endsWith(".wav")) {
    const b = readFileSync(file);
    let i = 12,
      rate = 0,
      block = 0;
    while (i + 8 <= b.length) {
      const id = b.toString("ascii", i, i + 4),
        size = b.readUInt32LE(i + 4);
      if (id === "fmt ") {
        rate = b.readUInt32LE(i + 12);
        block = b.readUInt16LE(i + 20);
      } else if (id === "data") return Math.min(size, b.length - i - 8) / (rate * block);
      i += 8 + size + (size & 1);
    }
    throw new Error(`cannot read ${file}`);
  }
  const r = run(FFMPEG, ["-i", file, "-f", "null", "-"]);
  const m = (r.stderr.match(/time=(\d+):(\d+):([\d.]+)/g) || []).pop()?.match(/(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`cannot measure ${file} (set FFMPEG=...)`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

/** A silent 16-bit mono WAV of d seconds (the fake engine). */
function silentWav(file, d) {
  const rate = 16000,
    n = Math.round(d * rate),
    b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * 2, 40);
  writeFileSync(file, b);
}

const keyOf = (eng, text) =>
  createHash("sha1")
    .update(`${eng}|${JSON.stringify(voiceOf(eng))}|${P.speed}|${text}`)
    .digest("hex")
    .slice(0, 16);
const fileOf = (eng, text) => join(dirOf(eng), `${keyOf(eng, text)}.wav`);

/** Voice every line that has no cached clip yet; a local engine gets them all in one batch so its model loads once. */
async function voiceAll(engine, texts) {
  const fileOf1 = (t) => fileOf(engine, t),
    voice = voiceOf(engine);
  const todo = [...new Set(texts)].filter((t) => !existsSync(fileOf1(t)));
  if (!todo.length) return;
  if (engine === "fake") return todo.forEach((t) => silentWav(fileOf1(t), Math.max(1.4, (t.length * 0.075) / P.speed)));
  if (LOCAL.includes(engine)) {
    // the voice drops the word after a hyphen ("eight-bit"), so the engine gets a space instead
    const lines = todo.map((t) => ({ text: t.replace(/(\w)-(\w)/g, "$1 $2"), out: fileOf1(t) }));
    const job = { engine, voice, speed: P.speed, lines };
    const r = run(PYTHON, [join(root, "tools", "tts", "speak.py")], {
      input: JSON.stringify(job),
      stdio: ["pipe", "inherit", "inherit"],
    });
    if (r.status !== 0) throw new Error(`tools/tts/speak.py failed (engine ${engine}); see tools/tts/README.md`);
    return;
  }
}

// what the page has now: original scene lengths and caption start times
const { server, base } = await serve();
const browser = await launch();
const { page } = await openVideo(browser, base, name, { raw: true });
const scenes = await page.evaluate(() => VID.scenes.map((s) => ({ dur: s.dur, caps: s.caps || [] })));
await browser.close();
server.close();
if (scenes.length !== script.scenes.length)
  throw new Error(`${scenes.length} scenes but ${script.scenes.length} scripts`);

const norm = (l) =>
  typeof l === "string" ? { say: l, cap: l } : Array.isArray(l) ? { say: l[0], cap: l[1] } : { cap: l.say, ...l };
const plan = script.scenes.map((spec) => spec.lines.map(norm));
for (const eng of new Set(plan.map((_, i) => engOf(i))))
  await voiceAll(
    eng,
    plan.flatMap((ls, i) => (engOf(i) === eng ? ls.map((l) => l.say) : [])),
  );

// "snap": "downbeats" cuts on the first beat of a bar (stronger, fewer); default every beat
const beats = script.music?.beats
  ? JSON.parse(readFileSync(join(root, script.music.beats), "utf8"))[script.music.snap || "beats"]
  : null;
const timing = [];
let chars = 0,
  clock = 0;
for (const [i, sc] of scenes.entries()) {
  const lines = plan[i];
  const anchors = script.scenes[i].at || sc.caps.map((c) => c[0]);
  if (anchors.length !== lines.length)
    throw new Error(`scene ${i}: ${lines.length} lines for ${anchors.length} anchors`);
  const clips = lines.map((l) => {
    chars += l.say.length;
    const file = fileOf(engOf(i), l.say);
    return { file: file.slice(root.length + 1).replace(/\\/g, "/"), len: seconds(file) };
  });
  const gap = (j) => scale * (lines[j - 1].pause ?? P.pause);
  let starts,
    dur,
    warp = null;
  if (P.warp) {
    // the voice drives the clock: each sentence follows the last after its pause, and the animation between two caption
    // anchors is sped up or slowed down to fill exactly that time (never more than 1/minStretch times faster)
    let end = 0,
      prev = 0,
      prevA = 0;
    starts = anchors.map((a, j) => {
      const at = j
        ? Math.max(end + gap(j), prev + (a - prevA) * P.minStretch)
        : Math.max(scale * P.lead, a * P.minStretch);
      end = at + clips[j].len;
      prev = at;
      prevA = a;
      return at;
    });
    dur = Math.max(end + scale * P.tail, prev + (sc.dur - prevA) * P.minStretch);
    warp = [[0, 0], ...starts.map((t, j) => [t, anchors[j]]), [dur, sc.dur]];
  } else {
    // uniform stretch: each sentence starts at its (stretched) anchor or after the last one and its pause, whichever is later
    let s = P.minStretch;
    for (; ; s += 0.01) {
      let end = 0;
      starts = anchors.map((a, j) => {
        const at = Math.max(a * s, j ? end + gap(j) : scale * P.lead);
        end = at + clips[j].len;
        return at;
      });
      const last = starts.at(-1) + clips.at(-1).len;
      if (starts.every((t, j) => t <= anchors[j] * s + 0.05) && last <= sc.dur * s - scale * P.tail) break;
      if (s > 3) {
        s = Math.max(1, (last + scale * P.tail) / sc.dur); // anchors too tight at any speed: the scene runs on after the voice
        break;
      }
    }
    dur = Math.max(sc.dur * s, starts.at(-1) + clips.at(-1).len + scale * P.tail);
  }
  // beat sync: stretch the scene so the next cut lands on the first beat after it would have ended
  if (beats) {
    const next = beats.find((b) => b >= clock + dur - 0.02);
    if (next !== undefined) dur = next - clock;
  }
  if (warp) warp[warp.length - 1][0] = dur;
  clock += dur;
  timing.push({
    dur: +dur.toFixed(3),
    ...(warp ? { warp: warp.map(([n, o]) => [+n.toFixed(3), +o.toFixed(3)]) } : {}),
    caps: lines.map((l, j) => [+starts[j].toFixed(2), +(starts[j] + clips[j].len + 0.25).toFixed(2), l.cap]),
    clips: clips.map((c, j) => ({ file: c.file, at: +starts[j].toFixed(3), len: +c.len.toFixed(3) })),
  });
}
const total = timing.reduce((a, t) => a + t.dur, 0);
writeFileSync(
  join(root, "videos", "audio", `${name}.js`),
  `/* voice-over timing: generated by tools/narrate.js (do not edit) */\nVID.narration = ${JSON.stringify({ ...(script.look ? { look: script.look } : {}), scenes: timing.map((t) => ({ dur: t.dur, caps: t.caps, ...(t.warp ? { warp: t.warp } : {}) })) })};\n`,
);
writeFileSync(
  join(root, "videos", "audio", `${name}.json`),
  JSON.stringify({ engine, fake: engine === "fake", music: script.music || null, scenes: timing }, null, 1),
);
console.log(
  `${name}: ${chars} characters, ${total.toFixed(1)} s (was ${scenes.reduce((a, s) => a + s.dur, 0).toFixed(1)} s), engine ${engine}${beats ? ", cuts on beats" : ""}`,
);
