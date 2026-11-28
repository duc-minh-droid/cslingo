/* Lecture 12 (ds-12) · scene 7 (CONTAINERS): three services in three VMs against three containers on one shared kernel
   (lesson 12.3; the rough numbers come from the lesson's demo, D12.usage: 4 OSes and 9.5 GB against 1 OS and 3.5 GB).
   Story (local seconds): 0.4 the left stack builds (grey Hardware, blue Host OS, purple Hypervisor, then three columns of blue
   Guest OS, orange Libraries, green App); 2.4 the three guest OSes get red rings and pulse (the repeats). 5.2 the right stack
   builds (grey Hardware, blue "Host OS (one shared kernel)", purple "Container engine (Docker)", three dashed green boxes with
   only orange Libraries and green App). 7.4 a stat card under each side: operating systems, memory, start-up; the grey note
   "rough numbers, for illustration". 10.6 a start-up race: the container's green bar fills at once (tick), the VM's orange bar
   fills slowly until 13.6 (tick). */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const N = 3;
  const VM = D12.usage("vm", N);
  const CT = D12.usage("ct", N);
  D12.same("scene 7 rough numbers", [VM.os, VM.mem, CT.os, CT.mem], [4, 9.5, 1, 3.5]);
  const HALF = [12, 480];
  const HW = 444;
  const H = 46;
  const Y = { hw: 352, os: 298, mgr: 244, gos: 190, lib: 136, app: 82 };
  const colX = (half, i) => HALF[half] + i * 152;
  const T = { left: 0.4, repeat: 2.4, right: 5.2, stats: 7.4, race: 10.6, vmDone: 13.6 };
  const STATS = [
    [`Operating systems: ${VM.os}`, `Memory used: ${D12.fm(VM.mem)} GB`, "Start-up: about a minute"],
    [`Operating systems: ${CT.os}`, `Memory used: ${D12.fm(CT.mem)} GB`, "Start-up: milliseconds"],
  ];

  V.scene({
    kicker: "CONTAINERS",
    title: ["One shared kernel,", "many sealed boxes"],
    dur: 14,
    caps: [
      [0.4, 2.2, "Three services, three virtual machines."],
      [2.4, 5.0, "Every VM repeats a whole OS: lots of overhead."],
      [5.2, 7.2, "Containers share the host's OS kernel instead."],
      [7.4, 10.4, `Rough numbers: ${VM.os} operating systems against ${CT.os}.`],
      [10.6, 13.7, "A container starts in milliseconds, a VM in about a minute."],
    ],
    build(stage) {
      const titles = ["3 virtual machines", "3 containers"].map((text, h) =>
        D4.label(stage, { x: HALF[h] + HW / 2, y: 34, text, fs: 32 }),
      );
      const base = (h, mgr, os) => [
        D12.box(stage, { x: HALF[h], y: Y.hw, w: HW, h: H, text: "Hardware", fs: 28 }),
        D12.box(stage, { x: HALF[h], y: Y.os, w: HW, h: H, text: os, tone: "blue", fs: 28 }),
        D12.box(stage, { x: HALF[h], y: Y.mgr, w: HW, h: H, text: mgr, tone: "purple", fs: 28 }),
      ];
      const leftBase = base(0, "Hypervisor", "Host OS");
      const rightBase = base(1, "Container engine (Docker)", "Host OS (one shared kernel)");
      const col = (h, i, y, text, tone) => D12.box(stage, { x: colX(h, i), y, w: 140, h: H, text, tone, fs: 28 });
      const vms = Array.from({ length: N }, (_, i) => [
        col(0, i, Y.gos, "Guest OS", "blue"),
        col(0, i, Y.lib, "Libraries", "orange"),
        col(0, i, Y.app, "App", "green"),
      ]);
      const boxes = Array.from({ length: N }, (_, i) =>
        D12.box(stage, { x: colX(1, i) - 5, y: 116, w: 150, h: 120, text: "", tone: "green", dash: true }),
      );
      const cts = Array.from({ length: N }, (_, i) => [
        col(1, i, 180, "Libraries", "orange"),
        col(1, i, 124, "App", "green"),
      ]);
      const cards = HALF.map((x) => D12.box(stage, { x, y: 412, w: HW, h: 120, text: "" }));
      const lines = STATS.map((rows, h) =>
        rows.map((text, r) => D4.label(stage, { x: HALF[h] + 22, y: 438 + r * 34, text, fs: 28, anchor: "l" })),
      );
      const note = D4.label(stage, { x: 468, y: 612, text: "rough numbers, for illustration", fs: 28 });
      const bars = HALF.map((x, h) =>
        D4.bar(stage, { x: x + 10, y: 548, w: 360, h: 34, tone: h ? "green" : "orange" }),
      );
      const svg = D4.svg(stage);
      const ticks = HALF.map((x) => svg.appendChild(L5.tick(x + 410, 565, 44, "green")));

      return (t) => {
        titles[0].set({ k: ramp(t, T.left - 0.2, T.left + 0.2) });
        titles[1].set({ k: ramp(t, T.right - 0.2, T.right + 0.2) });
        const pulse = flash(t, T.repeat, T.repeat + 0.5) + flash(t, T.repeat + 0.6, T.repeat + 1.1);
        leftBase.forEach((b, i) => b.set({ k: ramp(t, T.left + 0.25 * i, T.left + 0.25 * i + 0.4, E.lin) }));
        vms.forEach((c, i) =>
          c.forEach((b, j) => {
            const at = T.left + 0.8 + 0.25 * j + 0.1 * i;
            const isOs = j === 0;
            b.set({
              k: ramp(t, at, at + 0.4, E.lin),
              ring: isOs ? "red" : undefined,
              ringK: ramp(t, T.repeat, T.repeat + 0.3),
              s: isOs ? 1 + 0.08 * pulse : 1,
            });
          }),
        );
        rightBase.forEach((b, i) => b.set({ k: ramp(t, T.right + 0.25 * i, T.right + 0.25 * i + 0.4, E.lin) }));
        boxes.forEach((b, i) => b.set({ k: ramp(t, T.right + 0.8 + 0.15 * i, T.right + 1.2 + 0.15 * i, E.lin) }));
        cts.forEach((c, i) =>
          c.forEach((b, j) => {
            const at = T.right + 1.0 + 0.25 * j + 0.1 * i;
            b.set({ k: ramp(t, at, at + 0.4, E.lin) });
          }),
        );
        cards.forEach((c, h) => c.set({ k: ramp(t, T.stats + 0.1 * h, T.stats + 0.4 + 0.1 * h, E.lin) }));
        lines.forEach((rows, h) =>
          rows.forEach((l, r) =>
            l.set({ k: ramp(t, T.stats + 0.3 + 0.4 * r + 0.1 * h, T.stats + 0.7 + 0.4 * r + 0.1 * h) }),
          ),
        );
        note.set({ k: ramp(t, T.stats + 1.4, T.stats + 1.8) });
        const vmK = ramp(t, T.race, T.vmDone, E.lin);
        const ctK = ramp(t, T.race, T.race + 0.2, E.lin);
        bars[0].set({ k: vmK, o: t >= T.race ? 1 : 0 });
        bars[1].set({ k: ctK, o: t >= T.race ? 1 : 0 });
        L5.drawOn(ticks[1], ramp(t, T.race + 0.3, T.race + 0.6));
        L5.drawOn(ticks[0], ramp(t, T.vmDone, T.vmDone + 0.3));
      };
    },
  });
})();
