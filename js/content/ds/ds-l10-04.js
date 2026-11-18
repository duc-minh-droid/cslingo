/* Data Science (COM3021), Lecture 10: concept drift detection.
   This part: the lessons 10.3 (ds10-detect, the error stream, window sizes and ADWIN), 10.4 (ds10-ddm) and
   10.5 (ds10-eddm, and which detector when). Figures and the race demo come from ds-l10-02.js. */
(function () {
  const S = NIC.shared.ds10;
  const N = NIC;
  const { takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, card } = S;

  /* ============ 10.3 Listening for trouble ============ */
  reg({
    id: "ds10-detect",
    order: 3,
    num: "10.3",
    title: "Listening for trouble",
    blurb: "Turn predictions into a stream of right and wrong, then meet ADWIN, the window that knows when to forget.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const c = card("Detector race", "inject a drift");
      root.appendChild(c);
      S.race(c.lastElementChild, life, "adwin");
      root.appendChild(
        pr(
          "ds10-detect-2",
          "You watched <b>ADWIN</b> catch an <b>Abrupt</b> drift. What did its window size do?",
          [
            "It dropped sharply, then grew again from there",
            "It kept growing at the same steady rate",
            "It dropped to zero and stayed empty",
          ],
          "When two parts of the window disagree, ADWIN drops old records from the tail, so the size falls. Once the stream is steady again, the window grows once more.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Drift detectors watch the model's <b>error stream</b> (right or wrong) and work <b>with</b> the learning algorithm.",
            "A short window is quick but jumpy; a long one is smooth but slow.",
            "<b>ADWIN</b> keeps a window of <b>variable size</b>: it <b>grows</b> while calm and drops the <b>oldest</b> records when its parts disagree by at least ε<sub>cut</sub>.",
          ],
          "Grow while calm, cut when the halves disagree.",
        ),
      );
    },
  });

  L["ds10-detect"] = {
    sum: "Drift detectors read the model's <b>error stream</b>. <b>ADWIN</b> keeps an adaptive window that grows while the stream is steady and is cut when its older and newer parts disagree.",
    steps: [
      st(
        "Right or wrong, one at a time",
        `<p>We cannot see the rule directly, but we can see the next best thing: whether each prediction was right, once the real answer arrives. Basketly suggests plant milk; a moment later the shopper clicks or doesn't.</p><p>Write 0 for right and 1 for wrong, and the model becomes an <b>error stream</b>. A <b>drift detector</b> reads it and works <b>with</b> the learning algorithm: when it says “change”, the model is retrained. The lecture names three: <b>ADWIN</b>, <b>DDM</b> and <b>EDDM</b>.</p>`,
        F.flow([
          { t: "Model", s: "predicts", c: "blue" },
          { t: "Truth arrives", s: "right or wrong", c: "teal" },
          { t: "Error stream", s: "0 0 1 0 1 1", c: "rose" },
          { t: "Detector", s: "stable, warning, change", c: "violet" },
          { t: "Retrain", s: "on recent data", c: "amber" },
        ]),
        mc(
          "What does a drift detector such as DDM read?",
          [
            "Whether each prediction was right or wrong",
            "The raw input features of every record",
            "The model's weights after each epoch",
          ],
          "A detector works alongside any learning algorithm because it only needs a right-or-wrong signal per prediction: 0 for right, 1 for wrong.",
        ),
      ),
      st(
        "How far back should we look?",
        `<p>Picture judging a football team by its last 2 matches: one bad day and you panic. Judge it by its last 200 and you miss a real slump for months.</p><p>Averaging the errors in a <b>window</b> of recent records has the same trade-off. A <b>short window</b> reacts fast but jumps about, so chance alone can look like drift. A <b>long window</b> is smooth but slow to notice a change. Try the three sizes.</p>${mm("<p>The rolling error over the last $k$ records, with $x_j = 1$ for an error:</p>$$\\hat p_t = \\frac{1}{k}\\sum_{j=t-k+1}^{t} x_j$$<p>Its noise shrinks like $\\sqrt{p(1-p)/k}$: four times the window halves the noise, but the estimate needs about $k$ new records to catch up with a change.</p>")}`,
        (box) => S.rollFig(box),
      ),
      st(
        "ADWIN: a window that grows",
        `<p>What if the window sized itself? <b>ADWIN</b> (ADaptive WINdowing) does just that. Think of a diary you keep adding pages to while life is calm.</p><p>ADWIN's window has a <b>variable size</b>. It <b>grows</b> while no change is apparent, and <b>shrinks</b> when the data changes, throwing away the <b>oldest</b> records. Watch the bracket: it grows for 250 calm records, then gets cut soon after the drift (orange line).</p>`,
        (box, life) => S.growFig(box, life),
        mc(
          "A stream has not changed for 5,000 records. What does ADWIN's window hold?",
          [
            "All 5,000 records: it grows while nothing changes",
            "The last 100 records: the window has a fixed size",
            "Nothing: ADWIN empties its window when it is calm",
          ],
          "ADWIN only shrinks the window when its parts disagree. With no change it keeps every record, which gives the steadiest estimate.",
        ),
      ),
      st(
        "ADWIN: cut where the halves disagree",
        `<p>How does ADWIN know when to cut? After each new record it splits its window into an <b>older part</b> and a <b>newer part</b>, trying every split.</p><p>If, for some split, the two parts' error rates differ by at least a threshold called <b>ε<sub>cut</sub></b>, the older part is out of date, so ADWIN drops records from the old end. Small parts need a bigger gap first, because a handful of records can differ by pure chance. Step through a cut.</p>${mm("<p>For a split into $n_0$ older and $n_1$ newer records with means $\\hat\\mu_{W_0}$ and $\\hat\\mu_{W_1}$, ADWIN drops from the tail while</p>$$|\\hat\\mu_{W_0} - \\hat\\mu_{W_1}| \\ge \\epsilon_{cut}, \\qquad \\epsilon_{cut} = \\sqrt{\\frac{1}{2m}\\ln\\frac{4n}{\\delta}}, \\quad m = \\frac{1}{1/n_0 + 1/n_1}$$<p>with $n = n_0 + n_1$ and confidence $\\delta$ (here $0.002$). For $n_0 = n_1 = 100$: $\\epsilon_{cut} \\approx 0.36$; for $40 + 40$ it is about $0.55$. Beyond the slides: the published ADWIN stores the window in compressed buckets, so it checks only a few splits per record.</p>")}`,
        (box, life) => S.adwinRun(box, life),
      ),
    ],
    guide: [
      "Pick <b>ADWIN</b>, keep <b>Abrupt</b>, press <b>Inject drift</b>, then <b>+50 records</b> a few times: watch the window size.",
      "Press <b>Play</b> and watch the bracket shrink after the drift, then grow again.",
      "Answer the question after the demo.",
    ],
  };

  /* ============ 10.4 Warning lights: DDM ============ */
  reg({
    id: "ds10-ddm",
    order: 4,
    num: "10.4",
    title: "Warning lights: DDM",
    blurb: "Count the mistakes, remember your best day, and switch on amber before red.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const c = card("Detector race", "inject a drift");
      root.appendChild(c);
      S.race(c.lastElementChild, life, "ddm");
      root.appendChild(
        pr(
          "ds10-detect-1",
          "You watched <b>DDM</b> on an <b>Abrupt</b> drift. Which dashed line did the blue p + s line reach first?",
          [
            "The orange warning line, then the red change line",
            "The red change line, then the orange warning line",
            "Neither: p + s stayed below both lines",
          ],
          "The warning line sits lower than the change line, so a rising p + s always crosses it first.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>DDM</b> tracks the <b>error rate p<sub>i</sub></b> and its <b>standard deviation s<sub>i</sub></b>, and remembers its best: <b>p<sub>min</sub></b> and <b>s<sub>min</sub></b>.",
            "<b>Warning</b> at p<sub>i</sub> + s<sub>i</sub> ≥ p<sub>min</sub> + 2s<sub>min</sub>; <b>change detected</b> at p<sub>min</sub> + 3s<sub>min</sub>.",
            "In the warning zone, store new records; on a change, retrain on them and reset.",
          ],
          "Amber first, then red.",
        ),
      );
    },
  });

  L["ds10-ddm"] = {
    sum: "<b>DDM</b> tracks the error rate p and its spread s. It warns at p + s ≥ p<sub>min</sub> + 2s<sub>min</sub> and detects a change at p<sub>min</sub> + 3s<sub>min</sub>.",
    steps: [
      st(
        "Counting mistakes",
        `<p>Picture a referee keeping a running tally of a player's fouls. <b>DDM</b> (Drift Detection Method) does that with errors: each prediction is True (an error) or False (correct).</p><p>At each moment <i>i</i> it tracks the <b>error rate p<sub>i</sub></b>, the share of predictions so far that were wrong, and its <b>standard deviation s<sub>i</sub></b>, how wobbly that estimate still is. The more records it has seen, the smaller the wobble. Slide the number of records.</p>${mm("<p>The errors are Bernoulli trials, so after $i$ predictions</p>$$p_i = \\frac{\\text{errors}}{i}, \\qquad s_i = \\sqrt{\\frac{p_i(1 - p_i)}{i}}$$<p>Four times the records halves $s_i$, because of the square root.</p>")}`,
        (box) => S.spreadFig(box),
        mc(
          "DDM keeps seeing predictions at the same error rate. What happens to its standard deviation s?",
          ["It gets smaller", "It gets bigger", "It stays the same"],
          "More records make the estimate of the error rate more certain, so its spread shrinks.",
        ),
      ),
      st(
        "Amber, then red",
        `<p>Think of a car's dashboard: an amber light first, then red. DDM remembers its best moment so far: <b>p<sub>min</sub></b>, the lowest error rate, and <b>s<sub>min</sub></b>, the lowest standard deviation.</p><p>When the error rate plus its wobble climbs <b>two</b> of those best spreads above the best rate, DDM is in the <b>warning zone</b>. At <b>three</b> spreads above, it says <b>change detected</b>. Step through 120 calm records followed by a burst of errors.</p>${mm("<p>$$p_i + s_i \\ge p_{min} + 2\\,s_{min} \\Rightarrow \\text{warning}, \\qquad p_i + s_i \\ge p_{min} + 3\\,s_{min} \\Rightarrow \\text{change}$$</p><p>From the original paper (Gama et al., 2004), beyond the slides: checks start after 30 predictions, and $p_{min}, s_{min}$ are updated whenever $p_i + s_i < p_{min} + s_{min}$. For a normal approximation, 2 and 3 standard deviations are roughly 95% and 99% confidence levels.</p>")}`,
        (box, life) => S.ddmRun(box, life),
        mc(
          "What does DDM compare its current reading with to decide whether something is wrong?",
          [
            "Its best moment so far: p<sub>min</sub> and s<sub>min</sub>",
            "A fixed error rate chosen before the stream starts",
            "The error rate of a brand-new, untrained model",
          ],
          "DDM keeps the lowest p + s it has seen and measures how far today's reading has climbed above it.",
        ),
      ),
      st(
        "When the light turns amber",
        `<p>A smoke alarm that beeps once makes you sniff the air; a loud alarm sends you outside. DDM's two levels have two jobs like that.</p><p>In the <b>warning zone</b> the system starts <b>storing</b> new records, just in case. If a <b>change</b> follows, a new model is trained on the records stored since the warning, and the detector starts afresh. If things calm down, the warning is dropped. (This retraining policy is from the DDM paper, beyond the slides.)</p>`,
        (box) => S.zonesFig(box),
      ),
    ],
    guide: [
      "Pick <b>DDM</b>, press <b>Inject drift</b>, then <b>+50 records</b> until DDM says it caught the drift.",
      "Watch the blue p + s line against the orange and red dashed lines.",
      "Answer the question after the demo.",
    ],
  };

  /* ============ 10.5 Errors that bunch up: EDDM ============ */
  reg({
    id: "ds10-eddm",
    order: 5,
    num: "10.5",
    title: "Errors that bunch up",
    blurb: "EDDM listens to the gaps between errors, and which of the three detectors to pick when.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>EDDM</b> watches the <b>distance between errors</b>: shrinking gaps mean errors are coming faster.",
            "It reacts earlier to <b>gradual</b> drift than DDM, at the cost of more false alarms.",
            "All three detectors catch <b>abrupt</b> drift quickly; ADWIN works on any stream of numbers.",
          ],
          "Mind the gaps.",
        ),
      );
    },
  });

  L["ds10-eddm"] = {
    sum: "<b>EDDM</b> watches the gaps between errors, which shrink when a drift starts, so it reacts earlier than DDM to <b>gradual</b> drift.",
    steps: [
      st(
        "Mind the gaps",
        `<p>Picture a dripping tap. Drips far apart: nothing to worry about. Drips closer and closer: something is breaking.</p><p><b>EDDM</b> (Early Drift Detection Method) listens in the same way. Instead of the error rate, it watches the <b>distance between two errors</b>. While the model is good, errors are far apart. When the concept drifts, errors bunch up and the gaps shrink.</p>`,
        (box) => S.gapsFig(box, "before"),
        mc(
          "Basketly's errors used to arrive about 12 records apart. Now they arrive about 4 apart. What does that tell EDDM?",
          [
            "Errors are more frequent: a sign of drift",
            "Errors are rarer: the model has improved",
            "Nothing: EDDM only reads the error rate",
          ],
          "Shorter gaps between errors mean errors come more often, so EDDM's score falls and it heads towards a drift signal.",
        ),
      ),
      st(
        "When the gaps shrink too far",
        `<p>EDDM turns the gaps into a score (their average plus twice their spread) and remembers the <b>best score</b> it has seen, just as DDM remembers its best day.</p><p>If today's score falls below <b>95%</b> of the best, EDDM raises a <b>warning</b>; below <b>90%</b>, it signals a <b>drift</b>. Switch to <b>After the drift</b> and back to watch the score fall.</p>${mm("<p>Beyond the slides (Baena-García et al., 2006): with $p'_i$ the mean distance between errors and $s'_i$ its standard deviation, keep the maximum $p'_{max} + 2s'_{max}$ and test</p>$$\\frac{p'_i + 2s'_i}{p'_{max} + 2s'_{max}} < \\alpha = 0.95 \\Rightarrow \\text{warning}, \\qquad < \\beta = 0.90 \\Rightarrow \\text{drift}$$<p>Checks start after 30 errors.</p>")}`,
        (box) => S.gapsFig(box, "after"),
      ),
      st(
        "Which detector when?",
        `<p>Three smoke alarms, three temperaments. All three catch a sudden, <b>abrupt</b> drift quickly. The difference shows with <b>gradual</b> drift, where errors creep up: <b>EDDM</b> was designed to react earlier, <b>DDM</b> waits for the overall error rate to rise, and <b>ADWIN</b> waits until its window's parts clearly differ.</p><p>Quicker is not always better: EDDM also raises more false alarms on a calm stream. ADWIN works on any stream of numbers, not just errors.</p>`,
        (box) => S.raceFig(box),
        mc(
          "A churn model's error creeps up slowly over months. Which detector was designed to flag this earlier than DDM?",
          ["EDDM", "ADWIN", "None of them can see gradual drift"],
          "EDDM watches the distance between errors, which shrinks as soon as errors start bunching, so it reacts to slow drift earlier than DDM's overall error rate.",
        ),
      ),
    ],
  };
})();
