/* l5-02: Lecture 5: 5.2 direct encodings, 5.5 the antenna genome. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.l5 = NIC.shared.l5 || {});
  const { ga, row, table, mulberry } = sh;

  /* ============ 5.2 Direct encodings: pipes and jobs ============ */
  const TIMES = [
    [4, 7, 3, 8, 5, 6],
    [6, 3, 5, 4, 7, 2],
    [5, 6, 4, 3, 4, 8],
    [7, 4, 6, 5, 3, 5],
  ]; // hours: worker (rows) x job (cols)
  const NW = 4,
    NJ = 6;
  const bestAssign = (() => {
    let best = 1e9;
    for (let c = 0; c < NW ** NJ; c++) {
      let t = 0,
        x = c;
      for (let j = 0; j < NJ; j++) {
        t += TIMES[x % NW][j];
        x = Math.floor(x / NW);
      }
      if (t < best) best = t;
    }
    return best;
  })();

  N.register({
    id: "l5-direct",
    lecture: 5,
    order: 2,
    num: "5.2",
    title: "Direct encodings: pipes and jobs",
    blurb: "Pick the encoding for a job-assignment problem and see what each one can and cannot express.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "In a <b>direct</b> encoding each gene is one of the problem's own variables: a pipe's diameter, an exam's slot, a job's worker. Constraints are handled <b>by penalising fitness</b>. Here the problem is <b>generalised assignment</b>: 4 workers, 6 jobs, every job done by exactly one worker, minimise the total time.",
        ),
      );
      let enc = 2,
        g = null;
      const card = el(
        `<div class="card"><div class="card-head"><h2>Assign jobs to workers</h2></div><div class="controls" id="c"></div><div id="tb"></div><div id="viz"></div><div id="out"></div><div id="stat"></div></div>`,
      );
      root.appendChild(card);
      qs("#tb", card).innerHTML =
        `<h4>Hours each worker needs for each job</h4>` +
        table(
          ["", ...Array.from({ length: NJ }, (_, j) => "J" + (j + 1))],
          TIMES.map((r, w) => [`<b>W${w + 1}</b>`, ...r]),
        );
      const rand = () =>
        enc === 1 ? Array.from({ length: NW }, () => randint(1, NJ)) : Array.from({ length: NJ }, () => randint(1, NW));
      const seg = N.seg(
        [
          ["1", "Encoding 1: one gene per worker (value = job)"],
          ["2", "Encoding 2: one gene per job (value = worker)"],
        ],
        "2",
        (v) => {
          enc = +v;
          g = rand();
          draw();
        },
      );
      const bRand = el(`<button class="btn primary">Random chromosome</button>`),
        bMut = el(`<button class="btn">Mutate one gene</button>`),
        bTest = el(`<button class="btn">Test 1,000 random chromosomes</button>`);
      bRand.onclick = () => {
        g = rand();
        draw();
      };
      bMut.onclick = () => {
        const i = randint(0, g.length - 1),
          k = enc === 1 ? NJ : NW;
        let v;
        do v = randint(1, k);
        while (v === g[i]);
        g[i] = v;
        draw(i);
      };
      bTest.onclick = () => {
        let cover = 0,
          tot = 0,
          n = 1000;
        for (let t = 0; t < n; t++) {
          const c = rand();
          if (enc === 1) {
            if (new Set(c).size === NJ) cover++;
          } else cover++;
          if (enc === 2) tot += c.reduce((a, w, j) => a + TIMES[w - 1][j], 0);
        }
        qs("#stat", card).innerHTML =
          enc === 1
            ? `<p>Chromosomes that cover all ${NJ} jobs: <b>${cover} of ${n}</b>. With only ${NW} genes it is impossible.</p>`
            : `<p>Chromosomes that cover all ${NJ} jobs: <b>${n} of ${n}</b>. Mean total time of a random one: <b>${(tot / n).toFixed(1)} h</b>. Best possible (brute force over ${NW ** NJ} assignments): <b>${bestAssign} h</b>.</p>`;
      };
      qs("#c", card).append(seg, bRand, bMut, bTest);
      g = rand();
      function draw(changed = -1) {
        const cls = (i) => (i === changed ? "changed" : "");
        qs("#viz", card).innerHTML = row(
          "chromosome",
          ga(
            g.map((v) => (enc === 1 ? "J" : "W") + v),
            cls,
          ),
          enc === 1 ? `gene i = the job worker i does` : `gene j = the worker who does job j`,
        );
        qs("#stat", card).innerHTML = "";
        if (enc === 1) {
          const cnt = Array(NJ + 1).fill(0);
          g.forEach((j) => cnt[j]++);
          const missing = [],
            twice = [];
          for (let j = 1; j <= NJ; j++) {
            if (!cnt[j]) missing.push("J" + j);
            if (cnt[j] > 1) twice.push("J" + j);
          }
          qs("#out", card).innerHTML =
            `<div class="callout rose"><b>Invalid.</b> Jobs with no worker: <b>${missing.join(", ")}</b>${twice.length ? `. Jobs given to two workers: <b>${twice.join(", ")}</b>` : ""}. Each worker does exactly one job, so ${NW} genes can never cover ${NJ} jobs.</div>`;
        } else {
          const load = Array(NW).fill(0);
          g.forEach((w, j) => (load[w - 1] += TIMES[w - 1][j]));
          const total = load.reduce((a, b) => a + b, 0),
            mx = Math.max(...load);
          qs("#out", card).innerHTML =
            `<div class="callout teal"><b>Valid.</b> Every job has exactly one worker. Total time <b>${total} h</b>.</div>` +
            table(
              ["worker", "jobs", "hours"],
              load.map((h, w) => [
                `W${w + 1}${h === mx && mx > (total / NW) * 1.5 ? " ⚠" : ""}`,
                g
                  .map((x, j) => (x === w + 1 ? "J" + (j + 1) : null))
                  .filter(Boolean)
                  .join(", ") || "none",
                h,
              ]),
            );
        }
      }
      draw();
      root.appendChild(
        predict({
          id: "l5-direct-1",
          q: "Encoding 1 has one gene per worker (the value is a job number). With 4 workers and 6 jobs, can <b>any</b> chromosome cover every job?",
          opts: [
            "No: 4 genes can name at most 4 different jobs",
            "Yes, if all four values are different",
            "Yes, after enough mutations",
          ],
          a: 0,
          why: "Each worker holds a single job, so 4 genes reach at most 4 of the 6 jobs. Two jobs are always left without a worker, and a chromosome where two workers share a job is worse still.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-direct-2",
          q: "Encoding 2 (one gene per job, value = worker). You mutate one gene. Is the result always a valid assignment?",
          opts: [
            "Yes: every job still has exactly one worker",
            "No: the mutated job may be left without anyone",
            "Only if the new worker has no other jobs",
          ],
          a: 0,
          why: "A gene always holds exactly one worker, so every job always has exactly one. What can go wrong is the <b>load</b>: one worker may end up with most of the jobs, which the fitness has to punish.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Direct encoding: the gene is the problem variable (pipe diameter, job's worker). Easy to read, fast to evaluate.",
            "Choose the encoding so the constraints are already true: one gene <b>per job</b> guarantees every job is covered.",
            "What the encoding cannot guarantee (a worker's workload) is left to the fitness function.",
          ],
          "Put the gene where the constraint is: one gene per job means every job gets a worker.",
        ),
      );
    },
  });

  L["l5-direct"] = {
    sum: "In a <b>direct</b> encoding each gene is one of the problem's own variables. Choosing <i>which</i> variable gets a gene decides what the encoding can and cannot express.",
    steps: [
      {
        t: "Genes are the problem's variables",
        b: `<p><b>Water network:</b> there are <b>n</b> pipes and <b>m</b> possible diameters. Give every pipe a gene holding its diameter. That is a <b>k-ary</b> chromosome of length <b>L</b> with values 0 to K−1, and the real sizes come from a lookup table.</p>`,
        v:
          row("pipes", ga([9, 6, 10, 4, 9, 4, 7, 0, 0, 1])) +
          `<p class="dim">L = 10 pipes, K = 11 diameters. The number 9 means "look up diameter 9 in the table".</p>`,
        c: {
          q: "10 pipes, 11 diameter choices each. How many different designs are there?",
          o: [
            "About 110, because 10 pipes × 11 sizes = 110",
            "About 1 million, as each pipe adds a factor of 4",
            "Over 10 billion: 11 choices at each of 10 pipes",
          ],
          a: 2,
          hint: "10 choices per pipe for 10 pipes is already 10¹⁰.",
          why: "11¹⁰ ≈ 2.6 × 10¹⁰, which is about 26 billion. You can't check them all, which is why we search.",
        },
      },
      {
        t: "Generalised assignment",
        b: `<p>You have <b>n</b> workers and <b>m</b> jobs. <b>Every job</b> needs exactly one worker. A worker may do several jobs, but each job takes a different amount of time depending on who does it. <b>Minimise</b> the total time.</p>`,
        v:
          table(
            ["", "J1", "J2", "J3"],
            [
              ["<b>W1</b>", 4, 7, 3],
              ["<b>W2</b>", 6, 3, 5],
            ],
          ) + `<p class="dim">Hours for each worker and job (first few cells of the demo's table).</p>`,
        c: {
          q: "Which constraint must <b>every</b> valid assignment satisfy?",
          o: [
            "Every worker does at least one job",
            "Every job is done by exactly one worker",
            "Every worker does the same number of jobs",
          ],
          a: 1,
          why: "Workers may do several jobs, or none. A job with nobody, or with two workers, is invalid.",
        },
      },
      {
        t: "Encoding 1: a gene per worker",
        b: `<p>n integers (one per worker), each from 1 to m (the job). <b>Plus:</b> every worker has a job. <b>Minus:</b> some jobs get nobody, a job can go to two workers, and no worker can do more than one job.</p>`,
        v:
          row(
            "Encoding 1",
            ga(["J9", "J6", "J3", "J4", "J6", "J7", "J1", "J8", "J8", "J6"], (i) =>
              i === 1 || i === 4 || i === 9 ? "bad" : i === 7 || i === 8 ? "p2" : "",
            ),
          ) + `<p class="dim">J6 and J8 are repeated; J2 and J5 never appear.</p>`,
        c: {
          q: "In Encoding 1, what happens to a job whose number appears in no gene?",
          o: [
            "Nobody does it: the chromosome is invalid",
            "The slowest worker does it automatically",
            "It is done twice",
          ],
          a: 0,
          why: "Nothing in the chromosome assigns that job, so a constraint is broken.",
        },
      },
      {
        t: "Encoding 2: a gene per job",
        b: `<p>m integers (one per job), each from 1 to n (the worker). <b>Plus:</b> every job has exactly one worker. <b>Minus:</b> a worker may be overworked.</p>`,
        v:
          row("Encoding 2", ga(["W9", "W6", "W3", "W4", "W6", "W7", "W1", "W8", "W8", "W6"])) +
          `<p class="dim">Gene j says who does job j. W6 does three jobs.</p>`,
        c: {
          q: "Which encoding makes sure every job is covered?",
          o: ["Encoding 1: a gene per worker", "Encoding 2: a gene per job", "Neither can"],
          a: 1,
          why: "Each job owns a gene, and that gene always holds a worker.",
        },
      },
      {
        t: "Direct means penalties",
        b: `<p>With a direct encoding the chromosome modifies <b>problem variables</b> straight away, and invalid solutions are dealt with <b>solely by penalising fitness</b>. In Encoding 2 the penalty could target overworked staff.</p>`,
        v: F.flow([
          "Genes = problem variables",
          "Build the solution directly",
          { t: "Penalise fitness if invalid", c: "rose" },
        ]),
        c: {
          q: "In a direct encoding, how are constraint violations usually handled?",
          o: ["The decoder removes them before fitness is computed", "Fitness is penalised", "They cannot occur"],
          a: 1,
          why: "A direct genotype maps straight onto a solution, so a bad one is simply scored badly.",
        },
      },
    ],
    guide: [
      "Switch between <b>Encoding 1</b> and <b>Encoding 2</b> and press <b>Random chromosome</b>.",
      "Press <b>Mutate one gene</b> and watch whether the result stays valid.",
      "Press <b>Test 1,000 random chromosomes</b> for each encoding.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 5.5 Binary genomes: the antenna ============ */
  const ANT_COL = ["X", "Y", "Z"];
  function antennaBits() {
    const lec = ["00010", "11110", "00001", "00011", "11011", "00011"]; // +0010 -1110 +0001 +0011 -1011 +0011 (sign bit 1 = minus)
    const r = mulberry(5),
      bits = [];
    lec.forEach((s) => [...s].forEach((c) => bits.push(+c)));
    while (bits.length < 105) bits.push(r() < 0.5 ? 0 : 1);
    return bits;
  }
  const antVal = (bits, k) => {
    const b = bits.slice(k * 5, k * 5 + 5),
      m = b[1] * 8 + b[2] * 4 + b[3] * 2 + b[4];
    return b[0] ? -m : m;
  };

  N.register({
    id: "l5-antenna",
    lecture: 5,
    order: 5,
    num: "5.5",
    title: "Antenna: a 105-bit genome",
    blurb: "Flip bits in an antenna genome and see how far each flip moves a wire end.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Altshuler and Linden's problem: place the ends of <b>7 straight wires</b> in 3-D (X1, Y1, Z1 … X7, Y7, Z7) so the antenna has near-uniform gain 10° above the horizon. The first wire starts at the feed point (0, 0, 0). Each coordinate is <b>5 bits</b>: one sign bit and 4 bits of magnitude, so <b>3 × 7 × 5 = 105 bits</b>.",
        ),
      );
      let bits = antennaBits(),
        view = "xz",
        last = null;
      const card = el(
        `<div class="card"><div class="card-head"><h2>The genome</h2></div><div class="controls" id="c"></div><div id="gen"></div><div id="note"></div><div class="grid two"><div id="tb"></div><div id="sv"></div></div></div>`,
      );
      root.appendChild(card);
      const bRand = el(`<button class="btn primary">Flip a random bit</button>`),
        bRst = el(`<button class="btn ghost">Reset</button>`);
      bRand.onclick = () => flip(randint(0, 104));
      bRst.onclick = () => {
        bits = antennaBits();
        last = null;
        draw();
      };
      qs("#c", card).append(
        N.seg(
          [
            ["xz", "Side view (x, z)"],
            ["xy", "Top view (x, y)"],
          ],
          view,
          (v) => {
            view = v;
            draw();
          },
        ),
        bRand,
        bRst,
      );
      function flip(i) {
        const k = Math.floor(i / 5),
          before = antVal(bits, k);
        bits[i] = 1 - bits[i];
        last = { i, k, before, after: antVal(bits, k) };
        draw();
      }
      function draw() {
        qs("#gen", card).innerHTML = `<div class="genome" style="gap:10px 14px">${Array.from(
          { length: 21 },
          (_, k) =>
            `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px"><small class="faint" style="font-size:10px">${ANT_COL[k % 3]}${Math.floor(k / 3) + 1}</small><span class="genome" style="gap:2px">${bits
              .slice(k * 5, k * 5 + 5)
              .map(
                (b, j) =>
                  `<span class="gene click ${last && last.i === k * 5 + j ? "changed" : ""}" style="min-width:20px;padding:2px 3px" data-b="${k * 5 + j}" title="${j ? "magnitude bit, weight " + [8, 4, 2, 1][j - 1] : "sign bit"}">${j === 0 ? (b ? "−" : "+") : b}</span>`,
              )
              .join("")}</span></span>`,
        ).join("")}</div>`;
        qsa("[data-b]", card).forEach((s) => s.addEventListener("click", () => flip(+s.dataset.b)));
        qs("#note", card).innerHTML = last
          ? `<div class="callout blue"><b>${ANT_COL[last.k % 3]}${Math.floor(last.k / 3) + 1}</b> went from <b>${last.before}</b> to <b>${last.after}</b>: the wire end moved <b>${Math.abs(last.after - last.before)}</b> unit${Math.abs(last.after - last.before) === 1 ? "" : "s"}. ${last.i % 5 === 0 ? "That was the <b>sign</b> bit." : `That was a magnitude bit with weight <b>${[8, 4, 2, 1][(last.i % 5) - 1]}</b>.`}</div>`
          : `<p class="dim">Click any bit, or press <b>Flip a random bit</b>. The first six coordinates are the lecture's example (+0010, −1110, +0001, +0011, −1011, +0011).</p>`;
        const vals = Array.from({ length: 21 }, (_, k) => antVal(bits, k));
        qs("#tb", card).innerHTML =
          `<table class="t" style="max-width:260px"><tr><th>wire end</th><th class="num">X</th><th class="num">Y</th><th class="num">Z</th></tr>${Array.from({ length: 7 }, (_, w) => `<tr><td>${w + 1}</td>${[0, 1, 2].map((c) => `<td class="num" ${last && last.k === w * 3 + c ? 'style="color:var(--violet);font-weight:900"' : ""}>${vals[w * 3 + c]}</td>`).join("")}</tr>`).join("")}</table>`;
        const ix = view === "xz" ? [0, 2] : [0, 1],
          pts = [[0, 0]].concat(Array.from({ length: 7 }, (_, w) => [vals[w * 3 + ix[0]], vals[w * 3 + ix[1]]])),
          S = 6.5,
          W = 260,
          H = 220;
        const P = ([x, y]) => `${(W / 2 + x * S).toFixed(1)},${(H / 2 - y * S).toFixed(1)}`;
        qs("#sv", card).innerHTML =
          `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;display:block;background:var(--bg-2);border:1px solid var(--line);border-radius:12px"><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="var(--line)"/><line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" stroke="var(--line)"/><polyline points="${pts.map(P).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="2.5" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${P(p).split(",")[0]}" cy="${P(p).split(",")[1]}" r="${i ? 4 : 6}" fill="${i ? "var(--blue)" : "var(--amber)"}"/>`).join("")}<text x="8" y="14" font-size="11" fill="var(--text-faint)">${view === "xz" ? "x →, z ↑" : "x →, y ↑"} (feed point in orange)</text></svg>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "l5-ant-1",
          q: "A coordinate is <code>+0010</code> (that is +2). Which single bit flip moves it the <b>furthest</b>?",
          opts: [
            "The sign bit",
            "The leftmost magnitude bit (weight 8)",
            "The rightmost magnitude bit (weight 1)",
            "All flips move it equally",
          ],
          a: 1,
          why: "Flipping the sign gives −2, a move of 4. Flipping the leftmost magnitude bit gives 1010 = +10, a move of <b>8</b>. The rightmost bit moves it by only 1.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-ant-2",
          q: "You flip only the sign bit of a coordinate that is currently <code>+0011</code>. What happens?",
          opts: [
            "It becomes −3, flipping to the other side of the axis",
            "It becomes +11, because the sign bit adds 8 to the number",
            "Nothing changes, because the sign bit is ignored in decoding",
          ],
          a: 0,
          why: "The sign bit just flips the sign, so +3 becomes −3. A flip of a single bit can still move the wire end quite a lot.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "7 wires × 3 coordinates × 5 bits (sign + 4 magnitude) = a 105-bit chromosome.",
            "Fitness comes from simulation: the sum of squared differences between average gain and the antenna's gain over many angles. Smaller is better.",
            "Binary was the fashion; real-valued or integer coding would work just as well. Bits have unequal weights, so a flip's effect depends on <b>which</b> bit.",
          ],
          "A bit string can encode real-world design: the encoding fixes the resolution and the size of each move.",
        ),
      );
    },
  });

  L["l5-antenna"] = {
    sum: "A satellite-antenna design problem encoded as a <b>105-bit string</b>, scored by simulating its radiation pattern.",
    steps: [
      {
        t: "The problem",
        b: `<p>Place the ends of <b>7 straight wires</b> in 3-D: (X1, Y1, Z1) … (X7, Y7, Z7). The first wire starts at the feed point (0, 0, 0) in the middle of the ground plane, and the antenna must fit inside a small cube. It is for ground-to-satellite communication for cars and handsets, with near-uniform gain 10° above the horizon.</p>`,
        v:
          row("wire ends", ga(["(X1,Y1,Z1)", "(X2,Y2,Z2)", "…", "(X7,Y7,Z7)"])) +
          `<p class="dim">The first wire starts at the feed point (0, 0, 0).</p>`,
        c: {
          q: "How many numbers does a candidate antenna need?",
          o: ["7", "21", "105"],
          a: 1,
          why: "7 wires × 3 coordinates = 21 numbers.",
        },
      },
      {
        t: "The genome",
        b: `<p>Each coordinate is <b>5 bits</b>: a sign bit and 4 bits of magnitude. So the chromosome has 3 × 7 × 5 = <b>105 bits</b>.</p>`,
        v: row("X1 Y1 Z1 X2", ga(["+0010", "−1110", "+0001", "+0011"])),
        c: {
          q: "What is the 5-bit pattern <code>−1011</code> as a number?",
          o: ["−11", "−5", "+11"],
          a: 0,
          why: "Sign −, magnitude 1011 = 8 + 2 + 1 = 11.",
        },
      },
      {
        t: "The fitness",
        b: `<p>The radiation pattern is <b>simulated</b> (National Electromagnetics Code). Fitness is the <b>sum of squares</b> of the difference between the average gain and the antenna's gain, taken over many angles. The <b>smaller</b> the value, the better.</p>`,
        v:
          F.bars(
            [
              ["antenna A", 3.2, "teal"],
              ["antenna B", 7.9, "rose"],
            ],
            { max: 8 },
          ) + `<p class="dim">Sum of squared gain differences: smaller is better.</p>`,
        c: {
          q: "Which antenna is fitter?",
          o: ["Sum of squares 3.2", "Sum of squares 7.9"],
          a: 0,
          why: "This is a minimisation: the smaller the sum, the more uniform the gain.",
        },
      },
      {
        t: "Bits have weights",
        b: `<p>Flipping a magnitude bit moves a coordinate by <b>8, 4, 2 or 1</b>; flipping the sign bit moves it by twice its size. So a flip's effect depends on <b>which</b> bit it is. Binary was the fashion for this work (and is still common), but real-valued or integer coding would be just as applicable.</p>`,
        v: `<div class="fig-bars">${[
          ["sign (2×value)", 2, "var(--violet)"],
          ["bit weight 8", 8],
          ["bit weight 4", 4],
          ["bit weight 2", 2],
          ["bit weight 1", 1],
        ]
          .map(
            ([l, v, c]) =>
              `<div class="fb-row"><span class="fb-l">${l}</span><span class="fb-track"><span class="fb-fill" style="--w:${v / 8};background:${c || "var(--teal)"}"></span></span><span class="fb-v">${v}</span></div>`,
          )
          .join("")}</div>`,
        c: {
          q: "Flipping which bit of a magnitude moves the wire end least?",
          o: ["The leftmost (weight 8)", "The rightmost (weight 1)", "They are all equal"],
          a: 1,
          why: "The rightmost bit changes the value by only 1.",
        },
      },
    ],
    guide: [
      "Click bits in the genome and watch the wire ends move.",
      "Compare a sign-bit flip with a low-bit flip.",
      "Press <b>Flip a random bit</b> a few times.",
      "Answer the questions after the demo.",
    ],
  };
})();
