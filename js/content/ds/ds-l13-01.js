/* Data Science (COM3021), Lecture 13: thread-level parallelism.
   This part: shared helpers (NIC.shared.ds13) and the lessons 13.1 (ds13-levels, process against thread parallelism)
   and 13.2 (ds13-flynn, SISD, SIMD and MIMD). Both are figure-only nodes (no demo).
   Running example: Crumb & Co, a small bakery whose computer must tally a year of till receipts before the shop opens. */
(function () {
  const S = (NIC.shared.ds13 = NIC.shared.ds13 || {});
  const N = NIC;
  const { el, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 13, ...m });

  /* ---------- helpers shared with the other Lecture 13 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        String(v),
        cb,
      ),
    );
  const stats = (list) =>
    `<div class="stat-row">${list.map(([c, l]) => `<div class="stat ${c}"><small>${l}</small><b>–</b></div>`).join("")}</div>`;
  const setStats = (b, vals) => b.querySelectorAll(".stat b").forEach((x, i) => (x.textContent = vals[i]));
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)", w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${s}px var(--sans);fill:${c}">${t}</text>`;
  const tint = (c, p = 16) => `color-mix(in srgb,var(--${c}) ${p}%,var(--panel))`;
  /** A sticker box with a name and an optional second line. */
  const box = (x, y, w, h, name, c, sub, on) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${tint(c, on ? 34 : 14)}" stroke="var(--${c})" stroke-width="${on ? 3 : 2}"/>${tx(x + w / 2, y + (sub === undefined ? h / 2 + 5 : h / 2 - 2), name, { s: 12.5 })}${sub === undefined ? "" : tx(x + w / 2, y + h / 2 + 13, sub, { s: 10.5, c: "var(--text-dim)", w: 700 })}`;
  const line = (d, c = "line-2", dash = "") =>
    `<path class="draw" d="${d}" fill="none" stroke="var(--${c})" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );
  const figBox = (b, n = 1) =>
    (b.innerHTML = `${'<div class="controls" style="justify-content:center"></div>'.repeat(n)}<div></div><div class="fig-cap"></div>`);
  /** A wavy thread line inside a process box. */
  const thread = (x, y, h, c = "blue") =>
    `<path class="draw" d="M${x} ${y}q8 ${h / 6} 0 ${h / 3}t0 ${h / 3}t0 ${h / 3}" fill="none" stroke="var(--${c})" stroke-width="3" stroke-linecap="round"/>`;

  /** Timeline lanes: rows [{n, s: [[t0, t1, kind, text]]}], kinds work | seq | idle | msg. */
  const KIND = { work: "blue", seq: "violet", idle: "line-2", msg: "amber" };
  function lanes(rows, { T, w = 540, label, marks = [] }) {
    const lx = 84,
      rh = 30,
      h = 24 + rows.length * rh + (marks.length ? 18 : 0),
      X = (t) => lx + (t / T) * (w - lx - 10);
    const body = rows
      .map((r, i) => {
        const y = 10 + i * rh;
        return (
          tx(lx - 8, y + rh / 2 + 4, r.n, { a: "end", s: 11.5 }) +
          r.s
            .map(([a, b, k, t]) => {
              if (b - a <= 0) return "";
              const idle = k === "idle",
                c = KIND[k];
              return `<rect class="fi" x="${X(a)}" y="${y + 4}" width="${X(b) - X(a)}" height="${rh - 8}" rx="5" fill="${idle ? "transparent" : tint(c, 38)}" stroke="var(--${idle ? "rose" : c})" stroke-width="${idle ? 1.5 : 2}" ${idle ? 'stroke-dasharray="4 3"' : ""}/>${t && X(b) - X(a) > t.length * 6 + 4 ? tx((X(a) + X(b)) / 2, y + rh / 2 + 4, t, { s: 10, c: idle ? "var(--rose-ink)" : "var(--text)" }) : ""}`;
            })
            .join("")
        );
      })
      .join("");
    const mk = marks
      .map(
        ([t, l]) =>
          `<line x1="${X(t)}" y1="8" x2="${X(t)}" y2="${12 + rows.length * rh}" stroke="var(--teal)" stroke-width="3"/>${tx(X(t), 26 + rows.length * rh, l, { s: 10.5, c: "var(--teal-ink)" })}`,
      )
      .join("");
    return svg(w, h, body + mk, label);
  }

  Object.assign(S, {
    reg,
    mc,
    pr,
    st,
    mm,
    seg,
    stats,
    setStats,
    svg,
    tx,
    tint,
    box,
    line,
    card,
    figBox,
    thread,
    lanes,
  });

  /* ---------- figures for 13.1 ---------- */
  const levelsFig = () =>
    svg(
      520,
      120,
      [
        ["Process", "whole programs", "violet"],
        ["Thread", "streams inside one", "blue"],
        ["Instruction", "steps of one stream", "amber"],
        ["Data", "one step, many values", "teal"],
      ]
        .map(([n, s, c], i) => box(8 + i * 128, 20, 120, 64, n, c, s, n === "Thread"))
        .join("") + tx(260, 110, "Parallelism can happen at each of these levels", { s: 11, c: "var(--text-dim)" }),
      "Four levels of parallelism: process, thread, instruction and data",
    );
  /** Process-level (each process its own processor and memory) or thread-level (threads share one memory). */
  function procFig(kind) {
    const cols = [30, 200, 370];
    let inner;
    if (kind === "proc")
      inner = cols
        .map(
          (x, i) =>
            box(x, 10, 120, 40, `Process ${i + 1}`, "violet") +
            line(`M${x + 60} 50V66`) +
            box(x, 66, 120, 36, "Processor", "blue") +
            line(`M${x + 60} 102V118`) +
            box(x, 118, 120, 36, "Memory", "amber", "its own copy"),
        )
        .join("");
    else
      inner =
        `<rect x="20" y="6" width="480" height="62" rx="12" fill="${tint("violet", 8)}" stroke="var(--violet)" stroke-width="2"/>${tx(40, 24, "One process", { a: "start", s: 11.5, c: "var(--violet-ink)" })}` +
        cols
          .map(
            (x, i) =>
              thread(x + 54, 26, 36) +
              tx(x + 76, 50, `Thread ${i + 1}`, { a: "start", s: 11 }) +
              line(`M${x + 60} 68V84`) +
              box(x, 84, 120, 34, "Processor", "blue") +
              line(`M${x + 60} 118L260 132`),
          )
          .join("") +
        box(150, 132, 220, 30, "One shared memory", "amber");
    return svg(
      520,
      kind === "proc" ? 160 : 168,
      inner,
      kind === "proc"
        ? "Process-level parallelism: three processes, each with its own processor and memory"
        : "Thread-level parallelism: one process with three threads on three processors, sharing one memory",
    );
  }
  S.procFig = procFig;

  /* ============ 13.1 Many hands at Crumb & Co ============ */
  reg({
    id: "ds13-levels",
    order: 1,
    num: "13.1",
    title: "Many hands at Crumb & Co",
    blurb: "Parallelism happens at several levels. Threads are the cheap way to use every core of one machine.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "Parallelism works at several levels: <b>process</b>, <b>thread</b>, <b>instruction</b> and <b>data</b>.",
            "<b>Process-level</b>: separate processes, each with its own memory. Spawning them is <b>expensive</b>.",
            "<b>Thread-level</b>: many threads inside one process share its memory and use a <b>multi-core</b> processor.",
          ],
          "One process, many threads, every core busy.",
        ),
      );
    },
  });

  L["ds13-levels"] = {
    sum: "Parallelism can happen at the process, thread, instruction or data level. Thread-level parallelism runs many threads inside one process on a multi-core processor, sharing its memory, which is cheaper than spawning separate processes.",
    steps: [
      st(
        "A mountain of receipts",
        `<p>Meet Crumb &amp; Co, a little bakery with a big problem: every night its computer must tally a whole year of till receipts before the doors open at seven.</p><p>One worker going through them one by one is too slow. The fix is <b>parallelism</b>: doing several pieces of work at the same time. Earlier lectures spread work over whole machines (the <b>node</b> level). Parallelism also works at smaller levels: <b>process</b>, <b>thread</b>, <b>instruction</b> and <b>data</b>.</p>`,
        levelsFig(),
        mc(
          "Crumb's tally must finish sooner, and buying more computers is off the table. Which idea does this lecture lean on?",
          [
            "Run parallel work inside the one machine",
            "Make each receipt smaller before tallying",
            "Tally only the receipts from last month",
          ],
          "Parallelism is not only about many machines: it also works at the process, thread, instruction and data levels inside one computer.",
        ),
      ),
      st(
        "Separate kitchens are costly",
        `<p>Picture Crumb hiring three bakers and building each one a separate kitchen, with its own oven and its own cupboard of ingredients. It works, but it is a lot of fuss for every new pair of hands.</p><p>That is <b>process-level parallelism</b>: each <b>process</b> is a running program with its own processor time and its <b>own memory</b>. Spawning a new process for every piece of work is <b>expensive</b>.</p>`,
        procFig("proc"),
      ),
      st(
        "One kitchen, many cooks",
        `<p>Now picture one kitchen with three cooks at one big worktop. Nobody builds anything new, and everyone can reach the same flour.</p><p>That is <b>thread-level parallelism</b>: one process starts several <b>threads</b>, each runs on its own processor core, and they all share the process's <b>memory</b>. It is the programming model built for <b>multi-core processors</b>, the chips with several cores in nearly every laptop today.</p>`,
        procFig("thread"),
        mc(
          "Why is starting threads cheaper than starting separate processes?",
          [
            "Threads share the memory their process already has",
            "Threads always run on a faster processor core",
            "Threads never have to wait for each other",
          ],
          "A new process needs its own memory set up. A thread lives inside an existing process and shares its memory, so there is much less to create.",
        ),
      ),
    ],
  };

  /* ---------- figures for 13.2 ---------- */
  function flynnFig(kind) {
    const n = kind === "sisd" ? 1 : 4,
      xs = Array.from({ length: n }, (_, i) => (n === 1 ? 200 : 20 + i * 126));
    const ins =
      kind === "mimd"
        ? xs.map((x, i) => box(x, 8, 116, 34, `Instructions ${i + 1}`, "violet")).join("")
        : box(n === 1 ? 200 : 170, 8, 180, 34, "One instruction stream", "violet");
    const wires = xs.map((x) => line(kind === "mimd" ? `M${x + 58} 42V60` : `M260 42L${x + 58} 60`, "violet")).join("");
    const procs = xs.map((x, i) => box(x, 60, 116, 34, n === 1 ? "Processor" : `Processor ${i + 1}`, "blue")).join("");
    const data = xs
      .map(
        (x, i) =>
          line(`M${x + 58} 94V110`) +
          box(x, 110, 116, 34, n === 1 ? "Data" : `Data ${i + 1}`, "amber", n === 1 ? "one stream" : "its own"),
      )
      .join("");
    const lbl = {
      sisd: "SISD: one instruction stream, one processor, one data stream",
      simd: "SIMD: one instruction stream drives four processors, each with its own data",
      mimd: "MIMD: four processors, each with its own instructions and its own data",
    }[kind];
    return svg(n === 1 ? 520 : 520, 150, ins + wires + procs + data, lbl);
  }

  /* ============ 13.2 Who gives the orders? ============ */
  reg({
    id: "ds13-flynn",
    order: 2,
    num: "13.2",
    title: "Who gives the orders?",
    blurb: "SISD, SIMD and MIMD: three ways to wire instruction streams to data streams.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>SISD</b>: single instruction stream, single data stream, the plain one-processor computer.",
            "<b>SIMD</b>: the <b>same instruction</b> runs on many processors, each with its <b>own data</b>.",
            "<b>MIMD</b>: each processor fetches <b>its own instructions</b> and works on its own data.",
          ],
          "Count the instruction streams, then count the data streams.",
        ),
      );
    },
  });

  L["ds13-flynn"] = {
    sum: "Parallel architectures are sorted by how many instruction streams and data streams they have: SISD (a uniprocessor), SIMD (one instruction, many data) and MIMD (many instructions, many data).",
    steps: [
      st(
        "One baker, one bowl",
        `<p>Before Crumb went parallel, one baker followed one recipe on one bowl of dough at a time.</p><p>A computer like that is called <b>SISD</b>: <b>single instruction stream, single data stream</b>. One processor (a <b>uniprocessor</b>) fetches one instruction after another, and each works on one piece of data. The names that follow just count the two kinds of stream: instructions (what to do) and data (what to do it to).</p>`,
        flynnFig("sisd"),
      ),
      st(
        "One shout, many bowls",
        `<p>Picture a head baker calling "fold the dough!" and four assistants each folding the dough in their own bowl, all at once.</p><p>That is <b>SIMD</b>: <b>single instruction stream, multiple data streams</b>. The <b>same instruction</b> is executed by several processors, each on a <b>different data stream</b> from its own data memory. It suits jobs where every piece of data gets the same treatment.</p>`,
        flynnFig("simd"),
        mc(
          "Four processors all add 20% VAT to their own slice of Crumb's prices, in lockstep, from one stream of instructions. Which architecture is that?",
          ["SIMD", "SISD", "MIMD"],
          "One instruction stream (add the VAT) drives several processors, each on its own data: single instruction, multiple data.",
        ),
      ),
      st(
        "Every baker their own recipe",
        `<p>Now each assistant has a different recipe card: one ices cupcakes, one kneads bread, one checks the stock list.</p><p>That is <b>MIMD</b>: <b>multiple instruction streams, multiple data streams</b>. Each processor <b>fetches its own instructions</b> and works on <b>its own data</b>. The processors are often ordinary off-the-shelf chips, and the cores of a multi-core processor running separate threads work this way.</p>`,
        flynnFig("mimd"),
        mc(
          "One core sorts receipts while another core, at the same time, runs a different program that prints labels. Which architecture fits?",
          ["MIMD", "SIMD", "SISD"],
          "Each core follows its own instructions on its own data: multiple instruction streams and multiple data streams.",
        ),
      ),
    ],
  };
})();
