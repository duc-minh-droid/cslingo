/* Lecture 1 · Reliable, scalable and maintainable systems: the SVG icons and marks (VID.d1, short name D1). Needs l5/common.js and
   d1/common.js, common-2.js loaded first. Everything is an SVG <g> at absolute coordinates (x, y = centre, size = about the
   height; append to your own L5.svg(parent) layer; V.place(g, {x, y, s, r, o}) moves, scales, rotates and fades it).
        D1.icon.server(x, y, size, tone)   D1.icon.disk   D1.icon.db (cylinder)   D1.icon.person   D1.icon.mailbox
        D1.icon.envelope (a tweet)         D1.icon.bolt (a fault)   D1.icon.bug   D1.icon.clock (stopwatch)
        D1.icon.moon / sun / gear / doc (a report) / wrench / spark (a burst: a cut, an alarm)
        D1.mark(kind, x, y, size, tone)    kind "times" | "plus" | "equals" | "minus" (use these instead of glyphs)
   Tone names: green, red, orange, blue, purple, grey (see common-2.js). */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const { f1, tn, D } = D1;
  const sw = (s, k = 0.06) => f1(Math.max(3, s * k));
  const fillOf = (t, name) => ({ fill: name === "grey" ? "var(--line-2)" : t.c, stroke: t.lip });
  const body = (tag, attrs, t, name, s) =>
    V.s(tag, {
      "stroke-width": sw(s),
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      ...attrs,
      style: fillOf(t, name),
    });
  const panel = (tag, attrs, s) =>
    V.s(tag, {
      "stroke-width": sw(s, 0.04),
      "stroke-linejoin": "round",
      ...attrs,
      style: { fill: "var(--panel)", stroke: "var(--line-2)" },
    });
  const line = (d, t, s, w = 0.06) =>
    V.s("path", {
      d,
      fill: "none",
      "stroke-width": sw(s, w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: t.lip },
    });
  const icon = {
    server(x, y, s, tone = "grey") {
      const t = D1.tone(tn(tone));
      const [w, h] = [0.74 * s, s];
      return V.s(
        "g",
        {},
        body(
          "rect",
          { x: f1(x - w / 2), y: f1(y - h / 2 + s * 0.06), width: f1(w), height: f1(h), rx: f1(s * 0.16) },
          t,
          "grey",
          s,
        ),
        body("rect", { x: f1(x - w / 2), y: f1(y - h / 2), width: f1(w), height: f1(h), rx: f1(s * 0.16) }, t, tone, s),
        panel(
          "rect",
          { x: f1(x - w * 0.34), y: f1(y - h * 0.34), width: f1(w * 0.68), height: f1(h * 0.18), rx: f1(s * 0.05) },
          s,
        ),
        panel(
          "rect",
          { x: f1(x - w * 0.34), y: f1(y - h * 0.08), width: f1(w * 0.68), height: f1(h * 0.18), rx: f1(s * 0.05) },
          s,
        ),
        V.s("circle", {
          cx: f1(x - w * 0.22),
          cy: f1(y + h * 0.32),
          r: f1(s * 0.055),
          style: { fill: "var(--panel)" },
        }),
      );
    },
    disk(x, y, s, tone = "grey") {
      const t = D1.tone(tn(tone));
      return V.s(
        "g",
        {},
        body("circle", { cx: f1(x), cy: f1(y + s * 0.05), r: f1(s * 0.5) }, t, "grey", s),
        body("circle", { cx: f1(x), cy: f1(y), r: f1(s * 0.5) }, t, tone, s),
        panel("circle", { cx: f1(x), cy: f1(y), r: f1(s * 0.2) }, s),
        V.s("circle", { cx: f1(x), cy: f1(y), r: f1(s * 0.06), style: { fill: t.lip } }),
      );
    },
    db(x, y, s, tone = "grey") {
      const t = D1.tone(tn(tone));
      const [rx, ry, h] = [0.42 * s, 0.14 * s, 0.82 * s];
      const [top, bot] = [y - h / 2, y + h / 2];
      const side = D(
        "M",
        [x - rx, top],
        "L",
        [x - rx, bot],
        "A",
        rx,
        ry,
        "0",
        "0",
        "0",
        [x + rx, bot],
        "L",
        [x + rx, top],
        "Z",
      );
      const ring = (yy) => D("M", [x - rx, yy], "A", rx, ry, "0", "0", "0", [x + rx, yy]);
      return V.s(
        "g",
        {},
        body("path", { d: side }, t, tone, s),
        body("ellipse", { cx: f1(x), cy: f1(top), rx: f1(rx), ry: f1(ry) }, t, tone, s),
        line(ring(y - h * 0.12), t, s, 0.045),
        line(ring(y + h * 0.24), t, s, 0.045),
      );
    },
    person(x, y, s, tone = "grey") {
      const t = D1.tone(tn(tone));
      const shoulders = D(
        "M",
        [x - 0.4 * s, y + 0.5 * s],
        "C",
        [x - 0.4 * s, y + 0.06 * s],
        [x + 0.4 * s, y + 0.06 * s],
        [x + 0.4 * s, y + 0.5 * s],
        "Z",
      );
      return V.s(
        "g",
        {},
        body("path", { d: shoulders }, t, tone, s),
        body("circle", { cx: f1(x), cy: f1(y - 0.24 * s), r: f1(0.2 * s) }, t, tone, s),
      );
    },
    envelope(x, y, s, tone = "blue") {
      const t = D1.tone(tn(tone));
      const [w, h] = [0.9 * s, 0.62 * s];
      return V.s(
        "g",
        {},
        body("rect", { x: f1(x - w / 2), y: f1(y - h / 2), width: f1(w), height: f1(h), rx: f1(s * 0.1) }, t, tone, s),
        line(
          D("M", [x - w / 2 + s * 0.04, y - h / 2 + s * 0.06], "L", [x, y + h * 0.08], "L", [
            x + w / 2 - s * 0.04,
            y - h / 2 + s * 0.06,
          ]),
          t,
          s,
          0.05,
        ),
      );
    },
    mailbox(x, y, s, tone = "purple") {
      const t = D1.tone(tn(tone));
      const [w, h] = [0.9 * s, 0.62 * s];
      const [x0, y0] = [x - w / 2 - s * 0.04, y - h / 2 + s * 0.12];
      const dome = D(
        "M",
        [x0, y0 + h],
        "L",
        [x0, y0 + h * 0.4],
        "A",
        w / 2,
        h * 0.4,
        "0",
        "0",
        "1",
        [x0 + w, y0 + h * 0.4],
        "L",
        [x0 + w, y0 + h],
        "Z",
      );
      return V.s(
        "g",
        {},
        body("path", { d: dome }, t, tone, s),
        panel(
          "rect",
          { x: f1(x0 + w * 0.2), y: f1(y0 + h * 0.52), width: f1(w * 0.6), height: f1(s * 0.07), rx: f1(s * 0.03) },
          s,
        ),
        line(D("M", [x0 + w + s * 0.1, y0 + h], "L", [x0 + w + s * 0.1, y0 - s * 0.06]), t, s, 0.06),
        body(
          "rect",
          { x: f1(x0 + w + s * 0.1), y: f1(y0 - s * 0.08), width: f1(s * 0.2), height: f1(s * 0.14), rx: f1(s * 0.03) },
          D1.tone("orange"),
          "orange",
          s,
        ),
      );
    },
    bolt(x, y, s, tone = "orange") {
      const t = D1.tone(tn(tone));
      const pts = [
        [0.12, -0.5],
        [-0.32, 0.06],
        [-0.03, 0.06],
        [-0.14, 0.5],
        [0.32, -0.14],
        [0.04, -0.14],
      ];
      const d = D(
        "M",
        [x + pts[0][0] * s, y + pts[0][1] * s],
        ...pts.slice(1).flatMap((p) => ["L", [x + p[0] * s, y + p[1] * s]]),
        "Z",
      );
      return V.s("g", {}, body("path", { d }, t, tone, s));
    },
    bug(x, y, s, tone = "red") {
      const t = D1.tone(tn(tone));
      const legs = [-0.2, 0.05, 0.3].flatMap((dy) => [
        line(D("M", [x - 0.2 * s, y + dy * s], "L", [x - 0.46 * s, y + (dy - 0.1) * s]), t, s, 0.06),
        line(D("M", [x + 0.2 * s, y + dy * s], "L", [x + 0.46 * s, y + (dy - 0.1) * s]), t, s, 0.06),
      ]);
      return V.s(
        "g",
        {},
        ...legs,
        line(
          D("M", [x - 0.08 * s, y - 0.4 * s], "L", [x - 0.2 * s, y - 0.56 * s], "M", [x + 0.08 * s, y - 0.4 * s], "L", [
            x + 0.2 * s,
            y - 0.56 * s,
          ]),
          t,
          s,
          0.06,
        ),
        body("ellipse", { cx: f1(x), cy: f1(y + 0.08 * s), rx: f1(0.27 * s), ry: f1(0.38 * s) }, t, tone, s),
        body("circle", { cx: f1(x), cy: f1(y - 0.34 * s), r: f1(0.15 * s) }, t, tone, s),
        line(D("M", [x, y - 0.18 * s], "L", [x, y + 0.42 * s]), t, s, 0.04),
      );
    },
    clock(x, y, s, tone = "blue") {
      const t = D1.tone(tn(tone));
      return V.s(
        "g",
        {},
        body(
          "rect",
          { x: f1(x - 0.1 * s), y: f1(y - 0.62 * s), width: f1(0.2 * s), height: f1(0.14 * s), rx: f1(0.03 * s) },
          t,
          tone,
          s,
        ),
        body("circle", { cx: f1(x), cy: f1(y), r: f1(0.46 * s) }, t, tone, s),
        panel("circle", { cx: f1(x), cy: f1(y), r: f1(0.34 * s) }, s),
        line(D("M", [x, y], "L", [x, y - 0.24 * s]), t, s, 0.07),
        line(D("M", [x, y], "L", [x + 0.17 * s, y + 0.1 * s]), t, s, 0.07),
      );
    },
    moon(x, y, s, tone = "purple") {
      const t = D1.tone(tn(tone));
      const r = 0.46 * s;
      const d = D(
        "M",
        [x + 0.12 * s, y - r],
        "A",
        r,
        r,
        "0",
        "1",
        "0",
        [x + 0.38 * s, y + 0.28 * s],
        "A",
        r * 0.8,
        r * 0.8,
        "0",
        "0",
        "1",
        [x + 0.12 * s, y - r],
        "Z",
      );
      return V.s("g", {}, body("path", { d }, t, tone, s));
    },
    sun(x, y, s, tone = "orange") {
      const t = D1.tone(tn(tone));
      const rays = Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        return line(
          D("M", [x + Math.cos(a) * 0.36 * s, y + Math.sin(a) * 0.36 * s], "L", [
            x + Math.cos(a) * 0.5 * s,
            y + Math.sin(a) * 0.5 * s,
          ]),
          t,
          s,
          0.07,
        );
      });
      return V.s("g", {}, ...rays, body("circle", { cx: f1(x), cy: f1(y), r: f1(0.24 * s) }, t, tone, s));
    },
    gear(x, y, s, tone = "orange") {
      const t = D1.tone(tn(tone));
      const d = Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        const pt = (da, r) => [x + r * s * Math.cos(a + da), y + r * s * Math.sin(a + da)];
        const w = (Math.PI / 180) * 11;
        return D(
          k ? "L" : "M",
          pt(-w * 1.5, 0.3),
          "L",
          pt(-w * 0.8, 0.46),
          "L",
          pt(w * 0.8, 0.46),
          "L",
          pt(w * 1.5, 0.3),
        );
      }).join(" ");
      return V.s(
        "g",
        {},
        body("path", { d: `${d} Z` }, t, tone, s),
        panel("circle", { cx: f1(x), cy: f1(y), r: f1(0.13 * s) }, s),
      );
    },
    doc(x, y, s, tone = "green") {
      const t = D1.tone(tn(tone));
      const [w, h] = [0.68 * s, 0.9 * s];
      const [x0, y0] = [x - w / 2, y - h / 2];
      const d = D(
        "M",
        [x0, y0],
        "L",
        [x0 + w * 0.7, y0],
        "L",
        [x0 + w, y0 + h * 0.26],
        "L",
        [x0 + w, y0 + h],
        "L",
        [x0, y0 + h],
        "Z",
      );
      const row = (k, len) =>
        line(
          D("M", [x0 + w * 0.2, y0 + h * (0.45 + 0.15 * k)], "L", [x0 + w * (0.2 + len), y0 + h * (0.45 + 0.15 * k)]),
          t,
          s,
          0.06,
        );
      return V.s("g", {}, body("path", { d }, t, tone, s), row(0, 0.6), row(1, 0.6), row(2, 0.36));
    },
    wrench(x, y, s, tone = "grey") {
      const t = D1.tone(tn(tone));
      const d = D(
        "M",
        [x - 0.3 * s, y + 0.5 * s],
        "L",
        [x + 0.06 * s, y - 0.02 * s],
        "A",
        0.22 * s,
        0.22 * s,
        "0",
        "1",
        "1",
        [x + 0.28 * s, y - 0.34 * s],
        "L",
        [x + 0.16 * s, y - 0.2 * s],
        "L",
        [x + 0.2 * s, y - 0.06 * s],
        "L",
        [x + 0.34 * s, y - 0.1 * s],
        "L",
        [x + 0.46 * s, y - 0.22 * s],
        "A",
        0.22 * s,
        0.22 * s,
        "0",
        "0",
        "1",
        [x + 0.12 * s, y + 0.3 * s],
        "L",
        [x - 0.14 * s, y + 0.5 * s],
        "Z",
      );
      return V.s("g", {}, body("path", { d }, t, tone, s));
    },
    spark(x, y, s, tone = "red") {
      const t = D1.tone(tn(tone));
      const rays = Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4 + 0.2;
        const [r0, r1] = [0.16 * s, (k % 2 ? 0.36 : 0.5) * s];
        return V.s("path", {
          d: D("M", [x + Math.cos(a) * r0, y + Math.sin(a) * r0], "L", [x + Math.cos(a) * r1, y + Math.sin(a) * r1]),
          fill: "none",
          "stroke-width": sw(s, 0.09),
          "stroke-linecap": "round",
          style: { stroke: t.c },
        });
      });
      return V.s("g", {}, ...rays);
    },
  };
  const mark = (kind, x, y, size, tone = "grey") => {
    const t = D1.tone(tn(tone));
    const a = size * 0.36;
    const d = {
      times: D("M", [x - a, y - a], "L", [x + a, y + a], "M", [x + a, y - a], "L", [x - a, y + a]),
      plus: D("M", [x - a, y], "L", [x + a, y], "M", [x, y - a], "L", [x, y + a]),
      minus: D("M", [x - a, y], "L", [x + a, y]),
      equals: D("M", [x - a, y - a * 0.4], "L", [x + a, y - a * 0.4], "M", [x - a, y + a * 0.4], "L", [
        x + a,
        y + a * 0.4,
      ]),
    }[kind];
    if (!d) throw new Error(`VID.d1.mark: unknown kind "${kind}"`);
    return V.s("path", {
      d,
      fill: "none",
      "stroke-width": f1(size * 0.14),
      "stroke-linecap": "round",
      style: { stroke: t.ink },
    });
  };

  Object.assign(D1, { icon, mark });
})();
