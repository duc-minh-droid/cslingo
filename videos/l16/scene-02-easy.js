/* Lecture 16 video, scene 02-easy: lesson 16.1's "easy for whom?". A calculator wins sums (6,783 x 4,592 = 31,147,536,
   L16.MUL) and exact recall; people win catching, faces and finding things in pictures. Then the lesson's comparison table:
   computer (blue) four rows, human brain (green) five rows, "Learns" and "Generalises" tinted green.
   Layout (stage px): two columns, left x 12..452 (Computer, blue), right x 484..924 (You, green); header tags at y 12.
   Phase 1: sum card (y 84, h 150: the product row with an SVG times sign, the answer and a tick), recall card (y 252, h 96);
   three task rows at y 372 / 462 / 552 (h 76): green on the right with a tick, grey on the left with a red cross.
   Phase 2 (8.8): phase 1 fades, comparison cards y 84 + 104 i (h 88), the header tags become "Computer" / "Human brain".
   Story (local seconds): 0.1 headers; 0.4 sum card, 1.2 the answer and tick; 3.2 recall card; 6.0 / 6.4 / 6.8 the three
   task rows (green right, grey left plus cross 0.3 s later); 8.8 the comparison table, rows every 0.15 s; 10.2 "Learns"
   and "Generalises" tint green; hold to 12. */
VID.scene({
  kicker: "EASY FOR WHOM?",
  title: ["A calculator wins sums,", "you win faces"],
  dur: 12,
  caps: [
    [0.4, 3.0, "A calculator multiplies huge numbers in a flash."],
    [3.2, 5.8, "It also recalls exact facts for ever."],
    [6.0, 8.6, "But catching a ball or spotting a face? You win."],
    [8.8, 11.7, "Brains are distributed: they learn, generalise and forget."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const L5 = V.l5;
    const { ramp } = V;
    const M = L16.MUL;
    const fmt = (n) => n.toLocaleString("en-GB");
    L16.same([fmt(M.a), fmt(M.b), fmt(M.p)], ["6,783", "4,592", "31,147,536"], "scene 2: the sum");
    const COL = [12, 484];
    const W = 440;

    const head = [
      L13.tag(stage, { x: COL[0], y: 12, text: "Computer", tone: "blue", solid: true, fs: 30 }),
      L13.tag(stage, { x: COL[1], y: 12, text: "You", tone: "green", solid: true, fs: 30 }),
    ];
    const head2 = L13.tag(stage, { x: COL[1], y: 12, text: "Human brain", tone: "green", solid: true, fs: 30 });

    // ---------- phase 1 ----------
    const sumCard = L16.card(stage, { x: COL[0], y: 84, w: W, h: 150, text: "", tone: "blue" });
    const a = L13.label(stage, { x: 30, y: 100, w: 170, text: fmt(M.a), tone: "blue", align: "right", fs: 40 });
    const b = L13.label(stage, { x: 262, y: 100, w: 170, text: fmt(M.b), tone: "blue", align: "left", fs: 40 });
    const ans = L13.label(stage, { x: 30, y: 166, w: 330, text: fmt(M.p), tone: "blue", align: "center", fs: 44 });
    const recall = L16.card(stage, {
      x: COL[0],
      y: 252,
      w: W,
      h: 96,
      text: "Recall 13:04 on a\ndate years ago",
      tone: "blue",
    });
    const TASKS = ["Catch a ball", "Find faces in CCTV", "Find the car in a photo"];
    const ROWS = [372, 462, 552];
    const you = TASKS.map((text, i) => L16.card(stage, { x: COL[1], y: ROWS[i], w: W, h: 76, text, tone: "green" }));
    const pc = TASKS.map((text, i) => L16.card(stage, { x: COL[0], y: ROWS[i], w: W, h: 76, text, tone: "grey" }));
    const svg = L5.svg(stage, 936, 640);
    const times = L13.mark("times", 232, 128, 30, "blue");
    svg.appendChild(times);
    const ansTick = svg.appendChild(L5.tick(400, 192, 44, "green"));
    const ticks = ROWS.map((y) => svg.appendChild(L5.tick(COL[1] + W - 34, y + 38, 36, "green")));
    const crosses = ROWS.map((y) => svg.appendChild(L5.cross(COL[0] + W - 34, y + 38, 32, "red")));

    // ---------- phase 2 ----------
    const PC = [
      "Sequential and\nvery fast",
      "Rarely makes\nmistakes",
      "Memory separate\nfrom processing",
      "Stores information\nindefinitely",
    ];
    const BR = [
      "Distributed\narchitecture",
      "Learns",
      "Generalises",
      "Memory and processing\nmixed together",
      "Forgets unimportant\nthings",
    ];
    const GLOW = [1, 2];
    const t2 = (i) => 9.0 + 0.15 * i;
    const pcRows = PC.map((text, i) =>
      L16.card(stage, { x: COL[0], y: 84 + 104 * i, w: W, h: 88, text, tone: "blue" }),
    );
    const brRows = BR.map((text, i) =>
      L16.card(stage, { x: COL[1], y: 84 + 104 * i, w: W, h: 88, text, tone: "green" }),
    );

    return (t) => {
      const out = 1 - ramp(t, 8.8, 9.2);
      head[0].set({ k: ramp(t, 0.1, 0.4) });
      head[1].set({ k: ramp(t, 0.2, 0.5), o: out });
      head2.set({ k: ramp(t, 8.9, 9.3) });
      const ks = ramp(t, 0.4, 0.8);
      sumCard.set({ k: ks, o: out });
      a.set({ k: ks, o: out, bold: true });
      b.set({ k: ks, o: out, bold: true });
      times.setAttribute("opacity", (ks * out).toFixed(3));
      const ka = ramp(t, 1.2, 1.6);
      ans.set({ k: ka, o: out, bold: true });
      ansTick.setAttribute("opacity", (ramp(t, 1.5, 1.8) * out).toFixed(3));
      recall.set({ k: ramp(t, 3.2, 3.6), o: out });
      TASKS.forEach((_, i) => {
        const t0 = 6.0 + 0.4 * i;
        you[i].set({ k: ramp(t, t0, t0 + 0.4), y: (1 - ramp(t, t0, t0 + 0.4)) * -30, o: out });
        ticks[i].setAttribute("opacity", (ramp(t, t0 + 0.3, t0 + 0.5) * out).toFixed(3));
        pc[i].set({ k: ramp(t, t0, t0 + 0.4), o: out });
        crosses[i].setAttribute("opacity", (ramp(t, t0 + 0.3, t0 + 0.5) * out).toFixed(3));
      });
      pcRows.forEach((c, i) => c.set({ k: ramp(t, t2(i), t2(i) + 0.4) }));
      brRows.forEach((c, i) => {
        const g = GLOW.includes(i);
        c.set({
          k: ramp(t, t2(i), t2(i) + 0.4),
          plain: !(g && t >= 10.2),
          s: 1 + (g ? 0.05 * V.flash(t, 10.2, 10.7) : 0),
        });
      });
    };
  },
});
