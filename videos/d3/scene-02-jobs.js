/* Lecture 3 (ds-3) · scene 2 (TWO JOBS): a database stores data and gives it back, and the right design depends on the workload
   (lesson 3.1 "The two jobs of a database"). Transactional work is many small writes (orders, payments): nine "write" packets
   fly along three lanes into the database drum, one after another, and the "writes" counter counts them. Analytics is one big read
   (reports on lots of data): a band scans a table of 6 rows x 4 cells row by row, the "rows read" counter counts the rows, and one
   answer comes out. The numbers come from D3.LOAD (asserted when the page loads, and again below).
   Story (local seconds): 0.0 tag, sub-label, drum, lane arrows and counter pop (the transactional half is centred on the stage),
   0.4-3.5 nine writes fly in 0.28 s apart (every arrival bumps the drum and the counter), 3.55 "9 stored", 3.75-4.4 the half
   slides left, 4.15-4.9 the analytics half pops (tag, sub-label, 24 tiles, counter), 4.3 the divider draws, 5.2-7.3 the scan band
   hops down the table one row every 0.35 s (a row is solid blue while it is read, blue tint afterwards), 7.45 the green "1 answer"
   tag pops, 7.9 both headings turn orange (attention) and both counters bump (design follows the workload), 10 hold. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the data (asserted against the storyboard) ----------
  const WRITES = D3.LOAD.txn.writes;
  const { cols: COLS, rows: ROWS, cells: CELLS, answer: ANSWER } = D3.LOAD.ana;
  D3.same("jobs scene: nine small writes", WRITES, 9);
  D3.same("jobs scene: a 4 x 6 table of 24 cells", [COLS, ROWS, COLS * ROWS, CELLS], [4, 6, 24, 24]);
  D3.same("jobs scene: one answer", ANSWER, 1);
  /** which of the three lanes (0 top, 1 middle, 2 bottom) write i flies along: every three in a row use three different lanes */
  const LANE_OF = Array.from({ length: WRITES }, (_, i) => [1, 0, 2][i % 3]);

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const HALF = 396; // the width of each half
  const LX = 20; // left half: its final x (a 20 px margin, so a pulse stays inside the 12 px margin)
  const RX = 520; // right half (the table ends 20 px from the stage edge too)
  const DIV = (LX + HALF + RX) / 2; // the divider between them
  const HOME = Math.round(936 / 2 - (LX + HALF / 2)); // the left half starts centred on the stage, then slides to LX
  const DISK = { x: 322, y: 270, size: 180 };
  const LANE_Y = [-66, 0, 66].map((d) => DISK.y + d);
  const PKT = { w: 96, h: 52 };
  const FROM = LX + PKT.w / 2; // a packet's centre when it leaves ...
  const TO = DISK.x - DISK.size / 2 + 8; // ... and when it reaches the drum's edge
  const TAB = { x: RX, y: 126, w: 90, h: 40, gap: 12, colGap: 12 };
  const STAT = { w: 340, y: 448 }; // narrower than the table, so its bump stays inside the margin
  const PITCH = TAB.h + TAB.gap;
  const RESULT_Y = 548; // the "9 stored" and "1 answer" tags
  D3.same(
    "jobs scene: a pulsing heading stays inside the 12 px margin",
    LX - 0.03 * D3.tagW("transactional") >= 12 && RX + 0.03 * D3.tagW("analytics") >= 12,
    true,
  );
  D3.same("jobs scene: the table is as wide as its half", COLS * TAB.w + (COLS - 1) * TAB.colGap, HALF);

  // ---------- timeline ----------
  const T = {
    send: 0.4, // the first write leaves
    gap: 0.28, // one more every 0.28 s
    fly: 0.9, // a write takes this long to reach the drum
    slide: 3.75, // the left half slides left (0.65 s)
    right: 4.15, // the analytics half pops
    tiles: 4.25, // the 24 tiles, 0.012 s apart
    scan: 5.2, // the band is on the first row ...
    per: 0.35, // ... and hops down one row every 0.35 s
    ans: 7.45, // the answer tag
    emph: 7.9, // both headings turn orange
  };
  T.end = T.scan + ROWS * T.per; // the scan is over
  const launch = (i) => T.send + i * T.gap;
  const arrive = (i) => launch(i) + T.fly;

  // two packets of one lane never touch, and packets of neighbouring lanes never touch either
  const SPEED = (TO - FROM) / T.fly;
  D3.same("jobs scene: packets in one lane keep a gap", 3 * T.gap * SPEED - PKT.w >= 24, true);
  D3.same("jobs scene: neighbouring lanes keep a gap", LANE_Y[1] - LANE_Y[0] - PKT.h >= 12, true);

  function build(stage) {
    // ---- the transactional half: it lives in one container so it can slide as a whole ----
    const left = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(left);
    const lowL = L5.svg(left);
    const lanes = LANE_Y.map((y) =>
      lowL.appendChild(L5.arrow(LX, y, DISK.x - DISK.size / 2 - 6, y, "grey", 1, { w: 5, head: 18 })),
    );
    const disk = lowL.appendChild(D3.disk(DISK.x, DISK.y, DISK.size, "grey"));
    const tagL = D3.tag(left, { x: LX, y: 8, text: "transactional", tone: "grey" });
    const subL = D3.label(left, { x: LX, y: 74, w: HALF, text: "orders, payments", align: "left" });
    const dbLab = D3.label(left, { x: DISK.x - 90, y: 386, w: 180, text: "database" });
    const packets = LANE_OF.map((l) =>
      D3.chip(left, { x: LX, y: LANE_Y[l] - PKT.h / 2, ...PKT, text: "write", tone: "blue", fs: 28, radius: 16 }),
    );
    const statL = D3.stat(left, { x: LX + (HALF - STAT.w) / 2, y: STAT.y, w: STAT.w, label: "writes", tone: "orange" });
    const storedText = `${WRITES} stored`;
    const stored = D3.tag(left, {
      x: LX + (HALF - D3.tagW(storedText)) / 2,
      y: RESULT_Y,
      text: storedText,
      tone: "green",
      solid: true,
    });

    // ---- the divider ----
    const mid = L5.svg(stage);
    const line = mid.appendChild(
      V.s(
        "g",
        {},
        V.s("path", {
          d: `M ${DIV} 8 L ${DIV} 606`,
          fill: "none",
          pathLength: "1",
          "data-draw": "1",
          "stroke-width": "5",
          "stroke-linecap": "round",
          style: { stroke: D3.tone("grey").edge },
        }),
      ),
    );

    // ---- the analytics half ----
    const tagR = D3.tag(stage, { x: RX, y: 8, text: "analytics", tone: "grey" });
    const subR = D3.label(stage, { x: RX, y: 74, w: HALF, text: "reports on lots of data", align: "left" });
    const table = D3.recs(stage, {
      x: TAB.x,
      y: TAB.y,
      w: TAB.w,
      h: TAB.h,
      gap: TAB.gap,
      colGap: TAB.colGap,
      cols: COLS,
      recs: Array.from({ length: CELLS }, () => ({})),
      radius: 12,
    });
    const band = V.h("div", {
      style: {
        ...D3.abs(TAB.x - 7, TAB.y - 7, HALF + 14, TAB.h + 14),
        boxSizing: "border-box",
        border: "4px solid var(--blue)",
        borderRadius: "20px",
      },
    });
    stage.append(band);
    const statR = D3.stat(stage, {
      x: RX + (HALF - STAT.w) / 2,
      y: STAT.y,
      w: STAT.w,
      label: "rows read",
      tone: "orange",
    });
    const answerText = `${ANSWER} answer`;
    const answer = D3.tag(stage, {
      x: RX + (HALF - D3.tagW(answerText)) / 2,
      y: RESULT_Y,
      text: answerText,
      tone: "green",
      solid: true,
    });

    return (t) => {
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
      const pulse = (a, d) => flash(t, a, a + d);
      const emph = t >= T.emph;
      const head = { tone: emph ? "orange" : "grey", solid: emph, s: 1 + 0.06 * pulse(T.emph, 0.4) };

      // ---- the left half slides out of the middle of the stage as the right half arrives ----
      V.place(left, { x: HOME * (1 - ramp(t, T.slide, T.slide + 0.65, E.inOut)) });
      L5.drawOn(line, ramp(t, 4.3, 4.8, E.out));

      // ---- nine small writes fly along three lanes into the database ----
      const arrived = packets.filter((_, i) => t >= arrive(i)).length;
      const bump = Math.min(
        1,
        packets.reduce((s, _, i) => s + flash(t, arrive(i) - 0.1, arrive(i) + 0.2), 0),
      );
      const dp = D3.pop(k(0.05, 0.45));
      V.place(disk, { s: dp.s * (1 + 0.06 * bump), o: dp.o });
      lanes.forEach((g, i) => L5.drawOn(g, ramp(t, 0.1 + 0.08 * i, 0.5 + 0.08 * i, E.out)));
      tagL.set({ k: k(0, 0.4), ...head });
      subL.set({ k: k(0.1, 0.4) });
      dbLab.set({ k: k(0.2, 0.4) });
      packets.forEach((p, i) => {
        const f = clamp((t - launch(i)) / T.fly);
        const gone = ramp(f, 0.8, 1, E.lin); // it shrinks and fades as it enters the drum
        p.set({
          x: lerp(0, TO - FROM, f),
          s: 1 - 0.7 * gone,
          o: t < launch(i) ? 0 : ramp(f, 0, 0.12, E.lin) * (1 - gone),
        });
      });
      statL.set({ text: String(arrived), k: k(0.25), bump: Math.min(1, bump + pulse(T.emph, 0.4)) });
      stored.set({ k: k(arrive(WRITES - 1) + 0.01) });

      // ---- one big read: the band hops down the table, a row at a time ----
      const p = (t - T.scan) / T.per; // which row the scan is on (a fraction of a row between two)
      const cur = Math.min(ROWS - 1, Math.max(0, Math.floor(p))); // the row being read
      const lead = cur < ROWS - 1 ? E.inOut(clamp((p - Math.floor(p) - 0.6) / 0.4)) : 0; // the band moves ahead to the next row
      const scanning = t >= T.scan && t < T.end;
      tagR.set({ k: k(T.right, 0.4), ...head });
      subR.set({ k: k(T.right + 0.1, 0.4) });
      table.all((i) => {
        const r = Math.floor(i / COLS);
        return {
          k: D3.seq(t, T.tiles, 0.012, 0.3, i),
          tone: t >= T.scan + r * T.per ? "blue" : "grey",
          solid: scanning && cur === r,
        };
      });
      V.place(band, {
        y: (cur + (t >= T.scan ? lead : 0)) * PITCH,
        o: Math.min(ramp(t, T.scan - 0.15, T.scan, E.lin), 1 - ramp(t, T.end, T.end + 0.2, E.lin)),
      });
      statR.set({
        text: String(t >= T.scan ? Math.min(ROWS, Math.floor(p) + 1) : 0),
        k: k(T.right + 0.3),
        bump: Math.min(
          1,
          Array.from({ length: ROWS }, (_, r) => pulse(T.scan + r * T.per, 0.3)).reduce((a, b) => a + b, 0) +
            pulse(T.emph, 0.4),
        ),
      });
      answer.set({ k: k(T.ans) });
    };
  }

  V.scene({
    kicker: "TWO JOBS",
    title: ["A database stores data", "and finds it again"],
    dur: 10,
    caps: [
      [0.5, 3.2, "Some work is many small writes."],
      [4.9, 7.4, "Other work is one big read."],
      [8.0, 9.8, "Design follows the workload."],
    ],
    build,
  });
})();
