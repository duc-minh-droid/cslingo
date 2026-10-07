/* Lecture 3 · scene 04: too many tours to check. Beat 1: the 12 tours of the 5-city map as a wall of tiles (the two shortest
   turn green). Beat 2: the wall shrinks into the first bar of a ladder whose counts explode (5 cities to 20 cities). */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- data, checked against the lecture ----------
  const TOURS = L3.TOURS12;
  const WANT = "ABCED28 ABECD28 ABDEC32 ACEBD32 ABDCE33 ABEDC33 ACBED33 ADBCE33 ABCDE34 ADCBE34 ACBDE38 ACDBE38";
  if (TOURS.map((o) => o.tour + o.len).join(" ") !== WANT)
    throw new Error("scene 4: the 12 tours differ from the lecture");
  const KS = [5, 6, 7, 8, 10, 20];
  const COUNTS = KS.map((k) => L3.nTours(k));
  if (COUNTS.join("|") !== "12|60|360|2,520|181,440|60,822,550,204,416,000")
    throw new Error("scene 4: tour counts differ");
  const MULT = [5, 6, 7]; // 12 -> 60 -> 360 -> 2,520
  [60 / 12, 360 / 60, 2520 / 360].forEach((m, i) => {
    if (m !== MULT[i]) throw new Error("scene 4: multipliers differ");
  });
  const BEST = TOURS.reduce((m, o) => Math.min(m, o.len), 99);
  if (BEST !== 28) throw new Error("scene 4: the best tour should be 28");

  // ---------- geometry (stage px) ----------
  const TW = 210,
    TH = 84,
    GAP = 20,
    GY = 70;
  const tileXY = (i) => ({ x: (i % 4) * (TW + 32), y: GY + Math.floor(i / 4) * (TH + GAP) });
  const PITCH = 72,
    ROW0 = 20,
    BH = 60,
    BX = 200;
  const rowY = (r) => ROW0 + r * PITCH;
  const barW = (r) => 36 + 40 * L3.digits(COUNTS[r]);
  const TONES = ["blue", "blue", "blue", "blue", "orange", "red"];

  // ---------- timeline ----------
  const T = {
    tiles: 0.3,
    tileStep: 0.12,
    best: 2.0,
    shrink: [2.8, 3.5],
    rows: [3.3, 3.9, 4.5, 5.1, 5.8, 6.5],
    type20: [6.5, 7.4],
    tag: [7.2, 7.9],
    shake: [7.2, 8.4],
  };

  const svgInline = (d, size, col, w) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:-3px"><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/></svg>`;
  const CROSS = "M5 5 L19 19 M19 5 L5 19";
  const times = (col) => svgInline(CROSS, 20, col, 3.6);

  V.scene({
    kicker: "THE CHALLENGE",
    title: ["Too many tours", "to check them all"],
    dur: 9,
    caps: [
      [0.4, 3, "Five cities have only 12 tours."],
      [3.8, 6, "Each extra city multiplies the count."],
      [6.2, 8.4, "Twenty cities? We cannot check them all."],
    ],
    build(stage) {
      // beat 1: the wall
      const wall = V.h("div", {
        style: {
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "936px",
          height: "400px",
          transformOrigin: "0 0",
        },
      });
      stage.append(wall);
      const topTag = L3.tag(wall, { x: 0, y: 0, text: "five cities: 12 tours", tone: "blue" });
      const bestTag = L3.tag(wall, { x: 936, y: 0, text: "the best", tone: "green", anchor: "r" });
      const tiles = TOURS.map((o, i) => {
        const { x, y } = tileXY(i);
        const box = V.h("div", {
          class: "v-card c-grey",
          style: {
            left: `${x}px`,
            top: `${y}px`,
            width: `${TW}px`,
            height: `${TH}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
          },
        });
        const s = V.h("span", {
          class: "v-mono",
          text: o.tour,
          style: { fontSize: "34px", letterSpacing: "-1px", color: "var(--ink)" },
        });
        const pill = V.h("span", {
          class: "v-tag",
          text: String(o.len),
          style: { position: "relative", padding: "2px 12px 3px" },
        });
        box.append(s, pill);
        const mark = L5.svg(box, TW, TH); // a tick badge in the corner of the best tiles
        mark.style.cssText += ";overflow:visible";
        const g = L5.tick(TW - 6, 6, 40, "green", { w: 7 });
        const disc = V.s("circle", {
          cx: TW - 6,
          cy: 6,
          r: 22,
          style: { fill: "var(--panel)", stroke: "var(--teal)", "stroke-width": "3" },
        });
        mark.append(disc, g);
        wall.append(box);
        return { box, pill, mark, disc, g, best: o.len === BEST };
      });

      // beat 2: the ladder
      const sv = L5.svg(stage);
      const rows = KS.map((k, r) => {
        const y = rowY(r);
        const label = V.h("div", {
          class: "v-text dim",
          text: `${k} cities`,
          style: { left: "0px", top: `${y + BH / 2 - 19}px` },
        });
        const bar = V.h("div", {
          class: `v-card c-${TONES[r]}`,
          style: {
            left: `${BX}px`,
            top: `${y}px`,
            width: `${barW(r)}px`,
            height: `${BH}px`,
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: "900",
            transformOrigin: "0 50%",
          },
        });
        const txt = V.h("span", { class: "v-mono", style: { color: "var(--c-ink)" } });
        bar.append(txt);
        stage.append(label, bar);
        return { label, bar, txt };
      });
      const chips = MULT.map((m, i) => {
        const x = BX + Math.max(barW(i), barW(i + 1)) + 24;
        const y0 = rowY(i) + BH / 2 + 4,
          y1 = rowY(i + 1) + BH / 2 - 4;
        const arr = L5.arrow(x, y0, x, y1, "orange", 1, { w: 6, head: 18 });
        sv.append(arr);
        const html = `${times("var(--amber-ink)")} ${m}`;
        const el = L3.tag(stage, {
          x: x + 28,
          y: rowY(i) + BH + (PITCH - BH) / 2 - 24,
          html,
          tone: "orange",
        });
        return { arr, el, html };
      });
      const bigHtml = `<span style="display:inline-flex;align-items:center;gap:12px"><svg width="34" height="34" viewBox="0 0 24 24"><path d="${CROSS}" fill="none" stroke="var(--rose-on)" stroke-width="3.6" stroke-linecap="round"/></svg><span>about 6 ${times("var(--rose-on)")} 10<sup style="font-size:30px;line-height:0;position:relative;top:-6px">16</sup> tours</span></span>`;
      const big = L3.tag(stage, {
        x: 468,
        y: 500,
        html: bigHtml,
        tone: "red",
        solid: true,
        fs: 34,
        anchor: "m",
      });

      return (t) => {
        // beat 1
        const wk = ramp(t, T.shrink[0], T.shrink[1], E.inOut);
        V.place(topTag, { o: V.ramp(t, 0.1, 0.4) * (1 - ramp(t, 2.9, 3.3)) });
        wall.style.transform = `translate(${200 * wk}px, ${20 * wk}px) scale(${1 - 0.88 * wk})`;
        wall.style.opacity = String(1 - ramp(t, 3.0, 3.5, E.lin));
        wall.style.visibility = t > T.shrink[1] ? "hidden" : "";
        topTag.set({ s: 1, o: V.ramp(t, 0.1, 0.4) * (1 - ramp(t, 2.9, 3.2, E.lin)) });
        const bk = ramp(t, T.best, T.best + 0.4);
        bestTag.set({ s: 0.8 + 0.2 * E.pop(bk), o: bk * 4 * (1 - ramp(t, 2.9, 3.2, E.lin)) });
        tiles.forEach((o, i) => {
          const k = clamp((t - T.tiles - i * T.tileStep) / 0.4);
          const on = o.best ? ramp(t, T.best, T.best + 0.3, E.lin) : 0;
          V.place(o.box, { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 4) });
          o.box.className = `v-card c-${on > 0.5 ? "green" : "grey"}`;
          o.pill.className = `v-tag c-${on > 0.5 ? "green" : "grey"}`;
          V.show(o.mark, on);
          const pk = ramp(t, T.best + 0.15, T.best + 0.6);
          L5.drawOn(o.g, pk);
          V.place(o.mark, { s: 0.7 + 0.3 * E.pop(on), o: on });
        });
        // beat 2
        rows.forEach((r, i) => {
          const k = clamp((t - T.rows[i]) / 0.5);
          V.place(r.label, { x: (1 - E.out(k)) * -14, o: E.out(clamp(k * 2)) });
          const bk = E.out(k);
          r.bar.style.visibility = k <= 0 ? "hidden" : "";
          r.bar.style.opacity = String(clamp(k * 5));
          const shake =
            i === 5
              ? Math.sin(((t - T.shake[0]) / (T.shake[1] - T.shake[0])) * Math.PI * 7) *
                7 *
                flash(t, T.shake[0], T.shake[1])
              : 0;
          r.bar.style.transform = `translateX(${shake.toFixed(2)}px) scaleX(${(0.05 + 0.95 * bk + 0.04 * Math.sin(k * Math.PI)).toFixed(3)})`;
          const full = COUNTS[i];
          const shown = i === 5 ? V.type(full, ramp(t, T.type20[0], T.type20[1], E.lin)) : full;
          if (r.txt.textContent !== shown) r.txt.textContent = shown;
          r.txt.style.opacity = i === 5 ? "1" : String(clamp((k - 0.55) * 3));
        });
        chips.forEach((c, i) => {
          const k = clamp((t - T.rows[i + 1] - 0.25) / 0.4);
          L5.drawOn(c.arr, ramp(k, 0, 0.8, E.lin));
          c.el.set({ html: c.html, s: 0.7 + 0.3 * E.pop(k), o: k * 4 });
        });
        const tk = clamp((t - T.tag[0]) / (T.tag[1] - T.tag[0]));
        big.set({ html: bigHtml, s: 0.7 + 0.3 * E.pop(tk), o: tk * 4 });
      };
    },
  });
})();
