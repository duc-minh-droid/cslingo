/* One command for every check that needs the app running:  npm test
   Serves the repo, opens it in headless Chromium and runs the in-page suites (smoke, boss quizzes, revision bank,
   answer-bias audit) plus the structure check. Exits non-zero on any failure, so CI can block a bad change.
   Needs Playwright with a Chromium (`npx playwright install chromium`), or PLAYWRIGHT_CHROMIUM_PATH for a local one. */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { checkStructure } from "./check-structure.js";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const require = createRequire(import.meta.url);
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".wasm": "application/wasm",
};

function loadPlaywright() {
  for (const id of ["playwright", "/opt/node22/lib/node_modules/playwright"]) {
    try {
      return require(id);
    } catch {
      /* try the next location */
    }
  }
  throw new Error("Playwright not found: run `npm install` (and `npx playwright install chromium`)");
}

function serve() {
  const server = createServer((req, res) => {
    const path = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const file = existsSync(path) && statSync(path).isDirectory() ? join(path, "index.html") : path;
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

const failures = [];
const fail = (area, items) =>
  items.forEach((x) => failures.push(`${area}: ${typeof x === "string" ? x : JSON.stringify(x)}`));

fail("structure", checkStructure());

const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/`;
const { chromium } = loadPlaywright();
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_PATH ||
    (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
await page.addInitScript(() => localStorage.setItem("nic.onboarded", "true"));
await page.goto(url);
await page.waitForFunction(() => window.NIC && NIC.content, null, { timeout: 20000 });
for (const f of ["answer", "smoke", "boss-test", "bank-test", "answer-bias", "bank-coverage"])
  await page.addScriptTag({ path: join(root, "tools", `${f}.js`) });
await page.evaluate(async () => {
  await NIC.content.all();
  await NIC.bank.load();
});
await page.waitForTimeout(1500); // let the lazy libraries (Chart.js, GSAP) arrive, as they do for a real visitor

const steps = [
  [
    "smoke",
    () =>
      page.evaluate(async () => {
        const r = await smoke();
        return r.errors;
      }),
  ],
  ["boss quizzes", () => page.evaluate(async () => (await bossTest()).failures)],
  ["revision bank", () => page.evaluate(async () => (await bankTest()).failures)],
  ["answer bias", () => page.evaluate(() => answerBias().calcRisk)],
];
for (const [name, run] of steps) {
  const t = Date.now();
  const out = await run();
  console.log(`${out.length ? "FAIL" : "ok  "} ${name} (${Math.round((Date.now() - t) / 1000)}s)`);
  fail(name, out);
}
fail("page errors", [...new Set(pageErrors)]);

await browser.close();
server.close();
if (failures.length) {
  console.error("\n" + failures.join("\n"));
  process.exit(1);
}
console.log("\nall checks passed");
