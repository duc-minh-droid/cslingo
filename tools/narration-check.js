/* Check a narration script before voicing it:  node tools/narration-check.js <name>
   - the number of scenes and of lines per scene must match the page (one spoken line per caption; "at" lists on title/recap cards);
   - each spoken line should read like the example (TODO.md): plain sentences, no digits or maths symbols (write numbers as words),
     at most about 38 words, no placeholder text left;
   - prints the estimated narrated length of every scene at about 135 words a minute with 0.5 s pauses (the real length is measured
     when the clips exist) and the total, and warns when a scene's original animation is much longer than its speech.
   Exit code 1 when anything must be fixed; warnings do not fail. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { serve, launch, openVideo, root } from "./video-lib.js";

const name = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!name) {
  console.error("usage: node tools/narration-check.js <name>");
  process.exit(2);
}
const file = join(root, "videos", "narration", `${name}.json`);
if (!existsSync(file)) {
  console.error(`${file} does not exist (node tools/narration-skeleton.js ${name})`);
  process.exit(2);
}
const script = JSON.parse(readFileSync(file, "utf8"));
const { server, base } = await serve();
const browser = await launch();
let pages;
try {
  const { page } = await openVideo(browser, base, name, { raw: true });
  pages = await page.evaluate(() => VID.scenes.map((s) => ({ dur: s.dur, caps: s.caps || [] })));
} finally {
  await browser.close();
  server.close();
}
const bad = [];
const warn = [];
const WPS = 135 / 60;
const spoken = (l) => (typeof l === "string" ? l : Array.isArray(l) ? l[0] : l.say);
const P = { pause: 0.5, lead: 0.5, tail: 0.8, ...(script.pace || {}) };
if (script.scenes.length !== pages.length)
  bad.push(`${script.scenes.length} scenes in the script, ${pages.length} on the page`);
let total = 0;
const rows = [];
script.scenes.forEach((sc, i) => {
  const pg = pages[i];
  if (!pg) return;
  const lines = sc.lines || [];
  if (pg.caps.length && lines.length !== pg.caps.length)
    bad.push(`scene ${i}: ${lines.length} lines for ${pg.caps.length} captions`);
  if (!pg.caps.length && (!sc.at || sc.at.length !== lines.length))
    bad.push(`scene ${i}: a scene without captions needs an "at" list with one time per line`);
  let secs = P.lead + P.tail;
  lines.forEach((l, j) => {
    const t = spoken(l) || "";
    const words = t.split(/\s+/).filter(Boolean).length;
    secs += words / WPS + (j ? P.pause : 0);
    const where = `scene ${i} line ${j + 1}`;
    if (/TITLE:|RECAP ROW|\(this scene has no captions\)/.test(t)) bad.push(`${where}: placeholder text left`);
    if (!t.trim()) bad.push(`${where}: empty`);
    if (/[0-9]/.test(t)) warn.push(`${where}: digits ("${t.match(/\S*[0-9]\S*/)[0]}"): write numbers as words`);
    if (/[×÷=<>→←≈≤≥%^$∑√/\\|*_{}[\]²³¹⁰⁴⁵⁶⁷⁸⁹]/.test(t)) warn.push(`${where}: a symbol the voice may read badly`);
    if (words > 38) warn.push(`${where}: ${words} words; split it or cut it (aim for 8 to 30)`);
    if (words < 3 && pg.caps.length) warn.push(`${where}: only ${words} words`);
  });
  total += Math.max(secs, 0);
  rows.push(
    `  scene ${String(i).padStart(2)}: ${lines.length} lines, about ${secs.toFixed(1)} s spoken (was ${pg.dur} s)`,
  );
});
console.log(rows.join("\n"));
console.log(`${name}: about ${total.toFixed(0)} s narrated (${(total / 60).toFixed(1)} min)`);
warn.forEach((w) => console.log("warning: " + w));
bad.forEach((b) => console.log("ERROR: " + b));
if (total > 330) console.log("warning: over 5.5 minutes; tighten the narration");
process.exitCode = bad.length ? 1 : 0;
