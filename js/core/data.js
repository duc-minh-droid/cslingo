(function () {
  const core = (NIC.shared.engineCore = NIC.shared.engineCore || {});
  const { colors, css } = core;
  const rnd = Math.random;

  // ---------- 1-D fitness landscapes (discretised, N points, maximise) ----------
  const LAND_N = 240;
  const bump = (x, c, w, hgt) => hgt * Math.exp(-((x - c) ** 2) / (2 * w * w));
  const LANDSCAPES = {
    unimodal: { name: "Unimodal", f: (x) => bump(x, 0.62, 0.2, 1) },
    multimodal: {
      name: "Multimodal",
      f: (x) =>
        0.1 +
        bump(x, 0.12, 0.04, 0.45) +
        bump(x, 0.3, 0.05, 0.62) +
        bump(x, 0.5, 0.035, 0.5) +
        bump(x, 0.7, 0.045, 1) +
        bump(x, 0.88, 0.04, 0.72) +
        0.04 * Math.sin(x * 60),
    },
    plateau: { name: "Plateau", f: (x) => (x < 0.55 ? 0.28 : 0.28 + bump(x, 0.8, 0.07, 0.72) * 1) },
    deceptive: {
      name: "Deceptive",
      f: (x) => (x < 0.86 ? 0.8 * (1 - x / 0.86) + 0.05 : 0.05 + ((x - 0.86) / 0.14) * 0.95),
    },
    random: { name: "Random", f: null },
  };
  function makeLandscape(kind) {
    const vals = new Array(LAND_N);
    for (let i = 0; i < LAND_N; i++) vals[i] = kind === "random" ? rnd() : LANDSCAPES[kind].f(i / (LAND_N - 1));
    const max = Math.max(...vals);
    const best = vals.indexOf(max);
    return { kind, vals, N: LAND_N, max, best, f: (i) => vals[i] };
  }
  function drawLandscape(ctx, w, h, L, opts = {}) {
    const C = colors();
    const pad = { l: 10, r: 10, t: 16, b: 18 };
    const X = (i) => pad.l + (i / (L.N - 1)) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - v / (L.max * 1.08)) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, pad.t, 0, h);
    grad.addColorStop(0, "rgba(88,204,2,0.22)");
    grad.addColorStop(1, "rgba(88,204,2,0.01)");
    ctx.beginPath();
    ctx.moveTo(X(0), h - pad.b);
    L.vals.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
    ctx.lineTo(X(L.N - 1), h - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    L.vals.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = L.kind === "random" ? 1 : 2;
    ctx.stroke();
    // global optimum marker
    ctx.fillStyle = C.amber;
    ctx.font = "11px " + css("--mono");
    ctx.textAlign = "center";
    ctx.fillText("★ global", X(L.best), Y(L.max) - 5);
    ctx.fillStyle = C.text_faint;
    ctx.textAlign = "left";
    ctx.fillText("candidate solutions s ∈ S →", pad.l, h - 4);
    return { X, Y };
  }

  // ---------- TSP from the lecture ----------
  const TSP = {
    cities: ["A", "B", "C", "D", "E"],
    D: {
      A: { B: 5, C: 7, D: 4, E: 15 },
      B: { A: 5, C: 3, D: 4, E: 10 },
      C: { A: 7, B: 3, D: 2, E: 7 },
      D: { A: 4, B: 4, C: 2, E: 9 },
      E: { A: 15, B: 10, C: 7, D: 9 },
    },
    pos: { A: [90, 190], B: [215, 70], C: [345, 150], D: [220, 250], E: [470, 270] },
    len(t) {
      let s = 0;
      for (let i = 0; i < t.length; i++) s += this.D[t[i]][t[(i + 1) % t.length]];
      return s;
    },
    /** Adjacent swap, treating the tour as a ring (position k-1 is adjacent to 0), as in the lecture. */
    swap(t, i) {
      const a = t.split("");
      const j = (i + 1) % a.length;
      [a[i], a[j]] = [a[j], a[i]];
      return a.join("");
    },
    neighbours(t) {
      return t.split("").map((_, i) => this.swap(t, i));
    },
  };

  function tspSVG(tour, opts = {}) {
    const P = TSP.pos,
      D = TSP.D;
    const edges = [];
    if (opts.allEdges)
      TSP.cities.forEach((a, i) =>
        TSP.cities.slice(i + 1).forEach((b) =>
          edges.push(`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--line-2)" stroke-width="1" />
        <text x="${(P[a][0] + P[b][0]) / 2}" y="${(P[a][1] + P[b][1]) / 2 - 4}" fill="var(--text-faint)" font-size="11" text-anchor="middle" font-family="var(--mono)">${D[a][b]}</text>`),
        ),
      );
    const t = tour || "";
    const path = [];
    const closed = opts.open ? t.length - 1 : t.length;
    for (let i = 0; i < closed && t.length > 1; i++) {
      const a = t[i],
        b = t[(i + 1) % t.length];
      const hl = opts.highlight && opts.highlight.includes(i);
      path.push(`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${hl ? "var(--violet)" : opts.color || "var(--teal)"}" stroke-width="${hl ? 4 : 3}" stroke-linecap="round" />
        <text x="${(P[a][0] + P[b][0]) / 2 + 6}" y="${(P[a][1] + P[b][1]) / 2 + 14}" fill="var(--text)" font-size="12" font-weight="600" text-anchor="middle" font-family="var(--mono)">${D[a][b]}</text>`);
    }
    const nodes = TSP.cities.map((c) => {
      const idx = t.indexOf(c);
      const on = idx >= 0;
      return `<g class="city" data-c="${c}" style="cursor:${opts.clickable ? "pointer" : "default"}">
        <circle cx="${P[c][0]}" cy="${P[c][1]}" r="19" fill="${on ? "var(--panel-2)" : "var(--bg-2)"}" stroke="${idx === 0 ? "var(--amber)" : on ? "var(--teal)" : "var(--line-2)"}" stroke-width="2.5" />
        <text x="${P[c][0]}" y="${P[c][1] + 5}" fill="var(--text)" font-size="15" font-weight="700" text-anchor="middle">${c}</text>
        ${on && opts.order ? `<text x="${P[c][0] + 18}" y="${P[c][1] - 16}" fill="var(--amber)" font-size="11" font-family="var(--mono)">${idx + 1}</text>` : ""}
      </g>`;
    });
    return `<svg class="viz" viewBox="0 0 560 320" style="max-height:${opts.maxH || 320}px">${edges.join("")}${path.join("")}${nodes.join("")}</svg>`;
  }

  function matrixHTML(hlPairs = []) {
    const c = TSP.cities;
    const isHl = (a, b) => hlPairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    return `<table class="t matrix"><tr><th></th>${c.map((x) => `<th>${x}</th>`).join("")}</tr>${c.map((a) => `<tr><th>${a}</th>${c.map((b) => (a === b ? `<td class="faint">–</td>` : `<td class="${isHl(a, b) ? "hl" : ""}">${TSP.D[a][b]}</td>`)).join("")}</tr>`).join("")}</table>`;
  }

  core.N_fx = () => window.NIC && window.NIC.fx;
  Object.assign(core, { LANDSCAPES, TSP, drawLandscape, makeLandscape, matrixHTML, tspSVG });
})();
