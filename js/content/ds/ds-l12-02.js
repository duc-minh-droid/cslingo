/* Data Science (COM3021), Lecture 12: virtualisation and containers.
   This part: 12.3 (ds12-light, the drawbacks of VMs and what containers are, with the VM-or-container demo) and
   12.4 (ds12-docker, Docker, namespaces and cgroups, Docker on Windows). Helpers come from ds-l12-01.js. */
(function () {
  const S = NIC.shared.ds12;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, box, line, card, stack, vmStack, ctStack } = S;

  /* ---------- 12.3 demo: VMs or containers for the same apps (illustrative numbers) ---------- */
  const COST = { os: 2, app: 0.5 }; // GB, rough and illustrative only
  const usage = (mode, n) =>
    mode === "vm" ? { os: n + 1, mem: COST.os + n * (COST.os + COST.app) } : { os: 1, mem: COST.os + n * COST.app };
  function stackLab(b) {
    let mode = "vm";
    b.innerHTML = `<div class="controls" data-m></div><div class="controls" data-s></div><div data-f></div>${stats([
      ["amber", "Operating systems running"],
      ["blue", "Memory used"],
      ["teal", "Start-up time"],
    ])}<div class="fig-cap" data-c></div>`;
    const sl = N.slider("Loafly services", 1, 6, 1, 3, (v) => `${v}`);
    b.querySelector("[data-s]").append(sl);
    const draw = () => {
      const n = sl.value,
        u = usage(mode, n);
      b.querySelector("[data-f]").innerHTML =
        mode === "vm"
          ? vmStack(n, "os", `${n} services, each in its own virtual machine`)
          : ctStack(n, "os", `${n} services, each in its own container, sharing one kernel`);
      setStats(b, [u.os, `${u.mem} GB`, mode === "vm" ? "about a minute" : "milliseconds"]);
      b.querySelector("[data-c]").innerHTML =
        mode === "vm"
          ? `Every VM boots a <b>whole guest OS</b>: ${n} service${n > 1 ? "s" : ""} means ${n} extra OS${n > 1 ? "es" : ""} on top of the host's. <i>Numbers are rough, for illustration.</i>`
          : `All ${n} containers share the <b>host kernel</b>; each brings only its libraries and app. <i>Numbers are rough, for illustration.</i>`;
    };
    seg(b.querySelector("[data-m]"), "vm:Virtual machines|ct:Containers", mode, (v) => ((mode = v), draw()));
    sl.onInput(draw);
    draw();
  }
  Object.assign(S, { usage, stackLab });

  /** Five properties of containers as badges. */
  const props = svg(
    520,
    96,
    [
      ["Portable", "blue"],
      ["Scalable", "teal"],
      ["Easy to build and deploy", "violet"],
      ["Easy to manage", "amber"],
      ["Isolated", "rose"],
    ]
      .map(([t, c], i) => box(i < 3 ? 6 + i * 172 : 92 + (i - 3) * 172, i < 3 ? 6 : 52, 164, 38, t, c, { s: 11.5 }))
      .join(""),
    "Containers are portable, scalable, easy to build, deploy and manage, and isolated",
  );

  /** Start-up race: a VM boots a whole OS, a container starts a process. */
  const raceFig = svg(
    520,
    120,
    tx(10, 26, "Virtual machine", { a: "start", s: 12 }) +
      `<rect x="130" y="12" width="360" height="22" rx="6" fill="${tint("amber", 30)}" stroke="var(--amber)" stroke-width="2"/>` +
      tx(310, 28, "boot a whole guest OS, then the app", { s: 11 }) +
      tx(10, 76, "Container", { a: "start", s: 12 }) +
      `<rect x="130" y="62" width="22" height="22" rx="6" fill="${tint("teal", 40)}" stroke="var(--teal)" stroke-width="2"/>` +
      tx(162, 78, "start the app: milliseconds", { a: "start", s: 11, c: "var(--teal-ink)" }) +
      line("M130 104H490", "line-2") +
      tx(310, 117, "time to start →", { s: 10.5, c: "var(--text-dim)", w: 700 }),
    "A container starts in milliseconds; a virtual machine has to boot a whole operating system",
  );

  /* ============ 12.3 Travelling light ============ */
  reg({
    id: "ds12-light",
    order: 3,
    num: "12.3",
    title: "Travelling light: containers",
    blurb: "Why a VM per app is heavy, and how containers share one operating system instead.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("VMs or containers?", "same apps, two ways");
      root.appendChild(c);
      stackLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds12-light-1",
          "In <b>Virtual machines</b> mode you slid from 1 service to 6. What grew along with the number of services?",
          [
            "The number of operating systems running",
            "The amount of hardware in the server",
            "Nothing: VMs share one OS",
          ],
          "Each VM carries its own guest OS, so every new service adds another whole OS. Containers share the host kernel, so their OS count stays at one.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "VMs carry <b>significant overhead</b> and <b>redundancy</b>: each has its own OS and configuration files.",
            "<b>Containerisation</b> (OS-level virtualisation) shares the host OS; containers stay <b>isolated</b> and use only their allocated resources.",
            "Containers share the <b>host kernel</b>: far lighter than VMs, start in <b>milliseconds</b>, scale out easily.",
          ],
          "One kitchen, many sealed lunchboxes.",
        ),
      );
    },
  });

  L["ds12-light"] = {
    sum: "VMs repeat a whole OS per guest. <b>Containers</b> (OS-level virtualisation) share the host kernel, so they are light, fast to start and easy to scale.",
    steps: [
      st(
        "Too many kitchens",
        `<p>Loafly now runs six small services: the forecaster, the shop, the delivery planner and more. Giving each its own VM is like building six full kitchens to make six sandwiches.</p><p>That is the drawback of VMs: <b>significant overhead</b> and <b>lots of redundancy</b>. Every VM has its own operating system, configuration files and so on, all repeated, all using memory and disk.</p>`,
        vmStack(3, "os", "Three virtual machines repeat three guest operating systems"),
      ),
      st(
        "Share the kitchen: containers",
        `<p>Now picture one shared kitchen where every cook has a sealed lunchbox with their own ingredients. Nobody can grab from another's box.</p><p><b>Containerisation</b>, also called <b>OS-level virtualisation</b>, abstracts at the <b>operating system</b> level. Many apps share the host's OS and binaries while staying <b>isolated</b> from one another. Each container can only use the resources that have been <b>allocated</b> to it.</p>`,
        ctStack(3, "os", "Three containers share one host operating system"),
        mc(
          "What do containers on one host share that separate VMs do not?",
          ["The host's OS kernel", "Their application code", "Their private files"],
          "Containers share the host OS (its kernel and binaries) while staying isolated. Each VM, by contrast, runs its own guest OS.",
        ),
      ),
      st(
        "A ready-packed lunchbox",
        `<p>A lunchbox goes anywhere: desk, park, train. A <b>container</b> is a fully packaged, portable computing environment: the app plus everything it needs.</p><p>Containers are meant to be <b>portable</b>, <b>scalable</b>, <b>easier to build and deploy</b>, <b>easier to manage</b>, and <b>isolated</b>. Mo can ship the forecaster in one and know it brings its own Python and libraries along.</p>`,
        props,
      ),
      st(
        "Ready in a blink",
        `<p>Starting a VM is like booting a fresh laptop; starting a container is like opening an app that is already installed.</p><p>Because containers <b>share the host kernel</b> (the core of the OS), they are <b>far lighter</b> than VMs. They start in <b>milliseconds</b> and can <b>scale horizontally</b> (more copies, side by side) very efficiently. Try both modes in the demo.</p>${mm("<p>A rough model (illustrative only, not from the slides): with a host OS of size $o$, a guest OS also of size $o$ and an app of size $a$, running $n$ apps costs about</p>$$\\text{VMs: } o + n(o + a) \\qquad \\text{containers: } o + n\\,a$$<p>The VM line grows by a whole OS per app; the container line only by the app.</p>")}`,
        raceFig,
        mc(
          "A lunchtime rush means Loafly needs extra copies of its shop service right now. Why do containers suit this better than VMs?",
          ["They start in milliseconds", "They each boot their own OS", "They never need a host"],
          "Containers share the host kernel, so a new copy starts almost instantly. A VM must boot a whole guest OS first.",
        ),
      ),
    ],
    guide: [
      "Pick <b>Virtual machines</b> and slide <b>Loafly services</b> from 1 to 6: watch <b>Operating systems running</b> and <b>Memory used</b>.",
      "Switch to <b>Containers</b> and do the same. Compare the stacks and <b>Start-up time</b>.",
      "Answer the question after the demo.",
    ],
  };

  /* ---------- small static figures for 12.4 ---------- */
  /** Namespaces (own view of files, network, processes) and cgroups (resource limits) for two containers. */
  const nsFig = (() => {
    const one = (x, name, c, cpu, mem) =>
      box(x, 6, 240, 150, "", c, { dash: true }) +
      tx(x + 120, 26, name, { s: 13 }) +
      ["Own files", "Own network", "Own process list"]
        .map((t, i) => box(x + 12, 36 + i * 32, 104, 26, t, "blue", { s: 10.5 }))
        .join("") +
      [
        ["CPU", cpu],
        ["Memory", mem],
        ["IO", 0.4],
      ]
        .map(
          ([t, f], i) =>
            tx(x + 130, 54 + i * 32, t, { a: "start", s: 10.5 }) +
            `<rect x="${x + 178}" y="${42 + i * 32}" width="50" height="14" rx="4" fill="var(--panel-2)" stroke="var(--line-2)"/><rect x="${x + 178}" y="${42 + i * 32}" width="${50 * f}" height="14" rx="4" fill="${tint("amber", 55)}"/>`,
        )
        .join("") +
      tx(x + 64, 146, "namespaces", { s: 10.5, c: "var(--blue-ink)" }) +
      tx(x + 186, 146, "cgroups (limits)", { s: 10.5, c: "var(--amber-ink)" });
    return svg(
      520,
      162,
      one(10, "Forecaster", "teal", 0.6, 0.5) + one(270, "Shop", "rose", 0.3, 0.7),
      "Each container gets its own files, network and process list (namespaces) and capped CPU, memory and IO (cgroups)",
    );
  })();

  /* ============ 12.4 Docker: the lunchbox maker ============ */
  reg({
    id: "ds12-docker",
    order: 4,
    num: "12.4",
    title: "Docker, the lunchbox maker",
    blurb: "What Docker gives you, the two kernel tricks behind every container, and Docker on Windows.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Docker</b> gives lightweight, reproducible, isolated environments: ideal for data pipelines, ML and microservices.",
            "A container is an isolated process on the host OS: <b>namespaces</b> give it its own view, <b>cgroups</b> limit CPU, memory and IO.",
            "<b>Docker Desktop</b> on Windows runs a small Linux VM through <b>WSL2</b> (modern) or <b>Hyper-V</b> (older).",
          ],
          "A packaged app plus all its dependencies, running in isolation.",
        ),
      );
    },
  });

  L["ds12-docker"] = {
    sum: "<b>Docker</b> runs containers: isolated processes on the host OS, kept apart by <b>namespaces</b> and limited by <b>cgroups</b>.",
    steps: [
      st(
        "Meet Docker",
        `<p>Mo wants a lunchbox maker: one tool that packs the forecaster the same way every time. That tool is <b>Docker</b>.</p><p>Docker provides <b>lightweight</b>, <b>reproducible</b>, <b>isolated</b> environments using containers. That makes it ideal for <b>reproducible data pipelines</b>, <b>machine learning</b> and <b>microservices</b> (an app built from many small services, like Loafly's). A container is <b>a packaged application plus all its dependencies, running in isolation</b>.</p>`,
        lunchFig(),
      ),
      st(
        "Two tricks: namespaces and cgroups",
        `<p>In a shared office, each team gets its own room (they cannot see each other's papers) and a fixed budget (they cannot spend everyone's money).</p><p>A container is really just an <b>isolated process</b> on the host OS, using two kernel features. <b>Namespaces</b> are the rooms: each container gets its own filesystem, network interface and process table. <b>Cgroups</b> are the budget: they <b>limit CPU, memory and IO</b>.</p>`,
        nsFig,
        mc(
          "Loafly wants the forecaster never to use more than a fixed share of memory. Which feature does that?",
          ["Cgroups", "Namespaces", "Snapshots"],
          "Cgroups control resources: CPU, memory and IO. Namespaces give each container its own view of files, network and processes.",
        ),
      ),
      st(
        "Docker on a Windows laptop",
        `<p>Containers share the host's <b>Linux</b> kernel. So what about Mo's Windows laptop? Docker borrows a trick from 12.2.</p><p><b>Docker Desktop</b> runs a <b>minimal Linux VM</b> in the background, and the containers live inside it. It uses either <b>WSL2</b> (Windows Subsystem for Linux 2, the modern method) or <b>Hyper-V</b> (the older method). Virtualisation and containers, working together.</p>`,
        stack(
          [
            [["Laptop hardware", "line-2"]],
            [["Windows", "blue"]],
            [["WSL2 (modern) or Hyper-V (older)", "violet", { on: true }]],
            [["Small Linux VM", "amber"]],
            [
              ["Forecaster", "rose", { dash: true }],
              ["Shop", "rose", { dash: true }],
            ],
          ],
          "On Windows, Docker Desktop runs containers inside a small Linux virtual machine",
        ),
        mc(
          "Why does Docker Desktop on Windows run a small Linux VM?",
          [
            "Containers need a Linux kernel to share",
            "Windows cannot run any software at all",
            "VMs make containers start faster",
          ],
          "Containers share the host's kernel, and these containers expect Linux. A minimal Linux VM (through WSL2 or Hyper-V) provides one.",
        ),
      ),
    ],
  };

  /** The lunchbox: one container holding the app, its libraries and its settings. */
  function lunchFig() {
    return svg(
      520,
      150,
      box(130, 6, 260, 138, "", "teal", { dash: true }) +
        tx(260, 26, "One container", { s: 13, c: "var(--teal-ink)" }) +
        box(150, 36, 220, 30, "forecast.py (the app)", "rose") +
        box(150, 72, 220, 30, "Python 3.12 + pandas 2.2", "blue", { s: 11.5 }) +
        box(150, 108, 220, 28, "settings and config", "amber", { s: 11.5 }),
      "A container packs the app with its Python, libraries and settings",
    );
  }
})();
