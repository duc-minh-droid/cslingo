/* Lecture 12 (ds-12) · scene 9 (IMAGES AND THE DOCKERFILE): an image is a read-only template, a container a running instance; a
   Dockerfile builds the image one layer per line and the layer cache redoes only the first changed layer and everything after
   it (lesson 12.5; D12.DF and D12.build, the lesson's own code: rebuilt / cached 4 / 0, 1 / 3, 3 / 1).
   Story (local seconds): 0.5 a purple "Forecaster image" card; 1.2 / 1.5 / 1.8 three green "Container N" cards, joined by grey
   lines. 3.0 they slide away; "docker build" and Mo's four Dockerfile lines appear as orange rows (code + what it adds).
   5.6 first build: a red "rebuilt" chip on each row in turn (0.3 s apart), counter "4 built, now in the cache". 7.8 tag
   "changed: your code" (row 4 gets an orange ring); 8.2 second pass: green "from cache" x 3, red "rebuilt" on row 4; 9.6
   counter "1 rebuilt, 3 from cache". 10.8 tag "changed: the library list" (ring on row 2); 11.2 third pass: row 1 green, rows 2
   to 4 red; 12.6 counter "3 rebuilt, 1 from cache". */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;

  const P = D12.PASSES;
  const DF = D12.DF;
  const T = { image: 0.5, away: 3.0, file: 3.2, passes: [5.6, 8.2, 11.2], changed: [null, 7.8, 10.8] };
  const CHANGED = [null, "changed: your code", "changed: the library list"];
  const ringRow = P.map((p) => (p.change === "all" ? -1 : DF.findIndex((l) => l[2].includes(p.change))));
  D12.same("scene 9 changed rows", ringRow, [-1, 3, 1]);
  const COUNT = P.map((p, i) =>
    i === 0 ? `${p.rebuilt} built, now in the cache` : `${p.rebuilt} rebuilt, ${p.cached} from cache`,
  );
  D12.same("scene 9 counters", COUNT.slice(1), ["1 rebuilt, 3 from cache", "3 rebuilt, 1 from cache"]);
  const passOf = (t) => {
    let p = -1;
    T.passes.forEach((s, i) => {
      if (t >= (T.changed[i] ?? s)) p = i;
    });
    return p;
  };

  V.scene({
    kicker: "IMAGES AND THE DOCKERFILE",
    title: ["The image is the recipe,", "the container is the dish"],
    dur: 14,
    caps: [
      [0.4, 2.8, "One image, three running containers."],
      [3.0, 5.4, "A Dockerfile builds the image line by line, one layer each."],
      [5.6, 7.6, "First build: every layer is made and cached."],
      [7.8, 10.6, `Change only your code: ${P[1].rebuilt} layer rebuilt, ${P[1].cached} from cache.`],
      [10.8, 13.7, "Change the library list: rebuilt from that line down."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const CY = [110, 290, 470];
      const wires = CY.map((y) =>
        D4.wire(svg, {
          pts: [
            { x: 360, y: 290 },
            { x: 600, y },
          ],
        }),
      );
      const image = D12.box(stage, {
        x: 40,
        y: 230,
        w: 320,
        h: 120,
        text: "Forecaster image",
        sub: "read-only template",
        tone: "purple",
      });
      const cons = CY.map((y, i) =>
        D12.box(stage, {
          x: 600,
          y: y - 55,
          w: 300,
          h: 110,
          text: `Container ${i + 1}`,
          sub: "running",
          tone: "green",
        }),
      );

      const head = D4.label(stage, { x: 12, y: 28, text: "docker build", fs: 34, anchor: "l" });
      const rows = DF.map((l, i) =>
        D12.box(stage, {
          x: 12,
          y: 64 + i * 96,
          w: 690,
          h: 86,
          text: l[0],
          sub: l[1],
          tone: "orange",
          fs: 28,
          mono: true,
          align: "l",
        }),
      );
      const chips = DF.map((_, i) => D4.tag(stage, { x: 820, y: 107 + i * 96, text: "", fs: 30 }));
      const changed = D4.tag(stage, { x: 468, y: 498, text: "", tone: "orange" });
      const count = D4.tag(stage, { x: 468, y: 570, text: "", tone: "grey", solid: true, fs: 32 });

      return (t) => {
        const away = ramp(t, T.away, T.away + 0.4, E.lin);
        const o1 = 1 - away;
        image.set({ k: ramp(t, T.image, T.image + 0.4, E.lin), x: -80 * away, o: o1 });
        cons.forEach((c, i) => {
          const at = 1.2 + 0.3 * i;
          c.set({ k: ramp(t, at, at + 0.4, E.lin), x: -80 * away, o: o1 });
          wires[i].set({ k: ramp(t, at - 0.3, at + 0.1, E.out), o: o1 });
        });

        head.set({ k: ramp(t, T.file, T.file + 0.4) });
        const p = passOf(t);
        rows.forEach((r, i) => {
          const k = ramp(t, T.file + 0.3 + 0.3 * i, T.file + 0.7 + 0.3 * i, E.lin);
          const ringed = p > 0 && ringRow[p] === i;
          const at = p > 0 ? T.changed[p] : 0;
          r.set({
            k,
            ring: ringed ? "orange" : undefined,
            ringK: ramp(t, at, at + 0.3),
            s: 1 + (ringed ? 0.03 * flash(t, at, at + 0.4) : 0),
          });
        });
        chips.forEach((c, i) => {
          if (p < 0) return c.set({ k: 0 });
          const at = T.passes[p] + 0.3 * i;
          const redo = P[p].redo[i];
          c.set({
            k: ramp(t, at, at + 0.3, E.lin),
            text: redo ? "rebuilt" : "from cache",
            tone: redo ? "red" : "green",
            solid: true,
          });
        });
        const pc = p < 0 ? 0 : T.passes[p] + 1.4;
        count.set({ k: p < 0 ? 0 : ramp(t, pc, pc + 0.4, E.lin), text: p < 0 ? "" : COUNT[p] });
        changed.set({ k: p > 0 ? ramp(t, T.changed[p], T.changed[p] + 0.3, E.lin) : 0, text: p > 0 ? CHANGED[p] : "" });
      };
    },
  });
})();
