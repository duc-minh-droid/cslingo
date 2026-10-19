(function () {
  const V = VID, D4 = V.d4, L5 = V.l5;
  V.scene({
    kicker: "TEST", title: ["Helper test", "rig and tags"], dur: 4,
    caps: [[0.4, 3.5, "A test caption for the helpers."]],
    build(stage) {
      const rig = D4.cluster(stage, { h: 190, layout: "slots" });
      const chips = D4.chips(stage, { ...rig.L.slot({ n: 3, w: 66, h: 48, gap: 8 }), texts: (i) => "#" + (i + 1), tone: "purple", fs: 28 });
      const svg = D4.svg(stage);
      const crown = svg.appendChild(D4.crown(500, 300, 60));
      const pk = D4.packet(stage, { text: "pic 1", tone: "blue" });
      const tg = D4.tag(stage, { x: 790, y: 330, text: "the log", tone: "purple" });
      const bar = D4.bar(stage, { x: 20, y: 560, w: 300, tone: "orange" });
      const dsc = D4.disc(stage, { x: 60, y: 460, size: 52, text: "A", tone: "green" });
      return (t) => {
        rig.L.set({ name: "Leader", tone: "blue", crown: 1 });
        rig.A.set({ name: "Follower A", tone: "green" });
        rig.B.set({ name: "Follower B", tone: "orange", down: t > 2 ? 1 : 0 });
        rig.client.set({ name: "Client" });
        rig.wires.cl.set({ tone: "blue", k: 1, cut: t > 2 ? 1 : 0 });
        rig.wires.ca.set({});
        rig.wires.cb.set({});
        rig.wires.logA.set({ tone: "purple" });
        rig.wires.logB.set({ tone: "purple", k: Math.min(1, t) });
        chips.all((i) => ({ solid: i === 0 }));
        pk.set({ ...rig.wires.cl.at(Math.min(1, t / 2)) });
        tg.set({});
        bar.set({ k: Math.min(1, t / 3) });
        dsc.set({});
        V.place(crown, { o: 1 });
      };
    },
  });
})();
