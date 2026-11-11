/* Data Science (COM3021), Lecture 10: concept drift detection.
   This part: shared helpers (the drifting error stream, the ADWIN / DDM / EDDM detectors, small charts) and
   ds10-drift (10.1, kinds of concept drift and why batch models go stale). Lesson helpers come from NIC.shared.ds9. */
(function () {
  const S9 = NIC.shared.ds9;
  const S = (NIC.shared.ds10 = NIC.shared.ds10 || {});
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, rng, chart } = S9;
  const reg = (m) => N.register({ subject: "ds", lecture: 10, ...m });

  /* ---------- the drifting world: a model's predictions are right or wrong, one record at a time ----------
     c is the concept: 0 = the old rule the model learned, 1 = the new rule. Error rate = BASE + GAP × |c − model|. */
  const BASE = 0.1,
    GAP = 0.4,
    RAMP = 300,
    HALF = 150;
  const level = (kind, t, at) => {
    if (t < at) return 0;
    const k = t - at;
    return kind === "gradual" ? Math.min(1, k / RAMP) : kind === "recurring" ? 1 - (Math.floor(k / HALF) % 2) : 1;
  };
  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
  /** One stream. One random number per record, so the records before a drift never depend on when it is injected. */
  function world(seed) {
    const r = rng(seed);
    const w = { t: 0, at: Infinity, kind: "abrupt", cm: 0, cs: [], xs: [] };
    w.next = () => {
      const c = level(w.kind, w.t, w.at);
      const x = r() < BASE + GAP * Math.abs(c - w.cm) ? 1 : 0;
      (w.t++, w.cs.push(c), w.xs.push(x));
      return { x, c };
    };
    w.inject = (kind) => Object.assign(w, { kind, at: w.t });
    /** Retrain on the records from `from` on: the model learns the average rule in that data. */
    w.retrain = (from) => (w.cm = w.cs.length > from ? avg(w.cs.slice(from)) : w.cm);
    w.rate = (n) => avg(w.xs.slice(-n));
    return w;
  }

  /** DDM (Gama et al., 2004): error rate p, its spread s, and the lowest p + s seen. Checks start after 30 records. */
  function ddm() {
    const d = { n: 0, e: 0, p: 0, s: 0, pmin: Infinity, smin: Infinity, state: "stable" };
    d.add = (x) => {
      (d.n++, (d.e += x), (d.p = d.e / d.n));
      d.s = Math.sqrt((d.p * (1 - d.p)) / d.n);
      if (d.n >= 30 && d.p + d.s < d.pmin + d.smin) [d.pmin, d.smin] = [d.p, d.s];
      const v = d.p + d.s;
      d.state = !d.ready()
        ? "stable"
        : v >= d.pmin + 3 * d.smin
          ? "drift"
          : v >= d.pmin + 2 * d.smin
            ? "warning"
            : "stable";
      return d.state;
    };
    d.ready = () => d.n >= 30 && d.smin > 0;
    d.reset = () => Object.assign(d, { n: 0, e: 0, pmin: Infinity, smin: Infinity, state: "stable" });
    return d;
  }

  /** ADWIN's cut threshold for a split into n0 older and n1 newer records (Bifet and Gavaldà, 2007). */
  const epsCut = (n0, n1, delta = 0.002) => Math.sqrt(Math.log((4 * (n0 + n1)) / delta) / (2 / (1 / n0 + 1 / n1)));
  /** Every split of a window W = W0 · W1 (each side at least 5 records): means, gap and threshold. */
  function splits(W) {
    const n = W.length,
      s = [0];
    W.forEach((v) => s.push(s[s.length - 1] + v));
    return Array.from({ length: Math.max(0, n - 9) }, (_, j) => {
      const i = j + 5,
        m0 = s[i] / i,
        m1 = (s[n] - s[i]) / (n - i);
      return { i, m0, m1, gap: Math.abs(m0 - m1), eps: epsCut(i, n - i) };
    });
  }
  /** ADWIN: add to the head; while some split's halves differ by at least eps, drop from the tail. */
  function adwin() {
    const a = { W: [] };
    a.add = (x) => {
      a.W.push(x);
      let dropped = 0;
      while (a.W.length >= 10 && splits(a.W).some((q) => q.gap >= q.eps)) (a.W.shift(), dropped++);
      return dropped;
    };
    return a;
  }

  /** EDDM (Baena-García et al., 2006): the distance between errors, its mean and spread, against the best seen. */
  function eddm() {
    const e = { t: 0, last: 0, k: 0, mean: 0, m2: 0, max: 0, ratio: 1, state: "stable" };
    e.add = (x) => {
      e.t++;
      if (!x) return e.state;
      const d = e.t - e.last,
        dm = d - e.mean;
      (e.k++, (e.last = e.t), (e.mean += dm / e.k), (e.m2 += dm * (d - e.mean)));
      const v = e.mean + 2 * Math.sqrt(e.m2 / e.k);
      if (e.k < 30) return e.state;
      ((e.max = Math.max(e.max, v)), (e.ratio = v / e.max));
      e.state = e.ratio < 0.9 ? "drift" : e.ratio < 0.95 ? "warning" : "stable";
      return e.state;
    };
    e.reset = () => Object.assign(e, { t: 0, last: 0, k: 0, mean: 0, m2: 0, max: 0, ratio: 1, state: "stable" });
    return e;
  }

  /** A line that breaks wherever a value is null. */
  const line = (C, pts, c, extra = "") => {
    const parts = [[]];
    pts.forEach((p) => (p[1] == null ? parts.push([]) : parts[parts.length - 1].push(p)));
    return parts
      .filter((q) => q.length > 1)
      .map((q) => C.path(q, c, extra))
      .join("");
  };
  /** A strip of records: errors are tall red ticks, right answers short grey ones. */
  const strip = (xs, x0, y0, w, h) => {
    const bw = w / Math.max(1, xs.length);
    return xs
      .map((x, i) =>
        x
          ? `<rect x="${(x0 + i * bw).toFixed(1)}" y="${y0}" width="${Math.max(1, bw - 0.4).toFixed(1)}" height="${h}" fill="var(--rose)"/>`
          : `<rect x="${(x0 + i * bw).toFixed(1)}" y="${y0 + h - 5}" width="${Math.max(1, bw - 0.4).toFixed(1)}" height="5" fill="var(--line-2)"/>`,
      )
      .join("");
  };
  /** A chart from the Lecture 9 helper, in one line: x and y ranges, ticks, axis labels, accessible label. */
  const ch = (x, y, tX, tY, xl, yl, label, h = 220) => chart({ w: 520, h, x, y, tx: tX, ty: tY, xl, yl, label });
  const KIND = { abrupt: "Abrupt", gradual: "Gradual", recurring: "Recurring" };
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );

  Object.assign(S, { S9, reg, mc, pr, st, mm, fm, seg, stats, setStats, svg, tx, rng, chart, ch, avg, card, KIND });
  Object.assign(S, { BASE, GAP, level, world, ddm, adwin, eddm, epsCut, splits, line, strip });

  /* ---------- 10.1 figures ---------- */
  /** Recap of Lecture 9.3: three shifts, concept drift highlighted. */
  const recapFig = () => {
    const panel = (x, t, sub, inner, on) =>
      `<g class="fi"><rect x="${x}" y="6" width="168" height="168" rx="14" fill="${on ? "color-mix(in srgb,var(--violet) 12%,var(--panel))" : "var(--panel-2)"}" stroke="var(--${on ? "violet" : "line-2"})" stroke-width="${on ? 3 : 2}"/>${tx(x + 84, 28, t, { s: 12.5 })}${tx(x + 84, 44, sub, { s: 11, c: "var(--text-faint)", w: 700 })}${inner}</g>`;
    const dots = (x, y, c, n) =>
      Array.from(
        { length: n },
        (_, i) => `<circle cx="${x + (i % 3) * 12}" cy="${y + Math.floor(i / 3) * 12}" r="4.5" fill="var(--${c})"/>`,
      ).join("");
    const bar = (x, y, red) =>
      `<rect x="${x}" y="${y}" width="120" height="16" rx="5" fill="var(--blue)" opacity=".35"/><rect x="${x}" y="${y}" width="${red * 6}" height="16" rx="5" fill="var(--rose)"/>`;
    const p1 = `<path d="M24 150 L154 70" stroke="var(--teal)" stroke-width="2.5" stroke-dasharray="6 4"/>${dots(30, 104, "blue", 6)}${dots(118, 70, "amber", 6)}`;
    const p2 = `${tx(260, 80, "before", { s: 11, c: "var(--text-faint)" })}${bar(200, 86, 12)}${tx(260, 128, "after", { s: 11, c: "var(--text-faint)" })}${bar(200, 134, 4)}`;
    const p3 = `<path d="M368 150 L498 110" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="6 4"/><path class="draw" d="M368 150 L498 64" stroke="var(--teal)" stroke-width="3"/>${tx(496, 104, "old rule", { s: 10.5, a: "end", c: "var(--violet-ink)" })}${tx(470, 62, "new rule", { s: 10.5, a: "end", c: "var(--teal-ink)" })}`;
    const body =
      panel(4, "Covariate shift", "the inputs move", p1) + panel(176, "Prior shift", "the target mix moves", p2);
    const lab =
      "Three shifts: covariate (inputs move), prior (target mix moves), concept drift (the rule moves, highlighted)";
    return svg(520, 180, body + panel(348, "Concept drift", "the rule moves", p3, true), lab);
  };

  /** Click rates by age band for a plant-milk recommendation drift from week 1 to week 52; the model keeps week 1. */
  function prefsFig(box) {
    const A = ["18–29", "30–44", "45–59", "60+"],
      W1 = [30, 20, 12, 8],
      W52 = [54, 46, 36, 28];
    const sl = N.slider("Week", 1, 52, 1, 30, (v) => `week ${v}`);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.firstChild.append(sl);
    const draw = (wk) => {
      const f = (wk - 1) / 51,
        now = W1.map((v, i) => Math.round(v + (W52[i] - v) * f));
      const C = chart({
        w: 480,
        h: 210,
        x: [0, 4],
        y: [0, 60],
        ty: [0, 20, 40, 60],
        yl: "% who click the plant-milk suggestion",
        label: `Week ${wk}: real click rates ${now.join(", ")} per cent by age band; the model still predicts ${W1.join(", ")}`,
      });
      const bars = A.map((a, i) => {
        const x = C.X(i + 0.5);
        return `<rect x="${x - 26}" y="${C.Y(now[i])}" width="52" height="${C.Y(0) - C.Y(now[i])}" rx="6" fill="color-mix(in srgb,var(--blue) 40%,var(--panel))" stroke="var(--blue)" stroke-width="2"/><rect x="${x - 26}" y="${C.Y(W1[i])}" width="52" height="${C.Y(0) - C.Y(W1[i])}" rx="6" fill="none" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="5 4"/>${tx(x, C.Y(0) + 15, a, { s: 11 })}`;
      }).join("");
      box.children[1].innerHTML = C.wrap(bars);
      box.lastChild.innerHTML = `Week ${wk}: shoppers aged 30–44 click <b>${now[1]}%</b> of the time; the model, trained in week 1, still says <b>20%</b> (purple dashes). Same shoppers, same inputs: the <b>rule</b> moved.`;
    };
    sl.onInput(draw);
    draw(30);
  }

  /** The three kinds of drift over a year. c(week) is the share of shoppers on the new habit; frozen error = 10 + 40c. */
  const shape = (k, wk) =>
    ({ abrupt: +(wk >= 12), gradual: Math.max(0, Math.min(1, (wk - 8) / 30)), recurring: Math.floor(wk / 13) % 2 })[k];
  function shapeFig(box, kind) {
    let k = kind,
      wk = 20;
    const sl = N.slider("Week", 0, 52, 1, wk, (v) => `week ${v}`);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    box.children[1].append(sl);
    const lab = "Over 52 weeks: the share of shoppers on the new habit and the frozen model's error";
    const C = ch([0, 52], [0, 100], [0, 13, 26, 39, 52], [0, 10, 50, 100], "week", "per cent", lab);
    const pts = (f) => Array.from({ length: 105 }, (_, i) => [i / 2, f(i / 2)]);
    const draw = () => {
      const c = shape(k, wk),
        err = 10 + 40 * c;
      box.children[2].innerHTML = C.wrap(
        C.path(
          pts((w) => 100 * shape(k, w)),
          "blue",
        ) +
          C.path(
            pts((w) => 10 + 40 * shape(k, w)),
            "rose",
          ) +
          `<line x1="${C.X(wk)}" y1="${C.Y(100)}" x2="${C.X(wk)}" y2="${C.Y(0)}" stroke="var(--text-faint)" stroke-width="1.5" stroke-dasharray="3 3"/>` +
          C.dot(wk, 100 * c, "blue", 6) +
          C.dot(wk, err, "rose", 6) +
          tx(C.X(51), C.Y(100) + 14, "blue: new habit share", { s: 10.5, a: "end", c: "var(--blue-ink)" }) +
          tx(C.X(51), C.Y(100) + 28, "red: frozen model error", { s: 10.5, a: "end", c: "var(--rose-ink)" }),
      );
      box.lastChild.innerHTML = `<b>${S.KIND[k]}</b>, week ${wk}: ${fm(100 * c, 0)}% of shoppers follow the new habit, so the frozen model is wrong on <b>${fm(err, 0)}%</b> of predictions. ${{ abrupt: "Overnight in week 12, like a pandemic.", gradual: "A slow slide from week 8 to week 38, like a cultural or economic change.", recurring: "Every 13 weeks the season flips, and the old pattern comes back." }[k]}`;
    };
    seg(box.firstChild, "abrupt:Abrupt|gradual:Gradual|recurring:Recurring", k, (v) => ((k = v), draw()));
    sl.onInput((v) => ((wk = v), draw()));
    draw();
  }

  /** Stepper: weekly error of a frozen model and a model retrained every 4 weeks on the last 4 weeks. Drift in week 6. */
  function staleRun(box, life) {
    const c = (w) => (w >= 6 ? 1 : 0);
    const lab = "Weekly error: the frozen model stays at 50% after week 6; the monthly retrain falls to 20% then 10%";
    const C = ch([0.3, 16.7], [0, 60], [1, 4, 8, 12, 16], [0, 10, 20, 50], "week", "error %", lab, 210);
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = C.wrap("<g></g>");
        return stage.querySelector("svg g:last-child");
      },
      *frames() {
        let cm = 0;
        const rows = [];
        for (let w = 1; w <= 16; w++) {
          const fz = 10 + 40 * c(w),
            mo = 10 + 40 * Math.abs(c(w) - cm);
          rows.push([w, fz, mo]);
          let cap = `Week ${w}: frozen <b>${fm(fz, 0)}%</b>, monthly retrain <b>${fm(mo, 0)}%</b>.`;
          if (w === 6) cap += " Drift: shoppers switch habit overnight.";
          if (w % 4 === 0) {
            const s = [w - 3, w - 2, w - 1, w].map(c);
            cm = s.reduce((a, b) => a + b, 0) / 4;
            cap += ` Retrain on weeks ${w - 3}–${w}: ${fm(100 * cm, 0)}% of that data follows the new rule.`;
          }
          yield { rows: [...rows], cap };
        }
      },
      draw(g, f) {
        g.innerHTML = f.rows
          .map(
            ([w, fz, mo]) =>
              `<rect x="${C.X(w) - 13}" y="${C.Y(fz)}" width="12" height="${C.Y(0) - C.Y(fz)}" rx="3" fill="var(--rose)"/><rect x="${C.X(w) + 1}" y="${C.Y(mo)}" width="12" height="${C.Y(0) - C.Y(mo)}" rx="3" fill="var(--blue)"/>`,
          )
          .join("");
      },
    });
  }

  /** A rolling error rate over a window of the last k records, on a stream that drifts at record 100. */
  function rollFig(box) {
    const w = world(5);
    for (let i = 0; i < 260; i++) {
      if (i === 100) w.inject("abrupt");
      w.next();
    }
    const lab = "A rolling error rate over a stream that drifts at record 100";
    const C = ch([0, 260], [0, 80], [0, 100, 200], [0, 10, 50, 80], "record", "rolling error %", lab, 210);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const draw = (v) => {
      const k = +v,
        pts = w.xs.map((_, i) => [i + 1, i + 1 >= k ? 100 * avg(w.xs.slice(i + 1 - k, i + 1)) : null]);
      const after = pts.findIndex((p, i) => i >= 100 && p[1] != null && p[1] >= 30),
        pre = pts.slice(0, 100).filter((p) => p[1] != null),
        lo = Math.min(...pre.map((p) => p[1])),
        hi = Math.max(...pre.map((p) => p[1]));
      box.children[1].innerHTML = C.wrap(
        `<g transform="translate(0,0)">${strip(w.xs, C.X(0), C.Y(80), C.X(260) - C.X(0), 12)}</g>` +
          `<line x1="${C.X(100)}" y1="${C.Y(76)}" x2="${C.X(100)}" y2="${C.Y(0)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 3"/>` +
          line(C, pts, "blue"),
      );
      box.lastChild.innerHTML = `Window of the last <b>${k}</b> records. ${pre.length ? `Before the drift (orange line) it already swings between ${fm(lo, 0)}% and ${fm(hi, 0)}%.` : `It needs ${k} records before its first reading.`} ${k === 10 ? "Quick to react, but noise alone looks like drift." : k === 150 ? "Smooth, but slow to climb after the drift." : "A middle choice."} First reading of 30% or more after the drift: record <b>${after + 1}</b>.`;
    };
    seg(box.firstChild, "10:Last 10|40:Last 40|150:Last 150", "40", draw);
    draw("40");
  }

  /** 10.1 demo: a stream of predictions; inject a drift and watch a frozen or a retrained model's error. */
  function live(box, life) {
    const H = 300;
    let w, kind, mode, playing, last;
    box.innerHTML = `<div class="controls" data-k></div><div class="controls" data-m></div><div data-f></div><div class="controls"><button class="btn primary" data-p>Play</button><button class="btn" data-t>+50 records</button><button class="btn" data-i>Inject drift</button><button class="btn ghost" data-z>Reset</button></div>${stats(
      [
        ["blue", "Records"],
        ["rose", "Error, last 50"],
        ["violet", "Model trained up to"],
        ["amber", "Drift"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (s) => qs(s, box);
    const lab = "The model's error over the last 300 records: rolling error and the true error rate";
    const C = ch([0, H], [0, 80], [0, 150, 300], [0, 10, 50, 80], "last 300 records", "error %", lab);
    const reset = () => {
      w = world(5);
      last = 0;
      playing = false;
      $("[data-p]").textContent = "Play";
      for (let i = 0; i < 100; i++) one();
    };
    const one = () => {
      w.next();
      if (mode === "retrain" && w.t % 200 === 0) (w.retrain(w.t - 200), (last = w.t));
    };
    const draw = (msg) => {
      const n = w.t,
        o = Math.max(0, n - H),
        xs = w.xs.slice(o);
      const truth = w.cs.slice(o).map((c, i) => [i, 100 * (0.1 + 0.4 * Math.abs(c - w.cm))]);
      const roll = xs.map((_, i) => [i, o + i >= 50 ? 100 * avg(w.xs.slice(o + i - 49, o + i + 1)) : null]);
      const at = w.at - o;
      $("[data-f]").innerHTML = C.wrap(
        strip(xs, C.X(0), C.Y(80), ((C.X(H) - C.X(0)) * xs.length) / H, 12) +
          (at >= 0 && at <= H
            ? `<line x1="${C.X(at)}" y1="${C.Y(76)}" x2="${C.X(at)}" y2="${C.Y(0)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 3"/>`
            : "") +
          C.path(truth, "teal", 'stroke-dasharray="6 4"') +
          line(C, roll, "blue"),
      );
      setStats(box, [
        n,
        `${fm(100 * w.rate(50), 0)}%`,
        last ? `record ${last}` : "record 0",
        w.at < Infinity ? `${S.KIND[w.kind]}, at ${w.at}` : "none",
      ]);
      if (msg) $("[data-c]").innerHTML = msg;
    };
    const K = "abrupt:Abrupt|gradual:Gradual|recurring:Recurring";
    seg(
      $("[data-k]"),
      K,
      "abrupt",
      (v) => ((kind = v), draw(`Next drift: <b>${S.KIND[v]}</b>. Press <b>Inject drift</b>.`)),
    );
    const M = {
      frozen: "Frozen: trained once, never updated.",
      retrain: "Every 200 records it retrains on the last 200.",
    };
    seg($("[data-m]"), "frozen:Frozen model|retrain:Retrain every 200", "frozen", (v) => ((mode = v), draw(M[v])));
    $("[data-p]").onclick = (e) => {
      playing = !playing;
      e.target.textContent = playing ? "Pause" : "Play";
    };
    $("[data-t]").onclick = () => (Array.from({ length: 50 }, one), draw());
    $("[data-i]").onclick = () => {
      if (w.at < Infinity) return draw("One drift per run: press <b>Reset</b> to try another kind.");
      w.inject(kind);
      draw(
        `<b>${S.KIND[kind]}</b> drift injected at record ${w.t}. The green dashes show the true error rate; blue is what you can measure.`,
      );
    };
    $("[data-z]").onclick = () => {
      reset();
      draw("A fresh stream. The model is right about 90% of the time.");
    };
    life.interval(() => {
      if (!playing || !box.isConnected) return;
      for (let i = 0; i < 4; i++) one();
      draw();
    }, 200);
    kind = "abrupt";
    mode = "frozen";
    reset();
    draw(
      "Each tick is one prediction: tall red ticks are errors. Press <b>Inject drift</b>, then <b>Play</b> or <b>+50 records</b>.",
    );
  }

  /* ============ 10.1 Kinds of concept drift ============ */
  reg({
    id: "ds10-drift",
    order: 1,
    num: "10.1",
    title: "Kinds of concept drift",
    blurb: "Abrupt, gradual and recurring drift, and why a model trained once slowly goes stale.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const c = card("A drifting stream of predictions", "inject a drift");
      root.appendChild(c);
      live(c.lastElementChild, life);
      root.appendChild(
        pr(
          "ds10-drift-1",
          "With the <b>Frozen model</b>, pick <b>Gradual</b>, press <b>Inject drift</b>, then <b>+50 records</b> several times. How does the blue error line change?",
          [
            "It climbs slowly over a few hundred records",
            "It jumps to about 50% straight away",
            "It goes up and down in regular waves",
          ],
          "Gradual drift moves shoppers to the new rule a little at a time, over 300 records here, so the frozen model's error rises slowly from 10% to 50%.",
        ),
      );
      root.appendChild(
        pr(
          "ds10-drift-2",
          "Press <b>Reset</b>, pick <b>Recurring</b>, keep the <b>Frozen model</b>, press <b>Inject drift</b> and run about 600 records. What does the error do?",
          [
            "It rises and falls back again, in a repeating pattern",
            "It rises once and then stays high for good",
            "It stays near 10% because the seasons cancel out",
          ],
          "Recurring drift flips between two rules. Each time the old season returns, the frozen model is right again; each time the new one returns, its error rises to about 50%.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Lecture 9.3 named three shifts. <b>Concept drift</b> is the one where the <b>relationship</b> between input and output changes.",
            "Streaming data is dynamic: its statistics can (and probably will) change over time, for example <b>consumer preferences and behaviours</b>.",
            "<b>Gradual</b> drift (cultural or economic change), <b>abrupt</b> drift (a pandemic) and <b>recurring</b> or cyclical drift (seasons).",
            "A <b>batch learner</b> model trained once becomes <b>outdated</b>; a fixed retraining schedule lags behind a drift it cannot see.",
            "What we can see is the model's <b>error stream</b>. Watching it is how drift detection works (10.2).",
          ],
          "The world moves on whether or not the model does.",
        ),
      );
    },
  });

  L["ds10-drift"] = {
    sum: "<b>Concept drift</b> is a change in the input-output relationship over time. It can be <b>abrupt</b>, <b>gradual</b> or <b>recurring</b>. Batch models trained once go stale, so we watch the model's <b>error stream</b> for signs of drift.",
    steps: [
      st(
        "Three shifts, one about the rule",
        `<p>Lecture 9.3 met three data shifts that make models decay: <b>covariate shift</b> (the inputs change, like faces in masks), <b>prior probability shift</b> (the target mix changes, like flu during COVID) and <b>concept drift</b> (the relationship between input and output changes). This lecture is about the third: how it happens and how to spot it.</p><p>Worked example: a grocery app, Basketly, suggests plant milk to shoppers. If the same shopper, with the same history, now clicks where they used to scroll past, no input changed. The rule did. That is concept drift.</p>`,
        recapFig(),
        mc(
          "Basketly's shoppers and baskets look exactly as they did last year, but the same basket now leads to a different purchase. Which shift is this?",
          ["Concept drift", "Covariate shift", "Prior probability shift"],
          "The inputs are unchanged and what changed is the mapping from inputs to outcome: concept drift. Covariate shift changes the inputs; prior shift changes the mix of targets.",
        ),
      ),
      st(
        "Streams keep changing",
        `<p>Streaming data is <b>dynamic</b>: its underlying statistics can, and probably will, change over time. The lecture's example is <b>consumer preferences and behaviours</b>.</p><p>Worked example: in week 1, 20% of shoppers aged 30–44 click the plant-milk suggestion. By week 52 it is 46%. A model trained in week 1 keeps predicting 20%, so it underestimates more every week. Drag the week and compare the blue bars (reality) with the purple dashes (the model).</p>`,
        (box) => prefsFig(box),
        mc(
          "The model was trained in week 1, when 30% of 18–29 shoppers clicked. In week 30 the real rate is 44%. What does the model predict for them in week 30?",
          ["30%: it still knows only week 1", "44%: it follows the stream", "37%: it averages old and new"],
          "A model trained once keeps the rule it learned. Nothing updates it, so it still says 30% however far the stream moves.",
        ),
      ),
      st(
        "Abrupt drift",
        `<p><b>Abrupt</b> drift happens all at once: one day the old rule holds, the next day a new one does. The lecture's example is a <b>pandemic</b>, which changed what people bought almost overnight.</p><p>Worked example: in week 12 every shopper switches habit. The model's error jumps from 10% to 50% in a single week and stays there. Move the week slider across week 12, then compare with the other two kinds.</p>${mm("<p>Model it with a concept level $c(t)$ between 0 (the old rule) and 1 (the new rule). Abrupt drift at time $t_0$ is a step:</p>$$c(t) = \\begin{cases} 0 & t < t_0 \\\\ 1 & t \\ge t_0 \\end{cases}$$<p>In this lesson a frozen model's error rate is $10\\% + 40\\% \\times c(t)$.</p>")}`,
        (box) => shapeFig(box, "abrupt"),
        mc(
          "A city bans cars from its centre overnight, and a delivery-time model's errors jump the next morning. Which kind of drift is this?",
          ["Abrupt", "Gradual", "Recurring"],
          "The rule changed at one moment and stays changed: abrupt drift.",
        ),
      ),
      st(
        "Gradual drift",
        `<p><b>Gradual</b> drift creeps in: the new rule takes over a little at a time. The lecture's examples are <b>cultural or economic changes</b>, such as tastes shifting or prices rising over months.</p><p>Worked example: from week 8 to week 38 the share of shoppers on the new habit rises steadily from 0% to 100%. At week 23 it is halfway, so the frozen model's error is 10% + 40% × 0.5 = 30%. No single week looks alarming, which is what makes gradual drift hard to spot.</p>${mm("<p>A linear ramp from $t_0$ over $T$ steps:</p>$$c(t) = \\min\\left(1, \\max\\left(0, \\frac{t - t_0}{T}\\right)\\right)$$<p>Beyond the slides: some papers split this into <b>incremental</b> drift (the rule itself slides slowly) and <b>gradual</b> drift (old and new rules alternate, the new one more and more often). Both look like a slow climb in the error.</p>")}`,
        (box) => shapeFig(box, "gradual"),
        mc(
          "Under the gradual drift in the figure, the frozen model's error is 10% + 40% × the share on the new habit. A quarter of shoppers have switched. What is the error?",
          ["20%", "35%", "50%"],
          "10% + 40% × 0.25 = 10% + 10% = 20%.",
          "40% × 0.25 is a quarter of 40.",
        ),
      ),
      st(
        "Recurring drift",
        `<p><b>Recurring</b> or <b>cyclical</b> drift switches between rules and comes back. The lecture's example is the <b>seasons</b>: what people buy in winter is not what they buy in summer, and next winter looks like this winter.</p><p>Worked example: the model learned in summer. Every 13 weeks the season flips: in winter its error is 50%, in summer it is back to 10%. The old rule is not gone for good, so it is worth remembering.</p>${mm("<p>A square wave with period $2P$:</p>$$c(t) = \\left\\lfloor \\frac{t}{P} \\right\\rfloor \\bmod 2$$<p>Beyond the slides: systems facing recurring drift often keep a library of old models and switch back to the one that fits, instead of relearning each season from scratch.</p>")}`,
        (box) => shapeFig(box, "recurring"),
        mc(
          "Sales of barbecue food rise every summer and fall every winter, year after year. Which kind of drift is this?",
          ["Recurring", "Abrupt", "Gradual"],
          "The pattern returns on a cycle, like the seasons: recurring or cyclical drift.",
        ),
      ),
      st(
        "Why batch models go stale",
        `<p>A <b>batch learner</b> is trained once on past data and deployed as it is, so it <b>becomes outdated</b> as soon as the concept drifts. Retraining on a fixed schedule helps, but the schedule cannot see when a drift happens.</p><p>Worked example: drift in week 6. The frozen model is wrong 50% of the time from then on. A model retrained every 4 weeks on the last 4 weeks is also stale in weeks 6–8; after week 8 it learns from weeks 5–8, of which 3 out of 4 follow the new rule, so its error falls to 20%, and only after week 12 to 10%. Step through the weeks.</p>`,
        (box, life) => staleRun(box, life),
        mc(
          "In the stepper, why is the monthly model still at 20% error in weeks 9–12?",
          [
            "Its training data mixed one old-rule week with three new ones",
            "It retrained on all the data since week 1",
            "The drift kept getting stronger in those weeks",
          ],
          "The retrain after week 8 used weeks 5–8: week 5 still followed the old rule, so the model is a quarter wrong about the new one until the next retrain.",
        ),
      ),
      st(
        "Watch the errors",
        `<p>We cannot see the concept directly, but we can see whether each prediction was right once the true answer arrives. That turns the model into a stream of 0s (right) and 1s (wrong), and a drift shows up as <b>more 1s</b>.</p><p>Worked example: average the last 10 records and the line is jumpy: 4 errors in 10 can happen by chance, a 40% reading with no drift at all. Average the last 150 and it is smooth but slow to react. Choosing the window size is the hard part, which is exactly what <b>ADWIN</b> automates in 10.2.</p>${mm("<p>The rolling error over the last $k$ records, with $x_j = 1$ for an error:</p>$$\\hat p_t = \\frac{1}{k}\\sum_{j=t-k+1}^{t} x_j$$<p>Its noise shrinks like $\\sqrt{p(1-p)/k}$: four times the window halves the noise, but the estimate needs about $k$ new records to catch up with a change.</p>")}`,
        (box) => rollFig(box),
        mc(
          "Why not just use a very short window, say the last 10 predictions, to spot drift fast?",
          [
            "Its readings swing so much that chance alone looks like drift",
            "A short window cannot be computed on a stream",
            "Ten errors in a row are needed before it shows anything",
          ],
          "With only 10 records, 4 errors (40%) happen by chance even at a 10% error rate. Fast, but full of false alarms.",
        ),
      ),
    ],
    guide: [
      "Keep the <b>Frozen model</b>, pick <b>Abrupt</b>, press <b>Inject drift</b> and then <b>+50 records</b>: watch <b>Error, last 50</b>.",
      "Press <b>Reset</b>, pick <b>Gradual</b> and <b>Inject drift</b>, then <b>Play</b> and watch the blue line climb.",
      "Press <b>Reset</b>, choose <b>Retrain every 200</b> and inject a drift. Then answer the questions after the demo.",
    ],
  };
})();
