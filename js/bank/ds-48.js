/* js/bank/ds-48.js: Data Science lecture 10 revision questions, part 2: ds10-detect. */
(function () {
  const B = NIC.bank;
  const { mc, svg, tx } = NIC.shared.ds10;

  /** Five days of DDM readings as tappable tiles. */
  const days = (() => {
    const D = [0.12, 0.135, 0.15, 0.165, 0.18];
    return svg(
      520,
      84,
      D.map(
        (v, i) =>
          `<g data-pick="d${i + 1}" style="cursor:pointer"><rect x="${6 + i * 102}" y="6" width="96" height="72" rx="12" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/>${tx(54 + i * 102, 34, `Day ${i + 1}`, { s: 13 })}${tx(54 + i * 102, 58, `p + s = ${v}`, { s: 12, c: "var(--blue-ink)" })}</g>`,
      ).join(""),
      "Days 1 to 5 with p + s of 0.12, 0.135, 0.15, 0.165 and 0.18",
    );
  })();

  B.add("ds10-detect", [
    mc(
      "What does ADWIN maintain as the stream flows?",
      [
        "A window of the most recent records whose size adapts",
        "A fixed window of the last 1,000 records, set in advance",
        "Every record since the stream began, never discarding any",
      ],
      "ADWIN (ADaptive WINdowing) keeps recent records in a window of variable size, growing it when stable and shrinking it on a change.",
    ),
    mc(
      "ADWIN finds that two parts of its window disagree. Which records does it drop?",
      [
        "The oldest ones, from the tail of the window",
        "The newest ones, which caused the disagreement",
        "A random half of the window, to start afresh",
      ],
      "ADWIN adds records at the head and drops from the tail, so after a change the window keeps the recent data that reflects the new concept.",
    ),
    {
      type: "slider",
      q: "A model has made 900 predictions with an error rate of p = 0.1. What is DDM's s = √(p(1 − p) / n)?",
      min: 0,
      max: 0.05,
      step: 0.005,
      start: 0,
      ans: 0.01,
      tol: 0.0025,
      unit: "",
      hint: "0.1 × 0.9 = 0.09 and √0.09 = 0.3. √900 = 30. Then 0.3 ÷ 30.",
      why: "s = √(0.09 ÷ 900) = 0.3 ÷ 30 = 0.01.",
    },
    {
      type: "slider",
      q: "DDM has p<sub>min</sub> = 0.2 and s<sub>min</sub> = 0.03. Where does the <b>warning</b> zone start?",
      min: 0,
      max: 0.4,
      step: 0.01,
      start: 0,
      ans: 0.26,
      tol: 0.005,
      unit: "",
      hint: "Warning is p_min + 2 × s_min: 0.2 + 0.06.",
      why: "The warning line is p<sub>min</sub> + 2s<sub>min</sub> = 0.20 + 0.06 = 0.26 (the change line would be 0.29).",
    },
    {
      type: "cat",
      q: "DDM has p<sub>min</sub> = 0.10 and s<sub>min</sub> = 0.02, so the warning line is 0.14 and the change line 0.16. Sort each reading of p + s.",
      buckets: ["Stable", "Warning zone", "Change detected"],
      items: [
        ["0.12", 0],
        ["0.13", 0],
        ["0.145", 1],
        ["0.15", 1],
        ["0.17", 2],
        ["0.20", 2],
      ],
      why: "Below 0.14 is stable; from 0.14 up to (not including) 0.16 is the warning zone; 0.16 and above is a change.",
    },
    {
      type: "match",
      q: "Match each detector to what makes it fire.",
      pairs: [
        ["ADWIN", "Two parts of its window differ by at least ε_cut"],
        ["DDM", "p + s reaches p_min + 3 × s_min"],
        ["EDDM", "Mean gap + 2 × spread falls below 90% of its best"],
      ],
      why: "ADWIN compares the means of two sub-windows; DDM compares the error rate plus spread with its best; EDDM compares the gap statistic with its best value.",
    },
    {
      type: "multi",
      q: "Select every statement about <b>DDM</b> that is true.",
      o: [
        "It needs only a right-or-wrong signal per prediction",
        "It is used together with another learning algorithm",
        "Its warning line is lower than its change line",
        "It needs a window size chosen in advance",
        "It compares the means of two halves of a window",
      ],
      a: [0, 1, 2],
      why: "DDM reads a binary error stream alongside any learner, and warns at 2 spreads before signalling a change at 3. Windows and half-window comparisons are ADWIN's approach.",
    },
    {
      type: "order",
      q: "Put ADWIN's work for one new record in order.",
      items: [
        "Add the new record to the head of the window",
        "Try every split of the window into an older and a newer part",
        "Compare each split's gap in means with its ε_cut",
        "While some split is too far apart, drop the oldest record",
        "Output the mean of the window that is left",
      ],
      why: "This is the ADWIN algorithm from the lecture: add x_t to the head, drop from the tail until no split has |μ̂_W0 − μ̂_W1| ≥ ε_cut, then output μ̂_W.",
    },
    mc(
      "Why can EDDM catch a slow drift earlier than DDM?",
      [
        "Gaps between errors shrink as soon as errors start to bunch",
        "It retrains the model after every single error it sees",
        "It ignores errors and watches the input features instead",
      ],
      "DDM's overall error rate averages over everything since its last reset, so it moves slowly. EDDM's gap statistic reacts as soon as errors come closer together.",
    ),
    mc(
      "Why does ADWIN need a bigger gap before cutting when the two parts of its window are small?",
      [
        "With few records, a big gap can happen by chance",
        "Small windows are always cut, whatever the gap",
        "The threshold only depends on the confidence δ",
      ],
      "ε_cut grows as the parts shrink: a mean from a handful of records is noisy, so ADWIN demands stronger evidence before deciding the data changed.",
    ),
    {
      type: "pick",
      q: "DDM has p<sub>min</sub> = 0.10 and s<sub>min</sub> = 0.02. Tap the first day on which it signals a <b>change</b>.",
      fig: days,
      a: "d4",
      hint: "Change line: 0.10 + 3 × 0.02.",
      why: "The change line is 0.16. Day 3 (0.15) is only in the warning zone (at least 0.14); day 4 (0.165) is the first at or above 0.16.",
    },
    {
      type: "bug",
      q: "This EDDM step should signal a drift when the gap statistic falls well below its best. Tap the faulty line.",
      code: [
        "if error:",
        "    gap = t - last_error",
        "    last_error = t",
        "    update mean and spread of gap",
        "    ratio = (mean + 2 * spread) / best",
        "    if ratio > 0.90: signal_drift()",
      ],
      a: 5,
      hint: "Do shrinking gaps make the ratio go up or down?",
      why: "Drift makes errors closer together, so the ratio falls. The test must be ratio < 0.90; with > it fires while things are fine.",
    },
  ]);
})();
