/* Structure check: every script and stylesheet is wired up somewhere, nothing is listed twice or points at a missing
   file, and no stylesheet outgrows the 500-line limit that ESLint's max-lines enforces for scripts.
   A file counts as wired if index.html loads it, or it is listed in the content manifest (js/content.js) or the
   revision-question manifest (js/bank.js). Exported so tools/run-tests.js can run it; also runnable on its own. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const MAX_CSS_LINES = 500;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const read = (f) => readFileSync(join(root, f), "utf8");

export function checkStructure() {
  const problems = [];
  const files = ["js", "css"].flatMap((d) => walk(join(root, d))).map((p) => relative(root, p).replaceAll("\\", "/"));
  const refs = new Map(); // path -> how many times a manifest lists it
  const add = (path) => refs.set(path, (refs.get(path) || 0) + 1);
  for (const f of ["index.html", "js/content.js", "js/bank.js"])
    [...read(f).matchAll(/["'(]((?:js|css)\/[\w./-]+\.(?:js|css))/g)].forEach((m) => add(m[1]));
  // revision questions: js/bank.js builds js/bank/<course>-NN.js names from a count per course
  const partsText = read("js/bank.js").match(/PARTS = \{([^}]*)\}/)[1];
  for (const [, course, n] of partsText.matchAll(/(\w+):\s*(\d+)/g))
    for (let i = 1; i <= +n; i++) add(`js/bank/${course}-${String(i).padStart(2, "0")}.js`);
  for (const f of files)
    if (!refs.has(f)) problems.push(`not loaded anywhere (index.html, content.js or bank.js): ${f}`);
  for (const [r, n] of refs) {
    if (!files.includes(r)) problems.push(`referenced but missing: ${r}`);
    if (n > 1) problems.push(`listed ${n} times: ${r}`);
  }
  for (const f of files.filter((f) => f.endsWith(".css"))) {
    const lines = read(f)
      .split("\n")
      .filter((l) => l.trim()).length;
    if (lines > MAX_CSS_LINES) problems.push(`${f} has ${lines} lines (limit ${MAX_CSS_LINES}): split it into parts`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const p = checkStructure();
  console.log(p.length ? p.join("\n") : "structure ok");
  process.exit(p.length ? 1 : 0);
}
