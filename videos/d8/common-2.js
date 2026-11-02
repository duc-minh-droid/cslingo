/* Lecture 8 · Stream processing: pictograms, the DAY LINE (scene 3) and the FLOOD LANE (scene 6) (VID.d8, short name D8).
   Needs videos/l5/common.js, videos/d4/common*.js and d8/common.js first. Positions are stage pixels (936 x 640, origin top-left).
   EVERY CALL IS PURE: call set() each frame from update(t) with everything you want to see; nothing is remembered between frames.
   Tones are the video's colour roles (see common.js): blue event/producer, purple broker/batch run, green processed/acked/safe,
   orange waiting/redelivered, red lost/dropped/crashed, grey neutral. D8.tone = D4.tone -> {c, ink, dim, edge, lip, on}.
   Stickers you will need besides these come from VID.d4 (read videos/d4/common-2.js and common-3.js headers): D4.tag, D4.packet,
   D4.label, D4.disc, D4.card, D4.bar, D4.chips, D4.wire, D4.svg, D4.node, D4.bolt, D4.person, D4.phone, D4.server, D4.seq, D4.at;
   and VID.l5.tick / cross / arrow / drawOn for ticks, crosses and arrows (never glyphs).

   1. PICTOGRAMS  (SVG groups at absolute coordinates, x, y = CENTRE, size s; append to a D4.svg(stage) layer, then move / pop /
      fade them with V.place(g, {x, y, s, o}) (offsets from where they were drawn))
        D8.file(x, y, s, tone = "grey")      a document with a folded corner and three text lines (a log file, an output file)
        D8.db(x, y, s, tone = "grey")        a database cylinder (three discs)
        D8.disk(x, y, s, tone = "green")     a hard disk: a flat box with a platter (messages written to disk)
        D8.ram(x, y, s, tone = "orange")     a memory chip with pins (messages kept in memory)
        D8.lock(x, y, s, tone = "grey")      a padlock (an immutable event)
        D8.clock(x, y, s, tone = "grey", hour = 3)   a clock face, hand at `hour` (a timestamp)
        D8.edge(f, w = 6) -> 0..1: opacity for a packet riding a wire at fraction f: fades in over the first 1/w and out over the
            last 1/w, so a packet never sits on top of the card it leaves or reaches.  k: edge(f) in packet.set({k}).
   2. THE DAY LINE  (scene 3: 24 hours of posts, batch runs, the clock)
        const d = D8.dayline(stage, {x: 40, y: 200, w: 856});   axis from hour 0 (x) to hour 24 (x + w) at height y
        d.set({k: 1, W: 24 | 6 | 1 | 0 (the window; 0 = stream), runsK: 1 (0..1 pops the purple run lines in, left to right),
               now: 0..24 (the blue clock line and which posts exist / are processed), postsK: 1, waitK: 0 (0..1 shows an orange
               wait bar from each WAITING post to the clock line), focus: -1 | post index (a ring on one post)})
            posts are discs above the axis: orange while waiting, green once processed (D8.postState), absent before posted.
            Hour labels 00:00, 06:00, 12:00, 18:00, 24:00 (28 px) under the axis; run lines are purple bars across the axis.
        d.x(hour) -> stage x;  d.postAt(i) -> {x, y} centre of post i;  d.y
   3. THE FLOOD LANE  (scene 6: one overflow policy, second by second, from D8.FLOOD.steps)
        const lane = D8.floodLane(stage, {y, pol: "buffer" | "drop" | "back", name: "Buffer"});
          a lane about 140 px high at top y (the row centre is y + 46): the name as plain 30 px text at the left (anchor l at
          x 12, up to about x 205), a producer disc "6/s" (blue, 64 px, 28 px text, centre x 258), a row of 24 queue slots
          (x 298 .. 824, 18 px wide, 4 px gap: the buffer
          peaks at 24 in second 10; the limit of 10 is a red dashed bar 10 slots from the right end, for drop and back), a
          consumer disc "4/s" (green, 64 px, centre x 866), and a counter tag under the row (anchor l at x 298, y + 108):
          "20 waiting" / "14 dropped" / "14 held back".
        lane.set({k: 1, sec: 0..10 (sim seconds, fractional), countK: 1, countS: 1 (scale of the counter tag, for a bump)})
            Second s runs from sec = s - 1 to s. The queue's FRONT is its right end, next to the consumer. The first half adds
            the arrivals at the back (one by one, orange); refused ones pop at the back, left of the limit, and fall away red
            (drop) or make the producer disc orange and shake (back). The second half the consumer takes `out` from the front
            (green dots fly into the consumer disc) and the rest of the queue slides right.
        lane.cap = {x, y} of the limit bar;  lane.count = {x, y} left-middle of the counter tag;  lane.slotAt(q) -> {x, y} centre of queue position q (0 = front, the right end);
        lane.prod / lane.cons -> the disc centres */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const { clamp, flash, ease: E } = V;
  const T = (D8.tone = D4.tone);
  const f1 = (n) => n.toFixed(1);

  // ---------- 1. pictograms ----------
  const rect = (x, y, w, h, r, fill, stroke, sw = 3) =>
    V.s("rect", {
      x: f1(x),
      y: f1(y),
      width: f1(w),
      height: f1(h),
      rx: f1(r),
      "stroke-width": sw,
      style: { fill, stroke },
    });
  const circle = (x, y, r, fill, stroke, sw = 3) =>
    V.s("circle", { cx: f1(x), cy: f1(y), r: f1(r), "stroke-width": sw, style: { fill, stroke: stroke || "none" } });
  const line = (x1, y1, x2, y2, stroke, sw) =>
    V.s("line", {
      x1: f1(x1),
      y1: f1(y1),
      x2: f1(x2),
      y2: f1(y2),
      "stroke-width": f1(sw),
      "stroke-linecap": "round",
      style: { stroke },
    });
  const path = (d, fill, stroke, sw = 3) =>
    V.s("path", { d, "stroke-width": sw, "stroke-linejoin": "round", style: { fill, stroke } });

  D8.file = (x, y, s, tone = "grey") => {
    const c = T(tone);
    const w = 0.7 * s;
    const h = 0.9 * s;
    const l = x - w / 2;
    const t = y - h / 2;
    const fold = 0.22 * s;
    return V.s(
      "g",
      {},
      path(
        `M ${f1(l)} ${f1(t)} H ${f1(l + w - fold)} L ${f1(l + w)} ${f1(t + fold)} V ${f1(t + h)} H ${f1(l)} Z`,
        "var(--panel)",
        c.lip,
      ),
      path(`M ${f1(l + w - fold)} ${f1(t)} V ${f1(t + fold)} H ${f1(l + w)}`, c.dim, c.lip),
      ...[0.38, 0.56, 0.74].map((f, i) =>
        line(l + 0.14 * s, t + f * h, l + w - (i === 2 ? 0.3 : 0.14) * s, t + f * h, c.c, 0.06 * s),
      ),
    );
  };
  D8.db = (x, y, s, tone = "grey") => {
    const c = T(tone);
    const rx = 0.42 * s;
    const ry = 0.13 * s;
    const top = y - 0.36 * s;
    const bot = y + 0.36 * s;
    const body = `M ${f1(x - rx)} ${f1(top)} V ${f1(bot)} A ${f1(rx)} ${f1(ry)} 0 0 0 ${f1(x + rx)} ${f1(bot)} V ${f1(top)}`;
    const band = (yy) =>
      path(`M ${f1(x - rx)} ${f1(yy)} A ${f1(rx)} ${f1(ry)} 0 0 0 ${f1(x + rx)} ${f1(yy)}`, "none", c.lip);
    return V.s(
      "g",
      {},
      path(body, c.c, c.lip),
      band(y - 0.12 * s),
      band(y + 0.12 * s),
      V.s("ellipse", {
        cx: f1(x),
        cy: f1(top),
        rx: f1(rx),
        ry: f1(ry),
        "stroke-width": 3,
        style: { fill: c.dim, stroke: c.lip },
      }),
    );
  };
  D8.disk = (x, y, s, tone = "green") => {
    const c = T(tone);
    return V.s(
      "g",
      {},
      rect(x - 0.48 * s, y - 0.34 * s, 0.96 * s, 0.68 * s, 0.1 * s, c.c, c.lip),
      circle(x - 0.08 * s, y, 0.22 * s, "var(--panel)", c.lip),
      circle(x - 0.08 * s, y, 0.05 * s, c.lip),
      line(x + 0.12 * s, y + 0.14 * s, x + 0.34 * s, y - 0.2 * s, c.lip, 0.06 * s),
    );
  };
  D8.ram = (x, y, s, tone = "orange") => {
    const c = T(tone);
    const pins = [-0.3, -0.1, 0.1, 0.3].flatMap((f) => [
      line(x + f * s, y - 0.3 * s, x + f * s, y - 0.44 * s, c.lip, 0.07 * s),
      line(x + f * s, y + 0.3 * s, x + f * s, y + 0.44 * s, c.lip, 0.07 * s),
    ]);
    return V.s(
      "g",
      {},
      ...pins,
      rect(x - 0.46 * s, y - 0.3 * s, 0.92 * s, 0.6 * s, 0.08 * s, c.c, c.lip),
      rect(x - 0.2 * s, y - 0.12 * s, 0.4 * s, 0.24 * s, 0.04 * s, c.dim, c.lip, 2),
    );
  };
  D8.lock = (x, y, s, tone = "grey") => {
    const c = T(tone);
    return V.s(
      "g",
      {},
      path(
        `M ${f1(x - 0.24 * s)} ${f1(y - 0.02 * s)} V ${f1(y - 0.2 * s)} A ${f1(0.24 * s)} ${f1(0.24 * s)} 0 0 1 ${f1(x + 0.24 * s)} ${f1(y - 0.2 * s)} V ${f1(y - 0.02 * s)}`,
        "none",
        c.lip,
        0.09 * s,
      ),
      rect(x - 0.36 * s, y - 0.04 * s, 0.72 * s, 0.52 * s, 0.08 * s, c.c, c.lip),
      circle(x, y + 0.18 * s, 0.07 * s, c.on),
    );
  };
  D8.clock = (x, y, s, tone = "grey", hour = 3) => {
    const c = T(tone);
    const a = ((hour % 12) / 12) * 2 * Math.PI;
    return V.s(
      "g",
      {},
      circle(x, y, 0.44 * s, "var(--panel)", c.lip, 0.07 * s),
      line(x, y, x, y - 0.3 * s, c.c, 0.07 * s),
      line(x, y, x + 0.22 * s * Math.sin(a), y - 0.22 * s * Math.cos(a), c.lip, 0.08 * s),
      circle(x, y, 0.05 * s, c.lip),
    );
  };
  D8.edge = (f, w = 6) => (f <= 0 || f >= 1 ? 0 : Math.min(1, f * w, (1 - f) * w));

  // ---------- 2. the day line ----------
  D8.dayline = (parent, o = {}) => {
    const { x = 40, y = 200, w = 856 } = o;
    const X = (h) => x + (h / 24) * w;
    const svg = D4.svg(parent);
    const axis = svg.appendChild(line(x, y, x + w, y, "var(--line-2)", 6));
    const runG = D8.range(1, 24).map(() =>
      svg.appendChild(rect(0, y - 34, 8, 68, 4, T("purple").c, T("purple").lip, 2)),
    );
    const waitG = D8.DAY.posts.map(() => svg.appendChild(rect(0, y - 58, 10, 10, 5, T("orange").c, "none", 0)));
    const nowG = svg.appendChild(V.s("g", {}, line(0, y - 96, 0, y + 40, T("blue").c, 5)));
    nowG.firstChild.setAttribute("stroke-dasharray", "10 8");
    const hours = [0, 6, 12, 18, 24].map((h) =>
      D4.label(parent, { x: X(h), y: y + 64, text: `${String(h).padStart(2, "0")}:00`, tone: "grey", fs: 28 }),
    );
    const posts = D8.DAY.posts.map((t) => D4.disc(parent, { x: X(t), y: y - 52, size: 34, text: "", tone: "orange" }));
    const ring = svg.appendChild(circle(0, y - 52, 28, "none", T("blue").c, 5));
    return {
      y,
      x: X,
      postAt: (i) => ({ x: X(D8.DAY.posts[i]), y: y - 52 }),
      set(st = {}) {
        const { k = 1, W = 24, runsK = 1, now = 24, postsK = 1, waitK = 0, focus = -1 } = st;
        V.place(axis, { o: k });
        hours.forEach((l) => l.set({ k }));
        const win = D8.DAY.windows.find((d) => d.W === W);
        if (!win) throw new Error(`VID.d8.dayline: no window W = ${W}`);
        runG.forEach((g, i) => {
          const h = win.runs[i];
          if (h == null) return V.place(g, { o: 0 });
          const kk = clamp(runsK * win.runs.length - i);
          g.setAttribute("x", f1(X(h) - 4));
          V.place(g, { o: k * Math.min(1, kk * 3) * (h <= now + 1e-9 ? 1 : 0.85) });
        });
        D8.DAY.posts.forEach((t, i) => {
          const s = D8.postState(t, W, now);
          posts[i].set({ k: s === "none" ? 0 : postsK, tone: s === "done" ? "green" : "orange" });
          const until = Math.min(D8.doneAt(t, W), now);
          const len = (X(until) - X(t)) * waitK;
          const g = waitG[i];
          g.setAttribute("x", f1(X(t)));
          g.setAttribute("width", f1(Math.max(0, len)));
          V.place(g, { o: s === "waiting" && len > 1 ? postsK : 0 });
        });
        V.place(nowG, { x: X(now), o: k * (now < 24 ? 1 : 0) });
        if (focus >= 0) V.place(ring, { x: X(D8.DAY.posts[focus]), o: k });
        else V.place(ring, { o: 0 });
      },
    };
  };

  // ---------- 3. the flood lane ----------
  const SLOT = { x0: 298, w: 18, gap: 4, n: 24 };
  D8.floodLane = (parent, o = {}) => {
    const { y = 0, pol = "buffer", name = pol } = o;
    const F = D8.FLOOD;
    const steps = F.steps[pol];
    if (!steps) throw new Error(`VID.d8.floodLane: unknown policy "${pol}"`);
    const cy = y + 46;
    const slotX = (i) => SLOT.x0 + i * (SLOT.w + SLOT.gap);
    const svg = D4.svg(parent);
    const tile = (q) => SLOT.n - 1 - q; // queue position q (0 = the FRONT, next to the consumer) -> chip index
    const limitX = slotX(SLOT.n - F.cap) - SLOT.gap / 2;
    const limit = svg.appendChild(line(limitX, cy - 36, limitX, cy + 36, T("red").c, 5));
    limit.setAttribute("stroke-dasharray", "8 6");
    const label = D4.label(parent, { x: 12, y: cy, text: name, tone: "grey", fs: 30, anchor: "l" });
    const prodAt = { x: 258, y: cy };
    const consAt = { x: slotX(SLOT.n) + 40, y: cy };
    const prod = D4.disc(parent, { ...prodAt, size: 64, text: `${F.p}/s`, tone: "blue", fs: 28 });
    const row = D4.chips(parent, {
      x: SLOT.x0,
      y: cy - 24,
      n: SLOT.n,
      w: SLOT.w,
      h: 48,
      gap: SLOT.gap,
      fs: 0,
      radius: 8,
      lip: 4,
    });
    const cons = D4.disc(parent, { ...consAt, size: 64, text: `${F.c}/s`, tone: "green", fs: 28 });
    const fallers = D8.range(1, F.p).map(() => D4.disc(parent, { x: 0, y: 0, size: 20, text: "", tone: "red" }));
    const leavers = D8.range(1, F.c).map(() => D4.disc(parent, { x: 0, y: 0, size: 20, text: "", tone: "green" }));
    const what = { buffer: "waiting", drop: "dropped", back: "held back" }[pol];
    const count = D4.tag(parent, { x: SLOT.x0, y: cy + 62, text: "", tone: "grey", anchor: "l" });
    if (Math.max(...steps.map((x) => x.peak)) > SLOT.n)
      throw new Error(`VID.d8.floodLane: ${pol} needs more than ${SLOT.n} slots`);
    return {
      cap: { x: limitX, y: cy },
      count: { x: SLOT.x0, y: cy + 62 },
      slotAt: (q) => ({ x: slotX(tile(q)) + SLOT.w / 2, y: cy }),
      prod: prodAt,
      cons: consAt,
      set(st = {}) {
        const { k = 1, sec = 0, countK = 1, countS = 1 } = st;
        const s = Math.min(F.secs, Math.floor(sec));
        const u = sec >= F.secs ? 1 : sec - s; // progress inside second s + 1
        const cur = sec >= F.secs ? steps[F.secs - 1] : steps[s];
        label.set({ k });
        prod.set({ k, tone: "blue" });
        cons.set({ k });
        V.place(limit, { o: pol === "buffer" ? 0 : k });
        // phase 1 (u 0..0.5): arrivals join the back one by one; phase 2 (u 0.5..1): the consumer takes `out` from the front
        // (the right end) and the rest of the queue slides right
        const fillK = clamp(u / 0.5);
        const takeK = clamp((u - 0.5) / 0.5);
        const shown = sec >= F.secs ? cur.after : Math.round(cur.before + cur.arrive * fillK);
        const gone = sec >= F.secs ? 0 : u > 0.5 ? cur.out : 0;
        const shift = gone * (SLOT.w + SLOT.gap) * E.inOut(takeK);
        row.all((i) => {
          const q = tile(i);
          if (q < shown) return { tone: "orange", solid: true, x: shift, o: q < gone ? 0 : 1 };
          return { ghost: true, o: k * 0.9 };
        });
        // leavers fly from the front slot to the consumer disc
        leavers.forEach((d, j) => {
          const on = sec < F.secs && u > 0.5 && j < cur.out;
          const f = clamp(takeK * 1.4 - j * 0.12);
          const a = { x: slotX(tile(j)) + SLOT.w / 2, y: cy };
          const p = D4.at(a, consAt, f, 30);
          d.set({ x: p.x, y: p.y, k: on && f > 0 && f < 1 ? 1 : 0 });
        });
        // refused: drop -> red discs pop past the limit and fall; back -> the producer turns orange and shakes
        const refusing = sec < F.secs && cur.refused > 0 && u < 0.6;
        fallers.forEach((d, j) => {
          const on = pol === "drop" && refusing && j < cur.refused;
          const f = clamp(u / 0.55 - j * 0.1);
          d.set({ x: limitX - 20 - 26 * j, y: cy + 60 * E.in(f), k: on ? 1 : 0, o: 1 - f });
        });
        if (pol === "back" && refusing) prod.set({ k, tone: "orange", x: 4 * Math.sin(sec * 60) * flash(u, 0, 0.6) });
        const zero = { q: 0, drop: 0, held: 0 };
        const tally =
          sec >= F.secs ? F.hist[pol][F.secs - 1] : u >= 0.5 ? F.hist[pol][s] : s > 0 ? F.hist[pol][s - 1] : zero;
        const v = { buffer: tally.q, drop: tally.drop, back: tally.held }[pol];
        count.set({
          k: countK * k,
          s: countS,
          text: `${v} ${what}`,
          tone: v ? (pol === "buffer" ? "orange" : pol === "drop" ? "red" : "orange") : "grey",
        });
      },
    };
  };
})();
