/* Shared lesson figures. Every builder returns an HTML/SVG string (or mounts into a container)
   so lessons stay declarative. Strokes marked `.draw` and items marked `.fi` animate in via NIC.fx.play. */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COL = { teal: "var(--teal)", violet: "var(--violet)", amber: "var(--amber)", rose: "var(--rose)", blue: "var(--blue)", dim: "var(--line-2)", text: "var(--text)" };
  const col = (c) => COL[c] || c || "var(--teal)";
  let uid = 0;
  /** A small dot that travels along path `d` forever (SVG SMIL — no JS loop, hidden under reduced motion). */
  const dot = (d, c = "var(--teal)", { dur = 1.8, begin = 0, r = 4 } = {}) =>
    `<circle class="flowdot" r="${r}" fill="${c}" opacity="0"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1"/><animate attributeName="opacity" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.15;0.8;1"/></circle>`;

  /** Inline glossary term: hover or tap/focus shows a short definition. */
  const term = (word, tip) => `<span class="term" tabindex="0" data-tip="${esc(tip)}">${word}</span>`;

  /** Graph. nodes: {A:[x,y]} or {A:{x,y,label,c,sub}}; edges: [[a,b,w?,c?]]; opts: {w,h,directed,hl:{A:'teal','A-B':'rose'}, r} */
  function graph({ nodes, edges = [], w = 460, h = 260, directed = false, hl = {}, r = 18, maxH } = {}) {
    const id = "g" + ++uid;
    const P = Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, Array.isArray(v) ? { x: v[0], y: v[1] } : v]));
    const eKey = (a, b) => (hl[`${a}-${b}`] ? `${a}-${b}` : hl[`${b}-${a}`] && !directed ? `${b}-${a}` : null);
    const lines = edges.map(([a, b, wt, c]) => {
      const A = P[a], B = P[b], k = eKey(a, b), ec = c || (k && hl[k]);
      const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
      const x1 = A.x + (dx / L) * r, y1 = A.y + (dy / L) * r, x2 = B.x - (dx / L) * (r + (directed ? 4 : 0)), y2 = B.y - (dy / L) * (r + (directed ? 4 : 0));
      const mx = (A.x + B.x) / 2 - (dy / L) * 11, my = (A.y + B.y) / 2 + (dx / L) * 11;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ec ? col(ec) : "var(--line-2)"}" stroke-width="${ec ? 3.5 : 2}" stroke-linecap="round" ${directed ? `marker-end="url(#${id}m)"` : ""} class="${ec ? "draw" : ""}"/>${ec ? dot(`M${x1} ${y1} L${x2} ${y2}`, col(ec), { dur: 1.6 + (Math.hypot(x2 - x1, y2 - y1) / 400), begin: 0.8 }) : ""}` +
        (wt !== undefined && wt !== null ? `<text x="${mx}" y="${my + 4}" class="fig-w ${ec ? "on" : ""}" style="${ec ? `fill:${col(ec)}` : ""}">${wt}</text>` : "");
    }).join("");
    const circles = Object.entries(P).map(([k, v]) => {
      const c = v.c || hl[k];
      return `<g class="fi"><circle cx="${v.x}" cy="${v.y}" r="${r}" fill="${c ? `color-mix(in srgb, ${col(c)} 18%, var(--panel-2))` : "var(--panel-2)"}" stroke="${c ? col(c) : "var(--line-2)"}" stroke-width="2.5"/>
        <text x="${v.x}" y="${v.y + 5}" class="fig-n">${v.label ?? k}</text>${v.sub !== undefined ? `<text x="${v.x}" y="${v.subTop ?? v.y < h * 0.4 ? v.y - r - 8 : v.y + r + 15}" class="fig-sub" style="fill:${c ? col(c) : "var(--text-faint)"}">${v.sub}</text>` : ""}</g>`;
    }).join("");
    const defs = directed ? `<defs><marker id="${id}m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>` : "";
    return `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:${maxH || h}px">${defs}${lines}${circles}</svg>`;
  }

  /** Pipeline of boxes with arrows. items: ["text" | {t, s, c}]; opts: {w} */
  function flow(items, { loop = false } = {}) {
    const n = items.length, bw = 132, gap = 34, h = 74, w = n * bw + (n - 1) * gap + 8;
    const box = items.map((it, i) => {
      const o = typeof it === "string" ? { t: it } : it, x = 4 + i * (bw + gap), c = col(o.c || (i === n - 1 ? "teal" : "dim"));
      return `<g class="fi"><rect x="${x}" y="10" width="${bw}" height="${h - 20}" rx="12" fill="color-mix(in srgb, ${c} 12%, var(--panel-2))" stroke="${c}" stroke-width="1.5"/>
        <text x="${x + bw / 2}" y="${o.s ? 36 : 42}" class="fig-box">${o.t}</text>${o.s ? `<text x="${x + bw / 2}" y="54" class="fig-box-s">${o.s}</text>` : ""}</g>` +
        (i < n - 1 ? `<path d="M${x + bw + 4} ${h / 2} L${x + bw + gap - 6} ${h / 2}" stroke="var(--text-faint)" stroke-width="2" class="draw" marker-end="url(#fa${uid})"/>${dot(`M${x + bw + 2} ${h / 2} L${x + bw + gap - 4} ${h / 2}`, "var(--blue)", { dur: 1.2, begin: 0.6 + i * 0.3, r: 3.5 })}` : "");
    }).join("");
    const back = loop ? `<path d="M${w - 4 - bw / 2} ${h - 10} C ${w - 4 - bw / 2} ${h + 26}, ${4 + bw / 2} ${h + 26}, ${4 + bw / 2} ${h - 8}" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#fl${uid})"/>${dot(`M${w - 4 - bw / 2} ${h - 10} C ${w - 4 - bw / 2} ${h + 26}, ${4 + bw / 2} ${h + 26}, ${4 + bw / 2} ${h - 8}`, "var(--violet)", { dur: 2.4, begin: 0.6 + n * 0.3 })}<text x="${w / 2}" y="${h + 28}" class="fig-sub" style="fill:var(--violet)">repeat</text>` : "";
    uid++;
    return `<svg class="fig" viewBox="0 0 ${w} ${loop ? h + 36 : h}" style="max-height:${loop ? 150 : 110}px"><defs>
      <marker id="fa${uid - 1}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker>
      <marker id="fl${uid - 1}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--violet)"/></marker></defs>${box}${back}</svg>`;
  }

  /** Circular loop (e.g. the EA generation loop). items: ["text" | {t,c}] */
  function cycle(items, { center = "" } = {}) {
    const n = items.length, R = 92, cx = 150, cy = 120;
    const pos = items.map((_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    const id = "cy" + ++uid;
    const arcs = pos.map(([x, y], i) => {
      const [x2, y2] = pos[(i + 1) % n], a1 = Math.atan2(y - cy, x - cx) + 0.36, a2 = Math.atan2(y2 - cy, x2 - cx) - 0.36;
      const s = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)], e = [cx + R * Math.cos(a2), cy + R * Math.sin(a2)];
      return `<path d="M${s[0]} ${s[1]} A ${R} ${R} 0 0 1 ${e[0]} ${e[1]}" fill="none" stroke="var(--text-faint)" stroke-width="2" class="draw" marker-end="url(#${id})"/>${dot(`M${s[0]} ${s[1]} A ${R} ${R} 0 0 1 ${e[0]} ${e[1]}`, "var(--teal)", { dur: 1.4, begin: 0.6 + i * 1.4 / 1, r: 4 })}`;
    }).join("");
    const nodes = items.map((it, i) => {
      const o = typeof it === "string" ? { t: it } : it, [x, y] = pos[i], c = col(o.c || "teal");
      return `<g class="fi"><rect x="${x - 58}" y="${y - 17}" width="116" height="34" rx="17" fill="color-mix(in srgb, ${c} 14%, var(--panel-2))" stroke="${c}" stroke-width="1.5"/><text x="${x}" y="${y + 5}" class="fig-box" style="font-size:12.5px">${o.t}</text></g>`;
    }).join("");
    return `<svg class="fig" viewBox="0 0 300 240" style="max-height:240px"><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>${arcs}${nodes}${center ? `<text x="${cx}" y="${cy + 5}" class="fig-sub" style="font-size:13px;fill:var(--text-dim)">${center}</text>` : ""}</svg>`;
  }

  /** Horizontal bars (HTML). items: [[label, value, color?, note?]] opts: {max, fmt} */
  function bars(items, { max, fmt = (v) => (Number.isInteger(v) ? v : v.toFixed(1)), unit = "" } = {}) {
    const hi = max || Math.max(...items.map((i) => i[1]), 1e-9);
    return `<div class="fig-bars">${items.map(([l, v, c, note]) => `<div class="fb-row fi"><span class="fb-l">${l}</span><span class="fb-track"><span class="fb-fill" style="--w:${Math.max(0.005, v / hi)};background:${col(c)}"></span></span><span class="fb-v">${fmt(v)}${unit}${note ? ` <small>${note}</small>` : ""}</span></div>`).join("")}</div>`;
  }

  /** Side-by-side comparison. a, b: {title, c, body} */
  const compare = (a, b) => `<div class="fig-compare">${[a, b].map((x) => `<div class="fc fi" style="--c:${col(x.c)}"><div class="fc-h">${x.title}</div><div class="fc-b">${x.body}</div></div>`).join('<div class="fc-vs">vs</div>')}</div>`;

  /** Row of cells (arrays, bits, tokens). cells: [v | {v, c, sub}] */
  const cells = (arr, { label = "", size = 34 } = {}) => `<div class="fig-cells">${label ? `<span class="fcl">${label}</span>` : ""}${arr.map((x) => { if (typeof x === "string" && /^[^\w\s]{1,2}$|^(vs|or|and)$/.test(x)) return `<span class="op fi">${x}</span>`; const o = typeof x === "object" && x !== null ? x : { v: x }; return `<span class="cell fi" style="--c:${o.c ? col(o.c) : "var(--line-2)"};min-width:${size}px;${o.c ? `background:color-mix(in srgb, ${col(o.c)} 16%, var(--panel-2))` : ""}">${o.v}${o.sub !== undefined ? `<small>${o.sub}</small>` : ""}</span>`; }).join("")}</div>`;

  /** Line plot. series: [{f | pts, c, dash, label}], opts: {x:[a,b], y:[lo,hi], marks:[[x, label, c]], w, h, xl, yl, fill} */
  function plot(series, { x = [0, 1], y, marks = [], w = 520, h = 190, xl = "", yl = "", n = 160, vlines = [] } = {}) {
    const pad = { l: 34, r: 12, t: 14, b: 26 };
    const S = series.map((s) => ({ ...s, pts: s.pts || Array.from({ length: n + 1 }, (_, i) => { const xv = x[0] + ((x[1] - x[0]) * i) / n; return [xv, s.f(xv)]; }) }));
    const ys = S.flatMap((s) => s.pts.map((p) => p[1])).filter(Number.isFinite);
    const [lo, hi] = y || [Math.min(0, ...ys), Math.max(...ys) * 1.08 || 1];
    const X = (v) => pad.l + ((v - x[0]) / (x[1] - x[0])) * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b);
    const paths = S.map((s) => {
      const d = s.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(Math.max(lo, Math.min(hi, p[1]))).toFixed(1)}`).join(" ");
      const area = s.fill ? `<path d="${d} L${X(s.pts[s.pts.length - 1][0])} ${Y(lo)} L${X(s.pts[0][0])} ${Y(lo)} Z" fill="color-mix(in srgb, ${col(s.c)} 12%, transparent)" class="fi"/>` : "";
      const tr = s === S[0] && !s.dash ? dot(d, col(s.c), { dur: 3.2, begin: 1, r: 5 }) : "";
      return `${area}<path d="${d}" fill="none" stroke="${col(s.c)}" stroke-width="${s.width || 2.5}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""} class="draw" stroke-linejoin="round"/>${tr}` +
        (s.label ? `<text x="${X(s.pts[s.pts.length - 1][0]) - 4}" y="${Y(s.pts[s.pts.length - 1][1]) - 8}" class="fig-sub" style="fill:${col(s.c)};text-anchor:end">${s.label}</text>` : "");
    }).join("");
    const vl = vlines.map(([xv, lbl, c, dy = 0]) => `<line x1="${X(xv)}" y1="${pad.t}" x2="${X(xv)}" y2="${h - pad.b}" stroke="${col(c || "dim")}" stroke-dasharray="4 4"/>${lbl ? `<text x="${X(xv) + 4}" y="${pad.t + 10 + dy}" class="fig-sub" style="text-anchor:start;fill:${col(c || "text-faint")}">${lbl}</text>` : ""}`).join("");
    const mk = marks.map(([xv, lbl, c, yv]) => { const s0 = S[0], yy = yv ?? (s0.f ? s0.f(xv) : 0); return `<g class="fi"><circle cx="${X(xv)}" cy="${Y(yy)}" r="6" fill="${col(c)}"/>${lbl ? `<text x="${X(xv)}" y="${Y(yy) - 12}" class="fig-sub" style="fill:${col(c)}">${lbl}</text>` : ""}</g>`; }).join("");
    return `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:${h}px">
      <line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="var(--line-2)"/><line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${h - pad.b}" stroke="var(--line-2)"/>
      ${xl ? `<text x="${w - pad.r}" y="${h - 6}" class="fig-sub" style="text-anchor:end">${xl}</text>` : ""}${yl ? `<text x="${pad.l + 4}" y="${pad.t + 2}" class="fig-sub" style="text-anchor:start">${yl}</text>` : ""}
      ${vl}${paths}${mk}</svg>`;
  }

  /** Numbered mini-storyboard: frames = [{t, v(html)}] shown as a row of panels. */
  const frames = (fs) => `<div class="fig-frames">${fs.map((f, i) => `<div class="ff fi"><div class="ff-n">${i + 1}</div>${f.v || ""}<div class="ff-t">${f.t}</div></div>`).join("")}</div>`;

  /**
   * Interactive 3-D surface on canvas. Drag to rotate, auto-rotates gently until touched.
   * opts: {f(x,y)->z, x:[a,b], y:[a,b], n, height, points:[{x,y,c,label}], path:[[x,y],…], zLabel}
   * Returns {setPoints(pts), setPath(path), redraw()}.
   */
  function surfaceCanvas(container, life, opts) {
    const o = { n: 34, height: 320, x: [0, 1], y: [0, 1], ...opts };
    const cv = document.createElement("canvas");
    cv.className = "viz surface3d";
    cv.setAttribute("aria-label", opts.label || "3D surface — drag to rotate");
    container.appendChild(cv);
    const hint = document.createElement("div");
    hint.className = "surface-hint";
    hint.textContent = "drag to rotate";
    container.appendChild(hint);
    let yaw = -0.7, pitch = 0.62, auto = !NIC.fx.reduce(), dragging = null;
    let pts = o.points || [], path = o.path || [];
    const Z = []; let zmin = Infinity, zmax = -Infinity;
    for (let i = 0; i <= o.n; i++) { Z[i] = []; for (let j = 0; j <= o.n; j++) { const xv = o.x[0] + ((o.x[1] - o.x[0]) * i) / o.n, yv = o.y[0] + ((o.y[1] - o.y[0]) * j) / o.n, z = o.f(xv, yv); Z[i][j] = z; zmin = Math.min(zmin, z); zmax = Math.max(zmax, z); } }
    const nz = (z) => (z - zmin) / (zmax - zmin || 1);
    const toU = (xv, yv) => [((xv - o.x[0]) / (o.x[1] - o.x[0])) - 0.5, ((yv - o.y[0]) / (o.y[1] - o.y[0])) - 0.5];
    function proj(u, v, z, W, H) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const X1 = u * cy - v * sy, Y1 = u * sy + v * cy, Zh = (z - 0.5) * 0.55;
      const Yv = Y1 * cp - Zh * sp, depth = Y1 * sp + Zh * cp;
      const s = Math.min(W, H * 1.5) * 0.95, persp = 1 / (1 + depth * 0.35);
      return [W / 2 + X1 * s * persp, H / 2 + 10 + Yv * s * persp * 0.9, depth];
    }
    const lerp = (a, b, t) => a + (b - a) * t;
    const shade = (t, light) => { // blue (low) → green (high) → gold (peak)
      const c = t < 0.6 ? [lerp(110, 120, t / 0.6), lerp(190, 214, t / 0.6), lerp(245, 70, t / 0.6)] : [lerp(120, 255, (t - 0.6) / 0.4), lerp(214, 196, (t - 0.6) / 0.4), lerp(70, 0, (t - 0.6) / 0.4)];
      return `rgb(${(c[0] * light) | 0},${(c[1] * light) | 0},${(c[2] * light) | 0})`;
    };
    function draw() {
      if (!cv.isConnected) return; // replaced by the three.js version
      const { ctx, w: W, h: H } = NIC.setupCanvas(cv, o.height);
      ctx.clearRect(0, 0, W, H);
      const quads = [];
      for (let i = 0; i < o.n; i++) for (let j = 0; j < o.n; j++) {
        const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => proj(a / o.n - 0.5, b / o.n - 0.5, nz(Z[a][b]), W, H));
        const zavg = (nz(Z[i][j]) + nz(Z[i + 1][j]) + nz(Z[i + 1][j + 1]) + nz(Z[i][j + 1])) / 4;
        const slope = Math.abs(nz(Z[i + 1][j]) - nz(Z[i][j])) + Math.abs(nz(Z[i][j + 1]) - nz(Z[i][j]));
        quads.push({ corners, d: corners.reduce((s, c) => s + c[2], 0), zavg, light: Math.max(0.55, 1 - slope * 2.2) });
      }
      quads.sort((a, b) => b.d - a.d);
      quads.forEach((q) => {
        ctx.beginPath(); q.corners.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        ctx.fillStyle = shade(q.zavg, q.light); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 0.6; ctx.stroke();
      });
      if (path.length > 1) {
        ctx.beginPath();
        path.forEach(([xv, yv], k) => { const [u, v] = toU(xv, yv); const [px, py] = proj(u, v, nz(o.f(xv, yv)) + 0.02, W, H); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
        ctx.strokeStyle = NIC.colors().text; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      }
      pts.forEach((p) => {
        const [u, v] = toU(p.x, p.y), z = nz(o.f(p.x, p.y));
        const [px, py] = proj(u, v, z + 0.03, W, H), [bx, by] = proj(u, v, 0, W, H);
        ctx.strokeStyle = "rgba(75,75,75,0.35)"; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, p.r || 6, 0, 7); ctx.fillStyle = p.c || "#fff"; ctx.fill();
        ctx.strokeStyle = NIC.colors().panel; ctx.lineWidth = 2.5; ctx.stroke();
        if (p.label) { ctx.font = "600 12px " + getComputedStyle(document.documentElement).getPropertyValue("--sans"); ctx.fillStyle = NIC.colors().text; ctx.textAlign = "center"; ctx.fillText(p.label, px, py - 12); }
      });
    }
    const stopAuto = () => { if (auto) { auto = false; hint.style.opacity = "0"; } };
    cv.addEventListener("pointerdown", (e) => { stopAuto(); dragging = { x: e.clientX, y: e.clientY, yaw, pitch }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (!dragging) return; yaw = dragging.yaw + (e.clientX - dragging.x) * 0.01; pitch = Math.max(0.15, Math.min(1.35, dragging.pitch + (e.clientY - dragging.y) * 0.008)); draw(); });
    const end = () => (dragging = null);
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    const loop = () => { if (!cv.isConnected) return; if (auto) { yaw += 0.0035; draw(); } life.frame(loop); };
    draw(); life.frame(loop); life.onResize(draw);
    return { setPoints(p) { pts = p; draw(); }, setPath(p) { path = p; draw(); }, redraw: draw };
  }

  /**
   * Interactive 3-D surface. Draws at once with the canvas renderer above, then upgrades to a lit three.js mesh
   * (lazy-loaded) when WebGL is available. Same options and return value either way.
   */
  function surface3d(container, life, opts) {
    const holder = document.createElement("div");
    holder.className = "surface-box";
    container.appendChild(holder);
    let impl = surfaceCanvas(holder, life, opts), dead = false;
    life.onCleanup(() => (dead = true));
    const api = { setPoints(p) { opts = { ...opts, points: p }; impl.setPoints(p); }, setPath(p) { opts = { ...opts, path: p }; impl.setPath(p); }, redraw: () => impl.redraw() };
    const gl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
    if (gl && NIC.lazy) NIC.lazy("vendor/three.min.js").then(() => {
      if (dead || !holder.isConnected || !window.THREE) return;
      const next = surfaceGL(holder, life, opts);
      if (next) impl = next;
    }).catch(() => {});
    return api;
  }

  function surfaceGL(holder, life, opts) {
    const T = window.THREE, o = { height: 320, x: [0, 1], y: [0, 1], ...opts, n: Math.max(48, opts.n || 0) };
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
    holder.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "viz surface3d surface-gl";
    wrap.style.height = o.height + "px";
    wrap.setAttribute("aria-label", opts.label || "3D surface: drag to rotate");
    holder.appendChild(wrap);
    const hint = document.createElement("div"); hint.className = "surface-hint"; hint.textContent = "drag to rotate"; holder.appendChild(hint);
    const labels = document.createElement("div"); labels.className = "surface-labels";
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    wrap.appendChild(renderer.domElement); wrap.appendChild(labels);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, 0.05, 20);
    scene.add(new T.HemisphereLight(0xffffff, 0x9aa7b0, 1.1));
    const sun = new T.DirectionalLight(0xffffff, 1.4); sun.position.set(1.2, 2.2, 0.8); scene.add(sun);

    // height field → mesh, with the same blue → green → gold ramp as the canvas version
    const n = o.n, H = 0.55, geo = new T.PlaneGeometry(1, 1, n, n);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, Z = [];
    let zmin = Infinity, zmax = -Infinity;
    for (let k = 0; k < pos.count; k++) {
      const u = pos.getX(k) + 0.5, v = pos.getZ(k) + 0.5;
      const z = o.f(o.x[0] + (o.x[1] - o.x[0]) * u, o.y[0] + (o.y[1] - o.y[0]) * v);
      Z.push(z); zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
    }
    const nz = (z) => (z - zmin) / (zmax - zmin || 1);
    const cols = new Float32Array(pos.count * 3), lerp = (a, b, t) => a + (b - a) * t;
    const ramp = (t) => (t < 0.6 ? [lerp(110, 120, t / 0.6), lerp(190, 214, t / 0.6), lerp(245, 70, t / 0.6)] : [lerp(120, 255, (t - 0.6) / 0.4), lerp(214, 196, (t - 0.6) / 0.4), lerp(70, 0, (t - 0.6) / 0.4)]).map((c) => c / 255);
    for (let k = 0; k < pos.count; k++) { const t = nz(Z[k]); pos.setY(k, t * H); const c = ramp(t); cols[k * 3] = c[0]; cols[k * 3 + 1] = c[1]; cols[k * 3 + 2] = c[2]; }
    geo.setAttribute("color", new T.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide }));
    const wire = new T.LineSegments(new T.WireframeGeometry(geo), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
    const base = new T.Mesh(new T.PlaneGeometry(1.08, 1.08).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: new T.Color(NIC.colors().panel_2), transparent: true, opacity: 0.7 }));
    base.position.y = -0.004;
    scene.add(base, mesh, wire);

    // points + path live in their own group so they can be swapped
    const extra = new T.Group(); scene.add(extra);
    const toW = (xv, yv, lift = 0) => new T.Vector3((xv - o.x[0]) / (o.x[1] - o.x[0]) - 0.5, nz(o.f(xv, yv)) * H + lift, (yv - o.y[0]) / (o.y[1] - o.y[0]) - 0.5);
    let pts = o.points || [], path = o.path || [], tags = [];
    let yaw = -0.7, pitch = 0.62, auto = !NIC.fx.reduce(), drag = null, dirty = true, W = 0;
    const disposeGroup = () => { extra.children.slice().forEach((c) => { extra.remove(c); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); };
    function rebuild() {
      disposeGroup(); labels.innerHTML = ""; tags = [];
      if (path.length > 1) {
        const curve = new T.CatmullRomCurve3(path.map(([xv, yv]) => toW(xv, yv, 0.012)));
        extra.add(new T.Mesh(new T.TubeGeometry(curve, Math.max(16, path.length * 6), 0.006, 6, false), new T.MeshBasicMaterial({ color: new T.Color(NIC.colors().text) })));
      }
      pts.forEach((p) => {
        const w = toW(p.x, p.y, 0.02), r = ((p.r || 6) / 6) * 0.022;
        const ball = new T.Mesh(new T.SphereGeometry(r, 20, 14), new T.MeshLambertMaterial({ color: new T.Color(p.c || "#ffffff") }));
        ball.position.copy(w); extra.add(ball);
        const ring = new T.Mesh(new T.SphereGeometry(r * 1.4, 20, 14), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: T.BackSide }));
        ring.position.copy(w); extra.add(ring);
        const stem = new T.BufferGeometry().setFromPoints([new T.Vector3(w.x, 0, w.z), w]);
        extra.add(new T.Line(stem, new T.LineBasicMaterial({ color: new T.Color(NIC.colors().text), transparent: true, opacity: 0.35 })));
        if (p.label) { const d = document.createElement("span"); d.textContent = p.label; labels.appendChild(d); tags.push([d, w.clone().add(new T.Vector3(0, r + 0.03, 0))]); }
      });
      dirty = true;
    }

    // orbit by dragging; auto-rotates until touched
    const stopAuto = () => { if (auto) { auto = false; hint.style.opacity = "0"; } };
    const cv = renderer.domElement;
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", (e) => { stopAuto(); drag = { x: e.clientX, y: e.clientY, yaw, pitch }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (!drag) return; yaw = drag.yaw - (e.clientX - drag.x) * 0.01; pitch = Math.max(0.12, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008)); dirty = true; });
    const end = () => (drag = null);
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    function size() { W = wrap.clientWidth || 480; renderer.setSize(W, o.height, false); cv.style.width = "100%"; cv.style.height = o.height + "px"; cam.aspect = W / o.height; cam.updateProjectionMatrix(); dirty = true; }
    function render() {
      const R = 1.6 / Math.min(1, cam.aspect * 0.75);
      cam.position.set(Math.sin(yaw) * Math.cos(pitch) * R, 0.1 + Math.sin(pitch) * R, Math.cos(yaw) * Math.cos(pitch) * R);
      cam.lookAt(0, 0.1, 0);
      renderer.render(scene, cam);
      tags.forEach(([d, w]) => { const v = w.clone().project(cam); d.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * o.height}px) translate(-50%, -100%)`; });
      dirty = false;
    }
    const loop = () => { if (!wrap.isConnected) return; if (auto) { yaw += 0.0035; dirty = true; } if (dirty) render(); life.frame(loop); };
    size(); rebuild(); render(); life.frame(loop); life.onResize(size);
    life.onCleanup(() => { disposeGroup(); geo.dispose(); mesh.material.dispose(); wire.geometry.dispose(); wire.material.dispose(); base.geometry.dispose(); base.material.dispose(); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); });
    return { setPoints(p) { pts = p || []; rebuild(); }, setPath(p) { path = p || []; rebuild(); }, redraw: () => (dirty = true) };
  }

  NIC.fig = { graph, flow, cycle, bars, compare, cells, plot, frames, surface3d };
  NIC.term = term;
})();
