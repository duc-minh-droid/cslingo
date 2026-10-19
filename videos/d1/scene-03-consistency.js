/* Lecture 1 (ds-1), scene 03: two copies of "tickets left" (London, New York); the link is cut, London sells one ticket and
   New York never hears, so New York must choose: refuse to answer (consistent) or answer with the old number (available). */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // the numbers come from the lesson's rule (asserted in d1/common.js); check what this scene prints
  const T = D1.TICKETS;
  const SAFE = D1.ticketRun("consistent");
  const FAST = D1.ticketRun("available");
  D1.same("tickets: start, after the sale", [T.start, T.after], [5, 4]);
  D1.same("consistent run: London, New York, answer", [SAFE.london, SAFE.ny, SAFE.answer], [4, 5, null]);
  D1.same("available run: answer, stale", [FAST.answer, FAST.stale], [5, true]);

  const LX = 30; // London card
  const NX = 636; // New York card
  const CW = 270;
  const CY = 66;
  const CH = 184;
  const WY = CY + CH / 2; // the wire runs through the middle of the cards
  const LC = LX + CW / 2; // card centres
  const NC = NX + CW / 2;
  const MID = (LX + CW + NX) / 2;
  const UY = 346; // people
  const AY = 428; // answer cards
  const AH = 186;
  const AW = 420;
  const AX2 = 486;
  const GAP_X = 420; // a copy packet gets this far along the cut wire
  const T_CUT = [3.0, 3.6];
  const T_SALE = [4.5, 4.9];

  V.scene({
    kicker: "TRADE-OFF 1",
    title: ["Copies drift apart:", "consistent or available?"],
    dur: 11.5,
    caps: [
      [0.5, 2.8, "Two copies, kept in step by a link."],
      [3.0, 4.6, "Now the link is cut."],
      [4.7, 7.0, "London sells a ticket; New York never hears."],
      [7.5, 9.2, "Stay consistent: refuse to answer."],
      [9.3, 11.3, "Stay available: answer, maybe stale."],
    ],
    build(stage) {
      const svg = L5.svg(stage);
      const wire = D1.wire(stage, { x1: LX + CW, y1: WY, x2: NX, y2: WY, w: 10 });
      const heads = [D1.tag(stage, { x: LX, y: 0, text: "London" }), D1.tag(stage, { x: NX, y: 0, text: "New York" })];
      const cards = [LX, NX].map((x) => D1.card(stage, { x, y: CY, w: CW, h: CH }));
      const chips = [LX, NX].map((x) =>
        D1.chip(stage, { x: x + 75, y: CY + 34, w: 120, h: 100, fs: 76, tone: "green", text: String(T.start) }),
      );
      const caps = [LX, NX].map((x) => D1.label(stage, { x, y: CY + 144, w: CW, text: "tickets left" }));
      const link = D1.tag(stage, { x: 0, y: WY - 76, text: "link", tone: "green" });
      const buyer = D1.user(stage, { x: LC, y: UY, name: "buyer" });
      const customer = D1.user(stage, { x: NC, y: UY, name: "customer" });
      // packets: one purple copy, one blue request per person
      const copy = D1.token(stage, { tone: "purple", size: 32, square: true });
      const buy = D1.token(stage, { tone: "blue", size: 32, square: true });
      const ask = D1.token(stage, { tone: "blue", size: 32, square: true });
      // New York's reply, sitting between its card and the customer
      const refuse = svg.appendChild(L5.cross(NC, 284, 40, "orange", { ink: true }));
      const reply = D1.chip(stage, {
        x: NC - 30,
        y: 262,
        w: 60,
        h: 54,
        fs: 36,
        tone: "red",
        solid: true,
        text: String(FAST.answer),
      });
      // the two answers
      const aw = (x) => ({ x, y: AY, w: AW, h: AH });
      const consCard = D1.card(stage, { ...aw(LX), tone: "orange" });
      const availCard = D1.card(stage, { ...aw(AX2), tone: "red" });
      const consHead = D1.tag(stage, { x: LX + 18, y: AY + 12, text: "stay consistent", tone: "orange" });
      const availHead = D1.tag(stage, { x: AX2 + 18, y: AY + 12, text: "stay available", tone: "red" });
      const noAns = D1.tag(stage, {
        x: LX + (AW - D1.tagW("no answer")) / 2,
        y: AY + 80,
        text: "no answer",
        tone: "orange",
        solid: true,
      });
      const rowW = 84 + 14 + D1.tagW("stale: it is " + T.after);
      const rowX = AX2 + (AW - rowW) / 2;
      const staleChip = D1.chip(stage, {
        x: rowX,
        y: AY + 76,
        w: 84,
        h: 66,
        fs: 50,
        tone: "red",
        solid: true,
        text: String(FAST.answer),
      });
      const staleTag = D1.tag(stage, { x: rowX + 98, y: AY + 80, text: `stale: it is ${T.after}`, tone: "red" });
      const consFoot = D1.label(stage, { x: LX, y: AY + 144, w: AW, text: "good for bank balances" });
      const availFoot = D1.label(stage, { x: AX2, y: AY + 144, w: AW, text: "good for a like counter" });
      const lane = (x, a, b, f) => ({ x, y: a + (b - a) * f });

      return (t) => {
        // 0.3 - 1.4: headers, cards, counts, wire and link tag appear
        const kh = (i) => ramp(t, 0.3 + i * 0.12, 0.7 + i * 0.12, E.lin);
        const kc = (i) => ramp(t, 0.4 + i * 0.12, 0.8 + i * 0.12, E.lin);
        const kn = (i) => ramp(t, 0.6 + i * 0.12, 1.0 + i * 0.12, E.lin);
        heads.forEach((h, i) => h.set({ k: kh(i) }));
        cards.forEach((c, i) => c.set({ k: kc(i) }));
        caps.forEach((c, i) => c.set({ k: kn(i) }));
        const cut = ramp(t, T_CUT[0], T_CUT[1], E.lin);
        wire.set({ tone: "green", k: ramp(t, 0.9, 1.4, E.inOut), cut });

        // London's count turns over when the sale lands
        const flip = ramp(t, T_SALE[0], T_SALE[1], E.lin);
        const lead = flip < 0.5;
        const nyStale = ramp(t, 5.7, 6.0, E.lin) > 0.5;
        const shuttleHit = flash(t, 2.05, 2.5);
        const rk = ramp(t, 7.3, 7.7, E.pop);
        chips[0].set({
          text: String(lead ? T.start : T.after),
          tone: lead ? "green" : "blue",
          k: kn(0),
          sx: Math.max(0.04, Math.abs(Math.cos(Math.PI * flip))),
          s: 1 + 0.08 * flash(t, 4.8, 5.3),
        });
        chips[1].set({
          text: String(T.start),
          tone: nyStale ? "red" : "green",
          k: kn(1),
          s: 1 + 0.08 * shuttleHit + 0.1 * flash(t, 5.7, 6.2),
          ring: t < 9.3 ? "orange" : "red",
          ringK: rk,
        });

        // the link tag says "link", then "cut"
        const word = cut > 0.5 ? "cut" : "link";
        link.set({
          text: word,
          tone: cut > 0.5 ? "red" : "green",
          solid: cut > 0.5,
          x: MID - D1.tagW(word) / 2,
          k: ramp(t, 1.1, 1.5, E.lin),
        });

        // people
        const asked = ramp(t, 7.3, 7.5, E.lin);
        const misled = ramp(t, 9.9, 10.1, E.lin);
        buyer.set({ k: kc(0), s: 1 + 0.1 * flash(t, 4.0, 4.5) });
        customer.set({
          k: kc(1),
          s: 1 + 0.1 * flash(t, 6.8, 7.3),
          tone: misled > 0.5 ? "red" : asked > 0.5 && t < 9.3 ? "orange" : "grey",
        });

        // the purple copy: shuttles across while the link works, then runs to the gap and falls
        let cp = { o: 0 };
        if (t >= 1.5 && t < 2.7) {
          const f = t < 2.1 ? ramp(t, 1.5, 2.1, E.inOut) : 1 - ramp(t, 2.1, 2.7, E.inOut);
          const p = D1.lerp2([LX + CW, WY], [NX, WY], f);
          cp = { x: p[0], y: p[1], o: Math.min(ramp(t, 1.5, 1.6, E.lin), 1 - ramp(t, 2.62, 2.7, E.lin)) };
        } else if (t >= 4.9 && t < 6.0) {
          const run = ramp(t, 4.9, 5.5, E.inOut);
          const drop = ramp(t, 5.5, 5.95, E.in);
          cp = {
            x: LX + CW + (GAP_X - LX - CW) * run,
            y: WY + 56 * drop,
            o: Math.min(ramp(t, 4.9, 5.0, E.lin), 1 - ramp(t, 5.8, 5.95, E.lin)),
            tone: drop > 0 ? "red" : "purple",
            s: 1 - 0.3 * drop,
          };
        }
        copy.set(cp);

        // blue requests hop from a person to a card
        const hop = (tk, x, a, b) => {
          const f = ramp(t, a, b, E.inOut);
          const p = lane(x, UY - 40, CY + CH + 4, f);
          tk.set({
            x: p.x,
            y: p.y,
            o: t >= a && t < b + 0.1 ? Math.min(ramp(t, a, a + 0.1, E.lin), 1 - ramp(t, b - 0.1, b + 0.1, E.lin)) : 0,
            s: 1 - 0.3 * f,
          });
        };
        hop(buy, LC, 4.0, 4.5);
        hop(ask, NC, 6.8, 7.3);

        // the two answers (the cross and the red 5 are New York's reply on its way to the customer)
        consCard.set({ k: ramp(t, 7.4, 7.9, E.lin) });
        consHead.set({ k: ramp(t, 7.4, 7.8, E.lin) });
        noAns.set({ k: ramp(t, 7.7, 8.1, E.lin) });
        consFoot.set({ k: ramp(t, 8.3, 8.7, E.lin) });
        V.place(refuse, {
          s: 0.6 + 0.4 * E.pop(ramp(t, 7.8, 8.2, E.lin)),
          o: ramp(t, 7.8, 8.0, E.lin) * (1 - ramp(t, 9.2, 9.4, E.lin)),
        });
        availCard.set({ k: ramp(t, 9.3, 9.8, E.lin) });
        availHead.set({ k: ramp(t, 9.3, 9.7, E.lin) });
        staleChip.set({ k: ramp(t, 9.6, 10.0, E.lin) });
        staleTag.set({ k: ramp(t, 9.9, 10.3, E.lin) });
        availFoot.set({ k: ramp(t, 10.4, 10.8, E.lin) });
        const slide = ramp(t, 9.4, 9.95, E.inOut);
        reply.set({ y: 30 * slide, k: ramp(t, 9.4, 9.6, E.lin), o: 1 - ramp(t, 9.95, 10.1, E.lin) });
      };
    },
  });
})();
