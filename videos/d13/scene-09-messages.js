/* Lecture 13 (ds-13) · scene 9 (DISTRIBUTED MEMORY AND MPI): Crumb's three shops run three processes, each with its own memory
   and its own processor; each sees only its own data (lesson 13.5). A message needs a send and a matching receive: process 0
   sends its total to 2 and process 2 receives from 0, delivered. If process 2 receives from 1 instead, the message does not
   match and is not received (D13.MPI). MPI, the Message Passing Interface, is the standard library for this.
   Colours: purple processes and the MPI band, orange memory and the envelope, grey processors and plain tags, red walls and
   the unmatched receive, green the delivered message.
   Story (local seconds): 0.5 / 0.8 / 1.1 the three processes; 2.0 red walls, 2.2 "sees only its own data"; 3.8 process 1 fades
   back, the send and receive tags; 4.2 the green line, 4.6-5.9 the envelope flies 0 -> 2, 6.0 tick and "delivered";
   7.4 the receive flips to "receive(from 1)", the line turns red dashed, 7.7-8.6 the envelope stops halfway, 8.6 a red
   cross and "no match"; 10.2 the purple MPI band, 10.6 its two grey tags. Hold to 13. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, lerp, ease: E } = V;
  const M = D13.MPI;
  D13.same("mpi scene: matched, unmatched", [M.ok, M.wrong], [true, false]);

  const COLW = 300;
  const colX = (c) => c * 318;
  const cx = (c) => colX(c) + COLW / 2;
  const LINE_Y = 404;
  const REPLAY = 7.4;

  V.scene({
    kicker: "DISTRIBUTED MEMORY AND MPI",
    title: ["No shared worktop,", "so send messages"],
    dur: 13,
    caps: [
      [0.4, 3.6, "Distributed memory: each process sees only its own data."],
      [3.8, 7.2, "A message needs a send and a matching receive."],
      [7.4, 10.0, "Receive from the wrong sender: no match."],
      [10.2, 12.7, "MPI is the standard library for this."],
    ],
    build(stage) {
      const cols = M.shops.map((shop, c) => {
        const g = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
        stage.append(g);
        const out = D13.outline(g, {
          x: colX(c),
          y: 12,
          w: COLW,
          h: 282,
          tone: "purple",
          label: `Process ${c}`,
          fill: true,
        });
        const mem = D13.box(g, {
          x: colX(c) + 18,
          y: 62,
          w: 264,
          h: 120,
          tone: "orange",
          title: "Own memory",
          sub: `${shop} receipts`,
          fs: 30,
        });
        const cpu = D13.box(g, {
          x: colX(c) + 18,
          y: 200,
          w: 264,
          h: 74,
          tone: "grey",
          title: "Own processor",
          fs: 30,
        });
        return { g, out, mem, cpu };
      });
      const svg = V.l5.svg(stage);
      const walls = [309, 627].map((x) => D13.seg(svg, { a: { x, y: 12 }, b: { x, y: 294 }, tone: "red", w: 10 }));
      const own = D4.tag(stage, { x: 468, y: 336, text: "sees only its own data", tone: "red", solid: true });
      const send = D4.tag(stage, {
        x: cx(M.msg.from),
        y: 336,
        text: `send(total, to ${M.msg.to})`,
        tone: "purple",
        solid: true,
      });
      const recv = D4.tag(stage, { x: cx(M.msg.to), y: 336, text: "", tone: "purple", solid: true });
      const good = D13.seg(svg, { a: { x: cx(0), y: LINE_Y }, b: { x: cx(2), y: LINE_Y }, tone: "green", w: 8 });
      const bad = D13.seg(svg, {
        a: { x: cx(0), y: LINE_Y },
        b: { x: cx(2), y: LINE_Y },
        tone: "red",
        w: 8,
        dash: "16 14",
      });
      const svgTop = V.l5.svg(stage);
      const env = svgTop.appendChild(D13.envelope(0, 0, 70));
      const tick = svgTop.appendChild(V.l5.tick(cx(2) + 70, LINE_Y, 50, "green", { w: 10 }));
      const cross = svgTop.appendChild(V.l5.cross(468, LINE_Y + 2, 60, "red", { w: 12 }));
      const delivered = D4.tag(stage, {
        x: 468,
        y: 466,
        text: "both sides play their part: delivered",
        tone: "green",
        solid: true,
      });
      const noMatch = D4.tag(stage, {
        x: 468,
        y: 466,
        text: "the receive names the wrong sender: no match",
        tone: "red",
        solid: true,
      });
      const band = D13.box(stage, {
        x: 12,
        y: 504,
        w: 912,
        h: 60,
        tone: "purple",
        title: "MPI: Message Passing Interface",
        solid: true,
        r: 18,
      });
      const tagsMPI = [
        ["standard library spec", 270],
        ["language-independent", 666],
      ].map(([text, x]) => D4.tag(stage, { x, y: 604, text, tone: "grey" }));

      const at = (p) => env.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      return (t) => {
        cols.forEach((c, i) => {
          const k = ramp(t, 0.5 + 0.3 * i, 0.9 + 0.3 * i, E.lin);
          c.out.set({ k });
          c.mem.set({ k: ramp(t, 0.6 + 0.3 * i, 1.0 + 0.3 * i, E.lin) });
          c.cpu.set({ k: ramp(t, 0.7 + 0.3 * i, 1.1 + 0.3 * i, E.lin) });
          const back = i === 1 ? ramp(t, 3.8, 4.2, E.lin) : 0;
          V.show(c.g, 1 - 0.7 * back);
        });
        const kw = ramp(t, 2.0, 2.4, E.out);
        walls.forEach((w) => w.set({ k: kw, o: 1 - 0.7 * ramp(t, 3.8, 4.2, E.lin) }));
        own.set({ k: ramp(t, 2.2, 2.5, E.lin), o: 1 - ramp(t, 3.6, 3.8, E.lin), s: 1 + 0.08 * flash(t, 2.0, 2.4) });

        const replay = t >= REPLAY;
        send.set({ k: ramp(t, 3.8, 4.1, E.lin) });
        const from = replay ? M.bad.from : M.good.from;
        recv.set({
          k: ramp(t, 3.9, 4.2, E.lin),
          text: `receive(from ${from})`,
          tone: replay ? "red" : "purple",
          s: 1 + 0.12 * flash(t, REPLAY, REPLAY + 0.4),
        });
        good.set({ k: ramp(t, 4.2, 4.6, E.out), o: replay ? 0 : 1 });
        bad.set({ k: ramp(t, REPLAY, REPLAY + 0.3, E.out), o: replay ? 1 : 0 });

        // the envelope: delivered the first time, stuck halfway the second time
        const a = { x: cx(0), y: LINE_Y };
        if (!replay) {
          const k = ramp(t, 4.6, 5.9, E.inOut);
          at({ x: lerp(a.x, cx(2), k), y: LINE_Y });
          V.show(env, k > 0 ? 1 - ramp(t, 7.0, 7.3, E.lin) : 0);
        } else {
          const k = ramp(t, 7.7, 8.6, E.out);
          at({ x: lerp(a.x, 468 - 70, k), y: LINE_Y });
          V.show(env, k > 0 ? 1 : 0);
        }
        V.l5.drawOn(tick, t < REPLAY ? ramp(t, 6.0, 6.3, E.out) : 0);
        delivered.set({ k: ramp(t, 6.1, 6.4, E.lin), o: replay ? 0 : 1 });
        V.l5.drawOn(cross, ramp(t, 8.6, 8.9, E.out));
        noMatch.set({ k: ramp(t, 8.8, 9.1, E.lin) });

        band.set({ k: ramp(t, 10.2, 10.6, E.lin), y: 20 * (1 - ramp(t, 10.2, 10.6, E.out)) });
        tagsMPI.forEach((g, i) => g.set({ k: ramp(t, 10.6 + 0.2 * i, 10.9 + 0.2 * i, E.lin) }));
      };
    },
  });
})();
