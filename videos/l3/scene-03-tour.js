/* Lecture 3 · scene 03-tour: a tour is a string of cities and its fitness is the total length.
   Story (local seconds): 0.3-1.3 cities and table appear, 1.4-5.4 ABDEC is built one hop per 0.8 s (arrow, pill, table cells,
   gene tile, running total), 4.6 the way home, 5.6-6.6 the total settles and "fitness = length" pops, 6.8-9.6 ABCED replaces it
   (green, 5 hops of 0.35 s, two genes swap), 8.8 down arrow from the old 32 to the new 28. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  const T1 = "ABDEC";
  const T2 = "ABCED";
  if (L3.len(T1) !== 32 || L3.len(T2) !== 28) throw new Error("tour scene: lengths must be 32 and 28");
  if (L3.cum(T1).join() !== "5,9,18,25,32" || L3.cum(T2).join() !== "5,8,15,24,28")
    throw new Error("tour scene: running totals differ from the spec");

  const H1 = L3.hops(T1);
  const H2 = L3.hops(T2);
  const C1 = L3.cum(T1);
  const C2 = L3.cum(T2);
  const pair = (t, i) => [t[i], t[(i + 1) % t.length]];
  const A1 = (i) => 1.4 + 0.8 * i; // edge i of the first tour starts here (0.5 s to draw)
  const D1 = 0.5;
  const A2 = (i) => 6.8 + 0.35 * i; // edge i of the second tour
  const D2 = 0.35;
  const SWAP = 2; // tour 1 -> tour 2 changes genes at index 2 and 4
  const ROW = { x: 40, y: 470, size: 80, gap: 10 };
  const pitch = ROW.size + ROW.gap;
  const sameEdge = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);

  V.scene({
    kicker: "THE PROBLEM",
    title: ["A tour is a string,", "its length is the score"],
    dur: 11,
    caps: [
      [0.4, 2, "Visit every city once, then return."],
      [2.2, 5.6, "A tour is a string. Add up the hops."],
      [5.8, 8.2, "Shorter is better, so we minimise."],
      [8.4, 10.5, "ABCED is shorter: 28 beats 32."],
    ],
    build(stage) {
      const map = L3.map(stage, { x: 30, y: 30 });
      const mx = L3.matrix(stage, { x: 596, y: 30 });
      const row = L5.chromosome(stage, { x: ROW.x, y: ROW.y, genes: T1, size: ROW.size, gap: ROW.gap, tone: "blue" });
      const svg = L5.svg(stage);

      // the way home: a curved purple arrow under the string, last tile back to the first
      const homeY = ROW.y + ROW.size + 26;
      const x0 = ROW.x + 4 * pitch + ROW.size / 2;
      const x1 = ROW.x + ROW.size / 2;
      const home = svg.appendChild(L5.arrow(x0, homeY, x1, homeY, "purple", 1, { bow: 44 }));
      const homeTag = L3.tag(stage, { x: (x0 + x1) / 2, y: homeY + 36, anchor: "m", text: "way home", tone: "purple" });

      // total pill: small label over a big number
      const total = V.h("div", {
        class: "v-tag solid c-blue",
        style: { left: "560px", top: "470px", width: "170px", height: "104px", padding: "0", textAlign: "center" },
      });
      const label = V.h("div", { text: "length", style: { position: "relative", fontSize: "28px", lineHeight: "36px" } });
      const num = V.h("div", {
        text: "0",
        style: { position: "relative", fontSize: "56px", lineHeight: "60px", fontWeight: "900" },
      });
      total.append(label, num);
      stage.append(total);
      const fit = L3.sticker(stage, { x: 596, y: 392, w: 330, h: 64, text: "fitness = length", tone: "blue" });

      // after the swap: the old 32 stays beside the new total, with a green arrow and tick
      const old = L3.tag(stage, { x: 820, y: 470, anchor: "c", text: "32", tone: "red", fs: 44 });
      const down = svg.appendChild(L5.arrow(820, 540, 820, 600, "green", 1, { w: 8, head: 26 }));
      const tick = svg.appendChild(L5.tick(885, 575, 52, "green"));

      return (t) => {
        const second = t >= A2(0);

        // total pill value: counts up by each hop as its edge draws
        const running = (hops, cum, start, dur, k0) =>
          hops.reduce((v, h, i) => v + h * ramp(t, start(i), start(i) + dur, E.lin), 0) + k0;
        const val = second ? Math.round(running(H2, C2, A2, D2, 0)) : Math.round(running(H1, C1, A1, D1, 0));
        num.textContent = String(t < 1.4 ? 0 : val);

        // map: cities pop in, tour 1 draws one edge at a time, then tour 2 cross-fades in
        const draw1 = H1.reduce((s, _, i) => s + ramp(t, A1(i), A1(i) + D1, E.lin), 0) / H1.length;
        const draw2 = H2.reduce((s, _, i) => s + ramp(t, A2(i), A2(i) + D2, E.lin), 0) / H2.length;
        map.update({
          order: T1,
          draw: draw1,
          tone: "blue",
          weights: 1,
          pillAt: { AC: 0.72, BD: 0.3 },
          ...(second ? { order2: T2, tone2: "green", mix: draw2, draw2 } : {}),
          o: ramp(t, 0.3, 1.0, E.lin),
        });

        // table: used hops light up blue, then the five hops of tour 2 light up green
        const lit = [];
        T1.split("").forEach((_, i) => {
          const p = pair(T1, i);
          const k = ramp(t, A1(i) + 0.2, A1(i) + 0.5);
          const keep = T2.split("").some((__, j) => sameEdge(p, pair(T2, j)));
          if (!second) lit.push([p[0], p[1], "blue", k]);
          else if (!keep) lit.push([p[0], p[1], "blue", 1 - ramp(t, A2(0), A2(0) + 0.4)]);
        });
        if (second)
          T2.split("").forEach((_, i) => {
            const p = pair(T2, i);
            lit.push([p[0], p[1], "green", ramp(t, A2(i), A2(i) + D2, E.lin)]);
          });
        mx.update({ lit, k: ramp(t, 0.5, 1.3), o: 1 });

        // string: a tile joins as its city is reached; two genes swap for tour 2
        const swapK = ramp(t, A2(2) - 0.2, A2(2) + 0.7, E.inOut);
        row.all((i) => {
          const at = i === 0 ? A1(0) : A1(i - 1) + D1;
          const p = ramp(t, at, at + 0.3);
          const green = second && t >= A2(Math.min(i, 4));
          return { y: (1 - E.out(p)) * 18, s: E.pop(p), o: clamp(p * 4), tone: green ? "green" : "blue" };
        });
        if (second)
          [SWAP, 4].forEach((i) =>
            row.flip(i, swapK, {
              from: T1[i],
              to: T2[i],
              tone: t >= A2(i) ? "green" : "blue",
              toTone: "green",
              hop: 14,
              s: 1,
              o: 1,
            }),
          );

        // total pill and the "fitness = length" sticker
        const pillIn = ramp(t, A1(0), A1(0) + 0.3);
        const bounce = flash(t, 5.6, 6.2) + flash(t, A2(4) + D2, A2(4) + D2 + 0.5);
        const tone = second ? "green" : "blue";
        total.className = `v-tag solid c-${tone}`;
        V.place(total, { s: (0.8 + 0.2 * E.pop(pillIn)) * (1 + 0.1 * bounce), o: clamp(pillIn * 4) });
        const fk = ramp(t, 5.8, 6.4, E.lin) * (1 - ramp(t, A2(0) - 0.2, A2(0) + 0.1, E.lin));
        fit.set({ text: "fitness = length", tone: "blue", icon: null, k: fk });

        // way home arrow and tag
        const hk = ramp(t, A1(4) + 0.1, A1(4) + 0.7, E.inOut) * (1 - ramp(t, 6.6, 6.9));
        L5.drawOn(home, hk);
        V.show(home, hk > 0 ? 1 : 0);
        const hk2 = ramp(t, A1(4) + 0.2, A1(4) + 0.6, E.lin) * (1 - ramp(t, 6.6, 6.9));
        homeTag.set({ tone: "purple", s: 0.8 + 0.2 * E.pop(hk2), o: clamp(hk2 * 3) });

        // old 32, green down arrow and tick
        const ok = ramp(t, A2(0), A2(0) + 0.3);
        old.set({ tone: "red", s: 0.8 + 0.2 * E.pop(ok), o: clamp(ok * 4) });
        const dk = ramp(t, 8.8, 9.3);
        L5.drawOn(down, dk);
        V.show(down, dk > 0 ? 1 : 0);
        const tk = ramp(t, 9.1, 9.6);
        L5.drawOn(tick, tk);
        V.show(tick, tk > 0 ? 1 : 0);
      };
    },
  });
})();
