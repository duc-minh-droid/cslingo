(function () {
  const N = NIC;
  const { esc } = N;
  /* A figure with nothing to pick is a picture: role="img" and a description. One with parts to pick keeps them as buttons
     (each labelled below), so it is a group with the description as its name. */
  const named = (pick, label) => ` role="${pick ? "group" : "img"}" aria-label="${esc(label)}"`;

  /* ---------- figure helpers for "pick" questions (fresh diagrams, not the lesson ones) ---------- */
  const Qf = {};
  /** Graph. nodes {A:[x,y]}, edges [[a,b,w?]]. pick: "nodes" | "edges" | null. directed arrows optional. */
  Qf.graph = (nodes, edges, { pick = null, w = 460, h = 260, directed = false, r = 19, hl = {} } = {}) => {
    const id = "qg" + Math.random().toString(36).slice(2, 7);
    const ed = edges
      .map(([a, b, wt]) => {
        const [x1, y1] = nodes[a],
          [x2, y2] = nodes[b],
          dx = x2 - x1,
          dy = y2 - y1,
          L = Math.hypot(dx, dy);
        const sx = x1 + (dx / L) * r,
          sy = y1 + (dy / L) * r,
          ex = x2 - (dx / L) * (r + (directed ? 5 : 0)),
          ey = y2 - (dy / L) * (r + (directed ? 5 : 0));
        const mx = (x1 + x2) / 2 - (dy / L) * 12,
          my = (y1 + y2) / 2 + (dx / L) * 12,
          c = hl[`${a}-${b}`] || "var(--line-2)";
        const vis = `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${c}" stroke-width="3" stroke-linecap="round" ${directed ? `marker-end="url(#${id})"` : ""}/>`;
        const lbl =
          wt !== undefined
            ? `<text x="${mx}" y="${my + 4}" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-dim)">${wt}</text>`
            : "";
        return pick === "edges"
          ? `<g data-pick="${a}-${b}" aria-label="${esc(`Edge ${a} to ${b}${wt !== undefined ? `, weight ${wt}` : ""}`)}">${vis}<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="transparent" stroke-width="18"/>${lbl}</g>`
          : vis + lbl;
      })
      .join("");
    const nd = Object.entries(nodes)
      .map(
        ([k, [x, y]]) =>
          `<g ${pick === "nodes" ? `data-pick="${k}" aria-label="${esc(`Node ${k}`)}"` : ""}><circle cx="${x}" cy="${y}" r="${r}" fill="var(--panel)" stroke="${hl[k] || "var(--line-2)"}" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 15px var(--sans);fill:var(--ink)">${k}</text></g>`,
      )
      .join("");
    const says = `${directed ? "Directed graph" : "Graph"} with nodes ${Object.keys(nodes).join(", ")}. Edges: ${edges.map(([a, b, wt]) => `${a} to ${b}${wt !== undefined ? ` (${wt})` : ""}`).join(", ") || "none"}.${Object.keys(hl).length ? ` Highlighted: ${Object.keys(hl).join(", ")}.` : ""}`;
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"${named(pick, says)}><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)"/></marker></defs>${ed}${nd}</svg>`;
  };
  /** Points on a grid (maths coordinates, y up). P = {A:[x,y]}; range [0..max]. */
  Qf.points = (P, { max = 8, w = 420, h = 320, pick = true, poly = null } = {}) => {
    const X = (x) => 30 + (x / max) * (w - 50),
      Y = (y) => h - 30 - (y / max) * (h - 50);
    const grid = Array.from(
      { length: max + 1 },
      (_, i) =>
        `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(max)}" stroke="var(--line)"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(max)}" y2="${Y(i)}" stroke="var(--line)"/><text x="${X(i)}" y="${Y(0) + 16}" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">${i}</text><text x="${X(0) - 10}" y="${Y(i) + 4}" text-anchor="end" style="font:700 11px var(--sans);fill:var(--text-faint)">${i}</text>`,
    ).join("");
    const pl = poly
      ? `<polygon points="${poly.map((n) => `${X(P[n][0])},${Y(P[n][1])}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2"/>`
      : "";
    const pts = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g ${pick ? `data-pick="${k}" aria-label="${esc(`Point ${k} at (${x}, ${y})`)}"` : ""}><circle cx="${X(x)}" cy="${Y(y)}" r="11" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${X(x)}" y="${Y(y) + 4}" text-anchor="middle" style="font:900 11px var(--sans);fill:var(--ink)">${k}</text></g>`,
      )
      .join("");
    const says = `Points on a grid from 0 to ${max} across and up: ${Object.entries(P)
      .map(([k, [x, y]]) => `${k} at (${x}, ${y})`)
      .join(", ")}.${poly ? ` Joined into a shape: ${poly.join(", ")}.` : ""}`;
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"${named(pick, says)}>${grid}${pl}${pts}</svg>`;
  };
  /** 1-D landscape with clickable candidate spots. f(x) on [0,1]; spots [[x, id]]; start marker at sx. */
  Qf.curve = (f, spots, { sx = null, w = 560, h = 200, label = "" } = {}) => {
    let lo = Infinity,
      hi = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const v = f(i / 200);
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    const X = (x) => 16 + x * (w - 32),
      Y = (v) => h - 24 - ((v - lo) / (hi - lo || 1)) * (h - 60);
    const d = Array.from(
      { length: 201 },
      (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(f(i / 200)).toFixed(1)}`,
    ).join(" ");
    const sp = spots
      .map(
        ([x, id]) =>
          `<g data-pick="${id}" aria-label="${esc(`Spot ${id}, ${Math.round(x * 100)}% of the way across`)}"><circle cx="${X(x)}" cy="${Y(f(x))}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${X(x)}" y="${Y(f(x)) + 5}" text-anchor="middle" style="font:900 12px var(--sans);fill:var(--ink)">${id}</text></g>`,
      )
      .join("");
    const st =
      sx !== null
        ? `<g><circle cx="${X(sx)}" cy="${Y(f(sx))}" r="8" fill="var(--rose)"/><text x="${X(sx)}" y="${Y(f(sx)) + 24}" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--rose-ink)">start</text></g>`
        : "";
    const says = `A curve with hills and dips${label ? `: ${label}` : ""}. Spots: ${spots.map(([x, id]) => `${id} at ${Math.round(x * 100)}% across`).join(", ")}.${sx !== null ? ` The start marker is at ${Math.round(sx * 100)}% across.` : ""}`;
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"${named(true, says)}><path d="${d} L${X(1)} ${h - 24} L${X(0)} ${h - 24} Z" fill="var(--teal-dim)"/><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="3"/>${st}${sp}${label ? `<text x="${w / 2}" y="${h - 4}" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">${label}</text>` : ""}</svg>`;
  };
  N.qfig = Qf;
})();
