/* Lecture 12 (ds-12) · scene 4 (VIRTUAL MACHINES): host and guests, and the hypervisor that shares out the hardware (lesson
   12.2). Story (local seconds): 0.5 grey "Hardware (CPU, memory, disk)", 1.1 blue "Host operating system", the label "host";
   2.4 two guest columns rise on the host (blue Guest OS, orange Libraries, green App 1 / App 2), each in a dashed blue outline
   labelled "VM 1 (guest)" / "VM 2 (guest)"; 5.6 the purple "Hypervisor" slides in between the host OS and the guests, which
   move up; 6.4 three purple chips (CPU, memory, disk) rise out of it into each guest; 9.2 three purple name tags at the top:
   VMware Workstation, VirtualBox, Hyper-V. */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const { ramp, lerp, ease: E } = V;

  const X = 120;
  const W = 804;
  const COLS = [120, 532];
  const CW = 392;
  const LIFT = 120; // how far the guests sit lower before the hypervisor arrives
  const T = { hw: 0.5, os: 1.1, guests: 2.4, hyp: 5.6, chips: 6.4, names: 9.2 };
  const GUEST = [
    ["Guest OS", "blue", 314],
    ["Libraries", "orange", 246],
    ["App", "green", 178],
  ];
  const CHIPS = ["CPU", "memory", "disk"];
  const NAMES = ["VMware Workstation", "VirtualBox", "Hyper-V"];

  V.scene({
    kicker: "VIRTUAL MACHINES",
    title: ["A computer inside a computer,", "run by a hypervisor"],
    dur: 13,
    caps: [
      [0.4, 2.2, "The real computer is the host."],
      [2.4, 5.4, "Each virtual machine is a guest with its own OS."],
      [5.6, 9.0, "The hypervisor shares the host's CPU, memory and disk between them."],
      [9.2, 12.7, "For example VMware Workstation, VirtualBox and Hyper-V."],
    ],
    build(stage) {
      const hw = D12.box(stage, { x: X, y: 570, w: W, h: 58, text: "Hardware (CPU, memory, disk)" });
      const os = D12.box(stage, { x: X, y: 502, w: W, h: 58, text: "Host operating system", tone: "blue" });
      const host = D4.label(stage, { x: 62, y: 565, text: "host", fs: 32 });
      const hyp = D12.box(stage, { x: X, y: 434, w: W, h: 58, text: "Hypervisor", tone: "purple" });
      const frames = COLS.map((cx) =>
        D12.box(stage, { x: cx - 8, y: 166, w: CW + 16, h: 214, text: "", tone: "blue", dash: true }),
      );
      const tags = COLS.map((cx, j) =>
        D4.tag(stage, { x: cx + CW / 2, y: 136, text: `VM ${j + 1} (guest)`, tone: "blue", solid: true }),
      );
      const layers = COLS.map((cx, j) =>
        GUEST.map(([text, tone, y]) =>
          D12.box(stage, { x: cx, y, w: CW, h: 58, text: text === "App" ? `App ${j + 1}` : text, tone }),
        ),
      );
      const chipW = CHIPS.map((c) => D4.tagW(c) + 34);
      const chipX = (cx, i) => {
        const total = chipW.reduce((a, b) => a + b, 0) + 6 * (CHIPS.length - 1);
        let x = cx + (CW - total) / 2;
        for (let q = 0; q < i; q++) x += chipW[q] + 6;
        return x + chipW[i] / 2;
      };
      const chips = COLS.map((cx) =>
        CHIPS.map((c, i) => D4.tag(stage, { x: chipX(cx, i), y: 400, text: c, tone: "purple", solid: true })),
      );
      const nameW = NAMES.map((n) => D4.tagW(n) + 20);
      const names = NAMES.map((n, i) => {
        const total = nameW.reduce((a, b) => a + b, 0) + 24 * (NAMES.length - 1);
        let x = (936 - total) / 2;
        for (let q = 0; q < i; q++) x += nameW[q] + 24;
        return D4.tag(stage, { x: x + nameW[i] / 2, y: 42, text: n, tone: "purple" });
      });

      return (t) => {
        hw.set({ k: ramp(t, T.hw, T.hw + 0.4, E.lin) });
        os.set({ k: ramp(t, T.os, T.os + 0.4, E.lin) });
        host.set({ k: ramp(t, T.os + 0.3, T.os + 0.7) });
        const kh = ramp(t, T.hyp, T.hyp + 0.6, E.inOut);
        hyp.set({ k: kh, x: (1 - kh) * -60 });
        const dy = LIFT * (1 - kh);
        const grow = ramp(t, T.chips - 0.2, T.chips + 0.2, E.inOut);
        COLS.forEach((cx, j) => {
          const kf = ramp(t, T.guests + 1.0 + 0.2 * j, T.guests + 1.4 + 0.2 * j, E.lin);
          frames[j].set({ k: kf, y: dy });
          frames[j].el.style.height = `${lerp(214, 264, grow).toFixed(1)}px`;
          tags[j].set({ k: ramp(t, T.guests + 1.3 + 0.2 * j, T.guests + 1.7 + 0.2 * j, E.lin), y: dy });
          layers[j].forEach((l, i) => {
            const k = ramp(t, T.guests + 0.25 * i + 0.1 * j, T.guests + 0.25 * i + 0.1 * j + 0.4, E.lin);
            l.set({ k, y: dy + (1 - E.out(k)) * 30 });
          });
          chips[j].forEach((c, i) => {
            const k = D12.seq(t, T.chips + 0.4 * j, 0.15, 0.5, i);
            c.set({ k, y: (1 - E.out(k)) * 40 });
          });
        });
        names.forEach((n, i) => n.set({ k: D12.seq(t, T.names, 0.3, 0.4, i) }));
      };
    },
  });
})();
