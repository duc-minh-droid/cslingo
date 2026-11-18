/* Data Science (COM3021), Lecture 10: concept drift detection.
   This part: the figures and the detector-race demo of 10.3 to 10.5 (ADWIN, DDM and EDDM). Lessons: ds-l10-04.js. */
(function () {
  const S = NIC.shared.ds10;
  const N = NIC;
  const { qs } = N;
  const F = N.fig;
  const { fm, seg, stats, setStats, svg, tx, chart, avg, KIND } = S;
  const { world, ddm, adwin, splits, strip } = S;

  /* ---------- 10.2 figures ---------- */
  /** ADWIN on a live loop: the window grows while the stream is stable and is cut after a drift at record 250. */
  function growFig(box, life) {
    const w = world(5),
      A = adwin(),
      rec = [];
    for (let t = 0; t < 600; t++) {
      if (t === 250) w.inject("abrupt");
      const { x } = w.next(),
        cut = A.add(x);
      rec.push({ x, win: A.W.length, cut });
    }
    const C = chart({
      w: 520,
      h: 200,
      x: [0, 600],
      y: [0, 400],
      tx: [0, 250, 600],
      ty: [0, 200, 400],
      xl: "record",
      yl: "window size",
      label: "ADWIN's window grows with the stream, is cut soon after the drift at record 250, then grows again",
    });
    box.innerHTML = `<div></div><div class="fig-cap"></div>`;
    let k = 60;
    const draw = () => {
      const r = rec[k - 1],
        x0 = C.X(k - r.win);
      box.firstChild.innerHTML = C.wrap(
        strip(
          rec.slice(0, k).map((q) => q.x),
          C.X(0),
          C.Y(400) - 2,
          ((C.X(600) - C.X(0)) * k) / 600,
          10,
        ) +
          `<path d="M${x0} ${C.Y(400) + 14}v5H${C.X(k)}v-5" fill="none" stroke="var(--blue)" stroke-width="2.5"/><line x1="${C.X(250)}" y1="${C.Y(380)}" x2="${C.X(250)}" y2="${C.Y(0)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 3"/>` +
          C.path(
            rec.slice(0, k).map((q, i) => [i + 1, q.win]),
            "blue",
          ),
      );
      const cutAt = rec.findIndex((q, i) => i >= 250 && q.cut);
      box.lastChild.innerHTML = `Record <b>${k}</b>: the window holds the last <b>${r.win}</b> records. ${k < 250 ? "No change, so it keeps growing." : k <= cutAt ? "The drift has started, but the evidence is not strong enough yet." : `ADWIN cut at record ${cutAt + 1}: old records are dropped from the tail until the window agrees with itself.`}`;
    };
    life.interval(() => {
      if (!box.isConnected) return;
      k = k >= 600 ? 60 : k + 4;
      draw();
    }, 120);
    draw();
  }

  /** Stepper: ADWIN's split test on a window of 80 old records (10% errors) and up to 40 new ones (60% errors). */
  function adwinRun(box, life) {
    const old = Array.from({ length: 80 }, (_, i) => (i % 10 === 9 ? 1 : 0)),
      neu = Array.from({ length: 40 }, (_, i) => [1, 0, 1, 0, 1][i % 5]);
    const all = [...old, ...neu];
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = `<div class="ds10-cells"></div>`;
        return stage.firstChild;
      },
      *frames() {
        let start = 0;
        const best = (W) =>
          splits(W).reduce((b, q) => (q.gap - q.eps > b.gap - b.eps ? q : b), { gap: -1, eps: 1, i: 0 });
        const fr = (end, cap, cut) => {
          const W = all.slice(start, end),
            b = best(W);
          return {
            start,
            end,
            split: start + b.i,
            cut,
            cap: `${cap} Best split: older ${b.i} at <b>${fm(100 * b.m0, 0)}%</b> errors, newer ${W.length - b.i} at <b>${fm(100 * b.m1, 0)}%</b>. Gap ${fm(b.gap, 3)} ${b.gap >= b.eps ? "≥" : "<"} ε<sub>cut</sub> ${fm(b.eps, 3)}.`,
          };
        };
        yield fr(80, "80 records, about 10% errors: the window is the whole stream so far.");
        for (let end = 81; end <= 120; end++) {
          const W = all.slice(start, end);
          if (splits(W).some((q) => q.gap >= q.eps)) {
            yield fr(end, `Record ${end} arrives and some split now differs by more than ε<sub>cut</sub>.`, true);
            const s0 = start;
            while (splits(all.slice(start, end)).some((q) => q.gap >= q.eps)) start++;
            yield fr(end, `Cut: drop the ${start - s0} oldest records until no split differs enough.`);
            return;
          }
          if (end % 5 === 0) yield fr(end, `${end - 80} new records, 60% of them errors.`);
        }
      },
      draw(box2, f) {
        box2.innerHTML = all
          .slice(0, f.end)
          .map(
            (x, i) =>
              `<span class="ds10-cell ${x ? "err" : ""} ${i < f.start ? "gone" : i < f.split ? "w0" : "w1"}"></span>`,
          )
          .join("");
      },
    });
  }

  /** DDM's spread: after n records with error rate p, s = √(p(1 − p)/n). */
  function spreadFig(box) {
    let p = 0.1;
    const sl = N.slider("Records seen", 30, 400, 10, 100, (v) => v);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.children[1].append(sl);
    const draw = () => {
      const n = sl.value,
        s = Math.sqrt((p * (1 - p)) / n);
      const X = (v) => 30 + v * 1200;
      const ticks = [0, 0.1, 0.2, 0.3, 0.4]
        .map(
          (v) =>
            `<line x1="${X(v)}" y1="96" x2="${X(v)}" y2="104" stroke="var(--line-2)" stroke-width="2"/>${tx(X(v), 120, fm(v), { s: 11, c: "var(--text-faint)" })}`,
        )
        .join("");
      box.children[2].innerHTML = svg(
        540,
        130,
        `<line x1="30" y1="100" x2="510" y2="100" stroke="var(--line-2)" stroke-width="2"/>${ticks}<rect x="${X(p - s)}" y="44" width="${X(p + s) - X(p - s)}" height="32" rx="8" fill="color-mix(in srgb,var(--blue) 22%,var(--panel))" stroke="var(--blue)" stroke-width="2"/><line x1="${X(p)}" y1="38" x2="${X(p)}" y2="82" stroke="var(--blue)" stroke-width="3"/><circle cx="${X(p + s)}" cy="60" r="6" fill="var(--violet)"/>${tx(X(p), 30, "p", { s: 12, c: "var(--blue-ink)" })}${tx(X(p + s) + 10, 64, "p + s", { s: 12, a: "start", c: "var(--violet-ink)" })}`,
        `Error rate ${p} with a band of plus or minus ${fm(s, 3)} after ${n} records`,
      );
      box.lastChild.innerHTML = `${n} records, ${fm(p * n, 0)} errors: p = <b>${fm(p)}</b>, s = √(${fm(p)} × ${fm(1 - p)} ÷ ${n}) = <b>${fm(s, 3)}</b>, so p + s = <b>${fm(p + s, 3)}</b>. More records, narrower band.`;
    };
    seg(box.firstChild, "0.1:Error rate 10%|0.3:30%", "0.1", (v) => {
      p = +v;
      draw();
    });
    sl.onInput(draw);
    draw();
  }

  /** Stepper: DDM on 120 records at 10% errors, then 50%. Every number comes from the detector. */
  function ddmRun(box, life) {
    const xs = Array.from({ length: 200 }, (_, i) => (i < 120 ? (i % 10 === 4 ? 1 : 0) : i % 2));
    const C = chart({
      w: 520,
      h: 220,
      x: [0, 160],
      y: [0, 30],
      tx: [0, 40, 80, 120, 160],
      ty: [0, 10, 20, 30],
      xl: "records seen",
      yl: "per cent",
      label: "DDM: p + s against the warning and change lines as records arrive",
    });
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = C.wrap("<g></g>");
        return stage.querySelector("svg g:last-child");
      },
      *frames() {
        const D = ddm(),
          hist = [];
        let was = "stable";
        for (let n = 1; n <= 200; n++) {
          const s = D.add(xs[n - 1]);
          if (D.ready()) hist.push([n, 100 * (D.p + D.s), 100 * (D.pmin + 2 * D.smin), 100 * (D.pmin + 3 * D.smin)]);
          const say = `${n} records, ${D.e} errors: p + s = <b>${fm(D.p + D.s, 3)}</b>. Warning at ${fm(D.pmin + 2 * D.smin, 3)}, change at ${fm(D.pmin + 3 * D.smin, 3)}.`;
          if (s !== was)
            yield {
              hist: [...hist],
              cap: `${say} <b>${s === "warning" ? "Warning zone" : "Change detected"}</b>${n > 120 ? ` (the error rate rose at record 121)` : ""}.`,
            };
          else if (n >= 30 && n % 10 === 0) yield { hist: [...hist], cap: `${say} Stable.` };
          was = s;
          if (s === "drift") return;
        }
      },
      draw(g, f) {
        const col = (k, c, d) =>
          C.path(
            f.hist.map((r) => [r[0], r[k]]),
            c,
            d ? 'stroke-dasharray="6 4"' : "",
          );
        g.innerHTML = f.hist.length ? col(2, "amber", 1) + col(3, "rose", 1) + col(1, "blue") : "";
      },
    });
  }

  /** What happens in each DDM zone: in the warning zone new records are stored; on change the model retrains on them. */
  function zonesFig(box) {
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const CAP = {
      stable: "<b>Stable</b>: keep predicting; nothing is stored beyond the detector's two counters.",
      warning:
        "<b>Warning</b>: something may be changing. Start <b>storing</b> the new records (orange), in case they are needed.",
      drift:
        "<b>Change detected</b>: train a new model on the records stored since the warning, then <b>reset</b> the detector.",
    };
    const draw = (v) => {
      const z = { stable: 0, warning: 1, drift: 2 }[v];
      const xs = Array.from({ length: 60 }, (_, i) => (i < 30 ? i % 9 === 4 : i % 3 === 0) | 0);
      box.children[1].innerHTML = svg(
        540,
        130,
        `${z >= 1 ? `<rect x="${20 + 30 * 8}" y="16" width="${(z === 2 ? 22 : 30) * 8}" height="50" rx="6" fill="color-mix(in srgb,var(--amber) 22%,var(--panel))" stroke="var(--amber)" stroke-width="2"/>` : ""}${strip(xs.slice(0, z === 0 ? 30 : z === 1 ? 45 : 52), 20, 30, (z === 0 ? 30 : z === 1 ? 45 : 52) * 8, 30)}${z === 2 ? `<line x1="${20 + 52 * 8}" y1="10" x2="${20 + 52 * 8}" y2="74" stroke="var(--rose)" stroke-width="3"/><path class="draw" d="M${20 + 41 * 8} 80 C ${20 + 41 * 8} 112, 470 112, 470 98" fill="none" stroke="var(--teal)" stroke-width="2.5"/><rect x="440" y="96" width="80" height="26" rx="8" fill="color-mix(in srgb,var(--teal) 22%,var(--panel))" stroke="var(--teal)" stroke-width="2"/>${tx(480, 114, "new model", { s: 11.5 })}` : ""}${tx(20, 96, "time →", { a: "start", s: 11, c: "var(--text-faint)" })}`,
        `DDM zones: ${v}`,
      );
      box.lastChild.innerHTML = CAP[v];
    };
    seg(box.firstChild, "stable:Stable|warning:Warning|drift:Change", "stable", draw);
    draw("stable");
  }

  /** EDDM: the gaps between errors, before and after a drift. */
  function gapsFig(box, start = "before") {
    const G = { before: [9, 12, 8, 11, 10], after: [3, 2, 4, 2, 3, 2, 3] };
    const stat = (g) => {
      const m = avg(g),
        s = Math.sqrt(avg(g.map((d) => (d - m) ** 2)));
      return { m, s, v: m + 2 * s };
    };
    const ref = stat(G.before);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (k) => {
      const g = G[k],
        q = stat(g);
      let pos = 0;
      const errs = g.map((d) => (pos += d));
      const W = 500 / Math.max(52, pos + 2),
        X = (i) => 20 + i * W;
      const marks = errs
        .map(
          (e, i) =>
            `<rect x="${X(e) - 2}" y="40" width="5" height="34" rx="2" fill="var(--rose)"/><path class="draw" d="M${X(i ? errs[i - 1] : 0)} 38 Q ${(X(i ? errs[i - 1] : 0) + X(e)) / 2} ${14} ${X(e)} 38" fill="none" stroke="var(--blue)" stroke-width="2"/>${tx((X(i ? errs[i - 1] : 0) + X(e)) / 2, 22, g[i], { s: 11, c: "var(--blue-ink)" })}`,
        )
        .join("");
      box.children[1].innerHTML = svg(
        540,
        100,
        `<line x1="20" y1="74" x2="${X(pos + 1)}" y2="74" stroke="var(--line-2)" stroke-width="2"/>${marks}${tx(20, 94, "records →", { a: "start", s: 11, c: "var(--text-faint)" })}`,
        `Errors with gaps ${g.join(", ")}`,
      );
      box.lastChild.innerHTML = `Gaps ${g.join(", ")}: mean <b>${fm(q.m)}</b>, spread ${fm(q.s)}, mean + 2 × spread = <b>${fm(q.v)}</b>. ${k === "before" ? "This is the best (largest) value so far." : `Against the best ${fm(ref.v)}: ratio <b>${fm(q.v / ref.v)}</b>, below 0.90, so EDDM signals drift.`}`;
    };
    seg(box.firstChild, "before:Before the drift|after:After the drift", start, draw);
    draw(start);
  }

  /** One stream, drift injected at record 300: how long each detector takes. */
  function raceFig(box) {
    const run = (kind) => {
      const m = S.monitor(5);
      m.run(200);
      m.w.inject(kind);
      for (let i = 0; i < 700 && !(m.first("A") && m.first("D") && m.first("E")); i++) m.one();
      return ["A", "D", "E"].map((k) => (m.first(k) ? m.first(k).t - m.w.at : null));
    };
    const R = { abrupt: run("abrupt"), gradual: run("gradual") };
    const NAMES = ["ADWIN", "DDM", "EDDM"],
      COL = ["blue", "violet", "teal"];
    const bars = (k, y0) =>
      R[k]
        .map(
          (d, i) =>
            `<rect class="fi" x="110" y="${y0 + i * 22}" width="${(d || 0) * 1.2}" height="16" rx="4" fill="var(--${COL[i]})"/>${tx(104, y0 + i * 22 + 13, NAMES[i], { a: "end", s: 11 })}${tx(116 + (d || 0) * 1.2, y0 + i * 22 + 13, d == null ? "missed" : `${d} records`, { a: "start", s: 11, c: "var(--text-dim)" })}`,
        )
        .join("");
    box.innerHTML = `${svg(
      540,
      176,
      tx(10, 16, "Abrupt drift", { a: "start", s: 12.5 }) +
        bars("abrupt", 22) +
        tx(10, 104, "Gradual drift", { a: "start", s: 12.5 }) +
        bars("gradual", 110),
      "Records each detector needs to flag the drift, for abrupt and gradual drift on one stream",
    )}<div class="fig-cap">Abrupt: all three within ${Math.max(...R.abrupt)} records. Gradual: EDDM after ${R.gradual[2]}, DDM after ${R.gradual[1]}, ADWIN after ${R.gradual[0]}. One stream only; real comparisons average many.</div>`;
  }

  /** 10.2 demo: the detector race on a stream you can drift. */
  function race(box, life, view = "ddm") {
    const m = S.monitor(5);
    let kind = "abrupt",
      v = view,
      playing = false;
    box.innerHTML = `<div class="controls" data-k></div><div class="controls" data-w></div><div data-f></div><div class="ds10-pills" data-s></div><div class="controls"><button class="btn primary" data-p>Play</button><button class="btn" data-t>+50 records</button><button class="btn" data-i>Inject drift</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["blue", "Records"],
        ["amber", "Since drift"],
        ["rose", "Error, last 50"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, box);
    const draw = (msg) => {
      S.view($("[data-f]"), m, v);
      $("[data-s]").innerHTML = S.pills(m);
      setStats(box, [m.w.t, m.w.at < Infinity ? m.w.t - m.w.at : "–", `${fm(100 * m.w.rate(50), 0)}%`]);
      if (msg) $("[data-c]").innerHTML = msg;
    };
    seg($("[data-k]"), "abrupt:Abrupt|gradual:Gradual", kind, (x) => {
      kind = x;
      draw(`Next drift: <b>${KIND[x]}</b>.`);
    });
    seg($("[data-w]"), "adwin:ADWIN|ddm:DDM|eddm:EDDM", v, (x) => {
      v = x;
      draw(
        {
          adwin: "<b>ADWIN</b>: the blue line is the window size; the bracket shows which records it keeps.",
          ddm: "<b>DDM</b>: blue is p + s, orange dashes the warning line, red dashes the change line.",
          eddm: "<b>EDDM</b>: blue is the gap statistic against its best; warning below 0.95, drift below 0.90.",
        }[x],
      );
    });
    $("[data-p]").onclick = (e) => {
      playing = !playing;
      e.target.textContent = playing ? "Pause" : "Play";
    };
    $("[data-t]").onclick = () => (m.run(50), draw());
    $("[data-i]").onclick = () => {
      if (m.w.at < Infinity) return draw("One drift per run: press <b>Reset</b> to try again.");
      m.w.inject(kind);
      draw(`<b>${KIND[kind]}</b> drift injected at record ${m.w.t} (orange line). Now run the stream.`);
    };
    $("[data-z]").onclick = () => {
      m.reset();
      playing = false;
      $("[data-p]").textContent = "Play";
      draw("A fresh stream at about 10% errors.");
    };
    life.interval(() => {
      if (!playing || !box.isConnected) return;
      m.run(4);
      draw();
    }, 200);
    draw(
      "Three detectors watch the same error stream. Press <b>Inject drift</b>, then <b>Play</b> or <b>+50 records</b>.",
    );
  }

  Object.assign(S, { growFig, adwinRun, spreadFig, ddmRun, zonesFig, gapsFig, raceFig, race });
})();
