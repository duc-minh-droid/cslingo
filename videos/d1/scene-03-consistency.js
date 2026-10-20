/* Lecture 1 (ds-1), scene 03: two copies of "tickets left" (London, New York); the link is cut, London sells one ticket and
   New York never hears, so New York must choose: refuse to answer (consistent) or answer with the old number (available).
   Story (local seconds): 0.1-0.9 cards, counts, wire and "network link" tag pop (why two copies: a crash in one city must not
   stop the other); 1.0-2.5 a purple copy shuttles across the working link; 2.9-3.4 the link is cut; 3.7-4.8 a buyer asks
   London for 1 ticket and its count turns 5 -> 4; 4.9-6.1 the copy runs to the gap and drops, New York stays on 5 (turns
   red: stale); 6.3-7.2 a customer asks New York "tickets left?" and New York has to choose; 7.4-9.3 "stay consistent"
   (copies always agree): New York refuses, an orange "no answer" chip reaches the customer; "or"; 9.3-11.3 "stay available"
   (always answers): New York answers 5, a red 5 chip reaches the customer, who has been misled. The two answers are drawn as
   New York's two options side by side, under a "New York must choose" tag. Every number comes from D1.TICKETS. */
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
  const CY = 76;
  const CH = 150;
  const WY = CY + CH / 2; // the wire runs through the middle of the cards
  const LC = LX + CW / 2; // card centres
  const NC = NX + CW / 2;
  const MID = (LX + CW + NX) / 2;
  const UY = 302; // people
  const HY = 372; // "New York must choose"
  const AY = 440; // answer cards
  const AH = 174;
  const AW = 408;
  const AX = [LX, 936 - LX - AW]; // x of the two answer cards
  const GAP_X = 420; // a copy packet gets this far along the cut wire
  const CHIP_Y = CY + 14; // the count chips
  const REPLY = { x: NC + 60, y: UY - 24, w: 62, h: 50 }; // New York's reply, beside the customer
  // measured widths of the tags (D1.tagW is only an estimate and runs some px off)
  const TW = { link: 215, cut: 84, choose: 349, no: 182, stale: 199, ask: 202 };

  // when things happen (local seconds)
  const S = {
    shuttle: [1.0, 2.5], // a copy crosses the working link and comes back
    cut: [2.9, 3.4],
    buyTag: 3.7,
    buyHop: [3.9, 4.4],
    flip: [4.4, 4.8], // London 5 -> 4
    copyRun: [4.9, 5.6],
    copyDrop: [5.6, 6.05],
    stale: [5.8, 6.1], // New York's 5 is now wrong
    askTag: 6.3,
    askHop: [6.4, 6.9],
    ring: [6.9, 7.2], // New York has to choose
    choose: 7.1, // "New York must choose"
    cons: 7.4, // "stay consistent" card
    noReply: 7.9, // the refusal reaches the customer
    or: 9.0,
    avail: 9.3, // "stay available" card
    reply: 9.8, // the 5 reaches the customer
  };

  V.scene({
    kicker: "TRADE-OFF 1",
    title: ["Copies drift apart:", "consistent or available?"],
    dur: 12.2,
    caps: [
      [0.6, 3.1, "Against crashes, keep a copy in each city."],
      [3.3, 4.7, "Now the link is cut."],
      [4.7, 7.3, "London sells a ticket; New York never hears."],
      [7.4, 9.4, "Stay consistent: refuse to answer."],
      [9.9, 12.0, "Stay available: answer, maybe stale."],
    ],
    build(stage) {
      const wire = D1.wire(stage, { x1: LX + CW, y1: WY, x2: NX, y2: WY, w: 10 });
      const heads = [
        D1.tag(stage, { x: LX, y: 12, text: "London" }),
        D1.tag(stage, { x: NX, y: 12, text: "New York" }),
      ];
      const cards = [LX, NX].map((x) => D1.card(stage, { x, y: CY, w: CW, h: CH }));
      const chips = [LX, NX].map((x) =>
        D1.chip(stage, { x: x + 75, y: CHIP_Y, w: 120, h: 82, fs: 62, tone: "green", text: String(T.start) }),
      );
      const caps = [LX, NX].map((x) => D1.label(stage, { x, y: CY + 104, w: CW, text: "tickets left" }));
      const linkText = "network link";
      const link = D1.tag(stage, { x: 0, y: WY - 78, text: linkText, tone: "green" });
      const buyer = D1.user(stage, { x: LC, y: UY, name: "buyer" });
      const customer = D1.user(stage, { x: NC, y: UY, name: "customer" });
      // what each person says (blue = a request)
      const buyTag = D1.tag(stage, { x: LC + 66, y: UY - 30, text: "buy 1", tone: "blue" });
      const askText = "tickets left?";
      const askTag = D1.tag(stage, { x: NC - 56 - TW.ask, y: UY - 30, text: askText, tone: "blue" });
      // packets: one purple copy, one blue request per person
      const copy = D1.token(stage, { tone: "purple", size: 32, square: true });
      const buy = D1.token(stage, { tone: "blue", size: 32, square: true });
      const ask = D1.token(stage, { tone: "blue", size: 32, square: true });

      // New York's two options, side by side under one heading, with "or" between them
      const choose = D1.tag(stage, {
        x: 468 - TW.choose / 2,
        y: HY,
        text: "New York must choose",
        tone: "grey",
        solid: true,
      });
      const orTag = D1.label(stage, { x: 468 - 30, y: AY + AH / 2 - 20, w: 60, text: "or", bold: true });
      const mk = (i, tone, head, def) => {
        const x = AX[i];
        const card = D1.card(stage, { x, y: AY, w: AW, h: AH, tone });
        return {
          card,
          head: D1.tag(stage, { x: x + 18, y: AY + 8, text: head, tone }),
          def: D1.label(stage, { x, y: AY + 76, w: AW, text: def, tone }),
        };
      };
      const cons = mk(0, "orange", "stay consistent", "copies always agree");
      const avail = mk(1, "red", "stay available", "always answers");
      const noAns = D1.tag(stage, {
        x: AX[0] + (AW - TW.no) / 2,
        y: AY + 112,
        text: "no answer",
        tone: "orange",
        solid: true,
      });
      const staleText = `stale: it is ${T.after}`;
      const rowW = 84 + 14 + TW.stale;
      const rowX = AX[1] + (AW - rowW) / 2;
      const staleChip = D1.chip(stage, {
        x: rowX,
        y: AY + 112,
        w: 84,
        h: 58,
        fs: 46,
        tone: "red",
        solid: true,
        text: String(FAST.answer),
      });
      const staleTag = D1.tag(stage, { x: rowX + 98, y: AY + 112, text: staleText, tone: "red" });

      // New York's reply as it reaches the customer: a chip, the same size for both answers
      const rep = (tone, text) =>
        D1.chip(stage, { x: REPLY.x, y: REPLY.y, w: REPLY.w, h: REPLY.h, fs: 34, tone, solid: true, text });
      const noReply = rep("orange", "");
      const reply = rep("red", String(FAST.answer));
      const top = L5.svg(stage);
      const refuse = top.appendChild(
        L5.cross(REPLY.x + REPLY.w / 2, REPLY.y + REPLY.h / 2, 38, "orange", { on: true, w: 7 }),
      );
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
          s: 1 + 0.08 * toLondon + 0.08 * flash(t, 4.7, 5.2),
        });
        chips[1].set({
          text: String(T.start),
          tone: nyStale ? "red" : "green",
          k: kn(1),
          s: 1 + 0.08 * toNY + 0.1 * flash(t, S.stale[0], 6.3) + 0.08 * flash(t, S.reply - 0.05, S.reply + 0.4),
          ring: t < S.reply ? "orange" : "red",
          ringK: rk,
        });

        // the link tag says "network link", then "cut"
        const word = cut > 0.2 ? "cut" : linkText;
        link.set({
          text: word,
          tone: cut > 0.2 ? "red" : "green",
          solid: cut > 0.2,
          x: MID - (cut > 0.2 ? TW.cut : TW.link) / 2,
          k: ramp(t, 0.55, 0.9, E.lin),
        });

        // people: the customer is orange while New York decides, red once it has been misled
        const asked = ramp(t, S.askHop[1], S.askHop[1] + 0.1, E.lin);
        const misled = ramp(t, S.reply, S.reply + 0.15, E.lin);
        buyer.set({ k: kc(0), s: 1 + 0.1 * flash(t, S.buyHop[0] - 0.2, S.buyHop[0] + 0.3) });
        customer.set({
          k: kc(1),
          s: 1 + 0.1 * flash(t, S.askTag - 0.1, S.askTag + 0.4),
          tone: misled > 0.5 ? "red" : asked > 0.5 ? "orange" : "grey",
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

        // New York's two options (the one after the other, with "or" between them)
        const kk = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
        choose.set({ k: kk(S.choose) });
        cons.card.set({ k: kk(S.cons, 0.5) });
        cons.head.set({ k: kk(S.cons, 0.4) });
        cons.def.set({ k: kk(S.cons + 0.3) });
        noAns.set({ k: kk(S.noReply + 0.2) });
        orTag.set({ k: kk(S.or, 0.3) });
        avail.card.set({ k: kk(S.avail, 0.5) });
        avail.head.set({ k: kk(S.avail, 0.4) });
        avail.def.set({ k: kk(S.avail + 0.3) });
        staleChip.set({ k: kk(S.reply + 0.2) });
        staleTag.set({ k: kk(S.reply + 0.4) });

        // what reaches the customer: first the refusal (an orange chip with a cross), then the red 5
        const nk = kk(S.noReply, 0.4);
        const nGone = 1 - kk(S.reply - 0.15, 0.2);
        noReply.set({ k: nk, o: nGone });
        V.place(refuse, { s: 0.6 + 0.4 * E.pop(nk), o: Math.min(1, nk * 4) * nGone });
        reply.set({ k: kk(S.reply, 0.4) });
      };
    },
  });
})();
