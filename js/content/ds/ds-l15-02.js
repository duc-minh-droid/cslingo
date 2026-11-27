/* Data Science (COM3021), Lecture 15: high-performance computing.
   This part: the lessons 15.3 (ds15-moore, Moore's law and its limits) and 15.4 (ds15-amdahl, Amdahl's law, with the
   speedup demo). Helpers come from ds-l15-01.js through NIC.shared.ds15. */
(function () {
  const S = NIC.shared.ds15;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, tint, line, figBox, card } = S;

  /* ---------- 15.3 figures ---------- */
  /** Doubling squares: every two years the chip holds twice as many transistors. */
  const doubleFig = () =>
    svg(
      520,
      128,
      [1, 2, 4, 8, 16]
        .map((n, i) => {
          const x = 14 + i * 102,
            cols = n <= 2 ? n : n <= 8 ? 4 : 8,
            sz = n <= 2 ? 20 : n <= 8 ? 16 : 9;
          const dots = Array.from(
            { length: n },
            (_, k) =>
              `<rect x="${x + 8 + (k % cols) * (sz + 2)}" y="${22 + Math.floor(k / cols) * (sz + 2)}" width="${sz}" height="${sz}" rx="2" fill="${tint("violet", 40)}" stroke="var(--violet)" stroke-width="1"/>`,
          ).join("");
          return `<rect x="${x}" y="12" width="92" height="66" rx="8" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/>${dots}${tx(x + 46, 98, `year ${i * 2}`, { s: 11 })}${tx(x + 46, 114, `${n}×`, { s: 11, c: "var(--text-dim)" })}`;
        })
        .join(""),
      "Every two years the chip holds twice as many transistors: 1, 2, 4, 8, 16 times",
    );
  /** The ideal doubling curve against reality, which falls behind. */
  const lagFig = () => {
    const X = (t) => 50 + t * 44,
      Y = (v) => 150 - v * 13;
    const ideal = Array.from({ length: 11 }, (_, t) => `${t ? "L" : "M"}${X(t)} ${Y(t)}`).join(""),
      real = Array.from({ length: 11 }, (_, t) => `${t ? "L" : "M"}${X(t)} ${Y(t < 6 ? t : 6 + (t - 6) * 0.45)}`).join(
        "",
      );
    return svg(
      520,
      176,
      line("M50 150H500", "line-2") +
        line("M50 150V10", "line-2") +
        line(ideal, "violet", "6 4", 2.5) +
        line(real, "rose", "", 3) +
        tx(X(10) - 4, Y(10) - 6, "Moore's law", { a: "end", s: 11.5, c: "var(--violet-ink)" }) +
        tx(X(10) - 4, Y(8.2) + 22, "real chips", { a: "end", s: 11.5, c: "var(--rose-ink)" }) +
        tx(275, 170, "years →", { s: 11, c: "var(--text-dim)" }) +
        tx(42, 16, "transistors (doublings)", { a: "start", s: 10.5, c: "var(--text-dim)" }),
      "The doubling line keeps climbing while real chips fall behind it in later years",
    );
  };
  const crewFig = () =>
    S.chips(
      [
        ["1 core", "rose", "can't get much faster"],
        ["→ many cores", "teal", "share the work"],
        ["→ many nodes", "blue", "a whole cluster"],
      ],
      "When one core cannot get much faster, we add more cores and more nodes",
    );

  /* ============ 15.3 Twice the transistors ============ */
  reg({
    id: "ds15-moore",
    order: 3,
    num: "15.3",
    title: "Twice the transistors",
    blurb: "Moore's law, why chips are falling behind it, and why that pushes us towards many workers.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Moore's law</b>: the number of transistors on a chip doubles about every <b>two years</b>.",
            "The industry is <b>hitting its limits</b> and lagging behind Moore's law.",
            "So extra speed now comes mostly from <b>more cores and more nodes</b> working together.",
          ],
          "When one worker stops getting faster, hire more.",
        ),
      );
    },
  });

  L["ds15-moore"] = {
    sum: "<b>Moore's law</b>: transistors on integrated circuits double about every two years. The industry is now hitting its limits and lagging behind it.",
    steps: [
      st(
        "The doubling habit",
        `<p>Imagine a garden whose number of flowers doubles every two summers. After twenty years you would be lost in it.</p><p>Chips grew like that. <b>Moore's law</b> is the observation that the number of <b>transistors</b> (the tiny switches a chip is built from) on an integrated circuit <b>doubles about every two years</b>. For decades that meant every new laptop was much faster than the last, for free.</p>${mm("<p>After $t$ years the count is roughly</p>$$n(t) = n_0 \\cdot 2^{t/2}$$<p>so ten years gives $2^5 = 32$ times as many transistors.</p>")}`,
        doubleFig(),
        mc(
          "Moore's law describes how often which number doubles?",
          [
            "Transistors on a chip, about every two years",
            "FLOPS of a supercomputer, every year",
            "Nodes in a cluster, every decade",
          ],
          "Moore's law is an observation about transistors on integrated circuits doubling roughly every two years.",
        ),
      ),
      st(
        "Running into walls",
        `<p>A garden can only fit so many flowers before there is no more soil. Chips are getting there too.</p><p>The slides put it plainly: the industry is <b>hitting its limits</b> and <b>lagging behind Moore's law</b>. <i>Beyond the slides:</i> transistors are now only a few dozen atoms across, and packing more in makes chips harder to cool. So Priya can't just wait two years for a laptop that runs her model in a day.</p>`,
        lagFig(),
      ),
      st(
        "So we add more workers",
        `<p>When one chef can't chop any faster, the kitchen hires more chefs. Computing did the same.</p><p>Instead of one ever-faster core, chips got <b>many cores</b>, and machines were joined into <b>clusters</b> of many nodes, exactly the kind of HPC system from 15.1. (Lecture 13, on thread-level parallelism, shows how one program uses many cores.) Priya books time on Kestrel. But will sixty-four cores make her model sixty-four times faster? Next node.</p>`,
        crewFig(),
        mc(
          "Single cores are barely getting faster any more. Where does most new speed come from?",
          [
            "Many cores and nodes sharing the work",
            "Waiting two years for the next doubling",
            "Shrinking every input file first",
          ],
          "With chips lagging behind Moore's law, extra speed mostly comes from parallelism: more cores and more nodes sharing the work.",
        ),
      ),
    ],
  };

  /* ---------- 15.4 figures and demo ---------- */
  const amdahl = (p, s) => 1 / (1 - p + p / s);
  /** Two time bars: the serial part stays, the parallel part shrinks by s. */
  function timeBars(p, s, w = 520) {
    const W = w - 150,
      ser = (1 - p) * W,
      par = p * W;
    const row = (y, name, a, b2, note) =>
      tx(110, y + 18, name, { a: "end", s: 12 }) +
      `<rect x="120" y="${y}" width="${Math.max(a, 0.5)}" height="26" rx="4" fill="${tint("rose", 40)}" stroke="var(--rose)" stroke-width="2"/>` +
      `<rect x="${120 + a}" y="${y}" width="${Math.max(b2, 0.5)}" height="26" rx="4" fill="${tint("blue", 40)}" stroke="var(--blue)" stroke-width="2"/>` +
      tx(126 + a + b2, y + 18, note, { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(
      w,
      118,
      row(10, "1 processor", ser, par, "") +
        row(48, `${s} processors`, ser, par / s, "") +
        `<rect x="120" y="92" width="12" height="10" fill="${tint("rose", 40)}" stroke="var(--rose)"/>` +
        tx(138, 101, "must run in order", { a: "start", s: 10.5, c: "var(--text-dim)" }) +
        `<rect x="270" y="92" width="12" height="10" fill="${tint("blue", 40)}" stroke="var(--blue)"/>` +
        tx(288, 101, "can be shared out", { a: "start", s: 10.5, c: "var(--text-dim)" }),
      `Run time on 1 processor and on ${s} processors: the part that must run in order does not shrink`,
    );
  }
  /** The slide's example: 10 scalar sums in order, then a 10 by 10 matrix sum shared by ten processors. */
  const slideFig = () => timeBars(100 / 110, 10);

  /** Demo: parallel share and processors on sliders; time bars, speedup and the ceiling. */
  function amdahlLab(b) {
    figBox(b, 1);
    let p = 0.9;
    const sl = N.slider("Processors", 1, 64, 1, 8);
    b.firstChild.append(sl);
    const ctl = document.createElement("div");
    ctl.className = "controls";
    ctl.style.justifyContent = "center";
    b.insertBefore(ctl, b.children[1]);
    b.children[2].insertAdjacentHTML(
      "afterend",
      stats([
        ["blue", "Speedup"],
        ["amber", "Best possible"],
      ]),
    );
    const draw = () => {
      const s = sl.value,
        sp = amdahl(p, s);
      b.children[2].innerHTML = timeBars(p, s);
      setStats(b, [`${fm(sp)}×`, `${fm(1 / (1 - p))}×`]);
      b.lastChild.innerHTML = `With ${Math.round(p * 100)}% of the work shareable, ${s} processor${s > 1 ? "s" : ""} give a speedup of <b>${fm(sp)}×</b>. However many you add, the red part stays, so it can never beat <b>${fm(1 / (1 - p))}×</b>.`;
    };
    seg(ctl, "0.5:50% shareable|0.9:90% shareable|0.99:99% shareable", "0.9", (v) => ((p = +v), draw()));
    sl.onInput(draw);
    draw();
  }
  S.amdahl = amdahl;
  S.timeBars = timeBars;

  /* ============ 15.4 The part that won't share ============ */
  reg({
    id: "ds15-amdahl",
    order: 4,
    num: "15.4",
    title: "The part that won't share",
    blurb: "Amdahl's law: more processors help, but the part that must run in order sets a ceiling.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Speedup lab", "Amdahl's law");
      root.appendChild(c);
      amdahlLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds15-amdahl-1",
          "With <b>50% shareable</b>, you pushed <b>Processors</b> all the way up. What did the speedup do?",
          ["Levelled off below 2×", "Kept growing with every processor", "Dropped below 1×"],
          "Half the work must still run in order, so even infinitely many processors only halve the time: the speedup creeps towards 2× and stops.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Amdahl's law</b> predicts the theoretical speedup from using multiple processors.",
            "The speedup is <b>bounded by the sequential part</b>, the bit that cannot be parallelised.",
            "<b>S<sub>latency</sub></b>: whole-task speedup. <b>s</b>: speedup of the improved part. <b>p</b>: that part's share of the original time.",
          ],
          "The slowest queue is the one you can't split.",
        ),
      );
    },
  });

  L["ds15-amdahl"] = {
    sum: "<b>Amdahl's law</b> predicts the theoretical speedup from multiple processors. It is bounded by the sequential part of the computation that cannot be parallelised.",
    steps: [
      st(
        "One oven for the cake",
        `<p>Ten friends help cook a party dinner. The chopping goes ten times faster, but there is one oven, and the cake still needs its full hour in it.</p><p><b>Amdahl's law</b> predicts the <b>theoretical speedup</b> when a task runs on multiple processors. Its key message: the speedup is <b>bounded by the sequential part</b>, the bit of the work that cannot be parallelised. That part takes just as long however many helpers you have.</p>`,
        timeBars(0.75, 4),
        mc(
          "In Amdahl's law, what limits how much faster a task can get?",
          [
            "The part of the work that must run in order",
            "The number of processors you can afford",
            "The size of the output file",
          ],
          "However many processors you add, the sequential part still takes its full time, so it puts a ceiling on the speedup.",
        ),
      ),
      st(
        "Three letters: S, s and p",
        `<p>To use the law you need three numbers, and each has a plain meaning.</p><p><b>S<sub>latency</sub></b> is the speedup of the <b>whole task</b>, the answer you want. <b>s</b> is the speedup of just the part that benefits from the extra processors. <b>p</b> is the share of the original run time that this part took up. A big p means most of the work can be shared.</p>${mm("<p>Amdahl's law:</p>$$S_{\\text{latency}} = \\frac{1}{(1 - p) + \\dfrac{p}{s}}$$<p>As $s \\to \\infty$ the speedup approaches $\\dfrac{1}{1 - p}$: with $p = 0.9$ that ceiling is $10\\times$.</p>")}`,
        timeBars(0.6, 3),
        mc(
          "In Amdahl's law, what does <b>p</b> stand for?",
          [
            "That part's share of the original run time",
            "The number of processors in the machine",
            "The speedup of the whole task, start to end",
          ],
          "p is the proportion of the original execution time taken by the part that benefits from the extra resources. The whole-task speedup is S<sub>latency</sub>.",
        ),
      ),
      st(
        "The slide's sums",
        `<p>The slides try it on a small job: 10 single sums that must happen one after another, then adding two 10 × 10 grids of numbers, which is 100 sums that can be shared out.</p><p>On one processor that is 110 sums in a row. On ten processors the 10 single sums still go one by one, but the 100 are split ten ways, so the job takes the time of only 20 sums. Ten processors, yet the speedup is about 5.5, not 10.</p>${mm("<p>$$T_1 = (10 + 100)\\,t_{\\text{add}} = 110\\,t_{\\text{add}} \\qquad T_{10} = 10\\,t_{\\text{add}} + \\frac{100}{10}\\,t_{\\text{add}} = 20\\,t_{\\text{add}}$$</p><p>With $s = 10$ and $p = 100/110$: $S_{\\text{latency}} = \\dfrac{1}{\\frac{10}{110} + \\frac{100/110}{10}} = \\dfrac{110}{20} = 5.5$.</p>")}`,
        slideFig(),
      ),
      st(
        "Priya's ceiling",
        `<p>Priya's storm model spends a little time reading the weather map and writing the forecast, which only one processor can do, and most of its time on sums that can be shared.</p><p>Play with the lab: the more of the work that is shareable, the higher the ceiling. With 99% shareable, many processors help a lot; with 50%, they barely do. Before buying processors, shrink the part that won't share.</p>`,
        (b) => amdahlLab(b),
      ),
    ],
    guide: [
      "Keep <b>90% shareable</b> and drag <b>Processors</b> from 1 to 64. Watch <b>Speedup</b> approach <b>Best possible</b>.",
      "Switch to <b>50% shareable</b> and try again. Then <b>99%</b>.",
      "Answer the question under the demo.",
    ],
  };
})();
