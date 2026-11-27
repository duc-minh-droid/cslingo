/* Data Science (COM3021), Lecture 12: virtualisation and containers.
   This part: 12.5 (ds12-images, images, layers and the Dockerfile, with the layer-cache demo) and 12.6 (ds12-k8s,
   orchestration and Kubernetes, with the self-healing cluster demo). The build and cluster models are shared with the
   workshop through NIC.shared.ds12. */
(function () {
  const S = NIC.shared.ds12;
  const N = NIC;
  const { takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, box, line, card, stack } = S;

  /* ---------- the layer cache ---------- */
  /** Dockerfile lines; each lists the changes that alter its own input. */
  const DF = {
    good: [
      ["FROM python:3.12-slim", "base OS + Python", ["base"]],
      ["COPY requirements.txt .", "the library list", ["reqs"]],
      ["RUN pip install -r requirements.txt", "install the libraries", []],
      ["COPY . .", "your code", ["code", "reqs"]],
    ],
    bad: [
      ["FROM python:3.12-slim", "base OS + Python", ["base"]],
      ["COPY . .", "your code (and the library list)", ["code", "reqs"]],
      ["RUN pip install -r requirements.txt", "install the libraries", []],
    ],
  };
  /** Which layers a build has to redo: the first changed layer and every layer after it. */
  function build(order, change) {
    const ls = DF[order];
    let first = change === "all" ? 0 : ls.findIndex((l) => l[2].includes(change));
    if (first < 0) first = ls.length;
    return ls.map((l, i) => ({ cmd: l[0], what: l[1], redo: i >= first }));
  }
  const dfHtml = (rows) =>
    `<div class="ds12-df">${rows
      .map(
        (r) =>
          `<div class="ds12-dl ${r.redo === undefined ? "" : r.redo ? "redo" : "hit"}"><code>${r.cmd}</code><small>${r.what}</small>${r.redo === undefined ? "" : `<span class="ds12-chip">${r.redo ? "rebuilt" : "from cache"}</span>`}</div>`,
      )
      .join("")}</div>`;
  const CHG = { none: "nothing", code: "your code", reqs: "the library list", base: "the base image" };

  function buildLab(b) {
    let change = "code",
      first = true;
    b.innerHTML = `<div class="controls" data-c></div><div data-f></div><div class="controls"><button class="btn primary" data-b>docker build</button></div>${stats(
      [
        ["amber", "Layers rebuilt"],
        ["teal", "Layers from cache"],
      ],
    )}<div class="fig-cap" data-t></div>`;
    const $ = (q) => b.querySelector(q);
    const show = (rows, msg) => {
      $("[data-f]").innerHTML = dfHtml(rows);
      if (rows[0].redo !== undefined) {
        const n = rows.filter((r) => r.redo).length;
        setStats(b, [n, rows.length - n]);
      }
      $("[data-t]").innerHTML = msg;
    };
    seg($("[data-c]"), "none:Nothing|code:Your code|reqs:Library list|base:Base image", change, (v) => {
      change = v;
      show(
        DF.good.map((l) => ({ cmd: l[0], what: l[1] })),
        `Since the last build you changed <b>${CHG[v]}</b>. Press <b>docker build</b>.`,
      );
    });
    $("[data-b]").onclick = () => {
      const rows = build("good", first ? "all" : change);
      show(
        rows,
        first
          ? "First build: every layer is made from scratch and stored in the cache. Now pick what changed and build again."
          : change === "none"
            ? "Nothing changed, so every layer comes straight from the cache."
            : `Docker reuses every layer above the first one that changed, and rebuilds from there down.`,
      );
      first = false;
    };
    show(
      DF.good.map((l) => ({ cmd: l[0], what: l[1] })),
      "Mo's Dockerfile, top to bottom. Press <b>docker build</b> for the first build.",
    );
  }
  Object.assign(S, { DF, build, dfHtml, buildLab });

  /* ---------- the cluster ---------- */
  /** Pods are spread round-robin over the nodes that are up. */
  const place = (want, up) => {
    const live = up.map((u, i) => (u ? i : -1)).filter((i) => i >= 0),
      at = up.map(() => []);
    for (let p = 0; p < want && live.length; p++) at[live[p % live.length]].push(p);
    return at;
  };
  function clusterSvg({ want, up, fresh = [], service = true, label }) {
    const at = place(want, up);
    const nodes = up
      .map((u, k) => {
        const x = 10 + k * 170,
          y = service ? 96 : 60;
        const pods = at[k]
          .map((p, j) => {
            const cx = x + 30 + (j % 3) * 50,
              cy = y + 46 + Math.floor(j / 3) * 36,
              nu = fresh.includes(p);
            return `<circle cx="${cx}" cy="${cy}" r="14" fill="${tint(nu ? "violet" : "teal", nu ? 45 : 30)}" stroke="var(--${nu ? "violet" : "teal"})" stroke-width="${nu ? 3 : 2}"/>${tx(cx, cy + 4, `P${p + 1}`, { s: 10.5 })}`;
          })
          .join("");
        return (
          box(x, y, 160, 118, "", u ? "line-2" : "rose", { dash: !u }) +
          tx(x + 80, y + 20, `Worker node ${k + 1}${u ? "" : " (down)"}`, {
            s: 11.5,
            c: u ? "var(--text)" : "var(--rose-ink)",
          }) +
          pods
        );
      })
      .join("");
    const h = service ? 222 : 186;
    return svg(
      520,
      h,
      box(150, 4, 220, 44, "Control plane", "violet", { sub: "the brain: schedules, heals, scales" }) +
        (service
          ? box(10, 56, 500, 30, "Service: one stable address that shares traffic across the pods", "blue", { s: 11 })
          : line("M260 48V60", "violet")) +
        nodes,
      label || `A cluster of ${up.length} worker nodes running ${want} pods`,
    );
  }

  function k8sLab(b) {
    const s = { want: 3, up: [true, true, true], fresh: [] };
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div><div class="controls"><button class="btn" data-k>Crash a pod</button><button class="btn" data-n>Node 2 goes down</button></div>${stats(
      [
        ["violet", "Desired pods"],
        ["teal", "Running pods"],
        ["blue", "Nodes up"],
      ],
    )}<div class="fig-cap" data-t></div>`;
    const $ = (q) => b.querySelector(q);
    const draw = (msg) => {
      $("[data-f]").innerHTML = clusterSvg(s);
      setStats(b, [s.want, s.want, s.up.filter(Boolean).length]);
      $("[data-n]").textContent = s.up[1] ? "Node 2 goes down" : "Bring node 2 back";
      if (msg) $("[data-t]").innerHTML = msg;
    };
    const sl = N.slider("Replicas wanted", 1, 6, 1, 3, (v) => `${v}`);
    $("[data-s]").append(sl);
    sl.onInput((v) => {
      const old = s.want;
      s.want = v;
      s.fresh = v > old ? Array.from({ length: v - old }, (_, i) => old + i) : [];
      draw(
        v > old
          ? `The Deployment now wants <b>${v}</b> replicas, so the control plane started ${v - old} more pod${v - old > 1 ? "s" : ""} (purple).`
          : `The Deployment now wants <b>${v}</b>: the extra pods are stopped.`,
      );
    });
    $("[data-k]").onclick = () => {
      const p = Math.min(1, s.want - 1);
      s.fresh = [p];
      draw(`Pod P${p + 1} crashed. The control plane noticed running ≠ desired and <b>restarted it</b> straight away.`);
    };
    $("[data-n]").onclick = () => {
      const before = place(s.want, s.up);
      s.up[1] = !s.up[1];
      if (!s.up[1]) {
        s.fresh = before[1];
        draw(
          before[1].length
            ? `Node 2 went down with ${before[1].map((p) => `P${p + 1}`).join(", ")}. Those pods were <b>rescheduled</b> onto the healthy nodes.`
            : "Node 2 went down, but it held no pods. Nothing to move.",
        );
      } else {
        s.fresh = [];
        draw("Node 2 is back. New pods can be scheduled on it again.");
      }
    };
    draw("Three pods of Loafly's shop service, spread over three worker nodes.");
  }
  Object.assign(S, { place, clusterSvg, k8sLab });

  /* ============ 12.5 Recipes and dishes ============ */
  reg({
    id: "ds12-images",
    order: 5,
    num: "12.5",
    title: "Recipes and dishes: images",
    blurb: "Docker images, their layers and the Dockerfile that builds them.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Layer cache", "what gets rebuilt?");
      root.appendChild(c);
      buildLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds12-images-1",
          "You changed only <b>Your code</b> and pressed <b>docker build</b>. Which layers were rebuilt?",
          ["Only the last one", "All four", "Only the first one"],
          "Your code is copied in the last line, so every layer above it is unchanged and comes from the cache. Only the code layer is rebuilt.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "An <b>image</b> is a read-only, layered, versioned template; a <b>container</b> is a running instance of it.",
            "Each <b>layer</b> is one change (base OS → libraries → your code); layers are <b>cached</b>, so builds and sharing are fast.",
            "A <b>Dockerfile</b> defines the image; <b>docker build</b> runs it line by line: reproducible, infrastructure as code.",
          ],
          "The image is the recipe; the container is the cooked dish.",
        ),
      );
    },
  });

  L["ds12-images"] = {
    sum: "An <b>image</b> is the read-only, layered, versioned template; a <b>container</b> is a running instance of it. A <b>Dockerfile</b> builds the image layer by layer.",
    steps: [
      st(
        "The recipe and the dish",
        `<p>One recipe card can feed a whole street: each time you cook it you get a fresh dish, and the card itself never changes.</p><p>A <b>Docker image</b> is the recipe: a <b>template</b> used to create containers. A <b>container</b> is the cooked dish: a <b>runtime instance</b> of an image. Loafly can start three identical forecaster containers from one image.</p>`,
        svg(
          520,
          150,
          box(14, 50, 150, 54, "Forecaster image", "violet", { sub: "read-only template" }) +
            [0, 1, 2]
              .map(
                (i) =>
                  line(`M164 77L340 ${28 + i * 48}`, "violet") +
                  box(340, 10 + i * 48, 166, 38, `Container ${i + 1}`, "teal", { sub: "running" }),
              )
              .join(""),
          "One image is used to start three running containers",
        ),
        mc(
          "Loafly runs three copies of its forecaster from one image. How many containers are running?",
          ["Three", "One", "None: images run directly"],
          "Each running instance of an image is a container, so three copies means three containers from one image.",
        ),
      ),
      st(
        "Built in layers",
        `<p>Think of a trifle: sponge, then fruit, then custard, then cream. Change the cream and you need not bake a new sponge.</p><p>Images are <b>built in layers</b>, and each layer is <b>one change</b>: base OS → installed libraries → your code. Images are also <b>read-only</b> and <b>versioned</b>. Because layers are <b>cached</b>, building and sharing images is very efficient: only what changed is redone.</p>`,
        stack(
          [
            [["Layer 1: base OS + Python", "blue"]],
            [["Layer 2: installed libraries", "teal"]],
            [["Layer 3: your code", "rose", { on: true }]],
          ],
          "An image is a stack of layers: base OS, then libraries, then your code",
        ),
      ),
      st(
        "The Dockerfile: the written recipe",
        `<p>A recipe is written down step by step so anyone can follow it. A <b>Dockerfile</b> is a script that defines how to construct an image.</p><p>Running <b>docker build</b> executes it <b>line by line</b>, producing a layered image. Because the steps are written down, anyone gets the same image: <b>reproducible builds</b>, and the setup is <b>infrastructure as code</b>. Try the cache in the demo.</p>${mm("<p><i>Beyond the slides:</i> common Dockerfile commands are <code>FROM</code> (start from a base image), <code>COPY</code> (add files), <code>RUN</code> (run a command, such as installing libraries), <code>WORKDIR</code> (set the folder) and <code>CMD</code> (what to run when a container starts).</p>")}`,
        dfHtml(DF.good.map((l) => ({ cmd: l[0], what: l[1] }))),
        mc(
          "What does <b>docker build</b> produce from a Dockerfile?",
          ["A layered image", "A running container", "A virtual machine"],
          "docker build runs the Dockerfile line by line and produces an image, built in layers. A container is started from that image afterwards.",
        ),
      ),
    ],
    guide: [
      "Press <b>docker build</b> once for the first build.",
      "Pick <b>Your code</b> and build again: count <b>Layers rebuilt</b>. Then try <b>Library list</b> and <b>Base image</b>.",
      "Answer the question after the demo.",
    ],
  };

  /* ============ 12.6 The conductor: Kubernetes ============ */
  reg({
    id: "ds12-k8s",
    order: 6,
    num: "12.6",
    title: "The conductor: Kubernetes",
    blurb: "Orchestration, PaaS, and how Kubernetes keeps many containers healthy across a cluster.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Self-healing cluster", "break things");
      root.appendChild(c);
      k8sLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds12-k8s-1",
          "You took node 2 down. What happened to the pods that were on it?",
          [
            "They were started again on other nodes",
            "They were lost until node 2 came back",
            "The desired number of pods dropped",
          ],
          "Kubernetes keeps the desired state: when a node goes down, its pods are rescheduled onto healthy nodes, so the running count matches the Deployment again.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Orchestration</b> automates deploying, managing, scaling and networking containers. <b>Kubernetes</b> (K8s) is the standard.",
            "A <b>cluster</b> = a <b>control plane</b> (the brain) + <b>worker nodes</b> (run the containers), kept in the <b>desired state</b>.",
            "<b>Pods</b> run containers, <b>Deployments</b> set the replicas, <b>Services</b> give a stable address and balance traffic.",
          ],
          "Say what you want; Kubernetes keeps it that way.",
        ),
      );
    },
  });

  const why = svg(
    520,
    120,
    [
      ["Horizontal scaling", "many containers in parallel", "blue"],
      ["Self-healing", "recovers from failures", "teal"],
      ["Declarative (YAML)", "describe it once", "violet"],
      ["Cloud-native", "GCP, AWS, Azure", "amber"],
    ]
      .map(([t, s, c], i) => box(6 + (i % 2) * 258, 6 + Math.floor(i / 2) * 58, 250, 50, t, c, { sub: s }))
      .join(""),
    "Why Kubernetes: horizontal scaling, self-healing, declarative deployment and a cloud-native ecosystem",
  );

  L["ds12-k8s"] = {
    sum: "<b>Kubernetes</b> orchestrates containers on a cluster: a control plane keeps pods, deployments and services in the desired state, healing and scaling on its own.",
    steps: [
      st(
        "Who conducts the orchestra?",
        `<p>Loafly now has dozens of containers on several machines. Starting, restarting and wiring them up by hand is like one person playing every instrument. It needs a conductor.</p><p><b>Container orchestration</b> automates the <b>deployment, management, scaling and networking</b> of containers. A related idea is <b>Platform as a Service (PaaS)</b>: a third-party provider gives you a platform to develop, run and manage apps without building and maintaining the infrastructure yourself.</p>`,
        F.flow([
          { t: "Deploy", s: "start containers", c: "blue" },
          { t: "Manage", s: "keep them healthy", c: "teal" },
          { t: "Scale", s: "more or fewer", c: "violet" },
          { t: "Network", s: "connect them", c: "amber" },
        ]),
      ),
      st(
        "Kubernetes and its cluster",
        `<p>A thermostat holds a room at the temperature you set, adjusting on its own. <b>Kubernetes</b> (K8s) does that for containers: it manages deployment, scaling and recovery automatically, so the <b>desired state</b> is always maintained. It began at Google and is now open-source and the industry standard.</p><p>A <b>cluster</b> is a group of machines running Kubernetes: a <b>control plane</b> (the brain: schedules, maintains and scales apps, rolls out updates) and <b>worker nodes</b> (they run your containers).</p>`,
        clusterSvg({
          want: 4,
          up: [true, true, true],
          service: false,
          label: "A cluster: the control plane above three worker nodes",
        }),
        mc(
          "Which part of a Kubernetes cluster decides where new containers should run?",
          ["The control plane", "Any worker node", "Each pod itself"],
          "The control plane is the brain: it schedules, maintains and scales applications. Worker nodes just run the containers they are given.",
        ),
      ),
      st(
        "Pods, Deployments and Services",
        `<p>In a bakery, a tray holds the loaves, the order sheet says “keep three trays out”, and the shop counter is where customers queue, whichever tray they get.</p><p>A <b>Pod</b> is the smallest deployable unit, usually one container. A <b>Deployment</b> sets the desired state: how many <b>replicas</b>, which image, how to update. A <b>Service</b> is a stable network address that <b>load balances</b> traffic across the pods. If a pod dies, it restarts; if a node goes down, its pods are rescheduled; if load rises, it scales up.</p>`,
        clusterSvg({ want: 3, up: [true, true, true], label: "A Service in front of three pods on three nodes" }),
        mc(
          "Customers should reach Loafly's shop at one address, whichever pods are running. Which object provides that?",
          ["A Service", "A Deployment", "A Pod"],
          "A Service is a stable networking endpoint that load balances across the pods. A Deployment sets how many pods there should be; a Pod runs the container.",
        ),
      ),
      st(
        "Why everyone uses it",
        `<p>Why did Loafly bother? Four reasons from the lecture. <b>Horizontal scaling</b>: run many containers in parallel, ideal for data pipelines, feature engineering and model training. <b>Self-healing</b>: the cluster recovers from node or container failures by itself. <b>Declarative deployment</b>: describe the service once in YAML and get the same result on any cloud. A <b>cloud-native ecosystem</b>: it plugs into GCP, AWS and Azure. Try breaking the cluster in the demo.</p>${mm("<p><i>Beyond the slides:</i> a minimal Deployment in YAML says what you want, not how to do it:</p><p><code>kind: Deployment</code><br><code>spec: replicas: 3</code><br><code>template: containers: - image: loafly/shop:v2</code></p><p>Kubernetes compares this desired state with what is running and fixes any difference.</p>")}`,
        why,
      ),
    ],
    guide: [
      "Slide <b>Replicas wanted</b> up and down: new pods appear in purple.",
      "Press <b>Crash a pod</b>, then <b>Node 2 goes down</b>: watch where its pods go and compare <b>Desired pods</b> with <b>Running pods</b>.",
      "Answer the question after the demo.",
    ],
  };
})();
