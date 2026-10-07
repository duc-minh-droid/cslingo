(function () {
  const V = window.VID, L1 = V.l1, L5 = V.l5, E = V.ease;
  L1.verify();
  V.scene({ kicker: "DEMO", title: ["Landscape", "and dots"], dur: 12, caps: [[0, 12, "Landscape test"]],
    build(stage) {
      const ls = L1.landscape(stage, { base: 280, peak: 50 });
      const run = L1.popRun(16, 20, 16);
      const dots = run[0].pop.map(() => ls.dot());
      const olds = run[0].pop.map(() => ls.dot());
      const cl = L1.climber(23, 16);
      const cd = ls.dot({ tone: "purple" });
      const ring = ls.dot({ hollow: true, tone: "red", r: 10 });
      const bar = L1.ingredientBar(stage, { y: 588 });
      const wf = L1.waffle(stage, { flags: L1.test200(20, 1), x: 30, y: 330 });
      const wf1 = L1.waffle(stage, { flags: L1.test200(1, 1), x: 500, y: 330 });
      const chip = L1.chip(stage, "1 climber", "blue", { x: 0, y: 0 });
      return (t) => {
        ls.set({ k: V.ramp(t, 0.3, 1.3), star: V.ramp(t, 1, 1.6, E.lin), starPulse: V.flash(t, 4.3, 5) });
        const g = Math.min(15, Math.floor(Math.max(0, t - 5.8) / 0.27));
        const u = ((t - 5.8) / 0.27) % 1;
        cd.set({ i: cl[Math.min(16, Math.max(0, Math.floor((t - 1.8) / 0.2)))].x ?? cl[0].start, o: t > 1.5 && t < 5 ? 1 : 0 });
        ring.set({ i: 100, o: t > 2 ? 1 : 0, ring: (t % 1) });
        if (t < 5.8) { dots.forEach((d, i) => d.set({ i: run[0].pop[i], o: t > 5.2 ? 1 : 0 })); olds.forEach((d) => d.set({ o: 0 })); }
        else {
          const gg = t > 5.8 + 16 * 0.27 ? 15 : g, uu = t > 5.8 + 16 * 0.27 ? 1 : u;
          const sp = L1.sprout(run[gg].pop, run[gg + 1].pop, run[gg + 1].info.map((c) => c.p1), uu);
          dots.forEach((d, i) => d.set({ i: sp.kids[i].i, o: 1 }));
          olds.forEach((d, i) => d.set({ i: sp.olds[i].i, o: sp.olds[i].o, tone: "grey" }));
        }
        bar(["done", "active", t > 8 ? "active" : "off"], V.ramp(t, 0.5, 1.3));
        wf(V.ramp(t, 9, 10)); wf1(V.ramp(t, 10, 11));
        V.show(chip, 1);
      };
    } });
  V.scene({ kicker: "DEMO", title: ["Letters", "and counters"], dur: 6, caps: [[0, 6, "Letters"]],
    build(stage) {
      const k = L1.weasel.keeper(17), m = L1.weasel.monkey(117, 3037);
      const g1 = L1.letterGrid(stage, { text: L1.weasel.TARGET, x: 20, y: 0 });
      const g2 = L1.letterGrid(stage, { text: L1.weasel.TARGET, x: 20, y: 160 });
      const pips = L1.pips(stage, { x: 20, y: 330 });
      const dg = L1.digits(stage, { n: 41, x: 20, y: 380 });
      const dg2 = L1.digits(stage, { n: 4, tone: "green", x: 20, y: 420 });
      const c1 = L1.chip(stage, "tries 3,037", "grey", { x: 600, y: 330 });
      const c2 = L1.chip(stage, "1.2 x 10<sup>40</sup>", "red", { x: 600, y: 380, solid: true, html: "1.2 x 10<sup>40</sup>" });
      const gg = L1.gauge(stage, { x: 20, y: 470, w: 160 });
      const gg2 = L1.gauge(stage, { x: 220, y: 470, w: 160, on: true });
      const bk = V.h("div", { class: "v-card c-orange", style: { left: "210px", top: "460px", width: "200px", height: "110px" } }); stage.append(bk); stage.append(gg2.el);
      const evo = L1.miniEvo(stage, { x: 580, y: 440, t0: 1 });
      return (t) => {
        const n = Math.round(3037 * V.ramp(t, 0.3, 4, E.lin)) + 1;
        const s = k.stateAt(n);
        g1.all((i) => ({ tone: L1.weasel.TARGET[i] === s[i] ? "green" : "grey", solid: L1.weasel.TARGET[i] === s[i] }));
        const ms = m.string(Math.min(3037, n));
        g2.all((i) => ({ solid: L1.weasel.TARGET[i] === ms[i], tone: L1.weasel.TARGET[i] === ms[i] ? "green" : "grey", text: ms[i] }));
        pips([t > 1, t > 2, V.ramp(t, 3, 3.3)], V.ramp(t, 0, 0.5)); dg(V.ramp(t, 0.5, 2)); dg2(V.ramp(t, 2, 3));
        gg.set(V.ramp(t, 0.5, 2)); gg2.set(V.ramp(t, 0.5, 2));
        evo(t); 
      };
    } });
  V.scene({ kicker: "DEMO", title: ["Pictograms"], dur: 12, caps: [[0, 12, "Pictograms"]],
    build(stage) {
      const rows = [];
      [[L1.miniEvo, 1], [L1.miniBrain, 4], [L1.miniAnts, 6.8]].forEach(([fn, t0], i) => {
        const card = V.h("div", { class: "v-card plain c-grey", style: { left: "0", top: `${i * 204}px`, width: "936px", height: "184px" } });
        stage.append(card);
        rows.push(fn(stage, { x: 20, y: i * 204 + 17, t0 }));
      });
      const ps = ["planning", "design", "simulation", "identification", "control", "classification"].map((k, i) => {
        const e = L1.picto(k, 140, { x: 380 + (i % 3) * 180, y: 10 + Math.floor(i / 3) * 190 }); stage.append(e); return e;
      });
      return (t) => rows.forEach((r) => r(t));
    } });
})();
