/* Data Science (COM3021), Lecture 12: virtualisation and containers.
   This part: shared helpers (stacks of layers, small figures) and the lessons 12.1 (ds12-works, "works on my
   machine") and 12.2 (ds12-vm, virtual machines, hypervisors, emulation, snapshots). Running example: Loafly, a
   neighbourhood bakery app whose loaf forecaster runs on Mo's laptop but not on the server. */
(function () {
  const S = (NIC.shared.ds12 = NIC.shared.ds12 || {});
  const N = NIC;
  const { el, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 12, ...m });

  /* ---------- helpers shared with the other Lecture 12 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        String(v),
        cb,
      ),
    );
  const stats = (list) =>
    `<div class="stat-row">${list.map(([c, l]) => `<div class="stat ${c}"><small>${l}</small><b>–</b></div>`).join("")}</div>`;
  const setStats = (box, vals) => box.querySelectorAll(".stat b").forEach((b, i) => (b.textContent = vals[i]));
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)", w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${s}px var(--sans);fill:${c}">${t}</text>`;
  const tint = (c, p = 16) => `color-mix(in srgb,var(--${c}) ${p}%,var(--panel))`;
  /** A labelled sticker box; on = highlighted, dash = dashed outline. */
  const box = (x, y, w, h, name, c, { sub, on, dash, s = 12 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${tint(c, on ? 36 : 14)}" stroke="var(--${c})" stroke-width="${on ? 3 : 2}" ${dash ? 'stroke-dasharray="5 4"' : ""}/>${tx(x + w / 2, y + (sub ? h / 2 - 2 : h / 2 + 4), name, { s })}${sub ? tx(x + w / 2, y + h / 2 + 13, sub, { s: 10.5, c: "var(--text-dim)", w: 700 }) : ""}`;
  const line = (d, c = "line-2", dash = "") =>
    `<path d="${d}" fill="none" stroke="var(--${c})" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );
  const figBox = (b, n = 1) =>
    (b.innerHTML = `${'<div class="controls" style="justify-content:center"></div>'.repeat(n)}<div></div><div class="fig-cap"></div>`);

  /** A stack of layers, drawn bottom-up. rows: [[[label, colour, {on, dash}], ...], ...]; cells in a row share its width. */
  function stack(rows, label, { w = 520, rh = 30 } = {}) {
    const g = 6,
      h = rows.length * (rh + g) + 6;
    const inner = rows
      .map((row, ri) => {
        const y = h - (ri + 1) * (rh + g),
          cw = (w - 8 - (row.length - 1) * 6) / row.length;
        return row
          .map(([t, c, o = {}], k) => box(4 + k * (cw + 6), y, cw, rh, t, c, { s: row.length > 4 ? 10.5 : 12, ...o }))
          .join("");
      })
      .join("");
    return svg(w, h, inner, label);
  }
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  /** Virtual machines on one host: hardware, host OS, hypervisor, then a full guest OS per VM. */
  const vmRows = (n, hl = "") => [
    [["Hardware (CPU, memory, disk)", "line-2"]],
    [["Host operating system", "blue"]],
    [["Hypervisor", "violet", { on: hl === "hyp" }]],
    rep(n, () => ["Guest OS", "amber", { on: hl === "os" }]),
    rep(n, () => ["Libraries", "teal"]),
    rep(n, (i) => [`App ${i + 1}`, "rose"]),
  ];
  /** Containers on one host: one shared OS kernel, a container engine, then only libraries and app per container. */
  const ctRows = (n, hl = "") => [
    [["Hardware (CPU, memory, disk)", "line-2"]],
    [["Host operating system (one shared kernel)", "blue", { on: hl === "os" }]],
    [["Container engine (e.g. Docker)", "violet", { on: hl === "eng" }]],
    rep(n, () => ["Libraries", "teal", { dash: true }]),
    rep(n, (i) => [`App ${i + 1}`, "rose", { dash: true }]),
  ];
  const vmStack = (n, hl, label) => stack(vmRows(n, hl), label || `${n} virtual machines on one host`);
  const ctStack = (n, hl, label) => stack(ctRows(n, hl), label || `${n} containers on one host`);

  Object.assign(S, { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, box, line, card, figBox });
  Object.assign(S, { stack, rep, vmRows, ctRows, vmStack, ctStack });

  /* ---------- small static figures for 12.1 and 12.2 ---------- */
  /** Mo's laptop against the server: what matches and what does not. */
  const envFig = svg(
    520,
    186,
    box(20, 8, 220, 34, "Mo's laptop", "teal", { on: true }) +
      box(280, 8, 220, 34, "Loafly's server", "violet", { on: true }) +
      [
        ["Windows 11", "Ubuntu Linux", true],
        ["Python 3.12", "Python 3.8", true],
        ["pandas 2.2", "pandas 1.3", true],
        ["forecast.py", "forecast.py", false],
      ]
        .map(
          ([a, b, bad], i) =>
            box(20, 52 + i * 33, 220, 27, a, bad ? "amber" : "line-2", { s: 11.5 }) +
            box(280, 52 + i * 33, 220, 27, b, bad ? "rose" : "line-2", { s: 11.5 }) +
            tx(260, 70 + i * 33, bad ? "≠" : "=", { s: 15, c: bad ? "var(--rose-ink)" : "var(--teal-ink)" }),
        )
        .join(""),
    "The same code on two machines with a different operating system, Python version and library version",
  );

  /** Emulation (guest code is translated, never touches the real hardware) against virtualisation (it runs on it). */
  const emuFig = (() => {
    const col = (x, title, mid, c, direct) =>
      tx(x + 110, 16, title, { s: 13 }) +
      box(x, 26, 220, 34, "Guest software", "rose", { sub: direct ? "a full OS + apps" : "e.g. a retro game" }) +
      box(x, 78, 220, 34, mid, c, { sub: direct ? "shares out the real hardware" : "pretends to be the old console" }) +
      box(x, 130, 220, 30, "Host hardware", "line-2") +
      line(`M${x + 110} 60V78`, "line-2") +
      line(`M${x + 110} 112V130`, "line-2") +
      (direct
        ? line(`M${x + 16} 60C${x - 6} 90 ${x - 6} 110 ${x + 16} 130`, "teal") +
          tx(x + 4, 172, "guest instructions run on the real CPU", { a: "start", s: 10.5, c: "var(--teal-ink)" })
        : tx(x + 4, 172, "every instruction is translated", { a: "start", s: 10.5, c: "var(--amber-ink)" }));
    return svg(
      520,
      180,
      col(14, "Emulation", "Emulator", "amber", false) + col(286, "Virtualisation", "Hypervisor", "violet", true),
      "Emulation translates the guest's instructions; virtualisation lets the guest use the host hardware",
    );
  })();

  /** Snapshot timeline: save, break things, roll back. */
  const snapFig = (() => {
    const X = (t) => 30 + t * 92;
    const ev = [
      [0, "VM running", "blue"],
      [1, "Snapshot taken", "violet"],
      [2, "Update installed", "amber"],
      [3, "Forecaster breaks", "rose"],
      [4, "Restored", "teal"],
    ];
    return svg(
      520,
      150,
      line(`M${X(0)} 60H${X(4)}`, "line-2") +
        ev
          .map(
            ([t, l, c]) =>
              `<circle cx="${X(t)}" cy="60" r="9" fill="${tint(c, 40)}" stroke="var(--${c})" stroke-width="2.5"/>${tx(X(t), t % 2 ? 36 : 92, l, { s: 11 })}`,
          )
          .join("") +
        `<path d="M${X(4)} 74C${X(3.5)} 136 ${X(1.5)} 136 ${X(1)} 74" fill="none" stroke="var(--teal)" stroke-width="2.5" stroke-dasharray="6 4"/>` +
        tx(X(2.5), 140, "roll back: later changes are undone", { s: 11, c: "var(--teal-ink)" }),
      "A snapshot saves the virtual machine's state so later changes can be undone",
    );
  })();

  /* ============ 12.1 It works on my machine! ============ */
  reg({
    id: "ds12-works",
    order: 1,
    num: "12.1",
    title: "“It works on my machine!”",
    blurb: "Why code that runs on one computer breaks on another, and the big idea that fixes it.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "“Works on my machine” bugs come from different <b>OS, libraries, Python versions, dependencies and configuration</b>.",
            "Moving from <b>dev → test → production</b> is fragile because environments <b>drift</b> over time.",
            "<b>Virtualisation</b> and <b>containerisation</b> abstract resources at different levels: easier updates, better use of resources.",
          ],
          "Ship the whole kitchen, not just the recipe.",
        ),
      );
    },
  });

  L["ds12-works"] = {
    sum: "Code breaks when it moves between machines because their environments differ. <b>Virtualisation</b> and <b>containerisation</b> package the environment too.",
    steps: [
      st(
        "Mo's forecaster refuses to run",
        `<p>Meet <b>Loafly</b>, a little bakery app. Mo, its data scientist, wrote a model that predicts how many sourdough loaves to bake tomorrow. On Mo's laptop it works beautifully. On the company server it crashes.</p><p>Same code, different <b>environment</b>: the operating system (OS), the Python version, the libraries and their versions, the dependencies and the system settings all differ. That is the classic <b>“works on my machine”</b> problem.</p>`,
        envFig,
        mc(
          "The code file is identical on both machines. Which of these could still make it fail on the server?",
          ["An older version of a library", "A different name for the file", "The time of day it happens to run"],
          "The environment around the code matters: OS, Python version, libraries and their versions, dependencies and configuration. A different library version is a textbook cause.",
        ),
      ),
      st(
        "Drift on the road to production",
        `<p>Think of three kitchens that started out identical. Over months, one gets a new oven, another a different flour. The same recipe now comes out differently in each.</p><p>Software travels the same road: <b>development</b> (Mo's laptop) → <b>test</b> → <b>production</b> (the real server). Each machine gets its own updates and tweaks, so the environments slowly <b>drift</b> apart, and deploying across them becomes fragile.</p>`,
        F.flow([
          { t: "Development", s: "Mo's laptop", c: "teal" },
          { t: "Test", s: "a shared test box", c: "amber" },
          { t: "Production", s: "the live server", c: "rose" },
        ]),
      ),
      st(
        "Pack the kitchen, not just the recipe",
        `<p>What if Mo could post the whole kitchen, oven and flour included, along with the recipe? That is the big idea of this lecture.</p><p><b>Virtualisation</b> and <b>containerisation</b> both <b>abstract</b> resources: they wrap software in a stand-in environment that behaves the same wherever it runs. They work at different levels (a whole pretend computer, or just a sealed box for one app). In distributed systems they make updates easier to deploy and use machines more efficiently.</p>`,
        stack(
          [
            [["Hardware", "line-2"]],
            [["Operating system", "blue", { on: true }]],
            [["Libraries and settings", "teal", { on: true }]],
            [["Mo's forecaster", "rose"]],
          ],
          "The forecaster needs the layers underneath it: libraries, settings and an operating system",
        ),
        mc(
          "Virtualisation and containerisation both help Loafly mainly by…",
          [
            "Packaging the environment along with the code",
            "Making Mo's code itself run faster",
            "Removing the need for an operating system",
          ],
          "Both abstract resources so the software brings a consistent environment with it. They do not speed up the code itself, and an OS is still there underneath.",
        ),
      ),
    ],
  };

  /* ============ 12.2 A computer inside a computer ============ */
  reg({
    id: "ds12-vm",
    order: 2,
    num: "12.2",
    title: "A computer inside a computer",
    blurb: "Virtual machines, the hypervisor that runs them, how they differ from emulators, and snapshots.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "A <b>virtual machine</b> is a software computer; the real one is the <b>host</b>, the virtual ones are <b>guests</b>.",
            "The <b>hypervisor</b> (virtual machine monitor) runs them: VMware Workstation, VirtualBox, Hyper-V.",
            "Unlike an <b>emulator</b>, a VM uses the host hardware. A <b>snapshot</b> saves its state to restore later.",
          ],
          "A pretend computer, with an undo button.",
        ),
      );
    },
  });

  L["ds12-vm"] = {
    sum: "A <b>virtual machine</b> is a software computer run by a <b>hypervisor</b> on a real <b>host</b>. Guests use the host hardware (unlike emulators) and can be saved as <b>snapshots</b>.",
    steps: [
      st(
        "A pretend computer",
        `<p>Picture a big house split into flats. One building, but each flat has its own front door, kitchen and post box, and the neighbours never wander in.</p><p><b>Virtualisation</b> creates a <b>virtual machine</b> (VM): a software-based computer that acts like a real one, with its own hardware, peripherals and operating system. The physical computer is the <b>host</b>; the VMs on it are <b>guests</b>, each running independently from the others.</p>`,
        vmStack(2, "os", "Two guest virtual machines, each with its own operating system, on one host"),
      ),
      st(
        "The landlord: the hypervisor",
        `<p>Every block of flats needs a landlord who hands out rooms, water and electricity fairly. For VMs, that is the <b>hypervisor</b>, also called the <b>virtual machine monitor</b> or <b>virtualiser</b>.</p><p>It is the specialised software that creates the guests and shares the host's CPU, memory and disk between them. Popular ones: <b>VMware Workstation</b> (VMware), <b>VirtualBox</b> (open-source, maintained by Oracle) and <b>Hyper-V</b> (Microsoft).</p>`,
        vmStack(2, "hyp", "The hypervisor sits between the host and the guest virtual machines"),
      ),
      st(
        "Not the same as an emulator",
        `<p>Playing an old console game on your laptop? That uses an <b>emulator</b>: software that <b>mimics specialised hardware</b> so different hardware can run its software. The game never touches your real hardware; every instruction is translated.</p><p>A VM is different. The guest system <b>does interact with the host hardware</b>, with the hypervisor keeping guests apart. Emulation pretends to be other hardware; virtualisation shares out the real hardware.</p>`,
        emuFig,
        mc(
          "Mo plays a 1990s console game on a laptop. The game's code never runs directly on the laptop's hardware. What is this?",
          ["Emulation", "Virtualisation", "A snapshot"],
          "An emulator mimics the old console's hardware, so the guest software never interacts with the host hardware directly. In a virtual machine, it does.",
        ),
      ),
      st(
        "An undo button: snapshots",
        `<p>Before repainting a room you take a photo, so you can put everything back. A <b>snapshot</b> is that photo for a VM: its state at an exact point in time.</p><p>Restoring a snapshot later brings the VM back to that moment, <b>undoing every change made afterwards</b>. Snapshots can also be <b>copied and migrated</b> to another host machine. Loafly snapshots its server VM before every risky update.</p>`,
        snapFig,
        mc(
          "Loafly took a snapshot on Monday, installed an update on Tuesday, then restored the snapshot on Wednesday. What happened to the update?",
          ["It is undone", "It is kept", "It is copied to the snapshot"],
          "Restoring returns the VM to the state at the time of the snapshot, so changes made afterwards, like Tuesday's update, are undone.",
        ),
      ),
    ],
  };
})();
