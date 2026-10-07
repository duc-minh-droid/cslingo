/* Lecture 6 · Genetic programming, scene 04-grow: random programs from two sets of parts.
   Left: two bins, Functions (purple tiles + - x ÷ IF) and Terminals (blue tiles X 2 4 7). Right: three lanes, one per level, with a
   dashed "depth limit" under level 3. A small dice hops over the bins (the picks are a fixed list, so every frame is repeatable),
   lands on a tile (the chosen one turns orange) and a copy of it flies into a dashed "?" slot of the tree. The root can only be a
   function. At level 3, the last one, the Functions bin is locked (and the Terminals bin gets a green tick): only terminals
   are allowed, so the tree stops growing. The result is (x + 2) × 4, read back token by token.
   Every rule below is checked against the real tree when the scene is built. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, show, ramp, ease, lerp, clamp, flash } = V;
  const lin = ease.lin;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, lin);
  const f1 = (v) => v.toFixed(1);
  const pillW = (text) => Math.max(44, text.length * 16.8 + 26); // the width of a 28 px pill
  const setClass = (e, c) => e.getAttribute("class") !== c && e.setAttribute("class", c);

  // ---------- the rules: two sets of parts, 3 levels, and the picks (the last candidate of each is the choice) ----------
  const LIMIT = 3;
  const FUNS = ["+", "-", "*", "/", "IF"];
  const TERMS = ["X", "2", "4", "7"];
  const ROOT = L.parse("(*#root (+#plus X#x 2#two) 4#four)");
  // the formula, token by token: [text, colour, the tree node it stands for, the step it appears in]
  const TOKENS = [
    ["(", "ink", null, 0],
    ["x", "blue", "x", 0],
    [" + ", "violet", "plus", 1],
    ["2", "blue", "two", 2],
    [")", "ink", null, 2],
    [" × ", "violet", "root", 3],
    ["4", "blue", "four", 4],
  ];
  const STEP = 0.2; // one beat of reading the tree back as a formula
  const tokenAt = (step) => FORM_AT + 0.2 + step * STEP;
  const PICKS = [
    { id: "root", cands: ["-", "IF", "*"], t0: 3.6 },
    { id: "plus", cands: ["X", "/", "+"], t0: 5.15 },
    { id: "four", cands: ["IF", "4"], t0: 6.7 },
    { id: "x", cands: ["4", "X"], t0: 9.5 },
    { id: "two", cands: ["4", "2"], t0: 10.75 },
  ];
  const JUMP = 0.24; // seconds per move of the dice ...
  const DWELL = 0.4; // ... of which the first part is spent sitting on a tile
  const SETTLE = 0.2; // the dice rests on the chosen tile
  const FLY = 0.46; // the copy flies into its slot
  PICKS.forEach((p) => {
    p.n = p.cands.length;
    p.arrive = p.t0 + (p.n - 1) * JUMP;
    p.take = p.arrive + SETTLE;
    p.land = p.take + FLY;
  });
  const PICK = Object.fromEntries(PICKS.map((p) => [p.id, p]));

  // the rules are checked on the real tree: level 1 is a function, a function never sits on the last level, and every pick comes
  // from the bins the rules allow at its level (root: functions only, last level: terminals only, between: both)
  const LEVEL = {};
  L.walk(ROOT, (n, parent, d) => (LEVEL[n.id] = d + 1));
  if (L.depth(ROOT) + 1 !== LIMIT) throw new Error(`scene 04: the tree has ${L.depth(ROOT) + 1} levels, not ${LIMIT}`);
  L.walk(ROOT, (n) => {
    if (n.kids.length && LEVEL[n.id] >= LIMIT) throw new Error(`scene 04: function ${n.label} on the last level`);
    const p = PICK[n.id];
    const allowed = LEVEL[n.id] === 1 ? FUNS : LEVEL[n.id] === LIMIT ? TERMS : [...FUNS, ...TERMS];
    if (!p || p.cands[p.n - 1] !== n.label)
      throw new Error(`scene 04: the pick for ${n.id} does not end on ${n.label}`);
    if (p.cands.some((c) => !allowed.includes(c))) throw new Error(`scene 04: a pick for ${n.id} breaks the rules`);
    if (n.kids.length === 0 && LEVEL[n.id] === 1) throw new Error("scene 04: the root must be a function");
  });
  const FORMULA = L.formula(ROOT); // "(x + 2) × 4"
  if (TOKENS.map((k) => k[0]).join("") !== FORMULA) throw new Error(`scene 04: tokens differ from ${FORMULA}`);

  // ---------- the other timings (local seconds) ----------
  const LANE_AT = 2.8; // the three lanes slide out
  const LIMIT_AT = 3.15; // the dashed depth limit and its label
  const ROOT_SLOT = 3.25;
  const LAST_AT = 7.85; // level 3 turns orange, its slots appear
  const LOCK = { in: 8.7, shut: 9.0, grey: 9.1 }; // the padlock pops in open, snaps shut, the bin turns grey; then the tick
  const FORM_AT = 11.6; // the formula card; its tokens (and the tree nodes they stand for) light up one step at a time
  const PENDING = 0.8; // opacity of the edge to a slot that is still empty
  const SLOT_AT = { root: ROOT_SLOT, plus: PICK.root.land, four: PICK.root.land, x: LAST_AT, two: LAST_AT };

  // ---------- layout (stage px) ----------
  const NODE = 64; // tree tile
  const BIN_TILE = 56;
  const LANE = { x: 352, w: 572, h: 144, y0: 30, pitch: 150 };
  const rowY = (d) => LANE.y0 + LANE.h / 2 + d * LANE.pitch; // 102, 252, 402
  const BINS = {
    fun: { x: 12, y: 24, w: 312, h: 264, tone: "purple", title: "Functions", at: 0.4 },
    ter: { x: 12, y: 316, w: 312, h: 176, tone: "blue", title: "Terminals", at: 1.4 },
  };
  const SPOTS = [
    ["+", "fun", 72, 150],
    ["-", "fun", 156, 150],
    ["*", "fun", 240, 150],
    ["/", "fun", 114, 238],
    ["IF", "fun", 198, 238],
    ["X", "ter", 51, 442],
    ["2", "ter", 121, 442],
    ["4", "ter", 191, 442],
    ["7", "ter", 261, 442],
  ].map(([label, bin, x, y], i) => ({
    label,
    bin,
    x: x + BINS[bin].x,
    y,
    at: i < 5 ? 0.7 + i * 0.1 : 1.7 + (i - 5) * 0.1,
  }));
  const SPOT = Object.fromEntries(SPOTS.map((sp) => [sp.label, sp]));
  const LOCK_X = BINS.fun.x + BINS.fun.w - 16 - 24; // the padlock and the tick sit at the right end of each bin's title row
  const LIMIT_Y = LANE.y0 + 2 * LANE.pitch + LANE.h + 26; // the dashed line under level 3 (500)

  // what the dice does to each tile: sit on it (hover) or settle on it (chosen)
  const EVENTS = {};
  PICKS.forEach((p) =>
    p.cands.forEach((c, i) => {
      const last = i === p.n - 1;
      const a = p.t0 + i * JUMP;
      (EVENTS[c] = EVENTS[c] || []).push({ a, d: last ? p.take + 0.1 : a + JUMP * DWELL, chosen: last, take: p.take });
    }),
  );
  const PIPS = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  }; // prettier-ignore
  const FACES = [3, 5, 2, 6, 1, 4];

  /** The dice: a neutral sticker with up to six pips; face(n) shows n pips. */
  function makeDice(parent) {
    const lip = s("rect", { x: -22, y: -18, width: 44, height: 44, rx: 12 });
    const face = s("rect", { x: -22, y: -22, width: 44, height: 44, rx: 12, "stroke-width": 3 });
    lip.style.fill = "var(--line-2)";
    Object.assign(face.style, { fill: "var(--panel)", stroke: "var(--line-2)" });
    const pips = Array.from({ length: 6 }, () => {
      const c = s("circle", { r: 4.6 });
      c.style.fill = "var(--ink)";
      return c;
    });
    const g = s("g", {}, lip, face, ...pips);
    parent.append(g);
    return {
      g,
      face(n) {
        pips.forEach((c, i) => {
          const p = PIPS[n][i]; // an unused pip is hidden and parked at the centre, so the frame never depends on the last face
          c.setAttribute("cx", String(p ? p[0] * 11 : 0));
          c.setAttribute("cy", String(p ? p[1] * 11 : 0));
          show(c, p ? 1 : 0);
        });
      },
    };
  }

  /** A small orange padlock; open(k): 1 = shackle raised, 0 = shut. */
  function makeLock(parent) {
    const shackle = s("path", {
      d: "M-11 0V-12A11 11 0 0 1 11 -12V0",
      fill: "none",
      "stroke-width": 7,
      "stroke-linecap": "round",
    });
    shackle.style.stroke = "var(--c-lip)";
    const arm = s("g", {}, shackle);
    const lip = s("rect", { x: -21, y: 1, width: 42, height: 32, rx: 9 });
    const face = s("rect", { x: -21, y: -3, width: 42, height: 32, rx: 9, "stroke-width": 3 });
    const hole = s("circle", { cx: 0, cy: 10, r: 4.6 });
    const slot = s("rect", { x: -2.2, y: 12, width: 4.4, height: 9, rx: 2 });
    lip.style.fill = "var(--c-lip)";
    Object.assign(face.style, { fill: "var(--c)", stroke: "var(--c-lip)" });
    hole.style.fill = slot.style.fill = "var(--c-on)";
    const g = s("g", { class: "c-orange" }, arm, lip, face, hole, slot);
    parent.append(g);
    return {
      g,
      draw(x, y, sc, open) {
        arm.setAttribute("transform", `translate(0 ${f1(-10 * open)})`);
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${sc.toFixed(3)})`);
        show(g, sc > 0.01 ? 1 : 0);
      },
    };
  }

  V.scene({
    kicker: "RANDOM PROGRAMS",
    title: ["Random programs from", "two sets of parts"],
    dur: 14,
    caps: [
      [0.4, 3.5, "Build programs from two sets: functions and terminals."],
      [4, 9, "Grow downwards, picking parts at random."],
      [9.5, 13.5, "At the depth limit only terminals are allowed, so it stops."],
    ],
    build(stage) {
      // ----- HTML first (everything drawn below the shared SVG layer): lanes, the limit line, bins, the formula card -----
      const lanes = [0, 1, 2].map((d) => {
        const el = h("div", {
          style: {
            position: "absolute",
            left: `${LANE.x}px`,
            top: `${LANE.y0 + d * LANE.pitch}px`,
            height: `${LANE.h}px`,
            boxSizing: "border-box",
            border: "3px solid var(--line-2)",
            borderRadius: "20px",
            background: "var(--panel-2)",
          },
        });
        return el;
      });
      const lastGlow = h("div", {
        style: {
          position: "absolute",
          inset: "-3px",
          border: "3px solid var(--amber-edge)",
          borderRadius: "20px",
          background: "var(--amber-dim)",
        },
      });
      lanes[2].append(lastGlow);
      const limitLine = h("div", {
        style: {
          position: "absolute",
          left: `${LANE.x}px`,
          top: `${LIMIT_Y - 2}px`,
          height: "0",
          borderTop: "4px dashed var(--text-faint)",
        },
      });
      stage.append(...lanes, limitLine);

      const cards = {};
      Object.entries(BINS).forEach(([id, b]) => {
        const tag = h("div", { class: `v-tag solid c-${b.tone}`, text: b.title, style: { left: "16px", top: "14px" } });
        const card = h(
          "div",
          {
            class: `v-card c-${b.tone}`,
            style: { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` },
          },
          tag,
        );
        stage.append(card);
        cards[id] = { card, tag };
      });

      const WF = 520;
      const progTag = h("div", { class: "v-tag c-grey", text: "program", style: { position: "relative" } });
      const toks = TOKENS.map(([text, tone]) =>
        h("span", {
          text,
          style: {
            display: "inline-block",
            whiteSpace: "pre",
            color: tone === "ink" ? "var(--ink)" : `var(--${tone}-ink)`,
          },
        }),
      );
      const formula = h(
        "div",
        { style: { fontSize: "52px", fontWeight: "900", lineHeight: "1", whiteSpace: "pre" } },
        ...toks,
      );
      const formulaCard = h(
        "div",
        {
          class: "v-card plain",
          style: {
            left: `${LANE.x + (LANE.w - WF) / 2}px`,
            top: "536px",
            width: `${WF}px`,
            height: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "22px",
          },
        },
        progTag,
        formula,
      );
      stage.append(formulaCard);

      // the green tick that pairs with the padlock: terminals are still allowed on the last level
      const okTick = L.tick(38, "green", true);
      const okBadge = h(
        "div",
        {
          class: "c-green",
          style: {
            position: "absolute",
            left: `${LOCK_X - 22}px`,
            top: `${BINS.ter.y + 3 + 14 + 29 - 22}px`,
            width: "44px",
            height: "44px",
            boxSizing: "border-box",
            borderRadius: "50%",
            background: "var(--c)",
            border: "3px solid var(--c-lip)",
            boxShadow: "0 4px 0 var(--c-lip)",
          },
        },
        okTick,
      );
      stage.append(okBadge);

      // ----- SVG: bin tiles, ghost slots, the tree, the flying copies, pills, lock, dice, rings -----
      SPOTS.forEach((sp) => (sp.tile = L.tile(stage, sp.label, { size: BIN_TILE })));
      const top = rowY(0) - NODE / 2;
      const tr = L.tree(stage, {
        root: ROOT,
        x: LANE.x,
        y: top,
        w: LANE.w,
        h: 640 - top,
        node: NODE,
        rows: LANE.pitch / NODE,
        room: 0,
        hidden: true,
      });
      tr.all().forEach((id) => {
        if (Math.abs(tr.pos(id).y - rowY(LEVEL[id] - 1)) > 0.5) throw new Error(`scene 04: ${id} is not on its lane`);
      });
      const ghosts = {};
      tr.all().forEach((id) => (ghosts[id] = L.tile(stage, "?", { size: NODE, tone: "grey", look: "ghost" })));
      const flyers = {};
      PICKS.forEach((p) => (flyers[p.id] = L.tile(stage, tr.node(p.id).label, { size: NODE, tone: "orange" })));
      const lay = L.layer(stage);
      const levelPills = [0, 1, 2].map((d) => L.pill(stage, `level ${d + 1}`, { tone: "grey", look: "soft", o: 0 }));
      const limitPill = L.pill(stage, "depth limit 3", { tone: "grey", look: "soft", o: 0 });
      const lastPill = L.pill(stage, "last level", { tone: "orange", o: 0 });
      const rings = PICKS.map(() => {
        const c = s("circle", { fill: "none", "stroke-width": 5 });
        c.style.stroke = "var(--c)";
        lay.badges.append(c);
        return c;
      });
      PICKS.forEach((p) => lay.badges.append(flyers[p.id].g)); // the flying copies travel above the pills
      const lock = makeLock(lay.badges);
      const dice = makeDice(lay.badges);

      // ----- one frame of each part -----
      function drawGuide(t) {
        lanes.forEach((el, d) => {
          const k = ramp(t, LANE_AT + d * 0.2, LANE_AT + d * 0.2 + 0.45, ease.out);
          el.style.width = `${f1(LANE.w * k)}px`;
          show(el, k > 0.001 ? 1 : 0);
          const text = `level ${d + 1}`;
          const last = d === 2 && t >= LAST_AT + 0.1;
          levelPills[d].apply({
            text,
            tone: last ? "orange" : "grey",
            look: "soft",
            x: LANE.x + 16 + pillW(text) / 2,
            y: rowY(d),
            s: pop(t, LANE_AT + d * 0.2 + 0.3, 0.4),
            o: fade(t, LANE_AT + d * 0.2 + 0.3, 0.1),
          });
        });
        show(lastGlow, ramp(t, LAST_AT, LAST_AT + 0.3, lin));
        const lk = ramp(t, LIMIT_AT, LIMIT_AT + 0.5, ease.out);
        limitLine.style.width = `${f1(LANE.w * lk)}px`;
        show(limitLine, lk > 0.001 ? 1 : 0);
        limitPill.apply({
          text: "depth limit 3",
          tone: "grey",
          look: "soft",
          x: LANE.x + LANE.w - 30 - pillW("depth limit 3") / 2,
          y: LIMIT_Y,
          s: pop(t, LIMIT_AT + 0.35, 0.4),
          o: fade(t, LIMIT_AT + 0.35, 0.1),
        });
        const lastW = pillW("last level");
        lastPill.apply({
          text: "last level",
          tone: "orange",
          x: LANE.x + LANE.w - 24 - lastW / 2,
          y: rowY(2),
          s: pop(t, LAST_AT + 0.25, 0.4),
          o: fade(t, LAST_AT + 0.25, 0.1),
        });
      }

      function drawBins(t) {
        const locked = t >= LOCK.grey;
        Object.entries(BINS).forEach(([id, b]) => {
          const k = fade(t, b.at, 0.3);
          const tone = id === "fun" && locked ? "grey" : b.tone;
          setClass(cards[id].card, `v-card c-${tone}`);
          setClass(cards[id].tag, `v-tag solid c-${tone}`);
          place(cards[id].card, { y: (1 - ease.out(k)) * 12, o: k });
        });
        SPOTS.forEach((sp) => {
          const st = { x: sp.x, y: sp.y, s: pop(t, sp.at), o: fade(t, sp.at, 0.15) };
          if (sp.bin === "fun" && locked) Object.assign(st, { tone: "grey", look: "soft" });
          let hover = 0;
          let chosen = 0;
          let bump = 0;
          for (const e of EVENTS[sp.label] || []) {
            const a = ramp(t, e.a, e.a + 0.05, lin);
            if (e.chosen) {
              chosen = Math.max(chosen, a * (1 - ramp(t, e.take + 0.2, e.take + 0.35, lin)));
              bump = Math.max(bump, flash(t, e.a, e.a + 0.3));
            } else hover = Math.max(hover, a * (1 - ramp(t, e.d, e.d + 0.05, lin)));
          }
          if (hover > 0) Object.assign(st, { halo: 0.6 * hover, s: st.s * (1 + 0.08 * hover) });
          if (chosen > 0.5) Object.assign(st, { tone: "orange", halo: 1, pulse: 0.8 * bump });
          sp.tile.apply(st);
        });
        const open = 1 - ramp(t, LOCK.shut, LOCK.shut + 0.15, ease.in);
        const sc = pop(t, LOCK.in, 0.35) * (1 + 0.25 * flash(t, LOCK.shut + 0.05, LOCK.shut + 0.35));
        lock.draw(LOCK_X, BINS.fun.y + 14 + 28, sc, open);
        const ok = LOCK.grey + 0.2;
        place(okBadge, { s: pop(t, ok, 0.4), o: fade(t, ok, 0.1) });
      }

      function drawDice(t) {
        const p = PICKS.find((q) => t >= q.t0 - 0.25 && t < q.take + 0.3);
        if (!p) {
          // parked: always the same hidden state, so any frame is the same whatever was drawn before
          dice.face(1);
          dice.g.setAttribute("transform", "translate(0 0) scale(0)");
          return show(dice.g, 0);
        }
        const spot = (i) => [SPOT[p.cands[i]].x + 30, SPOT[p.cands[i]].y - 32];
        const u = (t - p.t0) / JUMP;
        const i = clamp(Math.floor(u), 0, p.n - 2);
        const hop = ramp(clamp(u - i), DWELL, 1, ease.inOut); // 0 while sitting on a tile, 1 once it has landed on the next
        const [x0, y0] = spot(i);
        const [x1, y1] = spot(i + 1);
        const rest = 9 * Math.sin(Math.PI * clamp((t - p.arrive) / SETTLE));
        const x = lerp(x0, x1, hop);
        const y = lerp(y0, y1, hop) - 30 * Math.sin(Math.PI * hop) - rest;
        const r = (i % 2 ? -1 : 1) * 28 * Math.sin(Math.PI * hop);
        const sc = pop(t, p.t0 - 0.25, 0.3) * (1 - ramp(t, p.take - 0.06, p.take + 0.1, lin));
        dice.face(FACES[(PICKS.indexOf(p) * 2 + i + (hop > 0.5 ? 1 : 0)) % 6]);
        dice.g.setAttribute(
          "transform",
          `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${Math.max(0, sc).toFixed(3)})`,
        );
        show(dice.g, sc > 0.01 ? 1 : 0);
      }

      function drawTree(t) {
        const locked = t >= LOCK.grey;
        tr.all().forEach((id) => {
          const p = PICK[id];
          const n = tr.node(id);
          const slot = SLOT_AT[id];
          const pos = tr.pos(id);
          // the dashed "?" slot: orange while it is being filled, otherwise grey (blue on the last level once the Functions bin is locked)
          const shown = t >= slot && t < p.land;
          const filling = t >= p.t0 - 0.25;
          ghosts[id].apply({
            x: pos.x,
            y: pos.y,
            s: pop(t, slot, 0.4),
            o: shown ? fade(t, slot, 0.15) * (1 - ramp(t, p.land - 0.2, p.land - 0.05, lin)) : 0,
            tone: filling ? "orange" : LEVEL[id] === LIMIT && locked ? "blue" : "grey",
          });
          // the copy of the chosen tile flies from its bin to the slot in an arc
          const u = ease.inOut(clamp((t - p.take) / FLY));
          const from = SPOT[n.label];
          const flying = t >= p.take && t < p.land;
          flyers[id].apply({
            x: lerp(from.x, pos.x, u),
            y: lerp(from.y, pos.y, u) - 60 * Math.sin(Math.PI * u),
            s: lerp(BIN_TILE / NODE, 1, u),
            r: (pos.x > from.x ? 1 : -1) * 12 * Math.sin(Math.PI * u),
            o: flying ? 1 : 0,
          });
          // the tree node itself: hidden until the copy lands, then it pops in and its edge turns solid
          if (t < p.land) {
            tr.set(id, { o: 0 });
            if (n.parent && t >= slot) tr.set(id, { ek: ramp(t, slot, slot + 0.3, ease.out), eo: PENDING });
          } else {
            tr.set(id, { o: 1, pulse: flash(t, p.land, p.land + 0.35) });
            if (n.parent) tr.set(id, { eo: lerp(PENDING, 1, fade(t, p.land, 0.25)) });
          }
        });
        // reading the tree as a formula: each node lights up orange as its token appears
        TOKENS.forEach(([, , id, step]) => {
          const a = tokenAt(step);
          if (id && t >= a && t < a + STEP) tr.set(id, { tone: "orange", halo: 1, pulse: 0.8 * flash(t, a, a + STEP) });
        });
        tr.draw();
        rings.forEach((c, i) => {
          const p = PICKS[i];
          const k = clamp((t - p.land) / 0.35);
          const pos = tr.pos(p.id);
          setClass(c, tr.node(p.id).kind === "fn" ? "c-purple" : "c-blue");
          c.setAttribute("cx", f1(pos.x));
          c.setAttribute("cy", f1(pos.y));
          c.setAttribute("r", f1(lerp(NODE * 0.5, NODE * 0.78, ease.out(k))));
          show(c, k > 0 && k < 1 ? 0.9 * (1 - k) : 0);
        });
      }

      function drawFormula(t) {
        const k = ramp(t, FORM_AT, FORM_AT + 0.35, ease.out);
        place(formulaCard, { y: (1 - k) * 16, o: k });
        place(progTag, { o: fade(t, FORM_AT + 0.1, 0.2) });
        toks.forEach((el, i) => {
          const a = tokenAt(TOKENS[i][3]);
          place(el, { y: (1 - ramp(t, a, a + 0.25)) * 10, o: fade(t, a, 0.2) });
        });
      }

      return (t) => {
        drawGuide(t);
        drawBins(t);
        drawTree(t);
        drawDice(t);
        drawFormula(t);
      };
    },
  });
})();
