/* Phase 4 · scene 06-kruskal: Kruskal sorts every cable by cost and walks down the list, taking a cable unless its two ends are
   already in one group (that would close a loop). Run for real on the example network (A4.KRUSKAL), so every cable, group and
   total below comes from the algorithm log.
   Story (local seconds): 0.2-1.4 towns and grey cables appear, the sorted tiles slide in (0.3-1.2), the blue pointer pops at 1.5.
   Event i (one cable read) starts at T = [1.8, 3.6, 5.4, 7.2, 9.9]. ACCEPT (DE, BC, AC, BD): pointer + blue tile + blue cable and
   rings (0-0.3), the green verdict card "two groups: join them" (0.3-0.7), cable / tile / towns turn green and the group outlines
   merge (0.7-1.1), the total counts up (1.1-1.5), card fades (1.5-1.7). REJECT (AB, 7.2-9.7): a blue token runs A - C - B along the
   tree that already joins them (0.4-1.4), red card "same group: skip it" (1.4-1.9), AB turns red, dashed and crossed (1.9-2.5).
   After BD: the two unread tiles become ghosts with a "never read" tag (11.7-12.4), the total turns solid green and a tick draws on. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the real run, asserted against the storyboard ----------
  const K = A4.KRUSKAL;
  const EV = K.events;
  A4.same(
    "kruskal sorted",
    K.sorted.map((e) => `${e.key} ${e.w}`),
    ["DE 1", "BC 2", "AC 3", "AB 4", "BD 5", "CD 6", "CE 7"],
  );
  A4.same(
    "kruskal accepts",
    EV.map((e) => e.accept),
    [true, true, true, false, true],
  );
  A4.same(
    "kruskal totals",
    EV.map((e) => e.total),
    [1, 3, 6, 6, 11],
  );
  A4.same("kruskal path of AB", EV[3].path, ["A", "C", "B"]);
  A4.same("kruskal loop of AB", EV[3].cycle, ["AC", "BC", "AB"]);
  A4.same("kruskal groups before AC", EV[2].before, [["A"], ["B", "C"], ["D", "E"]]);
  A4.same("kruskal groups after AC", EV[2].after, [
    ["A", "B", "C"],
    ["D", "E"],
  ]);
  A4.same("kruskal groups after BD", EV[4].after, [["A", "B", "C", "D", "E"]]);
  A4.same("kruskal unread", K.unread, ["CD", "CE"]);
  A4.same("kruskal tree", K.tree, ["DE", "BC", "AC", "BD"]);

  // ---------- timeline ----------
  const T = [1.8, 3.6, 5.4, 7.2, 9.9];
  const REJECT = EV.findIndex((e) => !e.accept);
  const END = 11.6; // BD has joined the last two groups
  const GHOST = 11.9; // the two unread tiles become ghosts
  const SLOT_X = (i) => 78 + 130 * i; // centre of tile i
  const ev = (i, u) => [EV[i], u];
  // seconds after T at which each phase of an event ends
  const BLUE = 0.7; // blue (being tested) until here, then green
  const RED_AT = 1.9; // the rejected cable turns red

  // ---------- the groups drawn as outlines (only groups of two or more towns) ----------
  const gkey = (g) => g.join("");
  function blobsAt(t) {
    let i = -1;
    T.forEach((s, n) => {
      if (t >= s) i = n;
    });
    if (i < 0) return [];
    const k = ramp(t - T[i], 0.7, 1.0);
    const map = new Map();
    const add = (groups, w) =>
      groups
        .filter((g) => g.length > 1)
        .forEach((g) => map.set(gkey(g), { set: g, k: (map.get(gkey(g))?.k || 0) + w }));
    add(EV[i].before, 1 - k);
    add(EV[i].after, k);
    return [...map.values()]
      .filter((b) => b.k > 0.003)
      .sort((p, q) => (gkey(p.set) < gkey(q.set) ? -1 : 1))
      .map((b) => ({ set: b.set, tone: "green", dash: false, k: clamp(b.k) }));
  }

  // the time each town turns solid green (the first accepted cable that reaches it)
  const GREEN_AT = {};
  EV.forEach((e, i) => {
    if (e.accept) [e.a, e.b].forEach((x) => (GREEN_AT[x] = Math.min(GREEN_AT[x] ?? 99, T[i] + BLUE)));
  });

  // ---------- the cables ----------
  function cablesAt(t) {
    const out = {};
    A4.EDGE_KEYS.forEach((key, j) => (out[key] = { tone: "grey", k: ramp(t, 0.4 + 0.06 * j, 1.0 + 0.06 * j) }));
    EV.forEach((e, i) => {
      const u = t - T[i];
      if (u < 0) return;
      const st = out[e.key];
      if (u < BLUE || (!e.accept && u < RED_AT)) {
        Object.assign(st, { tone: "blue", solid: true, w: 1 + 0.35 * ramp(u, 0, 0.3), halo: ramp(u, 0, 0.3) });
      } else if (e.accept) {
        Object.assign(st, {
          tone: "green",
          solid: true,
          w: 1 + 0.35 * (1 - ramp(u, BLUE, 1.1)),
          halo: 1 - ramp(u, 0.8, 1.3),
        });
      } else {
        const gone = ramp(u, RED_AT, 2.3);
        Object.assign(st, { tone: "red", dash: true, w: 1 + 0.35 * (1 - gone), halo: 1 - ramp(u, RED_AT, 2.4) });
      }
    });
    // the existing path A - C - B lights up while the token walks it
    const ur = t - T[REJECT];
    const lit = ramp(ur, 0.4, 0.7) * (1 - ramp(ur, RED_AT, 2.3));
    EV[REJECT].path.slice(1).forEach((town, n) => {
      const key = A4.key(EV[REJECT].path[n], town);
      Object.assign(out[key], { halo: lit, w: 1 + 0.2 * lit });
    });
    // the finished tree flashes once
    K.tree.forEach((key) => {
      const fl = flash(t, 12.4, 12.9);
      if (fl > 0) Object.assign(out[key], { halo: 0.8 * fl });
    });
    // the two cables that were never read dim
    K.unread.forEach((key) => (out[key].o = 1 - 0.7 * ramp(t, 11.7, 12.4)));
    return out;
  }

  // ---------- the towns ----------
  function townsAt(t) {
    const out = {};
    A4.TOWNS.forEach((town, j) => {
      const k = ramp(t, 0.2 + 0.06 * j, 0.6 + 0.06 * j, E.lin);
      const st = { tone: "grey", s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) };
      if (t >= GREEN_AT[town]) {
        Object.assign(st, { tone: "green", solid: true });
        st.s *= 1 + 0.18 * flash(t, GREEN_AT[town], GREEN_AT[town] + 0.4);
        if (t > 12.4) st.s *= 1 + 0.08 * flash(t, 12.4, 12.9);
      }
      out[town] = st;
    });
    EV.forEach((e, i) => {
      const u = t - T[i];
      const rk = ramp(u, 0, 0.3) * (1 - (e.accept ? ramp(u, BLUE, 0.95) : ramp(u, RED_AT, 2.2)));
      if (u < 0 || rk <= 0) return;
      [e.a, e.b].forEach((town) => Object.assign(out[town], { ring: "blue", ringK: rk }));
    });
    return out;
  }

  // ---------- the total ----------
  function totalAt(t) {
    let val = 0;
    let bump = 0;
    EV.forEach((e, i) => {
      const from = i ? EV[i - 1].total : 0;
      if (t >= T[i] + 1.1) val = lerp(from, e.total, ramp(t, T[i] + 1.1, T[i] + 1.5));
      if (e.accept) bump = Math.max(bump, flash(t, T[i] + 1.1, T[i] + 1.5));
    });
    return { text: String(Math.round(val)), bump: Math.max(bump, flash(t, 12.4, 12.9)) };
  }

  // ---------- the scene ----------
  V.scene({
    kicker: "KRUSKAL'S ALGORITHM",
    title: ["Cheapest cable first,", "never close a loop"],
    dur: 14,
    caps: [
      [0.4, 1.7, "Sort every cable by cost."],
      [1.9, 4.8, "Take the cheapest cable. It joins two groups."],
      [5.0, 7.1, "Groups merge into one tree."],
      [7.3, 9.7, "AB is next, but A and B are already joined. Skip it."],
      [9.9, 11.6, "BD joins the last two groups."],
      [11.8, 13.7, "Four cables are enough, so the last two are never read."],
    ],
    build(stage) {
      // the network, smaller and lower to leave room for the list on top (AB's pill sits off-centre to leave room for the cross)
      const g = A4.net(stage, { x: 28, y: 150, s: 0.88, blobs: 4, pillAt: { AB: 0.36 } });
      const tiles = A4.tiles(stage, {
        x: 19,
        y: 6,
        items: K.sorted.map((e) => `${e.key} ${e.w}`),
        w: 118,
        h: 56,
        gap: 12,
        fs: 30,
      });
      const total = A4.total(stage, { x: 600, y: 360, w: 324, h: 80, label: "total", tone: "green" });
      const never = A4.tag(stage, { x: 700, y: 76, text: "never read" });

      // the verdict card: a tick or a cross and two lines
      const tickG = L5.tick(40, 40, 64, "green");
      const crossG = L5.cross(40, 40, 64, "red");
      const sym = (g) => {
        const svg = V.s("svg", { width: 80, height: 80 }, g);
        Object.assign(svg.style, { position: "absolute", left: "14px", top: "42px", overflow: "visible" });
        return svg;
      };
      const lines = [0, 1].map((n) =>
        V.h("div", {
          class: "v-text",
          style: { left: "96px", top: `${37 + 44 * n}px`, fontSize: "36px", fontWeight: "900", color: "var(--c-ink)" },
        }),
      );
      const card = V.h("div", {
        class: "v-card plain c-green",
        style: { left: "600px", top: "160px", width: "324px", height: "170px" },
      });
      card.append(sym(tickG), sym(crossG), ...lines);
      stage.append(card);

      // the blue token that walks the existing path of the loop
      const token = A4.token(stage, { tone: "blue", size: 34 });
      const route = EV[REJECT].path.map((town) => [g.pt(town).x, g.pt(town).y]);

      // pictograms on top: the pointer, the cross on AB and the final tick
      const ov = L5.svg(stage);
      const pointer = ov.appendChild(
        V.s("path", {
          d: "M 78 74 L 92 98 L 64 98 Z",
          "stroke-width": "3",
          "stroke-linejoin": "round",
          style: { fill: "var(--blue)", stroke: "var(--blue-lip)" },
        }),
      );
      const abMid = g.mid("AB", 0.62);
      const abCross = ov.appendChild(L5.cross(abMid.x, abMid.y, 46, "red"));
      const doneTick = ov.appendChild(L5.tick(762, 480, 60, "green"));

      return (t) => {
        // network
        const towns = townsAt(t);
        g.update({ edges: cablesAt(t), towns, blobs: blobsAt(t) });

        // the sorted list: slides in, then each tile follows the cable that is read
        tiles.all((i) => {
          const k = ramp(t, 0.3 + 0.08 * i, 0.7 + 0.08 * i);
          const st = { x: -90 * (1 - k), o: Math.min(1, k * 3) };
          if (i < EV.length && t >= T[i]) {
            const [e, u] = ev(i, t - T[i]);
            const open = u < BLUE || (!e.accept && u < RED_AT);
            if (open) Object.assign(st, { tone: "blue", solid: true, s: 1 + 0.1 * flash(u, 0, 0.3) });
            else st.tone = e.accept ? "green" : "red";
          } else if (K.unread.includes(K.sorted[i].key) && t >= 11.7) {
            if (t < GHOST) st.o *= 1 - 0.6 * ramp(t, 11.7, GHOST);
            else Object.assign(st, { ghost: true, o: 0.4 + 0.6 * ramp(t, GHOST, 12.4) });
          }
          return st;
        });
        let at = 0;
        for (let i = 1; i < T.length; i++) if (t >= T[i]) at = lerp(i - 1, i, ramp(t, T[i], T[i] + 0.3, E.inOut));
        const pk = ramp(t, 1.5, 1.8, E.lin);
        V.place(pointer, {
          x: 130 * at,
          s: 0.4 + 0.6 * E.pop(pk),
          o: Math.min(1, pk * 4) * (1 - ramp(t, END + 0.1, END + 0.5)),
        });
        never.set({ k: ramp(t, 12.0, 12.4, E.lin) });

        // the verdict card
        let card_ = { k: 0, o: 1, ok: true, u: 0 };
        EV.forEach((e, i) => {
          const u = t - T[i];
          if (e.accept && u >= 0.3 && u < 1.7)
            card_ = { k: ramp(u, 0.3, 0.7, E.lin), o: 1 - ramp(u, 1.5, 1.7), ok: true, u: u - 0.3 };
          if (!e.accept && u >= 1.4 && u < 2.6)
            card_ = { k: ramp(u, 1.4, 1.9, E.lin), o: 1 - ramp(u, 2.3, 2.6), ok: false, u: u - 1.4 };
        });
        const cls = `v-card plain c-${card_.ok ? "green" : "red"}`;
        if (card.className !== cls) card.className = cls;
        const words = card_.ok ? ["two groups:", "join them"] : ["same group:", "skip it"];
        lines.forEach((l, n) => l.textContent !== words[n] && (l.textContent = words[n]));
        V.place(card, { s: 0.85 + 0.15 * E.pop(card_.k), o: Math.min(1, card_.k * 4) * card_.o });
        V.show(tickG.parentNode, card_.ok ? 1 : 0);
        V.show(crossG.parentNode, card_.ok ? 0 : 1);
        L5.drawOn(tickG, ramp(card_.u, 0.05, 0.35));
        L5.drawOn(crossG, ramp(card_.u, 0.05, 0.35));

        // total
        const tt = totalAt(t);
        total.set({ text: tt.text, bump: tt.bump, k: ramp(t, 1.4, 1.8, E.lin), solid: t >= 12.4 });

        // the walker on the existing path A - C - B, and the cross on AB
        const ur = t - T[REJECT];
        const f = ramp(ur, 0.5, 1.4, E.inOut);
        const p = A4.along(route, f);
        token.set({
          x: p.x,
          y: p.y,
          s: E.pop(ramp(ur, 0.3, 0.55, E.lin)),
          o: ur < 0.3 || ur > 2.2 ? 0 : 1 - ramp(ur, RED_AT, 2.2),
        });
        L5.drawOn(abCross, ramp(ur, RED_AT, 2.3));
        L5.drawOn(doneTick, ramp(t, 12.5, 13.2));
      };
    },
  });
})();
