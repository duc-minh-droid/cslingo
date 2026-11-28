/* Lecture 18 video, scene 05-events: lesson 18.1's event demo (L18.NIGHT, seed 7, 24 moments). A playhead sweeps the night:
   purple spikes where something moved; the clocked chip (orange) works at every moment, the event-driven chip (green) only
   where a spike arrived. Activity 10 %: spikes at moments 5 8 9 23 (4 of 24); 50 %: 11; 0 %: none.
   Layout (stage px): row labels x 12..196; 24 cells across x 210..918 (pitch 29.5): spike row baseline y 100, clocked cells
   y 130..174, event cells y 206..250, moment labels '1' / '24' at y 258; activity slider y 330 (label, track x 210..918, knob,
   value, the label "activity" above the value); a doorbell at x 66, y 376 rings with each spike under the playhead; three stat tiles at y 420..570.
   Story (local seconds): 0.4 rows and tiles; sweep 0.6..3.1 at 10 %; 6.0 the slider glides to 50 %, rows clear, sweep
   6.6..8.2; 8.8 the slider drops to 0 %, sweep 9.3..11.0 with no spikes, a 'silent' tag by the bell at 11.0; hold to 13. */
VID.scene({
  kicker: "ONLY WAKE WHEN SOMETHING HAPPENS",
  title: ["Clocked chip against", "event-driven chip"],
  dur: 13,
  caps: [
    [0.4, 3.0, "A quiet night: a spike at only 4 of 24 moments."],
    [3.2, 5.8, "The clocked chip works 24 times; the event-driven chip 4."],
    [6.0, 8.6, "A busier garden: 11 spikes, 11 bursts of work."],
    [8.8, 12.7, "No spikes, no work: it computes only when a spike arrives."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp, lerp } = V;
    const N = L18.TICKS;
    const PH = [
      { at: 0.4, a: 0.6, b: 3.1, act: 10 },
      { at: 6.0, a: 6.6, b: 8.2, act: 50 },
      { at: 8.8, a: 9.3, b: 11.0, act: 0 },
    ].map((p) => ({ ...p, night: L18.NIGHT(p.act) }));
    L18.same(
      PH.map((p) => p.night.n),
      [4, 11, 0],
      "scene 5: spikes per night",
    );
    const X = (i) => 210 + i * 29.5;
    const svg = V.l5.svg(stage, 936, 640);
    const spikes = [],
      clk = [],
      evt = [];
    for (let i = 0; i < N; i++) {
      spikes.push(L18.spike(svg, X(i) + 12, 100, 60));
      clk.push(L18.rect(svg, { x: X(i), y: 130, w: 24, h: 44, rx: 6, sw: 3 }));
      evt.push(L18.rect(svg, { x: X(i), y: 206, w: 24, h: 44, rx: 6, sw: 3 }));
    }
    const head = L18.line(svg, [0, 24], [0, 256], "blue", 5);
    const labs = [
      ["spikes", 52, "purple"],
      ["clocked", 134, "orange"],
      ["event-driven", 210, "green"],
    ].map(([text, y, tone]) => L13.label(stage, { x: 12, y, w: 190, text, tone, align: "left", bold: true }));
    const m1 = L13.label(stage, { x: X(0) - 20, y: 258, w: 64, text: "1" });
    const m24 = L13.label(stage, { x: X(23) - 20, y: 258, w: 64, text: "24" });
    // slider
    const track = L18.rect(svg, { x: 210, y: 352, w: 560, h: 16, rx: 8, tone: "grey", fill: "dim", sw: 3 });
    const knob = L18.circ(svg, 210, 360, 20, "purple");
    const actL = L13.label(stage, { x: 790, y: 300, w: 134, text: "activity", align: "left" });
    const actV = L13.label(stage, { x: 790, y: 340, w: 134, text: "10%", tone: "purple", align: "left", bold: true });
    const bell = L18.bell(svg, 66, 376, 0.9, "purple");
    const silent = L13.tag(stage, { x: 12, y: 280, text: "silent", tone: "grey" });
    // tiles
    const tiles = [
      ["Moments with a spike", "purple"],
      ["Clocked chip works", "orange"],
      ["Event-driven chip works", "green"],
    ].map(([label, tone], i) => L18.tile(stage, { x: 12 + 308 * i, y: 420, w: 296, h: 150, label, tone }));

    return (t) => {
      const k0 = ramp(t, 0.3, 0.7);
      const pi = PH.reduce((a, p, i) => (t >= p.at ? i : a), 0);
      const P = PH[pi];
      const u = N * ramp(t, P.a, P.b, V.ease.lin);
      const on = P.night.on;
      for (let i = 0; i < N; i++) {
        const past = u > i + 0.5;
        L18.op(spikes[i], on[i] ? ramp(u, i + 0.5, i + 0.9) : 0);
        L18.paint(clk[i], past ? "orange" : "grey", past ? "c" : "dim");
        L18.paint(evt[i], past && on[i] ? "green" : "grey", past && on[i] ? "c" : "dim");
        L18.op(clk[i], k0);
        L18.op(evt[i], k0);
      }
      const hx = X(Math.min(u, N - 0.01)) - 3;
      head.setAttribute("x1", hx.toFixed(1));
      head.setAttribute("x2", hx.toFixed(1));
      L18.op(head, t >= P.a && t < P.b + 0.3 ? 1 : 0);
      labs.forEach((l) => l.set({ k: k0 }));
      m1.set({ k: k0 });
      m24.set({ k: k0 });
      // slider value glides between nights
      const prev = PH[Math.max(0, pi - 1)].act;
      const act = pi === 0 ? P.act : lerp(prev, P.act, ramp(t, P.at, P.at + 0.6, V.ease.inOut));
      L18.op(track, k0);
      L18.op(knob, k0);
      knob.setAttribute("cx", (210 + 5.6 * act).toFixed(1));
      actL.set({ k: k0 });
      actV.set({ k: k0, text: `${Math.round(act)}%` });
      const ring = on.some((s, i) => s && u > i + 0.5 && u < i + 1.5);
      V.place(bell, { s: ring ? 1.15 : 1, o: k0 });
      L18.paint(bell.firstChild, ring ? "purple" : "grey", "dim");
      L18.paint(bell.lastChild, ring ? "purple" : "grey", "c");
      silent.set({ k: ramp(t, 11.0, 11.4) });
      const seen = Math.floor(Math.min(u + 0.5, N));
      const ev = on.slice(0, seen).filter(Boolean).length;
      const passed = u > 0 ? Math.min(N, Math.floor(u + 0.5)) : 0;
      tiles[0].set({ k: ramp(t, 0.4, 0.8), text: `${ev} of ${N}` });
      tiles[1].set({ k: ramp(t, 0.5, 0.9), text: `${passed} times` });
      tiles[2].set({ k: ramp(t, 0.6, 1.0), text: `${ev} times` });
    };
  },
});
