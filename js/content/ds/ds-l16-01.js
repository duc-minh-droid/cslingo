/* Data Science (COM3021), Lecture 16: hardware–software co-design.
   This part: shared helpers (NIC.shared.ds16), the Leafly photo pipeline model and its timeline, and the demos of
   16.3 (design flows), 16.4 (partition board) and 16.5 (data movement). Lessons are in ds-l16-02.js and ds-l16-03.js.
   Running example: Leafly, a phone app that names a plant from a photo. */
(function () {
  const S = (NIC.shared.ds16 = NIC.shared.ds16 || {});
  const N = NIC;
  const { predict, qs } = N;
  const reg = (m) => N.register({ subject: "ds", lecture: 16, ...m });

  /* ---------- helpers (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  const fm = (v, d = 1) => String(+(+v).toFixed(d));
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
  const box = (x, y, w, h, name, c, sub, on) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${tint(c, on ? 34 : 14)}" stroke="var(--${c})" stroke-width="${on ? 3 : 2}"/>${tx(x + w / 2, y + (sub ? h / 2 - 2 : h / 2 + 5), name, { s: 13 })}${sub ? tx(x + w / 2, y + h / 2 + 14, sub, { s: 11, c: "var(--text-dim)", w: 700 }) : ""}`;
  /** An arrow from (x1,y1) to (x2,y2) with a small head. */
  const arrow = (x1, y1, x2, y2, c = "line-2", dash = "") => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = (d) => `${x2 - 9 * Math.cos(a + d)} ${y2 - 9 * Math.sin(a + d)}`;
    return `<path class="draw" d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="var(--${c})" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/><path d="M${h(0.45)}L${x2} ${y2}L${h(-0.45)}" fill="none" stroke="var(--${c})" stroke-width="2.5" stroke-linejoin="round"/>`;
  };
  const figBox = (b, n = 1) =>
    (b.innerHTML = `${'<div class="controls" style="justify-content:center"></div>'.repeat(n)}<div></div><div class="fig-cap"></div>`);
  Object.assign(S, { reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, tint, box, arrow, figBox });

  /* ---------- the Leafly pipeline: one photo, three stages, copies whenever the data changes processor ---------- */
  const PROC = { cpu: ["CPU", "blue"], gpu: ["GPU", "violet"], npu: ["Plant chip", "teal"] };
  const STAGES = [
    { k: "prep", n: "Prepare photo", t: { cpu: 8, gpu: 6 } },
    { k: "net", n: "Run network", t: { cpu: 120, gpu: 15, npu: 10 } },
    { k: "show", n: "Show result", t: { cpu: 4, gpu: 8 } },
  ];
  /* Copy time (ms) for the data entering each stage: the raw photo, the prepared image, the answer. */
  const COPY = [20, 12, 1];
  /* Energy (mJ per ms of work) of each processor and of a copy. */
  const POWER = { cpu: 1, gpu: 2, npu: 0.5, copy: 0.8 };
  /** Plan one photo. locs: processor per stage; scale multiplies copy times; fast divides the GPU's network time. */
  function plan(locs, { scale = 1, fast = 1 } = {}) {
    const segs = [];
    let t = 0,
      where = "cpu",
      e = 0,
      copy = 0;
    STAGES.forEach((s, i) => {
      const p = locs[i];
      if (p !== where) {
        const c = COPY[i] * scale;
        segs.push({ lane: "copy", a: t, b: t + c, k: "copy", l: "copy" });
        t += c;
        copy += c;
        e += c * POWER.copy;
        where = p;
      }
      const d = s.t[p] / (s.k === "net" && p !== "cpu" ? fast : 1);
      segs.push({ lane: p, a: t, b: t + d, k: s.k, l: s.n });
      t += d;
      e += d * POWER[p];
    });
    return { segs, total: t, energy: e, copy };
  }
  /** Timeline of one photo: a lane per processor used, plus a lane for copies. pick makes stage bars tappable. */
  function timeline(p, { w = 560, T, pick = false } = {}) {
    const lanes = ["cpu", "gpu", "npu"].filter((l) => l === "cpu" || p.segs.some((s) => s.lane === l)).concat("copy");
    const lx = 86,
      rh = 34,
      top = 18,
      max = T || Math.max(40, Math.ceil(p.total / 20) * 20),
      X = (t) => lx + (t / max) * (w - lx - 14),
      h = top + lanes.length * rh + 26;
    const tick = max <= 60 ? 10 : max <= 160 ? 20 : 40;
    let g = "";
    for (let t = 0; t <= max; t += tick)
      g += `<line x1="${X(t)}" y1="${top - 4}" x2="${X(t)}" y2="${top + lanes.length * rh}" stroke="var(--line)"/>${tx(X(t), top - 7, t, { s: 10, c: "var(--text-faint)", w: 700 })}`;
    lanes.forEach((l, i) => {
      const y = top + i * rh,
        [name, c] = l === "copy" ? ["Copying", "amber"] : PROC[l];
      g += tx(lx - 8, y + rh / 2 + 4, name, { a: "end", s: 12 });
      p.segs
        .filter((s) => s.lane === l)
        .forEach((s) => {
          const bw = Math.max(2, X(s.b) - X(s.a));
          g += `<g ${pick && s.k !== "copy" ? `data-pick="${s.k}" data-k="${s.k}" class="ds16-bar"` : ""}><rect class="fi" x="${X(s.a)}" y="${y + 5}" width="${bw}" height="${rh - 10}" rx="5" fill="${tint(c, 42)}" stroke="var(--${c})" stroke-width="2"/>${bw > s.l.length * 6.2 + 8 ? tx(X(s.a) + bw / 2, y + rh / 2 + 4, s.l, { s: 10.5 }) : ""}</g>`;
        });
    });
    g += tx(lx, h - 6, "time for one photo (ms)", { a: "start", s: 10.5, c: "var(--text-dim)", w: 700 });
    return svg(w, h, g, `One photo takes ${fm(p.total)} ms, ${fm(p.copy)} ms of it copying`);
  }
  Object.assign(S, { PROC, STAGES, COPY, POWER, plan, timeline });

  /* ---------- 16.3 demo: four ways to design ---------- */
  const FLOWS = {
    bottom: [
      "Bottom-up",
      "Hardware first, built for a general idea of its use; software is written for it later. Also called <b>platform-based design</b>. Example: early general-purpose GPU computing.",
    ],
    top: [
      "Top-down",
      "The software workload comes first and drives a new hardware design. Example: NVIDIA Volta <b>tensor cores</b>, built for tensor operations.",
    ],
    co: [
      "Co-design",
      "Hardware and software are designed, analysed and optimised <b>together</b>, as one coupled process. Example: Qualcomm <b>Snapdragon Ride Flex</b> and <b>Ride Vision</b> for cars.",
    ],
    iter: [
      "Iterative",
      "<b>Demand</b> calls for more specialised software, which drives new hardware, which invites even more specialised software, and round again.",
    ],
  };
  function flowsFig(b) {
    figBox(b);
    const draw = (v) => {
      let g;
      if (v === "iter")
        g =
          box(200, 10, 140, 46, "Demand", "amber") +
          box(370, 120, 140, 46, "Software", "blue") +
          box(30, 120, 140, 46, "Hardware", "violet") +
          arrow(330, 56, 410, 116, "amber") +
          arrow(368, 150, 174, 150, "blue") +
          arrow(120, 116, 208, 58, "violet");
      else {
        const hwTop = v === "bottom";
        g =
          box(190, hwTop ? 10 : 120, 160, 50, "Hardware", "violet", hwTop ? "first" : v === "co" ? "" : "second") +
          box(190, hwTop ? 120 : 10, 160, 50, "Software", "blue", hwTop ? "second" : v === "co" ? "" : "first") +
          (v === "co"
            ? arrow(250, 62, 250, 116, "teal") +
              arrow(290, 118, 290, 64, "teal") +
              tx(420, 95, "together", { c: "var(--teal-ink)" })
            : arrow(270, 62, 270, 116, hwTop ? "violet" : "blue"));
      }
      b.children[1].innerHTML = svg(540, 176, g, `${FLOWS[v][0]} design`);
      b.lastChild.innerHTML = `<b>${FLOWS[v][0]}</b>: ${FLOWS[v][1]}`;
      b.dataset.flow = v;
    };
    seg(b.firstChild, "bottom:Bottom-up|top:Top-down|co:Co-design|iter:Iterative", "bottom", draw);
    draw("bottom");
  }

  /* ---------- 16.4 demo: the partition board ---------- */
  const JOBS = [
    { n: "Recognise the plant (the network)", heavy: true },
    { n: "Decode the camera stream", heavy: true },
    { n: "Encrypt photo uploads", heavy: true },
    { n: "Menus and settings", heavy: false },
    { n: "Plant-care tips", heavy: false },
    { n: "Pet-safety rules", heavy: false },
  ];
  function partitionFig(b) {
    const hw = JOBS.map(() => false);
    b.innerHTML = `<div class="ds16-board"></div>${stats([
      ["blue", "Speed"],
      ["teal", "Easy to update"],
      ["amber", "Chip size"],
    ])}<div class="fig-cap"></div>`;
    const board = qs(".ds16-board", b);
    const draw = () => {
      board.innerHTML = JOBS.map(
        (j, i) =>
          `<button class="btn small ds16-job ${hw[i] ? "hw" : ""}" data-i="${i}"><span>${j.n}</span><small>${hw[i] ? "hardware" : "software"}</small></button>`,
      ).join("");
      const fast = JOBS.filter((j, i) => j.heavy && hw[i]).length,
        flex = JOBS.filter((j, i) => !j.heavy && !hw[i]).length,
        n = hw.filter(Boolean).length;
      setStats(b, [`${fast}/3 fast`, `${flex}/3 free`, n ? `${n} block${n > 1 ? "s" : ""}` : "none"]);
      const frozen = JOBS.filter((j, i) => !j.heavy && hw[i]);
      b.lastChild.innerHTML = frozen.length
        ? `<b>${frozen[0].n}</b> is now baked into silicon. When it changes next month, you need a new chip.`
        : fast === 3
          ? "The heavy, stable jobs run in hardware; everything that changes stays in software. A tidy partition."
          : "Tap a job to move it between <b>software</b> (flexible) and <b>hardware</b> (fast).";
      b.dataset.fast = fast;
      b.dataset.frozen = frozen.length;
    };
    board.addEventListener("click", (e) => {
      const t = e.target.closest("[data-i]");
      if (!t) return;
      hw[+t.dataset.i] = !hw[+t.dataset.i];
      draw();
    });
    draw();
  }

  /* ---------- 16.5 demo: when the copy costs more than the sum ---------- */
  function moveFig(b) {
    figBox(b, 2);
    let where = "cpu";
    const sl = N.slider("Photo size", 1, 4, 1, 1, (v) => `${v}×`);
    b.children[1].append(sl);
    b.insertAdjacentHTML(
      "beforeend",
      stats([
        ["blue", "One photo"],
        ["amber", "Spent copying"],
      ]),
    );
    const draw = () => {
      const s = sl.value,
        locs = ["cpu", where === "cpu" ? "cpu" : "gpu", "cpu"],
        p = plan(locs, { scale: s, fast: where === "gpu2" ? 2 : 1 });
      b.children[2].innerHTML = timeline(p, { T: 200 });
      setStats(b, [`${fm(p.total)} ms`, `${Math.round((100 * p.copy) / p.total)}%`]);
      b.querySelector(".fig-cap").innerHTML =
        where === "cpu"
          ? "Everything on the CPU: no copies, but the network crawls."
          : p.copy > p.total / 2
            ? "The GPU computes fast, but now <b>more than half</b> the time is spent just moving data."
            : "The network flies on the GPU. The photo has to be copied there and the answer copied back.";
    };
    seg(
      b.firstChild,
      "cpu:Network on CPU|gpu:Network on GPU|gpu2:GPU twice as fast",
      "cpu",
      (v) => ((where = v), draw()),
    );
    sl.onInput(draw);
    draw();
  }

  Object.assign(S, { flowsFig, partitionFig, moveFig, JOBS });
})();
