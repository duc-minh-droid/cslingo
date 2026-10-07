/* Lecture 2 video, scene 06-constraint: add the rule "at most 2 cables per town" and the same greedy method (Prim) gets
   stuck at 20 while a tree costing 19 exists. Local seconds: 0-0.8 the scene 5 picture (green tree, 18), 0.8-1.6 rule card and
   slot dots (C overflows), 1.9-2.6 tree fades and the cost counts to 0, 3.0-8.4 four greedy steps (blocked cables get a red
   cross), 8.4 cost 20 red, 9.0-10.8 the path D-A-C-E-B draws, cost 19 green, 10.9 "hard" tag. */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E, lerp } = V;

  // ---------- data (all from the helpers) ----------
  const PRE = L2.prim(0).tree; // the scene 5 tree, cost 18
  const RUN = L2.prim(2);
  const STEPS = RUN.steps;
  const PATH = [...L2.PATH].slice(1).map((c, i) => ({ key: L2.edgeKey(L2.PATH[i], c), from: L2.PATH[i] }));
  const PRE_COST = L2.cost(PRE);
  const GREEDY = RUN.cost;
  const BEST = L2.bruteTrees(2).best.cost;
  if (GREEDY !== 20 || BEST !== 19 || PRE_COST !== 18) throw new Error("scene 6: numbers changed");
  const GREEDY_KEYS = new Set(RUN.tree);

  // ---------- timeline ----------
  const FADE = [1.9, 2.6];
  const S0 = [3.0, 4.0, 5.0, 6.9]; // step starts
  const PICK_AT = [0.2, 0.2, 0.9, 0.8]; // seconds into the step when the cheapest feasible cable is chosen
  const FLY = 0.45; // weight flight time, starts 0.2 after the pick
  const PICK = S0.map((s, i) => s + PICK_AT[i]);
  const LAND = PICK.map((p) => p + 0.2 + FLY);
  const REVEAL = 9.0;
  const DRAW = PATH.map((_, i) => 9.2 + 0.4 * i);

  const cardsOnly = (t) => t;
  void cardsOnly;

  // the grey-out of a green cable: smaller and fainter, then plain grey
  const fadeStyle = (p) => (p < 0.55 ? { tone: "green", w: lerp(12, 5, p / 0.55), dim: p / 0.55, pill: "green" } : {});

  // cost shown at time t, and the tone of the card
  function costAt(t) {
    if (t < FADE[0]) return PRE_COST;
    if (t < FADE[1]) return Math.round(PRE_COST * (1 - ramp(t, FADE[0], FADE[1], E.lin)));
    let v = 0;
    STEPS.forEach((s, i) => {
      if (t >= LAND[i]) v = s.total;
    });
    if (t >= DRAW[3] + 0.4) v = BEST;
    return v;
  }

  // the picture of one cable at time t: its style and how much "cable" it counts for at its towns (0..1)
  function cable(key, t) {
    let st = {};
    let pres = 0;
    if (t < FADE[1]) {
      if (PRE.includes(key)) {
        const p = ramp(t, FADE[0], FADE[1], E.lin);
        st = t < FADE[0] ? { tone: "green", pill: "green" } : fadeStyle(p);
        pres = 1 - p;
      }
      return { st, pres };
    }
    // greedy run
    STEPS.forEach((s, i) => {
      const u = t - S0[i];
      const dur = (S0[i + 1] ?? REVEAL) - S0[i];
      if (u < 0) return;
      if (s.pick === key && t >= PICK[i]) {
        const q = clamp((t - PICK[i]) / 0.3);
        st = { tone: "green", pill: "green", pulse: flash(t, PICK[i], PICK[i] + 0.3) };
        pres = Math.max(pres, ramp(t, PICK[i], PICK[i] + 0.3, E.lin));
        void q;
      } else if (u < dur && t < PICK[i] && s.candKeys.includes(key)) {
        const isBlocked = s.blocked.includes(key);
        const b = isBlocked ? ramp(u, 0.2, 0.45, E.out) : 0;
        st = { tone: "orange", w: 8, pill: "orange", blocked: b };
      } else if (u < dur && t >= PICK[i] && s.blocked.includes(key) && !GREEDY_KEYS.has(key)) {
        const b = 1 - ramp(t, PICK[i], PICK[i] + 0.2, E.lin);
        if (b > 0.01) st = { tone: "orange", w: 8, blocked: b };
      }
    });
    if (t >= REVEAL) {
      const q = ramp(t, REVEAL, REVEAL + 0.4, E.lin);
      if (GREEDY_KEYS.has(key)) {
        st = fadeStyle(q);
        pres = 1 - q;
      }
      const j = PATH.findIndex((p) => p.key === key);
      if (j >= 0) {
        const k = ramp(t, DRAW[j], DRAW[j] + 0.4, E.lin);
        if (k > 0.001) {
          st = { tone: "green", pill: "green", k, from: PATH[j].from, pulse: flash(t, DRAW[j] + 0.3, DRAW[j] + 0.6) };
          pres = k;
        }
      }
    }
    return { st, pres };
  }

  V.scene({
    kicker: "ITS HARD COUSIN",
    title: ["Add one rule and", "greedy gets stuck"],
    dur: 12,
    caps: [
      [0.3, 2.5, "New rule: at most 2 cables per town."],
      [3.0, 5.4, "Run the same greedy method again."],
      [5.6, 8.6, "An early cheap choice blocks cheaper ones later."],
      [9.2, 11.5, "Greedy gets 20, but a tree costing 19 exists."],
    ],
    build(stage) {
      const g = L2.graph(stage, { x: 0, y: 24 });
      const ruleCard = V.h(
        "div",
        { class: "v-card c-orange", style: { left: "680px", top: "0", width: "244px", height: "110px" } },
        V.h("div", {
          text: "at most 2",
          style: { position: "absolute", left: "0", right: "0", top: "14px", textAlign: "center", fontSize: "30px", lineHeight: "40px", fontWeight: "900" },
        }),
        V.h("div", {
          text: "cables per town",
          style: { position: "absolute", left: "0", right: "0", top: "52px", textAlign: "center", fontSize: "30px", lineHeight: "40px", fontWeight: "900" },
        }),
      );
      stage.append(ruleCard);
      const cost = L2.costCard(stage, { x: 680, y: 130, w: 244, h: 150, label: "cost" });
      const greedyTag = L2.tag(stage, { text: `greedy ${GREEDY}`, tone: "red", solid: true, x: 680, y: 310, size: 30 });
      const bestTag = L2.tag(stage, { text: `best ${BEST}`, tone: "green", solid: true, x: 680, y: 372, size: 30 });
      const hardTag = L2.tag(stage, { text: "hard: no fast exact method", tone: "red", solid: true, x: 468, y: 590, size: 34, anchor: "c" });
      const flyers = STEPS.map((s) => L2.tag(stage, { text: String(s.w), tone: "orange", solid: true, x: 0, y: 0, size: 30, anchor: "c" }));
      const nodesOrder = [...L2.TOWNS];

      return (t) => {
        const es = {};
        const deg = Object.fromEntries(nodesOrder.map((n) => [n, 0]));
        L2.G.edges.forEach(([a, b]) => {
          const key = a + b;
          const { st, pres } = cable(key, t);
          es[key] = st;
          deg[a] += pres;
          deg[b] += pres;
        });
        const slots = ramp(t, 1.0, 1.6, E.lin);
        // joined towns: green (A, the start, stays blue)
        const joined = (n) => {
          if (n === "A") return true;
          if (t < FADE[0] + 0.35) return true;
          if (t < REVEAL) return STEPS.some((s, i) => s.to === n && t >= PICK[i] + 0.1);
          return true;
        };
        const full = (n) => {
          if (t >= REVEAL + 0.4) return 0;
          let k = 0;
          STEPS.forEach((s, i) => {
            if (s.deg[n] >= 2 && (i === 0 || STEPS[i - 1].deg[n] < 2) && t >= PICK[i]) k = ramp(t, PICK[i], PICK[i] + 0.3, E.out);
          });
          return k * (1 - ramp(t, REVEAL, REVEAL + 0.4, E.lin));
        };
        const nodes = {};
        nodesOrder.forEach((n) => {
          nodes[n] = {
            tone: n === "A" ? "blue" : joined(n) ? "green" : undefined,
            ring: full(n),
            ringTone: "orange",
            deg: deg[n] * slots,
            limit: 2,
            slotsO: slots,
            pulse: n === "C" ? flash(t, 1.4, 1.8) : 0,
            flash: n === "C" ? flash(t, 1.45, 1.9) : 0,
          };
        });
        g.update({ k: 1, nodes, edges: es });

        // the rule card
        const rk = ramp(t, 0.8, 1.6, E.pop);
        V.place(ruleCard, { s: 0.6 + 0.4 * rk, o: clamp(rk * 4) });

        // cost card
        const lastLand = LAND.findIndex((l, i) => t >= l && (LAND[i + 1] === undefined || t < LAND[i + 1]));
        const landBump = lastLand >= 0 ? flash(t, LAND[lastLand], LAND[lastLand] + 0.3) : 0;
        const doneBump = flash(t, DRAW[3] + 0.4, DRAW[3] + 0.7);
        const tone = t >= DRAW[3] + 0.4 ? "green" : t >= 8.4 ? "red" : t < FADE[0] + 0.35 ? "green" : "grey";
        cost.update({ value: costAt(t), tone, bump: Math.max(landBump, flash(t, 8.4, 8.8), doneBump) });

        // weights flying to the cost card
        const to = cost.numberPt();
        flyers.forEach((f, i) => {
          const a = PICK[i] + 0.2;
          const k = ramp(t, a, a + FLY, E.inOut ?? E.out);
          const from = g.pill(STEPS[i].pick);
          const on = t >= a && t < a + FLY + 0.05;
          f.set({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), s: lerp(1.1, 0.8, k), o: on ? 1 : 0 });
        });

        // tags
        const tk = (at) => ramp(t, at, at + 0.4, E.pop);
        const pop = (tg, k) => tg.set({ s: 0.6 + 0.4 * k, o: clamp(k * 4) });
        pop(greedyTag, tk(8.4));
        pop(bestTag, tk(10.6));
        pop(hardTag, tk(10.9));
      };
    },
  });
  void L5;
})();
