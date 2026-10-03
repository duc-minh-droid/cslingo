(function () {
  const partScope = (NIC.shared.l4 = NIC.shared.l4 || {});
  const { PALETTE, SEL, fitnessInput } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, rnd } = N;

  /* ============ 4.4 Roulette ============ */
  N.register({
    id: "l4-roulette",
    lecture: 4,
    order: 4,
    num: "4.4",
    title: "Roulette wheel selection",
    blurb:
      "Spin a fitness-proportionate wheel. Then break it with superfit individuals, negative fitness, and minimisation.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          'The "grand old method": <b>fitness-proportionate selection</b>. With fitnesses f<sub>1</sub>…f<sub>P</sub>, individual i is chosen with probability <b>p<sub>i</sub> = f<sub>i</sub> / Σ<sub>k</sub> f<sub>k</sub></b>. That\'s the same as spinning a roulette wheel whose sectors are proportional to fitness.',
        ),
      );
      const card = el(`<div class="card"></div>`);
      root.appendChild(card);
      let f = [],
        rot = 0,
        counts = [],
        spinning = false;
      const getF = fitnessInput(card, (v) => {
        f = v;
        counts = new Array(f.length).fill(0);
        draw();
      });
      const body =
        el(`<div class="grid two"><div><canvas class="viz" id="wh" style="max-width:380px;margin:auto;background:transparent;border:0"></canvas>
          <div class="controls" style="justify-content:center"><button class="btn primary" id="spin">Spin</button><button class="btn" id="k">Spin 1,000× instantly</button><button class="btn ghost" id="clr">Clear counts</button></div><div id="res" style="text-align:center" class="dim"></div></div>
        <div><div id="warn"></div><table class="t" id="tb"></table><h3 style="margin-top:14px">Observed vs expected</h3><canvas class="viz" id="hist"></canvas><div class="legend"><span style="--c:var(--line-2)">expected p</span><span style="--c:var(--teal)">observed share</span></div></div></div>`);
      card.appendChild(body);
      f = getF();
      counts = new Array(f.length).fill(0);
      function probs() {
        return SEL.rouletteProbs(f);
      }
      function draw(hl = -1) {
        const p = probs();
        const cv = qs("#wh", card);
        const { ctx, w, h } = N.setupCanvas(cv, 330);
        const cx = w / 2,
          cy = h / 2 + 6,
          R = Math.max(1, Math.min(w, h) / 2 - 16);
        if (w < 40) return; // not laid out yet (e.g. detached while the lesson player moves it)
        ctx.clearRect(0, 0, w, h);
        if (!p) {
          ctx.fillStyle = N.colors().rose;
          ctx.font = "600 15px " + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = "center";
          ctx.fillText("Can't build a wheel:", cx, cy - 10);
          ctx.fillText("a sector can't have negative size", cx, cy + 14);
        } else {
          let a = rot - Math.PI / 2;
          p.forEach((pi, i) => {
            const a2 = a + pi * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, R, a, a2);
            ctx.closePath();
            ctx.fillStyle = PALETTE[i % PALETTE.length] + (hl === -1 || hl === i ? "ee" : "44");
            ctx.fill();
            ctx.strokeStyle = NIC.colors().panel;
            ctx.lineWidth = 2;
            ctx.stroke();
            if (pi > 0.035) {
              const m = (a + a2) / 2;
              ctx.fillStyle = "#fff";
              ctx.font = "800 12px " + getComputedStyle(document.body).fontFamily;
              ctx.textAlign = "center";
              ctx.fillText("f" + (i + 1), cx + Math.cos(m) * R * 0.68, cy + Math.sin(m) * R * 0.68 + 4);
            }
            a = a2;
          });
          ctx.beginPath();
          ctx.arc(cx, cy, 16, 0, 7);
          ctx.fillStyle = NIC.colors().panel;
          ctx.fill();
        }
        ctx.fillStyle = N.colors().text;
        ctx.beginPath();
        ctx.moveTo(cx - 10, 4);
        ctx.lineTo(cx + 10, 4);
        ctx.lineTo(cx, 22);
        ctx.closePath();
        ctx.fill();
        const tot = counts.reduce((a, b) => a + b, 0);
        qs("#warn", card).innerHTML = !p
          ? `<div class="callout rose"><b>Negative fitness breaks roulette.</b> A probability can't be negative. You'd have to shift or rescale fitness first, and the choice of shift changes the selection behaviour completely.</div>`
          : Math.max(...p) > 0.9
            ? `<div class="callout rose"><b>Superfit problem:</b> one individual takes ${Math.round(Math.max(...p) * 100)}% of the wheel, more than all the rest put together. It will take over the population almost immediately. Try the "Superfit + 100" preset.</div>`
            : "";
        qs("#tb", card).innerHTML =
          `<tr><th>i</th><th class="num">f<sub>i</sub></th><th class="num">p<sub>i</sub> = f<sub>i</sub>/Σf</th><th class="num">Picked</th></tr>` +
          f
            .map(
              (x, i) =>
                `<tr class="${hl === i ? "hl" : ""}"><td><span style="color:${PALETTE[i % PALETTE.length]}">■</span> ${i + 1}</td><td class="num">${x}</td><td class="num">${p ? (p[i] * 100).toFixed(1) + "%" : "—"}</td><td class="num">${counts[i] || 0}</td></tr>`,
            )
            .join("") +
          (p
            ? `<tr><td class="faint">Σ</td><td class="num">${+f.reduce((a, b) => a + b, 0).toFixed(3)}</td><td class="num">100%</td><td class="num">${tot}</td></tr>`
            : "");
        if (p)
          N.barChart(qs("#hist", card), {
            groups: [
              { values: p, color: N.colors().line_2 },
              { values: tot ? counts.map((c) => c / tot) : p.map(() => 0), color: N.colors().teal },
            ],
            labels: f.map((_, i) => "f" + (i + 1)),
            height: 160,
            yMax: Math.max(...p, ...(tot ? counts.map((c) => c / tot) : [0])) * 1.1,
          });
      }
      qs("#spin", card).onclick = () => {
        const p = probs();
        if (!p || spinning) return;
        spinning = true;
        const target = SEL.sample(p);
        const start = p.slice(0, target).reduce((a, b) => a + b, 0),
          mid = start + p[target] * (0.2 + 0.6 * rnd());
        const from = rot,
          to = rot - (rot % (Math.PI * 2)) + Math.PI * 2 * 5 + (Math.PI * 2 - mid * Math.PI * 2);
        const t0 = performance.now(),
          D = 2200;
        const ease = (x) => 1 - Math.pow(1 - x, 4);
        const tick = (now) => {
          const x = Math.min(1, (now - t0) / D);
          rot = from + (to - from) * ease(x);
          draw();
          if (x < 1) life.frame(tick);
          else {
            counts[target]++;
            draw(target);
            qs("#res", card).innerHTML =
              `Selected <b style="color:${PALETTE[target % PALETTE.length]}">individual ${target + 1}</b> (f=${f[target]}, p=${(p[target] * 100).toFixed(1)}%)`;
            spinning = false;
          }
        };
        life.frame(tick);
      };
      qs("#k", card).onclick = () => {
        const p = probs();
        if (!p) return;
        for (let i = 0; i < 1000; i++) counts[SEL.sample(p)]++;
        draw();
      };
      qs("#clr", card).onclick = () => {
        counts = new Array(f.length).fill(0);
        draw();
      };
      life.onResize(() => draw());
      draw();

      root.appendChild(
        predict({
          id: "l4-rw-1",
          q: "Load the <b>TSP lengths</b> preset (32, 33, 32, 34, 28), where shorter is better. What does roulette selection do?",
          opts: [
            "Favours the 28 tour strongly, since it's clearly the best",
            "Slightly favours the longest tours: the wrong way round",
            "Refuses to run, because roulette can't handle minimisation",
          ],
          a: 1,
          why: "Roulette assumes <b>bigger = better</b>. With raw lengths, 34 gets the biggest slice. You'd need to transform the values (e.g. 1/length or max − length), and each transform gives different pressure. The spread is also tiny (28 vs 34 is only 18.9% vs 22.9%), so pressure is weak however you flip it.",
        }),
      );
      root.appendChild(
        predict({
          id: "l4-rw-2",
          q: "Population fitnesses 100, 0.4, 0.3, 0.2, 0.1. Add 100 to every fitness. What happens to selection?",
          opts: [
            "Nothing changes, because the ranking is the same",
            "The superfit individual drops from ≈99% to ≈33%",
            "The superfit individual becomes even more dominant",
          ],
          a: 1,
          why: "Roulette depends on <b>absolute</b> fitness values, not just the order. 200/(200+100.4+100.3+100.2+100.1) = 200/601 ≈ 33%. The lecture's take-home message: <i>fitness-proportionate selection requires us to be very careful how we design the fine detail of fitness assignment.</i>",
        }),
      );
      root.appendChild(
        takeaways(
          [
            'p<sub>i</sub> = f<sub>i</sub> / Σf. Simple and "fair", and still widely used.',
            "Breaks for <b>minimisation</b> and <b>negative</b> fitness, and is hijacked by <b>superfit</b> individuals.",
            "Depends on absolute values: shifting all fitnesses by a constant changes the selection pressure.",
          ],
          "Roulette selection picks in proportion to raw fitness, so it's sensitive to scale, shifts, negatives and superfit outliers.",
        ),
      );
    },
  });

  /* ============ 4.5 Rank ============ */
  N.register({
    id: "l4-rank",
    lecture: 4,
    order: 5,
    num: "4.5",
    title: "Rank-based selection",
    blurb: "Throw away raw fitness values and keep only the order. Tune the bias with rank^b.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Sort the population and give the fittest rank <b>P</b> (popsize) down to rank <b>1</b> for the least fit. Selection probability is proportional to rank: <b>p<sub>i</sub> = rank<sub>i</sub> / F</b>, where <b>F = P(P+1)/2</b>. Variants use a function of rank. The lecture shows <b>rank<sup>0.5</sup></b> (low bias) and <b>rank<sup>2</sup></b> (high bias).",
        ),
      );
      const card = el(`<div class="card"></div>`);
      root.appendChild(card);
      let f = [],
        b = 1,
        minimise = false;
      const getF = fitnessInput(card, (v, k) => {
        f = v;
        if (k === "tsp") {
          minimise = true;
          qs("#mm input", card).checked = true;
        }
        draw();
      });
      f = getF();
      const body =
        el(`<div><div class="controls" id="b1"></div><div class="grid two"><div><table class="t" id="tb"></table></div>
        <div><canvas class="viz" id="bc"></canvas><div class="legend"><span style="--c:var(--line-2)">roulette p</span><span style="--c:var(--teal)">rank p (current bias)</span></div><div id="note" class="dim" style="margin-top:8px"></div></div></div></div>`);
      card.appendChild(body);
      const sB = N.slider("Bias exponent b (rank<sup>b</sup>)", 0, 3, 0.05, b, (v) => v.toFixed(2));
      sB.onInput((v) => {
        b = v;
        draw();
      });
      const mm = el(`<label class="field" id="mm"><input type="checkbox"> minimise (lower value = better)</label>`);
      qs("input", mm).onchange = (e) => {
        minimise = e.target.checked;
        draw();
      };
      const presetsB = N.seg(
        [
          ["0.5", "low bias 0.5"],
          ["1", "linear 1"],
          ["2", "high bias 2"],
        ],
        "1",
        (v) => {
          b = +v;
          sB.value = b;
          draw();
        },
      );
      qs("#b1", card).append(sB, presetsB, mm);
      function draw() {
        if (!f.length) return;
        const r = SEL.ranks(f, minimise),
          p = SEL.rankProbs(f, b, minimise),
          rp = SEL.rouletteProbs(f);
        const Pn = f.length;
        qs("#tb", card).innerHTML =
          `<tr><th>i</th><th class="num">f<sub>i</sub></th><th class="num">rank</th><th class="num">rank<sup>${b.toFixed(2)}</sup></th><th class="num">p (rank)</th><th class="num">p (roulette)</th></tr>` +
          f
            .map(
              (x, i) =>
                `<tr><td>${i + 1}</td><td class="num">${x}</td><td class="num">${r[i]}</td><td class="num">${(r[i] ** b).toFixed(2)}</td><td class="num" style="color:var(--teal)">${(p[i] * 100).toFixed(1)}%</td><td class="num faint">${rp && !minimise ? (rp[i] * 100).toFixed(1) + "%" : "—"}</td></tr>`,
            )
            .join("");
        const C = N.colors();
        N.barChart(qs("#bc", card), {
          groups: [
            { values: rp && !minimise ? rp : p.map(() => 0), color: C.line_2 },
            { values: p, color: C.teal },
          ],
          labels: f.map((_, i) => "f" + (i + 1)),
          height: 220,
        });
        qs("#note", card).innerHTML =
          `P = ${Pn}, so for b = 1: F = P(P+1)/2 = <b>${(Pn * (Pn + 1)) / 2}</b>. Best gets ${Pn}/${(Pn * (Pn + 1)) / 2} = ${((2 / (Pn + 1)) * 100).toFixed(1)}%. ${b === 0 ? "<b>b = 0 → every rank weight is 1 → uniform random selection (zero pressure).</b>" : ""}`;
      }
      draw();
      root.appendChild(
        predict({
          id: "l4-rank-1",
          q: "Superfit population 100, 0.4, 0.3, 0.2, 0.1 with <b>linear</b> rank selection. What's the best individual's selection probability?",
          opts: ["≈ 99%", "5/15 ≈ 33%", "1/5 = 20%", "It depends on how much bigger 100 is"],
          a: 1,
          why: "Ranks are 5,4,3,2,1 and F = 5·6/2 = 15, so p = 5/15 = <b>33.3%</b>. Rank selection ignores how much fitter the superfit individual is, only that it's first. The same holds for negative values and for minimisation (just rank the other way).",
        }),
      );
      root.appendChild(
        predict({
          id: "l4-rank-2",
          q: "What does increasing the exponent b in rank<sup>b</sup> do?",
          opts: ["Lowers selection pressure", "Raises selection pressure", "Nothing, since ranks are fixed"],
          a: 1,
          why: 'Larger b stretches the gap between high and low ranks: b=2 is the lecture\'s "high bias", b=0.5 "low bias", and b=0 is uniform random. So b is a <b>pressure dial</b> that doesn\'t depend on the raw fitness scale.',
        }),
      );
      root.appendChild(
        takeaways([
          "Rank from P (best) down to 1 (worst). p<sub>i</sub> = rank<sub>i</sub> / (P(P+1)/2).",
          "Immune to superfit individuals, negative values and scale. Minimisation just means ranking the other way.",
          "rank<sup>b</sup> tunes the bias: 0.5 low, 1 linear, 2 high. It needs a sort, so O(P log P) per generation.",
        ]),
      );
    },
  });
})();
