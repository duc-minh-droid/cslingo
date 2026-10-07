(function () {
  const V = window.VID, L3 = V.l3, L5 = V.l5, E = V.ease;
  // scene 1: landscape + markers
  V.scene({ kicker: "DEMO", title: ["land", "markers"], dur: 10, build(stage) {
    const P = L3.land(stage, { x: 0, y: 10, w: 936, h: 450, kind: "multi" });
    const tl = P.tag("taller = fitter");
    const tr = P.tag("right tag", { at: "tr", tone: "blue" });
    const tok = P.marker("token"); const star = P.marker("star"); const dia = P.marker("diamond");
    const gh = P.marker("ghost"); const cr = P.marker("crumb"); const bd = P.marker("badge");
    const bd2 = P.marker("badge"); const bd3 = P.marker("badge");
    const t2 = P.marker("token", { tone: "grey" }); const t3 = P.marker("token", { size: 24 });
    const arc = V.s("path", { d: P.arc(7, 29, 80), fill: "none", "stroke-width": "6", "stroke-dasharray": "2 14", "stroke-linecap": "round", style: { stroke: "var(--violet)" } });
    P.over.append(arc);
    return (t) => {
      P.update({ curve: V.ramp(t, 3, 4), fill: V.ramp(t, 3, 4), bars: t < 3 ? (i) => V.ramp(t, 0.3 + 0.05 * i, 0.65 + 0.05 * i) : 0, o: 1 });
      const h = L3.hop(4, 7, V.ramp(t, 4.5, 5.5, E.lin), 30);
      tok.set({ i: h.i, dy: h.dy, ring: t > 6 ? "orange" : null, ringK: V.ramp(t, 6, 6.4) });
      star.set({ i: 29, s: E.pop(V.ramp(t, 5, 5.5)), o: t > 5 ? 1 : 0 });
      dia.set({ i: 29, o: t > 5 ? 1 : 0 });
      gh.set({ i: 12, o: 1 }); cr.set({ i: 14 }); bd.set({ i: 7, icon: "cross", k: V.ramp(t, 6, 7), dy: -20 });
      bd2.set({ i: 18, icon: "down", k: 1 }); bd3.set({ i: 22, icon: "tick", k: 1 });
      t2.set({ i: 3 }); t3.set({ i: 20, ring: "red" });
      tl.set({ s: 1 }); tr.set({});
    };
  } });
  // scene 2: map + matrix + chips + tags
  V.scene({ kicker: "DEMO", title: ["map", "matrix"], dur: 10, build(stage) {
    const m = L3.map(stage, { x: 30, y: 30 });
    const mx = L3.matrix(stage, { x: 596, y: 30 });
    const row = L5.chromosome(stage, { x: 40, y: 470, genes: "ABDEC", size: 80, gap: 10, tone: "blue" });
    const chips = [["Population", "blue"], ["Fitness", "green"], ["Selection", "orange"], ["Mutation", "purple"]].map(([t, c], i) => L3.chip(stage, { x: 440 + (i % 2) * 280, y: 420 + Math.floor(i / 2) * 70, text: t, tone: c }));
    const sk = L3.sticker(stage, { x: 560, y: 560, text: "worse: throw it away", tone: "red", icon: "cross" });
    const tg = L3.tag(stage, { x: 560, y: 380, text: "length 32", tone: "blue", solid: true });
    const sy = L5.svg(stage);
    const star = L3.star(900, 600, 40); const dia = L3.diamond(850, 600, 30); sy.append(star, dia);
    return (t) => {
      m.update({ order: "ABDEC", draw: V.ramp(t, 0.5, 4, E.lin), tone: "blue", weights: 1, pillAt: { AC: 0.72, BD: 0.3 }, order2: t > 5 ? "ABCED" : undefined, mix: V.ramp(t, 5, 7, E.lin), tone2: "green" });
      mx.update({ lit: [["A", "B"], ["B", "D"], ["D", "E"], ["E", "C"], ["C", "A"]].slice(0, Math.floor(V.ramp(t, 0.5, 4, E.lin) * 5)), k: V.ramp(t, 0, 1) });
      row.all(() => ({}));
      chips.forEach((c, i) => c.set({ state: t < 2 + i ? "grey" : t < 3 + i ? "active" : "done", pop: V.ramp(t, i * 0.2, i * 0.2 + 0.4) }));
      sk.set({ k: V.ramp(t, 2, 3) });
      tg.set({ s: 1 });
    };
  } });
})();
