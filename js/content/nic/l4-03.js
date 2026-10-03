(function () {
  const partScope = (NIC.shared.l4 = NIC.shared.l4 || {});
  const { PRESETS, SEL, parseList } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd, shuffle, gauss } = N;

  /* ============ 4.2 Replacement ============ */
  N.register({
    id: "l4-replacement",
    lecture: 4,
    order: 2,
    num: "4.2",
    title: "Replacement: weakest vs first weaker",
    blurb:
      "Insert new children into a steady-state population and watch which member gets evicted, using the slides' numbers.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "In a steady-state GA every new child needs a slot. <b>Replace weakest</b> scans the whole population and evicts the worst member. <b>Replace first weaker</b> scans from the top and evicts the <i>first</i> member it finds that is weaker than the child. The numbers below are the lecture's examples.",
        ),
      );
      const EX = {
        weakest: {
          pop: [0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1],
          queue: [
            ["S12", 0.5],
            ["S11", 0.1],
          ],
        },
        first: {
          pop: [0.3, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1],
          queue: [
            ["S12", 0.5],
            ["S11", 0.2],
          ],
        },
      };
      let strat = "weakest",
        ties = true,
        pop,
        names,
        queue,
        busy = false;
      function reset() {
        const e = EX[strat];
        pop = [...e.pop];
        names = pop.map((_, i) => "S" + (i + 1));
        queue = e.queue.map((q) => [...q]);
        busy = false;
        draw();
      }
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="card-head"><h3>Population</h3></div><div class="pop" id="pop"></div>
        <div class="card-head" style="margin-top:16px"><h3>Waiting to be inserted</h3></div><div class="pop" id="q"></div>
        <div class="controls"><button class="btn primary" id="ins">Insert next child</button><button class="btn" id="add">+ Random child</button><button class="btn ghost" id="rs">Reset to lecture example</button></div>
        <div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(card);
      const tieBox = el(`<label class="field"><input type="checkbox" checked> treat equal fitness as "weaker"</label>`);
      qs("input", tieBox).onchange = (e) => (ties = e.target.checked);
      qs("#b1", card).append(
        N.seg(
          [
            ["weakest", "Replace weakest"],
            ["first", "Replace first weaker"],
          ],
          strat,
          (v) => {
            strat = v;
            reset();
          },
        ),
        tieBox,
      );
      function draw(mark = {}) {
        qs("#pop", card).innerHTML = pop
          .map((f, i) => `<div class="chip ${mark[i] || ""}"><small>${names[i]}</small><b>${f.toFixed(1)}</b></div>`)
          .join("");
        qs("#q", card).innerHTML = queue.length
          ? queue
              .map(
                ([n, f], i) =>
                  `<div class="chip new ${i === 0 ? "picked" : ""}"><small>${n}</small><b>${f.toFixed(1)}</b></div>`,
              )
              .join("")
          : `<span class="faint">empty: add a random child</span>`;
      }
      const weaker = (a, b) => (ties ? a <= b : a < b);
      const msg = (h, cls = "") => {
        const m = qs("#msg", card);
        m.style.display = "block";
        m.className = "callout " + cls;
        m.innerHTML = h;
      };
      qs("#ins", card).onclick = () => {
        if (busy || !queue.length) return;
        busy = true;
        const [nm, f] = queue[0];
        if (strat === "weakest") {
          const min = Math.min(...pop);
          const wi = pop.indexOf(min);
          draw({ [wi]: "target" });
          life.timeout(() => {
            if (weaker(min, f)) {
              pop[wi] = f;
              names[wi] = nm;
              msg(
                `Scanned all ${pop.length} members. Weakest is at slot ${wi + 1} (f=${min}), so <b>${nm}</b> (f=${f}) replaces it.${pop.filter((x) => x === min).length > 0 && min === Math.min(...EX[strat].pop) ? " Ties go to the first minimum found." : ""}`,
                "teal",
              );
              draw({ [wi]: "new" });
            } else {
              msg(`${nm} (f=${f}) is worse than even the weakest member (${min}), so it's discarded.`, "rose");
              draw();
            }
            queue.shift();
            draw({ [wi]: weaker(min, f) ? "new" : "" });
            busy = false;
          }, 700);
        } else {
          let i = 0;
          const scan = () => {
            if (i >= pop.length) {
              msg(`No member is weaker than ${nm} (f=${f}), so it's discarded.`, "rose");
              queue.shift();
              draw();
              busy = false;
              return;
            }
            draw({ [i]: "scan" });
            if (weaker(pop[i], f)) {
              life.timeout(() => {
                const old = pop[i];
                pop[i] = f;
                names[i] = nm;
                queue.shift();
                draw({ [i]: "new" });
                msg(
                  `Scanned slots 1–${i + 1}. Slot ${i + 1} (f=${old}) is the first ${ties ? "no better than" : "weaker than"} ${nm} (f=${f}), so it's replaced. Scanning stops.`,
                  "teal",
                );
                busy = false;
              }, 380);
            } else {
              i++;
              life.timeout(scan, 260);
            }
          };
          scan();
        }
      };
      qs("#add", card).onclick = () => {
        queue.push(["S" + (names.length + queue.length + 11), Math.round(rnd() * 10) / 10]);
        draw();
      };
      qs("#rs", card).onclick = reset;
      reset();
      root.appendChild(
        el(
          `<div class="callout">The slides' result for "first weaker" (S11 at f=0.2 lands in slot 4, where there was another 0.2) only works if S12 is inserted first and <b>ties count as weaker</b>. That's this page's default. Untick the box to see strict "weaker than" instead: S11 then goes to slot 10.</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "l4-rep-1",
          q: "Which replacement strategy applies <b>less selection pressure</b> (keeps more diversity)?",
          opts: ["Replace weakest", "Replace first weaker", "They're identical"],
          a: 1,
          why: "Replace-weakest always removes the worst, which is the most greedy option. First-weaker can remove a mediocre member that happens to come early in the scan, so weak but possibly useful solutions survive longer. It's also cheaper: it can stop early instead of scanning everyone.",
        }),
      );
      root.appendChild(
        takeaways([
          "Replacement is where steady-state GAs apply survivor selection.",
          "<b>Replace weakest</b>: evict the minimum. High pressure, and the best is never lost.",
          "<b>Replace first weaker</b>: evict the first member (in scan order) that is weaker than the child. Lower pressure, and it can stop early.",
        ]),
      );
    },
  });

  /* ============ 4.3 Selection pressure ============ */
  N.register({
    id: "l4-pressure",
    lecture: 4,
    order: 3,
    num: "4.3",
    title: "Selection pressure",
    blurb:
      "Too little pressure means no progress. Too much means premature convergence. See takeover happen, then find the sweet spot.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "<b>Selection pressure</b> is how strongly selection favours the fittest. The lecture's picture: <b>very low</b> pressure (random) → no evolutionary progress at all. <b>Modest</b> pressure → you may end up at the global optimum or at a good local one. <b>Very high</b> pressure (always pick the best) → you rush up the nearest hill and get stuck.",
        ),
      );
      const METHODS = [
        ["random", "Random"],
        ["roulette", "Roulette"],
        ["rank", "Rank"],
        ["t2", "Tournament t=2"],
        ["t5", "Tournament t=5"],
        ["best", "Always best"],
      ];
      const P = 40,
        G = 18;
      let method = "t2";
      const card = el(`<div class="card"><div class="card-head"><h2>Takeover: selection only, no variation</h2></div>
        <p class="dim">40 individuals. Colour = fitness (pale = poor, deeper green = fitter, orange = best). Each row is a generation: pick 40 parents from the row above using the chosen method, with no mutation and no crossover. The only thing happening is selection, so you can see how fast it wipes out diversity.</p>
        <div class="controls" id="b1"></div><div class="controls"><button class="btn primary" id="go">Run 18 generations</button></div>
        <div class="grid side"><canvas class="viz" id="hm"></canvas><div><h3>Share of population that are copies of the original best</h3><canvas class="viz" id="tk"></canvas><p class="dim" id="tkT"></p></div></div></div>`);
      root.appendChild(card);
      qs("#b1", card).appendChild(
        N.seg(METHODS, method, (v) => {
          method = v;
          run();
        }),
      );
      function pick(f) {
        if (method === "random") return randint(0, f.length - 1);
        if (method === "roulette") return SEL.sample(SEL.rouletteProbs(f));
        if (method === "rank") return SEL.sample(SEL.rankProbs(f, 1));
        if (method === "t2") return SEL.tournament(f, 2);
        if (method === "t5") return SEL.tournament(f, 5);
        return f.indexOf(Math.max(...f));
      }
      function run() {
        const base = Array.from({ length: P }, (_, i) => 0.05 + (0.95 * i) / (P - 1));
        shuffle(base);
        const bestV = Math.max(...base);
        let rows = [base],
          share = [1 / P];
        for (let g = 1; g < G; g++) {
          const prev = rows[g - 1];
          const nx = Array.from({ length: P }, () => prev[pick(prev)]);
          rows.push(nx);
          share.push(nx.filter((x) => x === bestV).length / P);
        }
        const { ctx, w, h } = N.setupCanvas(qs("#hm", card), 300);
        const cw = w / P,
          ch = h / G;
        rows.forEach((row, g) =>
          row.forEach((v, i) => {
            const t = (v - 0.05) / 0.95;
            ctx.fillStyle = v === bestV ? "#ff9600" : `hsl(${200 - t * 110}, ${60 + t * 30}%, ${88 - t * 42}%)`;
            ctx.fillRect(i * cw + 0.5, g * ch + 0.5, cw - 1, ch - 1);
          }),
        );
        N.lineChart(qs("#tk", card), {
          series: [{ data: share, color: N.colors().amber, dots: true }],
          yMin: 0,
          yMax: 1,
          height: 200,
          xLabel: "generation",
        });
        const distinct = new Set(rows[G - 1]).size;
        qs("#tkT", card).innerHTML =
          `After ${G - 1} generations: <b>${distinct}</b> distinct individuals remain out of 40, and the best holds <b>${Math.round(share[G - 1] * 100)}%</b> of slots. ${method === "random" ? "Random selection is pure genetic drift. Diversity still shrinks (by chance), but not towards the best." : method === "best" ? "Instant takeover: one generation and diversity is gone." : ""}`;
      }
      qs("#go", card).onclick = run;
      life.onResize(run);
      run();

      // Sweet spot experiment
      const sw =
        el(`<div class="card"><div class="card-head"><h2>Finding the sweet spot</h2><span class="faint">generational EA on the multimodal landscape · 100 runs per bar · 40 generations · P=20</span></div>
        <p class="dim">Tournament size t sets the pressure. t = 1 is random selection. Watch two numbers: how often the population finds the global peak, and how close the average member ends up to it.</p>
        <div class="controls"><button class="btn primary" id="sB">Run experiment</button></div><canvas class="viz" id="sC"></canvas>
        <div class="legend"><span style="--c:var(--teal)">% runs finding global optimum</span><span style="--c:var(--violet)">final mean fitness (% of max)</span></div><p class="dim" id="sT"></p></div>`);
      root.appendChild(sw);
      qs("#sB", sw).onclick = () => {
        const L = N.makeLandscape("multimodal"),
          ts = [1, 2, 3, 4, 6, 8, 12, 20];
        const hits = [],
          means = [];
        ts.forEach((t) => {
          let hsum = 0,
            msum = 0;
          for (let r = 0; r < 100; r++) {
            let p = Array.from({ length: 20 }, () => randint(0, L.N - 1));
            let found = false;
            for (let g = 0; g < 40; g++) {
              const f = p.map(L.f);
              p = p.map(() => N.clamp(p[SEL.tournament(f, t)] + Math.round(gauss() * 3), 0, L.N - 1));
              if (p.some((x) => L.f(x) >= L.max - 1e-9)) found = true;
            }
            if (found) hsum++;
            msum += p.reduce((a, x) => a + L.f(x), 0) / 20 / L.max;
          }
          hits.push(hsum);
          means.push(msum);
        });
        const C = N.colors();
        N.barChart(qs("#sC", sw), {
          groups: [
            { values: hits, color: C.teal },
            { values: means, color: C.violet },
          ],
          labels: ts.map((t) => "t=" + t),
          yMax: 100,
          height: 220,
          decimals: 0,
        });
        qs("#sT", sw).innerHTML =
          "Expect t=1 to show poor mean fitness (no pressure means no progress), very large t to show lower success (premature convergence on whichever hill wins early), and a sweet spot at modest t.";
      };

      root.appendChild(
        predict({
          id: "l4-pr-1",
          q: "Your EA's population becomes nearly identical within a few generations and stalls on a mediocre solution. What's the most likely fix?",
          opts: [
            "Increase the tournament size to push harder",
            "Lower selection pressure and/or raise mutation",
            "Remove mutation so good genes aren't disrupted",
          ],
          a: 1,
          why: "Fast loss of diversity followed by stagnation is <b>premature convergence</b>, the classic sign of too much pressure. Lower the pressure or add exploration (more mutation) so the population keeps sampling other regions.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Selection pressure = how strongly selection favours the fittest.",
            "Too low (random): drift, no progress. Too high (always best): takeover in a few generations, then premature convergence on a local optimum.",
            "Good EAs use <b>modest, tunable</b> pressure: tournament size, rank bias.",
          ],
          "Selection pressure trades off progress against diversity: too little and nothing improves, too much and the population converges prematurely.",
        ),
      );
    },
  });

  /* ============ shared: fitness input + presets ============ */
  function fitnessInput(card, onChange, initial = PRESETS.lecture.v) {
    const box = el(
      `<div><div class="controls"><label class="field">Fitnesses <input type="text" id="fi" value="${initial}" style="width:360px;font-family:var(--mono)"></label></div><div class="controls" id="pre"></div></div>`,
    );
    const input = qs("#fi", box);
    Object.entries(PRESETS).forEach(([k, p]) => {
      const b = el(`<button class="btn small">${p.n}</button>`);
      b.onclick = () => {
        input.value = p.v;
        onChange(parseList(p.v), k);
      };
      qs("#pre", box).appendChild(b);
    });
    input.addEventListener("input", () => onChange(parseList(input.value), null));
    card.appendChild(box);
    return () => parseList(input.value);
  }
  const PALETTE = [
    "#58cc02",
    "#ce82ff",
    "#ff9600",
    "#1cb0f6",
    "#ff4b4b",
    "#0a8fd1",
    "#a560e8",
    "#ffc800",
    "#2b9a00",
    "#ea2b2b",
    "#5b7cfa",
    "#cc7a00",
  ];
  Object.assign(partScope, { PALETTE, fitnessInput });
})();
