/* l6-01: Lecture 6 (GP): shared tree kernel, 6.1 programs as trees. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});

  // ---------- tiny builders ----------
  const ga = (arr, cls = "") =>
    `<span class="genome">${arr.map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls}">${c}</span>`).join("")}</span>`;
  const row = (lbl, html, extra = "") =>
    `<div class="genome-row"><span class="lbl">${lbl}</span>${html}${extra ? `<span class="mono dim">${extra}</span>` : ""}</div>`;
  const table = (head, rows) =>
    `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- GP kernel: trees, evaluation, generation, variation ----------
  // node = { op, kids:[...] } for a function, { v } for a terminal (v: "X" | "Y" | "TIME" | number)
  const FN = {
    "+": { n: 2, f: (a, b) => a + b },
    "-": { n: 2, f: (a, b) => a - b },
    "*": { n: 2, f: (a, b) => a * b },
    "%": { n: 2, f: (a, b) => (Math.abs(b) < 1e-6 ? 1 : a / b) }, // protected division
    IF: { n: 4, f: (a, b, c, d) => (a > b ? c : d) }, // IF a > b THEN c ELSE d
    ">": { n: 2, f: (a, b) => (a > b ? 1 : 0) },
  };
  const fn = (op, ...kids) => ({ op, kids });
  const tm = (v) => ({ v });
  const isFn = (n) => !!n.kids;
  const label = (n) =>
    isFn(n) ? n.op : typeof n.v === "number" ? (Number.isInteger(n.v) ? String(n.v) : n.v.toFixed(1)) : n.v;
  const sx = (n) => (isFn(n) ? `(${n.op} ${n.kids.map(sx).join(" ")})` : label(n));
  const clone = (n) => (isFn(n) ? { op: n.op, kids: n.kids.map(clone) } : { v: n.v });
  const size = (n) => (isFn(n) ? 1 + n.kids.reduce((a, k) => a + size(k), 0) : 1);
  const depth = (n) => (isFn(n) ? 1 + Math.max(...n.kids.map(depth)) : 1);
  const evalT = (n, env) => {
    if (!isFn(n)) return typeof n.v === "number" ? n.v : env[n.v];
    const r = FN[n.op].f(...n.kids.map((k) => evalT(k, env)));
    return Number.isFinite(r) ? Math.max(-1e6, Math.min(1e6, r)) : 1e6;
  };
  /** pre-order list of {node, parent, idx, depth (root = 1)} */
  const nodesOf = (root) => {
    const out = [];
    (function go(n, p, i, d) {
      out.push({ node: n, parent: p, idx: i, depth: d });
      if (isFn(n)) n.kids.forEach((k, j) => go(k, n, j, d + 1));
    })(root, null, 0, 1);
    return out;
  };

  /** Random subtree that fits in `budget` levels (budget 1 = a terminal). Function chosen with probability pf. */
  function gen(r, budget, FS, TS, pf = 0.5, forceFn = false) {
    if (budget <= 1 || (!forceFn && r() >= pf)) return tm(TS[Math.floor(r() * TS.length)]());
    const op = FS[Math.floor(r() * FS.length)];
    return fn(op, ...Array.from({ length: FN[op].n }, () => gen(r, budget - 1, FS, TS, pf)));
  }
  /** The lecture's rule: root is a function; a function at depth Max-1 gets terminal children. */
  const randomProgram = (r, maxD, FS, TS) => gen(r, maxD, FS, TS, 0.5, true);

  function mutate(r, t, maxD, FS, TS, at = null) {
    const c = clone(t),
      ns = nodesOf(c),
      pick = at != null && ns[at] ? ns[at] : ns[Math.floor(r() * ns.length)];
    const sub = gen(r, maxD - pick.depth + 1, FS, TS);
    if (!pick.parent) return { tree: sub, at: pick.parent ? null : 0 };
    pick.parent.kids[pick.idx] = sub;
    return { tree: c, at: ns.indexOf(pick) };
  }
  function crossover(r, a, b, maxD, ia = null, ib = null) {
    for (let tries = 0; tries < 30; tries++) {
      const ca = clone(a),
        cb = clone(b),
        na = nodesOf(ca),
        nb = nodesOf(cb);
      const pa = ia != null && tries === 0 ? na[ia] : na[Math.floor(r() * na.length)],
        pb = ib != null && tries === 0 ? nb[ib] : nb[Math.floor(r() * nb.length)];
      const sa = pa.node,
        sb = pb.node;
      const put = (p, root, sub) => {
        if (!p.parent) return sub;
        p.parent.kids[p.idx] = sub;
        return root;
      };
      const k1 = put(pa, ca, sb),
        k2 = put(pb, cb, sa);
      if (depth(k1) <= maxD && depth(k2) <= maxD)
        return { kids: [k1, k2], ia: na.indexOf(pa), ib: nb.indexOf(pb), swapped: [sa, sb] };
    }
    return { kids: [clone(a), clone(b)], ia: 0, ib: 0, swapped: [a, b] };
  }

  // ---------- SVG tree drawing ----------
  function layout(root, pending) {
    let leaf = 0;
    const items = [];
    (function go(n, d) {
      const it = { n, d, id: items.length };
      items.push(it);
      if (isFn(n) && n.kids && !(pending && n.kids.length === 0)) {
        const ks = n.kids.map((k) => go(k, d + 1));
        it.x = (ks[0].x + ks[ks.length - 1].x) / 2;
        it.kids = ks;
      } else it.x = leaf++;
      return it;
    })(root, 0);
    return { items, leaves: Math.max(1, leaf), depth: Math.max(...items.map((i) => i.d)) + 1 };
  }
  /** opts: sel (set of ids), dim (set of ids), vals (array by id), showDepth, pend (set of nodes that are pending expansion), clickable */
  function treeSVG(root, opts = {}) {
    const lay = layout(root, true),
      DX = 46,
      DY = opts.vals ? 56 : 46,
      W = lay.leaves * DX + 14,
      H = lay.depth * DY + 8;
    const sel = opts.sel || new Set(),
      dim = opts.dim || new Set(),
      pend = opts.pend || new Set();
    const X = (it) => 7 + it.x * DX + DX / 2 - 7,
      Y = (it) => 8 + it.d * DY + (opts.vals ? 14 : 12);
    let edges = "",
      nodes = "";
    lay.items.forEach((it) => {
      (it.kids || []).forEach(
        (k) =>
          (edges += `<line x1="${X(it)}" y1="${Y(it)}" x2="${X(k)}" y2="${Y(k)}" stroke="var(--line-2)" stroke-width="2" opacity="${dim.has(k.id) ? 0.3 : 1}"/>`),
      );
    });
    lay.items.forEach((it) => {
      const fnN = isFn(it.n),
        c = sel.has(it.id) ? "var(--violet)" : fnN ? "var(--blue)" : "var(--teal)",
        lab = label(it.n),
        w = Math.max(30, 9 * String(lab).length + 14),
        h = opts.vals ? 38 : 24;
      nodes += `<g data-id="${it.id}" opacity="${dim.has(it.id) ? 0.35 : 1}" style="${opts.clickable ? "cursor:pointer" : ""}"><rect x="${X(it) - w / 2}" y="${Y(it) - 12}" width="${w}" height="${h}" rx="9" fill="color-mix(in srgb, ${c} 16%, var(--panel))" stroke="${c}" stroke-width="2" ${pend.has(it.n) ? 'stroke-dasharray="4 3"' : ""}/><text x="${X(it)}" y="${Y(it) + 4}" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--text)" font-family="var(--mono)">${lab}${pend.has(it.n) ? "" : ""}</text>${opts.vals ? `<text x="${X(it)}" y="${Y(it) + 22}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--text-faint)" font-family="var(--mono)">= ${fmtV(opts.vals[it.id])}</text>` : ""}${opts.showDepth ? `<text x="${X(it) + w / 2 + 2}" y="${Y(it) - 3}" font-size="9" fill="var(--text-faint)">d${it.d + 1}</text>` : ""}</g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${Math.max(W, 120)}px;display:block;margin:auto" data-tree>${edges}${nodes}</svg>`;
  }
  const fmtV = (v) => (v === undefined || v === null ? "" : Number.isInteger(v) ? String(v) : (+v).toFixed(2));

  // ---------- the lecture's first program ----------
  const PROG = () => fn("+", tm(1), tm(2), fn("IF", fn(">", tm("TIME"), tm(10)), tm(3), tm(4)));
  // IF here is the 3-argument form used on the slide: IF cond a b. Evaluate it with its own rule.
  function evalProg(n, env, out = [], act = new Set()) {
    const id = out.length;
    out.push(0);
    act.add(id);
    if (!isFn(n)) {
      out[id] = typeof n.v === "number" ? n.v : env[n.v];
      return { v: out[id], out, act };
    }
    if (n.op === "IF" && n.kids.length === 3) {
      const c = evalProg(n.kids[0], env, out, act);
      const chosen = c.v ? 1 : 2;
      let v;
      for (let k = 1; k <= 2; k++) {
        const r = evalProg(n.kids[k], env, out, k === chosen ? act : new Set());
        if (k === chosen) v = r.v;
      }
      out[id] = v;
      return { v, out, act };
    }
    const vs = n.kids.map((k) => evalProg(k, env, out, act).v);
    out[id] = n.op === "+" ? vs.reduce((a, b) => a + b, 0) : n.op === ">" ? (vs[0] > vs[1] ? 1 : 0) : FN[n.op].f(...vs);
    return { v: out[id], out, act };
  }
  const progAt = (t) => evalProg(PROG(), { TIME: t });

  /* ============ 6.1 Programs as trees ============ */
  N.register({
    id: "l6-idea",
    lecture: 6,
    order: 1,
    num: "6.1",
    title: "Evolving programs",
    blurb: "A program is a tree. Slide TIME and watch the answer flow up to the root.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "In <b>genetic programming</b> (GP) you do not write the program. You give the <b>required behaviour</b> (inputs and wanted outputs) and an EA <b>evolves</b> the program. The chromosome is a <b>tree</b>: functions are internal nodes and inputs or constants are the leaves. Koza popularised it in 1992.",
        ),
      );
      let t = 5;
      const card = el(
        `<div class="card"><div class="card-head"><h2>Run a tree</h2></div><div class="controls" id="c"></div><div class="grid two"><div id="tr"></div><div><pre class="mono" style="font-size:12.5px;margin:0">int foo (int time) {\n  int temp1, temp2;\n  if (time &gt; 10) temp1 = 3;\n  else temp1 = 4;\n  temp2 = temp1 + 1 + 2;\n  return (temp2);\n}</pre><p class="mono dim" style="margin-top:8px">(+ 1 2 (IF (&gt; TIME 10) 3 4))</p></div></div><canvas class="viz" id="bc"></canvas><div id="note"></div></div>`,
      );
      root.appendChild(card);
      const sT = N.slider("TIME", 0, 12, 1, t);
      sT.onInput((v) => {
        t = v;
        draw();
      });
      qs("#c", card).append(sT);
      function draw() {
        const r = progAt(t),
          ids = r.out.map((_, i) => i);
        const dim = new Set(ids.filter((i) => !r.act.has(i)));
        qs("#tr", card).innerHTML = treeSVG(PROG(), { vals: r.out, dim });
        const ys = Array.from({ length: 13 }, (_, x) => progAt(x).v);
        N.barChart(qs("#bc", card), {
          groups: [{ values: ys, color: (i) => (i === t ? N.colors().violet : N.colors().teal) }],
          labels: ys.map((_, i) => String(i)),
          height: 150,
          decimals: 0,
          yMax: 8,
          names: ["output"],
        });
        qs("#note", card).innerHTML =
          `<div class="callout blue">TIME = <b>${t}</b>: the test <span class="mono">(&gt; TIME 10)</span> is <b>${t > 10 ? "true" : "false"}</b>, so IF returns <b>${t > 10 ? 3 : 4}</b> and the root adds 1 + 2 + ${t > 10 ? 3 : 4} = <b>${r.v}</b>. The greyed branch is never used.</div>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "l6-idea-1",
          q: "Which statement best describes the difference between GP and a standard EA?",
          opts: [
            "The chromosome is a program, so fitness means running it",
            "GP does not use selection, mutation or crossover at all",
            "GP only works when the best program is already known",
          ],
          a: 0,
          why: "The loop is the same EA loop. What changes is the chromosome (a program tree) and the evaluation, which has to <b>run</b> the program on several inputs.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-idea-2",
          q: "Slide TIME to 10 and then to 11. How does the output change?",
          opts: ["It drops from 7 to 6", "It rises from 6 to 7", "It stays at 7"],
          a: 0,
          why: "At TIME = 10 the test (&gt; TIME 10) is false, so IF returns 4 and 1 + 2 + 4 = 7. At TIME = 11 the test is true, IF returns 3, and 1 + 2 + 3 = 6.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "GP is an EA whose individuals are programs, usually trees of functions (internal nodes) and terminals (leaves).",
            "Fitness means running the program on a range of inputs and summing the errors.",
            "A tree is read from the leaves up: each function applies to the values of its children.",
          ],
          "Don't write the program: describe the behaviour and let evolution search for it.",
        ),
      );
    },
  });

  L["l6-idea"] = {
    sum: "In GP the thing being evolved is a <b>program</b>. You say <i>what</i> it should do; the EA searches for <i>how</i>.",
    steps: [
      {
        t: "You supply the behaviour",
        b: `<p>In conventional programming <b>you</b> write the program, which turns inputs into outputs. In GP you give the <b>required behaviour</b> and the program is <b>evolved automatically</b>.</p>`,
        v: F.compare(
          { title: "Conventional programming", body: "Written by you.<br>input → <b>program</b> → output", c: "blue" },
          {
            title: "Genetic programming",
            body: "Automatically evolved.<br>input + required output → <b>GP</b> → program",
            c: "teal",
          },
        ),
        c: {
          q: "What do you provide to a GP system?",
          o: [
            "The required behaviour: inputs and wanted outputs",
            "The finished program, which GP then polishes slightly",
            "Nothing: GP invents the task and the data itself",
          ],
          a: 0,
          why: "GP searches for a program that produces the wanted outputs.",
        },
      },
      {
        t: "It is just an EA",
        b: `<p>1. Generate random "programs". 2. Evaluate them on training data. 3. Modify the population with crossover and mutation. 4. Stop if a good program has appeared, otherwise go to 2.</p>`,
        v: F.flow(["Random programs", "Run on training data", "Crossover & mutation", "Good program?"], { loop: true }),
        c: {
          q: "Which step is different from a standard EA?",
          o: [
            "Evaluating: the chromosome has to be run",
            "Selecting parents with a fitness-based rule",
            "Looping until a stopping rule is satisfied",
          ],
          a: 0,
          why: "Selection and the loop are the same. Fitness needs the program to be executed.",
        },
      },
      {
        t: "Fitness means running the program",
        b: `<p>A normal EA scores a design or a schedule directly. A GP individual is a program, so to evaluate it you <b>run it on N test conditions</b>, compute the error each time and <b>sum the errors</b>.</p>`,
        v: F.flow(["Run program on case k", "Compute error", "Repeat for N cases", "Sum errors = fitness"]),
        c: {
          q: "How is the fitness of a GP program computed?",
          o: [
            "By summing its errors over many test inputs",
            "By counting how many lines the program has",
            "From a single run on the first test input only",
          ],
          a: 0,
          why: "One input could be lucky. Many inputs measure the behaviour.",
        },
      },
      {
        t: "A program as a tree",
        b: `<p>This C function and the tree <span class="mono">(+ 1 2 (IF (&gt; TIME 10) 3 4))</span> do the same thing. It outputs <b>7</b> up to TIME 10 and <b>6</b> after.</p>`,
        v: (box) => {
          const r = progAt(5);
          box.innerHTML =
            treeSVG(PROG(), { vals: r.out, dim: new Set(r.out.map((_, i) => i).filter((i) => !r.act.has(i))) }) +
            `<p class="dim" style="text-align:center">evaluated at TIME = 5</p>`;
        },
        c: {
          q: 'What does <span class="mono">(+ 1 2 (IF (&gt; TIME 10) 3 4))</span> return when TIME = 11?',
          o: ["6", "7", "10"],
          a: 0,
          why: "TIME &gt; 10 is true, so IF gives 3, and 1 + 2 + 3 = 6.",
        },
      },
      {
        t: "What GP is used for",
        b: `<p>The far-future dream: evolve an operating system, rated by users. Today GP does "programming" tasks that <b>don't look like programming</b>: robot navigation code, curve fitting, antenna and circuit design, prediction. They need a program-shaped representation to be evolved well. Evolving real software is called <b>search-based software engineering</b>.</p>`,
        v: F.flow(["Robot navigation", "Curve fitting", "Antenna & circuit design", "Prediction"]),
        c: {
          q: "Which task is typical of current GP?",
          o: ["Fitting a curve to data", "Writing a word processor from scratch", "Compiling C code"],
          a: 0,
          why: "Curve fitting, circuit and antenna design are today's tasks; evolving a whole operating system is a long-term idea.",
        },
      },
    ],
    guide: [
      "Drag the <b>TIME</b> slider and watch the values on the tree.",
      "Notice that only one branch of the IF is used.",
      "Look at the bar chart of outputs for TIME 0 to 12.",
      "Answer the questions after the demo.",
    ],
  };
  Object.assign(sh, {
    ga,
    row,
    table,
    mulberry,
    FN,
    fn,
    tm,
    size,
    depth,
    evalT,
    nodesOf,
    randomProgram,
    mutate,
    crossover,
    treeSVG,
    sx,
    clone,
  });
})();
