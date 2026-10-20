/* Record an explainer video frame by frame:  node tools/render-video.js <lecture-5|lecture-6> [outFile] [--fps 30] [--workers 4] [--scenes 1-3]
   Each frame is drawn by VID.seek(t) in headless Chromium (1080 x 1080) and saved as a PNG, then ffmpeg joins them into an
   H.264 mp4. Needs ffmpeg with libx264: set FFMPEG=/path/to/ffmpeg (the Playwright copy cannot encode H.264;
   `pip install imageio-ffmpeg` ships one). If videos/audio/<name>.json exists (tools/narrate.js) the voice-over (and its music bed) is mixed in. */
import { mkdirSync, rmSync, mkdtempSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { serve, launch, openVideo, root } from "./video-lib.js";

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(`--${n}`) ? +args[args.indexOf(`--${n}`) + 1] : d);
const [name, outArg] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const sceneArg = args.includes("--scenes") ? args[args.indexOf("--scenes") + 1] : null;
const fps = flag("fps", 30),
  workers = flag("workers", 4);
if (!name) {
  console.error("usage: node tools/render-video.js <lecture-5|lecture-6> [outFile] [--fps 30] [--workers 4]");
  process.exit(2);
}
const out = outArg || join(root, "videos", "out", `${name}.mp4`);
mkdirSync(join(out, ".."), { recursive: true });
const dir = mkdtempSync(join(tmpdir(), "vid-"));
const { server, base } = await serve();
const browser = await launch();
try {
  const first = await openVideo(browser, base, name);
  // --scenes A-B records only scenes A..B (a quick test of one stretch); t0 is where that stretch starts in the full video
  const durs = await first.page.evaluate(() => VID.scenes.map((s) => s.dur));
  const span = sceneArg ? sceneArg.split("-").map(Number) : [0, durs.length - 1];
  const t0 = durs.slice(0, span[0]).reduce((a, d) => a + d, 0);
  const total = durs.slice(span[0], (span[1] ?? span[0]) + 1).reduce((a, d) => a + d, 0);
  const frames = Math.floor(total * fps);
  console.log(
    `${name}: ${total.toFixed(1)} s from ${t0.toFixed(1)} s, ${frames} frames at ${fps} fps, ${workers} workers`,
  );
  const pages = [
    first,
    ...(await Promise.all(Array.from({ length: workers - 1 }, () => openVideo(browser, base, name)))),
  ];
  let done = 0;
  await Promise.all(
    pages.map(async ({ page, errors }, w) => {
      for (let f = w; f < frames; f += workers) {
        await page.evaluate((t) => VID.seek(t), t0 + f / fps);
        await page.screenshot({ path: join(dir, `${String(f).padStart(5, "0")}.png`) });
        if (++done % 200 === 0) console.log(`  ${done}/${frames}`);
      }
      if (errors.length) throw new Error(errors.join("\n"));
    }),
  );
  // voice-over: every clip delayed to its start (scene start + sentence start), mixed, levelled to about -16 LUFS
  const track = join(root, "videos", "audio", `${name}.json`);
  const vo = existsSync(track) ? JSON.parse(readFileSync(track, "utf8")) : null;
  const inputs = [],
    delays = [];
  if (vo) {
    let at = 0;
    vo.scenes.forEach((sc) => {
      sc.clips.forEach((c) => {
        const when = at + c.at - t0;
        if (when < 0 || when >= total) return; // outside the recorded stretch
        inputs.push("-i", join(root, c.file));
        delays.push(Math.round(when * 1000));
      });
      at += sc.dur;
    });
  }
  // music bed (videos/narration/<name>.json "music", copied into the timing file): only the part the video needs, from "start",
  // ducked under the voice (sidechain) and faded out over the last 3 s
  const mus = vo && vo.music && vo.music.file && existsSync(join(root, vo.music.file)) ? vo.music : null;
  if (mus) inputs.push("-ss", String((mus.start || 0) + t0), "-t", String(total + 1), "-i", join(root, mus.file));
  const n0 = 1, // input 0 is the picture sequence
    mi = n0 + delays.length; // the music input, if any
  const LOUD = "loudnorm=I=-16:TP=-1.5:LRA=11,apad[aud]";
  const voiceMix = delays.length
    ? `${delays.map((d, i) => `[${i + n0}:a]adelay=${d}|${d}[a${i}]`).join(";")};${delays.map((_, i) => `[a${i}]`).join("")}amix=inputs=${delays.length}:normalize=0:dropout_transition=0`
    : "";
  const bed = mus
    ? `[${mi}:a]volume=${mus.volume ?? 0.18},afade=t=out:st=${Math.max(0, total - 3).toFixed(2)}:d=3[mus]`
    : "";
  const graph =
    voiceMix && bed
      ? `${voiceMix},asplit=2[vo][key];${bed};[mus][key]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=500[duck];[vo][duck]amix=inputs=2:normalize=0,${LOUD}`
      : voiceMix
        ? `${voiceMix},${LOUD}`
        : bed
          ? `${bed};[mus]${LOUD}`
          : null;
  const ff = spawnSync(
    process.env.FFMPEG || "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-framerate",
      String(fps),
      "-i",
      join(dir, "%05d.png"),
      ...inputs,
      ...(graph
        ? [
            "-filter_complex",
            graph,
            "-map",
            "0:v",
            "-map",
            "[aud]",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-shortest",
          ]
        : []),
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
  if (ff.status !== 0) throw new Error("ffmpeg failed");
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
