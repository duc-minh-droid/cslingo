/* Lecture 2 · scene 9 (CHOOSING): pick the NoSQL family by the shape of the question (lesson 2.4, the "Which NoSQL family fits?"
   sorter). The blue thesis tag "pick by the shape of the question" stands on top from the start. Under it four jobs (D2.WORKLOADS)
   wait in a row: a cart by user id, one whole product page, friends of friends, events with varying columns. Each job card carries a
   small pictogram of the SHAPE of its question (a key and a box, a page, linked dots, ragged rows) over its words. Under the jobs
   stand the four families of scene 8 in the same order (document, key-value, wide-column, graph), each a sticker with its pictogram
   and name and an empty dashed pocket on top. One job at a time lifts off, arcs across and drops into the pocket of the family that
   fits it: the sticker turns green and a tick appears beside the pictogram. Which family each job needs comes from D2.WORKLOADS
   (asserted when the page loads: cart -> key-value, product page -> document, friends of friends -> graph, events with varying
   columns -> wide-column, one job per family), so the first two and the last two jobs swap places (a flying card passes in front of
   its neighbours for an instant).
   Layout (stage px): thesis tag y 12; four columns 216 wide with 16 between (12 px margin each side); job cards 200 x 170 at y 98
   (blue; the pictogram on top, the words wrapped at 12 characters and bottom-aligned: "varying columns" becomes two lines and that
   card has three lines of 28 px); family stickers 216 x 332 at y 288 (an empty dashed pocket 200 x 170 on top, then the pictogram and
   the name). A card is never scaled down, so its text stays 28 px.
   Story (local seconds): 0.15 the stickers pop, 0.2 the thesis tag, 0.5 the dashed pockets, 0.65 the jobs pop; JOB 1 (cart) flies
   2.4 to 3.1, job 2 (product page) 4.5 to 5.2, job 3 (friends) 6.6 to 7.3, job 4 (events) 8.7 to 9.4, 0.7 s each; the pocket it is heading
   for turns blue while it is on its way; at landing the sticker fades to green over 0.25 s, the pictogram bumps and a green tick badge
   on the corner of the card is drawn; 9.8 the thesis tag pulses once. Then the picture holds: four green families, each holding its job.
   Captions read at 17 characters per second or slower and start once their picture is on screen (each job's caption starts 0.1 s
   after that job has landed; asserted below).
   Helper note: D2.fam("doc", size) does not scale the braces with `size`, so, as in scene 8, the pictograms are drawn at their design
   size of 100 and shrunk as a whole (common-4.js is not edited). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const JOBS = D2.WORKLOADS;
  const FAM = D2.FAMILIES;
  const ORDER = D2.FAMILY_ORDER;
  D2.same(
    "choose scene: the four jobs and the family each one needs",
    JOBS.map((j) => [j.text, j.family]),
    [
      ["Cart by user id", "kv"],
      ["One whole product page", "doc"],
      ["Friends of friends", "graph"],
      ["Events with varying columns", "wide"],
    ],
  );
  D2.same(
    "choose scene: the four families, in the order of scene 8",
    ORDER.map((k) => FAM[k].name),
    ["Document", "Key-value", "Wide-column", "Graph"],
  );
  const FAMILY_OF = JOBS.map((j) => ORDER.indexOf(j.family)); // the sticker (column) each job belongs to
  const JOB_OF = ORDER.map((_, i) => FAMILY_OF.indexOf(i)); // the job each sticker receives
  D2.same("choose scene: every family receives exactly one job", [...FAMILY_OF].sort(), [0, 1, 2, 3]);
  D2.same(
    "choose scene: every job hops to the next column (the first two and the last two swap places)",
    FAMILY_OF.map((f, j) => f - j),
    [1, -1, 1, -1],
  );
  const MAXCH = 12; // a 28 px line of 12 characters is about 176 px wide, a job card's text area is 194 px
  const wrap = (lines) =>
    lines.flatMap((l) => {
      const at = l.lastIndexOf(" ");
      return l.length <= MAXCH || at < 0 ? [l] : [l.slice(0, at), l.slice(at + 1)];
    });
  const LINES = JOBS.map((j) => wrap(j.lines));
  D2.same(
    "choose scene: wrapping keeps the words of every job",
    LINES.map((l) => l.join(" ")),
    JOBS.map((j) => j.text),
  );
  D2.same(
    "choose scene: a card line has at most 12 characters and a card at most 3 lines",
    [LINES.every((l) => l.every((s) => s.length <= MAXCH)), LINES.every((l) => l.length <= 3)],
    [true, true],
  );

  // ---------- layout (stage px; everything keeps the 12 px margin, lips included) ----------
  const COL = { x0: 12, w: 216, pitch: 232 }; // 4 x 216 + 3 x 16 = 912
  const colX = (c) => COL.x0 + c * COL.pitch;
  const JOB = { w: 200, h: 170, y: 98, inset: 8, ico: 32 }; // a job card, in its column; the same size in the pocket (no scaling: text stays 28 px)
  const ST = { y: 288, h: 332, pocket: 12, iconY: 236, name: 14 }; // a family sticker; pocket top, pictogram centre, name bottom padding
  const ICON = { size: 84, tickDx: 80, tickDy: 2, tickR: 20 }; // pictogram; the tick badge: its centre is tickDx right of the sticker's middle, tickDy under the card
  const LIFT = 34; // how high a flying card arcs above the straight line between its two places
  const TAG = { text: "pick by the shape of the question", w: 600, h: 66, fs: 34, y: 12 };
  TAG.x = (936 - TAG.w) / 2;
  D2.same(
    "choose scene: stickers and cards keep the 12 px margin",
    [colX(0) >= 12, colX(3) + COL.w <= 924, ST.y + ST.h + 6 <= 628, JOB.y >= 12],
    [true, true, true, true],
  );
  D2.same("choose scene: a job card fits its pocket exactly", 2 * JOB.inset + JOB.w, COL.w);
  D2.same(
    "choose scene: pocket, lip and pictogram do not touch",
    ST.pocket + JOB.h + 6 + 6 <= ST.iconY - ICON.size / 2 && ST.iconY + ICON.size / 2 + 4 <= ST.h - ST.name - 3 - 32,
    true,
  );
  D2.same(
    "choose scene: the tick badge clears the pictogram and stays inside the sticker",
    [ICON.tickDx - ICON.tickR >= ICON.size / 2 + 10, COL.w / 2 + ICON.tickDx + ICON.tickR <= COL.w - 3 - 4],
    [true, true],
  );
  D2.same(
    "choose scene: the tag stands clear above the jobs, the job words clear their pictogram",
    [TAG.y + TAG.h + 6 < JOB.y, JOB.ico + 20 + 10 <= JOB.h - 12 - 3 * 32],
    [true, true],
  );
  D2.same(
    "choose scene: the tag is wide enough for its text (about 589 px) and inside the stage",
    [TAG.w >= 592, TAG.x >= 12],
    [true, true],
  );
  const jobPos = (j) => ({ x: colX(j) + JOB.inset, y: JOB.y }); // top-left of job j in its row
  const pocketPos = (f) => ({ x: colX(f) + JOB.inset, y: ST.y + ST.pocket }); // top-left of the pocket of sticker f

  // ---------- timeline ----------
  const T = {
    sticker: 0.15, // the four stickers pop, 0.12 s apart
    step: 0.12,
    tag: 0.2, // the thesis tag
    settle: 10.3, // the four matched families settle upwards (0.7 s), centring the picture under the tag
    slot: 0.5, // the dashed pockets
    job: 0.65, // the four jobs pop, 0.12 s apart
    fly: [2.4, 4.5, 6.6, 8.7], // a job lifts off
    dur: 0.7, // seconds in the air
  };
  const land = (j) => T.fly[j] + T.dur;
  const SETTLE = -98; // how far up the group settles: the empty row of jobs is gone, the tag and the families are centred
  T.pulse = T.settle + 0.8; // all four are matched and settled: the thesis tag pulses once
  const CAPS = [
    [1.15, 3.05, "Four jobs, four families."],
    [land(0) + 0.1, 5.15, "A cart by user id: key-value."],
    [land(1) + 0.1, 7.25, "A whole product page: document."],
    [land(2) + 0.1, 9.35, "Friends of friends: graph."],
    [land(3) + 0.1, 11.45, "Varying columns: wide-column."],
    [11.6, 13.2, "Each job finds its family."],
  ];
  const DUR = 13.8;
  D2.same(
    "choose scene: every caption reads at 17 characters per second or slower",
    CAPS.every(([a, b, s]) => s.length / (b - a) <= 17.1),
    true,
  );
  D2.same(
    "choose scene: captions do not overlap and the last one ends before the hold",
    [CAPS.every((c, i) => i === 0 || c[0] >= CAPS[i - 1][1] + 0.1), CAPS[5][1] <= DUR - 0.5],
    [true, true],
  );
  D2.same(
    "choose scene: the jobs are all on screen before caption 1 and before the first lift-off",
    [T.job + 3 * T.step + 0.1 <= CAPS[0][0], T.job + 3 * T.step + 0.4 + 0.8 <= T.fly[0]],
    [true, true],
  );
  D2.same(
    "choose scene: a job lands before the next lifts off, with a beat between, and the tag comes last",
    [
      T.fly.every((f, j) => j === 0 || f >= land(j - 1) + 0.9),
      T.pulse + 0.5 <= CAPS[5][0] + 0.1,
      T.settle >= land(3) + 0.8,
      CAPS[5][0] >= land(3) + 1.5,
    ],
    [true, true, true, true],
  );

  /** the family pictogram at ICON.size: D2.fam(k, size) does not scale the document icon's braces, so it is drawn at 100 and shrunk whole */
  const icon = (kind, tone) => {
    const inner = D2.fam(kind, 100, tone);
    inner.style.transform = `scale(${ICON.size / 100})`; // an SVG element scales about the svg origin, where the icon is centred
    return V.s("g", {}, inner);
  };

  /** the shape of a job's question as a small pictogram (SVG group around the centre cx, cy, about 80 x 44 px): a key and the one
      value it finds (key-value), one whole page (document), dots linked in a chain (graph), rows of different lengths (wide-column) */
  function shape(family, cx, cy) {
    const t = D2.tone("blue");
    const ink = {
      fill: "none",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: t.ink },
    };
    const ln = (x1, y1, x2, y2, st = ink) => V.s("line", { x1, y1, x2, y2, ...st });
    const fillC = { style: { fill: t.c } };
    const rect = (x, y, w, h, r, st) => V.s("rect", { x, y, width: w, height: h, rx: r, ...st });
    const dot = (x, y, r) => V.s("circle", { cx: x, cy: y, r, ...fillC });
    if (family === "kv") {
      const x = cx - 40; // a key (ring, stem, two teeth), one arrow, the one value
      return V.s(
        "g",
        {},
        V.s("circle", { cx: x + 8, cy, r: 8, ...ink }),
        ln(x + 16, cy, x + 36, cy),
        ln(x + 26, cy, x + 26, cy + 8),
        ln(x + 34, cy, x + 34, cy + 8),
        ln(x + 44, cy, x + 58, cy),
        V.s("path", { d: `M ${x + 52} ${cy - 7} L ${x + 59} ${cy} L ${x + 52} ${cy + 7}`, ...ink }),
        rect(x + 64, cy - 11, 22, 22, 6, { "stroke-width": 4, style: { fill: t.c, stroke: t.lip } }),
      );
    }
    if (family === "doc")
      return V.s(
        "g",
        {},
        rect(cx - 17, cy - 21, 34, 42, 7, { "stroke-width": 4, style: { fill: t.dim, stroke: t.ink } }),
        ln(cx - 8, cy - 8, cx + 8, cy - 8, { ...ink, style: { stroke: t.c } }),
        ln(cx - 8, cy + 1, cx + 8, cy + 1, { ...ink, style: { stroke: t.c } }),
        ln(cx - 8, cy + 10, cx + 2, cy + 10, { ...ink, style: { stroke: t.c } }),
      );
    if (family === "graph")
      return V.s(
        "g",
        {},
        ln(cx - 28, cy + 10, cx, cy - 10),
        ln(cx, cy - 10, cx + 28, cy + 10),
        dot(cx - 28, cy + 10, 9),
        dot(cx, cy - 10, 9),
        dot(cx + 28, cy + 10, 9),
      );
    // wide-column: rows of different lengths
    return V.s(
      "g",
      {},
      ...[52, 38, 26].map((w, i) => rect(cx - 30, cy - 19 + i * 15, w, 10, 5, { style: { fill: t.c } })),
    );
  }

  function build(stageEl) {
    // everything but the thesis tag lives in one group, which settles upwards once all four jobs have landed (no empty band)
    const stage = V.h("div", {
      style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
    });
    stageEl.append(stage);
    // ---- the four family stickers: a grey one, and a green one that fades in over it when its job has landed ----
    const stickers = ORDER.map((k, i) => {
      const o = { x: colX(i), y: ST.y, w: COL.w, h: ST.h, text: FAM[k].name };
      const base = D2.card(stage, { ...o, tone: "grey" });
      const green = D2.card(stage, { ...o, tone: "green", plain: false });
      [base, green].forEach((c) =>
        Object.assign(c.el.style, { alignItems: "flex-end", paddingBottom: `${ST.name}px` }),
      ); // the name sits under the pictogram
      return { base, green };
    });
    // ---- the empty pockets: dashed outlines the jobs will land in ----
    const slots = ORDER.map((_, i) => {
      const p = pocketPos(i);
      const el = V.h("div", {
        style: {
          position: "absolute",
          left: `${p.x}px`,
          top: `${p.y}px`,
          width: `${JOB.w}px`,
          height: `${JOB.h}px`,
          boxSizing: "border-box",
          border: "4px dashed var(--line-2)",
          borderRadius: "22px",
        },
      });
      stage.append(el);
      return el;
    });
    // ---- the pictograms (grey, and green when matched) ----
    const icons = L5.svg(stage);
    const pics = ORDER.map((k) => ({
      grey: icons.appendChild(icon(k, "grey")),
      green: icons.appendChild(icon(k, "green")),
    }));
    // ---- the four jobs ----
    const jobs = JOBS.map((_, j) => {
      const p = jobPos(j);
      const c = D2.card(stage, {
        x: p.x,
        y: p.y,
        w: JOB.w,
        h: JOB.h,
        text: LINES[j].join("\n"),
        tone: "blue",
        plain: false,
      });
      Object.assign(c.el.style, { alignItems: "flex-end", paddingBottom: "12px" }); // the words sit under the pictogram
      // the pictogram lives inside the card, so it travels, scales and fades with it
      c.el.append(
        V.s(
          "svg",
          {
            width: JOB.w,
            height: JOB.h,
            style: { position: "absolute", left: "-3px", top: "-3px", overflow: "visible" },
          },
          shape(JOBS[j].family, JOB.w / 2, JOB.ico + 3),
        ),
      );
      return c;
    });
    // ---- the ticks ----
    const ticksLayer = L5.svg(stage);
    const ticks = ORDER.map((_, i) => {
      const [cx, cy] = [colX(i) + COL.w / 2 + ICON.tickDx, ST.y + ST.pocket + JOB.h + ICON.tickDy];
      const tick = L5.tick(cx, cy + 1, 26, "green", { on: true, w: 6 });
      const g = V.s(
        "g",
        {},
        V.s("circle", {
          cx,
          cy,
          r: ICON.tickR,
          "stroke-width": 3,
          style: { fill: D2.tone("green").c, stroke: D2.tone("green").lip },
        }),
        tick,
      );
      return { g: ticksLayer.appendChild(g), tick };
    });
    // ---- the conclusion ----
    const tag = D2.tag(stageEl, {
      x: TAG.x,
      y: TAG.y,
      text: TAG.text,
      tone: "blue",
      solid: true,
      fs: TAG.fs,
      h: TAG.h,
    });
    tag.el.style.width = `${TAG.w}px`;

    return (t) => {
      const lin = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
      V.place(stage, { y: SETTLE * ramp(t, T.settle, T.settle + 0.7, E.inOut) });

      ORDER.forEach((_, i) => {
        const j = JOB_OF[i]; // the job that lands here
        const k = lin(T.sticker + i * T.step);
        const g = lin(land(j), 0.25); // 0..1: the sticker has turned green
        const [s, o] = [0.8 + 0.2 * E.pop(k), Math.min(1, k * 4)];
        stickers[i].base.set({ k });
        stickers[i].green.set({ k, o: g });
        // the pocket: dashed grey, blue while its job is on the way, gone once the job sits in it
        const ks = lin(T.slot + i * T.step, 0.35);
        const flying = t >= T.fly[j] && t < land(j);
        slots[i].style.borderColor = flying ? "var(--blue)" : "var(--line-2)";
        V.place(slots[i], { s: 0.9 + 0.1 * E.pop(ks), o: t < land(j) ? Math.min(1, ks * 4) : 0 });
        // the pictogram: grey turns green, with one bump at landing
        const at = {
          x: colX(i) + COL.w / 2,
          y: ST.y + ST.iconY,
          s: s * (1 + 0.14 * flash(t, land(j) + 0.05, land(j) + 0.5)),
        };
        V.place(pics[i].grey, { ...at, o: o * (1 - g) });
        V.place(pics[i].green, { ...at, o: o * g });
        // the tick badge pops on the corner of the job card and is drawn on
        const kt = lin(land(j) + 0.1, 0.4);
        V.place(ticks[i].g, { s: 0.5 + 0.5 * E.pop(kt), o: Math.min(1, kt * 4) });
        L5.drawOn(ticks[i].tick, ramp(kt, 0.3, 1, E.lin));
      });

      // the jobs: pop in a row, then one at a time lift off, arc across and settle into their pocket
      JOBS.forEach((_, j) => {
        const [a, b] = [jobPos(j), pocketPos(FAMILY_OF[j])];
        const u = ramp(t, T.fly[j], land(j), E.lin);
        const e = E.inOut(u);
        const x = a.x + (b.x - a.x) * e;
        const y = a.y + (b.y - a.y) * e - LIFT * Math.sin(Math.PI * u); // an arc over the straight line
        const lift = 0.08 * Math.sin(Math.PI * u) + 0.07 * flash(t, land(j), land(j) + 0.3); // a lift in the air, a small squash on landing
        jobs[j].set({ k: lin(T.job + j * T.step), x: x - a.x, y: y - a.y, s: 1 + lift });
        jobs[j].el.style.zIndex = u > 0 && u < 1 ? "5" : ""; // a flying card passes in front of everything
      });

      tag.set({ k: lin(T.tag), s: 1 + 0.07 * flash(t, T.pulse, T.pulse + 0.5) });
    };
  }

  V.scene({
    kicker: "CHOOSING",
    title: ["Pick the family by", "the question"],
    dur: DUR,
    caps: CAPS,
    build,
  });
})();
