/* Lecture 8 (ds-8) · scene 2 (BATCH): a batch job reads a BOUNDED input (three log files, 10,000 lines) to its end, knows it has
   finished and writes a derived output file; a feed of social media posts never ends, so a batch job would wait forever
   (lesson 8.1, steps 'Batch processing: bounded input' and 'Unbounded data'). Numbers from D8.BATCH and D8.FEED (asserted).
   Colours: purple = the batch run (a file being read, the job while it reads), green = done / derived output, blue = new posts,
   orange = waiting, red = the cross on "no end", grey = neutral files and labels.
   Story (local seconds): 0.3 files and the job pop; 1.0-3.4 the job reads the files one by one and counts the lines; 3.5 finished
   (green, tick, "bounded input"); 4.0 an arrow to the output file "views per page"; 6.0 the feed card pops; 6.3 posts arrive one
   every 0.7 s; 6.6 the job turns orange "waiting for the end"; 9.0 "unbounded: no end" gets a red cross. Hold. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const B = D8.BATCH;

  D8.same(
    "batch scene: three files of 4,000, 2,500 and 3,500 lines, 10,000 in all",
    [B.files.map(D8.fmtN), B.cum.map(D8.fmtN), B.output],
    [["4,000", "2,500", "3,500"], ["4,000", "6,500", "10,000"], "views per page"],
  );
  const T = {
    pop: 0.3,
    read: 1.0,
    step: 0.8,
    fin: 3.5,
    arrow: 4.0,
    out: 4.4,
    card: 6.0,
    feed: 6.3,
    wait: 6.6,
    noEnd: 9.0,
  };
  const EVERY = 0.7;
  const LAST = 11.8;
  const NPOSTS = Math.floor((LAST - T.feed) / EVERY + 1e-9) + 1;
  D8.same("batch scene: eight posts arrive before the end", [NPOSTS, D8.FEED(1).text], [8, "09:07 ana likes"]);
  const PITCH = 64;
  const NEW_Y = 512;
  const FILE_X = [70, 190, 310];

  V.scene({
    kicker: "BATCH",
    title: ["A batch job", "needs an end"],
    dur: 12,
    caps: [
      [0.5, 3.4, "A batch job reads three log files."],
      [3.6, 6, "The input is bounded, so the job finishes."],
      [6.3, 8.8, "But posts keep arriving: the data is unbounded."],
      [9, 11.6, "The end never comes, so the job waits forever."],
    ],
    build(stage) {
      // ---- left: three files, the job, the output ----
      const under = D4.svg(stage);
      const files = FILE_X.map((x) => ({
        grey: under.appendChild(D8.file(x, 120, 92, "grey")),
        purple: under.appendChild(D8.file(x, 120, 92, "purple")),
        green: under.appendChild(D8.file(x, 120, 92, "green")),
      }));
      const sizes = FILE_X.map((x, i) =>
        D4.label(stage, { x, y: 196, text: `${D8.fmtN(B.files[i])}`, tone: "grey", fs: 28 }),
      );
      const bounded = D4.tag(stage, { x: 190, y: 36, text: "bounded input", tone: "grey" });
      const toOut = under.appendChild(L5.arrow(250, 416, 312, 470, "grey", 1, { w: 6, head: 18, bow: -10 }));
      const outFile = under.appendChild(D8.file(360, 480, 92, "green"));
      const outTag = D4.tag(stage, { x: 300, y: 576, text: B.output, tone: "green" });
      const feedArrow = under.appendChild(L5.arrow(480, 335, 372, 335, "orange", 1, { w: 6, head: 20 }));
      feedArrow.querySelector("[data-draw]").style.strokeDasharray = "0.12 0.08"; // the path has pathLength 1
      const job = D4.node(stage, {
        x: 60,
        y: 260,
        w: 300,
        h: 150,
        name: "Batch job",
        value: "0",
        unit: "lines read",
        icon: "server",
        tone: "purple",
      });
      const waiting = D4.tag(stage, { x: 210, y: 470, text: "waiting for the end", tone: "orange", solid: true });
      const over = D4.svg(stage);
      const tick = over.appendChild(L5.tick(392, 300, 44, "green", { ink: true, w: 9 }));

      // ---- right: the feed of new posts ----
      const card = D4.card(stage, { x: 486, y: 12, w: 438, h: 616, plain: true });
      const head = D4.tag(stage, { x: 705, y: 52, text: "New posts", tone: "blue", solid: true });
      const unb = D4.tag(stage, { x: 705, y: 112, text: "unbounded input", tone: "grey" });
      const top = D4.svg(stage);
      const cross = top.appendChild(L5.cross(540, 112, 34, "red", { w: 8 }));
      const posts = D8.range(1, NPOSTS).map((n) =>
        D4.packet(stage, { x: 705, y: NEW_Y, text: D8.FEED(n).text, tone: "blue", fs: 28 }),
      );
      const count = D4.tag(stage, { x: 705, y: 590, text: "", tone: "grey" });

      return (t) => {
        // files and job pop
        files.forEach((f, i) => {
          const k = D4.seq(t, T.pop, 0.12, 0.4, i);
          const a = T.read + T.step * i;
          const reading = t >= a && t < a + T.step;
          const done = t >= a + T.step;
          const place = { s: (0.6 + 0.4 * E.pop(k)) * (1 + 0.08 * (reading ? flash(t, a, a + 0.35) : 0)), o: k };
          V.place(f.grey, { ...place, o: reading || done ? 0 : k });
          V.place(f.purple, { ...place, o: reading ? k : 0 });
          V.place(f.green, { ...place, o: done ? k : 0 });
          sizes[i].set({ k });
        });
        // lines read: linear inside each file, then held at 10,000
        let lines = 0;
        B.files.forEach((n, i) => {
          lines += n * ramp(t, T.read + T.step * i, T.read + T.step * (i + 1), E.lin);
        });
        lines = Math.round(lines / 10) * 10;
        const fin = t >= T.fin;
        const nPosts = t < T.feed ? 0 : Math.min(NPOSTS, Math.floor((t - T.feed) / EVERY + 1e-9) + 1);
        const waitOn = t >= T.wait;
        job.set({
          k: ramp(t, T.pop, T.pop + 0.4, E.lin),
          tone: waitOn ? "orange" : fin ? "green" : "purple",
          value: waitOn ? `${nPosts}` : D8.fmtN(lines),
          unit: waitOn ? "posts read" : fin ? "finished" : "lines read",
          bump: flash(t, T.fin, T.fin + 0.35) + flash(t, T.wait, T.wait + 0.35),
        });
        const tk = ramp(t, T.fin, T.fin + 0.4, E.lin) * (1 - ramp(t, T.wait - 0.2, T.wait, E.lin));
        L5.drawOn(tick, tk);
        V.place(tick, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
        bounded.set({ k: ramp(t, T.fin, T.fin + 0.4, E.lin) });
        // the derived output, then it fades when the feed takes over
        const gone = 1 - ramp(t, T.wait, T.wait + 0.4, E.lin);
        const ak = ramp(t, T.arrow, T.arrow + 0.6);
        L5.drawOn(toOut, ak);
        V.show(toOut, ak > 0 ? gone : 0);
        const ok = ramp(t, T.out, T.out + 0.4, E.lin);
        V.place(outFile, { s: 0.6 + 0.4 * E.pop(ok), o: ok * gone });
        outTag.set({ k: ok, o: gone });
        // waiting for the end: pulses every 1.4 s
        const wk = ramp(t, T.wait, T.wait + 0.4, E.lin);
        const pulse = t > T.wait + 0.6 ? flash((t - T.wait - 0.6) % 1.4, 0, 0.5) : 0;
        waiting.set({ k: wk, s: 1 + 0.04 * pulse });
        V.show(feedArrow, ramp(t, T.wait + 0.2, T.wait + 0.7, E.lin));
        // the feed card
        const ck = ramp(t, T.card, T.card + 0.4, E.lin);
        card.set({ k: ck });
        head.set({ k: ck });
        const nk = ramp(t, T.noEnd, T.noEnd + 0.4, E.lin);
        unb.set({
          k: ramp(t, T.feed, T.feed + 0.4, E.lin),
          text: t >= T.noEnd ? "unbounded: no end" : "unbounded input",
          x: t >= T.noEnd ? 20 : 0,
          s: 1 + 0.1 * flash(t, T.noEnd, T.noEnd + 0.35),
        });
        L5.drawOn(cross, nk);
        V.place(cross, { s: 0.6 + 0.4 * E.pop(nk), o: nk });
        // posts slide up, newest at the bottom
        const u = nPosts ? E.out(clamp((t - T.feed - (nPosts - 1) * EVERY) / 0.35)) : 1;
        posts.forEach((p, j) => {
          const n = j + 1;
          if (n > nPosts) return p.set({ k: 0 });
          const r = nPosts - n - (1 - u); // rank above the newest (fractional while sliding)
          const fadeTop = clamp(5 - r);
          p.set({ k: n === nPosts ? u : 1, y: -PITCH * r, o: fadeTop });
        });
        count.set({ k: ramp(t, T.feed, T.feed + 0.4, E.lin), text: `posts so far: ${nPosts}` });
      };
    },
  });
})();
