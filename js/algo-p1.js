/* Algorithms that Changed the World — Phase 1: Foundations & PageRank.
   Modules: 1.1 algorithm anatomy, 1.2 growth counting, 1.3 random surfer, 1.4 PageRank mechanics, boss quiz.
   Numbers verified against Sessions 01–03 (token trace totals 75, the d=0.75 worked step, H matrix). */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle, esc } = N;
  const L = NIC.LESSONS;

  // ---------- tiny lesson-visual builders ----------
  const table = (head, rows) => `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${(r.hl || (r[0] && r[0].hl)) ? "hl" : (r.bad || (r[0] && r[0].bad)) ? "bad" : ""}">${[].concat(r.c || (r[0] && r[0].c) || r).flat(2).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const flow = (items) => `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;
  const bars = (items) => `<div style="display:grid;gap:6px;max-width:520px">${items.map(([lbl, pct, c]) => `<div style="display:grid;grid-template-columns:120px 1fr 60px;gap:10px;align-items:center"><span class="mono dim">${lbl}</span><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${Math.max(1, pct)}%;background:${c || "var(--teal)"}"></span></span><span class="mono">${pct}%</span></div>`).join("")}</div>`;

  /* ================================================================
     1.1 — What is an algorithm?
     ================================================================ */
  L["a1-anatomy"] = {
    sum: "An algorithm is a recipe with no interpretation left to the reader. Trust it because of its <b>invariant</b>: a promise that starts true, stays true, and becomes the answer at the end.",
    steps: [
      { t: "A wish is not an algorithm", b: `<p>“Deal with the most urgent support request” is a wish. A computer can't run it — too much is left to interpretation. An algorithm answers every question in advance:</p>`,
        v: table(["Question", "Example answer"], [["INPUT — what arrives?", "a list of requests"], ["OUTPUT — what is returned?", "the single most urgent one"], ["COMPARE — how is 'urgent' defined?", "highest priority number; tie → earliest submitted"], ["STEPS — in what order?", "scan once, keep the best-so-far"], ["TERMINATE — when does it stop?", "after the last request"], ["EDGE CASES — empty list? bad data?", "return 'none'; reject malformed rows"]]) },
      { t: "Watch the state change", b: `<p>Here is the smallest real loop there is — <b>find the biggest number</b>:</p>
        <div class="pseudo"><div>best ← first item</div><div>for each remaining item x:</div><div>&nbsp;&nbsp;&nbsp;&nbsp;if x &gt; best:&nbsp;&nbsp;best ← x</div><div>return best</div></div>
        <p>Two pieces of <b>state</b> change every step: <code>best</code> (the answer so far) and your <b>position</b> in the list. Everything else is decoration.</p>` },
      { t: "The promise that stays true", b: `<p>Why trust this loop on a list you've never seen? Because of a <b>loop invariant</b> — a promise linking the state to the progress made:</p><span class="key">After k items have been checked, <code>best</code> = the biggest of those k items.</span><p>Three checks turn the promise into a proof:</p>`,
        v: flow([["Starts true", "teal"], ["Stays true", "violet"], ["Ends useful", "amber"]]) + `<p class="dim" style="margin-top:8px">k = 1: best <i>is</i> the biggest of the first item. Each step replaces best by max(old best, x), so the promise survives. At k = n the promise says “best = biggest of all” — exactly the goal.</p>`,
        c: { q: "An invariant that “usually holds” is…", o: ["good enough for most inputs", "not an invariant — if the promise can break mid-loop, nothing guarantees the ending", "fine if the loop is short"], a: 1, why: "The whole point is that it holds at <b>every</b> step. One broken step and the correctness argument has no anchor." } },
      { t: "Edge cases are where promises die", b: `<p><code>best ← first item</code> fails silently on an <b>empty list</b> — there is no first item, so the invariant can't even start. That's why the checklist includes edge cases: decide what “biggest of nothing” means <i>before</i> the loop runs (return <code>none</code>, raise an error, anything explicit).</p>
        <p>Negative numbers and duplicates are <b>fine</b> — the comparison still works. It's the missing start that breaks it.</p>`,
        c: { q: "Which input breaks the loop <code>best ← first item</code>?", o: ["A list of negative numbers", "An empty list", "A list with duplicates"], a: 1, why: "No first item → the invariant can't start. Negatives and duplicates are handled by the comparison itself." } },
      { t: "You'll meet this pattern again", b: `<p>The same “promise that stays true” structure powers the famous algorithms in this module:</p>`,
        v: table(["Algorithm", "The invariant"], [["Dijkstra (Phase 2)", "the cheapest unsettled node's distance is already final"], ["PageRank (this phase)", "every iteration preserves total rank = 1"], ["Simplex (Phase 3)", "every corner visited is feasible and no worse than the last"]]) },
    ],
    guide: [
      "Press <b>Step one line</b> and watch the highlighted pseudocode line, the state, and the log — one click = one line executed.",
      "Watch the <b>invariant box</b>: it should say “promise holds ✓” after every step, including i = 0.",
      "Press <b>Auto</b> to run to the end, then read the final invariant box — it becomes the answer.",
      "Switch the input to <b>Empty list</b> and run: the loop ends before it starts, and “none” is the honest answer.",
      "Answer the Predict question.",
    ],
  };

  N.register({
    id: "a1-anatomy", subject: "algo", lecture: 1, order: 1, num: "1.1",
    title: "What is an algorithm?",
    blurb: "Step a tiny loop one line at a time and watch the promise that stays true the whole way through.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const LINES = [
        "best ← none",
        "i ← 0                    // items checked so far",
        "while i < length(list):",
        "    if best is none or list[i] > best:  best ← list[i]",
        "    i ← i + 1",
        "return best",
      ];
      let list = [], i = 0, best = null, pc = 0, empty = false, running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Run the loop one line at a time</h2><span class="faint">goal: return the biggest number</span></div>
        <div class="grid side">
          <div>
            <div class="pseudo" id="code">${LINES.map((s, k) => `<div data-k="${k}">${esc(s)}</div>`).join("")}</div>
            <div class="controls">
              <button class="btn primary" id="st">Step one line →</button>
              <button class="btn" id="go">Auto</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="modeRow"><span class="faint" style="font-size:13px">Input:</span></div>
            <div class="log mono" id="log" style="font-size:12.5px;max-height:150px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">The state</h3>
            <div class="pop" id="items"></div>
            <div class="stat-row">
              <div class="stat"><small>i (items checked)</small><b id="svi">0</b></div>
              <div class="stat violet"><small>best so far</small><b id="svb">none</b></div>
            </div>
            <div id="inv"></div>
          </div>
        </div></div>`);
      root.appendChild(card);
      const say = (m) => qs("#log", card).insertAdjacentHTML("beforeend", `<div>· ${m}</div>`);
      qs("#modeRow", card).appendChild(N.seg([["nums", "A real list"], ["empty", "Empty list"]], "nums", (v) => { empty = v === "empty"; reset(); }));
      function reset() {
        list = empty ? [] : shuffle([3, 8, 1, 9, 4, 9, 2, 7, 5]).slice(0, 7);
        i = 0; best = null; pc = 0;
        qs("#log", card).innerHTML = "";
        say(empty ? "the list is empty — watch the loop test" : `list = [${list.join(", ")}]`);
        draw();
      }
      function step() {
        if (pc === 5) return;
        if (pc === 0) { best = null; say("best ← none"); pc = 1; }
        else if (pc === 1) { i = 0; say("i ← 0 — nothing checked yet"); pc = 2; }
        else if (pc === 2) {
          if (i >= list.length) { say(`i=${i} ≥ ${list.length} → loop ends`); pc = 5; say(`return ${best === null ? "<b>none</b> (empty list)" : "<b>" + best + "</b>"}`); }
          else { say(`i=${i} < ${list.length} → check list[${i}] = ${list[i]}`); pc = 3; }
        } else if (pc === 3) {
          const x = list[i];
          if (best === null || x > best) { say(`${x} beats ${best === null ? "nothing" : best} → best ← ${x}`); best = x; }
          else say(`${x} doesn't beat ${best} → best stays`);
          pc = 4;
        } else if (pc === 4) { i++; say(`i ← ${i}`); pc = 2; }
        draw();
        if (pc === 5) stop();
      }
      function draw() {
        qsa("#code div", card).forEach((d, k) => d.classList.toggle("on", k === pc));
        qs("#items", card).innerHTML = list.length
          ? list.map((v, k) => `<div class="chip ${k === i && pc >= 3 && pc <= 4 ? "scan" : ""} ${v === best && best !== null ? "winner" : ""}" style="${k < i ? "" : "opacity:.55"}"><small>list[${k}]</small><b>${v}</b></div>`).join("")
          : `<span class="faint">[ ] — the list is empty</span>`;
        qs("#svi", card).textContent = i;
        qs("#svb", card).textContent = best === null ? "none" : best;
        const fm = i === 0 ? null : Math.max(...list.slice(0, i));
        const holds = i === 0 ? best === null : best === fm;
        const inv = qs("#inv", card);
        inv.className = "callout " + (holds ? "teal" : "rose");
        inv.innerHTML = pc === 5
          ? `<b>Finished.</b> The promise at i = ${list.length} says best = biggest of <b>all</b> items — ${best === null ? "and <b>none</b> is the right answer to “biggest of nothing”." : `it returned <b>${best}</b>.`} The invariant became the answer.`
          : `<b>Invariant:</b> after i items are checked, best = biggest of those i.<br>Now: i = ${i}, max of checked = ${i === 0 ? "—" : fm}, best = ${best === null ? "none" : best} → <b>${holds ? "promise holds ✓" : "BROKEN ✗"}</b>`;
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Auto"; qs("#go", card).classList.remove("on"); } }
      qs("#st", card).onclick = () => { stop(); step(); };
      qs("#go", card).onclick = () => { if (running) return stop(); if (pc === 5) return; qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); running = life.interval(step, 550); };
      qs("#rs", card).onclick = () => { stop(); reset(); };
      reset();
      root.appendChild(predict({
        id: "a1-anatomy-1",
        q: "The loop is running on <code>[3, 8, 1, 9, 4, 9, 2]</code>. It just checked the <b>4</b> (i was 4, now i = 5). What are <code>best</code> and the max of checked items now?",
        opts: ["best = 4, max of checked = 4", "best = 9, max of checked = 9 — best stayed, and the promise still holds", "best = 9, max of checked = 4"],
        a: 1,
        why: "4 doesn't beat 9, so best stays 9 — and the biggest of the first five items is also 9. Every step preserves the invariant whether or not best changes.",
      }));
      root.appendChild(el(`<div class="callout violet"><b>Why you should care.</b> “It worked when I tried it” is a test. “The promise holds at every step” is a proof. Tests check the inputs you tried; the invariant covers <b>all</b> inputs, including the ones you haven't imagined yet.</div>`));
      root.appendChild(takeaways([
        "An algorithm needs: precise input/output, a defined comparison, ordered steps, termination, and an answer for edge cases.",
        "<b>State</b> = what changes each step. <b>Invariant</b> = the promise about the state that stays true.",
        "Correctness = the promise <b>starts true</b>, <b>stays true</b> each step, and <b>ends as the answer</b>.",
        "Empty input is the classic edge case: the loop can't even start its promise.",
      ], "A loop is correct because its promise starts true, stays true, and ends as the answer."));
    },
  });

  /* ================================================================
     1.2 — How loops grow
     ================================================================ */
  const PATS = {
    single: { name: "One pass", code: "for i in 0..n:\n    work()", f: (n) => n, cls: "O(n)", note: "Double n → double work." },
    dependent: { name: "Inner loop grows", code: "for i in 0..n:\n    for j in 0..i:\n        work()", f: (n) => (n * (n - 1)) / 2, cls: "O(n²)", note: "0+1+2+…+(n−1) = n(n−1)/2. Halving a quadratic is still a quadratic." },
    nested: { name: "Full nested", code: "for i in 0..n:\n    for j in 0..n:\n        work()", f: (n) => n * n, cls: "O(n²)", note: "Every i meets every j: n² calls." },
    halving: { name: "Repeated halving", code: "i ← n\nwhile i > 1:\n    work()\n    i ← floor(i / 2)", f: (n) => { let c = 0, x = n; while (x > 1) { x = Math.floor(x / 2); c++; } return c; }, cls: "O(log n)", note: "Double n → just one extra step. The growth nobody believes at first." },
  };

  L["a1-bigo"] = {
    sum: "Don't count seconds — count <b>work() calls</b> as a function of n. Single loop: n. Growing inner loop: n(n−1)/2. Halving: log₂n. Keep the dominant term; that's Big-O.",
    steps: [
      { t: "Count work, not seconds", b: `<p>Seconds depend on your machine, the language, and luck. <b>Operation counts</b> depend only on the algorithm. Take each pattern and ask: how many times does <code>work()</code> run, as a function of n?</p>`,
        v: table(["Pattern", "work() calls at n = 10", "…at n = 1000"], [["<code>for i: work()</code>", "10", "1,000"], ["<code>for i: for j&lt;i: work()</code>", "45", "499,500"], ["<code>for i: for j&lt;n: work()</code>", "100", "1,000,000"], ["repeated halving", "3", "9"]]) },
      { t: "The growing inner loop is still quadratic", b: `<p><code>for j in 0..i</code> looks gentler than a full nested loop — and it is, by a factor of two:</p><span class="key">$$0 + 1 + 2 + \\dots + (n-1) = \\frac{n(n-1)}{2} = \\frac{n^2}{2} - \\frac{n}{2}$$</span><p>As n grows the $\\tfrac{n^2}{2}$ term swamps the $-\\tfrac{n}{2}$, so this is <b>$O(n^2)$</b>. Big-O keeps the dominant term and throws away the constant: the <i>shape</i> of the growth is what survives.</p>`,
        c: { q: "Is <code>5n + 100</code> really O(n)?", o: ["No — the 100 makes it bigger", "Yes — at large n the linear term dominates; constants don't change the growth shape", "No — it's O(5n)"], a: 1, why: "O(5n) isn't wrong mathematically, but convention writes O(n). Big-O is about shape, not constant speed — though 5× slower is still 5× slower in real life." } },
      { t: "Halving beats everything", b: `<p><code>while i &gt; 1: work(); i ← i/2</code>. How many halvings to reach 1? <b>⌈log₂ n⌉</b>.</p><p>The magic consequence: <b>doubling n adds one step</b>. n = 8 → 3 steps; n = 16 → 4; n = 1024 → 10; n = a billion → ~30. That's why binary search and its cousins scale to planetary inputs.</p>`,
        c: { q: "Doubling n makes an O(log n) algorithm…", o: ["twice as slow", "take roughly one more step", "take n more steps"], a: 1, why: "One extra halving undoes one doubling. log₂(2n) = log₂ n + 1." } },
      { t: "Rank the growth shapes", b: `<p>Slowest-growing to fastest-growing, the session's lineup:</p>`,
        v: flow([["20", "teal"], ["log₂ n", "teal"], ["5n + 100", "violet"], ["n log₂ n", "violet"], ["3n² + n", "amber"], ["2ⁿ", "rose"]]) + `<p class="dim" style="margin-top:8px">Constants and small terms never change the <i>order</i>. And any exponential eventually beats any polynomial — even 1.1ⁿ vs n¹⁰⁰.</p>`,
        c: { q: "Two fragments both solve the problem. How do you decide which is better?", o: ["Whichever has fewer lines", "Whichever resource use (time, space) grows more slowly with n", "Whichever was written first"], a: 1, why: "Same answer, different scaling. Growth is the deciding information — it's the whole point of Big-O." } },
    ],
    guide: [
      "Pick a loop pattern and press <b>Double n</b> a few times — watch the × column settle on a signature.",
      "Match each signature to a growth class: ×2 → linear, ×4 → quadratic, +1 → logarithmic.",
      "Press <b>Run to 4096</b> on each pattern and compare the totals.",
      "Look at the comparison bars (log scale) — how far ahead is the quadratic at n = 1024?",
      "Answer the Predict question.",
    ],
  };

  N.register({
    id: "a1-bigo", subject: "algo", lecture: 1, order: 2, num: "1.2",
    title: "How loops grow",
    blurb: "Double the input, watch the work. Every loop pattern has a signature: ×2, ×4, or +1.",
    render(root) {
      root.appendChild(header(this, ""));
      let pat = "dependent", n = 8, rows = [];
      const card = el(`<div class="card">
        <div class="card-head"><h2>The doubling experiment</h2><span class="faint">each row doubles n — what does work() do?</span></div>
        <div class="grid side">
          <div>
            <div class="controls" id="seg"></div>
            <div class="pseudo" id="code"></div>
            <p class="dim" id="pnote" style="margin:8px 0 0;font-size:13.5px"></p>
            <div class="controls">
              <button class="btn primary" id="dbl">Double n →</button>
              <button class="btn" id="run4">Run to n = 4096</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
          </div>
          <div>
            <table class="t" id="tbl"><tr><th>n</th><th>work() calls</th><th>× previous</th><th>+ previous</th></tr></table>
            <div id="sig" style="margin-top:10px"></div>
          </div>
        </div></div>`);
      root.appendChild(card);
      qs("#seg", card).appendChild(N.seg(Object.keys(PATS).map((k) => [k, PATS[k].name]), pat, (v) => { pat = v; reset(); }));
      const drawCode = () => { qs("#code", card).innerHTML = PATS[pat].code.split("\n").map((s) => `<div>${esc(s)}</div>`).join(""); qs("#pnote", card).innerHTML = `${PATS[pat].note} &nbsp;Class: <b>${PATS[pat].cls}</b>`; };
      function drawTbl() {
        const t = qs("#tbl", card);
        t.innerHTML = `<tr><th>n</th><th>work() calls</th><th>× previous</th><th>+ previous</th></tr>` + rows.map((r, k) => {
          const prev = k ? rows[k - 1].ops : null;
          return `<tr><td>${r.n.toLocaleString()}</td><td>${r.ops.toLocaleString()}</td>
            <td>${prev === null ? "—" : "×" + (r.ops / prev).toFixed(2)}</td>
            <td>${prev === null ? "—" : "+" + (r.ops - prev).toLocaleString()}</td></tr>`;
        }).join("");
        const last2 = rows.slice(-2);
        let sig = "";
        if (last2.length === 2 && rows.length >= 3) {
          const ratio = last2[1].ops / last2[0].ops, diff = last2[1].ops - last2[0].ops;
          sig = ratio > 3 ? `<span class="pill rose">×~4 each doubling → quadratic O(n²)</span>` : ratio > 1.5 ? `<span class="pill teal">×~2 each doubling → linear O(n)</span>` : diff <= 2 ? `<span class="pill amber">+~1 each doubling → logarithmic O(log n)</span>` : "";
        }
        qs("#sig", card).innerHTML = sig;
      }
      function dbl() { rows.push({ n, ops: PATS[pat].f(n) }); n *= 2; drawTbl(); }
      function reset() { n = 8; rows = []; drawCode(); dbl(); }
      qs("#dbl", card).onclick = () => { if (n <= 65536) dbl(); };
      qs("#run4", card).onclick = () => { while (n <= 4096) dbl(); };
      qs("#rs", card).onclick = reset;
      reset();
      // all four compared at n=1024, log-scaled so the tiny ones stay visible
      const comp = el(`<div class="card"><div class="card-head"><h3>All four at n = 1,024</h3><span class="faint">bar width is log-scaled, or you'd never see the small ones</span></div>
        <div style="display:grid;gap:7px">${Object.values(PATS).map((p) => {
          const ops = p.f(1024), w = (Math.log10(Math.max(1, ops)) / 6) * 100;
          return `<div style="display:grid;grid-template-columns:150px 1fr 130px;gap:10px;align-items:center"><span class="mono dim" style="font-size:12.5px">${p.name} <b>${p.cls}</b></span><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${w.toFixed(1)}%;background:var(--violet)"></span></span><span class="mono">${ops.toLocaleString()} calls</span></div>`;
        }).join("")}</div>
        <p class="dim" style="margin:10px 0 0;font-size:13.5px">The quadratic patterns did <b>~100,000×</b> more work than halving — at n = 1024. At web scale that gap is the difference between "finished before lunch" and "heat death of the universe".</p></div>`);
      root.appendChild(comp);
      root.appendChild(predict({
        id: "a1-bigo-1",
        q: "The growing-inner loop runs <code>work()</code> n(n−1)/2 times. You double n. The work goes up by roughly…",
        opts: ["×2 — twice the input, twice the work", "×4 — it behaves like n²", "+1 — like the halving loop"],
        a: 1,
        why: "$\\frac{n(n-1)}{2} \\approx \\frac{n^2}{2}$ for large n, and $\\frac{(2n)^2}{2} = 4 \\cdot \\frac{n^2}{2}$. Halving a quadratic just makes a <i>cheaper</i> quadratic — try it in the table above.",
      }));
      root.appendChild(takeaways([
        "Count <code>work()</code> calls as a function of n — seconds lie, counts don't.",
        "Doubling signatures: ×2 → O(n), ×4 → O(n²), +1 → O(log n).",
        "<code>n(n−1)/2</code> is still O(n²): Big-O keeps the dominant term, drops constants.",
        "Exponential (2ⁿ) eventually beats every polynomial, no matter how big the degree.",
      ], "Double the input and watch what the work does: ×2 is linear, ×4 is quadratic, +1 is logarithmic."));
    },
  });

  /* ================================================================
     1.3 — The random surfer
     ================================================================ */
  const SURF = {
    leaky: {
      name: "The leaky web",
      nodes: { A: [80, 60], B: [290, 45], C: [180, 160], D: [430, 130] },
      out: { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] },
      note: "D is a <b>dangling</b> page: pages link to it, but it links nowhere. Without teleports, the surfer parks there forever once it arrives.",
      converges: "C ≈ 35%, A ≈ D ≈ 23%, B ≈ 19%",
    },
    trap: {
      name: "The link trap",
      nodes: { X: [80, 105], A: [250, 70], B: [420, 135] },
      out: { X: ["A"], A: ["B"], B: ["A"] },
      note: "A ↔ B bounce rank between themselves forever. X feeds them but gets nothing back. Only teleports let the surfer escape.",
      converges: "A ≈ 49%, B ≈ 46%, X ≈ 5% (pure teleport floor)",
    },
  };
  function pageRank(out, names, d, repair = true, iters = 400) {
    const M = names.length;
    let p = names.map(() => 1 / M);
    for (let k = 0; k < iters; k++) {
      const np = names.map(() => 0);
      names.forEach((s, j) => {
        const links = out[s];
        if (!links.length) { if (repair) names.forEach((_, i2) => (np[i2] += p[j] / M)); }
        else links.forEach((t) => (np[names.indexOf(t)] += p[j] / links.length));
      });
      p = np.map((v) => d * v + (1 - d) / M);
    }
    return p;
  }

  L["a1-surfer"] = {
    sum: "Rank <b>flows</b> through links and splits over out-degree. Dead ends leak it, closed loops trap it — a small <b>teleport</b> probability fixes both.",
    steps: [
      { t: "Rank is a flow, not a count", b: `<p>Counting incoming links is easy to cheat and wrong in spirit: one link from an important page outweighs fifty from empty blogs. PageRank treats rank like <b>water</b>:</p><p>① every page <b>pours all its rank</b> into its outgoing links, split equally;<br>② a link from an important page carries more;<br>③ a page linking to 100 places dilutes each drop to 1/100.</p>`,
        c: { q: "X has rank 0.8 and 100 outgoing links; Y has rank 0.2 and one link. Both link to Z. Who contributes more?", o: ["X — much higher rank", "Y — X's share is diluted to 0.008, Y gives 0.2", "They tie"], a: 1, why: "A link's worth = source rank ÷ out-degree. 0.8/100 = 0.008 &lt; 0.2/1 = 0.2." } },
      { t: "The token trace", b: `<p>Give every page <b>25 tokens</b>. Each pours all of them, split equally over outgoing links. On the leaky web (A→B,C · B→C · C→A,D · D→nowhere):</p>`,
        v: table(["Source", "Pours", "To"], [["A", "12.5 each", "B, C"], ["B", "25", "C"], ["C", "12.5 each", "A, D"], ["D", "25", "<b>nowhere</b>"]], ) + `<p style="margin-top:10px">Received: A = 12.5, B = 12.5, C = 37.5, D = 12.5 — total <b>75, not 100</b>.</p>`,
        c: { q: "Where did the missing 25 tokens go?", o: ["To the page with most links", "They evaporated — D received tokens but had no out-edges to pour them through", "They doubled back to A"], a: 1, why: "D holds 25 tokens with nowhere to send them. A dangling page leaks rank out of the system entirely." } },
      { t: "The repair: pour to everyone", b: `<p>The standard fix treats “no outgoing choice” as <b>complete uncertainty</b>: a dangling page distributes its rank <b>uniformly to all pages</b> (25 tokens → 6.25 each on a 4-page web). Total returns to 100, and no link knowledge is invented.</p><span class="key">Mass can't vanish in a probability model. If a page can't choose, it chooses everything.</span>` },
      { t: "The link trap", b: `<p>Dangling isn't the only failure. Take <code>X → A → B → A</code>: once rank enters the A↔B cycle, it <b>sloshes between them forever</b> — conserved, but trapped. X sits at 0 and the ranking says nothing real about A vs B.</p>`,
        v: table(["Step", "X", "A", "B"], [{ c: ["0", "25", "25", "25"] }, { c: ["1", "0", "50", "25"] }, { c: ["2", "0", "25", "50"] }, { c: ["3", "0", "50", "25"], bad: true }]) + `<p class="dim" style="margin-top:8px">A↔B oscillate forever. The trap is plugged only by…</p>` },
      { t: "The random surfer rule", b: `<p>A lazy reader clicks links. A lazier reader sometimes types a random address:</p><span class="key">With probability <b>d ≈ 0.85</b>: follow a random outgoing link.<br>With probability <b>1 − d ≈ 0.15</b>: teleport to a random page.</span><p>Teleporting escapes every trap, crosses disconnected islands, and gives every page a floor of attention. The price: damping is a dial between “trust the link structure” and “trust nothing”.</p>`,
        c: { q: "A search engine sets d = 0.999. Most likely effect?", o: ["Faster, better rankings", "Traps and dangling behaviour reappear — it barely teleports", "Identical results"], a: 1, why: "d → 1 means the surfer almost never escapes. Convergence slows and pathological graphs dominate again." } },
    ],
    guide: [
      "Press <b>Surf</b> and watch the dot hop along links. Occasionally it teleports (orange flash).",
      "Watch the visit bars settle — compare with the long-run PageRank values under each bar.",
      "Drag damping to <b>1.00</b> (never teleport) on the leaky web: the surfer eventually parks at D forever.",
      "Switch to <b>The link trap</b> with d = 1.00: watch A↔B oscillate while X starves. Then lower d and watch X come back to ~5%.",
      "Answer the Predict question.",
    ],
  };

  N.register({
    id: "a1-surfer", subject: "algo", lecture: 1, order: 3, num: "1.3",
    title: "The random surfer",
    blurb: "One lazy reader, clicking links and occasionally teleporting. Her visit counts ARE the PageRank.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let gkey = "leaky", d = 0.85, cur = "A", visits = {}, hops = 0, teleports = 0, stuckTicks = 0, running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Drop a surfer on the web</h2><span class="faint">each tick: follow a link with probability d, else teleport</span></div>
        <div class="grid side">
          <div>
            <div id="svgWrap"></div>
            <div class="controls" id="ctl">
              <button class="btn primary" id="go">Surf</button>
              <button class="btn" id="hop">1 hop</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="dRow"></div>
            <div class="controls" id="gRow"><span class="faint" style="font-size:13px">Web:</span></div>
            <div id="status" class="callout" style="margin-top:4px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">Visit share so far</h3>
            <div id="vbars"></div>
            <div class="stat-row" style="margin-top:14px">
              <div class="stat"><small>Hops</small><b id="sh">0</b></div>
              <div class="stat amber"><small>Teleports</small><b id="st">0</b></div>
              <div class="stat violet"><small>Current page</small><b id="sc">—</b></div>
            </div>
            <p class="faint" id="truth" style="font-size:12.5px"></p>
          </div>
        </div></div>`);
      root.appendChild(card);
      const dSlider = N.slider("Damping d (follow links)", 0, 1, 0.05, d, (v) => `d = ${v.toFixed(2)} · teleport ${(1 - v).toFixed(2)}`);
      dSlider.onInput((v) => { d = v; drawStatus(); });
      qs("#dRow", card).appendChild(dSlider);
      qs("#gRow", card).appendChild(N.seg(Object.keys(SURF).map((k) => [k, SURF[k].name]), gkey, (v) => { gkey = v; reset(); }));
      const G = () => SURF[gkey];
      function svgHTML() {
        const g = G(), P = g.nodes, parts = [`<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="var(--text-dim)" stroke-width="1.4"/></marker></defs>`];
        for (const u of Object.keys(g.out)) for (const v of g.out[u]) {
          const [x1, y1] = P[u], [x2, y2] = P[v];
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          const recip = (g.out[v] || []).includes(u);
          const off = recip ? 22 : 7;
          const cx = mx - (dy / len) * off, cy = my + (dx / len) * off;
          // shorten ends so arrow lands at circle edge
          const tx = x2 + (cx - x2) * 0.16, ty = y2 + (cy - y2) * 0.16;
          parts.push(`<path d="M${x1},${y1} Q${cx},${cy} ${tx},${ty}" fill="none" stroke="var(--line-2)" stroke-width="1.6" marker-end="url(#ah)"/>`);
        }
        for (const [k, [x, y]] of Object.entries(P)) {
          parts.push(`<circle cx="${x}" cy="${y}" r="20" fill="var(--panel-2)" stroke="${g.out[k].length ? "var(--teal)" : "var(--rose)"}" stroke-width="2.5"/>
            <text x="${x}" y="${y + 5}" fill="var(--text)" font-size="14" font-weight="700" text-anchor="middle">${k}</text>
            ${g.out[k].length ? "" : `<text x="${x}" y="${y + 34}" fill="var(--rose)" font-size="10" text-anchor="middle" font-family="var(--mono)">dead end</text>`}`);
        }
        parts.push(`<circle id="dot" r="8" fill="var(--amber)" stroke="#fff" stroke-width="2" cx="${P[cur][0]}" cy="${P[cur][1]}"/><circle id="tp" r="8" fill="none" stroke="var(--amber)" stroke-width="2" cx="${P[cur][0]}" cy="${P[cur][1]}" opacity="0"/>`);
        return `<svg class="viz" viewBox="0 0 540 210" style="max-height:230px">${parts.join("")}</svg>`;
      }
      function reset() {
        const g = G();
        cur = Object.keys(g.nodes)[0]; visits = {}; Object.keys(g.nodes).forEach((k) => (visits[k] = 0)); visits[cur] = 1;
        hops = 0; teleports = 0; stuckTicks = 0;
        qs("#svgWrap", card).innerHTML = svgHTML();
        draw();
      }
      function tick() {
        const g = G(), links = g.out[cur];
        if (rnd() < d) {
          if (!links.length) { stuckTicks++; visits[cur]++; hops++; }
          else { cur = links[randint(0, links.length - 1)]; visits[cur]++; hops++; }
        } else {
          const names = Object.keys(g.nodes);
          cur = names[randint(0, names.length - 1)]; visits[cur]++; hops++; teleports++;
          const tp = qs("#tp", card), P = g.nodes[cur];
          if (tp) { tp.setAttribute("cx", P[0]); tp.setAttribute("cy", P[1]); tp.setAttribute("r", 8); tp.setAttribute("opacity", 0.9); let r0 = 8; const anim = life.interval(() => { r0 += 3; tp.setAttribute("r", r0); tp.setAttribute("opacity", Math.max(0, 0.9 - r0 / 40)); if (r0 > 36) anim(); }, 40); }
        }
        draw();
      }
      function draw() {
        const g = G(), P = g.nodes[cur], dot = qs("#dot", card);
        if (dot) { dot.setAttribute("cx", P[0]); dot.setAttribute("cy", P[1]); }
        const tot = Object.values(visits).reduce((a, b) => a + b, 0) || 1;
        qs("#vbars", card).innerHTML = Object.keys(g.nodes).map((k) => {
          const pct = (visits[k] / tot) * 100;
          return `<div style="display:grid;grid-template-columns:30px 1fr 52px;gap:10px;align-items:center;margin-bottom:7px"><b class="mono">${k}</b><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${pct.toFixed(1)}%;background:var(--teal);transition:width .25s"></span></span><span class="mono dim" style="font-size:12px">${pct.toFixed(0)}%</span></div>`;
        }).join("");
        qs("#sh", card).textContent = hops; qs("#st", card).textContent = teleports; qs("#sc", card).textContent = cur;
        qs("#truth", card).innerHTML = d < 1 ? `True PageRank at d = ${d.toFixed(2)}: <b>${G().converges}</b> — the bars settle toward it as hops grow.` : `d = 1: no teleports. Whatever trap exists wins — there is no single right answer.`;
        drawStatus();
      }
      function drawStatus() {
        const st = qs("#status", card);
        if (d >= 1 && !G().out[cur].length) { st.className = "callout rose"; st.innerHTML = `<b>Stuck.</b> The surfer reached ${cur}, which has no out-links, and d = 1 means she never teleports. She will click here forever — every visit share collapses onto ${cur}.`; }
        else if (d >= 1) { st.className = "callout amber"; st.innerHTML = `<b>No teleporting (d = 1).</b> ${gkey === "trap" ? "She'll fall into the A↔B cycle and bounce forever — X never sees her again." : "She can only follow links. Wait until she lands on D — there's no way out."}`; }
        else { st.className = "callout teal"; st.innerHTML = G().note; }
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Surf"; qs("#go", card).classList.remove("on"); } }
      qs("#go", card).onclick = () => { if (running) return stop(); qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); running = life.interval(() => { tick(); }, 320); };
      qs("#hop", card).onclick = () => { stop(); tick(); };
      qs("#rs", card).onclick = () => { stop(); reset(); };
      reset();
      root.appendChild(predict({
        id: "a1-surfer-1",
        q: "On the leaky web with teleporting <b>off</b> (d = 1.00), what do the visit shares converge to?",
        opts: ["Evenly spread — she visits everything eventually", "All on D — once she arrives there's no way out", "All on C — it has the most incoming links"],
        a: 1,
        why: "D is a <b>sink</b>: links go in, none come out. Every random walk ends parked there — the visit share collapses to 100% D, and the ranking is meaningless. That's the dangling leak in surfer form.",
      }));
      root.appendChild(takeaways([
        "Rank <b>flows</b> through links: a link's worth = source's rank ÷ its out-degree.",
        "<b>Dangling</b> pages leak rank (nothing to pour through); repair = pour uniformly to everyone.",
        "<b>Closed loops</b> trap rank — the A↔B slosh. Teleporting escapes every trap and gives every page a floor.",
        "Damping d is the dial between trusting link structure (d→1) and trusting nothing (d→0).",
      ], "A random surfer who mostly clicks links and sometimes teleports ends up spending time on pages in exactly PageRank proportions."));
    },
  });

  /* ================================================================
     1.4 — PageRank mechanics
     ================================================================ */
  const PRG = {
    names: ["P", "Q", "R", "S", "T"],
    out: { P: ["Q", "R"], Q: ["R"], R: ["P", "S"], S: ["R"], T: [] },
    pos: { P: [70, 70], Q: [195, 40], R: [330, 80], S: [255, 180], T: [440, 175] },
  };

  L["a1-pagerank"] = {
    sum: "links → matrix H → repair dangling → A → teleport → G → iterate. Every G entry is positive, so rank can never be trapped — and the numbers converge.",
    steps: [
      { t: "Links become a matrix", b: `<p>On our five-page web (<code>P→Q,R &nbsp;Q→R &nbsp;R→P,S &nbsp;S→R &nbsp;T→∅</code>), build <b>H</b> where <b>H[i,j]</b> = probability of jumping <i>from j to i</i>. <b>Columns are sources</b>: each page's rank pours fully into its column.</p>`,
        v: table(["to ↓ from →", "P", "Q", "R", "S", "T"], [{ c: ["<b>P</b>", "0", "0", ".5", "0", "0"] }, { c: ["<b>Q</b>", ".5", "0", "0", "0", "0"] }, { c: ["<b>R</b>", ".5", "1", "0", "1", "0"], hl: true }, { c: ["<b>S</b>", "0", "0", ".5", "0", "0"] }, { c: ["<b>T</b>", "0", "0", "0", "0", "0"], bad: true }]) + `<p class="dim" style="margin-top:8px">Column sums: 1, 1, 1, 1, <b>0</b> — T's column leaks, exactly like the token trace.</p>`,
        c: { q: "Which single fact catches a transposed H?", o: ["The matrix is square", "Sources are columns, so columns must sum to 1 — if the dangling page shows up as a zero row, you flipped it", "All entries are small"], a: 1, why: "Orientation is where most PageRank bugs live. Column-stochastic = every source distributes all of its rank." } },
      { t: "Repair, then teleport", b: `<p>Two fixes produce <b>G</b>, the Google matrix:</p><span class="key">A = H with every dangling column replaced by 1/N<br>B = every entry 1/N (pure teleport)<br><b>G = d·A + (1−d)·B</b></span><p>At N = 5 and d = 0.75, teleport adds (1−d)/N = <b>0.05 to every entry</b> — no entry of G is ever 0, so no trap can hold rank forever.</p>`,
        c: { q: "Column P of G (P links to Q and R) = 0.75·[0,.5,.5,0,0] + 0.05 everywhere. Rows P…T =", o: ["[0.25, 0.375, 0.375, 0.05, 0.05]", "[0.05, 0.425, 0.425, 0.05, 0.05]", "[0, 0.5, 0.5, 0, 0]"], a: 1, why: "0.75·0.5 + 0.05 = 0.425; everything else gets just the 0.05 teleport floor. Column sums to 1 ✓." } },
      { t: "One power-iteration step, by hand", b: `<p>Start with p₀ = [0.4, 0.1, 0.2, 0.2, 0.1]. Compute p₁ = G·p₀ (trick: 0.75·(A·p₀) + 0.05·Σp₀):</p>`,
        v: table(["Page", "A·p₀", "×0.75 + 0.05"], [["P", "0.12", "0.14"], ["Q", "0.22", "0.215"], ["R", "0.52", "<b>0.44</b>"], ["S", "0.12", "0.14"], ["T", "0.02", "0.065"]]) + `<p class="dim" style="margin-top:8px">Sanity checks to always run: sum(p₁) = 1 ✓ · all entries ≥ 0 ✓ · R wins because everyone feeds it.</p>` },
      { t: "Why it converges", b: `<p>Every entry of G is <b>strictly positive</b> (thanks to the teleport floor). A positive matrix can mix but never trap: starting from <i>any</i> valid p₀, repeated multiplication settles to one answer — the PageRank vector. At d = 0.85 ours is roughly <b>R 0.41, P ≈ S 0.21, Q 0.13, T 0.04</b>.</p>`,
        c: { q: "Two different starting vectors converge to the same ranking. That proves the code is…", o: ["correct", "stable — both could be wrong together", "fast"], a: 1, why: "Convergence agreement shows the iteration is stable, not that the matrix was built right. You still need column-sum and mass checks." } },
      { t: "What it costs", b: `<p>Each iteration multiplies a vector by G:</p>`,
        v: table(["Implementation", "Cost per iteration"], [["Dense matrix", "O(N²) — touches all N² entries"], ["Sparse (walk the links)", "O(N + L) — each page and each link once"]]) + `<p class="dim" style="margin-top:8px">Real webs have billions of pages and ~10 links each. Sparse is the difference between “trillion operations” and “fine”.</p>` },
    ],
    guide: [
      "Press <b>Iterate</b> once: watch the five bars jump from the start vector.",
      "Press <b>Run</b>: the bars settle and the error curve dives toward zero — that's convergence.",
      "Set damping to <b>0.75</b> and the start vector to <b>session p₀</b>: the first step should print the session's numbers (0.14 / 0.215 / 0.44 / 0.14 / 0.065).",
      "Turn <b>repair dangling</b> OFF and run: watch total mass leak below 1.0 — T's column goes nowhere.",
      "Drag damping near 1.00: convergence crawls. That's d ≈ 1 being fragile.",
      "Answer the Predict question.",
    ],
  };

  N.register({
    id: "a1-pagerank", subject: "algo", lecture: 1, order: 4, num: "1.4",
    title: "PageRank mechanics",
    blurb: "The real update rule, running live: repair the dangling page, add the teleport floor, and iterate until it settles.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const names = PRG.names, M = names.length;
      let d = 0.85, repair = true, p = names.map(() => 1 / M), iter = 0, deltas = [], running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Power iteration, live</h2><span class="faint">p ← G·p until it stops moving</span></div>
        <div class="grid side">
          <div>
            <div id="svgWrap"></div>
            <div class="controls" id="ctl">
              <button class="btn primary" id="it">Iterate once</button>
              <button class="btn" id="go">Run</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="dRow"></div>
            <div class="controls" id="optRow"></div>
            <div id="msg" class="callout teal" style="margin-top:4px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">Rank vector p</h3>
            <div id="pbars"></div>
            <div class="stat-row">
              <div class="stat"><small>Iteration</small><b id="si">0</b></div>
              <div class="stat ${repair ? "teal" : "rose"}" id="massStat"><small>Total mass</small><b id="sm">1.000</b></div>
              <div class="stat violet"><small>Max change</small><b id="sd">—</b></div>
            </div>
            <canvas class="viz" id="cv" style="margin-top:6px"></canvas>
            <p class="faint" style="font-size:12.5px;margin:6px 0 0">max |Δp| per iteration — convergence means this line hits the floor.</p>
          </div>
        </div></div>`);
      root.appendChild(card);
      const dSlider = N.slider("Damping d", 0.5, 0.99, 0.01, d, (v) => `d = ${v.toFixed(2)}`);
      dSlider.onInput((v) => { d = v; });
      qs("#dRow", card).appendChild(dSlider);
      const rep = el(`<label class="field" style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked> <span>Repair dangling pages (T pours to everyone)</span></label>`);
      qs("input", rep).onchange = (e) => { repair = e.target.checked; qs("#massStat", card).className = "stat " + (repair ? "teal" : "rose"); };
      const startSeg = N.seg([["u", "Uniform start"], ["s", "Session p₀ (0.4,0.1,0.2,0.2,0.1)"]], "u", (v) => { reset(v); });
      qs("#optRow", card).append(rep, startSeg);
      function svgHTML() {
        const P = PRG.pos, parts = [`<defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="var(--text-dim)" stroke-width="1.4"/></marker></defs>`];
        for (const u of names) for (const v of PRG.out[u]) {
          const [x1, y1] = P[u], [x2, y2] = P[v];
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const recip = PRG.out[v].includes(u), off = recip ? 20 : 7;
          const cx = (x1 + x2) / 2 - (dy / len) * off, cy = (y1 + y2) / 2 + (dx / len) * off;
          parts.push(`<path d="M${x1},${y1} Q${cx},${cy} ${x2 + (cx - x2) * 0.18},${y2 + (cy - y2) * 0.18}" fill="none" stroke="var(--line-2)" stroke-width="1.6" marker-end="url(#ah2)"/>`);
        }
        for (const k of names) {
          const [x, y] = P[k];
          parts.push(`<circle cx="${x}" cy="${y}" r="19" fill="var(--panel-2)" stroke="${PRG.out[k].length ? "var(--teal)" : "var(--rose)"}" stroke-width="2.5"/><text x="${x}" y="${y + 5}" fill="var(--text)" font-size="14" font-weight="700" text-anchor="middle">${k}</text>${PRG.out[k].length ? "" : `<text x="${x}" y="${y + 32}" fill="var(--rose)" font-size="10" text-anchor="middle" font-family="var(--mono)">dangling</text>`}`);
        }
        return `<svg class="viz" viewBox="0 0 540 220" style="max-height:220px">${parts.join("")}</svg>`;
      }
      function step() {
        const np = names.map(() => 0);
        names.forEach((s, j) => {
          const links = PRG.out[s];
          if (!links.length) { if (repair) names.forEach((_, i2) => (np[i2] += p[j] / M)); }
          else links.forEach((t) => (np[names.indexOf(t)] += p[j] / links.length));
        });
        const np2 = np.map((v) => d * v + (1 - d) / M);
        const delta = Math.max(...np2.map((v, i2) => Math.abs(v - p[i2])));
        p = np2; iter++; deltas.push(delta);
        draw();
      }
      function draw() {
        const mx = Math.max(...p, 1e-9);
        qs("#pbars", card).innerHTML = names.map((k, i2) => {
          const isMax = p[i2] === mx && mx > 1 / M + 0.001;
          return `<div style="display:grid;grid-template-columns:30px 1fr 62px;gap:10px;align-items:center;margin-bottom:7px">
            <b class="mono">${k}</b><span style="height:16px;border-radius:8px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${(p[i2] * 100).toFixed(1)}%;background:${isMax ? "var(--amber)" : "var(--teal)"};transition:width .25s"></span></span>
            <span class="mono dim" style="font-size:12px">${p[i2].toFixed(3)}</span></div>`;
        }).join("");
        qs("#si", card).textContent = iter;
        const mass = p.reduce((a, b) => a + b, 0);
        qs("#sm", card).textContent = mass.toFixed(3);
        qs("#sm", card).style.color = Math.abs(mass - 1) > 0.005 ? "var(--rose)" : "";
        qs("#sd", card).textContent = deltas.length ? deltas[deltas.length - 1].toExponential(1) : "—";
        N.lineChart(qs("#cv", card), { series: [{ data: deltas, color: N.colors().violet, dots: true }], height: 140, xLabel: "iteration", yMin: 0 });
        const m = qs("#msg", card);
        if (!repair && mass < 0.995) { m.className = "callout rose"; m.innerHTML = `<b>Leaking!</b> T's column is all zeros, so every iteration loses d×rank(T) of the mass. Total is ${mass.toFixed(3)} and dropping — a probability vector can't survive a leaking column.`; }
        else if (deltas.length && deltas[deltas.length - 1] < 1e-6) { m.className = "callout teal"; m.innerHTML = `<b>Converged.</b> The vector stopped moving — this is the PageRank ranking for this web: R first, P ≈ S next, then Q, then T.`; }
        else { m.className = "callout teal"; m.innerHTML = `Each step: pour rank along links${repair ? " (T pours to everyone)" : " (T pours nowhere — watch the mass)"}, then add the ${(1 - d).toFixed(2)} teleport floor.`; }
      }
      function reset(start) {
        p = (start === "s" ? [0.4, 0.1, 0.2, 0.2, 0.1] : names.map(() => 1 / M)).slice();
        iter = 0; deltas = [];
        qs("#svgWrap", card).innerHTML = svgHTML();
        draw();
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Run"; qs("#go", card).classList.remove("on"); } }
      qs("#it", card).onclick = () => { stop(); step(); };
      qs("#go", card).onclick = () => { if (running) return stop(); qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); running = life.interval(step, 260); };
      qs("#rs", card).onclick = () => { stop(); reset(); };
      reset();
      root.appendChild(predict({
        id: "a1-pagerank-1",
        q: "Turn <b>Repair dangling pages</b> OFF and run the iteration. What happens to the total rank mass?",
        opts: ["Stays at 1.0 — mass is always conserved", "Shrinks every iteration — T's all-zero column leaks d×rank(T) each step", "Grows past 1.0"],
        a: 1,
        why: "With no repair, T collects rank (teleports and C's endorsement still arrive) but pours d·rank(T) into the void each step. The sum drifts below 1 — the invariant 'mass = 1' is broken, and no fixed point can be a proper probability vector.",
      }));
      root.appendChild(el(`<div class="callout amber"><b>Checks worth remembering.</b> ① Every column of the matrix sums to 1. ② Every iteration's vector sums to 1. ③ All entries stay ≥ 0. ④ Two different starts agree. Break any one and you have a bug — the session's "matrix clinic" boss is exactly this list.</div>`));
      root.appendChild(takeaways([
        "Pipeline: <b>links → H → repair dangling → A → +teleport → G → iterate</b>.",
        "H is <b>column</b>-stochastic: sources are columns, each summing to 1.",
        "Teleport makes every G entry &gt; 0 → no traps, guaranteed convergence, every page gets a floor.",
        "Per-iteration cost: dense O(N²), sparse O(N+L). At web scale, only sparse survives.",
      ], "Repair the leak, add a teleport floor so nothing can trap the flow, then multiply until the numbers stop moving."));
    },
  });

  /* ================================================================
     Boss — Phase 1
     ================================================================ */
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => { if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v; };
  addV("a1-anatomy", 1, FG.frames([
    { t: "start: best = first item (3)", v: FG.cells([{ v: 3, c: "teal", sub: "best" }, 8, 2, 9, 5]) },
    { t: "8 > 3 → best = 8", v: FG.cells([3, { v: 8, c: "teal", sub: "best" }, 2, 9, 5]) },
    { t: "2 isn't bigger → no change", v: FG.cells([3, { v: 8, c: "teal" }, { v: 2, c: "dim" }, 9, 5]) },
    { t: "9 > 8 → best = 9 (5 won't beat it)", v: FG.cells([3, 8, 2, { v: 9, c: "teal", sub: "best" }, 5]) },
  ]));
  addV("a1-anatomy", 3, FG.compare({ title: "Empty list []", c: "rose", body: "<code>best ← first item</code> has nothing to read. Decide first: return <b>none</b>, or raise an error." }, { title: "Other traps", c: "amber", body: "all equal [4,4,4] · all negative [−3,−9] · one item [7]. The invariant must hold for each." }));
  addV("a1-bigo", 1, FG.plot([{ f: (n) => n, c: "teal", label: "n" }, { f: (n) => (n * (n - 1)) / 2, c: "amber", label: "n(n−1)/2" }, { f: (n) => n * n, c: "rose", dash: "5 4", label: "n²" }], { x: [1, 30], xl: "input size n", yl: "work() calls", h: 200 }) + `<div class="fig-cap">The growing inner loop (amber) is always half of n², so it has the same curved shape: quadratic.</div>`);
  addV("a1-bigo", 2, FG.cells([{ v: 16, c: "violet" }, "→", 8, "→", 4, "→", 2, "→", { v: 1, c: "teal" }]) + `<div class="fig-cap">16 → 1 takes 4 halvings = log₂16. A billion takes only about 30.</div>`);
  addV("a1-surfer", 0, FG.graph({ nodes: { A: { x: 80, y: 110, sub: "rank 30" }, B: { x: 290, y: 45, sub: "+15" }, C: { x: 290, y: 175, sub: "+15" } }, edges: [["A", "B", "½"], ["A", "C", "½"]], directed: true, hl: { A: "teal", "A-B": "teal", "A-C": "teal" }, w: 380, h: 215 }) + `<div class="fig-cap">A has two outgoing links, so each one carries half of A's rank.</div>`);
  addV("a1-surfer", 2, FG.graph({ nodes: { D: { x: 200, y: 150, sub: "dangling · keeps 6.25" }, A: [60, 50], B: [340, 50], C: [200, 30] }, edges: [["D", "A", "6.25", "amber"], ["D", "B", "6.25", "amber"], ["D", "C", "6.25", "amber"]], directed: true, hl: { D: "amber" }, w: 400, h: 210 }) + `<div class="fig-cap">D has no links, so its 25 tokens are split 4 ways: 6.25 to each of A, B, C and 6.25 back to itself. Nothing leaks away.</div>`);
  addV("a1-surfer", 4, FG.bars([["follow a link", 85, "teal", "d = 0.85"], ["teleport anywhere", 15, "violet", "1 − d"]], { max: 100, unit: "%" }));
  addV("a1-pagerank", 1, FG.flow([{ t: "H", s: "raw link matrix" }, { t: "A", s: "fix dangling columns → 1/N", c: "amber" }, { t: "G = d·A + (1−d)·B", s: "add the teleport floor", c: "teal" }]));
  addV("a1-pagerank", 3, FG.plot([{ f: (k) => Math.pow(0.85, k), c: "teal", fill: true, label: "error ∝ 0.85ᵏ" }], { x: [0, 30], y: [0, 1], xl: "iteration k", yl: "distance from the answer", h: 180 }) + `<div class="fig-cap">Each iteration shrinks the remaining error by roughly a factor of d. After ~50 steps it's negligible.</div>`);
})();
