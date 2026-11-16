/* Lecture 15 · MOPSO: the few drawing helpers shared by the scenes (VID.l15, short name L15). Everything else is reused from
   Lecture 13 (the page loads l5/common.js and l13/common*.js): L13.plot, L13.tag, L13.stat, L13.card, L13.label, L13.arrow,
   L13.mark, L13.seq (see their header comments). All calls are pure.

   COLOUR ROLES of THIS video (videos/_plan/lecture-15.json): green = archive / non-dominated / kept; red = dominated / removed /
   turned away; blue = the particle, the new position or newcomer looked at; purple = the 'keep oldest' pbest rule; orange =
   the 'keep newest' rule and attention (infinity, the chosen leader, crowding values); grey = neutral.

   L15.fmt([x, y]) -> "(4.5, 4)"
   L15.plot(stage, o) -> L13.plot preset: x 12, y 12, 600 x 616, axes 0..10 (both minimised), xl "time", yl "energy";
                         any L13.plot option in o overrides (dots, lines, boxes, links counts too).
   L15.inset(a, b, da, db) -> [a', b']: the segment a..b (px pairs) pulled in by da at a and db at b (for arrows between dots)
   L15.card(parent, o) -> L13.card that keeps newline (backslash n) line breaks (same set API)
   L15.step(t, t0, dt, n) -> integer 0..n: which item of a timed sequence is showing (t0 + i * dt starts item i)          */
(function () {
  const V = window.VID;
  const L15 = V.l15;
  const L13 = V.l13;

  L15.fmt = (p) => `(${p[0]}, ${p[1]})`;
  L15.plot = (stage, o = {}) =>
    L13.plot(stage, {
      x: 12,
      y: 12,
      w: 600,
      h: 616,
      xr: [0, 10],
      yr: [0, 10],
      xt: [0, 2, 4, 6, 8, 10],
      yt: [0, 2, 4, 6, 8, 10],
      xl: "time",
      yl: "energy",
      ...o,
    });
  L15.inset = (a, b, da, db) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const ux = (b[0] - a[0]) / L,
      uy = (b[1] - a[1]) / L;
    return [
      [a[0] + ux * da, a[1] + uy * da],
      [b[0] - ux * db, b[1] - uy * db],
    ];
  };
  /** L13.card whose text may hold "\n" line breaks (pre-line, line height 1.2). Same set() API. */
  L15.card = (parent, o) => {
    const c = L13.card(parent, o);
    Object.assign(c.el.style, {
      whiteSpace: "pre-line",
      lineHeight: "1.2",
      padding: "0 10px",
      boxSizing: "border-box",
    });
    return c;
  };
  L15.step = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt)));
})();
