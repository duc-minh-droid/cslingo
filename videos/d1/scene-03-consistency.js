/* Lecture 1 (ds-1), scene 03: two copies of "tickets left" (London, New York); the link is cut, London sells one ticket and
   New York never hears, so New York must choose: refuse to answer (consistent) or answer with the old number (available).
   Story (local seconds): 0.1-0.9 cards, counts, wire and "link" tag pop; 1.0-2.5 a purple copy shuttles across the working
   link; 2.75-3.3 the link is cut; 3.5-4.6 a buyer asks London for 1 ticket and its count turns 5 -> 4; 4.7-5.85 the copy runs
   to the gap and drops, New York stays on 5 (turns red: stale); 6.0-6.9 a customer asks New York "tickets left?"; 6.8-8.2
   "stay consistent": New York refuses (cross, "no answer"); 8.9-10.4 "stay available": New York answers 5, which is stale. */
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
  const CY = 78;
  const CH = 172;
  const WY = CY + CH / 2; // the wire runs through the middle of the cards
  const LC = LX + CW / 2; // card centres
  const NC = NX + CW / 2;
  const MID = (LX + CW + NX) / 2;
  const UY = 346; // people
  const AY = 428; // answer cards
  const AH = 192;
  const AW = 420;
  const AX2 = 486;
  const GAP_X = 420; // a copy packet gets this far along the cut wire
  const SLOT_Y = 260; // where New York's reply sits, between its card and the customer
  const SLOT_H = 46;
  const CHIP_Y = CY + 26; // the count chips

  // when things happen (local seconds)
  const S = {
    shuttle: [1.0, 2.5], // a copy crosses the working link and comes back
    cut: [2.75, 3.3],
    buyTag: 3.5,
    buyHop: [3.7, 4.2],
    flip: [4.2, 4.6], // London 5 -> 4
    copyRun: [4.7, 5.4],
    copyDrop: [5.4, 5.85],
    stale: [5.6, 5.9], // New York's 5 is now wrong
    askTag: 6.0,
    askHop: [6.1, 6.6],
    ring: [6.6, 6.9], // New York has to choose
    cons: 6.8, // "stay consistent" card
    reply: [8.9, 9.35], // the 5 leaves New York for the customer
    avail: 9.0, // "stay available" card
  };

  V.scene({
    kicker: "TRADE-OFF 1",
    title: ["Copies drift apart:", "consistent or available?"],
    dur: 11.5,
    caps: [
      [0.6, 2.8, "Two copies, kept in step by a link."],
      [3.1, 4.5, "Now the link is cut."],
      [4.6, 7.2, "London sells a ticket; New York never hears."],
      [7.4, 9.4, "Stay consistent: refuse to answer."],
      [9.4, 11.5, "Stay available: answer, maybe stale."],
    ],
    build(stage) {
      const svg = L5.svg(stage);
      const wire = D1.wire(stage, { x1: LX + CW, y1: WY, x2: NX, y2: WY, w: 10 });
      // New York's refusal, in the same slot as its reply
      const refuse = svg.appendChild(L5.cross(NC, SLOT_Y + SLOT_H / 2, 38, "orange", { ink: true }));
      const heads = [
        D1.tag(stage, { x: LX, y: 12, text: "London" }),
        D1.tag(stage, { x: NX, y: 12, text: "New York" }),
      ];
      // New York's reply sits between its card and the customer; made before the cards so that it slides out from behind
      // New York's card
      const reply = D1.chip(stage, {
        x: NC - 27,
        y: SLOT_Y,
        w: 54,
        h: SLOT_H,
        fs: 32,
        tone: "red",
        solid: true,
        text: String(FAST.answer),
      });
      const cards = [LX, NX].map((x) => D1.card(stage, { x, y: CY, w: CW, h: CH }));
      const chips = [LX, NX].map((x) =>
        D1.chip(stage, { x: x + 75, y: CHIP_Y, w: 120, h: 100, fs: 76, tone: "green", text: String(T.start) }),
      );
      const caps = [LX, NX].map((x) => D1.label(stage, { x, y: CY + 134, w: CW, text: "tickets left" }));
      const link = D1.tag(stage, { x: 0, y: WY - 108, text: "link", tone: "green" });
      const buyer = D1.user(stage, { x: LC, y: UY, name: "buyer" });
      const customer = D1.user(stage, { x: NC, y: UY, name: "customer" });
      // what each person says (blue = a request)
      const buyTag = D1.tag(stage, { x: LC + 66, y: UY - 30, text: "buy 1", tone: "blue" });
      const askText = "tickets left?";
      const askTag = D1.tag(stage, { x: NC - 52 - D1.tagW(askText), y: UY - 30, text: askText, tone: "blue" });
      // packets: one purple copy, one blue request per person
      const copy = D1.token(stage, { tone: "purple", size: 32, square: true });
      const buy = D1.token(stage, { tone: "blue", size: 32, square: true });
      const ask = D1.token(stage, { tone: "blue", size: 32, square: true });
      // the two answers
      const aw = (x) => ({ x, y: AY, w: AW, h: AH });
      const consCard = D1.card(stage, { ...aw(LX), tone: "orange" });
      const availCard = D1.card(stage, { ...aw(AX2), tone: "red" });
      const consHead = D1.tag(stage, { x: LX + 18, y: AY + 10, text: "stay consistent", tone: "orange" });
      const availHead = D1.tag(stage, { x: AX2 + 18, y: AY + 10, text: "stay available", tone: "red" });
      const noAns = D1.tag(stage, {
        x: LX + (AW - D1.tagW("no answer")) / 2,
        y: AY + 80,
        text: "no answer",
        tone: "orange",
        solid: true,
      });
      const staleText = `stale: it is ${T.after}`;
      const rowW = 84 + 14 + D1.tagW(staleText);
      const rowX = AX2 + (AW - rowW) / 2;
      const staleChip = D1.chip(stage, {
        x: rowX,
        y: AY + 78,
        w: 84,
        h: 62,
        fs: 48,
        tone: "red",
        solid: true,
        text: String(FAST.answer),
      });
      const staleTag = D1.tag(stage, { x: rowX + 98, y: AY + 80, text: staleText, tone: "red" });
      const consFoot = D1.label(stage, { x: LX, y: AY + 150, w: AW, text: "good for bank balances" });
      const availFoot = D1.label(stage, { x: AX2, y: AY + 150, w: AW, text: "good for a like counter" });
      const lane = (x, a, b, f) => ({ x, y: a + (b - a) * f });

      return (t) => {
        // 0.1 - 0.9: headers, cards, counts, wire and link tag appear
        const kh = (i) => ramp(t, 0.12 + i * 0.1, 0.5 + i * 0.1, E.lin);
        const kc = (i) => ramp(t, 0.18 + i * 0.1, 0.58 + i * 0.1, E.lin);
        const kn = (i) => ramp(t, 0.3 + i * 0.1, 0.7 + i * 0.1, E.lin);
        heads.forEach((h, i) => h.set({ k: kh(i) }));
        cards.forEach((c, i) => c.set({ k: kc(i) }));
        caps.forEach((c, i) => c.set({ k: kn(i) }));
        const cut = ramp(t, S.cut[0], S.cut[1], E.lin);
        wire.set({ tone: "green", k: ramp(t, 0.35, 0.8, E.inOut), cut });

        // London's count turns over when the sale lands; New York's goes stale when the copy is lost
        const flip = ramp(t, S.flip[0], S.flip[1], E.lin);
        const lead = flip < 0.5;
        const nyStale = ramp(t, S.stale[0], S.stale[1], E.lin) > 0.5;
        const toNY = flash(t, 1.55, 1.95); // the copy arrives in New York ...
        const toLondon = flash(t, 2.3, 2.7); // ... and comes back to London
        const rk = ramp(t, S.ring[0], S.ring[1], E.pop);
        chips[0].set({
          text: String(lead ? T.start : T.after),
          tone: lead ? "green" : "blue",
          k: kn(0),
          sx: Math.max(0.04, Math.abs(Math.cos(Math.PI * flip))),
          s: 1 + 0.08 * toLondon + 0.08 * flash(t, 4.5, 5.0),
        });
        chips[1].set({
          text: String(T.start),
          tone: nyStale ? "red" : "green",
          k: kn(1),
          s: 1 + 0.08 * toNY + 0.1 * flash(t, S.stale[0], 6.1) + 0.08 * flash(t, S.reply[0] - 0.05, S.reply[0] + 0.4),
          ring: t < S.reply[1] ? "orange" : "red",
          ringK: rk,
        });

        // the link tag says "link", then "cut"
        const word = cut > 0.2 ? "cut" : "link";
        link.set({
          text: word,
          tone: cut > 0.2 ? "red" : "green",
          solid: cut > 0.2,
          x: MID - D1.tagW(word) / 2,
          k: ramp(t, 0.55, 0.9, E.lin),
        });

        // people: the customer is orange while New York decides, red once it has been misled
        const asked = ramp(t, S.askHop[1], S.askHop[1] + 0.1, E.lin);
        const misled = ramp(t, S.reply[1], S.reply[1] + 0.15, E.lin);
        buyer.set({ k: kc(0), s: 1 + 0.1 * flash(t, S.buyHop[0] - 0.2, S.buyHop[0] + 0.3) });
        customer.set({
          k: kc(1),
          s: 1 + 0.1 * flash(t, S.askTag - 0.1, S.askTag + 0.4),
          tone: misled > 0.5 ? "red" : asked > 0.5 && t < S.reply[0] ? "orange" : "grey",
        });
        const said = (a, b) => Math.min(ramp(t, a, a + 0.3, E.lin), 1 - ramp(t, b, b + 0.3, E.lin));
        buyTag.set({ k: said(S.buyTag, 4.5), o: 1 });
        askTag.set({ k: said(S.askTag, 7.0), o: 1 });

        // the purple copy: shuttles across while the link works, then runs to the gap and falls
        let cp = { o: 0 };
        if (t >= S.shuttle[0] && t < S.shuttle[1] + 0.1) {
          const mid = (S.shuttle[0] + S.shuttle[1]) / 2;
          const f = t < mid ? ramp(t, S.shuttle[0], mid, E.inOut) : 1 - ramp(t, mid, S.shuttle[1], E.inOut);
          const p = D1.lerp2([LX + CW, WY], [NX, WY], f);
          cp = {
            x: p[0],
            y: p[1],
            o: Math.min(
              ramp(t, S.shuttle[0], S.shuttle[0] + 0.1, E.lin),
              1 - ramp(t, S.shuttle[1] - 0.08, S.shuttle[1], E.lin),
            ),
          };
        } else if (t >= S.copyRun[0] && t < S.copyDrop[1] + 0.1) {
          const run = ramp(t, S.copyRun[0], S.copyRun[1], E.inOut);
          const drop = ramp(t, S.copyDrop[0], S.copyDrop[1], E.in);
          cp = {
            x: LX + CW + (GAP_X - LX - CW) * run,
            y: WY + 56 * drop,
            o: Math.min(
              ramp(t, S.copyRun[0], S.copyRun[0] + 0.1, E.lin),
              1 - ramp(t, S.copyDrop[1] - 0.15, S.copyDrop[1], E.lin),
            ),
            tone: drop > 0 ? "red" : "purple",
            s: 1 - 0.3 * drop,
          };
        }
        copy.set(cp);

        // blue requests hop from a person to a card
        const hop = (tk, x, [a, b]) => {
          const f = ramp(t, a, b, E.inOut);
          const p = lane(x, UY - 40, CY + CH + 4, f);
          tk.set({
            x: p.x,
            y: p.y,
            o: t >= a && t < b + 0.1 ? Math.min(ramp(t, a, a + 0.1, E.lin), 1 - ramp(t, b - 0.1, b + 0.1, E.lin)) : 0,
            s: 1 - 0.3 * f,
          });
        };
        hop(buy, LC, S.buyHop);
        hop(ask, NC, S.askHop);

        // the two answers (the cross and the red 5 are New York's reply on its way to the customer)
        consCard.set({ k: ramp(t, S.cons, S.cons + 0.5, E.lin) });
        consHead.set({ k: ramp(t, S.cons, S.cons + 0.4, E.lin) });
        noAns.set({ k: ramp(t, 7.1, 7.5, E.lin) });
        consFoot.set({ k: ramp(t, 7.8, 8.2, E.lin) });
        V.place(refuse, {
          s: 0.6 + 0.4 * E.pop(ramp(t, 7.0, 7.4, E.lin)),
          o: ramp(t, 7.0, 7.2, E.lin) * (1 - ramp(t, S.reply[0] - 0.15, S.reply[0] + 0.05, E.lin)),
        });
        availCard.set({ k: ramp(t, S.avail, S.avail + 0.5, E.lin) });
        availHead.set({ k: ramp(t, S.avail, S.avail + 0.4, E.lin) });
        staleChip.set({ k: ramp(t, 9.4, 9.8, E.lin) });
        staleTag.set({ k: ramp(t, 9.6, 10.0, E.lin) });
        availFoot.set({ k: ramp(t, 10.0, 10.4, E.lin) });
        // the 5 slides out from behind New York's card into the slot above the customer
        const slide = ramp(t, S.reply[0], S.reply[1], E.out);
        reply.set({
          y: -(SLOT_Y + SLOT_H + 8 - (CY + CH)) * (1 - slide),
          k: ramp(t, S.reply[0], S.reply[0] + 0.02, E.lin),
          o: 1 - ramp(t, 10.0, 10.2, E.lin),
        });
      };
    },
  });
})();
