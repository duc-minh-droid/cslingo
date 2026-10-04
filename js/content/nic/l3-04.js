(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd } = N;

  /* ============ 3.6 Local search ============ */
  N.register({
    id: "l3-local",
    lecture: 3,
    order: 6,
    num: "3.6",
    title: "Local search: Monte Carlo & Tabu",
    blurb:
      "Race hillclimbing against Monte Carlo search (accepts worse moves sometimes) and Tabu search (can't go back).",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "The lecture gives two ways to beat hillclimbing: <b>(1) allow downhill moves</b>, which is what the <i>local search</i> family does, or <b>(2) use a population</b>. This module covers (1). Local search keeps a current solution <i>and</i> a best-so-far, because the current solution can now get worse.",
        ),
      );
      root.appendChild(
        el(`<div class="grid two">
        <div class="card"><div class="card-head"><span class="tag amber">Monte Carlo search</span></div><div class="pseudo"><div>1. m ← random neighbour of c</div><div>2. if f(m) better: c ← m</div><div>   else: c ← m with probability p (e.g. 0.1)</div><div>   update best-so-far b</div></div></div>
        <div class="card"><div class="card-head"><span class="tag violet">Tabu search</span></div><div class="pseudo"><div>1. evaluate ALL neighbours of c</div><div>2. c ← best neighbour, even if worse,</div><div>   unless it's tabu (recently visited):</div><div>   then take the next best, etc.</div><div>   update best-so-far b</div></div></div></div>`),
      );
      let kind = "multimodal",
        L = N.makeLandscape(kind),
        r = 3,
        p = 0.1,
        T = 25,
        algs,
        running = null,
        tick = 0;
      const COL = { hc: "var(--teal)", mc: "var(--amber)", tabu: "var(--violet)" };
      function init() {
        const start = randint(0, L.N - 1);
        algs = {
          hc: { c: start, b: start, evals: 1, trail: [start] },
          mc: { c: start, b: start, evals: 1, trail: [start] },
          tabu: { c: start, b: start, evals: 1, trail: [start], list: [start] },
        };
        tick = 0;
        draw();
      }
      const nb = (c) => N.clamp(c + (rnd() < 0.5 ? -1 : 1) * randint(1, r), 0, L.N - 1);
      function stepAlg(k, a) {
        if (k === "hc") {
          const m = nb(a.c);
          a.evals++;
          if (L.f(m) >= L.f(a.c)) a.c = m;
        }
        if (k === "mc") {
          const m = nb(a.c);
          a.evals++;
          if (L.f(m) >= L.f(a.c) || rnd() < p) a.c = m;
        }
        if (k === "tabu") {
          const cands = [];
          for (let d = -r; d <= r; d++) {
            const m = a.c + d;
            if (d && m >= 0 && m < L.N) cands.push(m);
          }
          a.evals += cands.length;
          cands.sort((x, y) => L.f(y) - L.f(x));
          const pick = cands.find((m) => !a.list.includes(m)) ?? cands[0];
          a.c = pick;
          a.list.push(pick);
          if (a.list.length > T) a.list.shift();
        }
        if (L.f(a.c) > L.f(a.b)) a.b = a.c;
        a.trail.push(a.c);
        if (a.trail.length > 60) a.trail.shift();
      }
      const card =
        el(`<div class="card"><div class="controls" id="b1"></div><div class="controls" id="b2"></div><canvas class="viz" id="cv"></canvas>
        <div class="legend"><span style="--c:var(--teal)">Hillclimbing</span><span style="--c:var(--amber)">Monte Carlo</span><span style="--c:var(--violet)">Tabu</span><span style="--c:var(--text)">◆ = best-so-far</span></div>
        <div class="controls"><button class="btn primary" id="go">Run</button><button class="btn" id="st">Step</button><button class="btn ghost" id="rs">New start</button></div>
        <table class="t" id="tbl"></table>
        <div class="card" style="background:var(--bg-2);margin:14px 0 0"><div class="card-head"><h3>Race 300 times</h3><span class="faint">equal budget: 600 fitness evaluations each (Tabu spends 2r per step)</span></div>
        <div class="controls"><button class="btn" id="race">Run race</button></div><canvas class="viz" id="rc"></canvas><p class="dim" id="raceTxt"></p></div></div>`);
      root.appendChild(card);
      qs("#b1", card).appendChild(
        N.seg(
          Object.entries(N.LANDSCAPES)
            .filter(([k]) => k !== "random")
            .map(([k, v]) => [k, v.name]),
          kind,
          (v) => {
            kind = v;
            L = N.makeLandscape(kind);
            init();
          },
        ),
      );
      const sR = N.slider("Neighbourhood radius r", 1, 12, 1, r),
        sP = N.slider("MC accept-worse p", 0, 1, 0.01, p, (v) => v.toFixed(2)),
        sT = N.slider("Tabu tenure", 1, 80, 1, T);
      sR.onInput((v) => (r = v));
      sP.onInput((v) => (p = v));
      sT.onInput((v) => (T = v));
      qs("#b2", card).append(sR, sP, sT);
      function draw() {
        const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 300);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        const C = N.colors(),
          cmap = { hc: C.teal, mc: C.amber, tabu: C.violet };
        if (algs.tabu.list) {
          ctx.fillStyle = "rgba(206,130,255,0.18)";
          algs.tabu.list.forEach((m) => ctx.fillRect(X(m) - 1.5, h - 18, 3, 8));
        }
        Object.entries(algs).forEach(([k, a], idx) => {
          const off = (idx - 1) * 4;
          ctx.strokeStyle = cmap[k] + "88";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          a.trail.forEach((q, i) => (i ? ctx.lineTo(X(q), Y(L.f(q)) + off) : ctx.moveTo(X(q), Y(L.f(q)) + off)));
          ctx.stroke();
          ctx.fillStyle = cmap[k];
          ctx.beginPath();
          ctx.arc(X(a.c), Y(L.f(a.c)) + off, 7, 0, 7);
          ctx.fill();
          const bx = X(a.b),
            by = Y(L.f(a.b)) - 12 - idx * 9;
          ctx.beginPath();
          ctx.moveTo(bx, by - 4);
          ctx.lineTo(bx + 4, by);
          ctx.lineTo(bx, by + 4);
          ctx.lineTo(bx - 4, by);
          ctx.closePath();
          ctx.fill();
        });
        qs("#tbl", card).innerHTML =
          `<tr><th>Algorithm</th><th class="num">Evaluations</th><th class="num">Current f</th><th class="num">Best-so-far f</th><th class="num">% of global</th></tr>` +
          [
            ["hc", "Hillclimbing"],
            ["mc", "Monte Carlo"],
            ["tabu", "Tabu"],
          ]
            .map(
              ([k, n]) =>
                `<tr><td><span style="color:${COL[k]}">●</span> ${n}</td><td class="num">${algs[k].evals}</td><td class="num">${L.f(algs[k].c).toFixed(3)}</td><td class="num">${L.f(algs[k].b).toFixed(3)}</td><td class="num">${Math.round((100 * L.f(algs[k].b)) / L.max)}%</td></tr>`,
            )
            .join("");
      }
      const stepAll = () => {
        Object.entries(algs).forEach(([k, a]) => stepAlg(k, a));
        tick++;
        draw();
      };
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          stepAll();
          if (tick > 400) stop();
        }, 40);
      };
      qs("#st", card).onclick = stepAll;
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      qs("#race", card).onclick = () => {
        const res = { hc: 0, mc: 0, tabu: 0 },
          q = { hc: 0, mc: 0, tabu: 0 };
        for (let run = 0; run < 300; run++) {
          const s = randint(0, L.N - 1);
          ["hc", "mc", "tabu"].forEach((k) => {
            const a = { c: s, b: s, evals: 1, trail: [], list: [s] };
            while (a.evals < 600) stepAlg(k, a);
            if (L.f(a.b) >= L.max - 1e-9) res[k]++;
            q[k] += L.f(a.b) / L.max;
          });
        }
        const C = N.colors();
        N.barChart(qs("#rc", card), {
          groups: [
            {
              values: [res.hc, res.mc, res.tabu].map((v) => (100 * v) / 300),
              color: (i) => [C.teal, C.amber, C.violet][i],
            },
          ],
          labels: ["Hillclimbing", "Monte Carlo", "Tabu"],
          yMax: 100,
          height: 170,
          decimals: 0,
        });
        qs("#raceTxt", card).innerHTML =
          `% of runs where best-so-far hit the <b>global</b> optimum. Mean best as % of max: HC ${Math.round(q.hc / 3)}%, MC ${Math.round(q.mc / 3)}%, Tabu ${Math.round(q.tabu / 3)}%. <span class="faint">Change r, p, tenure and rerun.</span>`;
      };
      life.onResize(draw);
      init();

      root.appendChild(
        predict({
          id: "l3-ls-1",
          q: "Monte Carlo search with <b>p = 0.10</b> sits on a peak where every neighbour is worse. About how often does it step down?",
          opts: ["Never, it only accepts better moves", "About once every 10 tries", "On every try until it falls off"],
          a: 1,
          why: "p is the chance of accepting a worse neighbour on <b>each</b> try. At 0.10 that is 1 try in 10 on average, so it does leave the peak, but not at once. With p = 0 it would never leave (that is hillclimbing). The useful range is in between: enough downhill moves to escape small hills, not so many that you drift off good ones.",
        }),
      );
      root.appendChild(
        predict({
          id: "l3-ls-2",
          q: "Why does Tabu search need the tabu list at all? Without it, what happens at a local optimum?",
          opts: [
            "It stops, just like hillclimbing does",
            "It steps down, then climbs straight back up, forever",
            "It jumps to a random new area of the space",
          ],
          a: 1,
          why: "Tabu always moves to the best neighbour, even a worse one. From a peak the best move is one step down. From there the best move is back to the peak, so it <b>cycles</b>. Forbidding recently visited solutions forces it to keep walking away until it crosses into a new basin. Tenure has to be long enough to cover the width of a hill: try tenure 2 vs 60.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Local search = HC + a policy that sometimes accepts non-improving moves + a <b>best-so-far</b> record.",
            "<b>Monte Carlo</b>: random neighbour; accept worse with probability p.",
            "<b>Tabu</b>: evaluate all neighbours, take the best non-tabu one even if it's worse, and remember recent moves to avoid cycling.",
            "Both get stuck less than HC, but they <i>still</i> get stuck. That motivates populations.",
          ],
          "Local search escapes local optima by allowing downhill moves: Monte Carlo does it randomly, Tabu does it deliberately with memory.",
        ),
      );
    },
  });
})();
