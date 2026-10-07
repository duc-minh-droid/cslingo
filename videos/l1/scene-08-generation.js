/* Lecture 1 · What is NIC?, scene 08-generation: one generation (score, select, recombine, mutate, replace) in slow motion
   on the lecture landscape, then four fast generations. Data: L1.popRun(40, 6, 5, { rec: true }). */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const T = L5.tone;
  const f1 = (n) => n.toFixed(1);

  // ---------- data (asserted against the quoted numbers) ----------
  const RUN = L1.popRun(40, 6, 5, { rec: true });
  const POPS = RUN.map((g) => g.pop);
  const AVG = POPS.map(L1.avgPct);
  const G1 = RUN[1].info;
  const PICKS = POPS[0].map((_, j) => G1.reduce((n, c) => n + (c.p1 === j) + (c.p2 === j), 0));
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const need = (ok, msg) => {
    if (!ok) throw new Error(`scene-08-generation: ${msg}`);
  };
  need(same(POPS[0], [153, 195, 6, 166, 83, 182]), "start population changed");
  need(same(POPS[1], [156, 177, 95, 163, 170, 161]), "generation 1 changed");
  need(same(POPS[5], [164, 163, 169, 166, 176, 167]), "generation 5 changed");
  need(same(PICKS, [4, 1, 1, 4, 0, 2]), `pick counts ${PICKS}`);
  need(same(AVG.map(Math.round), [49, 73, 82, 92, 93, 95]), `averages ${AVG.map(Math.round)}`);
  need(same(G1.map((c) => c.mid), [160, 174, 94, 166, 168, 160]), "midpoints changed");

  // ---------- timeline ----------
  const BASE = 430;
  const PEAK = 90;
  const FAST0 = 10.2; // generations 2..5 run here, 0.5 s each
  const FAST = 0.5;
  const RIB = ["Score", "Select", "Recombine", "Mutate", "Replace"];
  const RIB_W = [110, 120, 190, 130, 140];
  const RIB_TONE = ["orange", "orange", "purple", "purple", "green"];
  const CHANGE = [8.6, ...[0, 1, 2, 3].map((g) => FAST0 + FAST * g)]; // when the generation chip steps up
  const slowGap = (t) => t >= 5 - 0.2 && t < 8.6; // kept for readability of the phase tests

  // the generation being shown at time t
  function genAt(t) {
    if (t < CHANGE[0]) return 0;
    if (t < FAST0) return 1;
    return Math.min(5, 2 + Math.floor((t - FAST0) / FAST));
  }
  const ribbonAt = (t) => {
    if (t < 1.2) return -1;
    if (t < 3) return 0;
    if (t < 5) return 1;
    if (t < 7) return 2;
    if (t < 8.6) return 3;
    if (t < FAST0) return 4;
    return t >= FAST0 + FAST * 4 ? 4 : Math.floor((t - FAST0) / 0.1) % 5;
  };
  const avgAt = (t) => {
    if (t < CHANGE[0]) return AVG[0];
    if (t < FAST0) return lerp(AVG[0], AVG[1], ramp(t, 8.6, 9.4, E.inOut));
    const g = genAt(t);
    return lerp(AVG[g - 1], AVG[g], ramp(t, FAST0 + FAST * (g - 2), FAST0 + FAST * (g - 2) + 0.4, E.inOut));
  };

  V.scene({
    kicker: "THE CYCLE",
    title: ["One generation:", "select, vary, replace"],
    dur: 13,
    caps: [
      [0.4, 2.9, "Score every dot: height is fitness."],
      [3.1, 4.9, "Pick parents: the fitter, the likelier."],
      [5.1, 6.9, "Optional: mix two parents."],
      [7.1, 8.6, "Mutate: nudge each child a little."],
      [8.8, 10.2, "The children become the new population."],
      [10.4, 12.5, "Repeat: the dots climb towards the star."],
    ],
    build(stage) {
      const ls = L1.landscape(stage, { x: 0, w: 936, base: BASE, peak: PEAK, star: 44 });
      const N = POPS[0].length;
      const px = (i) => ls.px(i);
      const cen = (i) => [px(i)[0], px(i)[1] - 16]; // centre of a dot standing on the curve

      // stalks (score) and parent rings and badges (select), arcs (recombine)
      const stalks = POPS[0].map((i) => {
        const ln = V.s("line", {
          "stroke-width": "5",
          "stroke-linecap": "round",
          "stroke-dasharray": "1 11",
          style: { stroke: T("blue").lip },
        });
        ls.under.append(ln);
        return ln;
      });
      const rings = POPS[0].map((i) => {
        const c = V.s("circle", { r: "26", fill: "none", "stroke-width": "5", style: { stroke: T("orange").c } });
        ls.over.append(c);
        return c;
      });
      const badges = POPS[0].map((i, j) => {
        const b = V.h("div", {
          class: "v-tag solid c-orange",
          text: `x${PICKS[j]}`,
          style: { width: "62px", height: "40px", padding: "0", textAlign: "center", lineHeight: "34px", fontSize: "28px" },
        });
        stage.append(b);
        return b;
      });
      const arcs = G1.map((c, k) =>
        [c.p1, c.p2].map((p, side) => {
          const a = cen(POPS[0][p]);
          const b = [px(c.mid)[0], px(c.mid)[1] - 30];
          a[1] -= 14;
          const hi = Math.min(a[1], b[1]) - 46 - 9 * k;
          const d =
            POPS[0][p] === c.mid
              ? `M ${f1(a[0])} ${f1(a[1])} C ${f1(a[0] - 46 + side * 92)} ${f1(a[1] - 74 - 8 * k)} ${f1(a[0] + 46 - side * 92)} ${f1(a[1] - 74 - 8 * k)} ${f1(a[0])} ${f1(a[1])}`
              : `M ${f1(a[0])} ${f1(a[1])} Q ${f1((a[0] + b[0]) / 2)} ${f1(hi)} ${f1(b[0])} ${f1(b[1])}`;
          const path = V.s("path", {
            d,
            fill: "none",
            pathLength: "1",
            "stroke-width": "4",
            "stroke-linecap": "round",
            "stroke-dasharray": "1 1",
            style: { stroke: T("purple").c },
          });
          ls.over.append(path);
          return path;
        }),
      );
      const olds = POPS[0].map(() => ls.dot({ tone: "blue" }));
      const kids = POPS[0].map(() => ls.dot({ tone: "purple", hollow: true }));
      // children that share a midpoint stand slightly apart while they are ghosts
      const spread = G1.map((c, k) => {
        const mates = G1.map((d, m) => (d.mid === c.mid ? m : -1)).filter((m) => m >= 0);
        return mates.length > 1 ? (mates.indexOf(k) ? 15 : -15) : 0;
      });

      // chips
      const genChip = L1.chip(stage, "generation 0", "grey", { x: 0, y: 0, width: 262 });
      const avgChip = L1.chip(stage, "average 49%", "green", { x: 674, y: 0, width: 262 });
      const track = V.h(
        "div",
        {
          style: {
            position: "absolute",
            left: "706px",
            top: "56px",
            width: "200px",
            height: "20px",
            boxSizing: "border-box",
            borderRadius: "10px",
            border: "3px solid var(--line-2)",
            background: "var(--panel-2)",
            overflow: "hidden",
          },
        },
      );
      const fill = V.h("div", {
        style: { height: "100%", width: "0", background: "var(--teal)", borderRight: "3px solid var(--teal-lip)" },
      });
      track.append(fill);
      stage.append(track);

      // ribbon
      const total = RIB_W.reduce((a, b) => a + b, 0) + 4 * 50;
      let left = (936 - total) / 2;
      const rsvg = L5.svg(stage);
      const tags = RIB.map((name, i) => {
        const tag = V.h("div", {
          class: "v-tag c-grey",
          text: name,
          style: { left: f1(left), top: "480px", width: `${RIB_W[i]}px`, height: "56px", padding: "0", textAlign: "center", lineHeight: "50px", fontSize: "30px" },
        });
        if (i === 2) tag.style.borderStyle = "dashed";
        stage.append(tag);
        if (i < 4) {
          const x1 = left + RIB_W[i] + 7;
          rsvg.append(L5.arrow(x1, 508, x1 + 36, 508, "grey", 1, { w: 5, head: 15 }));
        }
        left += RIB_W[i] + 50;
        return tag;
      });
      const arrows = [...rsvg.children];

      return (t) => {
        const pin = (j, d = 0.7) => clamp((t - (d + 0.1 * j)) / 0.35);
        const kRib = clamp((t - 0.3) / 0.8);
        const g = genAt(t);
        const slow = t < FAST0;

        // landscape
        ls.set({ k: ramp(t, 0.3, 1.2, E.inOut), star: ramp(t, 0.9, 1.5, E.lin) });

        // ribbon
        const act = ribbonAt(t);
        tags.forEach((tag, i) => {
          const on = i === act;
          const cls = `v-tag${on ? " solid" : ""} c-${on ? RIB_TONE[i] : "grey"}`;
          if (tag.className !== cls) tag.className = cls;
          if (i === 2) tag.style.borderStyle = "dashed";
          const k = clamp(kRib * 1.6 - 0.15 * i);
          V.place(tag, { s: Math.max(0, E.pop(k)) * (on ? 1.05 : 1), o: clamp(k * 5) });
        });
        arrows.forEach((a, i) => V.show(a, clamp(kRib * 2 - 0.2 * i - 0.2)));

        // chips
        genChip.textContent = `generation ${g}`;
        avgChip.textContent = `average ${Math.round(avgAt(t))}%`;
        const gs = CHANGE.reduce((s, c) => s + flash(t, c, c + 0.35), 0) * 0.08;
        V.place(genChip, { s: Math.max(0, E.pop(clamp((t - 0.4) / 0.5))) * (1 + gs), o: clamp((t - 0.4) * 6) });
        V.place(avgChip, { s: Math.max(0, E.pop(clamp((t - 0.5) / 0.5))), o: clamp((t - 0.5) * 6) });
        fill.style.width = `${f1((avgAt(t) / 100) * 194)}px`;
        V.place(track, { o: clamp((t - 0.6) * 6) });

        // the phases of generation 1, all fading out together while the children take over
        const fade = 1 - ramp(t, 8.6, 9.0, E.lin);
        const old0 = (j) => {
          const dim = j === 4 ? 1 - 0.6 * ramp(t, 3.8, 4.2) : 1;
          const v = pin(j);
          const pulse = 1 + 0.28 * flash(t, 1.2 + 0.25 * j + 0.4, 1.2 + 0.25 * j + 0.75);
          return { i: POPS[0][j], s: Math.max(0, E.pop(v)) * pulse, o: clamp(v * 4) * dim * (slow ? fade : 0) };
        };
        // old dots: generation 0 first, then each replaced generation in the fast part
        if (slow) olds.forEach((d, j) => d.set(old0(j)));
        else {
          const u = clamp((t - FAST0 - FAST * (g - 2)) / FAST);
          const sp = L1.sprout(POPS[g - 1], POPS[g], RUN[g].info.map((c) => c.p1), u);
          olds.forEach((d, j) => d.set({ i: sp.olds[j].i, o: sp.olds[j].o }));
        }
        POPS[0].forEach((idx, j) => {
          const [sx, sy] = [px(idx)[0], px(idx)[1]];
          const k = clamp((t - (1.2 + 0.25 * j)) / 0.5, 0, 1);
          const o = clamp(k * 8) * fade;
          const stalk = stalks[j];
          stalk.setAttribute("x1", f1(sx));
          stalk.setAttribute("x2", f1(sx));
          stalk.setAttribute("y1", f1(BASE));
          stalk.setAttribute("y2", f1(lerp(BASE, sy, E.inOut(k))));
          V.show(stalk, t < 8.6 + 0.4 ? o : 0);
          // select
          const c = cen(idx);
          const rk = Math.max(0, E.pop(clamp((t - (3 + 0.2 * j)) / 0.35)));
          const so = clamp((t - (3 + 0.2 * j)) * 8) * fade;
          rings[j].setAttribute("cx", f1(c[0]));
          rings[j].setAttribute("cy", f1(c[1] + 2));
          V.place(rings[j], { s: rk, o: so });
          const bx = j === 3 ? c[0] - 100 : c[0] - 31;
          const by = j === 3 ? c[1] - 20 : c[1] - 82;
          badges[j].style.left = `${f1(bx)}px`;
          badges[j].style.top = `${f1(by)}px`;
          V.place(badges[j], { s: rk, o: so });
        });
        // recombine arcs, then the ghosts that mutate
        const arcFade = 1 - ramp(t, 7.0, 7.4, E.lin);
        G1.forEach((c, k) => {
          const dk = ramp(t, 5 + 0.2 * k, 5.5 + 0.2 * k, E.inOut);
          arcs[k].forEach((a) => {
            a.setAttribute("stroke-dashoffset", f1(1 - dk));
            V.show(a, dk > 0 ? arcFade : 0);
          });
        });
        if (slow) {
          kids.forEach((d, k) => {
            const c = G1[k];
            const v = (t - (5.45 + 0.2 * k)) / 0.3;
            const slide = ramp(t, 7.3 + 0.05 * k, 8.0 + 0.05 * k, E.inOut);
            const wig = t >= 7 && t < 7.3 ? 4 * Math.sin(Math.PI * 4 * ((t - 7) / 0.3)) : 0;
            const solid = slide > 0.98;
            d.set({
              i: lerp(c.mid, c.kid, slide),
              dx: spread[k] * (1 - slide) + wig,
              s: Math.max(0, E.pop(clamp(v))) * (1.3 - 0.3 * slide) * (1 + 0.25 * flash(t, 8.0 + 0.05 * k, 8.3 + 0.05 * k)),
              o: clamp(v * 4),
              tone: solid ? "blue" : "purple",
              hollow: !solid,
            });
          });
        } else {
          const u = clamp((t - FAST0 - FAST * (g - 2)) / FAST);
          const sp = L1.sprout(POPS[g - 1], POPS[g], RUN[g].info.map((c) => c.p1), u);
          kids.forEach((d, k) => d.set({ i: sp.kids[k].i, tone: "blue", hollow: false }));
        }
      };
    },
  });
  void slowGap;
})();
