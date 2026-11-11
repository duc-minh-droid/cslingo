/* Data Science boss quiz for Lecture 10 (concept drift detection). New scenario: an energy supplier (Glowgrid) whose model
   predicts each household's electricity use, and whose prediction errors feed drift detectors. */
(function () {
  const { svg, tx } = NIC.shared.ds10;

  /** Four ADWIN splits as tappable tiles: gap between the two parts and that split's threshold. */
  const splitsFig = (() => {
    const S = [
      ["a", "Split A", "gap 0.10", "ε 0.30"],
      ["b", "Split B", "gap 0.25", "ε 0.40"],
      ["c", "Split C", "gap 0.30", "ε 0.28"],
      ["d", "Split D", "gap 0.05", "ε 0.20"],
    ];
    return svg(
      520,
      96,
      S.map(
        ([k, t, g, e], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${6 + i * 128}" y="6" width="120" height="84" rx="12" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/>${tx(66 + i * 128, 32, t, { s: 13 })}${tx(66 + i * 128, 56, g, { s: 12, c: "var(--blue-ink)" })}${tx(66 + i * 128, 76, e, { s: 12, c: "var(--violet-ink)" })}</g>`,
      ).join(""),
      "Four splits: A gap 0.10 against 0.30, B gap 0.25 against 0.40, C gap 0.30 against 0.28, D gap 0.05 against 0.20",
    );
  })();

  NIC.registerBoss({
    id: "ds10-boss",
    subject: "ds",
    lecture: 10,
    title: "Lecture 10 boss quiz",
    blurb: "Ten questions set at an energy supplier: kinds of concept drift, ADWIN, DDM and EDDM.",
    lede: "A new scenario: <b>Glowgrid</b> supplies electricity and predicts each household's daily use. A prediction more than 10% off counts as an error. Its customers keep changing; keep the model honest.",
    qs: [
      {
        type: "cat",
        q: "Which kind of concept drift is each change in Glowgrid's customers?",
        buckets: ["Abrupt", "Gradual", "Recurring"],
        items: [
          ["A new night-time tariff starts on 1 March and use shifts at once", 0],
          ["A national lockdown sends everyone home overnight", 0],
          ["Heat pumps spread house by house over several years", 1],
          ["Rising prices slowly teach people to switch things off", 1],
          ["Use climbs every winter and falls back every summer", 2],
          ["Weekends look different from weekdays, every week", 2],
        ],
        why: "A change at one moment is abrupt; a slow spread over time is gradual; a pattern that comes back on a cycle (seasons, weekends) is recurring.",
      },
      {
        type: "mcq",
        q: "Glowgrid trained its model once, on last year's data, and has not touched it since. Its errors have been rising for months. What is the most likely explanation?",
        o: [
          "Customers' behaviour drifted and the batch model stayed as it was",
          "The model forgets what it learned if it is not retrained weekly",
          "Batch models lose accuracy as their weights wear out with use",
          "More customers means each prediction gets a smaller share of data",
        ],
        a: 0,
        why: "A batch model is fixed after training. Streaming data changes over time, so a model trained once becomes outdated as the concept drifts.",
      },
      {
        type: "order",
        q: "Put Glowgrid's DDM pipeline in order for one household's day.",
        items: [
          "The model predicts the day's use",
          "The meter reading arrives and the prediction is marked right or wrong",
          "DDM updates the error rate p and its spread s",
          "DDM compares p + s with p_min + 2s_min and p_min + 3s_min",
          "On a change, retrain on the days since the warning and reset DDM",
        ],
        hint: "A detector needs the error before it can update anything.",
        why: "DDM is used with the learning algorithm: each prediction becomes a binary error, the error rate and spread are updated, compared with the two lines, and a confirmed change triggers a retrain.",
      },
      {
        type: "slider",
        q: "Glowgrid's DDM has p<sub>min</sub> = 0.06 and s<sub>min</sub> = 0.02. At what value of p + s will it signal a <b>change</b>?",
        min: 0,
        max: 0.3,
        step: 0.01,
        start: 0,
        ans: 0.12,
        tol: 0.005,
        unit: "",
        hint: "Change needs p_min + 3 × s_min: 0.06 + 0.06.",
        why: "Change is detected at p + s ≥ p<sub>min</sub> + 3s<sub>min</sub> = 0.06 + 3 × 0.02 = 0.12. The warning zone starts earlier, at 0.10.",
      },
      {
        type: "match",
        q: "Match each detector to what it watches.",
        pairs: [
          ["ADWIN", "The means of an older and a newer part of a recent window"],
          ["DDM", "The error rate and its standard deviation"],
          ["EDDM", "The distance between one error and the next"],
        ],
        why: "ADWIN compares parts of its adaptive window; DDM tracks p and s of the error stream; EDDM tracks the gaps between errors.",
      },
      {
        type: "pick",
        q: "ADWIN checks four splits of its window. Each tile shows the gap between the two parts' means and that split's ε<sub>cut</sub>. Tap the split that makes ADWIN cut.",
        fig: splitsFig,
        a: "c",
        hint: "A cut needs the gap to be at least ε.",
        why: "Only split C has a gap (0.30) at least as large as its threshold (0.28). The others differ by less than their ε<sub>cut</sub>, which chance could explain.",
      },
      {
        type: "multi",
        q: "Select every statement about ADWIN that is <b>true</b>.",
        o: [
          "Its window grows while no change is apparent",
          "On a change it drops records from the oldest end",
          "It needs a fixed window size chosen in advance",
          "It can only read a binary right-or-wrong signal",
          "It ignores every record older than one day",
        ],
        a: [0, 1],
        why: "ADWIN's window has variable size: it grows when stable and shrinks from the tail on a change. No fixed size or time limit is set, and it works on any numeric stream, not only errors.",
      },
      {
        type: "bug",
        q: "This DDM step should set a warning at two spreads and a change at three. Tap the faulty line.",
        code: [
          "p = errors / n",
          "s = sqrt(p * (1 - p) / n)",
          "if p + s < p_min + s_min: p_min, s_min = p, s",
          "if p + s >= p_min + 3 * s_min: state = 'change'",
          "elif p + s >= p_min + 3 * s_min: state = 'warning'",
        ],
        a: 4,
        hint: "Compare the two thresholds with the rule.",
        why: "The warning zone starts at p<sub>min</sub> + 2s<sub>min</sub>. With 3 on both lines the warning branch can never be reached, so there is no early warning.",
      },
      {
        type: "slider",
        q: "Glowgrid's EDDM had a best gap statistic (mean gap + 2 × spread) of 40 days. It is now 34. What is the ratio EDDM compares with 0.95 and 0.90?",
        min: 0.5,
        max: 1,
        step: 0.01,
        start: 1,
        ans: 0.85,
        tol: 0.005,
        unit: "",
        hint: "34 ÷ 40: 34 is 6 less than 40, and 6 is 15% of 40.",
        why: "34 ÷ 40 = 0.85, below 0.90, so EDDM signals a drift: errors now come noticeably closer together than at their best.",
      },
      {
        type: "mcq",
        q: "After a tariff change, ADWIN's window for one region shrinks from 2,000 readings to 300. What do those 300 readings mostly hold?",
        o: [
          "Readings from around and after the tariff change",
          "The 300 oldest readings, kept as a stable baseline",
          "A random sample spread evenly over all 2,000",
          "Only the readings the model got wrong",
        ],
        a: 0,
        why: "ADWIN keeps the most recent records and drops older ones from the tail when the window's parts disagree, so what is left is the data since the change.",
      },
    ],
  });
})();
