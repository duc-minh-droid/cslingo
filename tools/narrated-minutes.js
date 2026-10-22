/* After voicing: list the narrated videos and put their lengths into the app:  node tools/narrated-minutes.js [--write]
   A video counts as narrated when videos/audio/<name>.json exists, is not from the fake engine, and videos/out/<name>.mp4 is newer.
   Prints the NARRATED line of each course manifest (js/content/{nic,ds,algo}/videos.js: video number -> whole minutes); with --write it
   replaces that line in the file (then run prettier on those three files). The app then calls those videos narrated and
   shows their real length. */
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { root } from "./video-lib.js";

const COURSES = [
  ["lecture", "nic", 8],
  ["ds", "ds", 7],
  ["algo", "algo", 10],
];
const write = process.argv.includes("--write");
for (const [prefix, dir, count] of COURSES) {
  const found = {};
  for (let n = 1; n <= count; n++) {
    const name = prefix === "ds" ? `ds-${n}` : `${prefix}-${n}`;
    const json = join(root, "videos", "audio", `${name}.json`);
    const mp4 = join(root, "videos", "out", `${name}.mp4`);
    if (!existsSync(json) || !existsSync(mp4)) continue;
    const t = JSON.parse(readFileSync(json, "utf8"));
    if (t.fake || statSync(mp4).mtimeMs < statSync(json).mtimeMs) continue;
    found[n] = Math.max(1, Math.round(t.scenes.reduce((s, sc) => s + sc.dur, 0) / 60));
  }
  const line = `const NARRATED = ${JSON.stringify(found).replace(/"/g, "")};`;
  console.log(`${dir}: ${Object.keys(found).length}/${count} narrated  ${line}`);
  if (write) {
    const file = join(root, "js", "content", dir, "videos.js");
    const src = readFileSync(file, "utf8");
    if (!/const NARRATED = \{[^}]*\};/.test(src)) throw new Error(`${file}: no NARRATED line`);
    writeFileSync(file, src.replace(/const NARRATED = \{[^}]*\};/, line));
  }
}
