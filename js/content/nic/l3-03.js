(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, TSP, randint, rnd } = N;

  /* ============ 3.4 Landscapes ============ */
  N.register({
    id: "l3-landscape",
    lecture: 3,
    order: 4,
    num: "3.4",
    title: "Fitness landscapes",
    blurb:
      "Drop a hillclimber on unimodal, multimodal, plateau, deceptive and random landscapes. Change the mutation step size.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Line the candidate solutions in <i>S</i> up along the x-axis so that <b>neighbours sit next to each other</b>, then plot fitness f(s) on the y-axis. The result is a <b>landscape</b>. The mutation operator decides who counts as a neighbour, so it shapes the landscape your algorithm actually experiences.",
        ),
      );
      const DESC = {
        unimodal: "<b>Unimodal</b>: one peak. Every uphill path leads to the global optimum, so HC always wins.",
        multimodal:
          "<b>Multimodal</b>: many peaks. HC climbs whichever hill it starts on. <i>Most real landscapes look like this: locally smooth, globally rugged.</i>",
        plateau:
          "<b>Plateau</b>: large flat regions give no gradient. HC wanders randomly (accepting equal moves) until it happens to reach a slope.",
        deceptive:
          "<b>Deceptive</b>: the slope points <i>away</i> from the global optimum. Following local improvement actively misleads you.",
        random:
          "<b>Random</b>: f(s) is a random number. Neighbours tell you nothing about each other, so HC is no better than random guessing.",
      };
      let kind = "multimodal",
        L = N.makeLandscape(kind),
        stepMax = 3,
        cur,
        trail,
        lastMut,
        lastOk,
        evals,
        running = null;
      const card =
        el(`<div class="card"><div class="controls" id="bar"></div><canvas class="viz" id="cv" style="cursor:crosshair"></canvas>
        <div class="legend"><span style="--c:var(--teal)">current solution</span><span style="--c:var(--violet)">accepted mutant</span><span style="--c:var(--rose)">rejected mutant</span><span style="--c:var(--amber)">global optimum</span></div>
        <p class="dim" id="desc" style="margin-top:10px"></p>
        <div class="controls" id="bar2"><button class="btn primary" id="climb">Climb</button><button class="btn" id="stepB">One step</button><button class="btn ghost" id="rs">Random start</button><span class="faint">…or click the landscape to place the climber</span></div>
        <div class="stat-row"><div class="stat"><small>Evaluations</small><b id="ev">0</b></div><div class="stat teal"><small>Current f</small><b id="cf">0</b></div><div class="stat amber"><small>Global max</small><b id="gm">0</b></div></div>
        <div class="card" style="background:var(--bg-2);margin:14px 0 0"><div class="card-head"><h3>Run 200 random restarts</h3><span class="faint">400 evaluations each</span></div>
          <div class="controls"><button class="btn" id="stats">Run experiment</button><span id="statOut" class="dim"></span></div></div></div>`);
      root.appendChild(card);
      const cv = qs("#cv", card);
      qs("#bar", card).appendChild(
        N.seg(
          Object.entries(N.LANDSCAPES).map(([k, v]) => [k, v.name]),
          kind,
          (v) => {
            kind = v;
            L = N.makeLandscape(kind);
            reset();
          },
        ),
      );
      const ss = N.slider("Max mutation step", 1, 240, 1, stepMax);
      ss.onInput((v) => (stepMax = v));
      qs("#bar2", card).prepend(ss);

      const mutate = (i) => N.clamp(i + (rnd() < 0.5 ? -1 : 1) * randint(1, stepMax), 0, L.N - 1);
      function reset(at) {
        stopRun();
        cur = at ?? randint(0, L.N - 1);
        trail = [cur];
        lastMut = null;
        evals = 1;
        draw();
      }
      function step() {
        const m = mutate(cur);
        evals++;
        lastMut = m;
        lastOk = L.f(m) >= L.f(cur);
        if (lastOk) {
          cur = m;
          trail.push(cur);
        }
        draw();
      }
      function draw() {
        const { ctx, w, h } = N.setupCanvas(cv, 300);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        const C = N.colors();
        ctx.strokeStyle = "rgba(206,130,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        trail.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(L.f(p)) - 2) : ctx.moveTo(X(p), Y(L.f(p)) - 2)));
        ctx.stroke();
        if (lastMut != null) {
          ctx.fillStyle = lastOk ? C.violet : C.rose;
          ctx.beginPath();
          ctx.arc(X(lastMut), Y(L.f(lastMut)), 5, 0, 7);
          ctx.fill();
          ctx.strokeStyle = lastOk ? C.violet : C.rose;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(X(lastMut), Y(L.f(lastMut)));
          ctx.lineTo(X(lastMut), h - 18);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = C.teal;
        ctx.strokeStyle = C.panel;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X(cur), Y(L.f(cur)), 8, 0, 7);
        ctx.fill();
        ctx.stroke();
        qs("#ev", card).textContent = evals;
        qs("#cf", card).textContent = L.f(cur).toFixed(3);
        qs("#gm", card).textContent = L.max.toFixed(3);
        qs("#desc", card).innerHTML = DESC[kind];
      }
      function stopRun() {
        if (running) {
          running();
          running = null;
          qs("#climb", card).textContent = "Climb";
          qs("#climb", card).classList.remove("on");
        }
      }
      qs("#climb", card).onclick = () => {
        if (running) return stopRun();
        qs("#climb", card).textContent = "Pause";
        qs("#climb", card).classList.add("on");
        running = life.interval(() => {
          step();
          if (evals >= 400) stopRun();
        }, 30);
      };
      qs("#stepB", card).onclick = step;
      qs("#rs", card).onclick = () => reset();
      cv.addEventListener("click", (e) => {
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left - 10) / (r.width - 20);
        reset(N.clamp(Math.round(x * (L.N - 1)), 0, L.N - 1));
      });
      qs("#stats", card).onclick = () => {
        let hits = 0,
          sum = 0;
        for (let r = 0; r < 200; r++) {
          let c = randint(0, L.N - 1);
          for (let e = 1; e < 400; e++) {
            const m = mutate(c);
            if (L.f(m) >= L.f(c)) c = m;
          }
          if (L.f(c) >= L.max - 1e-9) hits++;
          sum += L.f(c) / L.max;
        }
        qs("#statOut", card).innerHTML =
          `Found the global optimum in <b style="color:var(--teal-ink)">${Math.round(hits / 2)}%</b> of runs · mean final fitness <b>${Math.round(sum / 2)}%</b> of max <span class="faint">(${N.LANDSCAPES[kind].name}, max step ${stepMax})</span>`;
      };
      life.onResize(draw);
      reset();

      root.appendChild(
        el(
          `<div class="callout"><b>Try this sequence:</b> (1) Multimodal, step 3: run the experiment and note the success rate. (2) Set step to ~40 and rerun. (3) Set step to 240 (anywhere) and switch to Unimodal. What happened to locality?</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "l3-land-1",
          q: "On the <b>Random</b> landscape (f(s) is a random number generator), how does hillclimbing compare with random search?",
          opts: [
            "Much better, because it can still climb",
            "About the same, because neighbours tell you nothing",
            "Much worse, because it gets stuck immediately",
          ],
          a: 1,
          why: "HC works <i>only</i> because neighbours tend to have similar fitness (a locally smooth landscape). With no correlation between neighbours, a mutant is just a random sample, so no search method beats random guessing here.",
        }),
      );
      root.appendChild(
        predict({
          id: "l3-land-2",
          q: "You set the max mutation step to 240 (a mutant can be <i>anywhere</i>). On a realistic landscape, what goes wrong?",
          opts: [
            "Nothing: bigger jumps explore more, so it's strictly better",
            "The search becomes random sampling. Most of the space is poor",
            "HC can no longer accept moves",
          ],
          a: 1,
          why: "Lecture: <i>in large realistic problems the huge majority of the landscape has very poor fitness, and decent solutions concentrate in tiny areas. Big random changes are very likely to take us outside the good areas.</i> Small mutations exploit local smoothness.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Landscape = fitness plotted over the search space, with neighbours (under the mutation operator) placed next to each other.",
            "Small mutations → small fitness changes → the landscape is <b>locally smooth</b>. Real landscapes are locally smooth but <b>globally rugged</b> (multimodal).",
            "Feature types: <b>unimodal, multimodal, plateau, deceptive</b>. HC only reliably solves unimodal ones.",
            "Big mutations destroy locality and turn search into random sampling.",
          ],
          "The mutation operator defines the landscape: small steps make it locally smooth, but real landscapes are globally rugged.",
        ),
      );
    },
  });

  /* ============ 3.5 Neighbourhoods ============ */
  N.register({
    id: "l3-neighbourhood",
    lecture: 3,
    order: 5,
    num: "3.5",
    title: "Neighbourhoods",
    blurb:
      "Generate every mutant of a permutation or bitstring, and see how the operator decides what a local optimum is.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Given a mutation operator M, the <b>neighbourhood</b> of a solution s is the set of <b>all possible mutants</b> of s. It's the formal version of \"nearby\" in the landscape. Type your own strings below and compare with the lecture's two examples.",
        ),
      );
      const card = el(
        `<div class="card"><div class="tabs" id="tabs"><button data-t="perm" class="on">Permutation · adjacent swap</button><button data-t="bin">Binary · bit flip</button></div><div id="tb"></div></div>`,
      );
      root.appendChild(card);
      const gene = (ch, cls) => `<span class="gene ${cls}">${ch}</span>`;
      function renderTab(t) {
        const tb = qs("#tb", card);
        if (t === "perm") {
          tb.innerHTML = `<div class="controls"><label class="field">Permutation <input type="text" id="pi" value="EABDC" maxlength="12" style="width:160px;font-family:var(--mono)"></label><span class="faint">Lecture: neighbours of EABDC are {AEBDC, EBADC, EADBC, EABCD, CABDE}</span></div><div id="po"></div>`;
          const upd = () => {
            const s = qs("#pi", tb)
              .value.toUpperCase()
              .replace(/[^A-Z]/g, "");
            const valid = new Set(s).size === s.length && s.length >= 2;
            const isTsp = s.length === 5 && [...s].every((c) => "ABCDE".includes(c)) && valid;
            if (!valid) {
              qs("#po", tb).innerHTML =
                `<p style="color:var(--rose-ink)">Needs ≥2 distinct letters (a permutation has no repeats).</p>`;
              return;
            }
            const k = s.length;
            qs("#po", tb).innerHTML =
              `<div class="genome-row"><span class="lbl">s</span><span class="genome">${[...s].map((c) => gene(c, "")).join("")}</span>${isTsp ? `<span class="mono dim">length ${TSP.len(s)}</span>` : ""}</div>` +
              Array.from({ length: k }, (_, i) => {
                const j = (i + 1) % k;
                const n = TSP.swap(s, i);
                return `<div class="genome-row"><span class="lbl">swap ${i + 1}↔${j + 1}</span><span class="genome">${[...n].map((c, x) => gene(c, x === i || x === j ? "changed" : "")).join("")}</span>${isTsp ? `<span class="mono" style="color:${TSP.len(n) < TSP.len(s) ? "var(--teal)" : "var(--text-faint)"}">${TSP.len(n)}</span>` : ""}</div>`;
              }).join("") +
              `<p class="dim">Each individual has <b>k = ${k}</b> neighbours: ${k} adjacent pairs around the ring (the last swap wraps: position ${k} ↔ 1).</p>`;
          };
          qs("#pi", tb).addEventListener("input", upd);
          upd();
        } else {
          tb.innerHTML = `<div class="controls"><label class="field">Bitstring <input type="text" id="bi" value="00110" maxlength="16" style="width:160px;font-family:var(--mono)"></label><span class="faint">Lecture: neighbours of 00110 are {10110, 01110, 00010, 00100, 00111}</span></div><div id="bo"></div>`;
          const upd = () => {
            const s = qs("#bi", tb).value.replace(/[^01]/g, "");
            if (!s) {
              qs("#bo", tb).innerHTML = "";
              return;
            }
            qs("#bo", tb).innerHTML =
              `<div class="genome-row"><span class="lbl">s</span><span class="genome">${[...s].map((c) => gene(c, "")).join("")}</span></div>` +
              [...s]
                .map(
                  (_, i) =>
                    `<div class="genome-row"><span class="lbl">flip bit ${i + 1}</span><span class="genome">${[...s].map((c, x) => gene(x === i ? (c === "1" ? "0" : "1") : c, x === i ? "changed" : "")).join("")}</span></div>`,
                )
                .join("") +
              `<p class="dim">Each individual has <b>L = ${s.length}</b> neighbours. For L-item bin packing, "flip bit i" means moving item i to the other bin.</p>`;
          };
          qs("#bi", tb).addEventListener("input", upd);
          upd();
        }
      }
      qsa("#tabs button", card).forEach((b) =>
        b.addEventListener("click", () => {
          qsa("#tabs button", card).forEach((x) => x.classList.toggle("on", x === b));
          renderTab(b.dataset.t);
        }),
      );
      renderTab("perm");

      // 3-bit cube
      const cube =
        el(`<div class="card"><div class="card-head"><h2>The operator decides the local optima</h2><span class="tag amber">3-bit search space</span></div>
        <p class="dim">All 8 solutions of length 3. Lines connect neighbours under the chosen operator. A <b style="color:var(--amber-ink)">gold ring</b> marks a local optimum: no neighbour is strictly fitter.</p>
        <div class="controls" id="cb"></div><div class="grid side"><svg class="viz" id="cube" viewBox="0 0 420 330"></svg><div id="cinfo"></div></div></div>`);
      root.appendChild(cube);
      const FITS = {
        onemax: { n: "OneMax (count 1s)", f: (u) => u },
        trap: { n: "Trap (deceptive)", f: (u) => (u === 3 ? 3 : 2 - u) },
      };
      let fk = "trap",
        op = "1";
      qs("#cb", cube).append(
        N.seg(
          Object.entries(FITS).map(([k, v]) => [k, v.n]),
          fk,
          (v) => {
            fk = v;
            drawCube();
          },
        ),
        N.seg(
          [
            ["1", "flip exactly 1 bit"],
            ["12", "flip 1 or 2 bits"],
            ["any", "flip any bits"],
          ],
          op,
          (v) => {
            op = v;
            drawCube();
          },
        ),
      );
      const POS = {
        "000": [110, 250],
        100: [260, 250],
        "010": [110, 110],
        110: [260, 110],
        "001": [180, 290],
        101: [330, 290],
        "011": [180, 150],
        111: [330, 150],
      };
      function drawCube() {
        const S = Object.keys(POS),
          f = (s) => FITS[fk].f(s.split("").filter((b) => b === "1").length);
        const ham = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
        const isN = (a, b) => {
          const d = ham(a, b);
          return op === "1" ? d === 1 : op === "12" ? d >= 1 && d <= 2 : d >= 1;
        };
        const maxF = Math.max(...S.map(f));
        const lo = S.filter((s) => S.every((t) => !isN(s, t) || f(t) <= f(s)));
        const lines = [];
        S.forEach((a, i) =>
          S.slice(i + 1).forEach((b) => {
            if (isN(a, b))
              lines.push(
                `<line x1="${POS[a][0]}" y1="${POS[a][1]}" x2="${POS[b][0]}" y2="${POS[b][1]}" stroke="${ham(a, b) === 1 ? "var(--line-2)" : "rgba(206,130,255,0.35)"}" stroke-width="${ham(a, b) === 1 ? 2 : 1.2}" ${ham(a, b) > 1 ? 'stroke-dasharray="4 4"' : ""}/>`,
              );
          }),
        );
        qs("#cube", cube).innerHTML =
          lines.join("") +
          S.map((s) => {
            const v = f(s),
              t = v / maxF;
            return `<g>
          ${lo.includes(s) ? `<circle cx="${POS[s][0]}" cy="${POS[s][1]}" r="31" fill="none" stroke="var(--amber)" stroke-width="3"/>` : ""}
          <circle cx="${POS[s][0]}" cy="${POS[s][1]}" r="24" fill="rgba(88,204,2,${0.08 + t * 0.55})" stroke="var(--teal)" stroke-width="1.5"/>
          <text x="${POS[s][0]}" y="${POS[s][1] - 2}" text-anchor="middle" fill="var(--text)" font-size="13" font-family="var(--mono)" font-weight="700">${s}</text>
          <text x="${POS[s][0]}" y="${POS[s][1] + 13}" text-anchor="middle" fill="var(--text-dim)" font-size="11" font-family="var(--mono)">f=${v}</text></g>`;
          }).join("");
        const nCount = S.filter((t) => isN("000", t)).length;
        qs("#cinfo", cube).innerHTML =
          `<div class="stat-row"><div class="stat"><small>Neighbours each</small><b>${nCount}</b></div><div class="stat amber"><small>Local optima</small><b>${lo.length}</b></div></div>
          <p><b>Local optima:</b> <span class="mono">${lo.join(", ")}</span></p>
          <p class="dim">${fk === "trap" ? (op === "any" ? 'With every string as a neighbour, only the global optimum 111 is left. But the "neighbourhood" is now the whole space, so each step is as expensive as enumeration and there\'s no locality to exploit.' : "000 is a <b>trap</b>: every small move from it goes downhill, but the global optimum 111 is as far away as possible. A hillclimber starting near 000 is lured there.") : "OneMax is unimodal under bit-flip: every non-optimal string has a fitter neighbour, so HC always reaches 111."}</p>`;
      }
      drawCube();

      root.appendChild(
        predict({
          id: "l3-nb-1",
          q: "On the 3-bit cube, choose <b>flip 1 or 2 bits</b>. How many neighbours does <code>000</code> have?",
          opts: ["3", "6", "7"],
          a: 1,
          why: "A neighbour is any string 1 or 2 flips away: 3 single flips (001, 010, 100) plus 3 double flips (011, 101, 110) = <b>6</b>. Only 111 is left out (it needs 3 flips). Plain bit flip would give 3, and <i>flip any bits</i> gives all 7. The wider the operator, the bigger the neighbourhood.",
        }),
      );
      root.appendChild(
        takeaways([
          "Neighbourhood of s = the set of all mutants M(s). Permutation + adjacent swap: <b>k</b> neighbours. Bitstring + bit flip: <b>L</b> neighbours.",
          "Whether a point is a local optimum depends on the neighbourhood, so choosing the operator is a design decision.",
          "Bigger neighbourhoods → fewer local optima but less locality and more cost per step.",
        ]),
      );
    },
  });
})();
