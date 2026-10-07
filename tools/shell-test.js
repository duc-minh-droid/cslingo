/* Shell checks (the app around the lesson player), run from Node (Playwright) with real scrolling, keys, viewports and requests.
   1. The top bar stays put after a long scroll, and the Algorithms banner names the phase you are looking at (also the last one).
   2. The phase picker lists every phase, jumps to one, and the guidebook rows open their lesson and show a tick when done.
   3. The course popover's search: unit titles, possessives and spaces don't matter, numbers match whole numbers, title hits come
      first, the list is capped with "+N more", the arrows pick a row and Enter opens it.
   4. A boss is "done" only when passed (80%), and its popover shows the score.
   5. A first look at a lesson is not "started": "Up next" and the green node agree.
   6. Phone widths (360, 375): nothing in the top bar is squeezed out and the page does not scroll sideways.
   7. "Keep your streak safe": shown once for a logged-out learner with something to lose, gone for good once dismissed.
   8. Course buttons scope Practice to that course; the dock, nodes and top bar say where they are to a screen reader.
   9. Keyboard: the skip link reaches the dock; the desktop rail only shows when it fits; an open popover survives a keyboard.
  10. A new day redraws the top bar; the sound switch follows the setting; the Profile overview and achievement progress show.
  11. A course that cannot download shows "Couldn't load" and a Try again that works. */
/* global window, document, location, localStorage, NIC, requestAnimationFrame, getComputedStyle, setTimeout, innerWidth, Event */

const BIG = { width: 1280, height: 800 };

/* Put the app in a known place: course home `hash`, scrolled to the top, every course loaded. */
async function openHome(page, hash) {
  await page.evaluate(async (hash) => {
    if (NIC.player.isOpen()) NIC.player.close(true);
    await NIC.content.all();
    location.hash = hash;
  }, hash);
  await page.waitForTimeout(500);
}

/* A fresh browser context (own storage), because several checks need progress that the shared page must not keep. */
async function fresh(page, { width = 390, height = 844, storage = {}, init } = {}) {
  const ctx = await page
    .context()
    .browser()
    .newContext({ viewport: { width, height }, hasTouch: width < 700 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(
    ([st]) => {
      if (localStorage.getItem("__shell")) return;
      localStorage.setItem("__shell", "1");
      localStorage.setItem("nic.onboarded", "true");
      for (const [k, v] of Object.entries(st)) localStorage.setItem(k, JSON.stringify(v));
    },
    [storage],
  );
  if (init) await p.addInitScript(init);
  return { p, ctx, errors };
}
async function boot(p, hash, base) {
  await p.goto(`${base}#${hash}`);
  await p.waitForFunction(() => window.NIC && NIC.content && NIC.refresh, null, { timeout: 20000 });
  await p.evaluate(() => NIC.content.all());
  await p.waitForTimeout(600);
}

export async function shellChecks(page) {
  const problems = [];
  const size = page.viewportSize();
  const base = page.url().split("#")[0];
  const bad = (msg) => problems.push(msg);

  // 1. the top bar stays at the top while the path scrolls, and the banner follows the phase
  for (const [w, h] of [
    [390, 844],
    [1280, 800],
    [1000, 1500], // a tall window: the last phases must still be able to reach the banner
  ]) {
    await page.setViewportSize({ width: w, height: h });
    await openHome(page, "algo-home");
    const seen = new Set();
    for (const y of [900, 3000, 5200, 99999]) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        const bar = document.querySelector("#topbar").getBoundingClientRect(),
          banner = document.querySelector(".unit-sticky").getBoundingClientRect();
        return {
          bar: Math.round(bar.top),
          banner: Math.round(banner.top),
          y: Math.round(window.scrollY),
          phase: document.querySelector(".us-t small").textContent,
          atBottom: window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
        };
      });
      seen.add(r.phase.split(" · ")[0]);
      const at = `${w}x${h}, scrolled to ${r.y}`;
      if (r.bar !== 0) bad(`top bar is ${r.bar}px from the top at ${at}, not 0`);
      if (r.banner < 0 || r.banner > 70) bad(`unit banner is ${r.banner}px from the top at ${at}`);
      if (r.atBottom && !/Phase 11/.test(r.phase))
        bad(`at the bottom of the Algorithms path the banner says "${r.phase}", not Phase 11 (${at})`);
    }
    // every phase can be reached by scrolling: scrub the whole page and collect the banner's phases
    const all = await page.evaluate(async () => {
      const out = new Set();
      for (let y = 0; y <= document.documentElement.scrollHeight; y += 150) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        out.add(document.querySelector(".us-t small").textContent.split(" · ")[0]);
      }
      return out.size;
    });
    if (all < 11) bad(`only ${all} of 11 phases ever reach the banner at ${w}x${h}`);
  }

  // 2. the phase picker and the guidebook
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, "algo-home");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  {
    const pick = await page.evaluate(() => {
      const g = document.querySelector(".us-guide");
      return { guide: g && g.getAttribute("aria-label"), pick: !!document.querySelector(".us-pick") };
    });
    if (!/^Guidebook for /.test(pick.guide || ""))
      bad(`the guidebook button has no name that says which phase (${pick.guide})`);
    if (!pick.pick) bad("the banner has no phase picker");
    else {
      await page.click(".us-pick");
      const rows = await page.$$eval(".us-opt", (r) => r.length);
      if (rows !== 11) bad(`the phase picker lists ${rows} phases, not 11`);
      await page.click('.us-opt[data-k="9"]');
      await page.waitForTimeout(2500); // the path is long now: the smooth scroll takes longer
      const ph = await page.$eval(".us-t small", (e) => e.textContent);
      if (!/Phase 10/.test(ph)) bad(`picking Phase 10 left the banner on "${ph}"`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => {
      // this page is shared with the suites before it: bossTest() leaves passed boss answers behind, and a passed boss
      // is "done" too, so clear them to leave exactly one finished lesson
      NIC.store.set("nic.quiz", {});
      NIC.store.set("nic.lessonDone", { "a1-bigo": true });
      NIC.refresh();
    });
    await page.waitForTimeout(600);
    await page.click(".us-guide");
    await page.waitForTimeout(400);
    const gb = await page.evaluate(() => ({
      links: document.querySelectorAll("a.gb-mod").length,
      ticks: document.querySelectorAll(".gb-mod .gb-tick").length,
    }));
    if (!gb.links) bad("guidebook rows are not links to their lesson");
    if (gb.ticks !== 1) bad(`the guidebook shows ${gb.ticks} ticks for one finished lesson`);
    await page.click('a.gb-mod[data-id="a1-pagerank"]');
    await page.waitForTimeout(600);
    const went = await page.evaluate(() => ({
      hash: location.hash,
      open: NIC.player.isOpen(),
      modal: !!document.querySelector(".modal-back"),
    }));
    if (went.hash !== "#a1-pagerank" || !went.open) bad(`a guidebook row did not open its lesson (${went.hash})`);
    if (went.modal) bad("the guidebook stayed open over the lesson");
    await page.evaluate(() => {
      NIC.player.close(true);
      NIC.store.set("nic.lessonDone", {});
      location.hash = "algo-home";
    });
  }

  // 3. course popover search
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, "home");
  await page.click('[data-pop="course"]');
  await page.waitForTimeout(300);
  const search = async (t) => {
    await page.fill(".pc-search input", t);
    await page.waitForTimeout(120);
    return page.evaluate(() => ({
      titles: [...document.querySelectorAll(".pc-hit")].map((b) => b.textContent),
      more: (document.querySelector(".pc-more") || {}).textContent || "",
      courses: getComputedStyle(document.querySelector(".pc-courses")).display,
    }));
  };
  if ((await page.getAttribute('[data-pop="course"]', "aria-label")) !== "Switch course or search lessons")
    bad("the course button's name does not mention search");
  for (const [q, want] of [
    ["page rank", /^1\.4PageRank mechanics/],
    ["pagerank", /PageRank/],
    ["dijkstra's", /Dijkstra/],
    ["dijkstras", /Dijkstra/],
    ["hardness", /Lecture 2/], // only the unit title says "hardness" for most of them
  ]) {
    const r = await search(q);
    if (!r.titles.length || !want.test(r.titles[0])) bad(`searching "${q}" put "${r.titles[0] || "nothing"}" first`);
  }
  {
    const r = await search("phase 3");
    if (!r.titles.length || r.titles.some((t) => !/Phase 3/.test(t)))
      bad(`"phase 3" found lessons from other phases: ${r.titles.join(" | ")}`);
    if (r.courses !== "none") bad("the course rows stayed while a search was typed");
    const many = await search("e");
    if (many.titles.length !== 20 || !/^\+\d+ more/.test(many.more))
      bad(`a broad search shows ${many.titles.length} rows and "${many.more}", not 20 and "+N more"`);
    if ((await search("zzzzq")).titles.length) bad("nonsense matched a lesson");
    await search("dijk");
    await page.keyboard.press("ArrowDown");
    const active = await page.evaluate(
      () => document.querySelector(".pc-hit.active") && document.querySelector(".pc-hit.active").id,
    );
    if (active !== "pc-hit-1") bad(`ArrowDown moved the active row to ${active}, not the second one`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    if (!(await page.evaluate(() => NIC.player.isOpen() && location.hash === "#a2-astar")))
      bad("Enter on the active search row did not open that lesson");
    await page.evaluate(() => NIC.player.close(true));
  }

  // 4 + 5. boss and lesson status, on a fresh browser (the progress it needs must not leak into the other checks)
  {
    const { p, ctx, errors } = await fresh(page, { width: 390, height: 844 });
    await boot(p, "home", base);
    const row = (id) =>
      p.evaluate((id) => {
        const r = document.querySelector(`.p-row[data-id="${id}"]`);
        return r && { cls: r.className, label: r.querySelector(".p-node").getAttribute("aria-label") };
      }, id);
    const quiz = (right) =>
      p.evaluate((right) => {
        const B = NIC.bossDef("l1-boss"),
          q = {};
        B.qs.forEach((_, i) => (q[`l1-boss-${i}`] = { v: 0, ok: i < right }));
        NIC.store.set("nic.quiz", right < 0 ? {} : q);
        NIC.refresh();
      }, right);
    await quiz(6);
    await p.waitForTimeout(400);
    let r = await row("l1-boss");
    if (!/st-started/.test(r.cls) || /st-done/.test(r.cls)) bad(`a boss with 6 of 8 right is "${r.cls}", not started`);
    if (!/6 of 8 right, not yet passed/.test(r.label)) bad(`the boss node says "${r.label}"`);
    await p.evaluate(() => document.querySelector('.p-row[data-id="l1-boss"]').scrollIntoView({ block: "center" }));
    await p.click('.p-row[data-id="l1-boss"] .p-node');
    await p.waitForTimeout(400);
    const pop = await p.$eval(".node-pop", (e) => e.innerText);
    if (!/6\/8 right, not yet/.test(pop) || !/80%/.test(pop) || !/RETRY QUIZ/i.test(pop))
      bad(`the boss popover reads "${pop.replace(/\s+/g, " ")}"`);
    await p.click(".np-go");
    await p.waitForTimeout(700);
    const retake = await p.evaluate(() => ({
      kind: NIC.player.state().kind,
      left: Object.keys(NIC.store.get("nic.quiz", {})).length,
    }));
    // the retake starts at the intro but wipes nothing: backing out must not lose the earlier answers
    if (retake.kind !== "bossIntro" || retake.left !== 8)
      bad(`Retry quiz opened "${retake.kind}" with ${retake.left} stored answers, not the intro with all 8 kept`);
    await p.evaluate(() => NIC.player.close()); // the X: it also puts the path's address back
    await p.waitForTimeout(500);
    await quiz(8);
    await p.waitForTimeout(400);
    r = await row("l1-boss");
    if (!/st-done/.test(r.cls)) bad(`a boss with 8 of 8 right is "${r.cls}", not done`);
    await quiz(-1);
    // peeking: open a lesson, leave on its first screen. "Up next" and the current node must still be the first lesson
    await p.evaluate(async () => {
      location.hash = "l1-monkey";
      await new Promise((r) => setTimeout(r, 500));
      NIC.player.close();
      await new Promise((r) => setTimeout(r, 500));
    });
    const peek = await p.evaluate(() => ({
      cur: document.querySelector(".p-row.cur") && document.querySelector(".p-row.cur").dataset.id,
      up: (document.querySelector(".td-main") || {}).dataset && document.querySelector(".td-main").dataset.to,
      cls: document.querySelector('.p-row[data-id="l1-monkey"]').className,
    }));
    if (/st-started/.test(peek.cls)) bad("a lesson only looked at is drawn as started");
    if (peek.cur !== peek.up) bad(`"Up next" opens ${peek.up} but the green node is ${peek.cur}`);
    // reaching past the first screen does start it
    await p.evaluate(() => {
      NIC.store.set("nic.lessonPos", { "l1-monkey": 2 });
      NIC.refresh();
    });
    await p.waitForTimeout(400);
    const began = await p.evaluate(() => ({
      cur: document.querySelector(".p-row.cur").dataset.id,
      up: document.querySelector(".td-main").dataset.to,
      cls: document.querySelector('.p-row[data-id="l1-monkey"]').className,
    }));
    if (!/st-started/.test(began.cls) || began.cur !== "l1-monkey" || began.up !== "l1-monkey")
      bad(`a lesson past its first screen is not the current one (${JSON.stringify(began)})`);
    if (errors.length) bad(`page errors in the boss checks: ${errors.join("; ")}`);
    await ctx.close();
  }

  // 6. phone widths
  for (const w of [360, 375]) {
    const { p, ctx, errors } = await fresh(page, {
      width: w,
      height: 740,
      storage: { "nic.xp": { total: 12345, days: {} } },
    });
    await boot(p, "algo-home", base);
    const r = await p.evaluate(() => {
      const c = document.querySelector(".tb-course").getBoundingClientRect(),
        last = [...document.querySelectorAll("#topbar .tb-right > *")].pop().getBoundingClientRect();
      return {
        course: Math.round(c.width),
        end: Math.round(last.right),
        cw: document.documentElement.clientWidth,
        sw: document.documentElement.scrollWidth,
        shown: getComputedStyle(document.querySelector(".tb-course .mascot")).display,
      };
    });
    if (r.course < 40 || r.shown === "none")
      bad(`the course button is ${r.course}px wide at ${w}px (mascot ${r.shown})`);
    if (r.end > r.cw) bad(`the top bar runs ${r.end - r.cw}px past the screen at ${w}px`);
    if (r.sw > r.cw) bad(`the page scrolls sideways at ${w}px`);
    if (errors.length) bad(`page errors at ${w}px: ${errors.join("; ")}`);
    await ctx.close();
  }

  // 7. the streak card: only with something to lose, only once
  {
    const done = { "l1-what": true, "l1-monkey": true };
    const cases = [
      ["two lessons done", { "nic.lessonDone": done }, true],
      ["one lesson done", { "nic.lessonDone": { "l1-what": true } }, false],
    ];
    for (const [name, storage, want] of cases) {
      const { p, ctx } = await fresh(page, { storage });
      await boot(p, "home", base);
      const has = await p.evaluate(() => !!document.querySelector(".nudge-card"));
      if (has !== want) bad(`the streak card is ${has ? "shown" : "missing"} with ${name}`);
      if (want) {
        await p.click('[data-nudge="no"]');
        await p.waitForTimeout(500);
        await p.evaluate(() => NIC.refresh());
        await p.waitForTimeout(400);
        if (await p.evaluate(() => !!document.querySelector(".nudge-card")))
          bad("the streak card came back after Not now");
        await p.reload();
        await p.waitForFunction(() => window.NIC && NIC.refresh);
        await p.waitForTimeout(600);
        if (await p.evaluate(() => !!document.querySelector(".nudge-card")))
          bad("the streak card came back after a reload");
      } else {
        await p.evaluate(() => NIC.game.award(5));
      }
      await ctx.close();
    }
    const { p, ctx } = await fresh(page, { storage: { "nic.lessonDone": done } });
    await boot(p, "home", base);
    await p.click('[data-nudge="up"]');
    await p.waitForTimeout(500);
    if (!(await p.evaluate(() => /Create account/.test((document.querySelector(".si-h") || {}).textContent || ""))))
      bad('"Create account" on the streak card did not open the sign-up form');
    await ctx.close();
  }

  // 8. course buttons scope Practice; names for screen readers
  {
    const { p, ctx, errors } = await fresh(page);
    await boot(p, "home", base);
    await p.evaluate(async () => {
      await NIC.bank.load();
      const it = NIC.bank.all({ learnedOnly: false }).find((x) => x.subject === "ds");
      NIC.store.set("nic.lessonDone", { [it.mod]: true }); // only finished lessons' questions come back for review
      NIC.store.set("nic.rev", { [it.id]: { box: 1, n: 1, right: 0, t: 1 } });
      location.hash = "ds-home";
      await new Promise((r) => setTimeout(r, 600));
    });
    const chip = await p.$("[data-rev]");
    if (!chip) bad("a Data Science path with a question due has no Review button");
    else {
      await chip.click();
      await p.waitForTimeout(700);
      const prefs = await p.evaluate(() => NIC.store.get("nic.revPrefs", {}));
      if (JSON.stringify(prefs.subjects) !== '["ds"]')
        bad(`Review on the Data Science path left the Practice courses at ${JSON.stringify(prefs.subjects)}`);
    }
    const names = await p.evaluate(() => ({
      dock: [...document.querySelectorAll("#dock button")].map(
        (b) => `${b.getAttribute("aria-label")}|${b.getAttribute("aria-current")}`,
      ),
      top: [...document.querySelectorAll("#topbar [data-pop]")].map((b) => b.getAttribute("aria-label")),
      exp: [...document.querySelectorAll("#topbar [data-pop]")].every(
        (b) => b.getAttribute("aria-haspopup") && b.hasAttribute("aria-expanded"),
      ),
    }));
    if (!/^Practice.*\|page$/.test(names.dock[1])) bad(`the Practice tab does not say it is current: ${names.dock}`);
    if (!/^Streak: \d+ days?/.test(names.top[1]) || !/^Daily goal: \d+ of \d+ XP/.test(names.top[2]))
      bad(`the top bar stats are named ${names.top}`);
    if (!names.exp) bad("a top bar popover button has no aria-haspopup / aria-expanded");
    await p.evaluate(() => (location.hash = "algo-home"));
    await p.waitForTimeout(500);
    const nodes = await p.evaluate(() =>
      [...document.querySelectorAll(".p-node")].map((n) => n.getAttribute("aria-label")),
    );
    if (nodes.some((l) => !/, (completed|in progress|not started|passed|watched|not watched|\d+ of \d+)/.test(l)))
      bad(`a path node does not name its state: ${nodes.find((l) => !/, /.test(l))}`);
    if (!nodes.some((l) => /^Code lab /.test(l) || /^Workshop /.test(l) || /Workshop:/.test(l)))
      bad("workshops are not named on the path");
    if (errors.length) bad(`page errors in the course button checks: ${errors.join("; ")}`);
    await ctx.close();
  }

  // 9. keyboard and desktop layout
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, "home");
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press("Tab");
  if (!(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("skip-link"))))
    bad("the first Tab does not land on the skip link");
  await page.keyboard.press("Enter");
  const skipped = await page.evaluate(() => ({
    el: document.activeElement.closest("#dock") ? "dock" : document.activeElement.className,
    hash: location.hash,
  }));
  if (skipped.el !== "dock" || skipped.hash !== "#home")
    bad(`the skip link ended on ${skipped.el} with hash ${skipped.hash}`);
  for (const [w, rail] of [
    [1271, false],
    [1272, true],
  ]) {
    await page.setViewportSize({ width: w, height: 900 });
    await openHome(page, "home");
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const e = document.querySelector(".rail"),
        b = e && e.getBoundingClientRect();
      return {
        shown: !!e && getComputedStyle(e).display !== "none",
        right: b ? Math.round(b.right) : 0,
        w: innerWidth,
      };
    });
    if (r.shown !== rail) bad(`the desktop rail is ${r.shown ? "shown" : "hidden"} at ${w}px`);
    if (r.shown && r.right > r.w) bad(`the rail is cut off at ${w}px (right edge ${r.right})`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, "home");
  await page.click('[data-pop="streak"]');
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 390, height: 500 }); // the keyboard came up
  await page.waitForTimeout(500);
  if (!(await page.$("#pop .pop-card"))) bad("an open popover closed when only the window's height changed");
  await page.setViewportSize({ width: 600, height: 500 });
  await page.waitForTimeout(500);
  if (await page.$("#pop .pop-card")) bad("an open popover stayed after the window's width changed");

  // 10. a new day, the sound switch, the Profile overview
  {
    const day = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const { p, ctx, errors } = await fresh(page, {
      storage: { "nic.activeDays": [day(0), day(1)], "nic.xp": { total: 40, days: { [day(0)]: 40 } } },
    });
    await boot(p, "home", base);
    const lit = () => p.evaluate(() => document.querySelector(".tb-streak").classList.contains("lit"));
    if (!(await lit())) bad("the flame is not lit on a day with a lesson done");
    await p.evaluate(() => {
      const Real = Date; // tomorrow, with nothing done yet
      window.Date = class extends Real {
        constructor(...a) {
          a.length ? super(...a) : super(Real.now() + 864e5);
        }
        static now() {
          return Real.now() + 864e5;
        }
      };
      window.dispatchEvent(new Event("focus"));
    });
    await p.waitForTimeout(300);
    if (await lit()) bad("the top bar kept yesterday's lit flame after midnight");
    await p.evaluate(() => (location.hash = "profile"));
    await p.waitForTimeout(800);
    const prof = await p.evaluate(() => ({
      rows: document.querySelectorAll(".ov-c").length,
      bars: document.querySelectorAll(".ov-d").length,
      prog: document.querySelectorAll(".ach:not(.got) .ach-prog").length,
    }));
    if (prof.rows !== 3 || prof.bars !== 7)
      bad(`the Profile overview has ${prof.rows} course rows and ${prof.bars} day bars`);
    if (prof.prog < 5) bad(`only ${prof.prog} locked achievements show their progress`);
    await p.evaluate(() => NIC.sfx.set(false));
    if ((await p.getAttribute("#pfSound", "aria-checked")) !== "false")
      bad("the Profile sound switch did not follow the setting");
    await p.evaluate(() => NIC.sfx.set(true));
    if ((await p.getAttribute("#pfSound", "aria-checked")) !== "true")
      bad("the Profile sound switch did not follow the setting back on");
    if (errors.length) bad(`page errors on the Profile: ${errors.join("; ")}`);
    await ctx.close();
  }

  // 11. a course that will not download: the loader retries, then offers Try again
  {
    const { p, ctx } = await fresh(page);
    await ctx.route("**/js/content/ds/ds-01.js*", (r) => r.abort());
    await p.goto(`${base}#ds-home`);
    const failed = await p.waitForSelector(".boot-fail button", { timeout: 15000 }).catch(() => null);
    if (!failed) bad("a course that cannot download never shows Couldn't load / Try again");
    else {
      await ctx.unroute("**/js/content/ds/ds-01.js*");
      await failed.click();
      const ok = await p.waitForSelector(".p-node", { timeout: 15000 }).catch(() => null);
      if (!ok) bad("Try again did not bring the course back once the connection was fine");
    }
    await ctx.close();
  }

  // 10. recap videos: a bonus node after each lecture's boss, never counted towards finishing, never "up next"
  {
    const { p, ctx, errors } = await fresh(page, { width: 390, height: 844 });
    await boot(p, "home", base);
    await p.evaluate(() => NIC.content.all());
    const r = await p.evaluate(() => {
      const A = NIC.shared.engineApp,
        out = { lectures: [], wrong: [] };
      for (const [lec] of Object.entries(A.SUBJECTS.nic.lectures)) {
        const list = A.inLec("nic", lec),
          boss = list.findIndex(A.isBoss),
          vid = list.findIndex((m) => m.video);
        out.lectures.push(`${lec}:${boss}/${vid}`);
        if (vid < 0) out.wrong.push(`lecture ${lec} has no recap video`);
        else if (boss < 0 || vid < boss) out.wrong.push(`lecture ${lec}: the video is not after the boss quiz`);
        else if (A.progress(list).n !== list.filter((m) => !m.video).length)
          out.wrong.push(`lecture ${lec}: the video is counted towards finishing`);
        else if (A.kindOf(list[vid]) !== "video")
          out.wrong.push(`lecture ${lec}: the video node has kind ${A.kindOf(list[vid])}`);
      }
      const row = document.querySelector('.p-row[data-id="l1-video"] .p-node');
      out.label = row && row.getAttribute("aria-label");
      out.next = A.inSubj("nic").find((m) => !m.video && A.status(m) !== "done").id;
      out.card = (document.querySelector(".td-main") || {}).dataset
        ? document.querySelector(".td-main").dataset.to
        : "";
      return out;
    });
    r.wrong.forEach(bad);
    if (!/^Recap video Lecture 1 recap video, not watched$/.test(r.label || ""))
      bad(`the video node is named "${r.label}"`);
    if (r.card && /-video$/.test(r.card)) bad(`"Up next" offers a recap video (${r.card})`);
    await p.evaluate(() => (location.hash = "l1-video"));
    const step = await p.waitForSelector(".pl-video video", { timeout: 15000 }).catch(() => null);
    if (!step) bad("the recap video did not open in the player");
    else if (
      !(await p.evaluate(() =>
        document.querySelector(".pl-video video source").getAttribute("src").includes("videos/out/lecture-1.mp4"),
      ))
    )
      bad("the recap video points at the wrong file");
    if (errors.length) bad(`page errors in the recap video checks: ${errors.join("; ")}`);
    await ctx.close();
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.setViewportSize(size || BIG);
  await openHome(page, "home");
  return problems;
}
