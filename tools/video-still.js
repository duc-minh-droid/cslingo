/* Draw single frames of an explainer video to PNG, to check a scene by eye.
     node tools/video-still.js <lecture-5|lecture-6> <t1,t2,...> [outDir]
   Times are seconds from the start of the whole video, or  s<scene>@<local seconds>  (for example  s3@4.5  is 4.5 s into scene 3,
   counting from 1). Prints each PNG path, then any page errors. `node tools/video-still.js <name> info` lists the scenes. */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { serve, launch, openVideo, root } from "./video-lib.js";

const [name, spec, out = join(root, "videos", "stills")] = process.argv.slice(2);
if (!name || !spec) {
  console.error("usage: node tools/video-still.js <lecture-5|lecture-6> <t1,t2,...|info> [outDir]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });
const { server, base } = await serve();
const browser = await launch();
try {
  const { page, errors } = await openVideo(browser, base, name);
  const info = await page.evaluate(() => {
    let a = 0;
    return {
      total: VID.total,
      scenes: VID.scenes.map((d, i) => ({ n: i + 1, start: (a += i ? VID.scenes[i - 1].dur : 0), dur: d.dur })),
    };
  });
  if (spec === "info") console.log(JSON.stringify(info, null, 1));
  else {
    for (const part of spec.split(",")) {
      const m = /^s(\d+)@([\d.]+)$/.exec(part);
      const t = m ? info.scenes[+m[1] - 1].start + +m[2] : +part;
      await page.evaluate((x) => VID.seek(x), t);
      const file = join(out, `${name}-${m ? `s${m[1]}-${m[2]}` : `t${t}`}.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
  }
  errors.forEach((e) => console.log("ERROR " + e));
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
