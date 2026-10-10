/* Phase 4 · scene 05-prim: Prim grows one tree, cheapest cable first. A4.PRIM = Prim run for real from town A on the example
   network (lessons 4.3 and 4.5); every state below comes from its step log.
   Story (local seconds): 0.2-1.2 the network pops in, 1.2-1.6 town A joins (start tag, total 0). Four steps of 2.6 s from 1.6:
   the cables leaving the tree turn orange and their tiles pop in (u 0-0.5), the cheapest tile is chosen (0.6-1.0), its cable
   and town turn green (1.0-1.6), the total counts up (1.6-2.2), the tiles fade (2.2-2.6). Step 3 also dims the cable that sits
   inside the tree (ignored): it is drawn dashed with a grey cross and an 'ignored' tag. A candidate that is not taken turns grey
   (never a faded orange, so its text stays readable). 12.0-12.8 the whole tree lights up, 'cheapest tree' tag and tick. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

  const P = A4.PRIM;
  A4.same("scene 5: Prim order", P.order, ["AC", "BC", "BD", "DE"]);
  A4.same(
    "scene 5: Prim totals",
    P.steps.map((s) => s.total),
    [3, 5, 10, 11],
  );
  A4.same(
    "scene 5: Prim picks are the cheapest candidates",
    P.steps.map((s) => s.pick.key === s.cands[0].key),
    [true, true, true, true],
  );

  const FIRST = 1.6; // step 0 starts here
  const STEP = 2.6;
  const END = FIRST + STEP * P.steps.length; // 12.0: every town is in
  const GREY = 0.6; // opacity of a cable that is not in play
  const SLOTS = 4; // candidate tiles
  const at = (k) => FIRST + STEP * k;
  const grey = (o, extra = {}) => ({ tone: "grey", o, pillO: Math.min(1, o + 0.25), ...extra });
  const tileText = (c) => `${c.key} ${c.w}`;

  /* which step is running, and how many seconds into it (k = -1 before the first step) */
  const stepOf = (t) => {
    if (t < FIRST) return { k: -1, u: t - FIRST };
    const k = Math.min(P.steps.length - 1, Math.floor((t - FIRST) / STEP));
    return { k, u: t - at(k) };
  };

  /* every cable: grey, orange (a candidate), green (in the tree) or dimmed (inside the tree, not needed) */
  function edgeStates(t, k, u) {
    const out = {};
    A4.EDGE_KEYS.forEach((key, i) => {
      if (k < 0) {
        const draw = ramp(t, 0.6 + 0.05 * i, 0.95 + 0.05 * i, lin);
        out[key] = grey(lerp(1, GREY, ramp(t, 1.2, 1.6, lin)), { k: draw });
        return;
      }
      const st = P.steps[k];
      const ci = st.cands.findIndex((c) => c.key === key);
      let e = grey(GREY);
      if (k > 0 && P.steps[k - 1].tree.includes(key)) e = { tone: "green", solid: true, w: 1.2 };
      else if (st.inside.includes(key)) {
        // both ends are in the tree: dashed and crossed out (the cross is drawn in the overlay)
        const was = k > 0 && P.steps[k - 1].inside.includes(key);
        e = { tone: "grey", dash: true, o: was ? 0.8 : lerp(GREY, 0.8, ramp(u, 0, 0.4, lin)), pillO: 1 };
      } else if (ci >= 0 && u >= 0.08 * ci) {
        if (key === st.pick.key && u >= 1.0) e = { tone: "green", solid: true, w: 1.2, halo: flash(u, 1.0, 1.7) };
        else if (u >= 1.0) e = grey(lerp(0.85, GREY, ramp(u, 1.0, 1.5, lin)));
        else e = { tone: "orange", solid: true, w: 1.2, halo: 1 - ramp(u, 0.08 * ci, 0.08 * ci + 0.5, lin) };
      }
      if (t >= END && P.tree.includes(key)) e = { ...e, halo: Math.max(e.halo || 0, ramp(t, END, END + 0.4, lin)) };
      out[key] = e;
    });
    return out;
  }

  /* every town: grey until it joins the tree, then solid green with a pop */
  function townStates(t, k, u) {
    const out = {};
    A4.TOWNS.forEach((name, i) => {
      const p = ramp(t, 0.2 + 0.08 * i, 0.55 + 0.08 * i, lin);
      let s = E.pop(p);
      let solid = false;
      if (k < 0) {
        if (name === "A" && t >= 1.2) solid = true;
        if (name === "A") s *= 1 + 0.2 * flash(t, 1.2, 1.6);
      } else {
        const st = P.steps[k];
        if (st.X.includes(name)) solid = true;
        if (name === st.town && u >= 1.15) {
          solid = true;
          s *= 1 + 0.22 * flash(u, 1.15, 1.6);
        }
      }
      if (t >= END) s *= 1 + 0.12 * flash(t, END + 0.06 * i, END + 0.4 + 0.06 * i);
      out[name] = { tone: solid ? "green" : "grey", solid, s, o: Math.min(1, 4 * p) };
    });
    return out;
  }

  V.scene({
    kicker: "PRIM'S ALGORITHM",
    title: ["Prim grows one tree,", "cheapest cable first"],
    dur: 13.5,
    caps: [
      [0.4, 2.7, "Start anywhere. List the cables leaving the tree."],
      [2.8, 6.0, "Take the cheapest one. A new town joins."],
      [6.2, 9.4, "Repeat. A cable inside the tree is ignored."],
      [9.6, 11.2, "DE 1 is the cheapest. E joins."],
      [11.3, 13.3, "Every town is in. The cheapest tree costs 11."],
    ],
    build(stage) {
      const g = A4.net(stage, { x: 24, y: 20, s: 1 });
      const cand = A4.tiles(stage, {
        x: 650,
        y: 20,
        items: ["AC 3", "AB 4", "BC 2", "CD 6"],
        w: 270,
        h: 56,
        gap: 10,
        dir: "col",
        fs: 32,
        tone: "orange",
      });
      const tot = A4.total(stage, { x: 650, y: 330, w: 270, h: 80, label: "tree cost", tone: "green" });
      const start = A4.tag(stage, { x: 14, y: 306, text: "start", tone: "green" });
      // 'ignored' sits beside the crossed-out cable: AB in step 2, CD in step 3
      const IGN = { AB: 0.76, CD: 0.78 };
      const ignAt = { AB: { x: 14, y: 64 }, CD: { x: 266, y: 150 } };
      const ignored = Object.fromEntries(
        Object.keys(IGN).map((key) => [key, A4.tag(stage, { ...ignAt[key], text: "ignored", tone: "grey" })]),
      );
      const best = A4.tag(stage, { x: 650, y: 440, text: "cheapest tree", tone: "green", solid: true });
      const svg = L5.svg(stage);
      const tick = svg.appendChild(L5.tick(780, 540, 64, "green"));
      // a grey cross on every cable that is inside the tree but not in it
      const crosses = Object.fromEntries(
        Object.keys(IGN).map((key) => {
          const m = g.mid(key, IGN[key]);
          return [key, svg.appendChild(L5.cross(m.x, m.y, 34, "grey", { ink: true, w: 6 }))];
        }),
      );

      return (t) => {
        const { k, u } = stepOf(t);
        g.update({ edges: edgeStates(t, k, u), towns: townStates(t, k, u) });

        // the candidate tiles: slot i shows cands[i] of the current step (cheapest first)
        for (let i = 0; i < SLOTS; i++) {
          const c = k >= 0 ? P.steps[k].cands[i] : null;
          if (!c) {
            cand.set(i, { o: 0 });
            continue;
          }
          const p = ramp(u, 0.08 * i, 0.08 * i + 0.35, lin);
          const fade = 1 - ramp(u, 2.2, 2.6, lin);
          const e = {
            text: tileText(c),
            y: (E.out(p) - 1) * 16 - 10 * (1 - fade),
            s: 0.8 + 0.2 * E.pop(p),
            o: Math.min(1, 4 * p) * fade,
          };
          if (i === 0) {
            e.s *= 1 + 0.06 * flash(u, 0.6, 1.0) + 0.06 * flash(u, 1.0, 1.4);
            if (u >= 1.0) Object.assign(e, { tone: "green", solid: true });
            else if (u >= 0.6) Object.assign(e, { tone: "orange", solid: true });
          } else if (u >= 1.0) e.tone = "grey"; // not taken: grey, not a faded orange
          cand.set(i, e);
        }

        // the running tree cost
        const prev = k > 0 ? P.steps[k - 1].total : 0;
        const now = k >= 0 ? P.steps[k].total : 0;
        const count = Math.round(lerp(prev, now, ramp(u, 1.6, 2.2, lin)));
        tot.set({
          text: String(count),
          k: ramp(t, 1.2, 1.6, lin),
          bump: Math.max(flash(u, 1.6, 2.2), flash(t, END, END + 0.4)),
          solid: t >= END,
        });

        // tags and the tick
        start.set({ k: ramp(t, 1.3, 1.7, lin) });
        // the crosses stay for as long as their cable is inside the tree; the tag shows for the first 1.6 s of that step
        const showTag = (step) => (k === step ? ramp(u, 0.2, 0.6, lin) * (1 - ramp(u, 1.5, 1.8, lin)) : 0);
        const inside = (key) => (k >= 0 ? P.steps[k].inside.includes(key) : false);
        const crossK = (key) => (inside(key) ? ramp(k === (key === "AB" ? 2 : 3) ? u : 9, 0.1, 0.5, lin) : 0);
        ignored.AB.set({ k: showTag(2) });
        ignored.CD.set({ k: showTag(3) });
        Object.keys(crosses).forEach((key) => {
          L5.drawOn(crosses[key], crossK(key));
          V.show(crosses[key], crossK(key) > 0 ? 1 : 0);
        });
        best.set({ k: ramp(t, END, END + 0.5, lin) });
        L5.drawOn(tick, ramp(t, END + 0.2, END + 0.7, lin));
      };
    },
  });
})();
