/* Record an explainer video frame by frame:  node tools/render-video.js <lecture-5|lecture-6> [outFile] [--fps 30] [--workers 4]
   Each frame is drawn by VID.seek(t) in headless Chromium (1080 x 1080) and saved as a PNG, then ffmpeg joins them into an
   H.264 mp4. Needs ffmpeg with libx264: set FFMPEG=/path/to/ffmpeg (the Playwright copy cannot encode H.264;
   `pip install imageio-ffmpeg` ships one). If videos/audio/<name>.json exists (tools/narrate.js) the voice-over is mixed in. */
import { mkdirSync, rmSync, mkdtempSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { serve, launch, openVideo, root } from "./video-lib.js";

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(`--${n}`) ? +args[args.indexOf(`--${n}`) + 1] : d);
const [name, outArg] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
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
  const total = await first.page.evaluate(() => VID.total);
  const frames = Math.floor(total * fps);
  console.log(`${name}: ${total.toFixed(1)} s, ${frames} frames at ${fps} fps, ${workers} workers`);
  const pages = [
    first,
    ...(await Promise.all(Array.from({ length: workers - 1 }, () => openVideo(browser, base, name)))),
  ];
  let done = 0;
  await Promise.all(
    pages.map(async ({ page, errors }, w) => {
      for (let f = w; f < frames; f += workers) {
        await page.evaluate((t) => VID.seek(t), f / fps);
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
        inputs.push("-i", join(root, c.file));
        delays.push(Math.round((at + c.at) * 1000));
      });
      at += sc.dur;
    });
  }
  const n0 = 1; // input 0 is the picture sequence
  const graph = delays.length
    ? `${delays.map((d, i) => `[${i + n0}:a]adelay=${d}|${d}[a${i}]`).join(";")};${delays.map((_, i) => `[a${i}]`).join("")}amix=inputs=${delays.length}:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad[aud]`
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
        ? ["-filter_complex", graph, "-map", "0:v", "-map", "[aud]", "-c:a", "aac", "-b:a", "160k", "-shortest"]
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
