/* Lecture 12 · Virtualisation and containers (Data Science, COM3021): the data and the drawing pieces every scene of this video
   shares (VID.d12, short name D12). The small stickers (tags, labels, bars, wires, server icons, bolt, camera, not-equal sign)
   come from the lecture 4 kit VID.d4 and the ticks / crosses / arrows from VID.l5, so the page loads videos/l5/common.js and
   videos/d4/common*.js first. Every figure is computed below by porting the lessons' own code (js/content/ds/ds-l12-*.js) and
   asserted against the storyboard (videos/_plan/ds-12.json) at load time: a wrong number throws an Error. Deterministic: no
   Math.random, no Date.

   COLOUR ROLES OF THIS VIDEO (the same in every scene):
     "grey"    hardware (machine cards, "Hardware", "Host hardware"), wires, arrows, plain labels
     "blue"    operating systems (host OS, guest OS, the one shared kernel, "Small Linux VM"), namespaces
     "purple"  the layer that manages others (hypervisor, container engine, WSL2 / Hyper-V, the Kubernetes control plane,
               the Deployment and the Service), a snapshot
     "orange"  the environment around the code (Python version, libraries, settings, Dockerfile lines, cgroups)
     "green"   the app running fine and good outcomes (works, restored, from cache, healthy pods, a ready container)
     "red"     what breaks or is wasted (mismatches, crashes, repeated guest OSes, rebuilt layers, a node that is down)

   DATA
     D12.ENV   (scene 2, lesson 12.1)  rows [[laptop, server, differs]] x 4 and the five words of the lesson's list
     D12.COST / D12.usage(mode, n)  (scene 7, lesson 12.3 demo)  usage("vm", 3) = {os: 4, mem: 9.5}, usage("ct", 3) = {os: 1, mem: 3.5}
     D12.DF / D12.build(change)  (scene 9, lesson 12.5 layer cache)  rows of Mo's Dockerfile; build("all" | "code" | "reqs") ->
               [{cmd, what, redo}] (the first changed layer and every layer after it are rebuilt); D12.PASSES the three builds
               with their rebuilt / cached counts (4 / 0, 1 / 3, 3 / 1)
     D12.K8S   (scene 10, lesson 12.6)  desired replicas 3 and the running count over the scene's story
   DRAWING
     const b = D12.box(parent, {x, y, w, h, text, sub, tone: "grey", fs: 30, mono, dash, align: "c"});  a layer / machine card
            (x, y = top-left).  b.set({k, x, y, s, o, tone, text, sub, dash, ring, ringK})  k pops it in; x, y offsets;
            dash = dashed outline with no fill (a container or a VM boundary); ring = a tone name for an outline ring
     D12.eq(x, y, s, tone) an "equals" sign (SVG);  D12.clock(x, y, s) -> {g, hand} (rotate the hand with V.place(hand, {r}))
     D12.wave(x0, x1, y, amp, n, tone) a wavy SVG path (drift);  D12.fm(v) number format;  D12.same(what, got, want) assert */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D12 = (V.d12 = V.d12 || {});
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d12: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const fm = (v, d = 2) => String(+(+v).toFixed(d));
  Object.assign(D12, { same, fm, tone: (n) => D4.tone(n), seq: (...a) => D4.seq(...a) });

  // ---------- 1. it works on my machine (12.1: the lesson's envFig rows) ----------
  D12.ENV = {
    rows: [
      ["Windows 11", "Ubuntu Linux", true],
      ["Python 3.12", "Python 3.8", true],
      ["pandas 2.2", "pandas 1.3", true],
      ["forecast.py", "forecast.py", false],
    ],
    words: ["OS", "Python version", "libraries", "dependencies", "configuration"],
  };
  same(
    "ENV differing rows",
    D12.ENV.rows.map((r) => r[0] !== r[1]),
    D12.ENV.rows.map((r) => r[2]),
  );

  // ---------- 2. VMs against containers (12.3 demo: rough, illustrative GB) ----------
  D12.COST = { os: 2, app: 0.5 };
  D12.usage = (mode, n) =>
    mode === "vm"
      ? { os: n + 1, mem: D12.COST.os + n * (D12.COST.os + D12.COST.app) }
      : { os: 1, mem: D12.COST.os + n * D12.COST.app };
  same("usage vm 3", D12.usage("vm", 3), { os: 4, mem: 9.5 });
  same("usage containers 3", D12.usage("ct", 3), { os: 1, mem: 3.5 });

  // ---------- 3. the layer cache (12.5: DF.good and build(), line for line) ----------
  D12.DF = [
    ["FROM python:3.12-slim", "base OS + Python", ["base"]],
    ["COPY requirements.txt .", "the library list", ["reqs"]],
    ["RUN pip install -r requirements.txt", "install the libraries", []],
    ["COPY . .", "your code", ["code", "reqs"]],
  ];
  D12.build = (change) => {
    let first = change === "all" ? 0 : D12.DF.findIndex((l) => l[2].includes(change));
    if (first < 0) first = D12.DF.length;
    return D12.DF.map((l, i) => ({ cmd: l[0], what: l[1], redo: i >= first }));
  };
  D12.PASSES = ["all", "code", "reqs"].map((change) => {
    const rows = D12.build(change);
    const rebuilt = rows.filter((r) => r.redo).length;
    return { change, redo: rows.map((r) => r.redo), rebuilt, cached: rows.length - rebuilt };
  });
  same(
    "layer cache passes (rebuilt, cached)",
    D12.PASSES.map((p) => [p.rebuilt, p.cached]),
    [
      [4, 0],
      [1, 3],
      [3, 1],
    ],
  );

  // ---------- 4. Kubernetes keeps the desired state (12.6) ----------
  {
    const desired = 3;
    // the story: P2 crashes at 6.0 and is restarted at 6.8; node 2 goes down at 8.8, its pod lands on node 3 at 10.4
    const events = [
      [6.0, -1],
      [6.8, +1],
      [8.8, -1],
      [10.4, +1],
    ];
    const running = (t) => (t < 2.6 ? 0 : desired + events.filter(([at]) => t >= at).reduce((s, [, d]) => s + d, 0));
    D12.K8S = { desired, events, running };
    same("K8S running over the story", [3, 6.4, 7.2, 9.2, 11].map(running), [3, 2, 3, 2, 3]);
  }

  // ---------- drawing: a layer / machine card ----------
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const pop = (k) => 0.8 + 0.2 * E.pop(clamp(k));
  D12.box = (parent, o = {}) => {
    const { x = 0, y = 0, w = 300, h = 64, fs = 30, align = "c" } = o;
    const el = V.h("div", {
      class: "v-card",
      style: {
        ...abs(x, y, w, h),
        display: "flex",
        flexDirection: "column",
        alignItems: align === "c" ? "center" : "flex-start",
        justifyContent: "center",
        padding: align === "c" ? "0 8px" : "0 20px",
        borderRadius: "18px",
        textAlign: align === "c" ? "center" : "left",
        lineHeight: "1.15",
      },
    });
    const main = V.h("div", {
      text: o.text || "",
      style: {
        fontSize: `${fs}px`,
        fontWeight: "900",
        whiteSpace: "nowrap",
        ...(o.mono ? { fontFamily: "var(--mono)", fontWeight: "700" } : {}),
      },
    });
    const sub = V.h("div", {
      text: o.sub || "",
      style: { fontSize: "28px", fontWeight: "800", whiteSpace: "nowrap", color: "var(--text-dim)" },
    });
    el.append(main, sub);
    parent.append(el);
    const base = { tone: o.tone || "grey", dash: !!o.dash };
    return {
      el,
      x,
      y,
      w,
      h,
      mid: { x: x + w / 2, y: y + h / 2 },
      set(st = {}) {
        const tone = st.tone || base.tone;
        const cls = `v-card c-${tone}`;
        if (el.className !== cls) el.className = cls;
        if (st.text != null && main.textContent !== st.text) main.textContent = st.text;
        const subText = st.sub != null ? st.sub : o.sub || "";
        if (sub.textContent !== subText) sub.textContent = subText;
        sub.style.display = subText ? "" : "none";
        const dash = st.dash ?? base.dash;
        el.style.borderStyle = dash ? "dashed" : "solid";
        el.style.borderWidth = dash ? "5px" : "";
        el.style.borderColor = dash ? "var(--c)" : "";
        el.style.background = dash ? "transparent" : "";
        el.style.boxShadow = dash ? "none" : "";
        const rk = st.ring ? clamp(st.ringK ?? 1) : 0;
        el.style.outline = rk > 0 ? `${f1(5 * rk)}px solid ${D4.tone(st.ring).c}` : "none";
        el.style.outlineOffset = "4px";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: (st.s ?? 1) * pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  };

  // ---------- drawing: small SVG pictograms ----------
  const line = (x1, y1, x2, y2, c, w) =>
    V.s("line", {
      x1: f1(x1),
      y1: f1(y1),
      x2: f1(x2),
      y2: f1(y2),
      stroke: c,
      "stroke-width": f1(w),
      "stroke-linecap": "round",
    });
  D12.eq = (x, y, s, tone = "grey") => {
    const c = D4.tone(tone).c;
    return V.s(
      "g",
      {},
      line(x - 0.34 * s, y - 0.14 * s, x + 0.34 * s, y - 0.14 * s, c, 0.11 * s),
      line(x - 0.34 * s, y + 0.14 * s, x + 0.34 * s, y + 0.14 * s, c, 0.11 * s),
    );
  };
  D12.clock = (x, y, s) => {
    const G = D4.tone("grey");
    const g = V.s(
      "g",
      {},
      V.s("circle", { cx: f1(x), cy: f1(y), r: f1(0.46 * s), fill: "var(--panel)", stroke: G.lip, "stroke-width": 5 }),
      line(x, y, x, y - 0.24 * s, G.lip, 5),
    );
    const hand = line(x, y, x + 0.3 * s, y, D4.tone("orange").c, 6);
    g.append(hand, V.s("circle", { cx: f1(x), cy: f1(y), r: "5", fill: G.lip }));
    return { g, hand };
  };
  D12.wave = (x0, x1, y, amp, n, tone = "red") => {
    const step = (x1 - x0) / n;
    let d = `M${f1(x0)} ${f1(y)}`;
    for (let i = 0; i < n; i++) {
      const xa = x0 + step * (i + 0.5);
      d += ` Q${f1(xa)} ${f1(y + (i % 2 ? amp : -amp))} ${f1(x0 + step * (i + 1))} ${f1(y)}`;
    }
    return V.s("path", {
      d,
      fill: "none",
      stroke: D4.tone(tone).c,
      "stroke-width": 7,
      "stroke-linecap": "round",
      pathLength: 1,
      "stroke-dasharray": "1 1",
    });
  };
  /** draw a pathLength-1 path on, 0..1 */
  D12.drawOn = (path, k) => path.setAttribute("stroke-dashoffset", (1 - clamp(k)).toFixed(3));
})();
