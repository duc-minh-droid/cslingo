/* Lecture 18 video, scene 07-chips: the real machines of lesson 18.2 (facts from l18-02.js, L18.SPIN checks 1 + 17 = 18).
   Three cards, each a chip pictogram and stat lines that tick in.
   SpiNNaker (green): a chip with 18 core squares (6 x 3), one orange 'monitor' (runs the operating system), 17 green
   'fascicle' cores (each models a group of neurons); lines 18 ARM cores, 128 MB shared, about 16,000 neurons, 8 million
   synapses, real time on 1 W; a tag 'SpiNNaker 2 (2019): ten times bigger'. TrueNorth (blue, IBM): 1 million neurons,
   256 million synapses, programmed in Corelet. NorthPole (2023, green): usable in AI pipelines, low latency, efficient
   without losing accuracy.
   Layout (stage px): SpiNNaker card x 12..452, y 12..628: title, chip 150 px at (40, 80), legend right of it (x 216..440),
   stat lines from y 270, SpiNNaker 2 tag at y 532. TrueNorth card x 468..924, y 12..312; NorthPole card x 468..924,
   y 328..628: title, chip 110 px at the left, stat lines (28 px, may wrap) at x 620..910.
   Story (local seconds): 0.4 SpiNNaker card, cores pop 0.8..1.9, legend 2.0; lines 3.2 + 0.6 i; 6.6 the tag; 8.8 TrueNorth,
   lines 9.4 + 0.5 i; 11.2 NorthPole, lines 11.6 + 0.5 i; hold to 14. */
VID.scene({
  kicker: "REAL CHIPS, REAL JOBS",
  title: ["SpiNNaker, TrueNorth", "and NorthPole"],
  dur: 14,
  caps: [
    [0.4, 3.0, "SpiNNaker: 18 ARM cores per chip, built for exploring."],
    [3.2, 6.4, "About 16,000 neurons in real time on 1 W per chip."],
    [6.6, 8.6, "SpiNNaker 2, in 2019, is ten times bigger."],
    [8.8, 11.0, "IBM TrueNorth: 1 million neurons per chip, set up in Corelet."],
    [11.2, 13.7, "NorthPole, 2023: easier, faster, efficient AI."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp } = V;
    const S = L18.SPIN;
    const CARDS = [
      {
        name: "SpiNNaker",
        tone: "green",
        box: [12, 12, 440, 616],
        body: [20, 258, 400],
        at: 0.4,
        lines: [
          `${S.cores} ARM cores`,
          `${S.mb} MB shared`,
          "about 16,000 neurons",
          "8 million synapses",
          "real time on 1 W",
        ],
        lat: 3.2,
        step: 0.6,
      },
      {
        name: "TrueNorth",
        tone: "blue",
        box: [468, 12, 456, 300],
        body: [152, 62, 290],
        at: 8.8,
        lines: ["1 million neurons", "256 million synapses", "programmed in Corelet"],
        lat: 9.4,
        step: 0.5,
      },
      {
        name: "NorthPole (2023)",
        tone: "green",
        box: [468, 328, 456, 300],
        body: [152, 62, 290],
        at: 11.2,
        lines: ["usable in AI pipelines", "low latency", "efficient without losing accuracy"],
        lat: 11.6,
        step: 0.5,
      },
    ];
    const px = (n) => `${n}px`;
    const els = CARDS.map((c) => {
      const [x, y, w, h] = c.box;
      const el = V.h("div", {
        class: `v-card plain c-${c.tone}`,
        style: { position: "absolute", left: px(x), top: px(y), width: px(w), height: px(h), borderRadius: "22px" },
      });
      const title = V.h("div", {
        text: c.name,
        style: {
          position: "absolute",
          left: "0",
          top: "12px",
          width: "100%",
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "900",
        },
      });
      const [bl, bt, bw] = c.body;
      const body = V.h("div", {
        style: {
          position: "absolute",
          left: px(bl),
          top: px(bt),
          width: px(bw),
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        },
      });
      const lines = c.lines.map((text) =>
        V.h("div", { text, style: { fontSize: "30px", fontWeight: "800", lineHeight: "1.15", textAlign: "left" } }),
      );
      body.append(...lines);
      el.append(title, body);
      stage.append(el);
      return { el, lines };
    });
    const svg = V.l5.svg(stage, 936, 640);
    // SpiNNaker chip: 6 x 3 cores, the first is the monitor
    const sp = L18.chip(svg, 44, 80, 150, "green");
    const cores = [];
    for (let i = 0; i < S.cores; i++)
      cores.push(
        L18.rect(svg, {
          x: 56 + (i % 6) * 21.5,
          y: 112 + Math.floor(i / 6) * 30,
          w: 17,
          h: 24,
          rx: 3,
          tone: i < S.monitor ? "orange" : "green",
          fill: "c",
          sw: 2,
        }),
      );
    L18.same(cores.length, 18, "scene 7: 18 cores drawn");
    const leg = [
      [`${S.monitor} monitor:\nruns the OS`, "orange", 90],
      [`${S.fascicle} fascicle:\nneuron groups`, "green", 170],
    ].map(([text, tone, y]) => {
      const l = L13.label(stage, { x: 222, y, w: 220, text, tone, align: "left", bold: true });
      Object.assign(l.el.style, { whiteSpace: "pre-line", lineHeight: "1.15" });
      return l;
    });
    const tn = L18.chip(svg, 496, 92, 110, "blue", 4);
    const np = L18.chip(svg, 496, 408, 110, "green", 3);
    const spin2 = L18.card(stage, {
      x: 32,
      y: 532,
      w: 400,
      h: 80,
      text: "SpiNNaker 2 (2019):\nten times bigger",
      tone: "green",
      plain: false,
    });

    return (t) => {
      els.forEach((e, i) => {
        const c = CARDS[i];
        const k = ramp(t, c.at, c.at + 0.4);
        V.place(e.el, { y: (1 - k) * 24, o: k });
        e.lines.forEach((l, j) => {
          const q = ramp(t, c.lat + c.step * j, c.lat + c.step * j + 0.4);
          V.place(l, { x: (1 - q) * 16, o: q });
        });
      });
      V.place(sp.g, { o: ramp(t, 0.5, 0.9) });
      cores.forEach((c, i) => L18.op(c, ramp(t, 0.8 + 0.06 * i, 1.0 + 0.06 * i)));
      leg.forEach((l, i) => l.set({ k: ramp(t, 2.0 + 0.3 * i, 2.4 + 0.3 * i), bold: true }));
      V.place(tn.g, { o: ramp(t, 8.9, 9.3) });
      V.place(np.g, { o: ramp(t, 11.3, 11.7) });
      spin2.set({ k: ramp(t, 6.6, 7.0) });
    };
  },
});
