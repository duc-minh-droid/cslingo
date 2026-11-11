/* Data Science Lecture 10 workshop (10.W): guard a spam filter against concept drift. Three detectors watch its error
   stream; the learner injects a spam campaign or a slow change, reads ADWIN, DDM and EDDM, and retrains. No code.
   This part also holds the detector monitor (one stream, three detectors), used by the 10.2 demo at render time. */
(function () {
  const S = NIC.shared.ds10;
  const { reg, mc, pr, st, fm, seg, stats, setStats, tx, chart, world, ddm, adwin, eddm, line, strip } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  /* ---------- the monitor: one stream, three detectors, a history of the last H records ---------- */
  function monitor(seed, H = 300) {
    const m = { H };
    m.reset = () => {
      Object.assign(m, {
        w: world(seed),
        A: adwin(),
        D: ddm(),
        E: eddm(),
        h: [],
        ev: [],
        warnAt: null,
        lastWarn: null,
      });
      m.prev = "stable";
      for (let i = 0; i < 100; i++) m.one();
      m.ev = [];
    };
    m.one = () => {
      const { x } = m.w.next(),
        t = m.w.t,
        D = m.D;
      const cut = m.A.add(x),
        ds = D.add(x),
        es = m.E.add(x),
        ok = D.ready();
      const r = { t, x, win: m.A.W.length, ratio: m.E.k >= 30 && m.E.max ? m.E.ratio : null };
      Object.assign(r, ok ? { ps: D.p + D.s, w2: D.pmin + 2 * D.smin, w3: D.pmin + 3 * D.smin } : {});
      if (cut) m.ev.push({ k: "A", t, n: cut });
      if (ds === "warning" && m.prev !== "warning") (m.ev.push({ k: "W", t }), (m.warnAt = t));
      if (ds === "stable") m.warnAt = null;
      if (ds === "drift") {
        m.lastWarn = m.warnAt || t;
        m.ev.push({ k: "D", t, from: m.lastWarn });
        D.reset();
        m.warnAt = null;
      }
      if (es === "drift") (m.ev.push({ k: "E", t }), m.E.reset());
      m.prev = ds;
      m.h.push(r);
      if (m.h.length > H) m.h.shift();
      return r;
    };
    m.run = (n) => {
      for (let i = 0; i < n; i++) m.one();
    };
    /** The first event of kind k after the drift was injected. */
    m.first = (k) => m.ev.find((e) => e.k === k && e.t > m.w.at);
    m.reset();
    return m;
  }

  /** Draws one detector's view of the last H records into `box`. */
  function view(box, m, v) {
    const h = m.h,
      H = m.H,
      o = h.length ? h[0].t : 0;
    const at = m.w.at - o;
    const cfg = {
      adwin: {
        y: [0, Math.max(200, Math.ceil((1.3 * Math.max(...h.map((r) => r.win))) / 100) * 100)],
        yl: "ADWIN window size",
      },
      ddm: { y: [0, 80], yl: "DDM: p + s (%)", ty: [0, 20, 40, 60, 80] },
      eddm: { y: [0.3, 1.1], yl: "EDDM ratio", ty: [0.5, 0.9, 1] },
    }[v];
    const C = chart({
      w: 520,
      h: 240,
      x: [0, H],
      y: cfg.y,
      tx: [0, 150, 300],
      ty: cfg.ty || [0, cfg.y[1] / 2, cfg.y[1]],
      xl: "last 300 records",
      yl: cfg.yl,
      label: `${cfg.yl} over the last 300 records`,
    });
    const P = (f) => h.map((r, i) => [i, f(r)]);
    const dash = (y, c) =>
      C.path(
        P(() => y),
        c,
        'stroke-dasharray="6 4"',
      );
    let inner = strip(
      h.map((r) => r.x),
      C.X(0),
      C.Y(cfg.y[1]) - 2,
      ((C.X(H) - C.X(0)) * h.length) / H,
      10,
    );
    if (at >= 0 && at <= H)
      inner += `<line x1="${C.X(at)}" y1="${C.Y(cfg.y[1]) + 10}" x2="${C.X(at)}" y2="${C.Y(cfg.y[0])}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 3"/>`;
    const evs = (k) => m.ev.filter((e) => e.k === k && e.t >= o);
    if (v === "adwin") {
      const win = h.length ? h[h.length - 1].win : 0,
        x0 = C.X(Math.max(0, h.length - win));
      inner +=
        `<path d="M${x0} ${C.Y(cfg.y[1]) + 14}v5H${C.X(h.length - 1)}v-5" fill="none" stroke="var(--blue)" stroke-width="2.5"/>` +
        (win > h.length
          ? tx(x0 + 4, C.Y(cfg.y[1]) + 30, `◂ ${win - h.length} older records too`, {
              a: "start",
              s: 10.5,
              c: "var(--blue-ink)",
            })
          : "") +
        line(
          C,
          P((r) => r.win),
          "blue",
        ) +
        evs("A")
          .map((e) => C.dot(e.t - o, h[e.t - o] ? h[e.t - o].win : 0, "rose", 4))
          .join("");
    } else if (v === "ddm") {
      inner +=
        line(
          C,
          P((r) => (r.w2 == null ? null : 100 * r.w2)),
          "amber",
          'stroke-dasharray="6 4"',
        ) +
        line(
          C,
          P((r) => (r.w3 == null ? null : 100 * r.w3)),
          "rose",
          'stroke-dasharray="6 4"',
        ) +
        line(
          C,
          P((r) => (r.ps == null ? null : 100 * r.ps)),
          "blue",
        ) +
        evs("W")
          .map((e) => C.dot(e.t - o, h[e.t - o] && h[e.t - o].ps != null ? 100 * h[e.t - o].ps : 0, "amber", 5))
          .join("") +
        evs("D")
          .map(
            (e) =>
              `<line x1="${C.X(e.t - o)}" y1="${C.Y(80)}" x2="${C.X(e.t - o)}" y2="${C.Y(0)}" stroke="var(--rose)" stroke-width="2"/>`,
          )
          .join("");
    } else {
      inner +=
        dash(0.95, "amber") +
        dash(0.9, "rose") +
        line(
          C,
          P((r) => r.ratio),
          "blue",
        ) +
        evs("E")
          .map(
            (e) =>
              `<line x1="${C.X(e.t - o)}" y1="${C.Y(1.1)}" x2="${C.X(e.t - o)}" y2="${C.Y(0.3)}" stroke="var(--rose)" stroke-width="2"/>`,
          )
          .join("");
    }
    box.innerHTML = C.wrap(inner);
  }

  /** Status pills for the three detectors. */
  function pills(m) {
    const since = (e) => (e ? `caught ${e.t - m.w.at} records after the drift` : "");
    const D = m.D.state,
      E = m.E.state,
      a = m.first("A"),
      d = m.first("D"),
      e = m.first("E");
    const p = (name, cls, txt) => `<span class="ds10-pill ${cls}"><b>${name}</b> ${txt}</span>`;
    return (
      p("ADWIN", a ? "drift" : "", a ? since(a) : `window ${m.A.W.length}`) +
      p("DDM", d ? "drift" : D, d ? since(d) : D) +
      p("EDDM", e ? "drift" : E, e ? since(e) : E)
    );
  }
  Object.assign(S, { monitor, view, pills });

  const KINDS = { abrupt: "New spam campaign", gradual: "Slow change" };

  /** The sandbox. Every mission is checked from the monitor's state after each action. */
  function sandbox(stage, api, life) {
    const m = monitor(8);
    let kind = "abrupt",
      v = "ddm",
      playing = false,
      trained = null,
      told = {};
    const box = el(
      `<div class="wk-card"><h3>The inbox: one email at a time</h3><div class="controls" data-k></div><div class="controls" data-w></div><div data-f></div><div class="ds10-pills" data-s></div><div class="controls"><button class="btn primary" data-p>Play</button><button class="btn" data-t>+50 emails</button><button class="btn" data-i>Inject drift</button><button class="btn" data-r>Retrain</button><button class="btn ghost" data-z>Reset</button></div>${stats(
        [
          ["blue", "Emails"],
          ["rose", "Error, last 50"],
          ["amber", "Since drift"],
          ["violet", "Filter trained on"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    stage.append(box);
    const $ = (s) => qs(s, box);
    const draw = (msg) => {
      view($("[data-f]"), m, v);
      $("[data-s]").innerHTML = pills(m);
      setStats(box, [
        m.w.t,
        `${fm(100 * m.w.rate(50), 0)}%`,
        m.w.at < Infinity ? m.w.t - m.w.at : "–",
        trained ? `emails ${trained[0]}–${trained[1]}` : "old spam",
      ]);
      if (msg) $("[data-c]").innerHTML = msg;
    };
    /** Check every mission against the current state. */
    const check = () => {
      const at = m.w.at,
        injected = at < Infinity,
        any = m.ev.some((e) => e.k !== "W");
      if (!injected && m.w.t >= 400 && !any && api.done("calm"))
        api.say("300 calm emails and not one alarm. A good detector stays quiet when nothing changes.", "happy");
      const w = m.first("W"),
        d = m.first("D"),
        a = m.first("A"),
        e = m.first("E");
      if (injected && m.w.kind === "abrupt" && w && d && api.done("campaign"))
        api.say(
          `DDM warned ${w.t - at} emails after the campaign began and confirmed a change after ${d.t - at}. Warning first, then change.`,
          "surprised",
        );
      if (injected && a && api.done("adwin"))
        api.say(
          `ADWIN cut ${a.t - at} emails after the drift, dropping ${a.n} old email${a.n > 1 ? "s" : ""} from the tail. Its window now holds ${m.A.W.length}.`,
          "think",
        );
      if (trained && trained.after && m.w.t - trained[1] >= 100 && m.w.rate(100) < 0.2 && api.done("retrain"))
        api.say(
          `Back to ${fm(100 * m.w.rate(100), 0)}% errors over the last 100 emails: the filter learned the new spam from the emails since the warning.`,
          "love",
        );
      if (injected && m.w.kind === "gradual" && d && e && !told.race) {
        told.race = true;
        if (api.done("slow"))
          api.say(
            `Slow change: EDDM caught it after ${e.t - at} emails, DDM after ${d.t - at}. ${e.t < d.t ? "The gaps between errors shrank before the overall error rate rose enough." : "This time DDM was quicker."}`,
            "determined",
          );
      }
    };
    const after = (msg) => {
      draw(msg);
      check();
    };

    seg($("[data-k]"), "abrupt:New spam campaign|gradual:Slow change", kind, (x) => {
      kind = x;
      draw(`Next drift: <b>${KINDS[x]}</b>.`);
    });
    seg($("[data-w]"), "adwin:ADWIN|ddm:DDM|eddm:EDDM", v, (x) => {
      v = x;
      draw(
        {
          adwin: "<b>ADWIN</b>: blue line = window size; the bracket shows the emails it keeps.",
          ddm: "<b>DDM</b>: blue = p + s, orange dashes = warning line, red dashes = change line.",
          eddm: "<b>EDDM</b>: blue = gap statistic ÷ its best; warning below 0.95, drift below 0.90.",
        }[x],
      );
    });
    $("[data-p]").onclick = (ev) => {
      playing = !playing;
      ev.target.textContent = playing ? "Pause" : "Play";
    };
    $("[data-t]").onclick = () => (m.run(50), after());
    $("[data-i]").onclick = () => {
      if (m.w.at < Infinity) return draw("One drift per run: press <b>Reset</b> to start a new inbox.");
      m.w.inject(kind);
      after(`<b>${KINDS[kind]}</b> starts at email ${m.w.t}. Run the stream and watch the detectors.`);
    };
    $("[data-r]").onclick = () => {
      const d = m.first("D"),
        from = d ? d.from : Math.max(0, m.w.t - 100) + 1;
      m.w.retrain(from - 1);
      trained = [from, m.w.t];
      trained.after = !!d;
      m.D.reset();
      m.E.reset();
      after(
        d
          ? `Retrained on emails ${from}–${m.w.t}, stored since DDM's warning. Run 100 more emails.`
          : `No change detected yet, so the filter retrained on the last 100 emails (${from}–${m.w.t}).`,
      );
    };
    $("[data-z]").onclick = () => {
      m.reset();
      trained = null;
      told = {};
      playing = false;
      $("[data-p]").textContent = "Play";
      draw("A fresh inbox. The filter is wrong on about 1 email in 10.");
    };
    life.interval(() => {
      if (!playing || !box.isConnected) return;
      m.run(4);
      after();
    }, 200);
    draw("Emails arrive one at a time; tall red ticks are mistakes. Press <b>Play</b> or <b>+50 emails</b>.");
  }

  /** Briefing figure: one stream with a campaign at email 250, seen through each detector's view. */
  function viewsFig(box) {
    const m = monitor(8);
    m.run(150);
    m.w.inject("abrupt");
    m.run(150);
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const CAP = {
      ddm: "DDM: blue p + s rises through the orange warning line, then the red change line.",
      adwin: "ADWIN: the window grows while calm and drops when old emails are cut.",
      eddm: "EDDM: the gap ratio falls below 0.95 (warning) and 0.90 (drift).",
    };
    const draw = (v) => (
      view(box.children[1], m, v),
      (box.lastChild.innerHTML = `${CAP[v]}<div class="ds10-pills">${pills(m)}</div>`)
    );
    seg(box.firstChild, "ddm:DDM|adwin:ADWIN|eddm:EDDM", "ddm", draw);
    draw("ddm");
  }

  reg({
    id: "ds10-lab",
    order: 90,
    workshop: true,
    num: "10.W",
    title: "Workshop: guard the spam filter",
    blurb:
      "No code. Spammers change tactics; three drift detectors watch the filter's mistakes and you decide when to retrain.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "A spam filter learned last year's spam. Spammers will change tactics. Watch its mistakes with ADWIN, DDM and EDDM, and retrain when it drifts.",
        missions: [
          {
            id: "calm",
            t: "A calm inbox",
            d: "Without injecting a drift, press <b>+50 emails</b> until <b>Emails</b> reaches 400. No detector should fire.",
            hint: "The stream starts at 100 emails. Six presses of +50 gets you there.",
          },
          {
            id: "campaign",
            t: "A new spam campaign",
            d: "Pick <b>New spam campaign</b>, press <b>Inject drift</b>, keep the <b>DDM</b> view and run until DDM has warned and then caught it.",
            hint: "Watch the blue p + s line cross the orange warning line, then the red change line.",
          },
          {
            id: "adwin",
            t: "ADWIN cuts its window",
            d: "After a drift, switch to <b>ADWIN</b> and run until its window is cut.",
            hint: "The blue window-size line stops rising and drops when old emails are discarded.",
          },
          {
            id: "retrain",
            t: "Retrain from the warning",
            d: "Once DDM has caught a drift, press <b>Retrain</b>, then run at least 100 more emails until the error over the last 100 is below 20%.",
            hint: "Retrain uses the emails stored since DDM's warning, which already follow the new spam.",
          },
          {
            id: "slow",
            t: "A slow change",
            d: "Press <b>Reset</b>, pick <b>Slow change</b>, <b>Inject drift</b> and run until both DDM and EDDM have caught it.",
            hint: "Gradual drift takes a few hundred emails. Use <b>Play</b> and switch between the DDM and EDDM views.",
          },
        ],
        build(stage, api, lf) {
          sandbox(stage, api, lf || life);
        },
      });
      root.appendChild(
        pr(
          "ds10-lab-1",
          "Right after injecting a <b>New spam campaign</b>, before any detector fires, you press <b>Retrain</b>. Why does the error stay high?",
          [
            "It trains on the last 100 emails, mostly from before the campaign",
            "Retraining only works once ADWIN has emptied its window",
            "A retrained filter needs a whole new day before it can predict",
          ],
          "With no detection there is no warning point, so the sandbox retrains on the last 100 emails. Nearly all of them are old spam, so the filter learns the old rule again.",
        ),
      );
      root.appendChild(
        pr(
          "ds10-lab-2",
          "DDM warns at email 412 and confirms a change at email 431. You retrain on emails 412–431. Why start at 412 rather than at email 1?",
          [
            "Emails before the warning mostly follow the old spam patterns",
            "DDM deletes every email that arrived before its warning",
            "Older emails were already used, so they cannot be reused",
          ],
          "The warning marks roughly where the new concept begins. Training on everything since email 1 would mix in hundreds of old-rule emails and drag the filter back.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A good detector stays <b>quiet</b> on a stable stream and <b>fires soon</b> after a real drift.",
            "<b>DDM</b> moves from <b>warning</b> to <b>change</b>; the warning is the moment to start storing new data.",
            "<b>ADWIN</b> shows drift as a <b>cut</b>: old records leave the window from the tail.",
            "Retrain on the data <b>since the warning</b>, then reset the detector for the new model.",
            "On <b>gradual</b> drift, <b>EDDM</b>'s gaps between errors usually react before DDM's error rate.",
          ],
          "Detect, then retrain on the right data: the detector tells you when and from where.",
        ),
      );
    },
  });

  L["ds10-lab"] = {
    sum: "Watch a spam filter's error stream with ADWIN, DDM and EDDM, inject a spam campaign or a slow change, and retrain from DDM's warning point.",
    steps: [
      st(
        "What you will practise",
        "<p>A spam filter predicts spam or not spam; each mistake is a 1 in its error stream. Spammers change tactics, which is <b>concept drift</b>: the same kind of email now means something else. You will inject a drift, watch three detectors react, and retrain the filter at the right moment on the right data.</p>",
        F.flow([
          { t: "Emails", s: "one at a time", c: "blue" },
          { t: "Mistakes", s: "0 0 1 0 1", c: "rose" },
          { t: "Detectors", s: "ADWIN, DDM, EDDM", c: "violet" },
          { t: "Retrain", s: "since the warning", c: "teal" },
        ]),
        mc(
          "The filter's DDM enters the warning zone. What should the pipeline start doing?",
          [
            "Store the new emails in case a change is confirmed",
            "Retrain at once on every email ever received",
            "Switch off the filter until the warning clears",
          ],
          "A warning is not yet a change. Storing the new emails means that, if a change is confirmed, the data for the new concept is ready.",
        ),
      ),
      st(
        "Reading the three views",
        "<p>The sandbox has one view per detector. <b>DDM</b>: the blue p + s line against the orange warning line and the red change line. <b>ADWIN</b>: the window size, which rises while calm and drops at a cut. <b>EDDM</b>: the gap statistic divided by its best value, with lines at 0.95 and 0.90.</p>",
        (box) => viewsFig(box),
        mc(
          "In the DDM view, which line must the blue p + s line reach for DDM to detect a change?",
          [
            "The red dashed line, p<sub>min</sub> + 3s<sub>min</sub>",
            "The orange dashed line, p<sub>min</sub> + 2s<sub>min</sub>",
            "The 50% mark on the error axis",
          ],
          "The orange line (+2s<sub>min</sub>) only starts the warning zone; a change needs p + s to reach +3s<sub>min</sub>, the red line.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
