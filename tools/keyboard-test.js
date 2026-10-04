/* Keyboard checks that need real key presses, so they run from Node (Playwright) instead of inside the page.
   The lesson player's shortcuts (Enter = Check / Continue, ← = back) must not hijack keys that belong to a figure or a demo:
   with a control focused by keyboard inside one, Enter has to press that control and the arrows have to move a plan dot. */
export async function keyboardChecks(page) {
  const problems = [];
  const key = () => page.evaluate(() => (NIC.player.isOpen() ? NIC.player.state().key : "closed"));

  /* Open a module and walk it (answering questions) until a screen contains `stop`. */
  const openUntil = (id, stop) =>
    page.evaluate(
      async ([id, stop]) => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        if (NIC.player.isOpen()) NIC.player.close(true);
        localStorage.removeItem("nic.lessonPos");
        location.hash = "#home"; // opening the player needs a hash change
        await wait(150);
        location.hash = id;
        await wait(500);
        for (let i = 0; i < 60 && NIC.player.isOpen(); i++) {
          const screen = document.querySelector(".pl-screen:not(.leaving)");
          if (stop && screen && screen.querySelector(stop)) break;
          const st = NIC.player.state();
          if (st.Q && /check/.test(st.foot)) await answerCurrent();
          else if (!stop) break;
          else document.querySelector(".pl-go").click();
          await wait(40);
        }
        await wait(500);
        return NIC.player.isOpen();
      },
      [id, stop],
    );

  // 1. a runner's own buttons: Enter presses Play and the lesson stays on its step
  if (!(await openUntil("a2-dijkstra", ".rn"))) problems.push("could not open the runner step");
  else {
    const before = await key();
    const label = () =>
      page.evaluate(() => document.querySelector(".pl-screen:not(.leaving) .rn-play")?.getAttribute("aria-label"));
    await page.evaluate(() => document.querySelector(".pl-screen:not(.leaving) .rn-play").focus());
    const play = await label();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    if ((await key()) !== before) problems.push("Enter on a runner button also moved the lesson on");
    if ((await label()) === play) problems.push("Enter on a runner button did not press it");
  }

  // 2. a workshop: arrows move the plan dot (also ←), Enter toggles the demand cap, and the workshop stays open
  if (!(await openUntil("a3-lab", ".aw3-svg"))) problems.push("could not open the corner-hunt workshop");
  else {
    const before = await key();
    const dot = () => page.evaluate(() => document.querySelector("[data-pi]").parentElement.style.transform);
    await page.evaluate(() => document.querySelector("[data-pi]").focus());
    const start = await dot();
    await page.keyboard.press("ArrowRight");
    const right = await dot();
    await page.keyboard.press("ArrowLeft");
    if (right === start) problems.push("→ did not move the plan dot");
    if ((await dot()) === right) problems.push("← did not move the plan dot");
    await page.evaluate(() => document.querySelector("[data-cap]").focus());
    await page.keyboard.press("Enter");
    if ((await page.getAttribute("[data-cap]", "aria-pressed")) !== "true")
      problems.push("Enter did not toggle the cap");
    if ((await key()) !== before) problems.push("← or Enter inside the workshop moved the lesson");
  }

  // 3. everywhere else the shortcut still works: Enter on a plain lesson step continues
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson");
  else {
    const before = await key();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    if ((await key()) === before) problems.push("Enter no longer continues a lesson step");
  }

  // 4. a control you clicked with the mouse doesn't capture Enter: it still continues, as it always did
  if (!(await openUntil("a2-dijkstra", ".rn"))) problems.push("could not open the runner step again");
  else {
    const before = await key();
    await page.click(".pl-screen:not(.leaving) .rn-play");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    if ((await key()) === before) problems.push("Enter after clicking a runner button no longer continues");
  }

  // 5. a popover from the top bar: "/" opens the course list, Escape closes it, and the dim layer (shown on phones)
  //    follows both ways, whatever the width
  await page.evaluate(() => NIC.player.isOpen() && NIC.player.close(true));
  await page.evaluate(() => (location.hash = "#home"));
  await page.waitForTimeout(500);
  const dimmed = () => page.evaluate(() => document.querySelector(".tb-scrim").classList.contains("on"));
  await page.keyboard.press("/");
  await page.waitForTimeout(250);
  if (!(await page.$("#pop .pop-card"))) problems.push("/ did not open the course popover");
  if (!(await dimmed())) problems.push("a popover opened without its dim layer");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  if (await dimmed()) problems.push("the dim layer stayed after the popover closed");

  // 6. Enter belongs to the control the keyboard has focused: Quit, Back, an answer option, a details summary and the quit
  //    sheet's buttons press themselves. Only Continue / Check continues (and an option that is already selected checks it).
  const info = () =>
    page.evaluate(() => {
      const s = NIC.player.state();
      return {
        i: s.i,
        foot: s.foot,
        sel: document.querySelectorAll(".pl-screen:not(.leaving) .opt.sel").length,
        sheet: !document.querySelector(".pl-modal").hidden,
      };
    });
  const tick = () => page.waitForTimeout(300);
  // on to the next multiple-choice question (a lesson's checks can be any type: others are answered and skipped past)
  const toQuestion = () =>
    page.evaluate(async () => {
      for (let g = 0; g < 30 && !document.querySelector(".pl-screen:not(.leaving) .opt"); g++) {
        if (/check/.test(NIC.player.state().foot)) await answerCurrent();
        document.querySelector(".pl-go").click();
        await new Promise((r) => setTimeout(r, 200));
      }
    });
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson for the Enter checks");
  else {
    await page.evaluate(() => document.querySelector(".pl-go").click()); // step 2, so Back exists
    await tick();
    const at = await info();
    await page.focus(".pl-x:not(.pl-back)");
    await page.keyboard.press("Enter");
    await tick();
    let now = await info();
    if (now.i !== at.i) problems.push("Enter on the Quit button moved the lesson on");
    if (!now.sheet) problems.push("Enter on the Quit button did not open the quit sheet");
    await page.keyboard.press("Enter"); // focus is on "Keep learning"
    await page.waitForTimeout(600); // the sheet drops away first
    now = await info();
    if (now.sheet || now.i !== at.i) problems.push("Enter on Keep learning did not just close the quit sheet");
    await page.focus(".pl-back");
    await page.keyboard.press("Enter");
    await tick();
    if ((await info()).i !== at.i - 1) problems.push("Enter on the Back button did not go back one screen");
    await toQuestion();
    const q = await info();
    // a details summary toggles instead of continuing
    const summary = await page.$(".pl-screen:not(.leaving) .pl-look summary");
    if (summary) {
      const open = () => page.evaluate(() => document.querySelector(".pl-screen:not(.leaving) .pl-look").open);
      const was = await open();
      await summary.focus();
      await page.keyboard.press("Enter");
      await tick();
      if ((await open()) === was || (await info()).i !== q.i)
        problems.push("Enter on a details summary did not toggle it");
    }
    // an option: Enter selects it (no grading), on another option the selection moves, on the selected one it checks
    await page.focus(".pl-screen:not(.leaving) .opt:not(.sel)");
    await page.keyboard.press("Enter");
    await tick();
    now = await info();
    if (now.sel !== 1 || !/check/.test(now.foot)) problems.push("Enter on an answer option did not just select it");
    await page.focus(".pl-screen:not(.leaving) .opt:not(.sel)");
    await page.keyboard.press("Enter");
    await tick();
    now = await info();
    if (now.sel !== 1 || !/check/.test(now.foot)) problems.push("Enter on a second option graded the first one");
    await page.keyboard.press("Enter"); // on the selected option: Check
    await tick();
    if (!/f-(ok|no)/.test((await info()).foot)) problems.push("Enter on the selected option did not check it");
    // End session with the keyboard: Escape opens the sheet, Tab reaches End session, Enter quits
    await page.keyboard.press("Escape");
    await tick();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await tick();
    if (await page.evaluate(() => NIC.player.isOpen())) problems.push("Enter on End session did not end the session");
  }

  // 6b. a control the mouse pressed still lets Enter continue, as it always did: click an option, press Enter to check
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson for the mouse + Enter check");
  else {
    await toQuestion();
    await page.click(".pl-screen:not(.leaving) .opt");
    await page.keyboard.press("Enter");
    await tick();
    if (!/f-(ok|no)/.test((await info()).foot)) problems.push("Enter after clicking an option no longer checks it");
    await page.evaluate(() => NIC.player.close(true));
  }

  // 6c. M mutes while a lesson is open, and the rest of the page hears about it (the Profile switch and the menu row follow csl:sound)
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson for the mute check");
  else {
    const was = await page.evaluate(() => {
      window.__sound = [];
      addEventListener("csl:sound", (e) => window.__sound.push(e.detail.on));
      document.activeElement && document.activeElement.blur();
      return NIC.sfx.on();
    });
    await page.keyboard.press("m");
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({
      on: NIC.sfx.on(),
      heard: window.__sound.slice(),
      open: NIC.player.isOpen(),
    }));
    if (r.on === was || r.heard[0] !== r.on || !r.open)
      problems.push("M did not toggle the sound with the lesson open");
    await page.keyboard.press("m"); // back to how it was
    await page.waitForTimeout(150);
    if ((await page.evaluate(() => NIC.sfx.on())) !== was) problems.push("M did not toggle the sound back");
    await page.evaluate(() => NIC.player.close(true));
  }

  // 6d. Enter on a pick target selects it; it must not also press Check (a multi-answer pick needs more than one tap)
  const pickOpened = await page.evaluate(async () => {
    await NIC.content.all();
    await NIC.bank.load();
    const it = NIC.bank
      .all({ learnedOnly: false })
      .find((x) => x.src === "bank" && x.Q.type === "pick" && Array.isArray(x.Q.a) && x.Q.a.length > 1);
    if (!it) return false;
    if (NIC.player.isOpen()) NIC.player.close(true);
    NIC.player.revise({ ids: [it.id] });
    await new Promise((r) => setTimeout(r, 600));
    document.querySelector(".pl-actions .btn:last-child").click(); // the intro
    await new Promise((r) => setTimeout(r, 600));
    const t = document.querySelector(".pl-screen:not(.leaving) [data-pick]");
    if (!t) return false;
    t.focus();
    return true;
  });
  if (!pickOpened) problems.push("could not open a multi-answer pick question");
  else {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const foot = await page.evaluate(() => NIC.player.state().foot);
    if (!/check/.test(foot)) problems.push("Enter on a pick target graded the question after one selection");
    await page.evaluate(() => NIC.player.close(true));
  }

  // 7. Back after a lesson closes must not reopen it, and the browser's Back during a lesson asks before leaving
  const where = () => page.evaluate(() => ({ hash: location.hash, open: NIC.player.isOpen() }));
  const goHome = async () => {
    await page.evaluate(() => {
      localStorage.removeItem("nic.lessonPos"); // open at the first screen, not where an earlier check left off
      if (NIC.player.isOpen()) NIC.player.close(true);
    });
    await page.evaluate(() => (location.hash = "#profile")); // an entry that is no lesson, for Back to land on
    await page.waitForTimeout(300);
    await page.evaluate(() => (location.hash = "#home"));
    await page.waitForTimeout(400);
  };
  await goHome();
  await page.evaluate(() => (location.hash = "#l1-what"));
  await page.waitForTimeout(500);
  await page.click(".pl-x:not(.pl-back)"); // first screen, nothing answered: closes at once, no "Wait, don't go"
  await page.waitForTimeout(150);
  if ((await where()).open) problems.push("closing a lesson before answering anything still asked to confirm");
  await page.waitForTimeout(400);
  if ((await where()).hash !== "#home") problems.push("closing a lesson did not return to the path");
  await page.goBack();
  await page.waitForTimeout(500);
  if ((await where()).open) problems.push("Back after closing a lesson reopened it");
  await goHome();
  await page.evaluate(() => (location.hash = "#l1-what"));
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector(".pl-go").click());
  await tick();
  await page.goBack(); // the browser's Back, one screen in
  await page.waitForTimeout(700);
  let w = await where();
  const sheet = await page.evaluate(() => NIC.player.isOpen() && !document.querySelector(".pl-modal").hidden);
  if (!w.open || !sheet) problems.push("the browser's Back during a lesson did not ask before leaving");
  if (w.hash !== "#l1-what") problems.push(`the lesson's address was not put back after Back (${w.hash})`);
  await page.click('[data-m="quit"]');
  await page.waitForTimeout(700);
  w = await where();
  if (w.open || w.hash !== "#home") problems.push(`End session after Back left ${w.hash}, open=${w.open}`);

  // 8. a cold deep link to a name that is no lesson (a typo, or a lesson from another course) lands on a path and throws nothing
  const base = page.url().split("#")[0];
  const browser = page.context().browser(); // run-tests opens its page with browser.newPage(), so more pages need their own context
  const coldCtx = await browser.newContext();
  const cold = await coldCtx.newPage();
  const coldErrors = [];
  cold.on("pageerror", (e) => coldErrors.push(e.message));
  for (const hash of ["ds-nope", "a9"]) {
    await cold.goto(`${base}#${hash}`);
    await cold.waitForTimeout(3000);
    const r = await cold.evaluate(() => ({
      hash: location.hash,
      units: document.querySelectorAll("#main .unit").length,
    }));
    if (r.hash === `#${hash}` || !r.units)
      problems.push(`cold #${hash} did not land on a course path (${r.hash}, ${r.units} units)`);
  }
  await coldCtx.close();
  if (coldErrors.length) problems.push(`cold deep link threw: ${coldErrors[0]}`);

  // 9. the welcome waits for the player on a cold deep link, and Escape counts as seen (a fresh browser: nothing done yet)
  const fresh = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const first = await fresh.newPage();
  await first.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false })); // the test browser would skip it
  await first.goto(`${base}#l1-what`);
  await first.waitForTimeout(2200);
  const welcome = () => first.evaluate(() => !!document.querySelector(".ob-modal"));
  if (await welcome()) problems.push("the welcome showed behind the lesson on a cold deep link");
  await first.click(".pl-x:not(.pl-back)");
  await first.waitForTimeout(1500);
  if (!(await welcome())) problems.push("the welcome did not show once the lesson closed");
  await first.keyboard.press("Escape");
  await first.waitForTimeout(500);
  if (!(await first.evaluate(() => localStorage.getItem("nic.onboarded"))))
    problems.push("Escape on the welcome was not remembered");
  await fresh.close();

  // 11. the quit sheet is a real dialog: it takes the keyboard (focus on "Keep learning", the page behind it inert) and gives it
  //     back to what had it (the Quit button, an answer option) when it closes, by Escape or by Keep learning
  const behind = () =>
    page.evaluate(() => ({
      inert: [".pl-top", ".pl-stage", ".pl-foot"].map((c) => !!document.querySelector(c).inert),
      on:
        document.activeElement.className +
        (document.activeElement.dataset.m ? `|${document.activeElement.dataset.m}` : ""),
    }));
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson for the quit sheet checks");
  else {
    await page.evaluate(() => document.querySelector(".pl-go").click());
    await tick();
    await page.focus(".pl-x:not(.pl-back)");
    await page.keyboard.press("Enter");
    await tick();
    const sheet = await page.evaluate(() => {
      const m = document.querySelector(".pl-modal"),
        h = document.getElementById(m.getAttribute("aria-labelledby") || "none");
      return { role: m.getAttribute("role"), modal: m.getAttribute("aria-modal"), name: h ? h.textContent : "" };
    });
    if (sheet.role !== "alertdialog" || sheet.modal !== "true" || !sheet.name)
      problems.push(`the quit sheet is not a named alert dialog (${JSON.stringify(sheet)})`);
    let now = await behind();
    if (!/\|stay$/.test(now.on))
      problems.push(`the quit sheet did not put focus on Keep learning (it is on ${now.on})`);
    if (now.inert.includes(false)) problems.push("the page behind the quit sheet can still be reached (not inert)");
    await page.keyboard.press("Escape");
    await tick();
    now = await behind();
    if (!/\bpl-x\b/.test(now.on) || /pl-back/.test(now.on))
      problems.push(`Escape on the quit sheet did not give focus back to the Quit button (it is on ${now.on})`);
    if (now.inert.includes(true)) problems.push("the page stayed inert after the quit sheet closed");
    await page.keyboard.press("Enter"); // the Quit button is focused again, so Enter opens the sheet once more
    await tick();
    await page.keyboard.press("Enter"); // on Keep learning
    await page.waitForTimeout(600);
    now = await behind();
    if (!/\bpl-x\b/.test(now.on))
      problems.push(`Keep learning did not give focus back to the Quit button (it is on ${now.on})`);
    await page.evaluate(() => NIC.player.close(true));
  }

  // 12. Escape inside the code editor hands the keyboard back and does not open the quit sheet; outside it, Escape quits as usual
  const sheetUp = () => page.evaluate(() => NIC.player.isOpen() && !document.querySelector(".pl-modal").hidden);
  if (!(await openUntil("a2-code", ".cl-ta"))) problems.push("could not open the code lab");
  else {
    await page.focus(".cl-ta");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (await sheetUp()) problems.push("Escape in the code editor opened the quit sheet");
    if (await page.evaluate(() => document.activeElement.classList.contains("cl-ta")))
      problems.push("Escape did not leave the code editor");
    await page.keyboard.press("Tab");
    if (!(await page.evaluate(() => document.activeElement.matches("[data-run]"))))
      problems.push("Tab after Escape in the code editor did not reach Run tests");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (!(await sheetUp())) problems.push("Escape outside the code editor no longer opens the quit sheet");
    await page.evaluate(() => NIC.player.close(true));
  }

  // 13. Python that never finishes loading gives up (PY.bootMs after the last sign of life) instead of "Loading Python…" for ever:
  //     the button comes back and the chip says so. A stub Worker that never answers stands in for a stalled download.
  await page.evaluate(() => {
    const PY = NIC.shared.engineCodelab.PY;
    window.__py = { Worker: window.Worker, ms: PY.bootMs };
    if (PY.w) PY.w.terminate();
    Object.assign(PY, { w: null, ready: null, loaded: false, error: "", bootMs: 1200 });
    window.Worker = function () {
      this.postMessage = () => {};
      this.terminate = () => {};
    };
  });
  if (!(await openUntil("a2-code", ".cl-ta"))) problems.push("could not open the code lab for the loading check");
  else {
    await page.waitForTimeout(2200);
    const chip = () => page.evaluate(() => (document.querySelector("[data-py]") || {}).textContent);
    if (!/unavailable/i.test(await chip())) problems.push(`a stalled Python start left the chip at "${await chip()}"`);
    await page.click("[data-run]");
    await page.waitForTimeout(3200);
    const run = await page.evaluate(() => ({
      off: document.querySelector("[data-run]").disabled,
      text: document.querySelector("[data-run]").textContent,
    }));
    if (run.off || run.text !== "Run tests")
      problems.push(`Run tests stayed "${run.text}" (disabled: ${run.off}) after Python failed to start`);
    await page.evaluate(() => NIC.player.close(true));
  }
  await page.evaluate(() => {
    const PY = NIC.shared.engineCodelab.PY;
    window.Worker = window.__py.Worker;
    Object.assign(PY, { w: null, ready: null, loaded: false, error: "", bootMs: window.__py.ms });
  });

  // 14. the "What to do" checklist: using the demo control a step names in bold ticks it (a button when pressed, a slider when
  //     changed, also by keyboard), and a phone's collapsed chip opens by itself the first time it is seen. A throwaway lesson
  //     with a button and a slider; the progress it touches is put back afterwards.
  const keep = await page.evaluate(() => {
    const k = {};
    Object.keys(localStorage)
      .filter((x) => x.startsWith("nic.") || x === "csl.guideSeen")
      .forEach((x) => (k[x] = localStorage.getItem(x)));
    NIC.LESSONS["zz-guide"] = {
      sum: "Test only.",
      steps: [{ t: "Only step", b: "<p>Nothing here.</p>", v: "" }],
      guide: ["Press <b>Run it</b> once.", "Move the <b>Speed</b> slider.", "Tick <b>Loud</b>."],
    };
    window.__zz = {
      id: "zz-guide",
      num: "9.8",
      title: "Guide test",
      render(root) {
        root.appendChild(
          NIC.el(
            `<div class="card"><button class="btn" id="zg-run">Run it</button><label class="field">Speed <input type="range" id="zg-sp" min="0" max="10" value="3"></label><label class="field"><input type="checkbox" id="zg-ck"> Loud</label></div>`,
          ),
        );
      },
    };
    return k;
  });
  const openGuide = async () => {
    await page.evaluate(async () => {
      if (NIC.player.isOpen()) NIC.player.close(true);
      localStorage.removeItem("nic.lessonPos");
      NIC.player.open(window.__zz, { home: "home" });
      await new Promise((r) => setTimeout(r, 200));
      for (let g = 0; g < 6 && NIC.player.state().kind !== "try"; g++) {
        document.querySelector(".pl-go").click();
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    await page.waitForTimeout(300);
  };
  const done = () =>
    page.evaluate(() => [...document.querySelectorAll(".guide-item")].map((b) => b.classList.contains("done")));
  await page.evaluate(() => localStorage.removeItem("csl.guideSeen"));
  await openGuide();
  if (!(await page.$(".pl-try-demo #zg-run")))
    problems.push("the throwaway guide lesson did not reach its Try-it screen");
  else {
    await page.click("#zg-run");
    await page.waitForTimeout(500);
    let d = await done();
    if (!d[0] || d[1] || d[2]) problems.push(`pressing "Run it" did not tick exactly its checklist item (${d})`);
    await page.focus("#zg-sp");
    await page.keyboard.press("ArrowRight"); // the keyboard moves a slider without a click
    await page.waitForTimeout(500);
    d = await done();
    if (!d[1]) problems.push("moving the Speed slider with the keyboard did not tick its checklist item");
    await page.check("#zg-ck");
    await page.waitForTimeout(500);
    d = await done();
    if (!d.every(Boolean)) problems.push(`the Loud checkbox did not tick its item once, or un-ticked another (${d})`);
    // the first view on a phone opens the chip; later ones leave it collapsed until tapped
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => localStorage.removeItem("csl.guideSeen"));
    await openGuide();
    const chip = () =>
      page.evaluate(() => ({
        open: document.querySelector(".pl-try-side .guide").classList.contains("open"),
        aria: document.querySelector(".pl-try-side .card-head").getAttribute("aria-expanded"),
        list: !!document.querySelector(".pl-try-side .guide-list").offsetHeight,
      }));
    let c = await chip();
    if (!c.open || c.aria !== "true" || !c.list)
      problems.push(`the checklist chip did not open on its first view (${JSON.stringify(c)})`);
    await openGuide();
    c = await chip();
    if (c.open || c.aria !== "false" || c.list)
      problems.push(`the checklist chip opened again on a later view (${JSON.stringify(c)})`);
    await page.click(".pl-try-side .card-head");
    c = await chip();
    if (!c.open || c.aria !== "true") problems.push("tapping the checklist chip did not open it");
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  await page.evaluate((k) => {
    if (NIC.player.isOpen()) NIC.player.close(true);
    delete NIC.LESSONS["zz-guide"];
    delete window.__zz;
    Object.keys(localStorage)
      .filter((x) => (x.startsWith("nic.") || x === "csl.guideSeen") && !(x in k))
      .forEach((x) => localStorage.removeItem(x));
    Object.entries(k).forEach(([x, v]) => localStorage.setItem(x, v));
  }, keep);

  // 10. phones: no screen of any lesson is wider than a 390px phone (the stage hides sideways overflow, so it would be cut off)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  problems.push(...(await page.evaluate(() => window.overflowCheck())));
  await page.setViewportSize({ width: 1280, height: 800 });
  return problems;
}
