/* Lecture 1 (ds-1), scene 06: one fault can bring everything down (lesson 1.3).
   Six servers take 70 each; one dies and the others carry 84; a second dies and 105 is over the limit of 100, so the
   survivors fall one by one (a cascade); then a single software bug hits all six at once. Every number comes from D1.cascade. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the data (asserted against the real rule) ----------
  const C = D1.CASC;
  const N = C.n;
  const CAP = C.cap;
  // load per surviving server after d deaths: 70, 84, 105, 140, 210, 420
  const PER = [C.calm.per, C.one.per, C.two.per, ...C.chain.slice(1, -1).map((r) => r.per)];
  D1.same("cascade scene: per-server load after each death", PER, [70, 84, 105, 140, 210, 420]);
  D1.same(
    "cascade scene: survivors in the chain",
    [C.two.alive, ...C.chain.slice(1).map((r) => r.alive)],
    [4, 3, 2, 1, 0],
  );
  D1.same(
    "cascade scene: totals",
    PER.map((p, d) => p * (N - d)),
    PER.map(() => C.load),
  );

  // ---------- the timeline ----------
  const DEAD_AT = [2.4, 5.0, 6.8, 7.25, 7.7, 8.15]; // server d dies at DEAD_AT[d]
  const SHOW_LAG = 0.25; // survivors' numbers change a moment after a death
  const T = {
    pop: 0.15,
    ok1: 3.4,
    okOff: 5.0,
    over: 5.5,
    overOff: 6.8,
    all: 8.3,
    allOff: 9.1,
    revive: 9.1,
    bug: 9.7,
    tree: 9.9,
    bugDead: 10.3,
    bugTag: 10.7,
  };

  // ---------- layout ----------
  const ROW = { x: 38, y: 230, w: 130, h: 170, gap: 16 };
  const BUS_Y = 190;
  const BUG = { x: 468, y: 100, size: 92 };
  const TAG_Y = 450;
  const midX = (i) => ROW.x + i * (ROW.w + ROW.gap) + ROW.w / 2;
  const topPt = (i) => ({ x: midX(i), y: ROW.y });

  function build(stage) {
    const svgLow = L5.svg(stage);
    const row = D1.servers(stage, { n: N, ...ROW });
    const svg = L5.svg(stage);

    const capTag = D1.tag(stage, { x: 38, y: 60, text: "each takes 100", tone: "grey" });
    const load = D1.stat(stage, { x: 590, y: 50, w: 300, h: 80, label: "total load", tone: "blue" });

    // load that hops from a dying server to the survivors (one token per death and survivor)
    const hops = [];
    for (let d = 0; d < N - 1; d++)
      for (let j = d + 1; j < N; j++)
        hops.push({ d, j, tok: D1.token(stage, { tone: "blue", size: 24, square: true }) });
    const bolts = DEAD_AT.map((_, i) => svg.appendChild(D1.icon.bolt(midX(i), ROW.y - 30, 58, "orange")));

    // the bug and the wires that fan out from it
    const red = D1.tone("red");
    const wirePath = (d) => {
      const p = V.s("path", {
        d,
        pathLength: "1",
        fill: "none",
        "stroke-width": "9",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: red.c },
      });
      return svgLow.appendChild(p);
    };
    const stem = wirePath(`M${BUG.x} ${BUG.y + 40} V${BUS_Y}`);
    const bus = wirePath(`M${midX(0)} ${BUS_Y} H${midX(N - 1)}`);
    const drops = Array.from({ length: N }, (_, i) => wirePath(`M${midX(i)} ${BUS_Y} V${ROW.y - 4}`));
    const drawPath = (p, k) => {
      p.style.strokeDasharray = "1 1";
      p.style.strokeDashoffset = String(1 - clamp(k));
      p.style.visibility = k <= 0.002 ? "hidden" : "";
    };
    const bug = svg.appendChild(D1.icon.bug(BUG.x, BUG.y, BUG.size, "red"));

    // verdict tags (a tick or a cross sits at the left of the text)
    const PAD = 46;
    const verdict = (text, tone, icon) => {
      const w = D1.tagW(text) + PAD;
      const x = Math.round(468 - w / 2);
      const t = D1.tag(stage, { x, y: TAG_Y, text, tone, solid: true });
      t.el.style.paddingLeft = `${PAD}px`;
      const g = svg.appendChild(
        icon === "tick"
          ? L5.tick(x + 36, TAG_Y + 29, 30, tone, { on: true, w: 6 })
          : icon === "cross"
            ? L5.cross(x + 36, TAG_Y + 29, 30, tone, { on: true, w: 6 })
            : V.s("g", {}),
      );
      return {
        set(k, o = 1) {
          t.set({ k, o });
          V.place(g, { s: 0.8 + 0.2 * E.pop(clamp(k)), o: Math.min(1, k * 4) * o });
        },
      };
    };
    const vOk = verdict("fault tolerated", "green", "tick");
    const vOver = verdict("overloaded", "orange", null);
    const vAll = verdict("cascade: all down", "red", "cross");
    const vBug = verdict("all fail together", "red", "cross");

    // a tag that pops in at `a` and leaves again between `b` and `b + 0.25`
    const life = (t, a, b) => ramp(t, a, a + 0.4, E.out) * (1 - ramp(t, b, b + 0.25, E.lin));

    return (t) => {
      // ---- who is dead and what do the survivors show? ----
      const dead = DEAD_AT.map((d) => t >= d);
      const shown = DEAD_AT.filter((d) => t >= d + SHOW_LAG).length;
      const per = PER[Math.min(shown, PER.length - 1)];
      const revived = t >= T.revive;
      const bugDown = t >= T.bugDead;

      // ---- header ----
      capTag.set({ k: ramp(t, T.pop + 0.1, T.pop + 0.6, E.lin) });
      load.set({ text: String(C.load), k: ramp(t, T.pop, T.pop + 0.5, E.lin) });

      // ---- servers ----
      row.list.forEach((s, i) => {
        const dieAt = bugDown ? T.bugDead : DEAD_AT[i];
        const rk = D1.seq(t, T.revive, 0.05, 0.4, i);
        const popK = 0.5 + 0.5 * rk;
        let st;
        if (revived && !bugDown) {
          // alive again at 70 each
          st = rk > 0 ? { state: "ok", load: PER[0] / CAP, text: String(PER[0]), k: popK } : { state: "down" };
        } else if (dead[i] || bugDown) {
          st = { state: "down" };
        } else {
          const over = per > CAP;
          const bump = flash(
            t,
            DEAD_AT[Math.max(0, shown - 1)] + SHOW_LAG,
            DEAD_AT[Math.max(0, shown - 1)] + SHOW_LAG + 0.45,
          );
          st = {
            state: over ? "over" : "ok",
            load: per / CAP,
            text: String(per),
            s: 1 + (shown > 0 ? 0.06 * bump : 0),
          };
        }
        const k0 = D1.seq(t, T.pop, 0.07, 0.35, i);
        const hit = ramp(t - dieAt, 0, 0.4, E.lin);
        const shake = t >= dieAt && t < dieAt + 0.4 ? Math.sin((t - dieAt) * 60) * 9 * (1 - hit) : 0;
        s.set({ label: String(i + 1), k: st.k ?? k0, ...st, shake });
      });

      // ---- bolts at each death ----
      bolts.forEach((b, i) => {
        const a = DEAD_AT[i];
        const k = ramp(t, a - 0.25, a - 0.05, E.out) * (1 - ramp(t, a + 0.15, a + 0.5, E.lin));
        V.place(b, { y: (1 - ramp(t, a - 0.25, a - 0.05)) * -24, s: 0.7 + 0.3 * E.pop(clamp(k * 1.5)), o: k });
      });

      // ---- the load hops from the dead server to the survivors ----
      hops.forEach(({ d, j, tok }) => {
        const a = DEAD_AT[d] + 0.02 + (j - d - 1) * 0.04;
        const f = ramp(t, a, a + 0.5, E.lin);
        if (f <= 0 || f >= 1) return tok.set({ o: 0 });
        const p = topPt(d);
        const q = topPt(j);
        const e = E.out(f);
        tok.set({
          x: lerp(p.x, q.x, e),
          y: lerp(p.y + 30, q.y + 30, e) - 70 * Math.sin(Math.PI * e),
          s: 1 - 0.3 * f,
          o: Math.min(1, f * 6) * (1 - ramp(f, 0.8, 1, E.lin)),
        });
      });

      // ---- verdicts ----
      vOk.set(life(t, T.ok1, T.okOff), 1);
      vOver.set(life(t, T.over, T.overOff), 1);
      vAll.set(life(t, T.all, T.allOff), 1);
      vBug.set(ramp(t, T.bugTag, T.bugTag + 0.4, E.out), 1);

      // ---- the bug and its wires ----
      const bk = ramp(t, T.bug, T.bug + 0.4, E.out);
      V.place(bug, {
        s: 0.6 + 0.4 * E.pop(bk),
        o: Math.min(1, bk * 4),
        r: t >= T.bugDead ? 6 * Math.sin((t - T.bugDead) * 40) * (1 - ramp(t, T.bugDead, T.bugDead + 0.4, E.lin)) : 0,
      });
      drawPath(stem, ramp(t, T.tree, T.tree + 0.12, E.lin));
      drawPath(bus, ramp(t, T.tree + 0.1, T.tree + 0.3, E.lin));
      drops.forEach((p, i) => drawPath(p, ramp(t, T.tree + 0.28 + i * 0.015, T.tree + 0.42 + i * 0.015, E.lin)));
    };
  }

  V.scene({
    kicker: "RELIABILITY",
    title: ["One fault can bring", "everything down"],
    dur: 12,
    caps: [
      [0.9, 2.7, "Six servers share the load, 70 each."],
      [2.8, 5.0, "One dies; five carry on at 84 each."],
      [5.3, 7.0, "One more dies: 105 each, over 100."],
      [7.1, 8.9, "Overload makes them fall one by one."],
      [10.0, 11.7, "One bug hits all six together."],
    ],
    build,
  });
})();
