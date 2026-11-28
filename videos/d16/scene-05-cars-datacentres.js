/* Lecture 16 (ds-16) · scene 5 (BEYOND AI): specialised chips in cars and data centres (lesson 16.2).
   Story (local seconds): 0.3 top half: Cameras (and radar) -> ADAS chip (green, specialised) -> Brake (in milliseconds), the
   arrows draw, 1.8 grey tags 'lane keeping', 'emergency braking', 'parking help'; 3.6 bottom half: a blue 'Server CPU' frame
   holding three grey jobs Networking, Storage, Security, and a green 'DPU / IPU' frame with the names NVIDIA BlueField,
   AMD Pensando, Intel IPU; 7.6 the three jobs fly one by one (stagger 0.4) from the CPU into the DPU; 9.4 the CPU frame shows
   'customer apps'. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, ease: E } = V;

  const T = { flow: 0.3, uses: 1.8, dc: 3.6, names: 4.4, move: 7.6, apps: 9.4 };
  const XS = [150, 468, 786];
  const JOBS = ["Networking", "Storage", "Security"];
  const FROM = JOBS.map((_, i) => ({ x: 192, y: 350 + 72 * i }));
  const TO = JOBS.map((_, i) => ({ x: 684, y: 446 + 64 * i }));

  V.scene({
    kicker: "BEYOND AI",
    title: ["New chips in cars", "and data centres"],
    dur: 12,
    caps: [
      [0.4, 3.4, "Cars: ADAS chips see the road and brake in milliseconds."],
      [3.6, 7.4, "Data centres: DPUs and IPUs sit beside the CPU."],
      [7.6, 11.6, "They take networking, storage and security off its hands."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const frame = (x, w, tone) => {
        const el = V.h("div", {
          class: `v-card c-${tone}`,
          style: { left: `${x}px`, top: "236px", width: `${w}px`, height: "386px" },
        });
        stage.append(el);
        return el;
      };
      const cpuF = frame(12, 360, "blue");
      const dpuF = frame(444, 480, "green");
      const cpuT = D4.label(stage, { x: 192, y: 274, text: "Server CPU", tone: "blue", fs: 32 });
      const dpuT = D4.label(stage, { x: 684, y: 274, text: "DPU / IPU", tone: "green", fs: 32 });
      const names = ["NVIDIA BlueField", "AMD Pensando", "Intel IPU"].map((text, i) =>
        D4.label(stage, { x: 684, y: 318 + 38 * i, text, fs: 28 }),
      );
      const flow = [
        { title: "Cameras", sub: "and radar", icon: "camera", iconTone: "grey" },
        { title: "ADAS chip", sub: "specialised", icon: "chip", tone: "green" },
        { title: "Brake", sub: "in milliseconds" },
      ].map((o, i) => D16.box(stage, { x: XS[i], y: 76, w: 270, h: 112, row: true, iconSize: 54, ...o }));
      const arr = [0, 1].map((i) => D16.arrow(svg, [XS[i] + 140, 76], [XS[i + 1] - 140, 76], { w: 6, head: 18 }));
      const uses = ["lane keeping", "emergency braking", "parking help"].map((text, i) =>
        D4.tag(stage, { x: XS[i], y: 176, text }),
      );
      const jobs = JOBS.map((text) => D4.tag(stage, { text, tone: "grey", solid: true, fs: 30 }));
      const apps = D4.tag(stage, { x: 192, y: 422, text: "customer apps", tone: "blue", solid: true, fs: 30 });

      return (t) => {
        flow.forEach((b, i) => b.set({ k: D16.seq(t, T.flow, 0.4, 0.5, i) }));
        arr.forEach((a, i) => a.set({ k: D16.seq(t, T.flow + 0.5, 0.4, 0.4, i) }));
        uses.forEach((u, i) => u.set({ k: D16.seq(t, T.uses, 0.25, 0.3, i) }));

        const kd = ramp(t, T.dc, T.dc + 0.5);
        V.place(cpuF, { s: 0.9 + 0.1 * E.pop(kd), o: kd });
        const kd2 = ramp(t, T.dc + 0.3, T.dc + 0.8);
        V.place(dpuF, { s: 0.9 + 0.1 * E.pop(kd2), o: kd2 });
        cpuT.set({ k: kd });
        dpuT.set({ k: kd2 });
        names.forEach((n, i) => n.set({ k: D16.seq(t, T.names, 0.3, 0.4, i) }));
        jobs.forEach((j, i) => {
          const km = E.inOut(D16.seq(t, T.move, 0.4, 0.8, i));
          const p = D4.at(FROM[i], TO[i], km, 50);
          j.set({
            x: p.x,
            y: p.y,
            k: D16.seq(t, T.dc + 0.5, 0.2, 0.4, i),
            tone: km >= 1 ? "green" : "grey",
            s: 1 + 0.1 * flash(km, 0.9, 1) + 0.12 * flash(t, T.move + 0.4 * i + 0.8, T.move + 0.4 * i + 1.1),
          });
        });
        apps.set({ k: ramp(t, T.apps, T.apps + 0.5) });
      };
    },
  });
})();
