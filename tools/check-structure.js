/* Structure check: every script under js/ is wired up somewhere, and nothing points at a missing file.
   A file counts as wired if index.html loads it, or it is listed in the content manifest (js/content.js) or the
   revision-question manifest (js/bank.js). Exported so tools/run-tests.js can run it; also runnable on its own. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

export function checkStructure() {
  const problems = [];
  const files = walk(join(root, "js")).map((p) => relative(root, p).replaceAll("\\", "/"));
  const refs = new Set();
  const grab = (text) => [...text.matchAll(/["'(]((?:js)\/[\w./-]+\.js)/g)].forEach((m) => refs.add(m[1]));
  grab(readFileSync(join(root, "index.html"), "utf8"));
  for (const f of ["js/content.js", "js/bank.js"]) grab(readFileSync(join(root, f), "utf8"));
  // revision questions: js/bank.js builds js/bank/<course>-NN.js names from a count per course
  const partsText = readFileSync(join(root, "js/bank.js"), "utf8").match(/PARTS = \{([^}]*)\}/)[1];
  for (const [, course, n] of partsText.matchAll(/(\w+):\s*(\d+)/g))
    for (let i = 1; i <= +n; i++) refs.add(`js/bank/${course}-${String(i).padStart(2, "0")}.js`);
  for (const f of files)
    if (!refs.has(f)) problems.push(`not loaded anywhere (index.html, content.js or bank.js): ${f}`);
  for (const r of refs) if (!files.includes(r)) problems.push(`referenced but missing: ${r}`);
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const p = checkStructure();
  console.log(p.length ? p.join("\n") : "structure ok");
  process.exit(p.length ? 1 : 0);
}
