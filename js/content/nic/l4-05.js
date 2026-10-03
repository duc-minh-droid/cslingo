(function () {
  const partScope = (NIC.shared.l4 = NIC.shared.l4 || {});
  const { SEL } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle, gauss } = N;

  /* ============ 4.6 Tournament ============ */
  N.register({
    id: "l4-tournament",
    lecture: 4,
    order: 6,
    num: "4.6",
    title: "Tournament selection",
    blurb: "Pick t at random and keep the best. Watch tournaments happen and see how t controls pressure.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          'To select a parent: choose <b>t</b> individuals at random <b>with replacement</b> and return the fittest. The lecture lists the pros and cons. <span style="color:var(--teal-ink)">+ tunable, + avoids superfit/superpoor problems, + simple and efficient (no sorting).</span> <span style="color:var(--rose-ink)">− one more parameter to tune.</span>',
        ),
      );
      let Pn = 12,
        t = 3,
        fits,
        counts;
      const newPop = () => {
        fits = shuffle(Array.from({ length: Pn }, (_, i) => i + 1));
        counts = new Array(Pn).fill(0);
      };
      newPop();
      const card = el(`<div class="card"><div class="controls" id="b1"></div><div class="pop" id="pop"></div>
        <div class="controls"><button class="btn primary" id="one">Run one tournament</button><button class="btn" id="many">Run 5,000</button><button class="btn ghost" id="np">New population</button></div>
        <div id="msg" class="dim"></div>
        <div class="grid two" style="margin-top:12px"><div><h3>P(selected) by fitness rank</h3><canvas class="viz" id="pc"></canvas><div class="legend"><span style="--c:var(--line-2)">theory: (r/P)<sup>t</sup> − ((r−1)/P)<sup>t</sup></span><span style="--c:var(--teal)">observed</span></div></div>
        <div><h3>What t does</h3><div id="stats"></div></div></div></div>`);
      root.appendChild(card);
      const sP = N.slider("Population P", 4, 30, 1, Pn),
        sT = N.slider("Tournament size t", 1, 10, 1, t);
      sP.onInput((v) => {
        Pn = v;
        newPop();
        draw();
      });
      sT.onInput((v) => {
        t = v;
        counts = new Array(Pn).fill(0);
        draw();
      });
      qs("#b1", card).append(sP, sT);
      function draw(mark = {}) {
        qs("#pop", card).innerHTML = fits
          .map((x, i) => `<div class="chip ${mark[i] || ""}"><small>#${i + 1}</small><b>${x}</b></div>`)
          .join("");
        const theory = SEL.tournProbByRank(Pn, t);
        const tot = counts.reduce((a, b) => a + b, 0);
        const obs = new Array(Pn).fill(0);
        fits.forEach((x, i) => (obs[x - 1] = tot ? counts[i] / tot : 0));
        const C = N.colors();
        N.barChart(qs("#pc", card), {
          groups: [
            { values: theory, color: C.line_2 },
            { values: obs, color: C.teal },
          ],
          labels: theory.map((_, k) => String(k + 1)),
          height: 200,
        });
        const pBest = 1 - ((Pn - 1) / Pn) ** t,
          pWorst = (1 / Pn) ** t;
        qs("#stats", card).innerHTML =
          `<div class="stat-row"><div class="stat teal"><small>P(best wins a tournament)</small><b>${(pBest * 100).toFixed(1)}%</b></div><div class="stat rose"><small>P(worst wins)</small><b>${(pWorst * 100).toFixed(pWorst < 0.001 ? 4 : 2)}%</b></div></div>
          <div class="stat-row"><div class="stat amber"><small>Expected winner percentile</small><b>${Math.round((t / (t + 1)) * 100)}th</b></div><div class="stat"><small>Individuals never picked (per 1 select)</small><b>${(((Pn - 1) / Pn) ** t * 100).toFixed(0)}% chance each</b></div></div>
          <p class="dim">t = 1 is <b>random selection</b>. Larger t → the winner is drawn from further up the rankings → higher pressure. The worst can only win a tournament where every pick is the worst, with probability (1/P)<sup>t</sup>.</p>`;
      }
      qs("#one", card).onclick = () => {
        const picks = Array.from({ length: t }, () => randint(0, Pn - 1));
        let k = 0;
        const mark = {};
        const show = () => {
          if (k < picks.length) {
            mark[picks[k]] = "picked";
            draw(mark);
            k++;
            life.timeout(show, 320);
            return;
          }
          const w = picks.reduce((b, i) => (fits[i] > fits[b] ? i : b), picks[0]);
          mark[w] = "winner";
          counts[w]++;
          draw(mark);
          qs("#msg", card).innerHTML =
            `Picked ${picks.map((i) => `#${i + 1} (f=${fits[i]})`).join(", ")}${new Set(picks).size < picks.length ? ' <span style="color:var(--amber-ink)">(repeats allowed: with replacement)</span>' : ""} → winner <b style="color:var(--teal-ink)">#${w + 1}</b> with f=${fits[w]}.`;
        };
        show();
      };
      qs("#many", card).onclick = () => {
        for (let i = 0; i < 5000; i++) counts[SEL.tournament(fits, t)]++;
        draw();
      };
      qs("#np", card).onclick = () => {
        newPop();
        draw();
      };
      life.onResize(() => draw());
      draw();
      root.appendChild(
        predict({
          id: "l4-t-1",
          q: "The lecture asks: what selection pressure is there with <b>t = 10</b> and <b>popsize = 10,000</b>?",
          opts: [
            "Enormous: with t = 10 the very best almost always wins",
            "Modest: pressure depends on t, not the population size",
            "None at all, because t is tiny compared with 10,000 members",
          ],
          a: 1,
          why: 'Tournament pressure depends on <b>t</b> alone (relative rank), not on population size. Expected winner percentile = t/(t+1) ≈ 91%. P(best is in the tournament) = 1 − (9999/10000)<sup>10</sup> ≈ 0.1%. So t=10 in a huge population behaves like t=10 in a small one: it biases towards the top ~10%, but it\'s not "always pick the best".',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Tournament: sample t with replacement and return the best. Pressure rises with t, and t = 1 is random.",
            "Only compares fitnesses, so it handles superfit, negative and minimised values with no scaling tricks. It needs no sort, so it's O(t) per selection.",
            "Pressure depends on t, not on population size.",
          ],
          "Tournament selection samples t individuals and returns the best: tunable, cheap, and indifferent to fitness scale.",
        ),
      );
    },
  });

  /* ============ 4.7 Representations & mutation ============ */
  N.register({
    id: "l4-mutation",
    lecture: 4,
    order: 7,
    num: "4.7",
    title: "Encodings & mutation",
    blurb:
      "Binary, k-ary, real-valued and permutation chromosomes, each with its own mutation operators. Some combinations break.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A chromosome can be an <b>integer vector, binary string, real-valued vector, permutation, or tree</b>. <b>Different representations need representation-specific operators</b> to work well, or to work at all. Operators should balance <b>exploitation</b> (a fair chance of producing good new solutions through small changes) with <b>exploration</b> (the ability to reach anywhere in the space).",
        ),
      );
      const card = el(
        `<div class="card"><div class="tabs" id="tabs"><button data-t="kary" class="on">k-ary / integer</button><button data-t="real">Real-valued</button><button data-t="perm">Permutation</button><button data-t="bin">Binary</button></div><div id="tb"></div></div>`,
      );
      root.appendChild(card);
      const gRow = (lbl, arr, cls = () => "", extra = "") =>
        `<div class="genome-row"><span class="lbl">${lbl}</span><span class="genome">${arr.map((c, i) => `<span class="gene ${cls(i)}">${c}</span>`).join("")}</span>${extra}</div>`;
      const TABS = {
        kary(tb) {
          let g = [3, 5, 2, 8, 7, 2],
            prev = null,
            changed = [],
            k = 10,
            M = 2;
          tb.innerHTML = `<p class="dim">A list of L numbers, each from 0 to k−1. Example: the <b>Water Distribution Problem</b> with 100 pipes and 5 possible diameters is a 5-ary encoding with L = 100. The lecture's example: <span class="mono">352872</span> (k = 10).</p>
            <div class="controls"><button class="btn" data-op="single">Single-gene</button><button class="btn" data-op="multi">M-gene</button><button class="btn" data-op="swap">Swap</button><button class="btn ghost" data-op="reset">Reset</button></div><div id="mc"></div><div id="out"></div>`;
          const sM = N.slider("M", 1, 6, 1, M);
          sM.onInput((v) => (M = v));
          qs("#mc", tb).appendChild(sM);
          const draw = (note = "") => {
            qs("#out", tb).innerHTML =
              (prev ? gRow("before", prev) : "") +
              gRow(prev ? "after" : "chromosome", g, (i) => (changed.includes(i) ? "changed" : "")) +
              `<p class="dim">Values present: {${[...new Set(g)].sort((a, b) => a - b).join(", ")}} ${note}</p>`;
          };
          qsa("[data-op]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                const op = b.dataset.op;
                prev = [...g];
                if (op === "reset") {
                  g = [3, 5, 2, 8, 7, 2];
                  prev = null;
                  changed = [];
                  return draw();
                }
                if (op === "single" || op === "multi") {
                  changed = [];
                  for (let m = 0; m < (op === "single" ? 1 : M); m++) {
                    const i = randint(0, g.length - 1);
                    let v;
                    do v = randint(0, k - 1);
                    while (v === g[i]);
                    g[i] = v;
                    changed.push(i);
                  }
                  draw(
                    op === "single"
                      ? "· one gene changed to a random new value"
                      : `· ${M} single-gene mutations (may hit the same gene twice)`,
                  );
                }
                if (op === "swap") {
                  const i = randint(0, g.length - 1);
                  let j;
                  do j = randint(0, g.length - 1);
                  while (j === i);
                  [g[i], g[j]] = [g[j], g[i]];
                  changed = [i, j];
                  draw(
                    '· <span style="color:var(--rose-ink)">swap only rearranges values that are already there: no new value can appear</span>',
                  );
                }
              }),
          );
          draw();
        },
        real(tb) {
          let v = [0.3, 0.2, 0.4, 0.2, 0.1],
            prev = null,
            ch = [],
            sigma = 0.05;
          tb.innerHTML = `<p class="dim">A vector of L real numbers. <b>Single-gene</b>: pick one gene and add a small random deviation, often Gaussian. <b>Vector</b>: add a small random vector to the whole thing.</p>
            <div class="controls" id="c"><button class="btn" data-op="single">Single-gene (Gaussian)</button><button class="btn" data-op="vector">Vector mutation</button><button class="btn ghost" data-op="reset">Reset</button></div>
            <div class="grid two"><div><canvas class="viz" id="bars"></canvas><div id="vals" class="mono dim" style="margin-top:6px"></div></div><div><canvas class="viz" id="cloud"></canvas><p class="faint" style="font-size:12.5px;margin-top:6px">300 vector mutants of a 2-D parent (center). σ sets the step size, the exploitation ↔ exploration dial.</p></div></div>`;
          const sS = N.slider("σ", 0.01, 0.3, 0.01, sigma, (x) => x.toFixed(2));
          sS.onInput((x) => {
            sigma = x;
            draw();
          });
          qs("#c", tb).prepend(sS);
          function draw() {
            const C = N.colors();
            N.barChart(qs("#bars", tb), {
              groups: [
                { values: prev || v, color: C.line_2 },
                { values: v, color: (i) => (ch.includes(i) ? C.violet : C.teal) },
              ],
              labels: v.map((_, i) => "x" + (i + 1)),
              height: 200,
              yMax: Math.max(0.6, ...v, ...(prev || [])),
            });
            qs("#vals", tb).textContent = "(" + v.map((x) => x.toFixed(3)).join(", ") + ")";
            const { ctx, w, h } = N.setupCanvas(qs("#cloud", tb), 220);
            ctx.clearRect(0, 0, w, h);
            const s = Math.min(w, h) / 2 / 0.6;
            ctx.strokeStyle = C.line;
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w / 2, h);
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(206,130,255,0.5)";
            for (let i = 0; i < 300; i++) {
              ctx.beginPath();
              ctx.arc(w / 2 + gauss() * sigma * s, h / 2 + gauss() * sigma * s, 2, 0, 7);
              ctx.fill();
            }
            ctx.fillStyle = C.amber;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 5, 0, 7);
            ctx.fill();
          }
          qsa("[data-op]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                const op = b.dataset.op;
                if (op === "reset") {
                  v = [0.3, 0.2, 0.4, 0.2, 0.1];
                  prev = null;
                  ch = [];
                  return draw();
                }
                prev = [...v];
                if (op === "single") {
                  const i = randint(0, v.length - 1);
                  v[i] += gauss() * sigma;
                  ch = [i];
                } else {
                  v = v.map((x) => x + gauss() * sigma);
                  ch = v.map((_, i) => i);
                }
                draw();
              }),
          );
          draw();
          life.onResize(draw);
        },
        perm(tb) {
          let g = "DEGJACBFIH".split(""),
            prev = null,
            cls = [],
            note = "";
          tb.innerHTML = `<p class="dim">The lecture asks: <i>Here is a permutation of length 10: DEGJACBFIH. Can we do single-gene mutation? Can we do swap mutation?</i> Try both.</p>
            <div class="controls"><button class="btn" data-op="single">Single-gene</button><button class="btn" data-op="swap">Swap</button><button class="btn ghost" data-op="reset">Reset</button></div><div id="out"></div>`;
          const draw = () => {
            qs("#out", tb).innerHTML =
              (prev ? gRow("before", prev) : "") +
              gRow(prev ? "after" : "chromosome", g, (i) => cls[i] || "") +
              `<div>${note}</div>`;
          };
          qsa("[data-op]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                const op = b.dataset.op;
                if (op === "reset") {
                  g = "DEGJACBFIH".split("");
                  prev = null;
                  cls = [];
                  note = "";
                  return draw();
                }
                prev = [...g];
                if (op === "single") {
                  const i = randint(0, 9);
                  const letters = "ABCDEFGHIJ".split("").filter((c) => c !== g[i]);
                  g[i] = letters[randint(0, letters.length - 1)];
                  const counts = {};
                  g.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
                  const missing = "ABCDEFGHIJ".split("").filter((c) => !counts[c]);
                  cls = g.map((c, x) => (counts[c] > 1 ? "bad" : x === i ? "changed" : ""));
                  note = `<div class="callout rose"><b>Invalid!</b> "${g[i]}" now appears twice and <b>${missing.join(", ")}</b> is missing. For a TSP, that means visiting one city twice and skipping another. Single-gene mutation doesn't preserve the permutation.</div>`;
                } else {
                  const i = randint(0, 9);
                  let j;
                  do j = randint(0, 9);
                  while (j === i);
                  [g[i], g[j]] = [g[j], g[i]];
                  cls = g.map((_, x) => (x === i || x === j ? "good" : ""));
                  note = `<div class="callout teal"><b>Valid.</b> Swap only rearranges, so every letter still appears exactly once. That's why it suits permutations (and why it was the TSP operator in Lecture 3).</div>`;
                }
                draw();
              }),
          );
          draw();
        },
        bin(tb) {
          let L = 24,
            pm = 1 / 24,
            g = Array.from({ length: L }, () => randint(0, 1)),
            prev = null,
            ch = [];
          tb.innerHTML = `<p class="dim">Binary strings are k-ary with k = 2, so single-gene mutation is a <b>bit flip</b>. A common setup applies it to <i>each gene independently</i> with rate p<sub>m</sub>, often 1/L, which gives one flip per child on average.</p>
            <div class="controls" id="c"><button class="btn primary" data-op="m">Mutate</button><button class="btn" data-op="k">Mutate 1,000× and count flips</button></div><div id="out"></div><canvas class="viz" id="hist"></canvas>`;
          const sPm = N.slider("p<sub>m</sub> per gene", 0, 0.3, 0.005, pm, (x) => x.toFixed(3));
          sPm.onInput((x) => (pm = x));
          qs("#c", tb).prepend(sPm);
          const draw = () => {
            qs("#out", tb).innerHTML =
              (prev ? gRow("before", prev) : "") +
              gRow(prev ? "after" : "chromosome", g, (i) => (ch.includes(i) ? "changed" : "")) +
              `<p class="dim">Expected flips = L × p<sub>m</sub> = ${(L * pm).toFixed(2)}. ${prev ? `This time: <b>${ch.length}</b>.` : ""}</p>`;
          };
          qsa("[data-op]", tb).forEach(
            (b) =>
              (b.onclick = () => {
                if (b.dataset.op === "m") {
                  prev = [...g];
                  ch = [];
                  g = g.map((x, i) => {
                    if (rnd() < pm) {
                      ch.push(i);
                      return 1 - x;
                    }
                    return x;
                  });
                  draw();
                } else {
                  const c = new Array(11).fill(0);
                  for (let r = 0; r < 1000; r++) {
                    let n = 0;
                    for (let i = 0; i < L; i++) if (rnd() < pm) n++;
                    c[Math.min(10, n)]++;
                  }
                  N.barChart(qs("#hist", tb), {
                    groups: [{ values: c, color: N.colors().violet }],
                    labels: c.map((_, i) => (i === 10 ? "10+" : String(i))),
                    height: 160,
                    decimals: 0,
                  });
                }
              }),
          );
          draw();
        },
      };
      qsa("#tabs button", card).forEach((b) =>
        b.addEventListener("click", () => {
          qsa("#tabs button", card).forEach((x) => x.classList.toggle("on", x === b));
          TABS[b.dataset.t](qs("#tb", card));
        }),
      );
      TABS.kary(qs("#tb", card));
      root.appendChild(
        predict({
          id: "l4-mut-1",
          q: "The lecture asks about swap mutation on a k-ary encoding like 352872: <i>why is this probably not very good in this context?</i>",
          opts: [
            "It's too slow to compute on long strings of digits",
            "It can't introduce a value that isn't already there",
            "It produces invalid chromosomes with repeated values in them",
          ],
          a: 1,
          why: "In the water-distribution example, if no pipe currently has diameter 4, swapping can <b>never</b> create one. Swap preserves the multiset of values, which is exactly right for permutations (every value must appear once) and exactly wrong for k-ary, where any value can go anywhere.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Representations: integer/k-ary, binary, real-valued, permutations, trees. <b>Operators must match the representation.</b>",
            "k-ary: single-gene (random new value), M-gene. Swap is a poor fit because it never introduces new values.",
            "Real-valued: add Gaussian noise to one gene or add a small random vector. σ controls exploit vs explore.",
            "Permutation: single-gene mutation creates duplicates, so it's invalid. Swap keeps validity.",
          ],
          "Mutation has to match the encoding: random values for k-ary, Gaussian noise for reals, swaps for permutations.",
        ),
      );
    },
  });
})();
