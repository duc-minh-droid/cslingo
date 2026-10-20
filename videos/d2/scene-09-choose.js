/* Lecture 2 · scene 9 (CHOOSING): pick the NoSQL family by the shape of the question (lesson 2.4, the "Which NoSQL family fits?"
   sorter). Four jobs (D2.WORKLOADS) wait in a row on top: a cart by user id, one whole product page, friends of friends, events with
   varying columns. Under them stand the four families of scene 8 in the same order (document, key-value, wide-column, graph), each a
   sticker with its pictogram and name and an empty dashed pocket on top. One job at a time lifts off, hops one column sideways and
   drops into the pocket of the family that fits it: the sticker turns green and a tick pops beside the pictogram. Which family each job
   needs comes from D2.WORKLOADS (asserted when the page loads: cart -> key-value, product page -> document, friends of friends ->
   graph, events with varying columns -> wide-column, one job per family), so the first two and the last two jobs swap places.
   Layout (stage px): four columns 216 wide with 16 between (12 px margin each side); job cards 200 x 118 at y 24 (blue); family
   stickers 216 x 296 at y 248 (an empty dashed pocket 200 x 118 on top, then the pictogram and the name). The text of a job card
   is wrapped at 12 characters, so "varying columns" becomes two lines and that card has three (28 px, measured: 'varying
   columns' is 218 px wide and a card holds 194). A card is never scaled down, so its text stays 28 px.
   Story (local seconds): 0.15 the stickers pop, 0.5 the dashed pockets, 0.65 the jobs pop; JOB 1 (cart) flies 2.45 to 3.15, job 2
   (product page) 4.4 to 5.1, job 3 (friends) 6.5 to 7.2, job 4 (events) 8.35 to 9.05, 0.7 s each: the card lifts off, drops into
   the free gap under the row of jobs, slides one column sideways and settles into its pocket, in front of everything; the pocket
   it is heading for turns blue while it is on its way; at landing the sticker fades to green over 0.25 s, the pictogram bumps and
   a green tick badge on the corner of the card is drawn; 11.0 the solid blue tag "pick by the shape of the question". Then the
   picture holds: four green families, each holding its job.
   Captions are re-timed from the placeholder only to read at 17 characters per second or slower and to start once their picture
   is on screen (each job's caption starts 0.1 s after that job has landed; asserted below).
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
  const JOB = { w: 200, h: 118, y: 24, inset: 8 }; // a job card, in its column; the same size in the pocket (no scaling: text stays 28 px)
  const ST = { y: 248, h: 296, pocket: 12, iconY: 194, name: 14 }; // a family sticker; pocket top, pictogram centre, name bottom padding
  const ICON = { size: 96, tickDx: 80, tickDy: 2, tickR: 20 }; // pictogram; the tick badge: its centre is tickDx right of the sticker's middle, tickDy under the card
  const GAP_Y = 152; // top of a flying card while it slides sideways: just under the row of jobs, over the rims of the stickers
  const TAG = { text: "pick by the shape of the question", w: 600, h: 66, fs: 34, y: 138 };
  TAG.x = (936 - TAG.w) / 2;
  D2.same(
    "choose scene: stickers and cards keep the 12 px margin",
    [colX(0) >= 12, colX(3) + COL.w <= 924, ST.y + ST.h + 6 <= 628, JOB.y >= 12],
    [true, true, true, true],
  );
  D2.same("choose scene: a job card fits its pocket exactly", 2 * JOB.inset + JOB.w, COL.w);
  D2.same(
    "choose scene: pocket, lip and pictogram do not touch",
    ST.pocket + JOB.h + 6 + 6 <= ST.iconY - 46 && ST.iconY + 46 + 4 <= ST.h - ST.name - 3 - 32,
    true,
  );
  D2.same(
    "choose scene: the tick badge clears the pictogram (50 px either side of its centre) and stays inside the sticker",
    [ICON.tickDx - ICON.tickR >= 50 + 10, COL.w / 2 + ICON.tickDx + ICON.tickR <= COL.w - 3 - 4],
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
    slot: 0.5, // the dashed pockets
    job: 0.65, // the four jobs pop, 0.12 s apart
    fly: [2.45, 4.4, 6.5, 8.35], // a job lifts off
    dur: 0.7, // seconds in the air
    tag: 11.0,
  };
  const land = (j) => T.fly[j] + T.dur;
  const CAPS = [
    [1.15, 3.1, "Four kinds of job, four families."],
    [land(0) + 0.1, 5.0, "A cart by user id: key-value."],
    [land(1) + 0.1, 7.05, "A whole product page: document."],
    [land(2) + 0.1, 8.85, "Friends of friends: graph."],
    [land(3) + 0.1, 10.9, "Varying columns: wide-column."],
    [T.tag + 0.1, 12.4, "Pick by the question."],
  ];
  const DUR = 13.0;
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
    [T.fly.every((f, j) => j === 0 || f >= land(j - 1) + 0.9), T.tag >= land(3) + 1.5, T.tag + 0.5 <= CAPS[5][1]],
    [true, true, true],
  );

  /** the family pictogram at ICON.size: D2.fam(k, size) does not scale the document icon's braces, so it is drawn at 100 and shrunk whole */
  const icon = (kind, tone) => {
    const inner = D2.fam(kind, 100, tone);
    inner.style.transform = `scale(${ICON.size / 100})`; // an SVG element scales about the svg origin, where the icon is centred
    return V.s("g", {}, inner);
  };

  function build(stage) {
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
      return D2.card(stage, {
        x: p.x,
        y: p.y,
        w: JOB.w,
        h: JOB.h,
        text: LINES[j].join("\n"),
        tone: "blue",
        plain: false,
      });
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
    const tag = D2.tag(stage, { x: TAG.x, y: TAG.y, text: TAG.text, tone: "blue", solid: true, fs: TAG.fs, h: TAG.h });
    tag.el.style.width = `${TAG.w}px`;

    return (t) => {
      const lin = (a, d = 0.4) => ramp(t, a, a + d, E.lin);

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

      // the jobs: pop in a row, then one at a time lift off, drop into the free gap, slide sideways and settle into their pocket
      JOBS.forEach((_, j) => {
        const [a, b] = [jobPos(j), pocketPos(FAMILY_OF[j])];
        const u = ramp(t, T.fly[j], land(j), E.lin);
        const x = a.x + (b.x - a.x) * ramp(u, 0.2, 0.8, E.inOut);
        const y = a.y + (GAP_Y - a.y) * ramp(u, 0, 0.5, E.out) + (b.y - GAP_Y) * ramp(u, 0.55, 1, E.inOut);
        const lift = 0.08 * Math.sin(Math.PI * u) + 0.07 * flash(t, land(j), land(j) + 0.3); // a lift in the air, a small squash on landing
        jobs[j].set({ k: lin(T.job + j * T.step), x: x - a.x, y: y - a.y, s: 1 + lift });
        jobs[j].el.style.zIndex = u > 0 && u < 1 ? "5" : ""; // a flying card passes in front of everything
      });

      tag.set({ k: lin(T.tag) });
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
