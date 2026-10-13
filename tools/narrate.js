/* Voice-over for a recap video:  node tools/narrate.js <lecture-N> [--fake]
   Reads videos/narration/<name>.json (one spoken line per caption, or {at, lines} for the title and recap cards),
   makes one mp3 per line with ElevenLabs (cached in videos/audio/clips/ by a hash of text + voice + model, so a re-run costs
   nothing), measures each clip, and works out how long every scene must be. Writes videos/audio/<name>.js (read by the
   page: scene lengths and captions) and videos/audio/<name>.json (clip start times, read by tools/render-video.js).
   Needs ELEVENLABS_API_KEY (put it in .env.local, which git ignores) and an ffmpeg (FFMPEG=...).
   --fake writes silent clips of a plausible length to test the timing without calling the API. */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { serve, launch, openVideo, root } from "./video-lib.js";

if (existsSync(join(root, ".env.local"))) {
  for (const l of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const MODEL = process.env.VOICE_MODEL || "eleven_v4";
const VOICES = { alice: "Xb7hH8MSUJpSbSDYk0k2", matilda: "XrExE9yKIg1WjnnlVkGX", sarah: "EXAVITQu4vr4xnSDxMaL" };
const PAD = 0.3; // quiet gap before the next sentence
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const fake = args.includes("--fake");
if (!name) {
  console.error("usage: node tools/narrate.js <lecture-N> [--fake]");
  process.exit(2);
}
const script = JSON.parse(readFileSync(join(root, "videos", "narration", `${name}.json`), "utf8"));
const voice = VOICES[script.voice] || script.voice;
const clipDir = join(root, "videos", "audio", fake ? "fake" : "clips");
mkdirSync(clipDir, { recursive: true });
const run = (cmd, a) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 1 << 26 });

function seconds(file) {
  const r = run(FFMPEG, ["-i", file, "-f", "null", "-"]);
  const m = (r.stderr.match(/time=(\d+):(\d+):([\d.]+)/g) || []).pop()?.match(/(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`cannot measure ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

async function clip(text) {
  const key = createHash("sha1").update(`${MODEL}|${voice}|${fake}|${text}`).digest("hex").slice(0, 16);
  const file = join(clipDir, `${key}.mp3`);
  if (existsSync(file)) return file;
  if (fake) {
    const d = Math.max(1.2, text.length * 0.065);
    run(FFMPEG, ["-y", "-v", "error", "-f", "lavfi", "-i", `sine=frequency=330:duration=${d}`, "-q:a", "6", file]);
    return file;
  }
  const key2 = process.env.ELEVENLABS_API_KEY;
  if (!key2) throw new Error("set ELEVENLABS_API_KEY (in .env.local)");
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key2, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
      }),
    });
    if (r.ok) {
      writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      return file;
    }
    if (attempt < 3 && r.status >= 500) await new Promise((ok) => setTimeout(ok, 2000 * (attempt + 1)));
    else throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
}

// what the page has now: original scene lengths and caption start times
const { server, base } = await serve();
const browser = await launch();
const { page } = await openVideo(browser, base, name);
const scenes = await page.evaluate(() => VID.scenes.map((s) => ({ dur: s.dur, bare: !!s.bare, caps: s.caps || [] })));
await browser.close();
server.close();
if (scenes.length !== script.scenes.length)
  throw new Error(`${scenes.length} scenes but ${script.scenes.length} scripts`);

const timing = [];
let chars = 0;
for (const [i, sc] of scenes.entries()) {
  const spec = script.scenes[i];
  const lines = spec.lines.map((l) => (Array.isArray(l) ? l : [l, l]));
  const anchors = spec.at || sc.caps.map((c) => c[0]);
  if (anchors.length !== lines.length)
    throw new Error(`scene ${i}: ${lines.length} lines for ${anchors.length} anchors`);
  const clips = [];
  for (const [say] of lines) {
    chars += say.length;
    const file = await clip(say);
    clips.push({ file: file.slice(root.length + 1), len: seconds(file) });
  }
  // smallest slow-down s >= 1 so that every sentence starts at its anchor (scaled) without overlapping the last
  let s = 1,
    starts;
  for (; ; s += 0.01) {
    let end = 0;
    starts = anchors.map((a, j) => {
      const at = Math.max(a * s, end + PAD, j === 0 ? 0.5 : 0);
      end = at + clips[j].len;
      return at;
    });
    const last = starts.at(-1) + clips.at(-1).len;
    if (starts.every((t, j) => t <= anchors[j] * s + 0.05) && last <= sc.dur * s - 0.6) break;
    if (s > 3) {
      // anchors too tight at any speed: let the scene simply run on after the last sentence
      s = Math.max(1, (last + 0.9) / sc.dur);
      break;
    }
  }
  const lastEnd = starts.at(-1) + clips.at(-1).len;
  const dur = Math.max(sc.dur * s, lastEnd + 0.6);
  timing.push({
    dur: +dur.toFixed(2),
    caps: lines.map(([, cap], j) => [+starts[j].toFixed(2), +(starts[j] + clips[j].len + 0.25).toFixed(2), cap]),
    clips: clips.map((c, j) => ({ file: c.file, at: +starts[j].toFixed(2), len: +c.len.toFixed(2) })),
  });
}
const total = timing.reduce((a, t) => a + t.dur, 0);
writeFileSync(
  join(root, "videos", "audio", `${name}.js`),
  `/* voice-over timing: generated by tools/narrate.js (do not edit) */\nVID.narration = ${JSON.stringify({ scenes: timing.map((t) => ({ dur: t.dur, caps: t.caps })) })};\n`,
);
writeFileSync(join(root, "videos", "audio", `${name}.json`), JSON.stringify({ fake, scenes: timing }, null, 1));
console.log(
  `${name}: ${chars} characters, ${total.toFixed(1)} s (was ${scenes.reduce((a, s) => a + s.dur, 0)} s)${fake ? " [fake audio]" : ""}`,
);
