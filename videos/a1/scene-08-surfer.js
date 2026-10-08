/* Algorithms Phase 1 video (algo-1), scene 08-surfer: the random surfer. On the link-trap web (X->A, A->B, B->A) a blue surfer
   follows a random link 85% of the time and teleports to a random page the other 15%. A dial (a split bar 85 / 15) shows each
   hop's roll as a dot; teleports roll a die and ride the purple dashed edge A->X. Then the hop counter races to 600 while the
   visit-share bars settle, and the reveal marks the exact long-run shares (A 49%, B 46%, X 5%: the teleport floor) and names
   them PageRank. Every hop comes from A1.SURF (no Math.random); the dial dots replay the same random stream. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const S = V.s;
  const f1 = (n) => n.toFixed(1);
  const css = (e, o) => (Object.assign(e.style, o), e);
  const px = (n) => `${f1(n)}px`;

  // ---------- data, checked against the storyboard ----------
  const WEB = A1.WEBS.trap;
  const PATH = A1.SURF.path;
  const COUNTS = A1.SURF.counts;
  const EXACT = A1.stationary(WEB);
  const NAMES = ["A", "B", "X"];
  const HOPS = 10; // hops shown one by one
  const LONG = 600; // hops of the fast forward
  const share = (h, k) => COUNTS[h][k] / (h + 1);
  const ZERO = { A: 0, B: 0, X: 0 };
  const shareAt = (h) => Object.fromEntries(NAMES.map((k) => [k, share(h, k)]));

  // replay the simulation's random stream: the first draw of each hop decides link (below 0.85) or teleport
  const ROLL = (() => {
    const r = A1.rng(5);
    const out = [null];
    for (let h = 1; h <= LONG; h++) {
      out.push(r());
      r();
    }
    return out;
  })();
  for (let h = 1; h <= LONG; h++)
    A1.must(
      (ROLL[h] < A1.D && WEB.out[PATH[h - 1].at].length > 0) === (PATH[h].kind === "link"),
      `scene 8: the replayed roll for hop ${h} disagrees with A1.SURF`,
    );
  const TELE = Array.from({ length: HOPS }, (_, i) => i + 1).filter((k) => PATH[k].kind === "teleport");
  A1.must(
    TELE.join() === "5,9" && PATH[5].at === "X" && PATH[9].at === "X",
    "scene 8: teleports must be hops 5 and 9, to X",
  );
  A1.must(
    NAMES.map((k) => A1.pct(share(HOPS, k))).join() === "55%,27%,18%" &&
      NAMES.map((k) => A1.pct(EXACT[k])).join() === "49%,46%,5%",
    "scene 8: shares after 10 hops (55, 27, 18) or the exact shares (49, 46, 5) changed",
  );

  // ---------- layout (stage px, 936 x 640) ----------
  const WEB_BOX = { web: WEB, x: 0, y: 30, w: 440, h: 400, r: 34, extra: [["A", "X"]] };
  const BARS = { x: 500, y: 36, w: 436, names: NAMES, rowH: 72, max: 0.7 };
  const STAT = { x: 500, y: 276, w: 200, h: 128 };
  const DIAL = { x: 148, y: 494, w: 640, h: 44 };
  const DIE = { x: 836, y: DIAL.y + DIAL.h / 2, size: 56 };
  const SEG = DIAL.x + DIAL.w * A1.D; // where blue ends and purple starts (x 692)

  // ---------- timeline (local seconds) ----------
  const HOP0 = 1.5; // the first hop starts
  const dur = (k) => (PATH[k].kind === "teleport" ? 0.85 : k === 1 ? 0.46 : k === 2 ? 0.38 : 0.34);
  const mv = (k) => (PATH[k] && PATH[k].kind === "teleport" ? 0.7 : 0.78); // share of a hop spent travelling
  const START = [0, HOP0];
  const END = [0];
  for (let k = 1; k <= HOPS; k++) {
    END[k] = START[k] + dur(k);
    START[k + 1] = END[k];
  }
  const ARRIVE = [1.1, ...END.slice(1)]; // surfer on page path[h]
  const LEAVE = ARRIVE.map((_, h) => (h < HOPS ? START[h + 1] + (1 - mv(h + 1)) * dur(h + 1) : 6.25));
  const FF = [6.3, 9.1]; // the fast forward
  const PEG = { A: 9.5, B: 9.65, X: 9.8 }; // exact values appear
  const T_PR = 10.15;
  const T_FLOOR = 10.5;
  A1.must(END[HOPS] <= 6.15, `scene 8: the first ten hops end at ${END[HOPS]}, after 6.15`);

  // ---------- small pieces ----------
  const svgLayer = (parent) => {
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    parent.append(svg);
    return svg;
  };
  const textBox = (parent, text, x, y) => {
    const el = V.h("div", { class: "v-text dim", text, style: { left: px(x), top: px(y), fontSize: "28px" } });
    parent.append(el);
    return el;
  };
  const popK = (t, a, d = 0.4) => ramp(t, a, a + d, E.lin);

  /* a die at (0, 0): faces 1..6, set(face) shows its pips; the group's transform is set by the caller */
  const PIPS = {
    1: [[24, 24]],
    2: [[16, 16], [32, 32]],
    3: [[16, 16], [24, 24], [32, 32]],
    4: [[16, 16], [32, 16], [16, 32], [32, 32]],
    5: [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]],
    6: [[16, 16], [32, 16], [16, 24], [32, 24], [16, 32], [32, 32]],
  }; // prettier-ignore
  function die(parent) {
    const c = T("purple");
    const lip = S("rect", { x: -18, y: -15, width: 36, height: 36, rx: 9 });
    const body = S("rect", { x: -18, y: -18, width: 36, height: 36, rx: 9, "stroke-width": 4 });
    css(lip, { fill: c.lip });
    css(body, { fill: "var(--panel)", stroke: c.c });
    const pips = Array.from({ length: 6 }, () => css(S("circle", { r: 3.6 }), { fill: "var(--ink)" }));
    const g = S("g", {}, lip, body, ...pips);
    parent.append(g);
    return {
      set({ face = 5, x = 0, y = 0, s = 1, r = 0 }) {
        pips.forEach((p, i) => {
          const at = PIPS[face][i];
          if (at) {
            p.setAttribute("cx", f1(at[0] - 24));
            p.setAttribute("cy", f1(at[1] - 24));
          }
          V.show(p, at ? 1 : 0);
        });
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${s.toFixed(3)})`);
      },
    };
  }

  /* the dial: a split bar, 85% blue (follow a link) and 15% purple (teleport); one roll dot per hop */
  function dial(parent) {
    const svg = svgLayer(parent);
    const g = S("g");
    svg.append(g);
    const { x, y, w, h } = DIAL;
    const r = h / 2;
    const left = `M${SEG} ${y}H${x + r}A${r} ${r} 0 0 0 ${x + r} ${y + h}H${SEG}Z`;
    const right = `M${SEG} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${SEG}Z`;
    const seg = (d, tone) => {
      const c = T(tone);
      const lip = css(S("path", { d, transform: "translate(0 5)", "stroke-width": 3, "stroke-linejoin": "round" }), {
        fill: c.lip,
        stroke: c.lip,
      });
      const face = css(S("path", { d, "stroke-width": 3, "stroke-linejoin": "round" }), { fill: c.c, stroke: c.lip });
      g.append(lip, face);
    };
    seg(left, "blue");
    seg(right, "purple");
    const rolls = Array.from({ length: HOPS }, () => {
      const c = css(S("circle", { cy: y + h / 2, "stroke-width": 4 }), { fill: "var(--panel)", stroke: "var(--ink)" });
      g.append(c);
      return c;
    });
    const d = die(g);
    return { g, rolls, d };
  }

  V.scene({
    kicker: "THE RANDOM SURFER",
    title: ["Teleport to escape", "every trap"],
    dur: 12,
    caps: [
      [0.4, 3.0, "The surfer follows a link 85% of the time."],
      [3.2, 5.8, "Otherwise the surfer teleports to a random page."],
      [6.2, 9.0, "Count the visits over many hops."],
      [9.4, 11.6, "The shares settle: that is PageRank."],
    ],
    build(stage) {
      const g = A1.web(stage, WEB_BOX);
      const dl = dial(stage);
      const tagBlue = A1.tag(stage, { text: "follow a link 85%", tone: "blue" });
      const tagTele = A1.tag(stage, { text: "teleport 15%", tone: "purple" });
      const wBlue = Math.ceil(A1.textW("follow a link 85%") + 44);
      const wTele = Math.ceil(A1.textW("teleport 15%") + 44);
      const teleLeft = SEG + (DIAL.x + DIAL.w - SEG) - wTele; // right aligned to the end of the dial
      const blueCx = Math.min(DIAL.x + (SEG - DIAL.x) / 2, teleLeft - 18 - wBlue / 2); // centred, never touching the purple tag
      const noteRoll = textBox(stage, "one roll per hop", DIAL.x + 4, DIAL.y + DIAL.h + 18);
      const noteBars = textBox(stage, "share of visits", BARS.x, 0);
      const b = A1.bars(stage, BARS);
      const stat = A1.stat(stage, { ...STAT, label: "hops", text: "0", tone: "blue" });
      const tagPR = A1.tag(stage, { text: "PageRank", tone: "green", solid: true });
      const tagFloor = A1.tag(stage, { text: "via teleport", tone: "purple" });

      // green pegs on the bars at the exact long-run values
      const pegSvg = svgLayer(stage);
      const pegs = Object.fromEntries(
        NAMES.map((k) => {
          const c = T("green");
          const e = css(S("rect", { x: -4, y: -24, width: 8, height: 48, rx: 4, "stroke-width": 3 }), {
            fill: c.c,
            stroke: c.lip,
          });
          pegSvg.append(e);
          return [k, e];
        }),
      );

      // fast-forward sign: two blue triangles
      const ffSvg = S("svg", { width: 72, height: 44, viewBox: "0 0 72 44" });
      css(ffSvg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      const ffC = T("blue");
      for (const d of ["M4 4L32 22L4 40Z", "M38 4L66 22L38 40Z"])
        ffSvg.append(
          css(S("path", { d, "stroke-width": 5, "stroke-linejoin": "round" }), { fill: ffC.c, stroke: ffC.lip }),
        );
      stage.append(ffSvg);

      const surfer = A1.dot(stage, { size: 30, tone: "blue" });

      const dieFaces = [
        [5, 3, 6, 2],
        [4, 6, 3, 1],
      ]; // three rolling faces, then the one it lands on (1 or 2 = X)
      const quadOut = (x) => 1 - (1 - x) * (1 - x);

      return (t) => {
        // ---- where the surfer is in the first ten hops
        let u = 0;
        if (t > HOP0) {
          u = HOPS;
          for (let k = 1; k <= HOPS; k++)
            if (t < END[k]) {
              u = k - 1 + (t - START[k]) / (END[k] - START[k]);
              break;
            }
        }
        const pos = A1.surfPos(g, PATH, u, mv(Math.min(HOPS, Math.floor(u) + 1)));

        // ---- teleports: purple surfer with a ring, the dashed edge A->X, the die
        let purple = 0;
        let teleEdge = { o: 0, k: 0 };
        let dieT = null; // time since the latest roll started, and which roll
        TELE.forEach((k, j) => {
          const tm = START[k] + (1 - mv(k)) * dur(k); // the jump starts
          purple = Math.max(purple, popK(t, tm - 0.08, 0.16) * (1 - ramp(t, END[k] + 0.1, END[k] + 0.35, E.lin)));
          const o = ramp(t, tm - 0.12, tm + 0.05, E.lin) * (1 - ramp(t, END[k] + 0.15, END[k] + 0.45, E.lin));
          if (o > teleEdge.o) teleEdge = { o, k: ramp(t, tm - 0.05, tm + 0.3, E.out) };
          if (t >= START[k]) dieT = { dt: t - START[k], j };
        });

        // ---- halo on the page the surfer is visiting (blue; purple after a teleport)
        const lit = { A: [0, "blue"], B: [0, "blue"], X: [0, "blue"] };
        ARRIVE.forEach((at, h) => {
          const k = ramp(t, at - 0.1, at + 0.06, E.lin) * (1 - ramp(t, LEAVE[h], LEAVE[h] + 0.22, E.lin));
          const q = PATH[h].at;
          if (k > lit[q][0]) lit[q] = [k, PATH[h].kind === "teleport" ? "purple" : "blue"];
        });

        // ---- visit shares and the hop counter
        let v = { ...ZERO };
        let hops;
        if (t < FF[0]) {
          let k = 0;
          while (k < HOPS && END[k + 1] <= t) k++;
          hops = k;
          if (k >= 1) {
            const e = ramp(t, END[k], END[k] + 0.2, E.out);
            const [a, c] = [k === 1 ? ZERO : shareAt(k - 1), shareAt(k)];
            v = Object.fromEntries(NAMES.map((q) => [q, lerp(a[q], c[q], e)]));
          }
        } else {
          hops = Math.round(HOPS * Math.pow(LONG / HOPS, quadOut(ramp(t, FF[0], FF[1], E.lin))));
          v = shareAt(hops);
        }
        const kr = Object.fromEntries(NAMES.map((q) => [q, ramp(t, PEG[q], PEG[q] + 0.4, E.inOut)]));
        v = Object.fromEntries(NAMES.map((q) => [q, lerp(v[q], EXACT[q], kr[q])]));

        // ---- web: nodes pop, links draw on
        const node = {};
        WEB.names.forEach((q, i) => {
          const k = popK(t, 0.3 + 0.12 * i);
          const [hk, tone] = lit[q];
          const idle = t >= PEG[q] ? "green" : t >= FF[0] + 0.3 ? "blue" : "grey"; // settled pages turn green
          // in the fast forward a page grows with its share of the visits
          const size = lerp(1, 0.8 + 0.7 * v[q], ramp(t, FF[0], FF[0] + 0.5, E.out));
          node[q] = {
            o: Math.min(1, k * 4),
            s: (0.5 + 0.5 * E.pop(k)) * size,
            tone: hk > 0.02 ? tone : idle,
            halo: hk,
          };
        });
        g.update({
          node,
          edge: {
            XA: { k: ramp(t, 0.7, 1.2, E.out) },
            AB: { k: ramp(t, 0.85, 1.35, E.out) },
            BA: { k: ramp(t, 1.0, 1.5, E.out) },
            AX: { o: teleEdge.o, k: teleEdge.k, tone: "purple", dash: true },
          },
        });

        // ---- the surfer
        const out = ramp(t, 6.2, 6.5, E.lin);
        surfer.set({
          x: pos.x,
          y: pos.y,
          s: E.pop(popK(t, 0.9)) * (1 - 0.3 * out),
          o: Math.min(1, popK(t, 0.9, 0.2) * 4) * (1 - out),
          tone: purple > 0.5 ? "purple" : "blue",
          ring: purple,
        });

        // ---- the dial: pops in, one dot per hop, the die rolls at each teleport
        const dk = popK(t, 0.9, 0.6);
        V.place(dl.g, { s: 0.9 + 0.1 * E.pop(dk), y: (1 - E.out(dk)) * 10, o: Math.min(1, dk * 3) });
        const rollsOut = 1 - ramp(t, 6.1, 6.4, E.lin);
        dl.rolls.forEach((c, i) => {
          const k = i + 1;
          const pk = popK(t, START[k], 0.18);
          const sz = 9 * (0.4 + 0.6 * E.pop(pk)) * (1 + 0.45 * flash(t, START[k], START[k] + 0.4));
          c.setAttribute("cx", f1(DIAL.x + ROLL[k] * DIAL.w));
          c.setAttribute("r", f1(sz));
          V.show(c, Math.min(1, pk * 4) * rollsOut);
        });
        let face = 5;
        let spin = 0;
        let roll = 0;
        if (dieT) {
          const seq = dieFaces[dieT.j];
          face = seq[Math.min(3, Math.floor(dieT.dt / 0.065))];
          roll = flash(t, t - dieT.dt, t - dieT.dt + 0.45);
          spin = 16 * Math.sin((2 * Math.PI * dieT.dt) / 0.13) * (1 - ramp(dieT.dt, 0, 0.3, E.lin));
        }
        dl.d.set({ face, x: DIE.x, y: DIE.y, s: (DIE.size / 48) * (1 + 0.25 * roll), r: spin });
        tagBlue.set({ x: blueCx, y: DIAL.y - 38, center: true, ...tagPop(dk) });
        tagTele.set({ x: DIAL.x + DIAL.w - wTele, y: DIAL.y - 64, ...tagPop(dk) });
        V.place(noteRoll, { y: (1 - E.out(dk)) * 8, o: Math.min(1, dk * 3) * rollsOut });

        // ---- visit shares and the hop counter
        const bk = popK(t, 0.6);
        b.update({ vals: v, text: Object.fromEntries(NAMES.map((q) => [q, A1.pct(v[q])])), o: Math.min(1, bk * 3) });
        V.place(noteBars, { y: (1 - E.out(bk)) * 8, o: Math.min(1, bk * 3) });
        const pulse = [6.5, 7.5, 8.5].reduce((m, a) => Math.max(m, flash(t, a, a + 0.3)), 0);
        const sk = popK(t, 0.8);
        stat.set({ text: String(hops), s: (0.8 + 0.2 * E.pop(sk)) * (1 + 0.07 * pulse), o: Math.min(1, sk * 4) });
        NAMES.forEach((q) => {
          const k = popK(t, PEG[q], 0.35);
          pegs[q].setAttribute(
            "transform",
            `translate(${f1(b.xAt(EXACT[q]))} ${f1(b.rowY(q))}) scale(${f1(E.pop(k))} ${f1(E.pop(k))})`,
          );
          V.show(pegs[q], Math.min(1, k * 4));
        });

        // ---- fast-forward sign, then the reveal tags
        const ff = ramp(t, FF[0] - 0.1, FF[0] + 0.25, E.lin) * (1 - ramp(t, FF[1] + 0.1, FF[1] + 0.35, E.lin));
        V.place(ffSvg, { x: 726, y: STAT.y + STAT.h / 2 - 22, s: 0.8 + 0.2 * E.pop(ff), o: ff });
        const pr = popK(t, T_PR);
        tagPR.set({ x: 736, y: STAT.y + STAT.h / 2 - 28, ...tagPop(pr) });
        const fl = popK(t, T_FLOOR);
        tagFloor.set({ x: b.left + 56, y: b.rowY("X") - 26, ...tagPop(fl) });
      };

      function tagPop(k) {
        return { s: 0.8 + 0.2 * E.pop(k), dy: (1 - E.out(clamp(k))) * 8, o: Math.min(1, k * 3) };
      }
    },
  });
})();
