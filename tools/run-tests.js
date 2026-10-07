/* One command for every check that needs the app running:  npm test
   Serves the repo, opens it in headless Chromium and runs the in-page suites (smoke, boss quizzes, revision bank,
   answer-bias audit), the keyboard checks, the accessibility checks (tools/a11y-test.js), the storage and account-sync checks (tools/storage-test.js) plus the structure check. Exits non-zero on any failure, so CI can block a bad change.
   Needs Playwright with a Chromium (`npx playwright install chromium`), or PLAYWRIGHT_CHROMIUM_PATH for a local one. */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { checkStructure } from "./check-structure.js";
import { keyboardChecks } from "./keyboard-test.js";
import { storageChecks } from "./storage-test.js";
import { shellChecks } from "./shell-test.js";
import { a11yChecks } from "./a11y-test.js";

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
// a stylesheet font, script or icon that 404s is a bug even when nothing else notices (same-origin requests only)
const badRequests = [];
page.on("response", (r) => {
  if (r.url().startsWith(url) && r.status() >= 400) badRequests.push(`${r.status()} ${r.url().slice(url.length)}`);
});
page.on("requestfailed", (r) => {
  // headless Chromium has no H.264 decoder, so it aborts the recap videos; that is not a bug
  if (r.url().startsWith(url) && !r.url().includes(".mp4")) badRequests.push(`failed ${r.url().slice(url.length)}`);
});
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

/* Each step returns its problems plus a count of what it covered, so a run that tested nothing can't pass. */
const steps = [
  [
    "smoke",
    () =>
      page.evaluate(async () => {
        const r = await smoke();
        return { problems: r.errors, covered: r.modules, what: "modules" };
      }),
  ],
  [
    "boss quizzes",
    () =>
      page.evaluate(async () => {
        const r = await bossTest();
        return { problems: r.failures, covered: r.bosses, what: "bosses" };
      }),
  ],
  [
    "revision bank",
    () =>
      page.evaluate(async () => {
        const r = await bankTest();
        return { problems: r.failures, covered: r.questions, what: "questions" };
      }),
  ],
  [
    "answer bias",
    () =>
      page.evaluate(() => {
        const r = answerBias();
        return { problems: r.calcRisk, covered: r.total, what: "questions" };
      }),
  ],
];
for (const [name, run] of steps) {
  const t = Date.now();
  const { problems, covered, what } = await run();
  if (!covered) problems.push(`covered no ${what}`);
  console.log(
    `${problems.length ? "FAIL" : "ok  "} ${name} (${Math.round((Date.now() - t) / 1000)}s, ${covered} ${what})`,
  );
  fail(name, problems);
}
{
  const t = Date.now();
  const problems = await keyboardChecks(page);
  console.log(`${problems.length ? "FAIL" : "ok  "} keyboard (${Math.round((Date.now() - t) / 1000)}s)`);
  fail("keyboard", problems);
}
{
  const t = Date.now();
  const problems = await storageChecks(browser, url); // blocked or full storage, and account sync against a fake client
  console.log(`${problems.length ? "FAIL" : "ok  "} storage and sync (${Math.round((Date.now() - t) / 1000)}s)`);
  fail("storage", problems);
}
{
  const t = Date.now();
  const problems = await shellChecks(page); // the top bar, the phase banner, course search, boss status, phone widths
  console.log(`${problems.length ? "FAIL" : "ok  "} shell (${Math.round((Date.now() - t) / 1000)}s)`);
  fail("shell", problems);
}
{
  const t = Date.now();
  const problems = await a11yChecks(page); // answer controls, figure and chart descriptions, the runner and the focus ring
  console.log(`${problems.length ? "FAIL" : "ok  "} accessibility (${Math.round((Date.now() - t) / 1000)}s)`);
  fail("accessibility", problems);
}
fail("page errors", [...new Set(pageErrors)]);
fail("requests", [...new Set(badRequests)]);

await browser.close();
server.close();
if (failures.length) {
  console.error("\n" + failures.join("\n"));
  process.exit(1);
}
console.log("\nall checks passed");
