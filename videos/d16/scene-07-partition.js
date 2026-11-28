/* Lecture 16 (ds-16) · scene 7 (PARTITIONING): which of Leafly's six jobs go into hardware, and the tools that check the
   split before anything is built (lesson 16.4: the partition board, D16.JOBS and its counters D16.PART).
   Story (local seconds): 0.3 a blue 'software' column holding the six jobs and an empty purple 'hardware' column, counters
   'Speed 0/3 fast' and 'Easy to update 3/3 free'; 2.8 the three heavy jobs slide to hardware (stagger 0.4), the speed counter
   climbs to 3/3 and turns green; 5.0 'Pet-safety rules' slides over, turns red, tag 'new rule next month: new chip', the
   update counter drops to 2/3; 7.0 it slides back, 7.6 the counter is 3/3 again; 7.8 the board fades; 8.2 chain 1 'HDL model'
   + 'Software' -> 'Simulate' (green), 9.0 grey tag 'HDL: hardware description language'; 11.0 chain 2 'What it does' ->
   'Synthesis' -> 'HDL design'; 13.0 grey tag 'Platform-based design: start from a kit'. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, ease: E } = V;
  const J = D16.JOBS;
  const P = D16.PART;
  D16.same(
    "partition: start, tidy, pet rules in silicon",
    [P.start.fast, P.tidy.fast, P.tidy.free, P.pet.free],
    [0, 3, 3, 2],
  );

  const T = {
    board: 0.3,
    heavy: 2.8,
    pet: [5.0, 5.6],
    back: [7.0, 7.6],
    fade: 7.8,
    c1: 8.2,
    hdl: 9.0,
    c2: 11.0,
    kit: 13.0,
  };
  const SW = 232;
  const HW = 704;
  const slotY = (i) => 104 + 63 * i;
  const heavyAt = (i) => T.heavy + 0.4 * i;
  const PET = 5;

  V.scene({
    kicker: "PARTITIONING",
    title: ["Fast and fixed,", "or flexible and slower"],
    dur: 15,
    caps: [
      [0.4, 2.6, "Six Leafly jobs. Which go into hardware?"],
      [2.8, 4.8, "Heavy, stable jobs to hardware: speed and parallelism."],
      [5.0, 7.6, "Rules that change stay in software, easy to update."],
      [8.0, 10.8, "Simulate chip and code together before building anything."],
      [11.0, 14.6, "High-level synthesis: describe the behaviour, get an HDL design."],
    ],
    build(stage) {
      const board = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
      stage.append(board);
      const col = (x, tone) =>
        board.appendChild(
          V.h("div", {
            class: `v-card c-${tone}`,
            style: { left: `${x}px`, top: "12px", width: "440px", height: "440px" },
          }),
        );
      const cols = [col(12, "blue"), col(484, "purple")];
      const heads = [
        D4.label(board, { x: SW, y: 50, text: "software", tone: "blue", fs: 32 }),
        D4.label(board, { x: HW, y: 50, text: "hardware", tone: "purple", fs: 32 }),
      ];
      const jobs = J.map((j) => D4.tag(board, { text: j.short, fs: 28 }));
      const speed = D4.tag(board, { x: SW, y: 500, text: "", tone: "blue" });
      const free = D4.tag(board, { x: HW, y: 500, text: "", tone: "green" });
      const frozen = D4.tag(board, { x: HW, y: 568, text: "new rule next month: new chip", tone: "red", solid: true });

      const svg = D4.svg(stage);
      const c1 = [
        D16.box(stage, { x: 150, y: 120, w: 240, h: 120, title: "HDL model", sub: "of the chip", tone: "purple" }),
        D16.box(stage, { x: 450, y: 120, w: 240, h: 120, title: "Software", sub: "the real code", tone: "blue" }),
        D16.box(stage, {
          x: 786,
          y: 120,
          w: 240,
          h: 120,
          title: "Simulate",
          sub: "together",
          tone: "green",
          solid: true,
        }),
      ];
      const plus = D4.label(stage, { x: 300, y: 120, text: "+", fs: 48 });
      const a1 = D16.arrow(svg, [576, 120], [660, 120], { w: 7, head: 20 });
      const hdl = D4.tag(stage, { x: 468, y: 226, text: "HDL: hardware description language" });
      const c2 = [
        D16.box(stage, { x: 150, y: 340, w: 260, h: 120, title: "What it does", sub: "high-level spec", tone: "blue" }),
        D16.box(stage, { x: 468, y: 340, w: 240, h: 120, title: "Synthesis", sub: "automated" }),
        D16.box(stage, { x: 786, y: 340, w: 240, h: 120, title: "HDL design", sub: "ready to build", tone: "purple" }),
      ];
      const a2 = [
        D16.arrow(svg, [286, 340], [342, 340], { w: 7, head: 20 }),
        D16.arrow(svg, [594, 340], [660, 340], { w: 7, head: 20 }),
      ];
      const kit = D4.tag(stage, { x: 468, y: 520, text: "Platform-based design: start from a kit", tone: "grey" });

      return (t) => {
        const fade = 1 - ramp(t, T.fade, T.fade + 0.4, E.lin);
        V.place(board, { y: -20 * (1 - fade), o: fade });
        cols.forEach((c, i) => V.place(c, { o: ramp(t, T.board + 0.2 * i, T.board + 0.2 * i + 0.4) }));
        heads.forEach((h, i) => h.set({ k: ramp(t, T.board + 0.2 * i, T.board + 0.2 * i + 0.4) }));

        // where each job is: 0 = software, 1 = hardware (blended while it slides)
        const petIn = ramp(t, T.pet[0], T.pet[1], E.inOut) - ramp(t, T.back[0], T.back[1], E.inOut);
        const pos = J.map((j, i) => (j.heavy ? ramp(t, heavyAt(i), heavyAt(i) + 0.6, E.inOut) : i === PET ? petIn : 0));
        jobs.forEach((tag, i) => {
          const hwNow = pos[i] >= 1;
          const tone = hwNow ? (J[i].heavy ? "purple" : "red") : "blue";
          tag.set({
            x: SW + (HW - SW) * pos[i],
            y: slotY(i),
            k: D16.seq(t, T.board + 0.4, 0.15, 0.4, i),
            tone,
            solid: hwNow,
            s: 1 + 0.1 * flash(t, T.pet[1], T.pet[1] + 0.4) * (i === PET ? 1 : 0),
          });
        });
        const hw = pos.map((p) => p >= 1);
        const sc = D16.score(hw);
        speed.set({
          k: ramp(t, T.board + 1.4, T.board + 1.8, E.lin),
          text: `Speed ${sc.fast}/3 fast`,
          tone: sc.fast === 3 ? "green" : "blue",
          solid: sc.fast === 3,
          s: 1 + 0.1 * J.reduce((a, j, i) => a + (j.heavy ? flash(t, heavyAt(i) + 0.6, heavyAt(i) + 0.9) : 0), 0),
        });
        free.set({
          k: ramp(t, T.board + 1.4, T.board + 1.8, E.lin),
          text: `Easy to update ${sc.free}/3 free`,
          tone: sc.free === 3 ? "green" : "red",
          s: 1 + 0.1 * (flash(t, T.pet[1], T.pet[1] + 0.3) + flash(t, T.back[1], T.back[1] + 0.3)),
        });
        frozen.set({
          k: ramp(t, T.pet[1] + 0.2, T.pet[1] + 0.6, E.lin) * (1 - ramp(t, T.back[0], T.back[0] + 0.3, E.lin)),
        });

        c1.forEach((b, i) => b.set({ k: D16.seq(t, T.c1, 0.35, 0.5, i === 2 ? 3 : i) }));
        plus.set({ k: ramp(t, T.c1 + 0.2, T.c1 + 0.5, E.lin) });
        a1.set({ k: ramp(t, T.c1 + 0.7, T.c1 + 1.1, E.inOut) });
        hdl.set({ k: ramp(t, T.hdl + 0.6, T.hdl + 1.0, E.lin) });
        c2.forEach((b, i) => b.set({ k: D16.seq(t, T.c2, 0.6, 0.5, i) }));
        a2.forEach((a, i) => a.set({ k: E.inOut(D16.seq(t, T.c2 + 0.4, 0.6, 0.4, i)) }));
        kit.set({ k: ramp(t, T.kit, T.kit + 0.4, E.lin) });
      };
    },
  });
})();
