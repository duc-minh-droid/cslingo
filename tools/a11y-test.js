/* Accessibility checks that need real key presses, so they run from Node (Playwright) like tools/keyboard-test.js.
   1. Answer controls: the question types announce what is selected (aria-pressed follows the .sel / .on look), name their groups,
      give sliders a spoken value, and pick questions are reachable (a name, a button role, a focus ring, Enter picks).
   2. Figures: every shared figure builder (NIC.fig.*, NIC.qfig.*) returns an image or group with a description, and so does every
      chart canvas. Charts are also swept up when their canvas leaves the page.
   3. The step-through runner: Space presses a focused button instead of also toggling play, and a "predict" ask can be answered
      from the keyboard (targets focusable and named, announced, focus carried on afterwards).
   4. The keyboard focus ring is the accessible blue (--blue-ink). */
/* global NIC, document, window, location, localStorage, SVGElement, getComputedStyle, setTimeout, answerCurrent */

const SB = "a11y-sandbox";

export async function a11yChecks(page) {
  const problems = [];
  const bad = (m) => problems.push(m);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => NIC.player.isOpen() && NIC.player.close(true));
  await page.evaluate(() => (location.hash = "#home"));
  await page.waitForTimeout(400);

  /* A sandbox the checks render into, with a button after it so Shift+Tab lands on the last control. */
  await page.evaluate((SB) => {
    window.__a11yMount = (Q, key) => {
      document.getElementById(SB)?.remove();
      const holder = document.createElement("div");
      holder.id = SB;
      holder.style.cssText =
        "position:fixed;left:0;top:0;width:520px;max-height:100vh;overflow:auto;z-index:99999;background:var(--bg);padding:16px";
      holder.innerHTML = `<div class="predict"><div class="pl-q-text">${Q.q}</div><div class="q-body pl-body"></div></div><button id="${SB}-end" class="btn">end</button>`;
      document.body.appendChild(holder);
      const body = holder.querySelector(".q-body");
      const T = NIC.QUIZ_TYPES[Q.type || "mcq"];
      // the player's own handling of a picked diagram part: remember it as selected, with its ring
      T.render(
        Q,
        body,
        (v) => {
          if (Q.type !== "pick" || Array.isArray(Q.a)) return;
          body.querySelectorAll("[data-pick]").forEach((e) => {
            e.classList.toggle("sel", e.dataset.pick === v);
            T.ring(e, e.dataset.pick === v ? "sel" : "");
          });
        },
        key,
      );
      return body;
    };
    window.__a11yPressed = (root) =>
      [...root.querySelectorAll("[aria-pressed]")]
        .filter(
          (e) =>
            (e.getAttribute("aria-pressed") === "true") !== (e.classList.contains("sel") || e.classList.contains("on")),
        )
        .map((e) => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30));
  }, SB);
  const questions = await page.evaluate(() => {
    const all = NIC.bank.all({});
    const first = (t, f) => all.find((x) => (x.Q.type || "mcq") === t && (!f || f(x.Q)));
    const pick = {
      mcq: first("mcq"),
      multi: first("multi"),
      slider: first("slider"),
      cat: first("cat"),
      match: first("match"),
      order: first("order"),
      pick: first("pick", (q) => !Array.isArray(q.a)),
      pickMulti: first("pick", (q) => Array.isArray(q.a)),
    };
    window.__a11yQ = pick;
    return Object.fromEntries(Object.entries(pick).map(([k, v]) => [k, v && v.id]));
  });
  for (const [k, id] of Object.entries(questions)) if (!id) bad(`no ${k} question in the bank to check`);
  const mount = (name) =>
    page.evaluate((name) => !!window.__a11yMount(window.__a11yQ[name].Q, window.__a11yQ[name].id), name);
  const inBox = (fn, arg) =>
    page.evaluate(
      ([fn, arg]) => new Function("root", "arg", fn)(document.querySelector("#a11y-sandbox .q-body"), arg),
      [fn, arg],
    );

  // ---------- 1. answer controls ----------
  if (questions.mcq) {
    await mount("mcq");
    const g = await inBox(
      `const g = root.querySelector('[role=radiogroup]'); return g && !!(g.getAttribute('aria-label') || (g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby'))))`,
    );
    if (!g) bad("a multiple-choice question's option group has no name");
  }
  if (questions.multi) {
    await mount("multi");
    await inBox(`root.querySelectorAll('.opt')[0].click(); root.querySelectorAll('.opt')[2].click();`);
    const r = await inBox(
      `return { on: [...root.querySelectorAll('.opt')].filter((b) => b.getAttribute('aria-pressed') === 'true').length, off: window.__a11yPressed(root), group: !!root.querySelector('[role=group]') }`,
    );
    if (r.on !== 2 || r.off.length)
      bad(`select-all options: aria-pressed does not follow the selection (${JSON.stringify(r)})`);
    if (!r.group) bad("a select-all question's options are not in a group");
  }
  if (questions.slider) {
    await mount("slider");
    const r = await inBox(
      `const i = root.querySelector('input[type=range]'), o = root.querySelector('output'); const a = i.getAttribute('aria-valuetext');
       i.value = i.max; i.dispatchEvent(new Event('input')); return { a, b: i.getAttribute('aria-valuetext'), out: o.textContent, live: o.getAttribute('aria-live'), name: i.getAttribute('aria-label') }`,
    );
    if (!r.a || !r.b) bad("a slider question has no aria-valuetext");
    else if (r.b !== r.out) bad(`slider aria-valuetext "${r.b}" does not match what is shown ("${r.out}")`);
    if (r.live !== "off") bad("the slider's value is announced twice (its <output> is a live region)");
    if (!r.name) bad("a slider question's input has no name");
  }
  if (questions.cat) {
    await mount("cat");
    const r = await inBox(
      `const row = root.querySelector('.qc-row'), b = [...row.querySelectorAll('button')];
       const state = () => b.map((x) => x.getAttribute('aria-pressed')).join();
       const none = state(); b[0].click(); const one = state(); b[1].click(); const two = state();
       return { none, one, two, off: window.__a11yPressed(root), named: !!row.getAttribute('aria-label') || !!row.getAttribute('aria-labelledby'), n: b.length }`,
    );
    const zeros = (n) => Array(n).fill("false");
    if (r.none !== zeros(r.n).join()) bad("sort question buckets start pressed");
    if (r.one !== ["true", ...zeros(r.n - 1)].join())
      bad(`sort question: picking a bucket did not set aria-pressed (${r.one})`);
    if (r.two !== ["false", "true", ...zeros(r.n - 2)].join())
      bad(`sort question: aria-pressed did not move with the pick (${r.two})`);
    if (r.off.length) bad("sort question: aria-pressed differs from the selected look");
    if (!r.named) bad("a sort question's row has no name (a screen reader hears only the bucket names)");
  }
  if (questions.match) {
    await mount("match");
    const r = await inBox(
      `const L = [...root.querySelectorAll('.qm-l')], R = [...root.querySelectorAll('.qm-r')], out = {};
       const p = (b) => b.getAttribute('aria-pressed');
       L[0].click(); out.afterSelect = p(L[0]);
       L[0].click(); out.afterToggle = p(L[0]);
       // a wrong pair: both tiles go back to not pressed
       const wrong = R.find((b) => +b.dataset.i !== +L[0].dataset.k);
       L[0].click(); wrong.click(); out.wrong = [p(L[0]), p(wrong)].join();
       // switching the left tile before pairing: only the new one is pressed
       L[0].click(); L[1].click(); out.switched = [p(L[0]), p(L[1])].join(); L[1].click();
       // a right pair: both tiles are used up, and not left pressed
       const right = R.find((b) => +b.dataset.i === +L[0].dataset.k);
       L[0].click(); right.click(); out.right = [p(L[0]), p(right), L[0].disabled && right.disabled].join();
       out.off = window.__a11yPressed(root);
       out.groups = root.querySelectorAll('.qm-col[role=group][aria-label]').length;
       return out`,
    );
    if (r.afterSelect !== "true") bad("matching: a selected tile is not aria-pressed");
    if (r.afterToggle !== "false") bad("matching: tapping a selected tile again leaves it aria-pressed");
    if (r.wrong !== "false,false") bad(`matching: a wrong pair leaves tiles aria-pressed (${r.wrong})`);
    if (r.switched !== "false,true") bad(`matching: switching tile leaves the old one aria-pressed (${r.switched})`);
    if (r.right !== "false,false,true") bad(`matching: a right pair is not reset and disabled (${r.right})`);
    if (r.off.length) bad("matching: aria-pressed differs from the selected look");
    if (r.groups !== 2) bad("matching: the two columns are not named groups");
  }
  // keyboard: a tile or chip that disables itself once used must not drop the keyboard's place (focus would fall to the page top)
  const focusKept = () =>
    inBox(`const a = document.activeElement; return a && root.contains(a) && !a.disabled && a.tagName === 'BUTTON'`);
  if (questions.match) {
    await mount("match");
    await inBox(`const k = root.querySelector('.qm-l').dataset.k; root.querySelector('.qm-l').focus();`);
    await page.keyboard.press("Enter");
    await inBox(
      `const k = root.querySelector('.qm-l').dataset.k; root.querySelector('.qm-r[data-i="' + k + '"]').focus();`,
    );
    await page.keyboard.press("Enter");
    if (!(await focusKept())) bad("matching: after a right pair the keyboard focus was dropped");
  }
  if (questions.order) {
    await mount("order");
    await inBox(`root.querySelector('.qo-pool .chip-btn').focus();`);
    await page.keyboard.press("Enter");
    if (!(await focusKept())) bad("ordering: after placing an item the keyboard focus was dropped");
  }
  if (questions.pick) {
    await mount("pick");
    const set = await inBox(
      `return [...root.querySelectorAll('[data-pick]')].map((e) => [e.getAttribute('role'), e.getAttribute('tabindex'), (e.getAttribute('aria-label') || '').length > 0, e.getAttribute('aria-pressed')].join())`,
    );
    if (!set.length || set.some((s) => !/^button,0,true,false$/.test(s)))
      bad(`pick targets are not all focusable named buttons: ${set.slice(0, 3).join(" | ")}`);
    const grp = await inBox(
      `const g = root.querySelector('.q-pick'); return g.getAttribute('role') === 'group' && !!(g.getAttribute('aria-label') || g.getAttribute('aria-labelledby'))`,
    );
    if (!grp) bad("a pick question's diagram is not a named group");
    // keyboard: Shift+Tab from the end button reaches the last target, which gets a ring; Enter picks it
    await page.focus(`#${SB}-end`);
    await page.keyboard.press("Shift+Tab");
    const ring = () => page.evaluate((SB) => document.querySelectorAll(`#${SB} .pk-focus`).length, SB);
    const at = await page.evaluate(() => {
      const a = document.activeElement;
      return { pick: a.hasAttribute("data-pick"), fv: a.matches(":focus-visible"), svg: a instanceof SVGElement };
    });
    if (!at.pick) bad("Shift+Tab from after a pick question did not reach a diagram part");
    else if (at.svg && (await ring()) !== 1) bad("a focused pick target (SVG) draws no focus ring");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const picked = await inBox(
      `const a = document.activeElement; return { pressed: a.getAttribute('aria-pressed'), others: [...root.querySelectorAll('[data-pick]')].filter((e) => e !== a && e.getAttribute('aria-pressed') === 'true').length, off: window.__a11yPressed(root) }`,
    );
    if (picked.pressed !== "true" || picked.others)
      bad(`pick: Enter did not mark just that target pressed (${JSON.stringify(picked)})`);
    if (picked.off.length) bad("pick: aria-pressed differs from the selected look");
    await page.keyboard.press("Tab"); // on to the end button
    if (at.svg && (await ring()) !== 0) bad("the pick focus ring stayed after focus moved on");
  }
  if (questions.pickMulti) {
    await mount("pickMulti");
    await page.focus(`#${SB}-end`);
    await page.keyboard.press("Shift+Tab"); // the Check button is disabled, so this lands on the last target
    await page.keyboard.press("Enter");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Space");
    const r = await inBox(
      `return { on: [...root.querySelectorAll('[data-pick]')].filter((e) => e.getAttribute('aria-pressed') === 'true').length, off: window.__a11yPressed(root) }`,
    );
    if (r.on !== 2 || r.off.length)
      bad(`select-all diagram: aria-pressed does not follow the selection (${JSON.stringify(r)})`);
  }
  // every pick question in the bank: each target can be reached and has a name, whatever the figure did itself
  const picks = await page.evaluate(() => {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-9999px;top:0;width:600px";
    document.body.appendChild(holder);
    const out = { questions: 0, targets: 0, problems: [] };
    for (const x of NIC.bank.all({})) {
      if (x.Q.type !== "pick") continue;
      const box = document.createElement("div");
      holder.appendChild(box);
      try {
        NIC.QUIZ_TYPES.pick.render(x.Q, box, () => {}, x.id);
      } catch (e) {
        out.problems.push(`${x.id}: render threw ${e.message}`);
        continue;
      }
      out.questions++;
      for (const e of box.querySelectorAll("[data-pick]")) {
        out.targets++;
        if (
          e.getAttribute("role") !== "button" ||
          e.getAttribute("tabindex") !== "0" ||
          !(e.getAttribute("aria-label") || "").trim()
        )
          out.problems.push(`${x.id}: target "${e.dataset.pick}" is not a focusable named button`);
      }
      holder.removeChild(box);
    }
    holder.remove();
    return out;
  });
  if (!picks.questions) bad("no pick questions were checked");
  picks.problems.slice(0, 5).forEach(bad);
  if (picks.problems.length > 5) bad(`... and ${picks.problems.length - 5} more pick targets without a name`);
  await page.evaluate((SB) => document.getElementById(SB)?.remove(), SB);

  // ---------- 2. figures and charts ----------
  const figs = await page.evaluate(async () => {
    const out = [];
    const F = NIC.fig,
      Qf = NIC.qfig;
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-9999px;top:0;width:600px";
    document.body.appendChild(holder);
    const mk = (name, html, role) => {
      holder.innerHTML = html;
      const root = holder.firstElementChild;
      const label = (root && root.getAttribute("aria-label")) || "";
      if (!root || !role.includes(root.getAttribute("role"))) out.push(`${name}: root is not ${role.join("/")}`);
      else if (label.length < 8) out.push(`${name}: no description`);
      else if (/undefined|NaN|\[object|null/.test(label)) out.push(`${name}: description prints a bad value: ${label}`);
    };
    const nodes = { A: [60, 60], B: [220, 60], C: [140, 180] };
    mk(
      "fig.graph",
      F.graph({
        nodes,
        edges: [
          ["A", "B", 3],
          ["B", "C"],
          ["A", "C", 5, "rose"],
        ],
        hl: { A: "teal" },
      }),
      ["img"],
    );
    mk("fig.graph (directed)", F.graph({ nodes, edges: [["A", "B", 3]], directed: true }), ["img"]);
    mk("fig.flow", F.flow(["Client", { t: "Leader", s: "writes" }, "Follower"]), ["img"]);
    mk("fig.flow (loop)", F.flow(["a", "b"], { loop: true }), ["img"]);
    mk("fig.cycle", F.cycle(["Select", "Cross", { t: "Mutate" }], { center: "gen" }), ["img"]);
    mk(
      "fig.bars",
      F.bars([
        ["A", 3],
        ["B", 5, "rose", "most"],
      ]),
      ["img"],
    );
    mk("fig.cells", F.cells([1, 2, { v: 3, sub: "x" }], { label: "values" }), ["img"]);
    mk("fig.compare", F.compare({ title: "One", body: "a" }, { title: "Two", body: "b" }), ["group", "img"]);
    mk("fig.frames", F.frames([{ t: "first" }, { t: "second" }]), ["group", "img"]);
    mk(
      "fig.plot",
      F.plot([{ f: (x) => x * x, label: "square" }], { xl: "time", yl: "size", marks: [[0.5, "mid", "rose"]] }),
      ["img"],
    );
    mk("fig.graph (own label)", F.graph({ nodes, edges: [], label: "Three isolated towns" }), ["img"]);
    mk("qfig.graph (picture)", Qf.graph(nodes, [["A", "B", 2]]), ["img"]);
    mk("qfig.points (picture)", Qf.points({ A: [1, 2] }, { pick: false }), ["img"]);
    mk("qfig.graph (nodes to pick)", Qf.graph(nodes, [["A", "B"]], { pick: "nodes" }), ["group"]);
    holder.innerHTML = Qf.graph(nodes, [["A", "B", 2]], { pick: "edges" });
    const e = holder.querySelector("[data-pick]");
    if (!e || !/^Edge A to B/.test(e.getAttribute("aria-label") || ""))
      out.push("qfig.graph: an edge to pick has no name");
    holder.innerHTML = Qf.points({ A: [1, 2] });
    if (!/^Point A/.test(holder.querySelector("[data-pick]").getAttribute("aria-label") || ""))
      out.push("qfig.points: a point has no name");
    holder.innerHTML = Qf.curve((x) => Math.sin(x * 6), [[0.2, "A"]]);
    if (!/^Spot A/.test(holder.querySelector("[data-pick]").getAttribute("aria-label") || ""))
      out.push("qfig.curve: a spot has no name");
    // the figures that lessons embed (in step bodies and in picture steps written as strings): every one the builders made
    // describes real data, never "undefined" or "NaN". (A few lessons draw a figure by hand: those carry no role yet and are not failed.)
    let labelled = 0;
    for (const [id, L] of Object.entries(NIC.LESSONS)) {
      (L.steps || []).forEach((s, k) => {
        for (const html of [s.b, typeof s.v === "string" ? s.v : ""]) {
          if (!html) continue;
          holder.innerHTML = html;
          for (const f of holder.querySelectorAll("svg.fig, .fig-bars, .fig-cells, .fig-compare, .fig-frames")) {
            if (!f.hasAttribute("role")) continue;
            labelled++;
            const l = f.getAttribute("aria-label") || "";
            if (l.trim().length < 8 || /undefined|NaN|\[object/.test(l))
              out.push(`${id} step ${k + 1}: a figure's description is "${l.slice(0, 60)}"`);
          }
        }
      });
    }
    if (labelled < 40)
      out.push(`only ${labelled} described figures were found in lesson steps: the check is not looking`);
    holder.remove();
    return out;
  });
  figs.slice(0, 12).forEach(bad);

  const charts = await page.evaluate(async () => {
    const out = [];
    await NIC.lazy("vendor/chart.umd.js");
    await new Promise((r) => setTimeout(r, 100));
    if (!window.Chart) return ["Chart.js did not load"];
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:0;top:0;width:500px;z-index:99999;background:var(--bg)";
    document.body.appendChild(holder);
    const mk = (draw, opts) => {
      const c = document.createElement("canvas");
      holder.appendChild(c);
      draw(c, opts);
      return c;
    };
    const line = mk(NIC.lineChart, {
      series: [{ data: [1, 3, 2, 5], color: "#58cc02" }],
      names: ["Score"],
      xLabel: "round",
      height: 120,
    });
    const bar = mk(NIC.barChart, {
      groups: [{ values: [2, 4, 3], color: "#1cb0f6" }],
      labels: ["a", "b", "c"],
      height: 120,
    });
    for (const [name, c] of [
      ["line chart", line],
      ["bar chart", bar],
    ]) {
      if (c.getAttribute("role") !== "img") out.push(`a ${name} is not an image for assistive technology`);
      const l = c.getAttribute("aria-label") || "";
      if (l.length < 20 || /undefined|NaN/.test(l)) out.push(`a ${name} has a poor description: "${l}"`);
    }
    if (!/Score starts at 1, ends at 5/.test(line.getAttribute("aria-label")))
      out.push("the line chart description does not come from its data");
    if (!/a = 2, b = 4, c = 3/.test(bar.getAttribute("aria-label")))
      out.push("the bar chart description does not come from its data");
    // the label follows an update
    NIC.lineChart(line, {
      series: [{ data: [1, 3, 2, 9], color: "#58cc02" }],
      names: ["Score"],
      xLabel: "round",
      height: 120,
    });
    if (!/ends at 9/.test(line.getAttribute("aria-label"))) out.push("a chart's description did not follow its data");
    // a page-supplied label is kept
    const own = document.createElement("canvas");
    own.setAttribute("aria-label", "Written by hand");
    holder.appendChild(own);
    NIC.barChart(own, { groups: [{ values: [1, 2], color: "#1cb0f6" }], height: 100 });
    if (own.getAttribute("aria-label") !== "Written by hand") out.push("a label written into the page was replaced");
    // charts whose canvas has left the page are destroyed by the next chart that is drawn
    const before = Object.keys(window.Chart.instances).length;
    const spare = [1, 2, 3].map(() => mk(NIC.lineChart, { series: [{ data: [1, 2], color: "#58cc02" }], height: 80 }));
    spare.forEach((c) => c.remove());
    mk(NIC.lineChart, { series: [{ data: [1, 2], color: "#58cc02" }], height: 80 });
    const after = Object.keys(window.Chart.instances).length;
    if (after > before + 1) out.push(`charts leak: ${after - before - 1} of 3 removed charts were not destroyed`);
    holder.remove();
    return out;
  });
  charts.forEach(bad);

  // ---------- 3. the step-through runner ----------
  const S = ".pl-screen:not(.leaving) ";
  const opened = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    if (NIC.player.isOpen()) NIC.player.close(true);
    localStorage.removeItem("nic.lessonPos");
    location.hash = "#home";
    await wait(150);
    location.hash = "a2-dijkstra";
    await wait(500);
    for (let i = 0; i < 60 && NIC.player.isOpen(); i++) {
      const screen = document.querySelector(".pl-screen:not(.leaving)");
      if (screen && screen.querySelector(".rn")) break;
      const st = NIC.player.state();
      if (st.Q && /check/.test(st.foot)) await answerCurrent();
      else document.querySelector(".pl-go").click();
      await wait(40);
    }
    await wait(500);
    return !!document.querySelector(".pl-screen:not(.leaving) .rn");
  });
  if (!opened) bad("could not open the runner step");
  else {
    const rn = (fn) =>
      page.evaluate(
        ([S, fn]) => new Function("rn", "S", `return (${fn})(rn)`)(document.querySelector(S + ".rn"), S),
        [S, fn],
      );
    const playLabel = () => rn(`(rn) => rn.querySelector('.rn-play').getAttribute('aria-label')`);
    const frame = () => rn(`(rn) => rn.__rn.i()`);
    const role = await rn(`(rn) => rn.getAttribute('role')`);
    if (role !== "group") bad("the runner has a name but no role");
    if (!(await rn(`(rn) => rn.querySelector('.rn-bubble').getAttribute('aria-live') === 'polite'`)))
      bad("the runner caption is not a live region");
    // Space on a button inside the figure presses that button only
    await rn(`(rn) => { rn.querySelector('[data-a=again]').click(); rn.querySelector('[data-a=next]').focus(); }`);
    const f0 = await frame();
    await page.keyboard.press("Space");
    await page.waitForTimeout(250);
    if ((await frame()) !== f0 + 1) bad("Space on the runner's Next button did not step once");
    if ((await playLabel()) !== "Play") bad("Space on the runner's Next button also started playing");
    // Space on the figure itself plays, and again pauses
    await rn(`(rn) => rn.focus()`);
    await page.keyboard.press("Space");
    if ((await playLabel()) !== "Pause") bad("Space on the runner did not start playing");
    await page.keyboard.press("Space");
    if ((await playLabel()) !== "Play") bad("Space on the runner did not pause");
    // the scrubber speaks its position
    if (
      !(await rn(
        `(rn) => /^Step \\d+ of \\d+$/.test(rn.querySelector('.rn-scrub').getAttribute('aria-valuetext') || '')`,
      ))
    )
      bad("the runner's scrubber has no spoken position");
    // a predict ask, from the keyboard
    await rn(`(rn) => { rn.querySelector('[data-a=again]').click(); rn.focus(); }`);
    let asked = false;
    for (let i = 0; i < 30 && !asked; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);
      asked = await rn(`(rn) => !rn.querySelector('.rn-ask').hidden`);
    }
    if (!asked) bad("the runner never asked a prediction");
    else {
      await page.waitForTimeout(400);
      const a = await rn(
        `(rn) => { const p = [...rn.querySelectorAll('.rn-pickable')]; window.__rnPicks = p;
          return { n: p.length, ok: p.every((e) => e.getAttribute('tabindex') === '0' && e.getAttribute('role') === 'button' && (e.getAttribute('aria-label') || '').trim()),
            said: (rn.querySelector('.rn-sr') || {}).textContent || '', status: (rn.querySelector('.rn-sr') || document.body).getAttribute('role'), focus: p.includes(document.activeElement), key: NIC.player.state().key } }`,
      );
      if (a.n < 2 || !a.ok) bad(`the runner's ask targets are not focusable named buttons (${JSON.stringify(a)})`);
      if (!/Predict/.test(a.said) || a.status !== "status") bad("the runner's ask is not announced");
      if (!a.focus) bad("the runner's ask did not take the keyboard to its first target");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const b = await rn(
        `(rn) => ({ left: rn.querySelectorAll('.rn-pickable').length, stuck: window.__rnPicks.filter((e) => e.hasAttribute('tabindex') || e.getAttribute('role') === 'button').length,
          said: (rn.querySelector('.rn-sr') || {}).textContent || '', res: !!rn.querySelector('.rn-res'), onBar: !!document.activeElement.closest('.rn-bar'), key: NIC.player.state().key })`,
      );
      if (b.left || b.stuck) bad("the runner's ask targets stayed focusable after the answer");
      if (!b.res || !b.said) bad("the runner's answer was not shown and announced");
      if (!b.onBar) bad("after answering a runner ask the keyboard did not carry on from the controls");
      if (b.key !== a.key) bad("Enter on a runner ask target also moved the lesson on");
    }
  }
  await page.evaluate(() => NIC.player.isOpen() && NIC.player.close(true));
  await page.evaluate(() => (location.hash = "#home"));
  await page.waitForTimeout(300);

  // ---------- 4. the focus ring ----------
  await page.evaluate((SB) => {
    const h = document.createElement("div");
    h.id = SB;
    h.style.cssText = "position:fixed;left:0;top:0;z-index:99999;background:var(--bg);padding:16px";
    h.innerHTML = `<button id="${SB}-a" class="btn">a</button><button id="${SB}-b" class="btn">b</button><i id="${SB}-probe" style="color:var(--blue-ink)">x</i>`;
    document.body.appendChild(h);
  }, SB);
  await page.focus(`#${SB}-b`);
  await page.keyboard.press("Shift+Tab");
  const ring = await page.evaluate((SB) => {
    const b = document.getElementById(`${SB}-a`),
      cs = getComputedStyle(b);
    return {
      focused: document.activeElement === b,
      ring: cs.outlineColor,
      style: cs.outlineStyle,
      want: getComputedStyle(document.getElementById(`${SB}-probe`)).color,
    };
  }, SB);
  if (!ring.focused) bad("could not focus the focus-ring probe");
  else if (ring.style === "none" || ring.ring !== ring.want)
    bad(`the keyboard focus ring is ${ring.ring} (${ring.style}), not the accessible blue ${ring.want}`);
  await page.evaluate((SB) => document.getElementById(SB)?.remove(), SB);
  return problems;
}
