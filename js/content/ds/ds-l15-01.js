/* Data Science (COM3021), Lecture 15: high-performance computing.
   This part: shared helpers (NIC.shared.ds15) and the lessons 15.1 (ds15-hpc, what a supercomputer is, nodes,
   processors and cores) and 15.2 (ds15-flops, FLOPS, the device ladder and the network).
   Running example: the Gullhaven Sailing Club's weather team runs a storm model before the regatta. */
(function () {
  const S = (NIC.shared.ds15 = NIC.shared.ds15 || {});
  const N = NIC;
  const { el, takeaways, header, predict } = N;
  const L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 15, ...m });

  /* ---------- helpers shared with the other Lecture 15 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  const fm = (v, d = 1) => String(+(+v).toFixed(d));
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
  const setStats = (box, vals) => box.querySelectorAll(".stat b").forEach((b, i) => (b.textContent = vals[i]));
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)", w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${s}px var(--sans);fill:${c}">${t}</text>`;
  const tint = (c, p = 16) => `color-mix(in srgb,var(--${c}) ${p}%,var(--panel))`;
  /** A sticker box with a name and an optional second line. */
  const box = (x, y, w, h, name, c, sub, on) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${tint(c, on ? 34 : 14)}" stroke="var(--${c})" stroke-width="${on ? 3 : 2}"/>${tx(x + w / 2, y + (sub === undefined ? h / 2 + 5 : h / 2 - 2), name, { s: 13 })}${sub === undefined ? "" : tx(x + w / 2, y + h / 2 + 14, sub, { s: 11, c: "var(--text-dim)", w: 700 })}`;
  const line = (d, c = "line-2", dash = "", wd = 2) =>
    `<path d="${d}" fill="none" stroke="var(--${c})" stroke-width="${wd}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const figBox = (b, n = 1) =>
    (b.innerHTML = `${'<div class="controls" style="justify-content:center"></div>'.repeat(n)}<div></div><div class="fig-cap"></div>`);
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );
  /** A row of labelled chips (static figure). items: [[label, colour, sub?]] */
  const chips = (items, label, w = 520) => {
    const n = items.length,
      bw = (w - 10 * (n + 1)) / n;
    return svg(w, 78, items.map(([t, c, s], i) => box(10 + i * (bw + 10), 10, bw, 58, t, c, s)).join(""), label);
  };

  Object.assign(S, { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, tint, box, line, figBox, card, chips });

  /* ---------- 15.1 figures ---------- */
  /** Nested picture: a cluster of nodes, a node of processors, a processor of cores. */
  const nestFig = () =>
    svg(
      520,
      150,
      box(8, 8, 180, 134, "", "blue") +
        tx(98, 28, "Cluster: many nodes", { s: 12 }) +
        [0, 1, 2, 3, 4, 5]
          .map((i) => box(20 + (i % 3) * 54, 40 + Math.floor(i / 3) * 50, 46, 40, "node", "teal"))
          .join("") +
        line("M190 76H216", "line-2") +
        box(216, 30, 140, 92, "", "teal") +
        tx(286, 50, "Node: 2 processors", { s: 12 }) +
        box(228, 62, 56, 48, "CPU", "amber") +
        box(290, 62, 56, 48, "CPU", "amber") +
        line("M358 76H384", "line-2") +
        box(384, 30, 128, 92, "", "amber") +
        tx(448, 50, "Processor: cores", { s: 12 }) +
        [0, 1, 2, 3, 4, 5, 6, 7]
          .map(
            (i) =>
              `<rect x="${396 + (i % 4) * 28}" y="${62 + Math.floor(i / 4) * 26}" width="22" height="20" rx="4" fill="${tint("violet", 30)}" stroke="var(--violet)" stroke-width="1.5"/>`,
          )
          .join(""),
      "A cluster is made of nodes, each node holds processors, and each processor holds several cores",
    );

  /** Demo: build a cluster with three sliders and count its cores. */
  function clusterLab(b) {
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div>${stats([
      ["blue", "Nodes"],
      ["amber", "Processors"],
      ["violet", "Cores in total"],
    ])}<div class="fig-cap" data-c></div>`;
    const sn = N.slider("Nodes", 1, 16, 1, 4),
      sp = N.slider("Processors per node", 1, 4, 1, 2),
      sc = N.slider("Cores per processor", 2, 16, 2, 8);
    b.querySelector("[data-s]").append(sn, sp, sc);
    const draw = () => {
      const n = sn.value,
        p = sp.value,
        c = sc.value,
        cols = 8,
        cell = 62;
      const nodes = Array.from({ length: n }, (_, i) => {
        const x = 8 + (i % cols) * cell,
          y = 8 + Math.floor(i / cols) * 70,
          procs = Array.from({ length: p }, (_, k) => {
            const pw = (50 - (p - 1) * 3) / p;
            return `<rect x="${x + 4 + k * (pw + 3)}" y="${y + 22}" width="${pw}" height="${30}" rx="3" fill="${tint("amber", 20 + c * 3)}" stroke="var(--amber)" stroke-width="1.2"/>`;
          }).join("");
        return `<rect x="${x}" y="${y}" width="58" height="60" rx="8" fill="${tint("teal", 12)}" stroke="var(--teal)" stroke-width="2"/>${tx(x + 29, y + 15, `node ${i + 1}`, { s: 9.5, w: 700 })}${procs}`;
      }).join("");
      const rows = Math.ceil(n / cols);
      b.querySelector("[data-f]").innerHTML = svg(
        8 + cols * cell,
        16 + rows * 70,
        nodes,
        `${n} nodes, each with ${p} processors of ${c} cores`,
      );
      setStats(b, [n, n * p, n * p * c]);
      b.querySelector("[data-c]").innerHTML =
        `${n} nodes × ${p} processors × ${c} cores = <b>${n * p * c} cores</b> working at once. The darker the processor, the more cores inside.`;
    };
    [sn, sp, sc].forEach((s) => s.onInput(draw));
    draw();
  }
  S.clusterLab = clusterLab;

  /* ============ 15.1 A laptop that needs three days ============ */
  reg({
    id: "ds15-hpc",
    order: 1,
    num: "15.1",
    title: "A laptop that needs three days",
    blurb: "What makes a computer 'high-performance', and how nodes, processors and cores add up.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Build a cluster", "nodes × processors × cores");
      root.appendChild(c);
      clusterLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds15-hpc-1",
          "You doubled the <b>Nodes</b> slider and left the rest alone. What happened to <b>Cores in total</b>?",
          ["It doubled", "It stayed the same", "It went up by just two"],
          "Every node brings its own processors and their cores, so twice the nodes means twice the cores.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "High-performance systems are about <b>processing power</b>, <b>communication</b> and <b>I/O</b>.",
            "A supercomputer can be <b>distributed</b> (many linked computers) or <b>non-distributed</b> (one big machine).",
            "Processing power grows with the <b>number of nodes</b>, <b>processors per node</b>, <b>cores per processor</b> and their speed.",
          ],
          "Lots of small workers, wired together.",
        ),
      );
    },
  });

  L["ds15-hpc"] = {
    sum: "A <b>high-performance computing</b> (HPC) system combines processing power, communication and I/O. Its power grows with the number of nodes, processors per node and cores per processor.",
    steps: [
      st(
        "Three days is too long",
        `<p>Meet Priya, who runs the weather team at the Gullhaven Sailing Club. Before each regatta she runs a storm model. On her laptop it takes three days, and the race is on Saturday.</p><p>She needs a <b>high-performance computing</b> system (HPC for short). Three things make one fast: <b>processing power</b> (doing the sums), <b>communication</b> (moving data between parts) and <b>I/O</b> (reading and writing data to storage).</p>`,
        chips(
          [
            ["Processing", "blue", "doing the sums"],
            ["Communication", "teal", "moving data"],
            ["I/O", "amber", "reading, writing"],
          ],
          "Three ingredients of a high-performance system: processing power, communication and I/O",
        ),
        mc(
          "Priya's model spends most of its time loading huge weather files from disk. Which part of an HPC system is the problem?",
          ["I/O", "Communication", "Processing power"],
          "Reading and writing data to storage is I/O. Communication is about moving data between parts of the machine; processing power is about doing the sums.",
        ),
      ),
      st(
        "One giant or many friends",
        `<p>Think of moving house: you can hire one enormous lorry, or ask lots of friends with cars. The biggest of these machines are called <b>supercomputers</b>.</p><p>A supercomputer can be <b>non-distributed</b>, one huge machine whose parts share everything, or <b>distributed</b>, many separate computers linked by a network that work as a team. The university's cluster, Kestrel, which Priya is about to borrow, is the distributed kind.</p>`,
        N.fig.compare(
          { title: "Non-distributed", c: "blue", body: "One very large machine. All parts share memory." },
          { title: "Distributed", c: "teal", body: "Many computers (nodes) linked by a network, working together." },
          "Non-distributed supercomputer: one big machine; distributed: many linked computers",
        ),
      ),
      st(
        "Nodes, processors, cores",
        `<p>Picture a school: it has classrooms, each classroom has tables, each table has pupils. A cluster is built the same way.</p><p>It has many <b>nodes</b> (separate computers). Each node holds one or more <b>processors</b>, and each processor holds several <b>cores</b>, the little workers that actually run instructions. Processing power is mostly driven by how many of each there are, and how fast they run. Try it in the demo.</p>${mm("<p>Total cores of a cluster:</p>$$\\text{cores} = \\text{nodes} \\times \\text{processors per node} \\times \\text{cores per processor}$$<p>For example $4 \\times 2 \\times 8 = 64$ cores.</p>")}`,
        nestFig(),
        mc(
          "Which change does <b>not</b> add any cores to a cluster?",
          ["Faster disks on every node", "More nodes", "More cores per processor"],
          "Cores come from nodes × processors × cores per processor. Faster disks help I/O, not the number of cores.",
        ),
      ),
    ],
    guide: [
      "Move the <b>Nodes</b> slider and watch <b>Cores in total</b>.",
      "Now change <b>Processors per node</b> and <b>Cores per processor</b>: which grows the total fastest?",
      "Answer the question under the demo.",
    ],
  };

  /* ---------- 15.2 figures ---------- */
  const PREFIX = [
    ["GFLOPS", "giga", "a thousand million", "blue"],
    ["TFLOPS", "tera", "a thousand giga", "teal"],
    ["PFLOPS", "peta", "a thousand tera", "amber"],
    ["EFLOPS", "exa", "a thousand peta", "rose"],
  ];
  const ladderFig = () =>
    svg(
      520,
      190,
      PREFIX.map(([u, n, s, c], i) => {
        const y = 150 - i * 44,
          x = 20 + i * 40;
        return (
          box(x, y, 300, 36, `${n}FLOPS (${u})`, c, s) +
          (i ? tx(x + 330, y + 26, "× 1000", { a: "start", s: 12, c: "var(--text-dim)" }) : "")
        );
      }).join(""),
      "A ladder: gigaFLOPS, teraFLOPS, petaFLOPS, exaFLOPS; each rung is a thousand times the one below",
    );
  /** Device speeds on a log scale, old textbook figure and today's figure (both from the slides). */
  const DEV = [
    ["Smartphone", 0.2, 2.9, "1–2 G → 200–800 G"],
    ["Laptop / desktop", 1, 2.6, "10 G → 100–600 G"],
    ["Server CPU", 1.7, 3.2, "25–100 G → 1–2 T"],
    ["Consumer GPU", 2.3, 4.7, "up to 2 T → 20–90 T"],
    ["Data-centre GPU", null, 6, "H100: 1000+ T"],
  ];
  const devFig = () => {
    const X = (v) => 140 + v * 58;
    return svg(
      520,
      206,
      DEV.map(([n, a, b, note], i) => {
        const y = 14 + i * 34;
        return (
          tx(132, y + 16, n, { a: "end", s: 11.5 }) +
          (a === null
            ? ""
            : `<rect x="140" y="${y + 2}" width="${X(a) - 140}" height="9" rx="3" fill="${tint("line-2", 60)}"/>`) +
          `<rect x="140" y="${y + 12}" width="${X(b) - 140}" height="11" rx="3" fill="${tint("blue", 50)}" stroke="var(--blue)"/>` +
          tx(X(b) + 6, y + 22, note, { a: "start", s: 10, c: "var(--text-dim)", w: 700 })
        );
      }).join("") +
        `<rect x="140" y="188" width="14" height="8" fill="${tint("line-2", 60)}"/>` +
        tx(160, 196, "older figure", { a: "start", s: 10, c: "var(--text-dim)" }) +
        `<rect x="250" y="187" width="14" height="10" fill="${tint("blue", 50)}" stroke="var(--blue)"/>` +
        tx(270, 196, "today (log scale)", { a: "start", s: 10, c: "var(--text-dim)" }),
      "Device speeds in FLOPS on a log scale: phones, laptops, server CPUs, consumer GPUs and data-centre GPUs, older and current figures",
    );
  };
  const lanFig = () =>
    svg(
      520,
      130,
      [0, 1, 2, 3].map((i) => box(20 + i * 128, 14, 98, 44, `node ${i + 1}`, "teal", "fast cores")).join("") +
        line("M40 100H480", "amber", "", 5) +
        [0, 1, 2, 3].map((i) => line(`M${69 + i * 128} 58V100`, "amber")).join("") +
        tx(260, 122, "the network (a LAN) carries every message between nodes", { s: 11.5, c: "var(--amber-ink)" }),
      "Four fast nodes joined by a local-area network; every message between them travels on the network",
    );
  const sumsFig = () =>
    svg(
      520,
      96,
      ["3.14 × 2.72", "0.5 + 1.25", "9.81 ÷ 2.0"]
        .map((t, i) => box(14 + i * 170, 14, 150, 44, t, "violet", "one operation"))
        .join("") + tx(260, 86, "count how many of these happen in one second: that is FLOPS", { s: 11.5 }),
      "Floating-point operations such as 3.14 times 2.72; FLOPS counts how many happen per second",
    );

  /* ============ 15.2 Counting sums per second ============ */
  reg({
    id: "ds15-flops",
    order: 2,
    num: "15.2",
    title: "Counting sums per second",
    blurb: "FLOPS, the giga-tera-peta-exa ladder, where phones and GPUs sit, and why the network matters.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "Processing power is measured in <b>FLOPS</b>: floating-point operations per second.",
            "<b>Giga</b> (10⁹), <b>tera</b> (10¹²), <b>peta</b> (10¹⁵), <b>exa</b> (10¹⁸): each rung is a thousand times the last.",
            "In a distributed system the <b>network</b> (e.g. a LAN) matters as much as fast processors.",
          ],
          "Speed is counted in sums per second.",
        ),
      );
    },
  });

  L["ds15-flops"] = {
    sum: "Processing power is measured in <b>FLOPS</b> (floating-point operations per second), on a ladder of giga, tera, peta and exa. Network performance matters too.",
    steps: [
      st(
        "How fast is fast?",
        `<p>To compare two runners you time them over the same distance. To compare computers we count sums.</p><p>Numbers with a decimal point, like 3.14, are called <b>floating-point</b> numbers. One sum, product or division on them is a <b>floating-point operation</b>. <b>FLOPS</b> counts how many of those a machine can do per second. Priya's storm model is nearly all such sums, so FLOPS tells her roughly how fast it can run.</p>`,
        sumsFig(),
        mc(
          "What does FLOPS measure?",
          [
            "Floating-point operations done per second",
            "Files loaded from storage per second",
            "Messages sent across the network per second",
          ],
          "FLOPS counts floating-point operations (sums, products and so on with decimal numbers) per second: processing power, not I/O or network speed.",
        ),
      ),
      st(
        "Giga, tera, peta, exa",
        `<p>Think of money: pennies, pounds, thousands, millions. Big speeds need big units too.</p><p>A <b>gigaFLOPS</b> (GFLOPS) is a thousand million operations per second. Each rung up the ladder is a <b>thousand times</b> bigger: <b>teraFLOPS</b> (TFLOPS), then <b>petaFLOPS</b> (PFLOPS), then <b>exaFLOPS</b> (EFLOPS). The fastest supercomputers today work in the exa range.</p>${mm("<p>$$1\\,\\text{GFLOPS} = 10^{9} \\quad 1\\,\\text{TFLOPS} = 10^{12} \\quad 1\\,\\text{PFLOPS} = 10^{15} \\quad 1\\,\\text{EFLOPS} = 10^{18}$$ operations per second. Each step multiplies by $10^3 = 1000$.</p>")}`,
        ladderFig(),
      ),
      st(
        "From phones to data-centre GPUs",
        `<p>Where does your phone sit on that ladder? The slides give older textbook figures and today's.</p><p>Phones and laptops now reach hundreds of GFLOPS. A server processor reaches 1 to 2 TFLOPS. <b>GPUs</b>, chips built to do many sums side by side, go much further: a gaming GPU tens of TFLOPS, and a data-centre GPU such as the H100 over a thousand TFLOPS. That is why big models run on GPUs.</p>`,
        devFig(),
        mc(
          "Priya can borrow one device for an afternoon. Which one does the most floating-point sums per second?",
          ["A data-centre GPU", "A high-end server CPU", "A new laptop"],
          "On the slides a data-centre GPU (such as the H100) reaches over 1000 TFLOPS, far above a server CPU (1 to 2 TFLOPS) or a laptop (hundreds of GFLOPS).",
        ),
      ),
      st(
        "Don't forget the roads",
        `<p>A fleet of fast lorries is no use if they are stuck on a narrow lane. In a <b>distributed</b> system the nodes must keep swapping data, so <b>network performance</b> is an important piece.</p><p>Inside one building the nodes are joined by a <b>LAN</b> (local-area network). If it is slow, fast cores sit waiting for data. Priya's storm model has each node swap the weather at its border with its neighbours every step, so the network matters to her too.</p>`,
        lanFig(),
        mc(
          "Kestrel's nodes get faster processors, but its network stays the same. What might Priya see?",
          [
            "Nodes waiting on data more of the time",
            "Every run getting exactly as much faster",
            "Her files taking less space on disk",
          ],
          "Faster cores finish their sums sooner and then wait for data from the network, so a slow network holds back a distributed system.",
        ),
      ),
    ],
  };
})();
