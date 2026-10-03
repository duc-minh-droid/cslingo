(function () {
  const partScope = (NIC.shared.l12 = NIC.shared.l12 || {});
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;

  /* ============ 2.1 Generic EA ============ */
  N.register({
    id: "l2-generic",
    lecture: 2,
    order: 1,
    num: "2.1",
    title: "The generic EA: select, vary, update",
    blurb: "The lecture's population table: pick parents, make children, then choose how the population gets updated.",
    render(root) {
      root.appendChild(header(this, ""));
      const POP = [0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1];
      const KIDS = [
        ["S11", 1.0],
        ["S12", 0.2],
      ];
      let stage = 0,
        upd = "some";
      const card =
        el(`<div class="card"><div class="controls"><button class="btn ghost" id="bk">← Back</button><button class="btn primary" id="nx">Next stage →</button><span class="mono dim" id="stg"></span></div>
        <div class="grid two"><div><h3>Population P</h3><div class="pop" id="pop"></div></div><div id="right"></div></div>
        <div id="updBar" class="controls" style="margin-top:14px"></div><div id="res"></div></div>`);
      root.appendChild(card);
      const STG = [
        "1. Start: 10 random solutions, each with a fitness",
        "2. Selection: pick parents (fitter = more likely)",
        "3. Variation: apply genetic operators to make new solutions",
        "4. Population update: decide who stays",
      ];
      qs("#updBar", card).append(
        el(`<span class="faint" style="font-size:13px">Update rule:</span>`),
        N.seg(
          [
            ["some", "Replace some old with some new"],
            ["all", "Replace the entire population"],
            ["merge", "Merge P + children, keep best |P|"],
          ],
          upd,
          (v) => {
            upd = v;
            draw();
          },
        ),
      );
      function draw() {
        qs("#stg", card).textContent = STG[stage];
        const mark = (i) => (stage >= 1 && (i === 4 || i === 8) ? "picked" : "");
        let pop = POP.map((f, i) => ({ n: "S" + (i + 1), f, cls: mark(i) }));
        qs("#right", card).innerHTML =
          stage === 0
            ? `<p class="dim">Each chip is one candidate solution s with its fitness f(s). Higher is better here.</p>`
            : stage === 1
              ? `<h3>Parents</h3><div class="pop"><div class="chip picked"><small>S5</small><b>0.9</b></div><div class="chip picked"><small>S9</small><b>0.4</b></div></div><p class="dim" style="margin-top:10px">S5 is the fittest, but S9 (0.4) was also picked. Selection is <b>biased</b>, not "only the best".</p>`
              : `<h3>New solutions</h3><div class="pop">${KIDS.map(([n, f]) => `<div class="chip new"><small>${n}</small><b>${f.toFixed(1)}</b></div>`).join("")}</div><p class="dim" style="margin-top:10px">Children can be better (S11 = 1.0) <i>or worse</i> (S12 = 0.2) than their parents. Variation is blind.</p>`;
        qs("#pop", card).innerHTML = pop
          .map((p) => `<div class="chip ${p.cls}"><small>${p.n}</small><b>${p.f.toFixed(1)}</b></div>`)
          .join("");
        qs("#updBar", card).style.display = stage === 3 ? "" : "none";
        if (stage === 3) {
          let out, note;
          if (upd === "some") {
            const o = POP.map((f, i) => ({ n: "S" + (i + 1), f }));
            const worst = o
              .map((x, i) => i)
              .sort((a, b) => o[a].f - o[b].f)
              .slice(0, 2);
            o[worst[0]] = { n: "S11", f: 1.0, nw: 1 };
            o[worst[1]] = { n: "S12", f: 0.2, nw: 1 };
            out = o;
            note = "The two new children replaced the two weakest (S1 and S10). The population size stays 10.";
          } else if (upd === "all") {
            out = KIDS.map(([n, f]) => ({ n, f, nw: 1 }));
            note =
              "The whole old population is thrown away. In a real run you'd make 10 children so the size stays |P|. Here only 2 are shown, so this is what's left: note that S5 (0.9) is <b>lost</b>.";
          } else {
            out = POP.map((f, i) => ({ n: "S" + (i + 1), f }))
              .concat(KIDS.map(([n, f]) => ({ n, f, nw: 1 })))
              .sort((a, b) => b.f - a.f)
              .slice(0, 10);
            note =
              "Old and new are pooled (12 solutions) and the best 10 survive. S11 gets in, S12 (0.2) doesn't, and the worst old ones drop out.";
          }
          qs("#res", card).innerHTML =
            `<h3 style="margin-top:12px">Next population</h3><div class="pop">${out.map((p) => `<div class="chip ${p.nw ? "new" : ""}"><small>${p.n}</small><b>${p.f.toFixed(1)}</b></div>`).join("")}</div><p class="dim" style="margin-top:10px">${note}</p>`;
        } else qs("#res", card).innerHTML = "";
        qs("#bk", card).disabled = stage === 0;
        qs("#nx", card).disabled = stage === 3;
      }
      qs("#nx", card).onclick = () => {
        stage++;
        draw();
      };
      qs("#bk", card).onclick = () => {
        stage--;
        draw();
      };
      draw();
      const tr =
        el(`<div class="card"><div class="card-head"><h2>The big design questions (EA research topics)</h2></div><div class="grid two">
        <div><h3>How greedy should selection be?</h3><div id="gr"></div><div id="grT" class="dim" style="margin-top:8px"></div></div>
        <div><h3>How big should mutation steps be?</h3><ul class="clean"><li><b>Small-step</b> mutation is preferred.</li><li><b>Recombination</b> is a principled way to take large steps.</li><li>But large random steps are usually <b>extremely bad</b>.</li><li>How to <b>encode</b> "can make all the difference" and is tied up with how you vary.</li></ul></div></div></div>`);
      root.appendChild(tr);
      const gs = N.slider("Greediness", 0, 100, 1, 50, (v) => v + "%");
      const gt = (v) =>
        (qs("#grT", tr).innerHTML =
          v < 20
            ? "<b style='color:var(--amber)'>Almost random</b>: great results, but <b>too slowly</b>."
            : v > 80
              ? "<b style='color:var(--rose)'>Always select the best</b>: bad results, <b>quickly</b> (premature convergence)."
              : "<b style='color:var(--teal)'>Moderate bias</b>: the sweet spot. Fitter is more likely, but everyone has a chance.");
      gs.onInput(gt);
      qs("#gr", tr).appendChild(gs);
      gt(50);
      root.appendChild(
        takeaways(
          [
            "Generic EA: <b>initialise</b> a random population (often 100–500), <b>evaluate</b>, then loop: <b>select → vary → update population</b>.",
            "Selection options: top 10%, fitness-proportionate, exponential in rank, …",
            "Update options: replace everyone, merge and keep the best |P|, replace some old with some new.",
          ],
          "An EA repeatedly selects parents, varies them into children, and updates the population.",
        ),
      );
    },
  });

  /* ============ 2.2 Search & optimisation ============ */
  N.register({
    id: "l2-optim",
    lecture: 2,
    order: 2,
    num: "2.2",
    title: "Search, optimisation & fitness functions",
    blurb:
      "The lecture's 3-item problem: search every subset yourself, and see that you just optimised a fitness function.",
    render(root) {
      root.appendChild(header(this, ""));
      const W = [20, 75, 60];
      let bits = [0, 0, 0];
      const card = el(`<div class="card"><div class="card-head"><h2>Get as close to 100 kg as possible</h2></div>
        <div class="grid two"><div><div id="items" style="display:flex;gap:10px;flex-wrap:wrap"></div>
          <div class="stat-row"><div class="stat"><small>Solution s (bits)</small><b id="s"></b></div><div class="stat amber"><small>Total weight</small><b id="w"></b></div><div class="stat teal"><small>f(s) = |weight − 100|</small><b id="f"></b></div></div>
          <p class="dim">Lower f is better, so this is a <b>minimisation</b> problem. Bit i = 1 means item i is in the subset.</p></div>
        <div><h3>The whole search space S (8 solutions)</h3><table class="t" id="tb"></table><div class="controls"><button class="btn" id="rev">Reveal fitness for all</button></div></div></div></div>`);
      root.appendChild(card);
      let revealed = false;
      const f = (b) => Math.abs(b.reduce((a, x, i) => a + x * W[i], 0) - 100);
      const all = Array.from({ length: 8 }, (_, k) => [(k >> 2) & 1, (k >> 1) & 1, k & 1]);
      const tried = new Set(["000"]);
      function draw() {
        const key = bits.join("");
        tried.add(key);
        qs("#items", card).innerHTML = W.map(
          (w, i) =>
            `<button class="btn ${bits[i] ? "on" : ""}" data-i="${i}" style="padding:14px 18px;text-align:left"><b>Item ${i + 1}</b><br><span class="mono">${w} kg</span></button>`,
        ).join("");
        qsa("#items button", card).forEach(
          (b) =>
            (b.onclick = () => {
              bits[+b.dataset.i] ^= 1;
              draw();
            }),
        );
        qs("#s", card).textContent = key;
        qs("#w", card).textContent = bits.reduce((a, x, i) => a + x * W[i], 0) + " kg";
        qs("#f", card).textContent = f(bits);
        const best = Math.min(...all.map(f));
        qs("#tb", card).innerHTML =
          `<tr><th>s</th><th class="num">weight</th><th class="num">f(s)</th></tr>` +
          all
            .map((b) => {
              const k = b.join(""),
                show = revealed || tried.has(k);
              return `<tr class="${k === key ? "hl" : ""}"><td class="mono">${k}</td><td class="num">${show ? b.reduce((a, x, i) => a + x * W[i], 0) : "?"}</td><td class="num" style="color:${show && f(b) === best ? "var(--teal)" : ""}">${show ? f(b) + (f(b) === best ? " ★" : "") : "?"}</td></tr>`;
            })
            .join("") +
          `<tr><td colspan="3" class="faint">You've tried ${tried.size} of 8. ${tried.size === 8 ? "That's <b>exhaustive search</b> (enumeration): you're guaranteed to have found the optimum." : ""}</td></tr>`;
      }
      qs("#rev", card).onclick = () => {
        revealed = true;
        draw();
      };
      draw();
      root.appendChild(
        el(`<div class="card"><div class="card-head"><h2>Fitness functions in the real world</h2></div><table class="t">
        <tr><th>Problem</th><th>Candidate solution s</th><th>Fitness f(s)</th></tr>
        <tr><td>Timetabling</td><td>A full timetable</td><td>Number of clashes (minimise)</td></tr>
        <tr><td>Car design</td><td>A car shape</td><td>Distance covered on terrain (maximise)</td></tr>
        <tr><td>Circuits, water networks, antennas</td><td>A design</td><td>Closeness of fit to the spec</td></tr></table>
        <p class="dim" style="margin-top:10px">Size of S: tiny (8 here), huge (all timetables for 500 exams over 3 weeks, typically ~10<sup>30</sup>), or <b>infinite</b> (all real numbers).</p></div>`),
      );
      root.appendChild(
        predict({
          id: "l2-opt-1",
          q: "Exhaustive search worked for 3 items (2<sup>3</sup> = 8). How many subsets would 60 items have?",
          opts: ["60² = 3,600", "2⁶⁰ ≈ 1.15 × 10¹⁸", "60! ≈ 8.3 × 10⁸¹"],
          a: 1,
          why: "Each item is in or out, so there are 2<sup>60</sup> ≈ 1.15 × 10<sup>18</sup> subsets. At a billion checks a second that's about <b>36 years</b>. Enumeration only works for tiny S.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Optimisation</b> = find the best solution you can (usually quickly) from a set <b>S</b> of candidates.",
            "The <b>fitness function f(s)</b> scores each candidate. We want the s with the best score (max or min).",
            "<b>Exhaustive search / enumeration</b>: try every s. Guaranteed optimal, but only feasible when S is small.",
          ],
          "Optimisation means searching the set S for the s with the best f(s); enumeration only works when S is small.",
        ),
      );
    },
  });

  /* ============ 2.3 Complexity ============ */
  N.register({
    id: "l2-complexity",
    lecture: 2,
    order: 3,
    num: "2.3",
    title: "Easy vs hard: polynomial vs exponential",
    blurb: "Drag n and watch an exponential curve overtake a polynomial one, then see what that means in real seconds.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let n = 20;
      const card = el(`<div class="card"><div class="controls" id="b"></div>
        <div class="grid two"><div><h3>1.1<sup>n</sup> vs n<sup>1.1</sup> (the lecture's table)</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--rose)">1.1<sup>n</sup> exponential</span><span style="--c:var(--teal)">n<sup>1.1</sup> polynomial</span></div><p class="dim" id="cx"></p></div>
        <div><h3>Time at 10<sup>9</sup> steps per second</h3><table class="t" id="tb"></table></div></div></div>`);
      root.appendChild(card);
      const sN = N.slider("Problem size n", 2, 100, 1, n);
      sN.onInput((v) => {
        n = v;
        draw();
      });
      qs("#b", card).appendChild(sN);
      const human = (s) => {
        if (!Number.isFinite(s) || s > 1e30) return "far longer than the age of the universe";
        const u = [
          ["years", 31557600],
          ["days", 86400],
          ["hours", 3600],
          ["minutes", 60],
          ["seconds", 1],
          ["ms", 1e-3],
          ["µs", 1e-6],
          ["ns", 1e-9],
        ];
        for (const [nm, v] of u)
          if (s >= v) {
            const x = s / v;
            return (x >= 1e6 ? x.toExponential(1) : x.toFixed(x < 10 ? 1 : 0)) + " " + nm;
          }
        return "< 1 ns";
      };
      function draw() {
        const xs = Array.from({ length: n - 1 }, (_, i) => i + 2);
        N.lineChart(qs("#ch", card), {
          series: [
            { data: xs.map((x) => 1.1 ** x), color: N.colors().rose },
            { data: xs.map((x) => x ** 1.1), color: N.colors().teal },
          ],
          yMin: 0,
          height: 220,
          xLabel: "n (from 2)",
        });
        qs("#cx", card).innerHTML =
          n < 44
            ? `At n = ${n}: 1.1<sup>n</sup> = <b>${(1.1 ** n).toFixed(2)}</b>, n<sup>1.1</sup> = <b>${(n ** 1.1).toFixed(2)}</b>. The exponential still looks <i>smaller</i>. Keep dragging…`
            : `At n = ${n}: 1.1<sup>n</sup> = <b>${(1.1 ** n).toFixed(0)}</b> vs n<sup>1.1</sup> = <b>${(n ** 1.1).toFixed(0)}</b>. The curves crossed between n = 43 and 44. <b>An exponential always overtakes a polynomial eventually.</b>`;
        const rows = [
          ["n log n", "Sorting (easy)", n * Math.log2(n)],
          ["n²", "Closest pair of n vectors (easy)", n ** 2],
          ["n³", "Polynomial (easy)", n ** 3],
          ["2ⁿ", "Multiple alignment of n sequences (hard)", 2 ** n],
          [
            "n!",
            "Try every TSP tour (hard)",
            (() => {
              let r = 1;
              for (let i = 2; i <= n; i++) r *= i;
              return r;
            })(),
          ],
        ];
        qs("#tb", card).innerHTML =
          `<tr><th>Steps</th><th>Example</th><th class="num">Time</th></tr>` +
          rows
            .map(
              ([s, ex, v], i) =>
                `<tr class="${i >= 3 ? "bad" : ""}"><td class="mono">${s}</td><td>${ex}</td><td class="num">${human(v / 1e9)}</td></tr>`,
            )
            .join("");
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "l2-cx-1",
          q: "A problem is called <b>hard (intractable)</b> when…",
          opts: [
            "It has a large search space",
            "No polynomial-time exact algorithm is <b>known</b>",
            "Computers can't represent its solutions",
          ],
          a: 1,
          why: 'Sorting has a huge search space (n! orderings) but is <b>easy</b>, because an n log n algorithm exists. "Hard" is about the best <i>known</i> exact algorithm being exponential. The lecture\'s point for you: <b>almost all important real-world problems are technically hard.</b>',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Complexity = how the running time of the <b>fastest known exact algorithm</b> grows with problem size n.",
            "<b>Polynomial</b> (n², n log n, n<sup>34</sup>) = <b>easy / tractable</b>. <b>Exponential</b> (2<sup>n</sup>, 1.1<sup>n</sup>, n<sup>n</sup>) = <b>hard / intractable</b>.",
            "An exponential always overtakes a polynomial as n grows, even 1.1<sup>n</sup> vs n<sup>1.1</sup>.",
          ],
          "Easy problems have polynomial-time exact algorithms; hard ones don't (as far as we know), so exact solving blows up exponentially.",
        ),
      );
    },
  });

  /* ============ 2.4 MST & Prim ============ */
  const G = {
    nodes: { A: [80, 170], B: [260, 55], C: [230, 280], D: [450, 265], E: [460, 85] },
    edges: [
      ["A", "B", 12],
      ["A", "C", 4],
      ["A", "D", 6],
      ["A", "E", 9],
      ["B", "C", 7],
      ["B", "D", 8],
      ["B", "E", 3],
      ["C", "D", 5],
      ["C", "E", 6],
      ["D", "E", 14],
    ],
  };
  Object.assign(partScope, { G });
})();
