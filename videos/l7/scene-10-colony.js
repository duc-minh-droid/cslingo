/* Lecture 7 · scene-10-colony: send many ants round the four-town map. Every ant uses the update of scene 9 (halve every road, then add
   Q / length on its own tour). The random start favours a long tour (the first five ants all walk length-18 tours), then a length-14
   tour appears, adds 72 / 14 = 5.1 per road against 4, takes the lead and keeps it. A real run of the lesson's algorithm: L7.RUN (24
   ants, seed 59), every number asserted below. Local seconds: 0.2-1.4 map, rows, counter; ant k arrives at 1.8 + 0.34 (k - 1) (ants
   1 to 5), then a 0.7 s pause so the first short tour (ant 6, at 4.2) is seen, then 0.3 s per ant (ant 24 at 9.6); for 0.3 s each
   ant's tour is swept in orange while the trails, bars and counter move to the new values; 3.8-4.4 the deposit card; 10.0-10.6 the
   14 row turns green and the short tour's roads turn green, the first five ants are bracketed; hold. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const E = V.ease;
  const { ramp, clamp, flash, lerp } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);

  // ---------- facts (asserted: a wrong number throws) ----------
  const R = L7.RUN;
  const MAP = L7.MAP;
  const KEYS = MAP.roads;
  const N = R.ants.length;
  const SHORT_I = R.tours.indexOf(R.short);
  const SHORT_LEN = R.lens[SHORT_I];
  const FIRST_LONG = R.firstShort - 1; // ants before the first short tour
  L7.same(
    "scene 10 tours and lengths",
    [R.tours, R.lens],
    [
      ["A-B-C-D", "A-B-D-C", "A-C-B-D"],
      [18, 14, 18],
    ],
  );
  L7.same("scene 10 the short tour", [R.short, SHORT_LEN], ["A-B-D-C", 14]);
  L7.same("scene 10 the short tour is the map's", MAP.tours[SHORT_I].name, R.short);
  L7.same("scene 10 start trails and leader", [R.start.trail, R.start.leader], [[74, 94, 100], "A-C-B-D"]);
  L7.same("scene 10 start pheromone is the map's", R.start.tau, MAP.tau0);
  L7.same("scene 10 24 ants", N, 24);
  L7.same(
    "scene 10 the first six tours",
    R.ants.slice(0, 6).map((a) => a.tour),
    ["A-C-B-D", "A-C-B-D", "A-B-C-D", "A-C-B-D", "A-C-B-D", "A-B-D-C"],
  );
  L7.same(
    "scene 10 the first six lengths",
    R.ants.slice(0, 6).map((a) => a.len),
    [18, 18, 18, 18, 18, 14],
  );
  L7.same("scene 10 the 14-tour first leads at ant", R.firstShort, 6);
  L7.same("scene 10 the first ants found only long tours", FIRST_LONG, 5);
  L7.same(
    "scene 10 ants 6 to 24 walk the short tour",
    R.ants.slice(FIRST_LONG).every((a) => a.tour === R.short && a.len === SHORT_LEN),
    true,
  );
  L7.same(
    "scene 10 trails after ants 1, 2, 5, 6, 9 and 24",
    [1, 2, 5, 6, 9, 24].map((k) => R.ants[k - 1].trail),
    [
      [45, 55, 66],
      [31, 36, 49],
      [20, 18, 32],
      [20, 30, 26],
      [21, 40, 21],
      [21, 41, 21],
    ],
  );
  L7.same(
    "scene 10 leader before and after the 14-tour",
    [R.ants[FIRST_LONG - 1].leader, R.ants[FIRST_LONG].leader],
    ["A-C-B-D", "A-B-D-C"],
  );
  L7.same(
    "scene 10 the leader never changes again",
    R.ants.slice(FIRST_LONG).every((a) => a.leader === R.short),
    true,
  );
  L7.same("scene 10 deposits per road", [R.dep.short, R.dep.long], [5.1, 4]);
  L7.same(
    "scene 10 deposit is Q / length",
    [Math.round((10 * MAP.Q) / SHORT_LEN) / 10, MAP.Q / R.lens[0]],
    [R.dep.short, R.dep.long],
  );
  L7.same(
    "scene 10 every trail number is the rounded sum over the tour's roads",
    R.ants.every((a) => R.tours.every((n, i) => a.trail[i] === Math.round(L7.trailOn(a.tau, MAP.tours[i].path)))),
    true,
  );
  const END_TAU = R.ants[N - 1].tau;
  L7.same(
    "scene 10 the short tour's roads settle at 10.3, the others at 0",
    [MAP.tours[SHORT_I].edges.map((k) => Math.round(END_TAU[k] * 10) / 10), KEYS.filter((k) => END_TAU[k] < 0.001)],
    [
      [10.3, 10.3, 10.3, 10.3],
      ["A-D", "B-C"],
    ],
  );

  // ---------- timeline (local seconds) ----------
  const T0 = 1.8; // ant 1 arrives
  const STEP = 0.34; // one ant after the next (ants 1 to 6)
  const STEP_FAST = 0.3; // one ant after the next (ants 7 to 24)
  const PAUSE = 0.7; // a pause before ant 6, the first ant that walks the short tour
  const BLEND = 0.3; // trails, bars and counter move to the new values in this long
  const SWEEP = { head: 0.22, tail: [0.1, 0.32] }; // an ant's tour is swept in orange: the head draws on, the tail wipes out
  const tK = (k) => T0 + STEP * (Math.min(k, 6) - 1) + (k >= 6 ? PAUSE : 0) + STEP_FAST * Math.max(0, k - 6);
  L7.same(
    "scene 10 ant 6 and ant 24 arrive at 4.2 s and 9.6 s",
    [tK(6), tK(24)].map((x) => Math.round(x * 100) / 100),
    [4.2, 9.6],
  );
  L7.same("scene 10 ant 6 is the first short tour", R.firstShort, 6);
  const DEP_T = 3.8; // the deposit card
  const LEAN_T = 6.6; // the short tour's row pulses once
  const END_T = [10.0, 10.6]; // halos go, the first five ants are bracketed
  const GREEN_T = 10.15; // the 14 row turns green
  const RING = { t0: 10.15, step: 0.12, dur: 0.25 }; // the short tour's roads turn green, one after the next

  // what the colony looks like at time t: the last ant that has arrived, and how far we are into its update
  const mix = (t) => {
    const j = R.ants.reduce((n, a) => (t >= tK(a.k) - 1e-9 ? a.k : n), 0); // the last ant that has arrived
    const cur = j ? R.ants[j - 1] : R.start;
    const prev = j > 1 ? R.ants[j - 2] : R.start;
    return { j, cur, prev, f: j ? ramp(t, tK(j), tK(j) + BLEND, E.inOut) : 1 };
  };
  const colonyAt = (t) => {
    const m = mix(t);
    return {
      m,
      tau: Object.fromEntries(KEYS.map((k) => [k, lerp(m.prev.tau[k], m.cur.tau[k], m.f)])),
      trail: R.tours.map((_n, i) => lerp(m.prev.trail[i], m.cur.trail[i], m.f)),
    };
  };
  // 1 while a tour leads, easing from the old leader to the new one just after an ant has arrived
  const lead = (t, m, i) => {
    const q = m.j ? ramp(t, tK(m.j) + 0.1, tK(m.j) + 0.4, lin) : 1;
    return lerp(+(m.prev.leader === R.tours[i]), +(m.cur.leader === R.tours[i]), q);
  };
  const shown = (t) => colonyAt(t).trail.map(Math.round);
  L7.same("scene 10 numbers at the first frame", shown(0), [74, 94, 100]);
  L7.same("scene 10 numbers once ant 1 is in", shown(tK(1) + BLEND), [45, 55, 66]);
  L7.same("scene 10 numbers once ant 5 is in", shown(tK(5) + BLEND), [20, 18, 32]);
  L7.same("scene 10 numbers once ant 6 is in", shown(tK(6) + BLEND), [20, 30, 26]);
  L7.same("scene 10 numbers at the last frame", shown(12), [21, 41, 21]);
  L7.same(
    "scene 10 pheromone at the last frame (A-B A-C A-D B-C B-D C-D)",
    KEYS.map((k) => Math.round(colonyAt(12).tau[k] * 10) / 10),
    [10.3, 10.3, 0, 0, 10.3, 10.3],
  );

  // ---------- layout (stage px) ----------
  const MAP_BOX = { x: 12, y: 44, w: 480, h: 300 }; // the same place as scenes 8 and 9
  const RX = 520;
  const RW = 392; // a pulsing card grows 4%, so the right column ends well inside the 12 px margin
  const ROW = { y: [142, 244, 346], h: 96 };
  const DEP = { y: 458, h: 146 };
  const TOK = { x0: 40, pitch: 38, y0: 548, dy: 46, size: 32, per: 12 };
  const tokXY = (i) => ({ x: TOK.x0 + TOK.pitch * (i % TOK.per), y: TOK.y0 + TOK.dy * Math.floor(i / TOK.per) });

  V.scene({
    kicker: "MANY ANTS",
    title: ["Send many ants:", "the short tour wins"],
    dur: 12.8,
    caps: [
      [1.8, 3.7, "Ants go round one after another."],
      [3.8, 6.4, "A shorter tour adds more to each road."],
      [6.6, 9.4, "So the trail leans towards the shortest tour."],
      [10.1, 12.3, "The first ants found only long tours."],
    ],
    build(stage) {
      const orange = L7.tone("orange");
      const blue = L7.tone("blue");
      const green = L7.tone("green");

      // pale orange halos under the roads of the leading tour (own layer, so they can move and fade)
      const haloSvg = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
      });
      stage.append(haloSvg);
      const M = L7.map(stage, MAP_BOX);
      if (M.el.children.length !== 18)
        throw new Error("VID.l7 scene 10: the map's road svg changed (expected 18 paths)");
      const roadD = (k) => {
        const { A, B } = M.road(k);
        return `M ${f1(A.x)} ${f1(A.y)} L ${f1(B.x)} ${f1(B.y)}`;
      };
      const halos = Object.fromEntries(
        KEYS.map((k) => [
          k,
          haloSvg.appendChild(
            V.s("path", { d: roadD(k), fill: "none", "stroke-linecap": "round", style: { stroke: orange.edge } }),
          ),
        ]),
      );
      const trails = KEYS.map((_k, i) => M.el.children[12 + i]);

      // the ant's tour: an orange line swept round the towns in the order it walked, with the ink ant at its head
      const sweeps = R.ants.map((a) => {
        const pts = [...a.path, a.path[0]].map((n) => M.pt(n));
        const segs = [];
        let total = 0;
        for (let i = 0; i < 4; i++) {
          const [p, q] = [pts[i], pts[i + 1]];
          const len = Math.hypot(q.x - p.x, q.y - p.y);
          segs.push({ p, q, len, from: total, h: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI });
          total += len;
        }
        return { segs, total, d: `M ${pts.map((p) => `${f1(p.x)} ${f1(p.y)}`).join(" L ")}` };
      });
      const sweepLine = V.s("path", {
        fill: "none",
        "stroke-width": "12",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: orange.c },
      });
      M.el.append(sweepLine);
      const turn = (a, b) => ((b - a + 540) % 360) - 180;
      const headAt = (sw, p) => {
        const s = sw.total * p;
        const i = Math.max(
          0,
          sw.segs.findIndex((g) => s <= g.from + g.len),
        );
        const g = sw.segs[i] || sw.segs[3];
        const u = clamp((s - g.from) / g.len);
        const next = sw.segs[i + 1] ? sw.segs[i + 1].h : g.h;
        return {
          x: lerp(g.p.x, g.q.x, u),
          y: lerp(g.p.y, g.q.y, u),
          r: g.h + turn(g.h, next) * E.inOut(clamp((u - 0.75) / 0.25)),
        };
      };

      // the short tour's roads turn green, drawn on one after the next
      const ringPath = MAP.tours[SHORT_I].path;
      const ring = ringPath.map((a, i) => {
        const b = ringPath[(i + 1) % ringPath.length];
        const key = L7.ek(a, b);
        const { A, B, len } = M.road(key);
        const [p, q] = key[0] === a ? [A, B] : [B, A];
        const el = V.s("path", {
          d: `M ${f1(p.x)} ${f1(p.y)} L ${f1(q.x)} ${f1(q.y)}`,
          fill: "none",
          "stroke-linecap": "round",
          style: { stroke: green.c },
        });
        M.el.append(el);
        return { key, el, len };
      });
      L7.same(
        "scene 10 the green ring is the short tour's roads",
        [...ring.map((r) => r.key)].sort(),
        [...MAP.tours[SHORT_I].edges].sort(),
      );

      // left: the ants counter and one token per ant (red = a long tour, green = the short one)
      const counter = L7.stat(stage, { x: 16, y: 380, w: 220, h: 80, label: "ants", tone: "grey" });
      // the legend for the token colours, beside the counter
      const LONG_LEN = R.lens.find((l) => l !== SHORT_LEN);
      L7.same("scene 10 the long tours are 18 long", LONG_LEN, 18);
      const legend = [
        L7.tag(stage, { x: 256, y: 382, text: "long tour", tone: "red" }),
        L7.tag(stage, { x: 256, y: 446, text: "short tour", tone: "green" }),
      ];
      const bracket = V.h("div", {
        class: "v-tag c-red",
        style: {
          left: `${TOK.x0 - TOK.size / 2 - 8}px`,
          top: `${TOK.y0 - TOK.size / 2 - 8}px`,
          width: `${TOK.pitch * (FIRST_LONG - 1) + TOK.size + 16}px`,
          height: `${TOK.size + 16}px`,
          padding: "0",
        },
      });
      stage.append(bracket);
      const slots = L5.svg(stage);
      R.ants.forEach((_a, i) => {
        const { x, y } = tokXY(i);
        slots.appendChild(
          V.s("circle", {
            cx: f1(x),
            cy: f1(y),
            r: TOK.size / 2 + 2,
            fill: "none",
            "stroke-width": "4",
            style: { stroke: "var(--line-2)" },
          }),
        );
      });
      const tokens = R.ants.map((a) =>
        L7.token(stage, { tone: a.len === SHORT_LEN ? "green" : "red", size: TOK.size }),
      );

      // right: the trail on each tour (a bar per tour), then what an ant adds
      const head = L7.tag(stage, { x: RX, y: 12, text: "pheromone on its 4 roads", tone: "grey" });
      const strongest = L7.tag(stage, { x: RX, y: 76, text: "strongest", tone: "orange" });
      const rows = R.tours.map((name, i) => {
        const card = L7.card(stage, { x: RX, y: ROW.y[i], w: RW, h: ROW.h, tone: "grey", plain: true });
        card.el.append(
          V.h("div", { class: "v-text v-mono", text: name, style: { left: "20px", top: "4px", fontSize: "30px" } }),
        );
        const len = R.lens[i];
        L7.text(card.el, {
          x: RW - 6 - 18 - 170,
          y: 6,
          w: 170,
          text: `${len} long`,
          fs: 30,
          tone: len === SHORT_LEN ? "green" : "red",
          align: "right",
        }).set({});
        const bar = L7.bar(card.el, { x: 14, y: 45, w: RW - 6 - 28, h: 42, tone: "blue" });
        let tick = null;
        if (i === SHORT_I) {
          tick = L5.svg(card.el, RW - 6, ROW.h - 6).appendChild(L5.tick(226, 23, 34, "green", { ink: true }));
        }
        return { card, bar, tick };
      });
      const dep = L7.card(stage, { x: RX, y: DEP.y, w: RW, h: DEP.h, tone: "blue", plain: true });
      const depLine = (top, label, tone, len, amount) => {
        const el = V.h(
          "div",
          { class: "v-text", style: { left: "20px", top: `${top}px`, fontSize: "30px", fontWeight: "900" } },
          V.h("span", { text: label, style: { color: L7.tone(tone).ink } }),
          V.h("span", { text: `: ${MAP.Q} ÷ ${len} = ${L7.fmt(amount)}`, style: { color: blue.ink } }),
        );
        dep.el.append(el);
        return el;
      };
      L7.text(dep.el, { x: 20, y: 8, text: "added to each tour road:", fs: 28, tone: "dim", bold: false });
      const depShort = depLine(52, "short", "green", SHORT_LEN, R.dep.short);
      const depLong = depLine(98, "long", "red", LONG_LEN, R.dep.long);

      const leaderAt = (t, m) => (m.j && t >= tK(m.j) + 0.25 ? m.cur.leader : m.prev.leader);

      return (t) => {
        const { m, tau, trail } = colonyAt(t);
        const top = Math.max(...trail);
        const gone = ramp(t, END_T[0], END_T[1], lin);

        // ---- the ant that has just arrived goes round its tour (an orange line, the ink ant at its head) ----
        const sw = m.j ? sweeps[m.j - 1] : null;
        const head1 = sw ? ramp(t, tK(m.j), tK(m.j) + SWEEP.head, lin) : 0;
        const tail1 = sw ? ramp(t, tK(m.j) + SWEEP.tail[0], tK(m.j) + SWEEP.tail[1], lin) : 0;
        if (sw) {
          sweepLine.setAttribute("d", sw.d);
          sweepLine.style.strokeDasharray = `${f1(sw.total * (head1 - tail1) + 0.01)} ${f1(sw.total * 3)}`;
          sweepLine.style.strokeDashoffset = f1(-sw.total * tail1);
        }
        V.show(sweepLine, sw && head1 - tail1 > 0.004 ? 1 : 0);
        const so = sw ? 1 - ramp(t, tK(m.j) + SWEEP.head, tK(m.j) + SWEEP.tail[1] - 0.04, lin) : 0;
        const hd = sw && so > 0 ? headAt(sw, head1) : null;

        // ---- the map: roads, halos under the leading tour ----
        const pop = (i) => L7.seq(t, 0.15, 0.06, 0.35, i);
        M.update({
          grow: ramp(t, 0.4, 1.0, E.out),
          tau,
          towns: Object.fromEntries(
            [..."ABCD"].map((n, i) => [n, { s: 0.7 + 0.3 * E.pop(pop(i)), o: Math.min(1, pop(i) * 4) }]),
          ),
          ant: hd ? { x: hd.x, y: hd.y, r: hd.r, s: 0.8, o: so } : undefined,
        });
        KEYS.forEach((k, ki) => {
          const w = L7.trailW(tau[k], 0.5);
          // a trail that has almost gone fades out instead of popping; none shows before its road has started to grow
          if (w > 0.5) V.show(trails[ki], clamp(tau[k] / 2) * (ramp(t, 0.4, 1.0, E.out) > 0.04 ? 1 : 0));
          halos[k].setAttribute("stroke-width", f1(w + 22));
          const led = Math.max(...MAP.tours.map((tr, i) => (tr.edges.includes(k) ? lead(t, m, i) : 0)));
          V.show(halos[k], led * (1 - gone) * ramp(t, 0.4, 0.8, lin));
        });

        // ---- the short tour's roads turn green ----
        ring.forEach((r, i) => {
          const f = ramp(t, RING.t0 + RING.step * i, RING.t0 + RING.step * i + RING.dur, E.inOut);
          r.el.setAttribute("stroke-width", f1(Math.max(8, L7.trailW(tau[r.key], 0.5))));
          r.el.style.strokeDasharray = `${f1(r.len * f + 0.01)} ${f1(r.len * 2)}`;
          V.show(r.el, f > 0.001 ? 1 : 0);
        });

        // ---- the counter, the tokens and the bracket round the first five ----
        counter.set({
          text: String(m.j),
          bump: m.j ? 0.5 * flash(t, tK(m.j), tK(m.j) + 0.25) : 0,
          k: ramp(t, 0.1, 0.5, lin),
        });
        V.show(slots, ramp(t, 0.9, 1.3, lin));
        tokens.forEach((tk, i) => {
          const k = ramp(t, tK(i + 1), tK(i + 1) + 0.25, lin);
          tk.set({ ...tokXY(i), s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });
        });
        const bk = ramp(t, END_T[0], END_T[0] + 0.35, lin);
        V.place(bracket, { s: 0.9 + 0.1 * E.pop(bk), o: Math.min(1, bk * 4) });

        // ---- the three tours ----
        head.set({ k: ramp(t, 0.2, 0.55, lin) });
        legend.forEach((g, i) => g.set({ k: ramp(t, 1.3 + 0.15 * i, 1.65 + 0.15 * i, lin) }));
        strongest.set({
          k: ramp(t, 0.4, 0.75, lin),
          tone: t >= GREEN_T ? "green" : "orange",
          s: 1 + 0.08 * (flash(t, GREEN_T, GREEN_T + 0.4) + flash(t, tK(R.firstShort) + 0.25, tK(R.firstShort) + 0.65)),
        });
        rows.forEach((r, i) => {
          const isShort = i === SHORT_I;
          const led = leaderAt(t, m) === R.tours[i];
          const done = isShort && t >= GREEN_T;
          const pulse = isShort
            ? flash(t, tK(R.firstShort) + 0.25, tK(R.firstShort) + 0.65) +
              flash(t, LEAN_T, LEAN_T + 0.5) +
              flash(t, GREEN_T, GREEN_T + 0.4)
            : 0;
          r.card.set({
            tone: done ? "green" : led ? "orange" : "grey",
            plain: !(done || led),
            k: L7.seq(t, 0.3, 0.15, 0.4, i),
            s: 1 + 0.04 * pulse,
          });
          r.bar.set({ k: trail[i] / top, text: String(Math.round(trail[i])), tone: "blue" });
          if (r.tick) L5.drawOn(r.tick, ramp(t, GREEN_T + 0.1, GREEN_T + 0.5, lin));
        });

        // ---- what an ant adds to each road of its tour ----
        dep.set({ k: ramp(t, DEP_T, DEP_T + 0.6, lin) });
        V.place(depShort, { s: 1 + 0.06 * flash(t, DEP_T + 0.7, DEP_T + 1.2) });
        V.place(depLong, { s: 1 + 0.06 * flash(t, DEP_T + 1.3, DEP_T + 1.8) });
      };
    },
  });
})();
