/* Storage and account-sync checks, run from Node (Playwright) because each one needs its own browser context.
   1. Storage that throws (a full quota, or private mode): the app must still draw the path, let a lesson be finished, and keep
      the progress in memory for the session. (js/core/progress.js falls back to a Map; js/sync.js must never touch localStorage raw.)
   2. localStorage that is blocked outright (reading `window.localStorage` throws): the same.
   3. Account sync, against a fake Supabase client: the account wins keys without a merge rule on the first sync, this device wins
      them afterwards, a different account signing in over progress is asked first, log out is local, and an outage shows a friendly line. */
/* global window, document, localStorage, location, setTimeout, Storage, DOMException, NIC, answerCurrent */
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");

/* Open a fresh page. `stub` runs before any app script. */
async function open(browser, url, stub, problems, label) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`${label}: page error: ${e.message}`));
  await page.addInitScript(stub);
  await page.goto(url);
  await page.waitForFunction(() => window.NIC && NIC.content && NIC.refresh, null, { timeout: 20000 });
  await page.addScriptTag({ path: join(root, "tools", "answer.js") });
  await page.waitForTimeout(800);
  return { page, context };
}

/* Walk one lesson to its complete screen through the real player, then back to the path. */
const walkLesson = (page, id) =>
  page.evaluate(async (id) => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const out = { opened: false, completed: false };
    await NIC.content.all();
    location.hash = id;
    await wait(400);
    out.opened = NIC.player.isOpen();
    for (let g = 0; g < 150 && NIC.player.isOpen(); g++) {
      const st = NIC.player.state();
      if (st.kind === "complete") {
        out.completed = true;
        break;
      }
      if (st.Q && /check/.test(st.foot)) await answerCurrent();
      document.querySelector(".pl-go").click();
      await wait(30);
    }
    out.done = !!NIC.store.get("nic.lessonDone", {})[id];
    out.xp = NIC.game.totalXP();
    out.quests = NIC.game.quests().length;
    if (NIC.player.isOpen()) NIC.player.close(true);
    await wait(500);
    out.nodes = document.querySelectorAll("#main .p-node").length;
    out.pos = (NIC.store.get("nic.lessonPos", {}) || {})[id];
    return out;
  }, id);

async function brokenStorage(browser, url, problems, label, stub) {
  const { page, context } = await open(browser, url, stub, problems, label);
  const before = await page.evaluate(() => document.querySelectorAll("#main .p-node").length);
  if (!before) problems.push(`${label}: the path did not render`);
  const r = await walkLesson(page, "l1-what");
  if (!r.opened) problems.push(`${label}: the lesson player did not open`);
  if (!r.completed) problems.push(`${label}: the lesson could not be finished`);
  if (!r.done) problems.push(`${label}: a finished lesson was not remembered for the session`);
  if (!(r.xp > 0)) problems.push(`${label}: no XP was kept`);
  if (!r.nodes) problems.push(`${label}: the path was empty after the lesson`);
  const warned = await page.evaluate(() => /Progress can't be saved/.test(document.body.innerText));
  if (!warned) problems.push(`${label}: the learner was never told progress can't be saved`);
  await context.close();
}

/* A stand-in for the Supabase client: two tables in memory, save_progress upserts, and every sign-out is recorded. */
const FAKE = () => {
  const cloud = { items: [], prefs: [], fail: null, signOuts: [], rpcs: [] };
  window.__cloud = cloud;
  const rows = (t) => (t === "progress_items" ? cloud.items : cloud.prefs);
  return {
    from: (t) => ({
      select: () => ({
        range: (a, b) =>
          Promise.resolve(
            cloud.fail
              ? { data: null, error: { message: cloud.fail } }
              : { data: rows(t).slice(a, b + 1), error: null },
          ),
      }),
    }),
    rpc: (name, args) => {
      cloud.rpcs.push(name);
      (args.p_items || []).forEach((r) => {
        const i = cloud.items.findIndex((x) => x.kind === r.kind && x.item === r.item);
        if (i < 0) cloud.items.push(r);
        else cloud.items[i] = r;
      });
      (args.p_prefs || []).forEach((r) => {
        const i = cloud.prefs.findIndex((x) => x.key === r.key);
        if (i < 0) cloud.prefs.push(r);
        else cloud.prefs[i] = r;
      });
      return Promise.resolve({ error: null });
    },
    auth: {
      signOut: (o) => {
        cloud.signOuts.push(o);
        return Promise.resolve({});
      },
    },
  };
};

async function syncChecks(browser, url, problems) {
  const { page, context } = await open(
    browser,
    url,
    () => localStorage.setItem("nic.onboarded", "true"),
    problems,
    "sync",
  );
  await page.addScriptTag({ content: `window.__makeFake = ${FAKE.toString()}` });
  const r = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__nicNoReload = true;
    const S = NIC.sync,
      T = S._test,
      raw = (k) => localStorage.getItem(k),
      out = {};
    const as = (id) => ({ id, email: `${id}@cslingo.app` });
    const client = window.__makeFake();
    T.use(client, null);
    const cloud = window.__cloud;

    // 1. first sync: the account's goal wins over this device's onboarding default; later this device's change wins
    cloud.prefs.push({ key: "nic.goal", value: 10, raw: false }, { key: "nic.course", value: "ds", raw: false });
    NIC.store.set("nic.goal", 50);
    NIC.store.set("nic.course", "algo");
    T.setUser(as("u1"));
    await S.settled(5000);
    out.firstGoal = raw("nic.goal");
    out.firstCourse = raw("nic.course");
    out.state = S.status();
    out.lastUser = raw("nic.lastUser");
    NIC.store.set("nic.goal", 30);
    await S.now();
    out.laterCloudGoal = cloud.prefs.find((p) => p.key === "nic.goal").value;
    out.leaked = cloud.prefs.filter((p) => /lastUser|syncedUser|syncUser|syncDirty/.test(p.key)).length;

    // 2. the same account again asks nothing
    let asked = 0;
    S.askAdopt = async () => (asked++, "add");
    NIC.store.set("nic.lessonDone", { mine: true });
    await S.now();
    T.setUser(null);
    T.setUser(as("u1"));
    await S.settled(5000);
    out.askedSame = asked;

    // 3. a different account signing in over progress: "add" merges, nothing is lost
    T.setUser(null);
    NIC.store.set("nic.lessonDone", { mine: true, offline: true });
    T.setUser(as("u2"));
    await S.settled(5000);
    out.askedOther = asked;
    out.addedKept = !!JSON.parse(raw("nic.lessonDone") || "{}").offline;
    out.addedPushed = cloud.items.some((i) => i.kind === "lesson_done" && i.item === "offline");
    out.lastUserAfterAdd = raw("nic.lastUser");

    // 4. "fresh" clears this device's progress and keeps only the account's
    T.setUser(null);
    cloud.items.length = 0;
    cloud.prefs.length = 0;
    cloud.items.push({ kind: "lesson_done", item: "theirs", value: true });
    NIC.store.set("nic.lessonDone", { mine: true });
    S.askAdopt = async () => "fresh";
    T.setUser(as("u3"));
    await S.settled(5000);
    const done = JSON.parse(raw("nic.lessonDone") || "{}");
    out.freshMine = !!done.mine;
    out.freshTheirs = !!done.theirs;
    out.onboardedKept = raw("nic.onboarded");

    // 5. "cancel" signs out locally and merges nothing
    T.setUser(null);
    cloud.items.length = 0;
    NIC.store.set("nic.lessonDone", { mine: true });
    S.askAdopt = async () => null;
    cloud.signOuts.length = 0;
    T.setUser(as("u4"));
    await S.settled(5000);
    out.cancelSignOut = JSON.stringify(cloud.signOuts);
    out.cancelPushed = cloud.items.length;

    // 6. log out is local to this device
    T.setUser(as("u3"));
    await S.settled(5000);
    cloud.signOuts.length = 0;
    await S.signOut();
    out.signOutArgs = JSON.stringify(cloud.signOuts);

    // 7. an outage is a friendly line, never the raw error
    T.use(client, as("u3"));
    cloud.fail = "TypeError: Failed to fetch";
    await S.now();
    await wait(300);
    out.outage = S.status().state;
    out.toast = [...document.querySelectorAll(".toast")].map((t) => t.innerText).join(" | ");
    cloud.fail = null;
    await S.now();
    out.recovered = S.status().state;
    return out;
  });
  const bad = (cond, msg) => cond && problems.push(`sync: ${msg}`);
  bad(r.firstGoal !== "10", `the first sync should let the account win the goal (got ${r.firstGoal})`);
  bad(r.firstCourse !== '"ds"', `the first sync should let the account win the course (got ${r.firstCourse})`);
  bad(
    r.state.state !== "synced" || !r.state.loggedIn || r.state.user !== "u1",
    `status() after a sync: ${JSON.stringify(r.state)}`,
  );
  bad(!r.lastUser, "nic.lastUser was not stored");
  bad(r.laterCloudGoal !== 30, `after the first sync this device's goal should win (cloud has ${r.laterCloudGoal})`);
  bad(r.leaked, "device-only keys (lastUser, syncedUser...) were pushed to the account");
  bad(r.askedSame, "the same account was asked what to do with this device's progress");
  bad(r.askedOther !== 1, `a different account over progress should be asked once (asked ${r.askedOther} times)`);
  bad(!r.addedKept || !r.addedPushed, "'add' did not merge this device's progress into the account");
  bad(r.freshMine || !r.freshTheirs, "'start fresh' should keep only the account's progress");
  bad(r.onboardedKept !== "true", "'start fresh' removed nic.onboarded");
  bad(!/"scope":"local"/.test(r.cancelSignOut), `Cancel should sign out locally (got ${r.cancelSignOut})`);
  bad(r.cancelPushed, "Cancel still pushed this device's progress to the account");
  bad(!/"scope":"local"/.test(r.signOutArgs), `signOut should use scope local (got ${r.signOutArgs})`);
  bad(r.outage !== "offline", `an outage should show state "offline" (got ${r.outage})`);
  bad(!/Can't reach your account/.test(r.toast) || /Failed to fetch/.test(r.toast), `outage toast: ${r.toast}`);
  bad(r.recovered !== "synced", `sync did not recover after the outage (${r.recovered})`);
  await context.close();
}

/* A device that was logged in before this build stored any ids (nic.syncUser but no nic.lastUser): it is a returning device,
   so its own unsynced goal still wins on the next sync instead of being replaced by the account's. */
async function legacyCheck(browser, url, problems) {
  const stub = () => {
    localStorage.setItem("nic.onboarded", "true");
    localStorage.setItem("nic.syncUser", JSON.stringify("old@cslingo.app"));
    localStorage.setItem("nic.goal", "50");
    localStorage.setItem("nic.syncDirty", "1");
  };
  const { page, context } = await open(browser, url, stub, problems, "legacy");
  await page.addScriptTag({ content: `window.__makeFake = ${FAKE.toString()}` });
  const r = await page.evaluate(async () => {
    window.__nicNoReload = true;
    await NIC.syncReady; // the real client has looked for a session (there is none) by now
    NIC.sync._test.use(window.__makeFake(), null);
    window.__cloud.prefs.push({ key: "nic.goal", value: 10, raw: false });
    NIC.sync._test.setUser({ id: "old", email: "old@cslingo.app" });
    await NIC.sync.settled(5000);
    return {
      goal: localStorage.getItem("nic.goal"),
      cloud: window.__cloud.prefs.find((p) => p.key === "nic.goal").value,
    };
  });
  if (r.goal !== "50" || r.cloud !== 50)
    problems.push(`legacy: a returning device lost its own goal on the first sync (${JSON.stringify(r)})`);
  await context.close();
}

/* A scenario that throws (the app did not even start) is a failed check, not a crashed test run. */
const guard = async (problems, label, fn) => {
  try {
    await fn();
  } catch (e) {
    problems.push(`${label}: ${String((e && e.message) || e).split("\n")[0]}`);
  }
};

export async function storageChecks(browser, url) {
  const problems = [];
  await guard(problems, "storage full", () =>
    brokenStorage(browser, url, problems, "storage full", () => {
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === "nic.onboarded") return set.call(this, k, v);
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      };
    }),
  );
  await guard(problems, "storage blocked", () =>
    brokenStorage(browser, url, problems, "storage blocked", () => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    }),
  );
  await guard(problems, "sync", () => syncChecks(browser, url, problems));
  await guard(problems, "legacy", () => legacyCheck(browser, url, problems));
  return problems;
}
