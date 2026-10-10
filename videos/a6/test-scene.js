(function () {
  const V = window.VID, A6 = V.a6, L5 = V.l5, { ramp, flash, ease: E } = V;
  // A: tiles, tags, icons
  V.scene({ kicker: "TEST A", title: ["bits tiles", "tags icons"], dur: 10, caps: [[0.4, 9, "Test caption for scene A, fairly long to see wrapping."]],
    build(stage) {
      const row = A6.bits(stage, { x: 90, y: 10, bits: "10110010", size: 84, gap: 12, tones: ["grey","grey","grey","grey","grey","grey","grey","orange"], labels: true });
      const small = A6.bits(stage, { x: 20, y: 150, bits: "1101001", size: 56, gap: 8 });
      const svg = L5.svg(stage);
      const bolt = svg.appendChild(A6.bolt(560, 190, 90, "orange"));
      const xor = svg.appendChild(A6.xorIcon(700, 190, 60, "purple"));
      const q = svg.appendChild(A6.qmark(800, 190, 80, "orange"));
      const tk = svg.appendChild(L5.tick(700, 290, 70, "green", { w: 10, ink: true }));
      const cr = svg.appendChild(L5.cross(800, 290, 70, "red", { w: 10, ink: true }));
      const tag = A6.tag(stage, { x: 30, y: 250, text: "check bit", tone: "orange", solid: true });
      const tag2 = A6.tag(stage, { x: 250, y: 250, text: "generator", tone: "purple" });
      const stat = A6.stat(stage, { x: 30, y: 330, label: "ones", tone: "blue" });
      const disc = A6.disc(stage, { x: 400, y: 370, size: 80, text: "6", tone: "orange" });
      const tok = A6.token(stage, { tone: "blue", size: 30 });
      const ba = L5.badge(stage, { x: 500, y: 340, w: 330, h: 68, valid: "looks fine", invalid: "alarm" });
      return (t) => {
        row.labels(ramp(t, 0.2, 0.8));
        row.all((i) => ({ ring: i === 2 ? "purple" : null, ringK: ramp(t, 1, 1.5), s: 1 }));
        row.flip(1, ramp(t, 2, 3), { from: "0", to: "1", tone: "grey", toTone: "red", solid: false, hop: 12 });
        small.all((i) => ({ tone: i % 2 ? "blue" : "green", solid: i === 3, ghost: i === 5 }));
        V.place(bolt, { s: 1 }); V.place(xor, {}); V.place(q, {}); L5.drawOn(q, 1);
        tag.set({}); tag2.set({ k: ramp(t, 0, 1) }); stat.set({ text: "4", bump: flash(t, 3, 3.5) }); disc.set({}); tok.set({ x: 500 + 100 * ramp(t, 0, 5), y: 450 });
        ba(t < 5 ? "valid" : "invalid", 1);
        L5.drawOn(tk, 1); L5.drawOn(cr, 1);
      };
    } });
  // B: division
  V.scene({ kicker: "TEST B", title: ["division", ""], dur: 10, caps: [],
    build(stage) {
      const d = A6.division(stage, { x: 80, y: 10, padFrom: 4 });
      return (t) => d.update({ p: t / 4, padK: ramp(t, 0, 1), remK: ramp(t, 8, 9) });
    } });
  // C: ham rig
  V.scene({ kicker: "TEST C", title: ["ham rig", ""], dur: 10, caps: [],
    build(stage) {
      const H = A6.hamRig(stage, {});
      const one = A6.HAM.one;
      return (t) => {
        const w = t < 3 ? A6.HAM.cw : one.recv;
        H.all((i) => ({ text: w[i], tone: [1, 2, 4].includes(i + 1) ? "orange" : "grey", ...(t >= 3 && i === 5 ? { tone: "red", solid: true } : {}), ...(t > 5 && [4,5,6,7].includes(i+1) ? {ring: "purple", ringK: 1} : {}) }));
        H.nums(ramp(t, 0, 1), { hot: t > 5 ? [4, 5, 6, 7] : [] });
        H.bin(ramp(t, 0.5, 1.5), { hot: t > 5 ? "p4" : null });
        one.checks.forEach((c, i) => {
          H.row(c.name, { k: ramp(t, 1 + i * 0.2, 1.6 + i * 0.2), vals: w, bad: t >= 3 ? [6] : [], tone: t > 5 && c.name === "p4" ? "purple" : "grey", verdict: t > 7 ? (c.fail ? "bad" : "ok") : null, vk: ramp(t, 7, 8) });
        });
        H.syn.set({ vals: [1, 1, 0], k: ramp(t, 8, 9), eqK: ramp(t, 8.5, 9), num: "6", numK: ramp(t, 8.8, 9.2) });
      };
    } });
  // D: cube
  V.scene({ kicker: "TEST D", title: ["cube", ""], dur: 10, caps: [],
    build(stage) {
      const c = A6.cube(stage, { x: 20, y: 30 });
      const tok = A6.token(stage, { tone: "blue", size: 30 });
      return (t) => {
        c.update({ nodes: { "000": { tone: "green", solid: true }, "111": { tone: "green", solid: true }, "010": { tone: "red", ring: "red", ringK: ramp(t, 1, 2) } },
          edges: { "000-010": { tone: "orange", k: ramp(t, 1, 3) }, "010-011": { tone: "orange", k: ramp(t, 3, 4) }, "011-111": { tone: "orange", dash: true } } });
        const p = c.pt("010"); tok.set({ x: p.x, y: p.y - 50 });
      };
    } });
})();
