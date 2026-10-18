/* Lecture 7 · scene-02-swarm: a swarm is many identical, simple members with local rules and no leader.
   A ring of eight identical ants joined to their neighbours by short links. A blue pulse hops from ant to ant (information only
   travels between neighbours, nothing sits in the middle). Then the centre shows the crown that is NOT there: a crown, crossed out,
   'no leader'. The two stickers at the bottom name the surprise: the group still finds the shortest route (emergent).
   Concept picture, not a simulation. Local seconds: 0.2-1.5 ants pop clockwise, 1.6-2.8 links draw on, 1.8 'neighbours only',
   3.0 the pulse starts, 5.6 crown, 6.3 cross, 6.9 'no leader', 7.8 green sticker, 8.5 'emergent'. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const { ease: E, ramp, place, flash } = V;
  const lin = E.lin;

  // ---------- the ring: eight identical ants, clockwise from the top (centres from the storyboard) ----------
  const N = 8;
  const [CX, CY, RX, RY] = [468, 290, 300, 190];
  const SIZE = 84; // every ant is the same size and the same colour
  const GAP = 52; // a link starts this far from each ant centre
  const ring = Array.from({ length: N }, (_, k) => {
    const a = ((-90 + 45 * k) * Math.PI) / 180;
    return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), r: 45 * k }; // r: face along the ring (clockwise)
  });
  L7.same(
    "ring of ants",
    ring.map((p) => [Math.round(p.x), Math.round(p.y)]),
    [
      [468, 100],
      [680, 156],
      [768, 290],
      [680, 424],
      [468, 480],
      [256, 424],
      [168, 290],
      [256, 156],
    ],
  );
  // one link between each pair of neighbours (k and k + 1), kept clear of the ants
  const links = ring.map((p, k) => {
    const q = ring[(k + 1) % N];
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const [ux, uy] = [(q.x - p.x) / len, (q.y - p.y) / len];
    if (len < 2 * GAP + 40) throw new Error(`scene 02: link ${k} is too short to show (${Math.round(len)} px)`);
    return { len, a: [p.x + ux * GAP, p.y + uy * GAP], b: [q.x - ux * GAP, q.y - uy * GAP] };
  });

  // ---------- timing (local seconds) ----------
  const POP0 = 0.2; // ant k pops at POP0 + 0.14 k
  const LINK0 = 1.6; // link k draws from LINK0 + 0.12 k for 0.3 s
  const HOP = 0.55; // one hop of the pulse
  const PULSE0 = 3.0;
  // widths of the tag texts (28 px, weight 900) as the browser draws them, rounded up
  const TEXT_W = {
    "neighbours only": 219,
    "no leader": 128,
    "finds the shortest route": 323,
    "emergent: no ant can alone": 370,
  };

  const f1 = (n) => n.toFixed(1);

  const drawOn = (path, k) => {
    path.style.strokeDasharray = "1 1";
    path.style.strokeDashoffset = String(1 - k);
    path.style.visibility = k <= 0.002 ? "hidden" : "";
  };

  V.scene({
    kicker: "SWARMS",
    title: ["Simple ants,", "clever colony"],
    dur: 10,
    caps: [
      [0.4, 2.8, "A colony is many identical, simple ants."],
      [3.0, 5.6, "Each one only reacts to its neighbours."],
      [6.2, 7.7, "There is no leader giving orders."],
      [7.8, 9.6, "Yet together they find the shortest route."],
    ],
    build(stage) {
      // layer 1: the links, under everything
      const under = L5.svg(stage);
      const linkEls = links.map((l) =>
        under.appendChild(
          V.s("path", {
            d: `M ${f1(l.a[0])} ${f1(l.a[1])} L ${f1(l.b[0])} ${f1(l.b[1])}`,
            fill: "none",
            pathLength: "1",
            "stroke-width": "8",
            "stroke-linecap": "round",
            style: { stroke: "var(--line-2)" },
          }),
        ),
      );
      // layer 2: the ants, each drawn once at (0, 0) and moved with place()
      const antLayer = L5.svg(stage);
      const ants = ring.map(() => antLayer.appendChild(L7.ant(0, 0, SIZE)));
      // the pulse (HTML, above the ants), then the tags
      const pulse = L7.token(stage, { tone: "blue", size: 26 });
      // tags are centred on a given x: their width is the measured 28 px bold text plus the tag's own padding and border (42 px)
      const centred = (text, cx, y, tone, solid, extra = 0) => {
        const w = TEXT_W[text] + 42 + extra;
        const t = L7.tag(stage, { x: cx - w / 2, y, text, tone, solid, h: 58 });
        t.el.style.width = `${w}px`;
        return { t, left: cx - w / 2 };
      };
      const near = centred("neighbours only", CX, 262, "grey", false).t;
      const lead = centred("no leader", CX, 372, "red", true).t;
      const found = centred("finds the shortest route", 260, 548, "green", true, 46);
      found.t.el.style.paddingLeft = "64px"; // room for the tick on the left (46 px more than the usual 18)
      const emerge = centred("emergent: no ant can alone", 700, 548, "grey", false).t;
      // layer 3: the crown, its cross and the tick, above the tags
      const over = L5.svg(stage);
      const crown = over.appendChild(L7.crown(CX, 280, 130, "orange"));
      const cross = over.appendChild(L5.cross(CX, 280, 150, "red", { w: 12 }));
      const tick = over.appendChild(L5.tick(found.left + 40, 548 + 29, 34, "green", { on: true }));

      return (t) => {
        // the pulse: hop j runs from ant j to ant j + 1; it grows out of one ant and shrinks into the next
        const u = (t - PULSE0) / HOP;
        const hop = Math.floor(u);
        const f = u - hop;
        const [from, to] = [ring[((hop % N) + N) % N], ring[((((hop % N) + N) % N) + 1) % N]];
        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const near01 = Math.min(f * len, (1 - f) * len) / GAP;
        pulse.set({
          x: from.x + (to.x - from.x) * f,
          y: from.y + (to.y - from.y) * f,
          s: E.out(Math.min(1, near01)),
          o: u < 0 ? 0 : 1,
        });
        // the ant the pulse has just reached bumps for 0.3 s
        const bumpAnt = hop >= 1 ? hop % N : -1;
        const bump = hop >= 1 ? flash(f * HOP, 0, 0.3) : 0;

        ring.forEach((p, k) => {
          const t0 = POP0 + 0.14 * k;
          const pk = ramp(t, t0, t0 + 0.38, lin);
          const bob = 3 * Math.sin(2 * Math.PI * (t / 1.8 + k / N)) * ramp(t, t0 + 0.4, t0 + 0.7, lin);
          place(ants[k], {
            x: p.x,
            y: p.y - 20 * (1 - ramp(t, t0, t0 + 0.38, E.out)) + bob,
            r: p.r,
            s: E.pop(pk) * (1 + 0.16 * (k === bumpAnt ? bump : 0)),
            o: ramp(t, t0, t0 + 0.2, lin),
          });
          drawOn(linkEls[k], ramp(t, LINK0 + 0.12 * k, LINK0 + 0.12 * k + 0.3, E.inOut));
        });

        near.set({ k: ramp(t, 1.8, 2.2, lin), o: 1 - ramp(t, 5.3, 5.6, lin) });
        place(crown, { s: E.pop(ramp(t, 5.6, 6.2, lin)), o: ramp(t, 5.6, 5.8, lin) });
        L5.drawOn(cross, ramp(t, 6.3, 6.8, lin));
        lead.set({ k: ramp(t, 6.9, 7.4, lin) });
        found.t.set({ k: ramp(t, 7.8, 8.4, lin) });
        L5.drawOn(tick, ramp(t, 8.1, 8.5, lin));
        emerge.set({ k: ramp(t, 8.5, 9.0, lin) });
      };
    },
  });
})();
