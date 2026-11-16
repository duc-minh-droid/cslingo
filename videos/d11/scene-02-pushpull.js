/* Lecture 11 (ds-11) · scene 2 (PUSH, PULL, BROADCAST): the simplest patterns that move data between machines (lesson 11.1).
   Push: A decides and sends its 7 to B (1 message). Pull: B asks first, A replies (2 messages). Broadcast: A sends the same
   50 MB model to C1..C4, one copy each, so 4 × 50 = 200 MB leaves A (D11.PAT).
   Story (local seconds): 0.2 A and B; 1.0 push; 2.8 pull (ask 3.1, reply 4.3); 5.8 broadcast to four receivers; 8.4 the total. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const P = D11.PAT;
  const fm = D11.fm;
  D11.same("push / pull / broadcast messages", [P.msgs.push, P.msgs.pull, P.copies], [1, 2, 4]);
  D11.same("broadcast MB leaving A", P.copies * P.model, P.sent);

  const T = {
    pop: 0.2,
    wire: 0.6,
    push: [1.0, 2.1],
    pull: 2.8,
    ask: [3.1, 4.1],
    reply: [4.3, 5.3],
    bc: 5.8,
    recv: 6.0,
    fly: 6.6,
    total: 8.4,
  };
  const MB = `${fm(P.model)} MB`;
  const flyAt = (t, i) => D11.seq(t, T.fly, 0.12, 0.9, i);
  const landed = (i) => T.fly + 0.12 * i + 0.9;

  V.scene({
    kicker: "PUSH, PULL, BROADCAST",
    title: ["Who starts the talk,", "and who gets the data"],
    dur: 11,
    caps: [
      [0.4, 2.6, `Push: A sends its ${fm(P.A)} to B. One message.`],
      [3, 5.6, "Pull: B asks first, then A replies. Two messages."],
      [6, 8.2, `Broadcast: A sends the same ${MB} model to four machines.`],
      [8.6, 10.7, `Four copies leave A: ${P.copies} × ${fm(P.model)} = ${fm(P.sent)} MB.`],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const AR = { x: 272, y: 320 };
      const BL = { x: 664, y: 320 };
      const wAB = D4.wire(svg, { pts: [AR, BL] });
      const CY = [12, 166, 320, 474]; // h 146: tall enough for the server icon
      const cIn = CY.map((y) => ({ x: 664, y: y + 73 }));
      const wC = cIn.map((p) => D4.wire(svg, { pts: [AR, p] }));

      const A = D4.node(stage, { x: 12, y: 230, w: 260, h: 180, name: "A", value: "7", icon: "server" });
      const B = D4.node(stage, { x: 664, y: 230, w: 260, h: 180, name: "B", value: "", icon: "server" });
      const C = CY.map((y, i) =>
        D4.node(stage, { x: 664, y, w: 260, h: 146, name: `C${i + 1}`, value: "", icon: "server" }),
      );
      const name = D4.tag(stage, { x: 142, y: 470, text: "Push", tone: "grey", solid: true, fs: 30 });
      const count = D4.tag(stage, { x: 142, y: 540, text: "", tone: "purple" });
      const total = D4.tag(stage, {
        x: 142,
        y: 600,
        text: `${P.copies} × ${fm(P.model)} = ${fm(P.sent)} MB`,
        tone: "purple",
        solid: true,
      });

      const pPush = D4.packet(stage, { text: fm(P.A), tone: "purple" });
      const pAsk = D4.packet(stage, { text: "ask", tone: "purple" });
      const pReply = D4.packet(stage, { text: fm(P.A), tone: "purple" });
      const pBc = CY.map(() => D4.packet(stage, { text: MB, tone: "purple" }));

      return (t) => {
        const k = ramp(t, T.pop, T.pop + 0.4, E.lin);
        const bOut = 1 - ramp(t, T.bc, T.bc + 0.5, E.lin);
        const isBc = t >= T.bc;
        const isPull = t >= T.pull && !isBc;

        // the machines and the wire
        A.set({
          k,
          value: t >= T.bc + 0.2 ? MB : fm(P.A),
          vtone: "blue",
          ring: "purple",
          ringK: ramp(t, T.total, T.total + 0.4, E.lin),
          bump: flash(t, T.total, T.total + 0.3),
        });
        wAB.set({ k: ramp(t, T.wire, T.wire + 0.4, E.out), o: bOut });
        const bGot = (t >= T.push[1] && t < T.pull) || (t >= T.reply[1] && !isBc); // B holds the 7 after a push or a pull
        B.set({
          k,
          o: bOut,
          value: bGot ? fm(P.A) : "",
          vtone: "green",
          bump: flash(t, T.push[1], T.push[1] + 0.3) + flash(t, T.reply[1], T.reply[1] + 0.3),
        });

        // the pattern name and the message counter (messages sent so far)
        name.set({
          k: ramp(t, 0.8, 1.1, E.lin),
          text: isBc ? "Broadcast" : isPull ? "Pull" : "Push",
          s: 1 + 0.12 * (flash(t, T.pull, T.pull + 0.3) + flash(t, T.bc, T.bc + 0.3)),
        });
        let msgs;
        if (isBc) msgs = t >= 8.0 ? -1 : 0;
        else if (isPull) msgs = t >= T.reply[0] ? P.msgs.pull : t >= T.ask[0] ? 1 : 0;
        else msgs = t >= T.push[0] ? P.msgs.push : 0;
        const cText = msgs === -1 ? `${P.copies} copies` : msgs === 1 ? "1 message" : `${msgs} messages`;
        count.set({
          k: msgs ? 1 : 0,
          text: msgs ? cText : "",
          s: 1 + 0.12 * flash(t, T.reply[0], T.reply[0] + 0.3),
        });

        // push and pull packets
        D11.fly(pPush, AR, BL, ramp(t, T.push[0], T.push[1], E.inOut));
        D11.fly(pAsk, BL, AR, ramp(t, T.ask[0], T.ask[1], E.inOut), { bow: 50 });
        D11.fly(pReply, AR, BL, ramp(t, T.reply[0], T.reply[1], E.inOut));

        // broadcast: four receivers, four copies of the model
        C.forEach((c, i) => {
          const got = t >= landed(i);
          c.set({
            k: D11.seq(t, T.recv, 0.1, 0.4, i),
            value: got ? MB : "",
            vtone: "green",
            bump: flash(t, landed(i), landed(i) + 0.3),
          });
          wC[i].set({ k: E.out(D11.seq(t, T.recv, 0.1, 0.5, i)) });
          D11.fly(pBc[i], AR, cIn[i], E.inOut(flyAt(t, i)));
        });
        total.set({ k: ramp(t, T.total, T.total + 0.4, E.lin) });
      };
    },
  });
})();
