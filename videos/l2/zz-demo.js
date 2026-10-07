(function () {
  const V = window.VID, L2 = V.l2, L5 = V.l5;
  V.scene({ kicker: "DEMO", title: ["Bars and strip", "clock star tags"], dur: 6, build(stage) {
    const all = L2.POP.concat(L2.KIDS);
    const strip = L2.loopStrip(stage, { x: 48, y: 0 });
    const pop = L2.bars(stage, { items: all });
    const clock = L2.clock(stage, { x: 100, y: 200, r: 64 });
    const t1 = L2.tag(stage, { kids: [L2.sup("1.1", "n"), " = 6.7"], tone: "red", x: 468, y: 126, anchor: "c" });
    const t2 = L2.tag(stage, { text: "best kept", tone: "green", solid: true, x: 468, y: 168, anchor: "c", size: 34 });
    const svg = L5.svg(stage); svg.append(L2.star(250, 215, 56));
    const sci = L2.tag(stage, { kids: [L2.sci("1.9", 25), " designs"], tone: "red", solid: true, x: 600, y: 215, anchor: "c" });
    return (t) => {
      strip.update({ k: V.ramp(t, 0, 1), active: 2, pulse: V.flash(t, 2, 3), loop: V.ramp(t, 3, 4) });
      all.forEach((q, i) => {
        const kid = i >= 10;
        pop.set(q.id, { grow: V.ramp(t, 0.2 + i * 0.1, 1.2 + i * 0.1), tone: kid ? "purple" : i === 4 ? "orange" : "grey", solid: kid || i === 4, dy: i === 4 ? -20 : 0, ring: i === 4 ? 1 : 0, dash: i === 3, s: i === 8 ? 1.15 : 1, nameTone: i === 4 ? "orange" : undefined });
      });
      clock.update({ angle: 720 * t });
      t1.set({ s: V.ramp(t, 0, 1, V.ease.pop) }); t2.set({}); sci.set({});
    };
  } });
  V.scene({ kicker: "DEMO", title: ["Graph", "and cost"], dur: 6, build(stage) {
    const g = L2.graph(stage, { x: 0, y: 24 });
    const cc = L2.costCard(stage, { x: 680, y: 130, w: 244, h: 150 });
    const p = L2.prim(2);
    return (t) => {
      const nodes = {}, edges = {};
      p.tree.forEach((k) => (edges[k] = { tone: "green" }));
      edges.AB = { blocked: V.ramp(t, 1, 2), dim: 0.5 };
      edges.CE = { tone: "orange", dash: true, pill: "orange" };
      edges.DE = { blocked: 1 };
      edges.BE = { tone: "green", k: V.ramp(t, 2, 3), from: "E", pulse: V.flash(t, 3, 4) };
      "ABCDE".split("").forEach((c) => (nodes[c] = { tone: "green", deg: p.deg[c] + (c === "C" ? 1 : 0), limit: 2, ring: c === "A" ? 1 : 0, flash: c === "C" ? V.flash(t, 2, 4) : 0, pulse: 0 }));
      nodes.B = { deg: 1, limit: 2, ring: 1, ringTone: "orange" };
      g.update({ k: V.ramp(t, 0, 1.5, V.ease.lin), nodes, edges });
      cc.update({ value: 20, tone: t > 3 ? "red" : "grey", bump: V.flash(t, 3, 4) });
    };
  } });
  V.scene({ kicker: "DEMO", title: ["Tour", "panels"], dur: 6, build(stage) {
    const r = L2.tspRace(16);
    const a = L2.tourPanel(stage, { x: 12, y: 0, cities: r.cities, tag: "Nearest neighbour", tone: "orange" });
    const b = L2.tourPanel(stage, { x: 484, y: 0, cities: r.cities, tag: "Evolutionary algorithm", tone: "green" });
    window.__fits = [a.fits, b.fits];
    return (t) => {
      a.update({ tour: r.nn, draw: V.ramp(t, 0.5, 3, V.ease.lin), dots: V.ramp(t, 0, 0.6, V.ease.lin), len: r.nnLen, flash: V.flash(t, 4, 5) });
      b.update({ tour: r.tourAt(2000), draw: 1, dots: V.ramp(t, 0, 0.6, V.ease.lin), len: r.bestAt(2000), lenTone: "green" });
    };
  } });
})();
