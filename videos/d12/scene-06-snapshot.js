/* Lecture 12 (ds-12) · scene 6 (SNAPSHOTS): a snapshot saves a VM's state at one moment; restoring it undoes every later change;
   a snapshot can be copied or moved to another host (lesson 12.2).
   Story (local seconds): a grey timeline; dots pop left to right: 0.5 blue "VM running" (with a blue server icon), 1.6 purple
   "Snapshot taken" (a purple camera pops and flashes), 3.4 orange "Update installed", 5.0 red "Forecaster breaks" (the green
   forecast.py card turns red and a red cross draws). 6.8 a green arc sweeps back from the break to the snapshot, tag "roll back:
   later changes are undone"; 7.4 the update and break dots and labels turn grey and the card fades; 8.2 a green "Restored" dot
   with a tick. 9.0 a purple "snapshot" chip slides from the camera onto a grey "Another host" box ("copy or migrate"). */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const LY = 290;
  const DOTS = [
    { x: 90, at: 0.5, tone: "blue", text: "VM running", up: true },
    { x: 280, at: 1.6, tone: "purple", text: "Snapshot taken", up: false },
    { x: 470, at: 3.4, tone: "orange", text: "Update installed", up: true },
    { x: 660, at: 5.0, tone: "red", text: "Forecaster breaks", up: false },
    { x: 850, at: 8.2, tone: "green", text: "Restored", up: true },
  ];
  const T = { back: 6.8, grey: 7.4, copy: 9.0 };

  V.scene({
    kicker: "SNAPSHOTS",
    title: ["An undo button", "for a whole machine"],
    dur: 11,
    caps: [
      [0.4, 3.2, "A snapshot saves the VM's state at one exact moment."],
      [3.4, 6.6, "Then an update is installed, and the forecaster breaks."],
      [6.8, 8.8, "Restore the snapshot: every later change is undone."],
      [9.0, 10.7, "Snapshots can also be copied to another host."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const line = svg.appendChild(
        V.s("line", {
          x1: 40,
          y1: LY,
          x2: 900,
          y2: LY,
          stroke: D12.tone("grey").c,
          "stroke-width": 8,
          "stroke-linecap": "round",
        }),
      );
      const server = svg.appendChild(D4.server(90, 420, 80, "blue"));
      const camera = svg.appendChild(D4.camera(280, 440, 84, "purple"));
      const arc = svg.appendChild(L5.arrow(660, LY - 26, 290, LY - 26, "green", 1, { bow: -120, w: 7 }));
      const card = D12.box(stage, { x: 540, y: 412, w: 240, h: 60, text: "forecast.py", tone: "green" });
      const host = D12.box(stage, { x: 560, y: 540, w: 360, h: 88, text: "Another host", sub: "copy or migrate" });
      const top = D4.svg(stage);
      const cross = top.appendChild(L5.cross(814, 442, 46, "red"));
      const tick = top.appendChild(L5.tick(850, 360, 52, "green"));
      const dots = DOTS.map((d) => D4.disc(stage, { x: d.x, y: LY, size: 46, text: "", tone: d.tone }));
      const labels = DOTS.map((d) => D4.label(stage, { x: d.x, y: d.up ? LY - 52 : LY + 52, text: d.text, fs: 30 }));
      const back = D4.tag(stage, {
        x: 475,
        y: 120,
        text: "roll back: later changes are undone",
        tone: "green",
        solid: true,
      });
      const chip = D4.packet(stage, { text: "snapshot", tone: "purple" });

      return (t) => {
        V.show(line, ramp(t, 0.1, 0.4, E.lin));
        const greyK = t >= T.grey;
        DOTS.forEach((d, i) => {
          const faded = greyK && (i === 2 || i === 3);
          dots[i].set({
            k: ramp(t, d.at, d.at + 0.4, E.lin),
            tone: faded ? "grey" : d.tone,
            s: 1 + 0.25 * flash(t, d.at + 0.3, d.at + 0.7),
          });
          labels[i].set({ k: ramp(t, d.at + 0.1, d.at + 0.5), tone: faded ? "grey" : d.tone });
        });
        V.place(server, { s: E.pop(ramp(t, 0.6, 1.0, E.lin)), o: t >= 0.6 ? 1 : 0 });
        V.place(camera, {
          s: E.pop(ramp(t, 1.7, 2.1, E.lin)) * (1 + 0.2 * flash(t, 2.1, 2.5)),
          o: t >= 1.7 ? 1 : 0,
        });
        const breaks = t >= 5.0;
        const cardOut = 1 - ramp(t, T.grey, T.grey + 0.5, E.lin);
        card.set({ k: ramp(t, 3.6, 4.0, E.lin), tone: breaks ? "red" : "green", o: cardOut });
        L5.drawOn(cross, ramp(t, 5.1, 5.5));
        V.show(cross, cardOut);
        L5.drawOn(arc, ramp(t, T.back, T.back + 0.7, E.inOut));
        back.set({ k: ramp(t, T.back + 0.4, T.back + 0.8, E.lin) });
        L5.drawOn(tick, ramp(t, 8.5, 8.9));
        host.set({ k: ramp(t, T.copy, T.copy + 0.4, E.lin) });
        const kc = ramp(t, T.copy + 0.3, T.copy + 1.2, E.inOut);
        const p = D4.at({ x: 280, y: 440 }, { x: 740, y: 498 }, kc, -40);
        chip.set({ k: t >= T.copy + 0.3 ? 1 : 0, x: p.x, y: p.y });
      };
    },
  });
})();
