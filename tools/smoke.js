/* Full click-through smoke test, run inside the page (Playwright evaluate or DevTools console). Load tools/answer.js first.
   Opens every module in the lesson player, walks every screen (answering questions correctly),
   plays every step-through runner to the end (answering its predicts), presses buttons on the Try-it demo, and reports any errors. */
async function smoke({ subjects = null, buttons = 12 } = {}) {
  if (NIC.content) await NIC.content.all(); // every course's lessons load on demand
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const errors = [];
  const onErr = (e) => errors.push({ where: location.hash, msg: String(e.message || e.reason || e) });
  window.addEventListener("error", onErr);
  window.addEventListener("unhandledrejection", onErr);
  const mods = NIC.modules.filter((m) => !subjects || subjects.includes(m.subject || "nic"));
  const report = [];
  // text that means a value was printed instead of rendered (e.g. an object passed where a string was expected)
  const BAD = /\[object Object\]|\bundefined\b|\bNaN\b/;
  const seenBad = new Set();
  const resumed = { recap: false, hype: false }; // the resume checks below run once, on the first lesson that reaches each screen
  const reopen = async (id) => {
    NIC.player.close(true);
    location.hash = "#home";
    await wait(150);
    location.hash = id;
    await wait(250);
    return NIC.player.state();
  };
  const scan = (where, node) => {
    if (!node) return;
    const m = (node.innerText || node.textContent || "").match(BAD);
    if (m && !seenBad.has(where + m[0])) {
      seenBad.add(where + m[0]);
      errors.push({ where, msg: `screen shows "${m[0]}"` });
    }
  };
  for (const m of mods) {
    localStorage.removeItem("nic.lessonPos");
    location.hash = m.id;
    await wait(250);
    if (!NIC.player.isOpen()) {
      errors.push({ where: m.id, msg: "player did not open" });
      continue;
    }
    let steps = 0,
      figs = 0,
      qs = 0,
      runners = 0,
      demo = false;
    for (let guard = 0; guard < 120; guard++) {
      const st = NIC.player.state();
      if (!st.open) break;
      const scr = document.querySelector(".pl-screen:not(.leaving)");
      scan(`${m.id} ${st.kind}${st.kind === "step" ? " " + steps : ""}`, scr);
      if (st.Q && scr && scr.querySelector(".pl-body input:not([type=range]):not([type=checkbox]), .pl-body textarea"))
        errors.push({ where: `${m.id} ${st.key || st.kind}`, msg: "question asks for a typed answer" });
      // "Your place is saved": quitting at the recap reopens on a real screen, not back at step 1 ...
      if (st.kind === "recap" && !resumed.recap) {
        resumed.recap = true;
        const re = await reopen(m.id);
        if (!re.open || !(re.i > 0))
          errors.push({ where: m.id, msg: `quit at the recap, reopened at screen ${re.i}: the place was lost` });
        continue;
      }
      // ... and after a "5 in a row" hype screen the resume lands on the screen that followed it, not one past it (a skipped question)
      if (st.kind === "hype" && !resumed.hype) {
        resumed.hype = true;
        document.querySelector(".pl-go").click();
        await wait(60);
        const next = NIC.player.state(),
          re = await reopen(m.id);
        if (!re.open || re.key !== next.key || re.kind !== next.kind)
          errors.push({
            where: m.id,
            msg: `quit after a hype screen on ${next.kind} ${next.key}, reopened on ${re.kind} ${re.key}`,
          });
        continue;
      }
      if (st.kind === "step") {
        steps++;
        if (scr.querySelector(".lesson-visual:not(:empty)")) figs++;
        for (const r of scr.querySelectorAll(".rn")) {
          runners++;
          try {
            (await r.__rn.runAll()).forEach((msg) => errors.push({ where: `${m.id} runner`, msg }));
          } catch (e) {
            onErr(e);
          }
        }
      }
      if (st.kind === "try" && !demo) {
        demo = true;
        const named = new Set(); // what the demo's controls are called, before and while its buttons are pressed
        const collect = () =>
          scr
            .querySelectorAll(
              ".pl-try-demo button, .pl-try-demo input[type=checkbox], .pl-try-demo input[type=range], .pl-try-demo select",
            )
            .forEach((c) => {
              const l = NIC.player.controlLabel(c);
              if (l) named.add(l);
            });
        collect();
        const play = [...scr.querySelectorAll(".pl-try-demo button:not([disabled])")].slice(0, buttons);
        for (const b of play) {
          try {
            b.click();
          } catch (e) {
            onErr(e);
          }
          await wait(30);
          collect();
        }
        guideProblems(scr, named).forEach((msg) => errors.push({ where: `${m.id} guide`, msg }));
      }
      if (st.kind === "bossResult") {
        NIC.player.close(true);
        break;
      }
      if (st.Q && /check/.test(st.foot)) {
        qs++;
        try {
          await answerCurrent();
        } catch (e) {
          onErr(e);
          break;
        }
      }
      if (st.kind === "streak" || st.kind === "complete") {
        NIC.player.close(true);
        break;
      }
      document.querySelector(".pl-go").click();
      await wait(30);
    }
    if (NIC.player.isOpen()) NIC.player.close(true);
    report.push(
      `${m.id}: ${steps} steps, ${figs} with figures, ${qs} questions${runners ? `, ${runners} runner` : ""}${demo ? ", demo" : ""}`,
    );
  }
  window.removeEventListener("error", onErr);
  window.removeEventListener("unhandledrejection", onErr);
  report.push(
    `resume checks: recap ${resumed.recap ? "run" : "NOT reached"}, hype ${resumed.hype ? "run" : "not reached"}`,
  );
  if (!resumed.recap)
    errors.push({ where: "smoke", msg: "no lesson reached its recap, so the resume check did not run" });
  (await checkTypes()).forEach((msg) => errors.push({ where: "quick-check types", msg }));
  (await reviseComplete()).forEach((msg) => errors.push({ where: "revision complete screen", msg }));
  if (window.innerWidth <= 480)
    (await overflowCheck({ subjects })).forEach((msg) => errors.push({ where: "phone layout", msg }));
  return { modules: mods.length, errors, report };
}

/* The "What to do" checklist ticks an item when the learner uses the demo control it names in bold ("Press <b>Run</b>"). The rule
   lives in the player (NIC.player.guideHit, js/player/screens-2.js). A guide whose bold phrase matches no control in the demo can
   never tick by itself, or names a button that doesn't exist: report it. `named` is every control label seen on the Try-it screen. */
function guideProblems(scr, named) {
  const out = [];
  [...scr.querySelectorAll(".guide-item .gi-t")].forEach((t, k) => {
    const keys = [...t.querySelectorAll("b")]
      .map((x) => x.textContent.trim().toLowerCase())
      .filter((x) => x.length > 1);
    if (keys.length && !keys.some((key) => [...named].some((label) => NIC.player.guideHit(label, key))))
      out.push(
        `step ${k + 1} of the checklist shows ${keys.map((x) => `"${x}"`).join(", ")} in bold, but no demo control is called that (controls: ${[...named].slice(0, 10).join(" | ") || "none"})`,
      );
  });
  return out;
}

/* A step's quick check may be any question type, not only multiple choice: `c: {type: "order", items, why}` is asked like a boss
   question. Opens a throwaway lesson with one check of every type, answers each one correctly through the real UI, and expects
   the footer to turn green. Leaves the progress it touched as it found it. */
async function checkTypes() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const problems = [],
    id = "zz-check-types";
  const keep = {};
  Object.keys(localStorage)
    .filter((k) => k.startsWith("nic."))
    .forEach((k) => (keep[k] = localStorage.getItem(k)));
  const dot = (k, x) =>
    `<g data-pick="${k}"><circle cx="${x}" cy="30" r="18" fill="var(--panel)" stroke="var(--line)" stroke-width="3"/><text x="${x}" y="35" text-anchor="middle">${k}</text></g>`;
  const checks = {
    mcq: { q: "Which is a fruit?", o: ["Carrot", "Apple", "Leek"], a: 1, why: "Apples are fruit." },
    multi: { type: "multi", q: "Which are even?", o: ["2", "3", "4"], a: [0, 2], why: "2 and 4." },
    slider: {
      type: "slider",
      q: "About how many days in a week?",
      min: 0,
      max: 20,
      step: 1,
      ans: 7,
      tol: 1,
      why: "Seven.",
    },
    order: { type: "order", q: "Put these in order.", items: ["First", "Second", "Third"], why: "Counting." },
    match: {
      type: "match",
      q: "Match them.",
      pairs: [
        ["Cat", "Meow"],
        ["Dog", "Woof"],
      ],
      why: "Sounds.",
    },
    cat: {
      type: "cat",
      q: "Sort them.",
      buckets: ["Big", "Small"],
      items: [
        ["Whale", 0],
        ["Ant", 1],
      ],
      why: "Size.",
    },
    bug: {
      type: "bug",
      q: "Which line is wrong?",
      code: ["x = 1", "y = x +", "print(y)"],
      a: 1,
      why: "Unfinished sum.",
    },
    pick: {
      type: "pick",
      q: "Tap B.",
      fig: `<svg viewBox="0 0 200 60" class="fig">${dot("A", 40)}${dot("B", 100)}${dot("C", 160)}</svg>`,
      a: "B",
      why: "B.",
    },
  };
  const mod = { id, num: "9.9", title: "Check types", render() {} };
  NIC.LESSONS[id] = {
    sum: "Test only.",
    steps: Object.entries(checks).map(([t, c]) => ({ t: `Step ${t}`, b: `<p>About ${t}.</p>`, v: "", c })),
  };
  try {
    if (NIC.player.isOpen()) NIC.player.close(true);
    NIC.player.open(mod, { home: "home" });
    await wait(200);
    const seen = [];
    for (let guard = 0; guard < 60 && NIC.player.isOpen(); guard++) {
      const st = NIC.player.state();
      if (st.Q) {
        seen.push(st.Q.type || "mcq");
        let ok = false;
        try {
          ok = await answerCurrent();
        } catch (e) {
          problems.push(`a ${st.Q.type || "mcq"} quick check could not be answered: ${e.message}`);
          break;
        }
        if (!ok) problems.push(`a ${st.Q.type || "mcq"} quick check did not take the right answer as right`);
        if (
          /\[object Object\]|\bundefined\b|\bNaN\b/.test(document.querySelector(".pl-screen:not(.leaving)").innerText)
        )
          problems.push(`a ${st.Q.type || "mcq"} quick check shows an unrendered value`);
      }
      if (st.kind === "complete" || st.kind === "streak") break;
      document.querySelector(".pl-go").click();
      await wait(30);
    }
    const want = Object.keys(checks);
    want.filter((t) => !seen.includes(t)).forEach((t) => problems.push(`the ${t} quick check never appeared`));
  } catch (e) {
    problems.push(`quick-check types threw: ${e.message}`);
  } finally {
    if (NIC.player.isOpen()) NIC.player.close(true);
    delete NIC.LESSONS[id];
    Object.keys(localStorage)
      .filter((k) => k.startsWith("nic."))
      .forEach((k) => k in keep || localStorage.removeItem(k));
    Object.entries(keep).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  return problems;
}

/* Phone layout: no screen of any lesson may be wider than the phone (the stage hides horizontal overflow, so a wide demo, table or
   figure is cut off with no way to scroll to it). Shows every screen of every module without answering, and reports the ones whose
   content is wider than the screen. Run it at phone width: tools/keyboard-test.js resizes the page to 390px and calls it. */
async function overflowCheck({ subjects = null } = {}) {
  if (NIC.content) await NIC.content.all();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const problems = [];
  const mods = NIC.modules.filter((m) => !subjects || subjects.includes(m.subject || "nic"));
  for (const m of mods) {
    localStorage.removeItem("nic.lessonPos");
    location.hash = m.id;
    for (let k = 0; k < 20 && !NIC.player.isOpen(); k++) await wait(25);
    if (!NIC.player.isOpen()) {
      problems.push(`${m.id}: player did not open`);
      continue;
    }
    const n = NIC.player.state().n;
    for (let j = 0; j < n && NIC.player.peek(j); j++) {
      const kind = NIC.player.state().kind;
      await wait(kind === "try" ? 100 : 0); // layout is immediate; a demo redraws its canvases once it has its width
      const scr = document.querySelector(".pl-screen:not(.leaving)");
      const over = scr ? scr.scrollWidth - scr.clientWidth : 0;
      if (over > 1)
        problems.push(`${m.id} screen ${j + 1}/${n} (${kind}) is ${over}px wider than a ${window.innerWidth}px screen`);
    }
    NIC.player.close(true);
  }
  localStorage.removeItem("nic.lessonPos");
  return problems;
}

/* A finished revision round says what it set up ("1 question comes back sooner. Next due: tomorrow") and pays a bonus that
   grows with the round (NIC.bank.roundBonus). Runs a ten-question round, one answered wrong and fixed on the retry, the rest
   right, on a clean review log, then reads the complete screen. Leaves the progress it touched as it found it. */
async function reviseComplete() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const problems = [];
  const keys = () => Object.keys(localStorage).filter((k) => k.startsWith("nic.") || k === "csl.revSession");
  const keep = {};
  keys().forEach((k) => (keep[k] = localStorage.getItem(k)));
  try {
    await NIC.bank.load();
    const done = {};
    NIC.modules
      .filter((m) => m.num !== "Boss" && !m.workshop && !m.video)
      .slice(0, 6)
      .forEach((m) => (done[m.id] = true));
    localStorage.setItem("nic.lessonDone", JSON.stringify(done));
    localStorage.removeItem("nic.rev");
    localStorage.removeItem("csl.revSession");
    const ids = NIC.bank
      .all({ learnedOnly: true })
      .filter((x) => (x.Q.type || "mcq") === "mcq" && Array.isArray(x.Q.o))
      .slice(0, 10)
      .map((x) => x.id);
    if (ids.length < 10) return ["could not build a ten-question round from the finished lessons"];
    if (NIC.player.isOpen()) NIC.player.close(true);
    NIC.player.revise({ ids, n: 10, home: "practice" });
    await wait(400);
    let missedOne = false;
    for (let guard = 0; guard < 40 && NIC.player.isOpen(); guard++) {
      const st = NIC.player.state();
      if (st.kind === "complete") break;
      if (st.Q && /check/.test(st.foot)) {
        const first = !document.querySelector(".pl-screen:not(.leaving) .pl-prev");
        if (first && !missedOne) {
          missedOne = true;
          const wrong = [...document.querySelectorAll(".pl-screen:not(.leaving) .pl-body .opt")].find(
            (o) => +o.dataset.k !== st.Q.a,
          );
          wrong.click();
          document.querySelector(".pl-go").click();
          await wait(60);
        } else await answerCurrent();
      }
      document.querySelector(".pl-go").click();
      await wait(60);
    }
    if (NIC.player.state().kind !== "complete") return ["the round never reached its complete screen"];
    const after = (document.querySelector(".pd-after") || {}).innerText || "";
    if (!/1 question comes back sooner/.test(after))
      problems.push(`the missed question did not come back "sooner" on the complete screen (it says "${after}")`);
    if (!/Next due: tomorrow/.test(after))
      problems.push(`the complete screen did not say when the others come back (it says "${after}")`);
    const xp = +document.querySelector(".pd-card.c-gold").dataset.xp;
    if (xp !== 9 + NIC.bank.roundBonus(10))
      problems.push(`the round paid ${xp} XP, not 9 (nine first-time answers) + the ten-question round bonus`);
    if (!(NIC.bank.roundBonus(10) > 5)) problems.push("a ten-question round does not pay more than a short one's 5 XP");
  } catch (e) {
    problems.push(`the revision check threw: ${e.message}`);
  } finally {
    if (NIC.player.isOpen()) NIC.player.close(true);
    keys()
      .filter((k) => !(k in keep))
      .forEach((k) => localStorage.removeItem(k));
    Object.entries(keep).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  return problems;
}
