/* Lecture 18 video, scene 02-vonneumann: Hoglet, a hedgehog camera whose battery dies by Tuesday, holds an ordinary von
   Neumann computer: a processor (orange) and a separate memory (blue). A program runs step by step, in binary; data packets
   shuttle along the bus, faster and faster, each trip ticks a red counter and takes a sliver off the battery.
   Layout (stage px): left x 12..612: the garden (Hoglet on its post, a hedgehog, grass), later the 'inside Hoglet' panel
   with Processor (x 30..200) and Memory (x 420..590) boxes at y 330..450, the bus between them, the Program scroll above the
   processor. Right panel x 636..924: battery (y 24), 'dies by Tuesday' tag, 'trips' stat (y 250).
   Story (local seconds): 0.4 garden and Hoglet, 1.0 battery, 1.6 tag; 3.2 the garden fades, the panel and the two boxes pop;
   6.0 the program scroll (step 1..3 light in turn) and the first packets; trips speed up to 11.6; 8.8 red label 'every
   trip costs time and energy'; hold to 12. */
VID.scene({
  kicker: "A COMPUTER SHAPED LIKE A BRAIN",
  title: ["Hoglet's chip", "keeps making trips"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Hoglet watches the garden for hedgehogs all night."],
    [3.2, 5.8, "Inside: a von Neumann computer, processor and memory apart."],
    [6.0, 8.6, "A program runs step by step, in binary."],
    [8.8, 11.7, "Data shuttles back and forth, and every trip costs energy."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp } = V;
    const svg = V.l5.svg(stage, 936, 640);

    // garden
    const garden = svg.appendChild(V.s("g", {}));
    L18.rect(garden, { x: 12, y: 12, w: 600, h: 616, rx: 22, tone: "grey", fill: "dim", sw: 4 });
    L18.rect(garden, { x: 12, y: 548, w: 600, h: 80, rx: 22, tone: "green", fill: "dim", sw: 4 });
    const moon = L18.circ(garden, 520, 90, 34, "grey", "c");
    moon.style.fill = L13.tone("orange").dim;
    const cam = L18.camera(garden, 130, 300, 1.4);
    L18.hedgehog(garden, 440, 548, 1.3);

    // inside: processor and memory
    const inside = svg.appendChild(V.s("g", {}));
    L18.rect(inside, { x: 12, y: 12, w: 600, h: 616, rx: 22, tone: "grey", fill: "dim", sw: 4 });
    const bus = [
      L18.line(inside, [190, 405], [450, 405], "grey", 8),
      L18.line(inside, [190, 445], [450, 445], "grey", 8),
    ];
    const proc = L18.rect(inside, { x: 30, y: 300, w: 160, h: 170, rx: 18, tone: "orange", fill: "dim", sw: 5 });
    const mem = L18.rect(inside, { x: 450, y: 300, w: 160, h: 170, rx: 18, tone: "blue", fill: "dim", sw: 5 });
    const scroll = L18.scroll(inside, 40, 90, 150, 180, "orange");
    const bat = L18.battery(svg, 660, 30, 230, 80);

    const insideTag = L13.tag(stage, { x: 24, y: 24, text: "inside Hoglet", tone: "grey", solid: true });
    const procL = L13.label(stage, { x: 30, y: 312, w: 160, text: "Processor", tone: "orange", bold: true });
    const memL = L13.label(stage, { x: 450, y: 312, w: 160, text: "Memory", tone: "blue", bold: true });
    const progL = L13.label(stage, { x: 214, y: 110, w: 200, text: "Program", tone: "orange", align: "left" });
    const steps = [1, 2, 3].map((n, i) =>
      L13.label(stage, { x: 40, y: 116 + 46 * i, w: 150, text: `step ${n}`, tone: "grey" }),
    );
    const dies = L13.tag(stage, { x: 660, y: 140, text: "dies by Tuesday", tone: "red", solid: true });
    const trips = L13.stat(stage, { x: 636, y: 250, w: 288, h: 90, label: "trips", tone: "red" });
    const cost = L13.tag(stage, { x: 60, y: 530, text: "every trip costs time and energy", tone: "red", solid: true });
    const pkt = L13.chip(stage, { x: 0, y: 0, w: 104, h: 50, text: "0110", tone: "blue", fs: 30, radius: 14 });

    // trips: each one shorter than the last (faster and faster)
    const TRIP = [];
    for (let s = 6.2, i = 0; s < 11.6; i++) {
      const d = Math.max(0.22, 0.9 * Math.pow(0.8, i));
      TRIP.push([s, d]);
      s += d + 0.06;
    }
    L18.same(TRIP.length >= 12, true, "scene 2: at least a dozen trips");

    return (t) => {
      const gk = ramp(t, 0.2, 0.6) * (1 - ramp(t, 3.0, 3.4));
      L18.op(garden, gk);
      V.place(cam, { y: (1 - ramp(t, 0.4, 0.9)) * 30, o: ramp(t, 0.4, 0.7) });
      const ik = ramp(t, 3.2, 3.6);
      L18.op(inside, ik);
      insideTag.set({ k: ramp(t, 3.3, 3.7) });
      [proc, mem].forEach((el, i) =>
        V.place(el, { s: 0.8 + 0.2 * ramp(t, 3.4 + 0.4 * i, 3.8 + 0.4 * i, V.ease.back) }),
      );
      procL.set({ k: ramp(t, 3.6, 4.0) });
      memL.set({ k: ramp(t, 4.0, 4.4) });
      bus.forEach((b) => L18.op(b, ramp(t, 4.4, 4.8)));
      const sk = ramp(t, 6.0, 6.4);
      L18.op(scroll, sk);
      progL.set({ k: ramp(t, 6.1, 6.5) });
      const cur = t < 6.4 ? -1 : Math.floor((t - 6.4) / 0.8) % 3;
      steps.forEach((l, i) => l.set({ k: sk, tone: i === cur ? "orange" : "grey", bold: i === cur }));

      const done = TRIP.filter(([s, d]) => t >= s + d).length;
      const now = TRIP.findIndex(([s, d]) => t >= s && t < s + d);
      if (now >= 0) {
        const [s, d] = TRIP[now];
        const f = V.ease.inOut((t - s) / d);
        const toProc = now % 2 === 0;
        const x = toProc ? V.lerp(494, 34, f) : V.lerp(34, 494, f);
        pkt.set({
          x,
          y: toProc ? 380 : 420,
          text: toProc ? "0110" : "1011",
          tone: toProc ? "blue" : "orange",
          solid: true,
        });
      } else pkt.set({ k: 0 });
      bat.set({
        level: (1 - 0.05 * done) * ramp(t, 1.0, 1.4),
        tone: done >= 12 ? "red" : done >= 6 ? "orange" : "green",
      });
      V.place(bat.g, { o: ramp(t, 1.0, 1.3) });
      dies.set({ k: ramp(t, 1.6, 2.0) });
      trips.set({ k: ramp(t, 6.0, 6.4), text: String(done) });
      cost.set({ k: ramp(t, 8.8, 9.2) });
    };
  },
});
