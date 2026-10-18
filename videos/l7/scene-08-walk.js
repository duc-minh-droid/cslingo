/* Lecture 7 · scene-08-walk: ACO turns the bridge into a graph. On the four-town round an ant at a town gives every UNVISITED town a
   weight = pheromone / distance, turns the weights into chances, picks with the dice and keeps a tour memory so it never repeats a
   town. One worked walk, the lesson's story ant: A-C-B-D and home, length 18 (L7.WALK, L7.MAP, asserted below).
   Local seconds: 0.2-1.3 map, ant on A, memory tag + tile A; 1.8-4.8 step 1 (rows, weights, chances, total); 4.7-5.9 dice, pick;
   6.0-6.8 hop to C; 7.0-9.9 step 2 (B or D, pick B, hop 9.1-9.9); 10.1-11.4 step 3 (only D is left, hop 10.7-11.4); 11.6-12.4 home to A;
   12.5-13.2 the tour length 4 + 6 + 3 + 5 = 18; hold. Scene 9 starts from this picture (the same map at x 0, y 20). */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const E = V.ease;
  const { ramp, clamp, flash } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);

  // ---------- facts (asserted: a wrong number throws) ----------
  const W = L7.WALK;
  const MAP = L7.MAP;
  const TOUR = W.tour;
  const rowLine = (o) => `${o.town} ${L7.fmt(o.tau)} ÷ ${o.d} = ${L7.fmt(o.w)} ${o.pct}%`;
  L7.same("scene 8 step 1 rows", W.steps[0].opts.map(rowLine), [
    "B 24 ÷ 3 = 8 40%",
    "C 40 ÷ 4 = 10 50%",
    "D 10 ÷ 5 = 2 10%",
  ]);
  L7.same("scene 8 step 2 rows", W.steps[1].opts.map(rowLine), ["B 30 ÷ 6 = 5 67%", "D 10 ÷ 4 = 2.5 33%"]);
  L7.same("scene 8 step 3 rows", W.steps[2].opts.map(rowLine), ["D 20 ÷ 3 = 6.7 100%"]);
  const totalOf = (s) => L7.fmt(L7.sum(s.opts.map((o) => o.w)));
  L7.same("scene 8 totals of the weights", W.steps.map(totalOf), ["20", "7.5", "6.7"]);
  L7.same(
    "scene 8 chances add up to 100",
    W.steps.map((s) => L7.sum(s.opts.map((o) => o.pct))),
    [100, 100, 100],
  );
  L7.same(
    "scene 8 the picks and their chances",
    W.steps.map((s) => [s.pick, s.pickPct]),
    [
      ["C", 50],
      ["B", 67],
      ["D", 100],
    ],
  );
  L7.same(
    "scene 8 tour memory at each step",
    W.steps.map((s) => s.visited.join("")),
    ["A", "AC", "ACB"],
  );
  const WALKED = [...W.steps.map((s) => s.pickRoad), W.home.road];
  L7.same("scene 8 roads walked", WALKED, ["A-C", "B-C", "B-D", "A-D"]);
  L7.same("scene 8 roads walked are the tour's roads", WALKED, L7.edgesOf(TOUR));
  const SUM_TEXT = `${W.hops.join(" + ")} = ${W.len}`;
  L7.same("scene 8 tour length", SUM_TEXT, "4 + 6 + 3 + 5 = 18");
  L7.same(
    "scene 8 hops are the road distances",
    WALKED.map((k) => MAP.dist[k]),
    W.hops,
  );
  L7.same("scene 8 the tour string", TOUR.join("") + TOUR[0], "ACBDA");

  // ---------- timeline (local seconds) ----------
  const T_ANT = 0.8; // the ant pops on town A
  const HOP_T = [
    [6.0, 6.8],
    [9.1, 9.9],
    [10.7, 11.4],
    [11.6, 12.4],
  ]; // A>C, C>B, B>D, D>A
  const TILE_T = [1.2, 6.6, 9.7, 11.3]; // tour memory tiles A, C, B, D pop
  const HOME = { ghost: 11.3, fill: 12.2 }; // the fifth tile (home A): dashed at first, then filled
  const LEN = { tag: 12.45, card: 12.5, pills: 12.6 };
  // one entry per step: rows pop, weights show, chances and totals pop, the dice rolls, the pick, and the fades
  const STEPS = [
    {
      rows: 2.0,
      gap: 0.18,
      res: 3.0,
      resGap: 0.3,
      pills: 4.0,
      pillGap: 0.15,
      tags: 4.0,
      dice: [4.7, 4.8, 5.8],
      face: 3,
      pick: 5.9,
      other: [5.9, 6.3],
      all: [6.5, 6.9],
    },
    {
      rows: 7.0,
      gap: 0.15,
      res: 7.3,
      resGap: 0.15,
      pills: 7.7,
      pillGap: 0.15,
      tags: 7.7,
      dice: [8.1, 8.3, 9.0],
      face: 5,
      pick: 9.05,
      other: [9.05, 9.45],
      all: [9.55, 9.95],
    },
    {
      rows: 10.1,
      gap: 0,
      res: 10.35,
      resGap: 0,
      pills: 10.5,
      pillGap: 0,
      tags: 10.2,
      dice: null,
      face: null,
      pick: 10.65,
      other: [10.65, 10.65],
      all: [11.0, 11.4],
    },
  ];
  const HEAD_T = 1.8; // the rule card pops and stays: it is the rule behind every row
  const MAP_T = [0.2, 0.9]; // the roads grow
  const ORDER = (() => {
    const out = [];
    STEPS.forEach((S, s) => {
      L7.same(`scene 8 step ${s + 1} comes after its hop`, !s || S.rows > HOP_T[s - 1][0], true);
      L7.same(`scene 8 step ${s + 1} picks before its hop`, S.pick <= HOP_T[s][0] + 0.1, true);
      out.push(S.all[1] <= (STEPS[s + 1] ? STEPS[s + 1].rows : 99));
    });
    return out;
  })();
  L7.same("scene 8 a step's rows are gone before the next step's pop", ORDER, [true, true, true]);

  // ---------- layout (stage px) ----------
  const RX = 520; // right panel
  const RW = 416;
  const ROW = { y0: 104, dy: 96, h: 84 };
  const HEAD = { y: 6, h: 82 };
  const MEM_Y = 372;
  const TILE_Y = 440;

  V.scene({
    kicker: "ANTS ON A MAP",
    title: ["Pick the next town", "by trail and distance"],
    dur: 14,
    caps: [
      [1.0, 2.6, "An ant starts on one town."],
      [2.8, 4.8, "Each town left gets a weight: pheromone ÷ distance."],
      [5.0, 6.8, "The weights become chances, and the dice picks one."],
      [7.0, 9.8, "Visited towns go into its tour memory, so it never repeats one."],
      [10.0, 12.4, "It carries on until every town is visited, then returns home."],
      [12.6, 13.8, "The tour is 4 + 6 + 3 + 5 = 18 long."],
    ],
    build(stage) {
      const blue = L7.tone("blue");
      const orange = L7.tone("orange");
      const M = L7.map(stage, { x: 0, y: 20, w: 480, h: 300 });

      // own layers inside the map's road svg: pale halos UNDER the trails (so they can fade), orange walk lines ABOVE them
      if (M.el.children.length !== 18)
        throw new Error("VID.l7 scene 8: the map's road svg changed (expected 18 paths)");
      const firstHalo = M.el.children[6];
      const line = (a, b, w, stroke) => {
        const [p, q] = [M.pt(a), M.pt(b)];
        return V.s("path", {
          d: `M ${f1(p.x)} ${f1(p.y)} L ${f1(q.x)} ${f1(q.y)}`,
          fill: "none",
          "stroke-width": f1(w),
          "stroke-linecap": "round",
          style: { stroke },
        });
      };
      const halos = {};
      W.steps.forEach((st) =>
        st.opts.forEach((o) => {
          const p = line(o.road[0], o.road[2], L7.trailW(MAP.tau0[o.road], 0.5) + 20, orange.edge);
          M.el.insertBefore(p, firstHalo);
          halos[o.road] = p;
        }),
      );
      const HOPS = TOUR.map((a, i) => {
        const b = TOUR[(i + 1) % TOUR.length];
        const key = L7.ek(a, b);
        const p = line(a, b, Math.max(L7.trailW(MAP.tau0[key], 0.5), 8) + 2, orange.c);
        M.el.append(p);
        return { a, b, key, p, len: M.road(key).len, t0: HOP_T[i][0], t1: HOP_T[i][1] };
      });
      L7.same(
        "scene 8 hop roads",
        HOPS.map((h) => h.key),
        WALKED,
      );

      // tour memory: a tag, then tiles A C B D A that pop as the ant chooses (the home tile is dashed until the ant returns)
      const memTag = L7.tag(stage, { x: 0, y: MEM_Y, text: "tour memory", tone: "grey" });
      const mem = L5.chromosome(stage, {
        x: 0,
        y: TILE_Y,
        genes: TOUR.join("") + TOUR[0],
        size: 80,
        gap: 12,
        tone: "orange",
      });

      // right panel: the rule card, the option rows, the totals, the length
      const head = L7.card(stage, { x: RX, y: HEAD.y, w: RW, h: HEAD.h, tone: "grey", plain: false, fs: 30 });
      const line1 = V.h("div", { text: "weight =", style: { color: "var(--ink)" } });
      const line2 = V.h(
        "div",
        { style: { color: "var(--ink)" } },
        V.h("span", { text: "pheromone", style: { color: blue.ink } }),
        V.h("span", { text: " ÷ " }),
        V.h("span", { text: "distance", style: { color: "var(--text-dim)" } }),
      );
      head.el.append(
        V.h(
          "div",
          { style: { textAlign: "center", fontSize: "30px", fontWeight: "900", lineHeight: "1.2" } },
          line1,
          line2,
        ),
      );

      const rows = [];
      W.steps.forEach((st, s) => {
        const pickIdx = st.opts.findIndex((o) => o.town === st.pick);
        st.opts.forEach((o, i) => {
          const card = L7.card(stage, { x: RX, y: ROW.y0 + ROW.dy * i, w: RW, h: ROW.h, tone: "grey", plain: true });
          const disc = L7.disc(card.el, { x: 42, y: 39, size: 56, text: o.town, tone: "grey" });
          const span = (text, st2) => V.h("span", { text, style: { display: "inline-block", ...st2 } });
          const sTau = span(L7.fmt(o.tau), {});
          const sOp = span("÷", { margin: "0 8px" });
          const sD = span(String(o.d), {});
          const sRes = span(`= ${L7.fmt(o.w)}`, { marginLeft: "10px" });
          const eq = V.h(
            "div",
            {
              style: {
                position: "absolute",
                left: "84px",
                top: "0",
                height: "78px",
                display: "flex",
                alignItems: "center",
                fontSize: "33px",
                fontWeight: "900",
                whiteSpace: "nowrap",
              },
            },
            sTau,
            sOp,
            sD,
            sRes,
          );
          const pill = V.h("div", {
            class: "v-tag c-orange solid",
            text: `${o.pct}%`,
            style: { right: "14px", top: "10px" },
          });
          card.el.append(eq, pill);
          rows.push({ s, i, o, picked: i === pickIdx, card, disc, sTau, sOp, sD, sRes, pill });
        });
      });

      // under the rows: the total of the weights ('only D is left' at the end) and what the memory holds
      const notes = W.steps.map((st, s) => {
        const y = ROW.y0 + ROW.dy * (st.opts.length - 1) + ROW.h + 22;
        const text = s < 2 ? `${totalOf(st)} in total` : `only ${st.opts[0].town} is left`;
        const inMem = `${st.visited.join(", ")} in memory`;
        return {
          y,
          total: L7.tag(stage, { x: RX, y, text, tone: "grey" }),
          mem: L7.tag(stage, { x: RX, y: y + 70, text: inMem, tone: "orange" }),
        };
      });

      // the dice, drawn in all six faces (only one shows)
      const diceSvg = L5.svg(stage);
      const faces = [1, 2, 3, 4, 5, 6].map((f) =>
        diceSvg.appendChild(V.s("g", {}, L5.dice(0, 0, 76, { face: f, tone: "orange" }))),
      );

      // the tour length
      const lenTag = L7.tag(stage, { x: RX, y: MEM_Y, text: "tour length", tone: "grey" });
      const lenCard = L7.card(stage, {
        x: RX,
        y: TILE_Y,
        w: RW,
        h: 86,
        text: SUM_TEXT,
        tone: "orange",
        plain: true,
        fs: 44,
      });

      // where the ant is: standing on its town, or hopping (turning smoothly into and out of the road's heading)
      const turn = (f) => E.inOut(clamp(f / 0.18)) * E.inOut(clamp((1 - f) / 0.18));
      const antAt = (t) => {
        const h = HOPS.findIndex((x) => t >= x.t0 && t < x.t1);
        if (h >= 0) {
          const f = E.inOut(clamp((t - HOPS[h].t0) / (HOPS[h].t1 - HOPS[h].t0)));
          const p = M.antAt(HOPS[h].a, HOPS[h].b, f, 24, 40);
          return { ...p, r: p.r * turn(f) };
        }
        const done = HOPS.filter((x) => t >= x.t1).length;
        const home = TOUR[done % TOUR.length];
        return M.antAt(home, home, 0, 0, 40);
      };

      return (t) => {
        // ---- the map ----
        const toneRoads = Object.fromEntries(HOPS.filter((h) => t >= h.t1).map((h) => [h.key, "orange"]));
        const pills = {};
        MAP.roads.forEach((key, i) => {
          const j = HOPS.findIndex((h) => h.key === key);
          const l0 = LEN.pills + 0.13 * j;
          const lit = j >= 0 ? ramp(t, l0, l0 + 0.3, lin) : 0;
          pills[key] = {
            text: String(MAP.dist[key]),
            tone: lit > 0.5 ? "orange" : "grey",
            solid: lit > 0.5,
            k: ramp(t, 0.55 + 0.07 * i, 0.85 + 0.07 * i, lin),
            s: 1 + 0.2 * (j >= 0 ? flash(t, l0, l0 + 0.4) : 0),
          };
        });
        const towns = {};
        TOUR.forEach((n, idx) => {
          const arrive = idx === 0 ? T_ANT : HOPS[idx - 1].t1;
          const leave = HOPS[idx].t0;
          const back = idx === 0 && t >= HOPS[3].t1;
          const bump = flash(t, arrive, arrive + 0.35) + (idx === 0 ? flash(t, HOPS[3].t1, HOPS[3].t1 + 0.35) : 0);
          towns[n] = t < arrive ? {} : { tone: "orange", solid: back || t < leave, s: 1 + 0.12 * bump };
        });
        const ak = ramp(t, T_ANT, T_ANT + 0.4, lin);
        const a = antAt(t);
        M.update({
          grow: ramp(t, MAP_T[0], MAP_T[1], E.out),
          tau: MAP.tau0,
          tone: toneRoads,
          pills,
          towns,
          ant: { x: a.x, y: a.y, r: a.r, s: Math.max(0.01, E.back(ak)), o: Math.min(1, ak * 4) },
        });
        HOPS.forEach((h) => {
          const f = E.inOut(clamp((t - h.t0) / (h.t1 - h.t0)));
          h.p.style.strokeDasharray = `${f1(h.len * f + 0.01)} ${f1(h.len * 2)}`;
          V.show(h.p, f > 0.001 && t < h.t1 ? 1 : 0);
        });

        // ---- the tour memory ----
        memTag.set({ k: ramp(t, 1.0, 1.35, lin) });
        TILE_T.forEach((t0, i) => {
          const k = ramp(t, t0, t0 + 0.4, lin);
          mem.set(i, { tone: "orange", s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
        });
        const kg = ramp(t, HOME.ghost, HOME.ghost + 0.4, lin);
        const kf = ramp(t, HOME.fill, HOME.fill + 0.4, lin);
        mem.set(
          4,
          kf > 0
            ? { tone: "orange", s: 0.7 + 0.3 * E.pop(kf), o: 1 }
            : { tone: "orange", ghost: true, s: 0.7 + 0.3 * E.pop(kg), o: Math.min(1, kg * 4) },
        );

        // ---- the rule card ----
        head.set({ k: ramp(t, HEAD_T, HEAD_T + 0.4, lin) });

        // ---- option rows (and the halo on the road each one stands for) ----
        const on = "var(--c-on)";
        rows.forEach((r) => {
          const S = STEPS[r.s];
          const k = ramp(t, S.rows + S.gap * r.i, S.rows + S.gap * r.i + 0.4, lin);
          const off = r.picked ? S.all : S.other;
          const o = 1 - ramp(t, off[0], off[1] + 1e-6, lin);
          const picked = r.picked && t >= S.pick;
          Object.assign(r.card.el.style, {
            background: picked ? "var(--c)" : "",
            borderColor: picked ? "var(--c-lip)" : "",
            boxShadow: picked ? "0 6px 0 var(--c-lip)" : "",
            color: picked ? on : "",
          });
          r.card.set({
            tone: picked ? "orange" : "grey",
            plain: !picked,
            k,
            o,
            s: 1 + 0.05 * (r.picked ? flash(t, S.pick, S.pick + 0.3) : 0),
          });
          r.disc.set({ tone: picked ? "orange" : "grey", solid: false });
          r.sTau.style.color = picked ? on : blue.ink;
          r.sOp.style.color = r.sD.style.color = picked ? on : "var(--text-dim)";
          r.sRes.style.color = picked ? on : "var(--ink)";
          const kr = ramp(t, S.res + S.resGap * r.i, S.res + S.resGap * r.i + 0.3, lin);
          V.place(r.sRes, { y: (1 - kr) * 8, o: kr });
          const kp = ramp(t, S.pills + S.pillGap * r.i, S.pills + S.pillGap * r.i + 0.35, lin);
          const cls = `v-tag c-orange${picked ? "" : " solid"}`;
          if (r.pill.className !== cls) r.pill.className = cls;
          V.place(r.pill, { s: 0.8 + 0.2 * E.pop(kp), o: Math.min(1, kp * 4) });
          V.show(halos[r.o.road], Math.min(1, k * 2) * o);
        });

        // ---- the totals and the memory note under the rows ----
        notes.forEach((n, s) => {
          const S = STEPS[s];
          const o = 1 - ramp(t, S.all[0], S.all[1], lin);
          n.total.set({ k: ramp(t, S.tags, S.tags + 0.35, lin), o });
          n.mem.set({ k: ramp(t, S.tags + 0.15, S.tags + 0.5, lin), o });
        });

        // ---- the dice ----
        const shown = STEPS.findIndex((S) => S.dice && t >= S.dice[0] && t < S.all[1]);
        faces.forEach((g, i) => {
          const S = STEPS[shown];
          if (!S || i + 1 !== (t >= S.dice[2] ? S.face : 1 + (Math.max(0, Math.floor((t - S.dice[1]) * 10)) % 6))) {
            return V.show(g, 0);
          }
          const y = notes[shown].y + 38;
          const k = ramp(t, S.dice[0], S.dice[0] + 0.3, lin);
          const rolling = t >= S.dice[1] && t < S.dice[2];
          const q = t - S.dice[1];
          const off = 1 - ramp(t, S.other[0] + 0.1, S.other[0] + 0.5, lin);
          V.place(g, {
            x: 870,
            y: y - (rolling ? 10 * Math.abs(Math.sin(q * 12)) : 0),
            s: (0.6 + 0.4 * E.pop(k)) * (1 + 0.12 * flash(t, S.dice[2], S.dice[2] + 0.25)),
            r: rolling ? 16 * Math.sin(q * 24) : 0,
            o: Math.min(1, k * 4) * off,
          });
        });

        // ---- the tour length ----
        lenTag.set({ k: ramp(t, LEN.tag, LEN.tag + 0.35, lin) });
        lenCard.set({ k: ramp(t, LEN.card, LEN.card + 0.4, lin) });
      };
    },
  });
})();
