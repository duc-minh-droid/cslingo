/* Algorithms Phase 1 video (algo-1), scene 06 · rank flows along the links.
   The leaky web (A->B,C  B->C  C->A,D  D->nothing) with 25 tokens on every page. A small key says what the picture is: circles
   are web pages, arrows are links, tokens are rank. Every page pours all it has equally down its links: D has no links, so
   its own 25 are the one thing that cannot leave, they float away (red) and the total drops to 75. Fix: a dead end pours to
   EVERY page. The repaired round is shown in two beats (the ordinary pour first, then D's four purple 6.25 packets alone) and
   the total is 100 again. All amounts come from A1.tokens (the real token trace), asserted below.
   Story (local seconds): 0.3-1.5 web and key, 2.4-3.0 the 25s and the total, 4.4-5.7 the pour, 5.8-6.4 the pills arrive,
   6.6-7.6 D's 25 floats away (dead end), 7.4 the total is 75, 8.8-9.3 rewind, 9.2-9.9 D's pour links, 10.0-10.9 the ordinary
   pour again, 11.0-12.1 D's purple pour, 12.1-12.7 arrival, 12.7-13.4 the total is 100 (green tick). */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const { ramp, flash, clamp, ease: E } = V;
  const W = A1.WEBS.leaky;
  const NAMES = W.names;
  const T0 = A1.tokens(W); // no repair
  const T1 = A1.tokens(W, { repair: true });
  const POURS = T1.sends.filter((s) => s.kind === "pour");
  A1.must(A1.near(T0.total, 75) && A1.near(T0.lost, 25) && T0.sends.length === 5, "flow: the leaky token trace");
  A1.must(A1.near(T1.total, 100) && T1.sends.length === 9, "flow: the repaired token trace");
  A1.must(
    POURS.length === 4 && POURS.every((s) => s.from === "D" && A1.near(s.amt, 6.25)),
    "flow: D pours 6.25 to each page",
  );
  A1.must(W.dead.join() === "D", "flow: D is the only dead end");

  // ---- timeline (local seconds)
  const TK = 2.4; // the 25s pop in
  const POUR1 = 4.4; // the first pour starts (pages send in turn, 0.15 s apart, 1.2 s on the way)
  const ARR1 = 5.8; // the pills arrive
  const LEAK = 6.6; // D's own 25 floats away
  const D_NEW = 7.2; // D's received pill pops
  const SUM75 = 7.4; // the total drops
  const REW = 8.8; // rewind to 25 each
  const FIXE = 9.2; // D's pour links draw on
  const POUR2 = 10.0; // the ordinary pour again
  const DPOUR = 11.0; // D's purple pour
  const ARR2 = 12.1;
  const GREEN = 12.7;
  const ORDER = { A: 0, B: 1, C: 2 };
  const win1 = (s) => [POUR1 + 0.15 * ORDER[s.from], POUR1 + 1.2 + 0.15 * ORDER[s.from]];
  const win2 = (s, j) => (s.kind === "pour" ? [DPOUR + 0.08 * j, DPOUR + 1.0 + 0.08 * j] : [POUR2 + 0.1 * ORDER[s.from], POUR2 + 0.9 + 0.1 * ORDER[s.from]]); // prettier-ignore
  const HALO = [POUR1, ARR1];
  const HALO2 = [POUR2, POUR2 + 1.0];
  const EXTRA = [
    ["D", "A"],
    ["D", "B"],
    ["D", "C"],
    ["D", "D"],
  ];
  const fmt = A1.fmt;

  /* the text and pop of a node's value pill at time t */
  function val(i, t) {
    const n = NAMES[i];
    const dead = n === "D";
    const lin = (a, b) => ramp(t, a, b, E.lin);
    const born = lin(TK + 0.08 * i, TK + 0.4 + 0.08 * i);
    if (t < REW) {
      if (t < ARR1 + 0.1 * i) return { text: "25", k: born * (dead ? 1 : 1 - lin(POUR1, POUR1 + 0.25)) };
      if (dead) return t < LEAK ? { text: "25", k: 1 } : { text: fmt(T0.got.D), k: lin(D_NEW, D_NEW + 0.4) };
      return { text: fmt(T0.got[n]), k: lin(ARR1 + 0.1 * i, ARR1 + 0.1 * i + 0.4) };
    }
    const leave = dead ? lin(DPOUR, DPOUR + 0.25) : lin(POUR2, POUR2 + 0.25);
    if (t < ARR2 + 0.1 * i) return { text: "25", k: lin(REW + 0.05 * i, REW + 0.45 + 0.05 * i) * (1 - leave) };
    return { text: fmt(T1.got[n]), k: lin(ARR2 + 0.1 * i, ARR2 + 0.1 * i + 0.4) };
  }

  function statState(t) {
    if (t >= SUM75 && t < REW) return { text: fmt(T0.total), tone: "red" };
    if (t >= GREEN) return { text: fmt(T1.total), tone: "green" };
    return { text: "100", tone: "blue" };
  }

  /* the packets in flight at time t: [{ from, to, f, tone, text, o, s }] */
  function packets(t) {
    const out = [];
    const send = (s, [a, b], tone) => {
      if (t < a || t > b) return;
      const f = ramp(t, a, b, E.inOut);
      out.push({
        from: s.from,
        to: s.to,
        f,
        tone,
        text: fmt(s.amt),
        // small and faint at both ends, so pills do not pile up on a node
        o: ramp(f, 0, 0.08, E.lin) * (1 - ramp(f, 0.74, 0.96, E.lin)),
        s: (0.72 + 0.28 * ramp(f, 0, 0.3, E.lin)) * (1 - 0.35 * ramp(f, 0.62, 0.95, E.lin)),
      });
    };
    T0.sends.forEach((s) => send(s, win1(s), "blue"));
    let j = 0;
    T1.sends.forEach((s) => send(s, win2(s, s.kind === "pour" ? j++ : 0), s.kind === "pour" ? "purple" : "blue"));
    return out;
  }

  /* the key: what a circle, an arrow and a token mean */
  function keyRow(stage, y, icon, text) {
    const row = V.h("div", {
      style: { position: "absolute", left: "640px", top: `${y}px`, width: "290px", height: "44px" },
    });
    icon.style.left = "0px";
    icon.style.top = "0px";
    const label = V.h("div", {
      class: "v-text dim",
      text,
      style: { left: "68px", top: "4px", fontSize: "28px", lineHeight: "36px" },
    });
    row.append(icon, label);
    stage.append(row);
    return row;
  }

  V.scene({
    kicker: "PAGERANK",
    title: ["Rank flows along", "the links"],
    dur: 15,
    caps: [
      [0.4, 2.2, "Pages link to pages."],
      [2.3, 4.2, "Give every page 25 tokens of rank."],
      [4.3, 6.5, "Each page pours its tokens down its links."],
      [6.6, 8.7, "D has no links, so its 25 tokens vanish."],
      [8.9, 12.0, "Fix: a dead end pours to every page."],
      [12.2, 14.6, "Now nothing is lost: the total is 100 again."],
    ],
    build(stage) {
      const g = A1.web(stage, {
        web: W,
        x: 0,
        y: 24,
        w: 620,
        h: 520,
        r: 34,
        extra: EXTRA,
        labels: { A: "above", B: "right", C: "below", D: "right" },
        loops: { D: "below" },
      });
      // the key (what the picture means)
      const pageIcon = V.s("svg", { width: 44, height: 44, viewBox: "0 0 44 44" });
      const pc = V.s("circle", { cx: 22, cy: 22, r: 18, "stroke-width": 4 });
      Object.assign(pc.style, { fill: T("blue").dim, stroke: T("blue").edge });
      pageIcon.append(pc);
      Object.assign(pageIcon.style, { position: "absolute", overflow: "visible" });
      const linkIcon = A1.icon("arrow", 44, "grey");
      linkIcon.querySelectorAll("path").forEach((p) => (p.style.stroke = "var(--text-dim)"));
      const tokenTag = A1.tag(stage, { text: "25", tone: "blue", w: 56, h: 40 });
      const keys = [keyRow(stage, 24, pageIcon, "a web page"), keyRow(stage, 82, linkIcon, "a link")];
      const tokenRow = V.h("div", {
        style: { position: "absolute", left: "640px", top: "140px", width: "290px", height: "44px" },
      });
      tokenRow.append(
        V.h("div", {
          class: "v-text dim",
          text: "tokens = rank",
          style: { left: "68px", top: "4px", fontSize: "28px", lineHeight: "36px" },
        }),
      );
      stage.append(tokenRow);

      const stat = A1.stat(stage, { x: 704, y: 380, w: 220, h: 140, label: "total tokens", text: "100", tone: "blue" });
      const lost = A1.tag(stage, { text: `−${fmt(T0.lost)} lost`, tone: "red", solid: true, fs: 32 });
      const dtag = A1.tag(stage, { solid: true });
      const tick = A1.icon("tick", 44, "green");
      stage.append(tick);
      // D's own 25: it has nowhere to go, so it floats away (a red SVG pill above the web)
      const gone = A1.svgPill(g.overlay, 34);
      const D = g.pt("D");
      const goneX = D.x + g.r + 10 + gone.w("25") / 2;

      return (t) => {
        // ---- the key
        keys.forEach((row, i) => {
          const k = ramp(t, 0.9 + 0.2 * i, 1.3 + 0.2 * i, E.lin);
          V.place(row, { s: 0.85 + 0.15 * E.pop(k), o: clamp(k * 4) });
        });
        const kt = ramp(t, TK, TK + 0.4, E.lin);
        V.place(tokenRow, { s: 0.85 + 0.15 * E.pop(kt), o: clamp(kt * 4) });
        tokenTag.set({ x: 640 + 6, y: 144, s: 0.85 + 0.15 * E.pop(kt), o: clamp(kt * 4) });

        // ---- nodes, edges, pills
        const node = {};
        NAMES.forEach((n, i) => {
          const k = ramp(t, 0.3 + 0.1 * i, 0.8 + 0.1 * i, E.lin);
          const v = val(i, t);
          const dead = n === "D";
          const pouring = (t >= HALO[0] && t < HALO[1] + 0.1) || (t >= HALO2[0] && t < HALO2[1] + 0.1);
          const glow = ([a, b]) => Math.min(ramp(t, a, a + 0.2), 1 - ramp(t, b - 0.2, b));
          const halo = Math.max(glow(HALO), glow(HALO2));
          let tone = pouring && !dead ? "blue" : "grey";
          if (dead && t >= LEAK) tone = "red";
          if (dead && t >= FIXE) tone = "purple";
          const arr = (t < REW ? ARR1 : ARR2) + 0.1 * i;
          node[n] = {
            tone,
            o: clamp(k * 3),
            s: 0.6 + 0.4 * E.pop(k),
            halo: dead ? 0 : halo,
            pulse: (t >= ARR1 && t < REW) || t >= ARR2 ? flash(t, arr, arr + 0.35) : 0,
            val: v.text,
            valTone: "blue",
            valK: v.k,
            ring: t >= FIXE ? "purple" : "red",
            rk: dead ? (t >= FIXE ? 1 : ramp(t, LEAK, LEAK + 0.4)) : 0,
          };
        });
        const edge = {};
        W.edges.forEach(([a, b], idx) => {
          edge[a + b] = { k: ramp(t, 0.55 + 0.07 * idx, 1.0 + 0.07 * idx, E.lin), tone: "grey" };
        });
        EXTRA.forEach(([a, b], idx) => {
          edge[a + b] = {
            k: ramp(t, FIXE + 0.1 * idx, FIXE + 0.4 + 0.1 * idx, E.lin),
            tone: "purple",
            dash: true,
            o: 1,
          };
        });
        g.update({ node, edge, packets: packets(t) });

        // ---- D's tag: "dead end" (red), then "pours to all" (purple); it sits up and to the right so the pour links stay clear
        const fixed = t >= FIXE;
        const kd = fixed ? ramp(t, FIXE, FIXE + 0.4, E.lin) : ramp(t, LEAK, LEAK + 0.4, E.lin);
        dtag.set({
          x: D.x + 96,
          y: D.y - 84,
          center: true,
          text: fixed ? "pours to all" : "dead end",
          tone: fixed ? "purple" : "red",
          s: 0.7 + 0.3 * E.pop(kd),
          o: clamp(kd * 4),
        });

        // ---- D's own 25 floats away, in red, right when the caption says so
        const fl = ramp(t, LEAK, LEAK + 0.9, E.out);
        gone.set({
          x: goneX,
          y: D.y - 50 * fl,
          text: "25",
          tone: "red",
          look: "solid",
          s: 1 + 0.1 * flash(t, LEAK, LEAK + 0.3) - 0.2 * fl,
          o:
            t >= LEAK && t < REW
              ? Math.min(ramp(t, LEAK, LEAK + 0.1, E.lin), 1 - ramp(t, LEAK + 0.5, LEAK + 1.0, E.lin))
              : 0,
        });

        // ---- the total: 100, then 75 (red), back to 100, then 100 green
        const st = statState(t);
        const k0 = ramp(t, 2.6, 3.1, E.lin);
        const shake = t >= SUM75 && t < SUM75 + 0.35 ? Math.sin((t - SUM75) * 2 * Math.PI * 6) * 9 * (1 - ramp(t, SUM75, SUM75 + 0.35, E.lin)) : 0; // prettier-ignore
        const bump = Math.max(flash(t, REW, REW + 0.3), flash(t, GREEN, GREEN + 0.35));
        stat.set({
          text: st.text,
          tone: st.tone,
          dx: shake,
          s: (0.7 + 0.3 * E.pop(k0)) * (1 + 0.06 * bump),
          o: clamp(k0 * 4),
        });
        const kl = ramp(t, SUM75, SUM75 + 0.4, E.lin) * (1 - ramp(t, REW, REW + 0.3, E.lin));
        lost.set({ x: 814, y: 568, center: true, s: 0.7 + 0.3 * E.pop(kl), o: clamp(kl * 4) });
        const kk = ramp(t, GREEN + 0.2, GREEN + 0.7, E.lin);
        V.place(tick, { x: 864, y: 334, s: 0.8 + 0.2 * E.back(kk), o: clamp(kk * 4) });
        A1.drawOn(tick, kk);
      };
    },
  });
})();
