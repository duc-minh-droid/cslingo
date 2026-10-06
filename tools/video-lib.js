/* Shared by the video tools: a static server for the repo and a headless Chromium (same lookup as tools/run-tests.js). */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const root = join(fileURLToPath(import.meta.url), "..", "..");
const require = createRequire(import.meta.url);
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

export function loadPlaywright() {
  for (const id of ["playwright", "/opt/node22/lib/node_modules/playwright"]) {
    try {
      return require(id);
    } catch {
      /* try the next location */
    }
  }
  throw new Error("Playwright not found: run `npm install` (and `npx playwright install chromium`)");
}

/** Serve the repo on a free port; resolves to {server, base}. */
export function serve() {
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
  return new Promise((ok) =>
    server.listen(0, "127.0.0.1", () => ok({ server, base: `http://127.0.0.1:${server.address().port}` })),
  );
}

export async function launch() {
  const { chromium } = loadPlaywright();
  return chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_PATH ||
      (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined),
  });
}

/** Open a lecture page at 1080 x 1080 in recording mode; resolves to {page, errors} once the engine is ready. */
export async function openVideo(browser, base, name) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`page error: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(`${base}/videos/${name}.html?rec=1`);
  await page.waitForFunction(() => window.__vidReady === true, null, { timeout: 20000 });
  return { page, errors };
}
