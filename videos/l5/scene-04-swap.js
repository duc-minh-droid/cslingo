/* Lecture 5 · Encodings, scene 04-swap: swap mutation exchanges two genes along arcs (ADECB -> ACEDB), so the tour stays valid.
   Story (local seconds): 0-0.8 map + genes appear, 0.8 purple rings on genes 2 and 4, 0.95 two curved arrows, 1.7-3.2 the two
   tiles swap along the arrows, 3.7-4.6 the route morphs, 4.5 a bag of the five letters appears, 5.1-7.0 each gene is checked
   off against the bag (every letter exactly once), 7.0-7.6 everything turns green. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  const START = "ADECB";
  const [I, J] = [1, 3]; // genes 2 and 4 of the lesson (0-based)
  const END = L5.swapAt(START, I, J); // ACEDB
  if (!L5.isPerm(END)) throw new Error("swap scene: the swapped tour must still be a permutation");

  // chromosome geometry (stage px); slot centres are 116 px apart
  const SIZE = 88;
  const PITCH = SIZE + 32;
  const ROW = { x: 184, y: 352 };
  const SPAN = (J - I) * PITCH;
  const LIFT = 148; // how far a tile climbs over (or dips under) the gene between them
  const slotX = (i) => ROW.x + PITCH * i + SIZE / 2;

  // the hop: x glides while the tile climbs steeply first, so it clears the middle gene (a flattened arch)
  const smooth = (x) => x * x * (3 - 2 * x);
  const hump = (p) => Math.pow(1 - Math.pow(Math.abs(2 * p - 1), 3.5), 1 / 3.5);
  const hop = (k, up) => {
    const q = smooth(clamp(k));
    return { x: (up ? 1 : -1) * SPAN * q, y: (up ? -1 : 1) * LIFT * hump(q) };
  };

  // timeline
  const T = {
    ring: 0.8,
    arrow: 0.95,
    swap: [1.7, 3.2],
    morph: [3.7, 4.6],
    bag: 4.5,
    check: 5.1,
    step: 0.38,
    green: [7.0, 7.6],
  };
  const f1 = (n) => n.toFixed(1);

  // a purple arrow that follows the same arch as the tile: from (x0, y) over to (x1, y), head pointing into the destination slot
  function hopArrow(x0, x1, y, up) {
    const HEAD = 26;
    const cut = HEAD * 0.7;
    const pts = [];
    for (let n = 0; n <= 80; n++) {
      const p = (1 - Math.cos((Math.PI * n) / 80)) / 2;
      const py = y + (up ? -1 : 1) * LIFT * hump(p);
      if (p < 0.5 || Math.abs(py - y) >= cut) pts.push([x0 + (x1 - x0) * p, py]);
    }
    pts.push([x1, y + (up ? -cut : cut)]);
    const d = pts.map(([px, py], n) => `${n ? "L" : "M"} ${f1(px)} ${f1(py)}`).join(" ");
    const dir = up ? 1 : -1; // the head points down for the upper arrow, up for the lower one
    const tri = `M ${f1(x1)} ${f1(y)} L ${f1(x1 - HEAD * 0.5)} ${f1(y - dir * HEAD)} L ${f1(x1 + HEAD * 0.5)} ${f1(y - dir * HEAD)} Z`;
    const ink = "var(--violet)";
    return V.s(
      "g",
      {},
      V.s("path", {
        d,
        fill: "none",
        pathLength: "1",
        "data-draw": "1",
        "stroke-width": "7",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: ink },
      }),
      V.s("path", {
        d: tri,
        "data-head": "1",
        "stroke-width": "3",
        "stroke-linejoin": "round",
        style: { fill: ink, stroke: ink },
      }),
    );
  }

  V.scene({
    kicker: "MUTATION",
    title: ["Swap mutation", "keeps it valid"],
    dur: 9,
    caps: [
      [0.4, 3.4, "Swap exchanges two genes."],
      [4, 8.5, "Nothing is created or lost, so the tour stays valid."],
    ],
    build(stage) {
      const map = L5.tourMap(stage, { x: 4, y: 22, w: 340, h: 255 });
      // the arrows lie under the tiles, so a tile slides along its own arrow
      const svg = L5.svg(stage);
      const up = svg.appendChild(hopArrow(slotX(I), slotX(J), ROW.y - 22, true));
      const down = svg.appendChild(hopArrow(slotX(J), slotX(I), ROW.y + SIZE + 28, false));
      const row = L5.chromosome(stage, {
        x: ROW.x,
        y: ROW.y,
        genes: START,
        size: SIZE,
        gap: PITCH - SIZE,
        tone: "blue",
      });
      const badge = L5.badge(stage, { x: 596, y: 24 });

      // purple rings travel with the two chosen tiles
      const ringOf = (i) =>
        stage.appendChild(
          V.h("div", {
            style: {
              position: "absolute",
              boxSizing: "border-box",
              left: `${ROW.x + PITCH * i - 8}px`,
              top: `${ROW.y - 8}px`,
              width: `${SIZE + 16}px`,
              height: `${SIZE + 22}px`,
              border: "6px solid var(--violet)",
              borderRadius: "28px",
            },
          }),
        );
      const rings = [ringOf(I), ringOf(J)];

      // the operator's name
      const tag = V.h("div", {
        class: "v-tag solid c-purple",
        text: "swap",
        style: { left: "408px", top: "94px", width: "120px", textAlign: "center", fontSize: "34px" },
      });
      stage.append(tag);

      // the bag of five letters: it never changes, and each gene is checked off against it
      const DOT = 56;
      const bag = V.h("div", {
        class: "v-card plain",
        style: { left: `${ROW.x + 84}px`, top: `${ROW.y + SIZE + 30}px`, width: "400px", height: "134px" },
      });
      bag.append(
        V.h("div", {
          class: "v-text dim",
          text: "the same 5 genes",
          style: { left: "0", top: "14px", width: "100%", textAlign: "center", fontSize: "30px" },
        }),
      );
      const dots = [...L5.CITIES].map((ch, n) =>
        bag.appendChild(
          V.h("div", {
            text: ch,
            style: {
              left: `${20 + n * (DOT + 20)}px`,
              top: "66px",
              width: `${DOT}px`,
              height: `${DOT}px`,
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              fontSize: "32px",
              boxShadow: "0 4px 0 var(--c-lip)",
            },
          }),
        ),
      );
      stage.append(bag);

      return (t) => {
        const hopK = ramp(t, T.swap[0], T.swap[1], E.lin);
        const flights = [hop(hopK, true), hop(hopK, false)];
        const checkAt = (slot) => T.check + T.step * slot;

        // map: the route morphs to the swapped tour, later it turns green with everything else
        const second = t >= T.morph[1] + 0.1;
        const ringK = ramp(t, T.ring, T.ring + 0.4) * (1 - ramp(t, 3.6, 4.0));
        map.update({
          order: second ? END : START,
          order2: END,
          mix: second ? ramp(t, T.green[0], T.green[1], E.inOut) : ramp(t, T.morph[0], T.morph[1], E.inOut),
          draw: ramp(t, 0.1, 1.0, E.lin),
          tone: "blue",
          tone2: second ? "green" : "blue",
          hi: [START[I], START[J]],
          hiTone: "purple",
          ringK,
        });

        // genes: pop in, then the chosen two hop, then each is ticked off in turn
        row.all((i) => {
          const chosen = i === I || i === J;
          const slot = i === I ? J : i === J ? I : i; // where this tile ends up
          const p = ramp(t, 0.1 + 0.08 * i, 0.45 + 0.08 * i, E.lin);
          const fly = i === I ? flights[0] : i === J ? flights[1] : { x: 0, y: 0 };
          const bump =
            (chosen ? 0.08 * flash(t, 3.1, 3.55) : 0) + 0.12 * flash(t, checkAt(slot), checkAt(slot) + T.step);
          return {
            x: fly.x,
            y: fly.y - (1 - E.out(p)) * 24,
            s: E.pop(p) * (1 + bump),
            o: clamp(p * 4),
            tone: t >= checkAt(slot) ? "green" : "blue",
          };
        });

        // rings follow their tiles, arrows draw on, then both leave once the swap is done
        const ringIn = ramp(t, T.ring, T.ring + 0.4, E.back);
        const ringOut = 1 - ramp(t, 3.3, 3.7);
        rings.forEach((r, n) =>
          V.place(r, { x: flights[n].x, y: flights[n].y, s: 0.8 + 0.2 * ringIn, o: Math.min(1, ringIn * 3) * ringOut }),
        );
        const arrowsOut = 1 - ramp(t, 3.1, 3.5);
        L5.drawOn(up, ramp(t, T.arrow, T.arrow + 0.5, E.inOut));
        L5.drawOn(down, ramp(t, T.arrow + 0.1, T.arrow + 0.6, E.inOut));
        V.show(up, arrowsOut);
        V.show(down, arrowsOut);
        const tagIn = ramp(t, T.arrow + 0.1, T.arrow + 0.5, E.lin);
        V.place(tag, { s: 0.8 + 0.2 * E.pop(tagIn), o: clamp(tagIn * 3) * arrowsOut });

        // badge: valid all the way through, with a small pulse after the swap and at the end
        const bk = ramp(t, 0.5, 1.0, E.lin);
        badge("valid", bk);
        const pulse = flash(t, 3.1, 3.6) + flash(t, T.green[0], T.green[0] + 0.5);
        V.place(badge.el, { s: (0.75 + 0.25 * E.pop(bk)) * (1 + 0.07 * pulse), o: clamp(bk * 4) });

        // bag of letters
        const bagIn = ramp(t, T.bag, T.bag + 0.5, E.lin);
        V.place(bag, { y: (1 - E.out(bagIn)) * 14, s: 0.85 + 0.15 * E.pop(bagIn), o: clamp(bagIn * 4) });
        dots.forEach((d, n) => {
          const at = checkAt(END.indexOf(L5.CITIES[n]));
          const cls = t >= at ? "v-tag solid c-green" : "v-tag c-grey";
          if (d.className !== cls) d.className = cls;
          d.style.transform = `scale(${(1 + 0.16 * flash(t, at, at + T.step)).toFixed(3)})`;
        });
      };
    },
  });
})();
