/* l13-workshop: Lectures 13-14: the NSGA-II engine and its demo (13.3 looks it up at call time), and workshop 13.W, the wind farm trade-off lab (no code). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL13;
  const { C, pr, mulberry, pts, dom, ranks, crowdAll, fmtD, RC, frame, dot, joinLine, box, FARM, FARM_O } = sh;
  const S2 = [1, 1];

  // ---------- a small NSGA-II on a two-objective test problem: cost f1 and power shortfall f2, both minimised ----------
  const evalX = (x) => {
    const g = 1 + x[1] + x[2];
    return { x, g, f: [10 * x[0], 3 * g * (1 - Math.sqrt(x[0] / g))] };
  };
  const TRUE = Array.from({ length: 41 }, (_, i) => [i / 4, 3 * (1 - Math.sqrt(i / 40))]);
  function rankCrowd(P) {
    const V = P.map((p) => p.f),
      r = ranks(V, S2),
      d = crowdAll(V, r);
    P.forEach((p, i) => ((p.rank = r[i]), (p.cd = d[i])));
  }
  /** NSGA-II's crowded comparison: lower rank wins; on a tie, larger crowding distance wins. */
  const beats = (a, b) => (a.rank !== b.rank ? a.rank < b.rank : a.cd > b.cd);
  function nsInit(seed, n = 12) {
    const r = mulberry(seed),
      P = Array.from({ length: n }, () => evalX([r(), r(), r()]));
    rankCrowd(P);
    return { r, P, gen: 0, n };
  }
  /** One generation. Elitist: parents + children (2N) sorted by rank then crowding, best N kept. Non-elitist: the children replace the parents. */
  function nsGen(S, elitist) {
    const { r, P, n } = S;
    const tour = () => {
      const a = P[Math.floor(r() * n)],
        b = P[Math.floor(r() * n)];
      return beats(a, b) ? a : b;
    };
    const kids = Array.from({ length: n }, () => {
      const p = tour(),
        q = tour();
      return evalX(
        p.x.map((v, j) => {
          let c = v + (-0.25 + 1.5 * r()) * (q.x[j] - v);
          if (r() < 1 / 3) c += (r() + r() + r() - 1.5) * 0.15;
          return Math.min(1, Math.max(0, c));
        }),
      );
    });
    let next = kids;
    if (elitist) {
      const all = P.concat(kids);
      rankCrowd(all);
      next = all.sort((a, b) => a.rank - b.rank || b.cd - a.cd).slice(0, n);
    }
    rankCrowd(next);
    S.P = next;
    S.gen++;
    return S;
  }
  const nsStats = (S) => {
    const c = S.P.map((p) => p.f[0]);
    return { near: S.P.filter((p) => p.g - 1 < 0.05).length, lo: Math.min(...c), hi: Math.max(...c) };
  };
  const NS_AX = { xr: [0, 10], yr: [0, 6], xl: "cost ←", yl: "↓ power shortfall", ny: 3 };
  /** The NSGA-II sandbox. o: {onGen(S, mode)} */
  function nsgaDemo(root, life, o = {}) {
    let seed = 5,
      mode = "e",
      running = false,
      S = nsInit(seed);
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>${o.title || "Evolve a front"}</h2></div><div class="controls" data-c></div><div class="controls"><button class="btn primary" data-a="step">Step generation</button><button class="btn" data-a="run">Run</button><button class="btn ghost" data-a="reset">Reset</button></div><div data-p></div><p class="nw13-legend"><span class="nw13-k teal"></span>rank 0 now <span class="nw13-k blue"></span>rest of the population <span class="nw13-k dash"></span>true front</p><div class="nw13-stats" data-t></div></div>`,
    );
    root.appendChild(card);
    const fr = frame({ ...NS_AX, h: 300 });
    const draw = () => {
      qs("[data-p]", card).innerHTML = fr.wrap(
        joinLine(fr, TRUE, "line-2", "5 4") +
          S.P.map((p, i) =>
            dot(fr, i, [Math.min(10, p.f[0]), Math.min(6, p.f[1])], { c: p.rank ? "blue" : "teal", lab: false, r: 7 }),
          ).join(""),
        `Generation ${S.gen}: ${S.P.length} solutions, ${nsStats(S).near} close to the true front.`,
      );
      const t = nsStats(S);
      qs("[data-t]", card).innerHTML =
        `<div class="wk-stat"><small>Generation</small><b>${S.gen}</b></div><div class="wk-stat teal"><small>Near the true front</small><b>${t.near} of ${S.n}</b></div><div class="wk-stat blue"><small>Cost range covered</small><b>${t.lo.toFixed(1)} to ${t.hi.toFixed(1)}</b></div>`;
    };
    const go = () => {
      nsGen(S, mode === "e");
      draw();
      if (o.onGen) o.onGen(S, mode);
    };
    qs("[data-c]", card).append(
      N.seg(
        [
          ["e", "Elitist (NSGA-II)"],
          ["n", "Non-elitist"],
        ],
        "e",
        (v) => {
          mode = v;
          S = nsInit(seed);
          draw();
        },
      ),
    );
    const bt = (a) => qs(`[data-a="${a}"]`, card);
    bt("step").onclick = go;
    bt("run").onclick = () => {
      running = !running;
      bt("run").textContent = running ? "Pause" : "Run";
    };
    bt("reset").onclick = () => ((S = nsInit(++seed)), draw());
    life.interval(() => running && go(), 300);
    draw();
    return { state: () => S, mode: () => mode };
  }
  Object.assign(sh, { nsInit, nsGen, nsStats, nsgaDemo, beats });

  // ---------- 13.W workshop cards ----------
  /** Tap layouts to mark the front; the note says who dominates the layout just tapped. */
  function markBoard(stage, api) {
    const ids = Object.keys(FARM),
      V = ids.map((k) => FARM[k]),
      r = ranks(V, FARM_O.s),
      fr = frame(FARM_O);
    const truth = ids.filter((_, i) => r[i] === 0).sort();
    const mark = new Set();
    let last = null;
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>Layout board</h2></div><div class="controls"><button class="btn ghost" data-a="clr">Clear marks</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p></div>`,
    );
    stage.appendChild(card);
    const draw = () => {
      const under = last ? box(fr, FARM[last], FARM_O.s, false, "rose") : "";
      qs("[data-p]", card).innerHTML = fr.wrap(
        under + ids.map((k) => dot(fr, k, FARM[k], { c: mark.has(k) ? "teal" : "blue", ring: k === last })).join(""),
        `Eleven layouts by cost and power. Marked as front: ${[...mark].join(", ") || "none"}.`,
      );
      let say = "Tap a layout to mark or unmark it. The red box shows where a layout that beats it would sit.";
      if (last) {
        const i = ids.indexOf(last),
          by = ids.filter((_, j) => dom(V[j], V[i], FARM_O.s));
        say = `<b>${last}</b> (£${V[i][0]}m, ${V[i][1]} MW) is ${by.length ? `dominated by <b>${by.join(", ")}</b>` : "dominated by nobody"}.`;
      }
      qs("[data-n]", card).innerHTML = `${say} Marked: <b>${mark.size}</b>.`;
    };
    qs("[data-p]", card).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t) return;
      const k = t.dataset.id,
        i = ids.indexOf(k);
      last = k;
      if (mark.has(k)) mark.delete(k);
      else mark.add(k);
      draw();
      if (r[i] > 0) {
        api.say(`${k} is beaten on both objectives, so it cannot be on the front.`);
        api.done("beaten");
      }
      if ([...mark].sort().join() === truth.join()) {
        api.say(
          `That is the front: ${truth.join(", ")}. K made it even though it costs more than D, because it also makes more power.`,
          "happy",
        );
        api.done("front");
      }
    });
    qs("[data-a=clr]", card).onclick = () => (mark.clear(), (last = null), draw());
    draw();
  }

  /** NSGA-II survivor puzzle: 12 candidates (parents + children), keep N = 6. */
  const SURV = pts("A 1 8, B 3 4, C 7 1, D 2 9, E 3.5 6.5, F 4 5, G 8 3, H 5 7, I 6 8, J 9 6, K 7 7.5, L 9 9");
  function survivors(stage, api) {
    const ids = Object.keys(SURV),
      V = ids.map((k) => SURV[k]),
      r = ranks(V, S2),
      d = crowdAll(V, r);
    const order = ids.map((_, i) => i).sort((a, b) => r[a] - r[b] || d[b] - d[a]);
    const truth = order
      .slice(0, 6)
      .map((i) => ids[i])
      .sort();
    const pick = new Set();
    let showR = false,
      showD = false;
    const fr = frame({ xr: [0, 10], yr: [0, 10], xl: "f₁ ← minimise", yl: "↓ minimise f₂", h: 300 });
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>Pick the survivors: N = 6 from 12</h2></div><div class="controls"><button class="btn" data-a="r">Show ranks</button><button class="btn" data-a="d">Show crowding</button><button class="btn ghost" data-a="clr">Clear picks</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p></div>`,
    );
    stage.appendChild(card);
    const draw = () => {
      qs("[data-p]", card).innerHTML = fr.wrap(
        ids
          .map((k, i) =>
            dot(fr, k, V[i], {
              c: showR ? RC[r[i] % 5] : "blue",
              ring: pick.has(k),
              lab: `${k}${showR ? ` r${r[i]}` : ""}${showD ? ` ${fmtD(d[i])}` : ""}`,
            }),
          )
          .join(""),
        `Twelve candidates A to L, both objectives minimised. Picked: ${[...pick].join(", ") || "none"}.`,
      );
      let say = `Tap six survivors. Picked <b>${pick.size}</b> of 6.`;
      const mine = [...pick].sort();
      if (pick.size === 6 && mine.join() !== truth.join()) {
        const low = Math.max(...truth.map((k) => r[ids.indexOf(k)]));
        const bad = mine.find((k) => r[ids.indexOf(k)] > low);
        say += bad
          ? ` Not yet: <b>${bad}</b> is rank ${r[ids.indexOf(bad)]}, but rank ${low} still has room.`
          : " Not yet: the ranks are right, but in the last rank keep the larger crowding distances.";
      }
      qs("[data-n]", card).innerHTML = say;
    };
    qs("[data-p]", card).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t) return;
      const k = t.dataset.id;
      if (pick.has(k)) pick.delete(k);
      else if (pick.size < 6) pick.add(k);
      draw();
      if ([...pick].sort().join() === truth.join()) {
        api.say(
          "Rank 0 (A, B, C) fits whole. Rank 1 has four members for three places: D and G are ends (∞), and F's 1.33 beats E's 1.00.",
          "happy",
        );
        api.done("survivors");
      }
    });
    const tg = (a, f) =>
      (qs(`[data-a=${a}]`, card).onclick = (e) => {
        f();
        e.target.classList.toggle("primary");
        draw();
      });
    tg("r", () => (showR = !showR));
    tg("d", () => (showD = !showD));
    qs("[data-a=clr]", card).onclick = () => (pick.clear(), draw());
    draw();
  }

  function build(stage, api, life) {
    markBoard(stage, api);
    const wc = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>Weight dial: one weighted sum per run</h2></div><div data-box></div></div>`,
    );
    stage.appendChild(wc);
    sh.wsFig(qs("[data-box]", wc), life, {
      ...FARM_O,
      label: "Weight on cost",
      onW: (w, id, seen, miss) => {
        if (miss.length === 1 && miss[0] === "K") {
          api.say(
            "Every weight picks A, B, C, D or E. K is on the front, yet no straight line reaches it: it sits in a dent.",
            "surprised",
          );
          api.done("sweep");
        }
      },
    });
    survivors(stage, api);
    nsgaDemo(stage, life, {
      title: "Evolve a front",
      onGen: (S, mode) => {
        const t = nsStats(S);
        if (mode === "e" && t.near >= 10 && t.hi - t.lo >= 8) {
          api.say(
            `Generation ${S.gen}: ${t.near} of 12 near the front, covering costs ${t.lo.toFixed(1)} to ${t.hi.toFixed(1)}. Close and spread: both goals met.`,
            "happy",
          );
          api.done("evolve");
        }
      },
    });
  }

  N.register({
    id: "l13-wlab",
    lecture: 13,
    order: 90,
    num: "13.W",
    workshop: true,
    title: "Workshop: wind farm trade-off lab",
    blurb: "No code. Mark the Pareto front, sweep a weighted sum, pick NSGA-II survivors and evolve a front.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Four cards: a <b>layout board</b>, a <b>weight dial</b>, a <b>survivor puzzle</b> and a small <b>NSGA-II</b>. On the layouts, lower cost is better and higher power is better.",
        missions: [
          {
            id: "beaten",
            t: "Find a beaten layout",
            d: "On the layout board, tap a layout that another layout dominates.",
            hint: "Look for a layout with another one up and to the left of it: cheaper and more powerful.",
          },
          {
            id: "front",
            t: "Mark the front",
            d: "Mark exactly the layouts on the Pareto front (tap to mark, tap again to unmark).",
            hint: "A layout belongs if no other layout is at least as cheap and at least as powerful, and better on one. Six layouts qualify.",
          },
          {
            id: "sweep",
            t: "Sweep the weight",
            d: "Slide <b>Weight on cost</b> through its range until every front layout a weighted sum can reach has been picked.",
            hint: "Go slowly from 0 to 1. Watch the green list grow, and see which front layout stays purple.",
          },
          {
            id: "survivors",
            t: "Pick the survivors",
            d: "Tap the 6 candidates NSGA-II would keep from the 12.",
            hint: "Press <b>Show ranks</b>: take whole ranks while they fit. Then press <b>Show crowding</b> and fill the rest with the largest distances.",
          },
          {
            id: "evolve",
            t: "Evolve a front",
            d: "In <b>Elitist (NSGA-II)</b> mode, reach 10 or more solutions <b>Near the true front</b> with a <b>Cost range covered</b> at least 8 wide.",
            hint: "Press <b>Run</b> and wait 30 to 40 generations. If it stalls, press <b>Reset</b> and run again.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l13-wlab-1",
          "On the weight dial, K is never picked at any weight. What would find K? | A dominance-based method such as NSGA-II | The weighted sum again with a weight of exactly 0.5 | Removing D and E so that K becomes the cheapest | K lies in a dent of the front, so no weighting reaches it. A dominance-based MOEA keeps every non-dominated layout, K included.",
        ),
      );
      root.appendChild(
        pr(
          "l13-wlab-2",
          "In the survivor puzzle, why does F survive while E is dropped, though both are rank 1? | F has the larger crowding distance, 1.33 against 1.00 | F has the lower rank, since it lies closer to rank 0 | F was a parent while E was only a child | Both are rank 1, so crowding decides: F sits in an emptier stretch of its front.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A layout is on the <b>Pareto front</b> when nothing beats it on both cost and power; a pricier layout can still be on it.",
            "A <b>weighted sum</b> finds one point per weighting and misses points in dents of the front.",
            "NSGA-II keeps whole ranks while they fit, then uses <b>crowding distance</b> on the rank that overflows.",
            "<b>Elitism</b> keeps the best of parents and children, so a run converges and spreads along the front.",
          ],
          "Dominance finds the whole front; weights find one point at a time.",
        ),
      );
    },
  });

  L["l13-wlab"] = {
    sum: "Mark a wind farm Pareto front, watch a weighted sum miss a front layout, pick NSGA-II survivors by rank and crowding, and evolve a front with an elitist GA.",
    steps: [
      {
        t: "The lab",
        b: `<p>Four cards. The <b>layout board</b> shows eleven wind farm layouts by cost and power: tap to mark the front. The <b>weight dial</b> runs a weighted sum, one weighting at a time. The <b>survivor puzzle</b> asks you to fill an NSGA-II generation. The last card <b>evolves</b> a front.</p>`,
        v: F.flow(["Mark the front", "Sweep a weighted sum", "Pick survivors", { t: "Evolve a front", c: "teal" }]),
        c: C(
          "Layout X costs £30m and makes 50 MW. Layout Y costs £30m and makes 45 MW. Which statement is right? | X dominates Y: equal cost and more power | Y dominates X: equal cost and a lower output | Neither dominates, because their costs are equal | A tie on cost is fine: X is at least as good on both and strictly better on power.",
        ),
      },
      {
        t: "How NSGA-II fills a generation",
        b: `<p>Merge parents and children. Take <b>whole ranks</b> in order while they fit. When a rank is too big for the places left, keep its members with the <b>largest crowding distance</b>; the ends of a front count as ∞.</p>`,
        v: F.flow([
          "Merge parents and children (2N)",
          "Sort into ranks",
          "Take whole ranks",
          { t: "Split the last by crowding", c: "violet" },
        ]),
        c: C(
          "N = 6. The 12 candidates fall into ranks of size 2, 3, 4 and 3. How many rank 2 candidates survive? | 1 | 4 | 3 | Ranks 0 and 1 take 2 + 3 = 5 places, so one place is left for rank 2, settled by crowding distance.",
        ),
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
