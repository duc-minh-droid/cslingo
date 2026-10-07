/* algo-p3-x-01.js: LP library (fractions, dictionary, runner) and 3.1 formulate */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const mod = (id) => N.modules.find((m) => m.id === id);
  const T = (head, rows, hl = -1) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r, i) => `<tr class="${i === hl ? "hl" : ""}">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const nice = (v) =>
    Math.abs(v - Math.round(v)) < 1e-6 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
  const sgn = (v) => (v < 0 ? "−" : "") + Math.abs(v);
  /* ---------- exact fractions ---------- */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
  const Q = (n, d = 1) => {
    const g = gcd(n, d),
      s = d < 0 ? -1 : 1;
    return { n: (s * n) / g, d: (s * d) / g };
  };
  const qadd = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d),
    qsub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  const qmul = (a, b) => Q(a.n * b.n, a.d * b.d),
    qdiv = (a, b) => Q(a.n * b.d, a.d * b.n);
  const qv = (a) => a.n / a.d;
  const qt = (a) => (a.n < 0 ? "−" : "") + (a.d === 1 ? Math.abs(a.n) : `${Math.abs(a.n)}/${a.d}`);
  const vn = (i) => `x<sub>${i + 1}</sub>`,
    vp = (i) => `x${i + 1}`;
  const mag = (q, i) => `${Math.abs(q.n) === 1 ? "" : Math.abs(q.n)}${vn(i)}${q.d > 1 ? "/" + q.d : ""}`;
  function fromNum(v) {
    for (let d = 1; d <= 60; d++) {
      const n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) return Q(n, d);
    }
    return Q(Math.round(v * 1000), 1000);
  }
  const qt0 = (v) => qt(fromNum(v));
  /* ---------- dictionary (slack form), Cormen style ----------
     z = v + sum c_j x_j ;  x_i = b_i - sum a_ij x_j  for each basic i.  Variables 0..n-1 are the originals, n..n+m-1 the slacks. */
  const dInit = (c, A, b) => {
    const n = c.length,
      m = A.length;
    return {
      n,
      m,
      N: [...Array(n).keys()],
      B: [...Array(m).keys()].map((i) => n + i),
      rows: A.map((r, i) => ({ b: Q(b[i]), a: Object.fromEntries(r.map((v, j) => [j, Q(v)])) })),
      v: Q(0),
      c: Object.fromEntries(c.map((v, j) => [j, Q(v)])),
    };
  };
  function dPivot(D, l, e) {
    const lv = D.B[l],
      R = D.rows[l],
      ale = R.a[e],
      be = qdiv(R.b, ale),
      ae = {};
    D.N.forEach((j) => {
      if (j !== e) ae[j] = qdiv(R.a[j], ale);
    });
    ae[lv] = qdiv(Q(1), ale);
    const rows = D.rows.map((row, i) => {
      if (i === l) return { b: be, a: ae };
      const aie = row.a[e],
        a = {};
      D.N.forEach((j) => {
        if (j !== e) a[j] = qsub(row.a[j], qmul(aie, ae[j]));
      });
      a[lv] = qmul(Q(-1), qmul(aie, ae[lv]));
      return { b: qsub(row.b, qmul(aie, be)), a };
    });
    const ce = D.c[e],
      c = {};
    D.N.forEach((j) => {
      if (j !== e) c[j] = qsub(D.c[j], qmul(ce, ae[j]));
    });
    c[lv] = qmul(Q(-1), qmul(ce, ae[lv]));
    return {
      n: D.n,
      m: D.m,
      N: D.N.filter((j) => j !== e)
        .concat([lv])
        .sort((a, b) => a - b),
      B: D.B.map((x, i) => (i === l ? e : x)),
      rows,
      v: qadd(D.v, qmul(ce, be)),
      c,
    };
  }
  const dEnter = (D) => {
    const cand = D.N.filter((j) => qv(D.c[j]) > 0);
    return cand.length ? cand.reduce((m, j) => (qv(D.c[j]) > qv(D.c[m]) ? j : m), cand[0]) : -1;
  };
  const dRatios = (D, e) => D.rows.map((r) => (qv(r.a[e]) > 0 ? qdiv(r.b, r.a[e]) : null));
  const dLeave = (D, rat) => {
    let l = -1;
    rat.forEach((q, i) => {
      if (q && (l < 0 || qv(q) < qv(rat[l]) - 1e-12 || (Math.abs(qv(q) - qv(rat[l])) < 1e-12 && D.B[i] < D.B[l])))
        l = i;
    });
    return l;
  };
  const dSol = (D) => {
    const x = Array(D.n + D.m).fill(0);
    D.rows.forEach((r, i) => (x[D.B[i]] = qv(r.b)));
    return x;
  };
  /** Whole simplex on c, A, b. Returns {status, D, log:[{e, out, z, x}], x, z}. Needs every b >= 0 (origin feasible). */
  function lpSolve(c, A, b) {
    if (b.some((v) => v < 0)) return { status: "origin-infeasible", log: [] };
    let D = dInit(c, A, b);
    const log = [];
    for (let k = 0; k < 40; k++) {
      const e = dEnter(D);
      if (e < 0) return { status: "optimal", D, log, x: dSol(D), z: D.v };
      const rat = dRatios(D, e),
        l = dLeave(D, rat);
      if (l < 0) return { status: "unbounded", D, log, e };
      const out = D.B[l];
      D = dPivot(D, l, e);
      log.push({ e, out, z: D.v, x: dSol(D) });
    }
    return { status: "stalled", D, log };
  }
  /* ---------- dictionary runner ---------- */
  (function css() {
    if (document.getElementById("a3d-css")) return;
    const s = document.createElement("style");
    s.id = "a3d-css";
    s.textContent = `.a3d{display:grid;gap:7px;padding:6px 2px;font-family:var(--mono);font-size:14.5px;font-weight:700;color:var(--ink)}
.a3d-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 7px;padding:7px 11px;border:2px solid var(--line);border-radius:12px;background:var(--panel);min-height:38px}
.a3d-line b.a3d-lhs{min-width:2.2em}
.a3d-line.out{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 12%,var(--panel))}
.a3d-line.fresh{border-color:var(--blue)}
.a3d-line.ok{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 10%,var(--panel))}
.a3d-t{padding:0 5px;border-radius:7px;border:2px solid transparent}
.a3d-t.on{background:color-mix(in srgb,var(--teal) 22%,var(--panel));border-color:var(--teal)}
.a3d-t.pos{color:var(--teal-ink,var(--teal))}
.a3d-r{margin-left:auto;font:800 12px var(--sans);color:var(--amber-ink,var(--amber));white-space:nowrap}
.a3d-sol{font:800 13px var(--sans);color:var(--text-dim);padding:2px 6px}
.a3d-sol b{font-family:var(--mono);color:var(--ink)}
.a3d .rn-pickable{outline:2px dashed var(--violet);outline-offset:1px}
.a3d sub{font-size:.72em}
.a3d-bad{color:var(--rose)}
.a3-chip{display:inline-block;margin:3px;padding:6px 12px;border:2px solid var(--line);border-bottom-width:4px;border-radius:12px;background:var(--panel);font:800 14px var(--mono);cursor:pointer}
.a3-chip.ok{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,var(--panel))}
.a3-chip.no{border-color:var(--rose);background:color-mix(in srgb,var(--rose) 12%,var(--panel))}
.a3-chip.sel{border-color:var(--blue)}`;
    document.head.appendChild(s);
  })();
  /** Static HTML for one dictionary (used by lesson figures and the runner). */
  function dictHTML(D, { enter = -1, leave = -1, ratios = null, done = false, fresh = -1, sol = true } = {}) {
    const zl = `<div class="a3d-line a3d-z ${done ? "ok" : ""}"><b class="a3d-lhs">z</b> = ${qt(D.v)}${D.N.map((j) => {
      const q = D.c[j];
      return q.n
        ? `<span class="a3d-t ${enter === j ? "on" : ""} ${q.n > 0 ? "pos" : ""}" data-k="${vp(j)}">${q.n < 0 ? "−" : "+"} ${mag(q, j)}</span>`
        : "";
    }).join("")}</div>`;
    const rl = D.rows
      .map(
        (r, i) =>
          `<div class="a3d-line a3d-eq ${leave === i ? "out" : ""} ${fresh === i ? "fresh" : ""}" data-k="${vp(D.B[i])}"><b class="a3d-lhs">${vn(D.B[i])}</b> = ${qt(r.b)}${D.N.map(
            (j) => {
              const q = r.a[j];
              return q && q.n ? `<span class="a3d-t">${q.n > 0 ? "−" : "+"} ${mag(q, j)}</span>` : "";
            },
          ).join(
            "",
          )}${ratios ? `<span class="a3d-r">${ratios[i] ? "ratio " + qt(ratios[i]) : "no limit"}</span>` : ""}</div>`,
      )
      .join("");
    const x = dSol(D);
    return `<div class="a3d">${zl}${rl}${sol ? `<div class="a3d-sol">basic solution <b>(${x.map(qt0).join(", ")})</b>, z = <b>${qt(D.v)}</b></div>` : ""}</div>`;
  }
  const CODE = [
    "write the LP in slack form: the slacks are basic",
    "enter: the nonbasic variable with the largest positive coefficient in z",
    "leave: the row that hits 0 first (smallest ratio)",
    "pivot: rewrite so the entering variable is basic",
    "stop when no coefficient in z is positive",
  ];
  /** Step-through dictionary simplex. spec: {c, A, b} */
  function dictRun(box, life, spec) {
    function* frames() {
      let D = dInit(spec.c, spec.A, spec.b);
      yield {
        D,
        line: 0,
        mood: "idle",
        cap: `Slack form. Set every variable on the right to 0 and read off the <b>basic solution</b> (${dSol(D).map(qt0).join(", ")}) with <b>z = ${qt(D.v)}</b>.`,
      };
      for (let round = 0; round < 12; round++) {
        const e = dEnter(D);
        if (e < 0) break;
        yield {
          D,
          enter: e,
          line: 1,
          mood: "think",
          cap: `Largest positive coefficient in z: <b>${vn(e)}</b> (+${qt(D.c[e])}), so <b>${vn(e)} enters</b>.`,
          ask: {
            q: "Which variable <b>enters</b>? Tap its term in the z line.",
            pick: ".a3d-z .a3d-t[data-k]",
            a: vp(e),
            why: `The largest positive coefficient is <b>${vn(e)}</b> at +${qt(D.c[e])}.`,
          },
        };
        const rat = dRatios(D, e),
          l = dLeave(D, rat);
        if (l < 0) {
          yield {
            D,
            enter: e,
            ratios: rat,
            unb: true,
            line: 2,
            mood: "surprised",
            cap: `No row has a positive coefficient for ${vn(e)}, so every equation lets ${vn(e)} grow without limit. <b>Nothing stops z rising: the LP is unbounded.</b>`,
          };
          return;
        }
        const rt = D.rows
          .map((r, i) =>
            rat[i] ? `${vn(D.B[i])}: ${qt(r.b)} ÷ ${qt(r.a[e])} = ${qt(rat[i])}` : `${vn(D.B[i])}: no limit`,
          )
          .join("; ");
        yield {
          D,
          enter: e,
          leave: l,
          ratios: rat,
          line: 2,
          cap: `Ratio test: ${rt}. The smallest is <b>${qt(rat[l])}</b>, so <b>${vn(D.B[l])} leaves</b>.`,
          ask: {
            q: `${vn(e)} enters. Which equation hits 0 first, so <b>leaves</b>? Tap its row.`,
            pick: ".a3d-eq[data-k]",
            a: vp(D.B[l]),
            why: `The smallest ratio is ${qt(rat[l])}, in the ${vn(D.B[l])} row. Going further would make ${vn(D.B[l])} negative.`,
          },
        };
        const lv = D.B[l];
        D = dPivot(D, l, e);
        yield {
          D,
          fresh: l,
          line: 3,
          mood: "happy",
          cap: `Pivot: solve the ${vn(lv)} row for ${vn(e)} and substitute everywhere. New basic solution (${dSol(D).map(qt0).join(", ")}), <b>z = ${qt(D.v)}</b>.`,
        };
      }
      const x = dSol(D);
      yield {
        D,
        done: true,
        line: 4,
        mood: "love",
        cap: `Every coefficient in z is now ≤ 0, so no variable can raise z. <b>Optimal: z = ${qt(D.v)}</b> at (${x.slice(0, D.n).map(qt0).join(", ")}).`,
      };
    }
    F.run(box, life, {
      code: CODE,
      build(stage) {
        const root = document.createElement("div");
        stage.appendChild(root);
        return { root };
      },
      draw(s, f) {
        s.root.innerHTML = dictHTML(f.D, {
          enter: f.enter ?? -1,
          leave: f.leave ?? -1,
          ratios: f.ratios,
          done: f.done,
          fresh: f.fresh ?? -1,
        });
      },
      frames,
    });
  }
  const fig = (html, cap) => (box) => {
    box.innerHTML = `<div class="fig-wrap">${html}</div>${cap ? `<div class="fig-cap">${cap}</div>` : ""}`;
  };
  /* ============ 3.1 From a story to an LP ============
     Festival promoter: x_j = £k spent on channel j. Matrix rows = districts, entries = hundreds of residents reached per £1k.
     min x1+x2+x3+x4 s.t. M x >= NEED. Optimum (0,2,0,4), cost 6 (checked by vertex enumeration). */
  const CH = ["Radio", "Flyers", "Social", "Street team"],
    DI = ["North", "Centre", "South"];
  const GM = [
      [-1, 4, 0, 1],
      [2, -1, 1, 3],
      [1, 5, 4, 2],
    ],
    NEED = [12, 10, 6];
  const reach = (x, d) => GM[d].reduce((s, a, j) => s + a * x[j], 0);
  const rowTxt = (r) =>
    r
      .map((a, j) =>
        a === 0 ? "" : `${a < 0 ? "−" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}x<sub>${j + 1}</sub>`,
      )
      .filter(Boolean)
      .join(" ")
      .replace(/^\+ /, "");
  // prettier-ignore

  L["a3-formulate"] = {
    sum: "Turning a real decision into a linear program takes three choices: the <b>variables</b> (what you control), the <b>objective</b> (what you score) and the <b>constraints</b> (the rules). Then you can check any plan, and ask whether it is the best one.",
    steps: [
      { t: "Three questions to ask", b: `<p>A festival promoter can spend money on four channels, and wants to <b>spend as little as possible</b> while still reaching enough residents in three districts.</p><p>Every LP starts with the same three questions: <b>What can I choose?</b> (variables) <b>What do I score?</b> (objective) <b>What must hold?</b> (constraints).</p><p>Here the variables are the <b>£ thousands spent</b> on each channel: <code>x₁ … x₄</code>.</p>`,
        v: F.cells([{ v: "Radio", sub: "x₁", c: "violet" }, { v: "Flyers", sub: "x₂", c: "blue" }, { v: "Social", sub: "x₃", c: "amber" }, { v: "Street team", sub: "x₄", c: "teal" }], { size: 92 }) },
      { t: "The gain matrix", b: `<p>Market tests say what each <b>£1k</b> buys: hundreds of residents reached, per district. Some entries are <b>negative</b>: loud radio annoys one district, and flyers clutter another.</p><p>The row for each district gives that district's rule. The objective is plain cost, <code>x₁ + x₂ + x₃ + x₄</code>.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["per £1k", ...CH], DI.map((d, i) => [d, ...GM[i].map((a) => `<span class="mono" style="${a < 0 ? "color:var(--rose)" : ""}">${a < 0 ? "−" : ""}${Math.abs(a)}</span>`)]))}</div><div class="fig-cap">Hundreds of residents reached per £1k. Negative means that channel loses people there.</div>`; },
        c: { q: "The table shows −1 for Radio in the North row. What does it mean?", o: ["Each £1k on radio loses 100 residents in the North", "Radio is the cheapest channel for reaching the North", "The North needs one fewer radio advert than elsewhere"], a: 0, why: "Entries are people reached per £1k. A negative entry means spending on that channel pushes that district's total down." } },
      { t: "One row, one rule", b: `<p>Each district needs a <b>minimum</b> total. Multiply each spend by its entry and add:</p><p>North needs at least 12 (hundred), Centre 10, South 6. And you can't spend negative money, so every <code>xⱼ ≥ 0</code>.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["district", "rule"], DI.map((d, i) => [d, `<span class="mono">${rowTxt(GM[i])} ≥ ${NEED[i]}</span>`]).concat([["all channels", `<span class="mono">x<sub>1</sub>, x<sub>2</sub>, x<sub>3</sub>, x<sub>4</sub> ≥ 0</span>`]]))}</div>`; },
        c: { q: "Why does the model include x₁, …, x₄ ≥ 0?", o: ["A channel cannot be given a negative budget", "Each channel must be used at least once", "Positive numbers make the lines easier to draw"], a: 0, why: "Spending is an amount of money, so it can't be below zero. Without this rule a solver could 'earn' people by spending negative cash." } },
      { t: "Test a plan: feasible or not?", b: `<p>A <b>plan</b> is just four numbers. It is <b>feasible</b> when every rule holds at once. Try Radio £3k, Flyers £1k, Social £2k, Street team £2k (cost £8k):</p><p>North: −3 + 4 + 0 + 2 = <b>3</b>, but 12 is needed. That one broken rule makes the whole plan infeasible.</p>`,
        v: (box) => { const p = [3, 1, 2, 2]; box.innerHTML = `<div class="fig-wrap">${T(["district", "reached", "needed", "verdict"], DI.map((d, i) => { const v = reach(p, i); return [d, `<span class="mono">${v}</span>`, `<span class="mono">${NEED[i]}</span>`, v >= NEED[i] ? `<span style="color:var(--teal)">ok</span>` : `<span style="color:var(--rose)">short by ${NEED[i] - v}</span>`]; }))}</div><div class="fig-cap">Plan (3, 1, 2, 2): North is short, so the plan is infeasible.</div>`; },
        c: { q: "Plan (3, 1, 2, 2) reaches 3 / 13 / 20 in North / Centre / South, against 12 / 10 / 6 needed. What is wrong with it?", o: ["It breaks the North rule only", "It breaks the Centre rule only", "It breaks all three rules"], a: 0, why: "13 ≥ 10 and 20 ≥ 6 are fine. Only North (3 < 12) fails, and one failed rule is enough to make a plan infeasible." } },
      { t: "Feasible is not the same as best", b: `<p>Many plans pass every rule. They differ in <b>cost</b>. A plan that costs £9k and works is beaten by one that costs £6k and works.</p><p>So the question is never just <i>"does it work?"</i> but <i>"is any other working plan cheaper?"</i> Guessing can't answer that for sure, which is why we need a systematic method like simplex.</p>`,
        v: F.bars([["(3,1,2,2): fails North", 8, "rose", "infeasible"], ["(1,3,1,4): all rules hold", 9, "amber", "feasible"], ["(0,2,0,4): all rules hold", 6, "teal", "feasible, cheapest"]], { max: 9, fmt: (v) => "£" + v + "k" }) ,
        c: { q: "Plans B and C both satisfy every rule. B costs £9k and C costs £6k. What does that show?", o: ["C wins: both are feasible and C costs less", "B is better, because spending more must reach more people", "Neither can be judged until each is checked against the other"], a: 0, why: "Once a plan is feasible, the objective decides. Cheaper wins. (More spend does not always mean more reach: some entries are negative.)" } },
      { t: "The general shape", b: `<p>Every LP has the same ingredients. With <b>n</b> variables and <b>m</b> constraints, the <b>standard form</b> is:</p><p>$$\\text{maximise } \\sum_{j=1}^{n} c_j x_j \\quad \\text{subject to } \\sum_{j=1}^{n} a_{ij} x_j \\le b_i \\ (i = 1 \\ldots m), \\quad x_j \\ge 0$$</p><p><b>c<sub>j</sub></b> weights each variable in the objective, <b>a<sub>ij</sub></b> says how much constraint i uses variable j, and <b>b<sub>i</sub></b> is constraint i's limit. Our promoter's problem has the same shape but minimises and uses ≥: step 3.3 shows how to convert.</p>`,
        v: F.cells([{ v: "n = 4", sub: "variables xⱼ (channels)", c: "violet" }, { v: "m = 3", sub: "constraints (districts)", c: "blue" }, { v: "aᵢⱼ", sub: "the gain matrix", c: "amber" }, { v: "bᵢ", sub: "needs: 12, 10, 6", c: "teal" }], { size: 110 }),
        c: { q: "The promoter has 3 districts and 4 channels. How many constraints m and variables n (not counting xⱼ ≥ 0)?", o: ["m = 3, n = 4", "m = 4, n = 3", "m = 7, n = 4"], a: 0, why: "One constraint per district gives m = 3, and one variable per channel gives n = 4. The sign rules xⱼ ≥ 0 are not counted in m." } },
    ],
    guide: ["Move the four spend sliders and watch the three district totals against their minimums.", "Find a feasible plan by hand. Then press <b>Show the cheapest plan</b> and compare its cost.", "Answer the questions after the demo."],
  };
  N.register({
    id: "a3-formulate",
    subject: "algo",
    lecture: 3,
    order: 1,
    num: "3.1",
    title: "From a story to an LP",
    blurb: "Variables, objective, constraints: model a promotion budget, then test whether a plan is feasible.",
    render(root) {
      root.appendChild(header(this, ""));
      let x = [1, 1, 1, 1];
      const card = el(`<div class="card"><div class="controls" id="sl" style="flex-wrap:wrap"></div>
        <div class="controls"><button class="btn" id="best">Show the cheapest plan</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="grid side"><div id="tb" style="min-height:190px"></div><div><div class="stat-row"><div class="stat amber"><small>Cost</small><b id="cost"></b></div></div><div class="callout" id="msg" style="margin-top:10px;min-height:88px"></div></div></div></div>`);
      root.appendChild(card);
      const sls = CH.map((c, j) => {
        const s = N.slider(`${c} (x${"₁₂₃₄"[j]})`, 0, 8, 1, x[j], (v) => `£${v}k`);
        s.onInput((v) => {
          x[j] = v;
          draw();
        });
        qs("#sl", card).appendChild(s);
        return s;
      });
      function draw() {
        const vals = DI.map((_, i) => reach(x, i)),
          ok = vals.every((v, i) => v >= NEED[i]),
          cost = x.reduce((a, b) => a + b, 0);
        qs("#tb", card).innerHTML = T(
          ["district", "reached", "needed", "check"],
          DI.map((d, i) => [
            d,
            `<span class="mono">${vals[i]}</span>`,
            `<span class="mono">${NEED[i]}</span>`,
            vals[i] >= NEED[i]
              ? `<span style="color:var(--teal)">✓ ok</span>`
              : `<span style="color:var(--rose)">✗ short by ${NEED[i] - vals[i]}</span>`,
          ]),
        );
        qs("#cost", card).textContent = "£" + cost + "k";
        const m = qs("#msg", card);
        if (ok) {
          m.className = "callout teal";
          m.innerHTML =
            cost === 6
              ? `<b>Feasible, and £6k is the cheapest any feasible plan can be.</b>`
              : `<b>Feasible.</b> Every rule holds. Is there a cheaper feasible plan? ${cost > 6 ? "Yes: try the cheapest-plan button." : ""}`;
        } else {
          const bad = DI.filter((_, i) => vals[i] < NEED[i]);
          m.className = "callout rose";
          m.innerHTML = `<b>Infeasible.</b> ${bad.join(" and ")} ${bad.length > 1 ? "are" : "is"} short of the minimum.`;
        }
      }
      qs("#best", card).onclick = () => {
        x = [0, 2, 0, 4];
        sls.forEach((s, j) => (s.value = x[j]));
        draw();
      };
      qs("#rs", card).onclick = () => {
        x = [1, 1, 1, 1];
        sls.forEach((s, j) => (s.value = x[j]));
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-form-1",
          q: "Set Radio £3k, Flyers £1k, Social £2k, Street team £2k. Which districts fall short of their minimum?",
          opts: ["North only", "North and Centre", "South only", "None: the plan is feasible"],
          a: 0,
          why: "North gets −3 + 4 + 0 + 2 = 3 (needs 12). Centre gets 6 − 1 + 2 + 6 = 13 and South 3 + 5 + 8 + 4 = 20, both fine.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-form-2",
          q: "The cheapest plan is Flyers £2k and Street team £4k: North gets exactly 12, the minimum. You add £1k of Radio. What happens?",
          opts: [
            "Still feasible: more spending only helps",
            "Infeasible: North drops to 11",
            "Infeasible: Centre drops below its minimum",
          ],
          a: 1,
          why: "Radio's North entry is −1, so the North total falls from 12 to 11. More money does not always mean more reach when an entry is negative. (Centre and South both go up.)",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Ask three questions: what can I choose (<b>variables</b>), what do I score (<b>objective</b>), what must hold (<b>constraints</b>).",
            "A plan is <b>feasible</b> when every rule holds. Feasible plans are then compared by the objective.",
            "Negative entries are legal and matter: spending more can make a district's total smaller.",
          ],
          "Plug a plan into every rule to test it. Then ask whether a cheaper working plan exists.",
        ),
      );
    },
  });
  /* ============ 3.5 Slack form and the dictionary (the lecture's 3-variable example) ============ */
  const COR = {
    c: [3, 1, 2],
    A: [
      [1, 1, 3],
      [2, 2, 5],
      [4, 1, 2],
    ],
    b: [30, 24, 36],
  };
  const BAK = {
    c: [12, 11, 9],
    A: [
      [2, 1, 1],
      [1, 5, 2],
    ],
    b: [21, 57],
  };
  const D0 = dInit(COR.c, COR.A, COR.b),
    R0 = dRatios(D0, 0),
    D1 = dPivot(D0, dLeave(D0, R0), 0);
  const dictFig = (D, o, cap) => fig(dictHTML(D, o), cap);
  Object.assign(S, {
    BAK,
    COR,
    D0,
    D1,
    R0,
    T,
    dEnter,
    dInit,
    dLeave,
    dPivot,
    dRatios,
    dSol,
    dictFig,
    dictHTML,
    dictRun,
    fig,
    lpSolve,
    mod,
    nice,
    qt,
    qt0,
    qv,
    sgn,
    vn,
  });
})();
