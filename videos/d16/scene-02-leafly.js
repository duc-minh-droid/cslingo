/* Lecture 16 (ds-16) · scene 2 (WHY CO-DESIGN): Leafly, the running example, and why AI pushes for new chips (lesson 16.1).
   Story (local seconds): 0.3 a grey phone with a leaf photo, the flow Snap -> Recognise -> Answer builds beside it;
   2.8 the flow fades, an orange 'photo' packet flies up to a grey cloud server (3.0-4.2), 4.3 red tag 'a few seconds',
   4.9 the phone's signal bars are crossed out red, tag 'no signal: no answer'; 5.8 two cards, General chip (Swiss army knife)
   and Specialised chip (garlic press), a red arrow 'AI and data science' presses on the general card; 8.8 red tag 'Moore's
   law: slowing down'; 11.4 a purple 'new chip: very expensive' card, the orange 'needs large demand' tag slides onto it and a
   green tick draws (12.2). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const T = {
    flow: 0.3,
    out: 2.8,
    fly: [3.0, 4.2],
    slow: 4.3,
    sig: 4.9,
    cards: 5.8,
    press: 6.4,
    moore: 8.8,
    chip: 11.4,
  };
  const PH = { x: 130, y: 330, s: 300 };

  V.scene({
    kicker: "WHY CO-DESIGN",
    title: ["One chip can't do it all", "for every job"],
    dur: 14,
    caps: [
      [0.4, 2.6, "Leafly: snap a leaf, get the plant's name."],
      [2.8, 5.6, "Today the photo goes to the cloud. Answer: a few seconds."],
      [5.8, 8.6, "AI pushes general hardware to its limits."],
      [8.8, 11.2, "Moore's law is slowing: waiting won't do it."],
      [11.4, 13.7, "A new chip is very expensive, so it needs large demand."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      // phase 1 and 2: the phone, the flow, the cloud
      const phone = V.s("g", {}, D16.phone(PH.x, PH.y, PH.s), D16.leaf(PH.x, PH.y - 20, 110));
      const cloud = D16.cloud(700, 150, 260);
      const signal = D16.signal(PH.x + 128, PH.y - 150, 56);
      const sigX = L5.cross(PH.x + 128, PH.y - 150, 66, "red");
      svg.append(phone, cloud, signal, sigX);
      const xs = [340, 578, 816];
      const flow = [
        ["Snap", "a photo of a leaf"],
        ["Recognise", "a neural network"],
        ["Answer", "“that's ivy”"],
      ].map(([title, sub], i) => D16.box(stage, { x: xs[i], y: 330, w: 190, h: 170, title, sub }));
      const fArr = [0, 1].map((i) => D16.arrow(svg, [xs[i] + 98, 330], [xs[i + 1] - 98, 330], { w: 6, head: 18 }));
      const pk = D4.packet(stage, { text: "photo", tone: "orange" });
      const slow = D4.tag(stage, { x: 700, y: 268, text: "a few seconds", tone: "red", solid: true });
      const noSig = D4.tag(stage, { x: 178, y: 530, text: "no signal: no answer", tone: "red" });

      // phase 3: general against specialised
      const gen = D16.box(stage, {
        x: 250,
        y: 235,
        w: 390,
        h: 230,
        title: "General chip",
        sub: "does almost anything",
        icon: "knife",
        iconSize: 96,
      });
      const spec = D16.box(stage, {
        x: 686,
        y: 235,
        w: 390,
        h: 230,
        title: "Specialised chip",
        sub: "one job, far better",
        tone: "green",
        icon: "press",
        iconSize: 96,
      });
      const ai = D4.tag(stage, { x: 250, y: 36, text: "AI and data science", tone: "red", solid: true });
      const push = D16.arrow(svg, [250, 66], [250, 114], { tone: "red", w: 8, head: 22 });
      const moore = D4.tag(stage, { x: 468, y: 410, text: "Moore's law: slowing down", tone: "red" });
      const chip = D16.box(stage, {
        x: 290,
        y: 540,
        w: 500,
        h: 100,
        title: "new chip: very expensive",
        tone: "purple",
        icon: "chip",
        iconSize: 60,
        row: true,
        fs: 30,
      });
      const demand = D4.tag(stage, { x: 700, y: 540, text: "needs large demand", tone: "orange", solid: true });
      const tsvg = D4.svg(stage);
      const tick = L5.tick(898, 540, 50, "green");
      tsvg.append(tick);

      return (t) => {
        const out1 = 1 - ramp(t, T.out, T.out + 0.4, E.lin);
        const out2 = 1 - ramp(t, T.cards - 0.2, T.cards + 0.2, E.lin);
        V.place(phone, {
          s: 0.8 + 0.2 * ramp(t, T.flow, T.flow + 0.6, E.pop),
          o: ramp(t, T.flow, T.flow + 0.3) * out2,
        });
        flow.forEach((b, i) => b.set({ k: D16.seq(t, 0.6, 0.6, 0.5, i), o: out1 }));
        fArr.forEach((a, i) => a.set({ k: D16.seq(t, 1.0, 0.6, 0.4, i), o: out1 }));

        V.place(cloud, { s: 0.8 + 0.2 * ramp(t, T.out, T.out + 0.6, E.pop), o: ramp(t, T.out, T.out + 0.3) * out2 });
        const kf = ramp(t, T.fly[0], T.fly[1], E.inOut);
        const p = D4.at({ x: PH.x, y: PH.y - 150 }, { x: 700, y: 170 }, kf, 90);
        pk.set({ x: p.x, y: p.y, k: kf > 0 && kf < 1 ? 1 : 0, o: kf > 0 && kf < 1 ? Math.min(1, kf * 8) : 0 });
        slow.set({ k: ramp(t, T.slow, T.slow + 0.4, E.lin), o: out2 });
        V.place(signal, { o: ramp(t, T.sig - 0.4, T.sig, E.lin) * out2 });
        L5.drawOn(sigX, ramp(t, T.sig, T.sig + 0.4, E.out));
        V.show(sigX, out2);
        noSig.set({ k: ramp(t, T.sig + 0.3, T.sig + 0.7, E.lin), o: out2 });

        // general against specialised: the red arrow keeps pressing on the general card
        const kc = (i) => D16.seq(t, T.cards, 0.3, 0.5, i);
        const beat = t >= T.press ? Math.max(0, Math.sin((2 * Math.PI * (t - T.press)) / 1.2)) : 0;
        gen.set({ k: kc(0), s: 1 - 0.03 * beat });
        spec.set({ k: kc(1) });
        ai.set({ k: ramp(t, T.press - 0.2, T.press + 0.2, E.lin), y: 6 * beat });
        push.set({ k: ramp(t, T.press, T.press + 0.4, E.out) });
        V.place(push.g, { y: 6 * beat, o: t >= T.press ? 1 : 0 });
        moore.set({ k: ramp(t, T.moore, T.moore + 0.4, E.lin), x: (1 - ramp(t, T.moore, T.moore + 0.5)) * -40 });
        chip.set({ k: ramp(t, T.chip, T.chip + 0.5) });
        const kd = ramp(t, T.chip + 0.5, T.chip + 1.1, E.out);
        demand.set({ k: kd > 0 ? 1 : 0, x: (1 - kd) * 140, s: 1 + 0.1 * flash(t, T.chip + 1.1, T.chip + 1.4) });
        L5.drawOn(tick, ramp(t, T.chip + 1.3, T.chip + 1.7, E.out));
      };
    },
  });
})();
