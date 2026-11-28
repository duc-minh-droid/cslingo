/* Lecture 16 video, scene 03-brain: lesson 16.1's brain design. About 100 billion neurons, each linked to about 10,000
   others through synapses; a synapse is like a volume knob (excite or inhibit) and can be strengthened, which is where
   learning is thought to happen.
   Layout (stage px): left x 12..612: a field of 132 small grey dots (12 x 11 grid with a fixed jitter); right panel
   x 636..924: card "about 100 billion neurons" (y 12, h 150, the number counts up) and card "about 10,000 connections
   each" (purple, y 180, h 150). Synapse close-up (6.0, left): purple cell (130, 300), grey cell (500, 300), the link in two
   halves with a knob (r 34) on the gap at (320, 300), label "synapse" above, an "excite" / "inhibit" tag below, and a green
   card "strengthened" (y 430).
   Story (local seconds): 0.4..2.6 dots pop in, card 1 counts 0..100; 3.2 one dot grows into a purple neuron and twelve
   purple links fan out (3.4..4.6), card 2; 6.0 the field fades, the close-up appears (neutral knob, grey link); 6.6..7.2
   knob up: thick green link, "excite"; 7.4..8.0 knob down: thin red link, "inhibit"; 8.8..9.4 knob up again and stays, the
   "strengthened" card; hold to 12. */
VID.scene({
  kicker: "THE BRAIN'S DESIGN",
  title: ["Many neurons,", "adjustable links"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Your brain holds about 100 billion neurons."],
    [3.2, 5.8, "Each one links to around 10,000 others."],
    [6.0, 8.6, "A synapse can excite or inhibit, like a volume knob."],
    [8.8, 11.7, "Synapses can be strengthened: that is where learning lives."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp, lerp, ease: E } = V;
    const svg = V.l5.svg(stage, 936, 640);
    const T = (n) => L13.tone(n);
    const hash = (i) => {
      const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    // ---------- the field ----------
    const field = svg.appendChild(V.s("g", {}));
    const D = [];
    for (let r = 0; r < 11; r++)
      for (let c = 0; c < 12; c++) {
        const i = D.length;
        D.push({
          x: 50 + c * 47 + (hash(i) - 0.5) * 26,
          y: 44 + r * 54 + (hash(i + 500) - 0.5) * 26,
          at: hash(i + 900),
        });
      }
    const dots = D.map((d) => {
      const c = field.appendChild(V.s("circle", { cx: d.x.toFixed(1), cy: d.y.toFixed(1), r: 9, "stroke-width": 3 }));
      c.style.fill = T("grey").dim;
      c.style.stroke = T("grey").c;
      return c;
    });
    const C = D.reduce(
      (b, d, i) => (Math.hypot(d.x - 310, d.y - 320) < Math.hypot(D[b].x - 310, D[b].y - 320) ? i : b),
      0,
    );
    const far = D.map((d, i) => [i, Math.hypot(d.x - D[C].x, d.y - D[C].y)])
      .filter(([, r]) => r > 110 && r < 290)
      .sort(
        (a, b) =>
          Math.atan2(D[a[0]].y - D[C].y, D[a[0]].x - D[C].x) - Math.atan2(D[b[0]].y - D[C].y, D[b[0]].x - D[C].x),
      );
    const TO = Array.from({ length: 12 }, (_, k) => far[Math.floor((k * far.length) / 12)][0]);
    L16.same(TO.length, 12, "scene 3: twelve links");
    const links = TO.map(() => L16.wire(field));
    field.insertBefore(links[0].el, field.firstChild);
    links.slice(1).forEach((l) => field.insertBefore(l.el, field.firstChild));
    const hub = field.appendChild(V.s("circle", { cx: D[C].x.toFixed(1), cy: D[C].y.toFixed(1), "stroke-width": 4 }));

    const c1 = L16.card(stage, { x: 636, y: 12, w: 288, h: 150, text: "", tone: "grey", fs: 32 });
    const c2 = L16.card(stage, {
      x: 636,
      y: 180,
      w: 288,
      h: 150,
      text: "about 10,000\nconnections\neach",
      tone: "purple",
      fs: 32,
    });

    // ---------- the synapse close-up ----------
    const zoom = svg.appendChild(V.s("g", {}));
    const A = L16.node(zoom, { x: 130, y: 300, r: 62 });
    const B = L16.node(zoom, { x: 500, y: 300, r: 62 });
    const w1 = L16.wire(zoom),
      w2 = L16.wire(zoom);
    zoom.insertBefore(w1.el, zoom.firstChild);
    zoom.insertBefore(w2.el, zoom.firstChild);
    const knob = zoom.appendChild(V.s("g", {}));
    const kb = knob.appendChild(V.s("circle", { cx: 0, cy: 0, r: 36, "stroke-width": 5 }));
    kb.style.fill = "var(--panel)";
    kb.style.stroke = "var(--text-dim)";
    const ptr = knob.appendChild(V.s("path", { d: "M0 0 V-26", "stroke-width": 8, "stroke-linecap": "round" }));
    ptr.style.stroke = "var(--text-dim)";
    const synLab = L16.text(zoom, { x: 320, y: 236, text: "synapse", tone: "grey" });
    const tagEx = L13.tag(stage, { x: 266, y: 360, text: "excite", tone: "green", solid: true });
    const tagIn = L13.tag(stage, { x: 262, y: 360, text: "inhibit", tone: "red", solid: true });
    const learn = L16.card(stage, {
      x: 40,
      y: 440,
      w: 540,
      h: 130,
      text: "strengthened: this is where\nlearning is thought to happen",
      tone: "green",
      fs: 30,
    });

    const angle = (t) =>
      120 * ramp(t, 6.6, 7.2, E.inOut) - 240 * ramp(t, 7.4, 8.0, E.inOut) + 270 * ramp(t, 8.8, 9.4, E.inOut);

    return (t) => {
      const fo = 1 - ramp(t, 6.0, 6.4);
      field.setAttribute("opacity", fo.toFixed(3));
      dots.forEach((c, i) => {
        const k = ramp(t, 0.4 + 2.0 * D[i].at, 0.6 + 2.0 * D[i].at);
        c.setAttribute("opacity", k.toFixed(3));
        c.setAttribute("r", (9 * (0.5 + 0.5 * E.pop(k))).toFixed(1));
      });
      const g = ramp(t, 3.2, 3.6, E.pop);
      hub.setAttribute("r", (lerp(9, 30, g) || 0).toFixed(1));
      hub.style.fill = g > 0 ? T("purple").c : T("grey").dim;
      hub.style.stroke = g > 0 ? T("purple").lip : T("grey").c;
      hub.setAttribute("opacity", ramp(t, 0.4, 0.6).toFixed(3));
      links.forEach((l, k) =>
        l.set({
          a: [D[C].x, D[C].y],
          b: [D[TO[k]].x, D[TO[k]].y],
          tone: "purple",
          w: 4,
          k: ramp(t, 3.4 + 0.1 * k, 3.9 + 0.1 * k),
        }),
      );
      const n = Math.round(100 * ramp(t, 0.4, 2.6, E.lin));
      c1.set({ k: ramp(t, 0.4, 0.8), text: `about\n${n} billion\nneurons` });
      c2.set({ k: ramp(t, 3.6, 4.0) });

      const zk = ramp(t, 6.0, 6.5);
      zoom.setAttribute("opacity", zk.toFixed(3));
      A.set({ tone: "purple", k: zk });
      B.set({ tone: "grey", k: zk });
      const a = angle(t);
      const tone = a > 30 ? "green" : a < -30 ? "red" : "grey";
      const w = a >= 0 ? 8 + (10 * a) / 120 : 8 + (4 * a) / 120;
      w1.set({ a: [190, 300], b: [284, 300], tone, w, o: zk });
      w2.set({ a: [356, 300], b: [440, 300], tone, w, o: zk });
      knob.setAttribute("transform", `translate(320 300) rotate(${a.toFixed(1)})`);
      kb.style.stroke = tone === "grey" ? "var(--text-dim)" : T(tone).c;
      ptr.style.stroke = kb.style.stroke;
      synLab.set({ o: zk });
      tagEx.set({ k: a > 30 ? ramp(t, 6.9, 7.2) : 0 });
      tagIn.set({ k: a < -30 ? ramp(t, 7.7, 8.0) : 0 });
      learn.set({ k: ramp(t, 9.2, 9.6) });
    };
  },
});
