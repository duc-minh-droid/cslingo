/* Data Science Lecture 9 workshop (9.W): train the courier model before deployment, deploy it, then keep it fresh as the
   city changes. Frozen, nightly retraining (all data or a recent window) and online learning. No code, no typing. */
(function () {
  const S = NIC.shared.ds9;
  const { reg, mc, pr, st, fm, seg, stats, setStats, rng, gauss, trips, loss, grad, best, sgd } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const DRIFT = 4,
    ALARM = 3,
    GOOD = 1.5;

  /** The sandbox. Every mission is checked from the simulation state after each action. */
  function sandbox(stage, api) {
    const past = trips(24, 4, 7),
      wBest = best(past);
    let tw = 10,
      eta = 0.05,
      ep = 0;
    let live = null,
      recOnline = false;
    const fresh = (w) => ({ w, day: 0, strat: "frozen", oeta: 0.004, hist: [past], days: [], read: 0 });
    const A = el(
      `<div class="wk-card"><h3>1 · Before deployment: train on 24 past deliveries</h3><div class="controls" data-e></div><div class="controls"><button class="btn primary" data-t>Train 1 epoch</button><button class="btn" data-d>Deploy this model</button></div>${stats(
        [
          ["violet", "Epochs"],
          ["amber", "Weight w"],
          ["rose", "Loss"],
        ],
      )}<div class="fig-cap" data-c></div></div>`,
    );
    const B = el(
      `<div class="wk-card"><h3>2 · Live: one day of deliveries at a time</h3><div class="controls" data-s></div><div class="controls" data-o></div><div class="ds9-days" data-g></div><div class="controls"><button class="btn primary" data-n>Next day</button><button class="btn" data-x>Send a glitch</button><button class="btn ghost" data-z>Reset days</button></div>${stats(
        [
          ["blue", "Day"],
          ["amber", "Model weight"],
          ["rose", "Today's error"],
          ["violet", "Rows read last night"],
        ],
      )}<div class="fig-cap" data-l></div></div>`,
    );
    stage.append(A, B);
    const $a = (s) => qs(s, A),
      $b = (s) => qs(s, B);
    const drawA = (msg) => {
      setStats(A, [ep, Math.abs(tw) > 1e4 ? "huge" : fm(tw, 3), loss(past, tw) > 1e6 ? "huge" : fm(loss(past, tw), 2)]);
      if (msg) $a("[data-c]").innerHTML = msg;
    };
    const drawB = (msg) => {
      if (!live) {
        setStats(B, ["–", "–", "–", "–"]);
        $b("[data-g]").innerHTML = "";
        $b("[data-l]").innerHTML = "Deploy a trained model first.";
        return;
      }
      $b("[data-g]").innerHTML = live.days
        .map(
          (d, i) =>
            `<span class="ds9-day ${d.err > ALARM ? "bad" : d.err < GOOD ? "ok" : ""} ${i + 1 >= DRIFT ? "drift" : ""}" title="${d.strat}">D${i + 1}<br>${fm(d.err, 1)}</span>`,
        )
        .join("");
      const t = live.days[live.days.length - 1];
      setStats(B, [live.day, fm(live.w, 2), t ? `${fm(t.err, 1)} min` : "–", live.read]);
      if (msg) $b("[data-l]").innerHTML = msg;
    };

    seg($a("[data-e]"), "0.01:Learning rate 0.01|0.05:0.05|0.15:0.15", eta, (v) => {
      eta = +v;
      drawA(`Learning rate ${v}. Each epoch makes one full batch update with all 24 trips.`);
    });
    $a("[data-t]").onclick = () => {
      const before = loss(past, tw);
      tw -= eta * grad(past, tw);
      ep++;
      const now = loss(past, tw);
      if (now > before && api.done("overshoot"))
        api.say(
          `The loss went <b>up</b>, from ${fm(before, 1)} to ${fm(now, 1)}: a learning rate of ${eta} overshoots the bottom of the bowl.`,
          "surprised",
        );
      if (Math.abs(tw - wBest) < 0.05 && api.done("train"))
        api.say(
          `Converged: w = ${fm(tw, 2)} min per km, the best this data allows. Now <b>Deploy this model</b>.`,
          "happy",
        );
      drawA(now > before ? `Loss rose to ${fm(now, 2)}: the step overshot.` : `Epoch ${ep}: loss ${fm(now, 2)}.`);
    };
    $a("[data-d]").onclick = () => {
      live = fresh(tw);
      drawB(`Deployed with w = ${fm(tw, 2)}. Press <b>Next day</b>. Roadworks start on day ${DRIFT}.`);
    };

    seg(
      $b("[data-s]"),
      "frozen:Frozen|all:Retrain on all data|window:Retrain on last 3 days|online:Online",
      "frozen",
      (v) => {
        if (live) live.strat = v;
        drawB(
          {
            frozen: "Frozen: the model never changes after deployment.",
            all: "Every night: retrain to convergence on <b>all</b> the data so far.",
            window: "Every night: retrain to convergence on the <b>last 3 days</b> only.",
            online: "Online: update the weight after <b>every</b> delivery.",
          }[v],
        );
      },
    );
    seg($b("[data-o]"), "0.004:Online rate 0.004|0.04:0.04", "0.004", (v) => {
      if (live) live.oeta = +v;
    });
    $b("[data-n]").onclick = () => {
      if (!live) return drawB();
      const s = live,
        day = ++s.day,
        W = day >= DRIFT ? 6 : 4,
        r = rng(500 + day),
        recs = [];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const x = 1 + Math.floor(r() * 4),
          p = { x, y: W * x + gauss(r) };
        sum += Math.abs(s.w * x - p.y);
        if (s.strat === "online") s.w = sgd(s.w, p, s.oeta);
        recs.push(p);
      }
      const err = sum / 12;
      s.hist.push(recs);
      s.days.push({ err, strat: s.strat });
      s.read = 0;
      if (s.strat === "all" || s.strat === "window") {
        const use = (s.strat === "all" ? s.hist : s.hist.slice(-3)).flat();
        s.w = best(use);
        s.read = use.length;
      }
      const since = s.days.slice(DRIFT - 1);
      const only = (k) => since.length > 0 && since.every((d) => d.strat === k);
      let msg = `Day ${day}: average error <b>${fm(err, 1)} min</b>${day >= DRIFT ? " (roadworks: about 6 min per km)" : ""}.`;
      if (err > ALARM && s.strat === "frozen" && api.done("drift"))
        api.say(
          `Alarm! Since the roadworks every km takes about 6 minutes, but the frozen model still says ${fm(s.w, 1)}. That is concept drift.`,
          "shocked",
        );
      if (day > DRIFT && err < GOOD && only("window") && api.done("window"))
        api.say("Back under 1.5 minutes. Retraining on the last 3 days soon forgets the old roads.", "happy");
      if (day > DRIFT && err < GOOD && only("online") && !recOnline) {
        recOnline = true;
        api.say(
          "Recovered without any nightly retrain: online learning adjusted the weight one delivery at a time. Now pick <b>0.04</b> and <b>Send a glitch</b>.",
          "love",
        );
      }
      if (s.strat === "all" && day > DRIFT && err > GOOD)
        msg += ` Retraining on <b>all</b> data drags the model back towards the old 4 min per km, and reads ${s.read} rows.`;
      drawB(msg);
    };
    $b("[data-x]").onclick = () => {
      if (!live) return drawB();
      const p = { x: 2, y: 90 },
        before = live.w;
      live.hist.push([p]);
      if (live.strat === "online") live.w = sgd(live.w, p, live.oeta);
      const jump = live.w - before;
      if (live.strat === "online" && jump > 3 && recOnline && api.done("online"))
        api.say(
          `One bad record moved the weight by ${fm(jump, 1)} min per km at once. Online learning needs close monitoring.`,
          "dizzy",
        );
      drawB(
        live.strat === "online"
          ? `A 2 km trip logged as 90 minutes. The online weight jumps from ${fm(before, 2)} to <b>${fm(live.w, 2)}</b> straight away.`
          : "A 2 km trip logged as 90 minutes goes into the stored data. Nothing changes until a retrain, and it can be checked first.",
      );
    };
    $b("[data-z]").onclick = () => {
      if (!live) return drawB();
      const k = { strat: live.strat, oeta: live.oeta };
      live = Object.assign(fresh(tw), k);
      drawB(`Back to day 0 with the deployed w = ${fm(tw, 2)}.`);
    };
    drawA("Start at w = 10. Press <b>Train 1 epoch</b>.");
    drawB();
  }

  reg({
    id: "ds9-lab",
    order: 90,
    workshop: true,
    num: "9.W",
    title: "Workshop: keep the courier model fresh",
    blurb: "No code. Train a model before deployment, then watch the city change and keep it accurate.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "A courier app predicts delivery minutes as w × km. Train it, deploy it, and keep it right when roadworks hit the city.",
        missions: [
          {
            id: "train",
            t: "Train before deployment",
            d: "In card 1 press <b>Train 1 epoch</b> until the weight stops moving.",
            hint: "With learning rate 0.05 it settles near 4 in a handful of epochs.",
          },
          {
            id: "overshoot",
            t: "Overshoot",
            d: "Pick <b>0.15</b> and press <b>Train 1 epoch</b> until the loss goes up.",
            hint: "Too big a step jumps past the bottom of the bowl. Train again at 0.05 afterwards.",
          },
          {
            id: "drift",
            t: "Spot the drift",
            d: "Press <b>Deploy this model</b>, keep <b>Frozen</b>, and press <b>Next day</b> until a day turns red.",
            hint: "Roadworks start on day 4. A day above 3 minutes of error raises the alarm.",
          },
          {
            id: "window",
            t: "Recover with recent data",
            d: "Press <b>Reset days</b>, choose <b>Retrain on last 3 days</b>, and press <b>Next day</b> until a day after the roadworks is green again.",
            hint: "Each night it retrains on only the last 3 days, so the old 4 min per km soon drops out.",
          },
          {
            id: "online",
            t: "Recover online, then break it",
            d: "<b>Reset days</b>, choose <b>Online</b> and run past day 4 until a day is green. Then pick <b>0.04</b> and press <b>Send a glitch</b>.",
            hint: "Online learning updates after every delivery. A big online rate lets one bad record pull the weight far off.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds9-lab-1",
          "The model is deployed with w = 4 and stays <b>Frozen</b>. From day 4 every km takes about 6 minutes. Roughly what is the error on a 3 km delivery?",
          ["About 6 minutes", "About 2 minutes", "About 18 minutes"],
          "The model predicts 4 × 3 = 12 minutes; the trip really takes about 6 × 3 = 18. That is about 6 minutes off, and it stays that way because a frozen model never updates.",
        ),
      );
      root.appendChild(
        pr(
          "ds9-lab-2",
          "After the roadworks you choose <b>Retrain on all data</b> instead of the last 3 days. Why does it recover more slowly?",
          [
            "The old deliveries still outnumber the new and pull w towards 4",
            "Retraining on all data uses a smaller learning rate",
            "It only retrains once a week instead of every night",
          ],
          "A full retrain weighs every stored delivery equally, so the many pre-roadworks trips keep the fit near 4 until enough new days pile up. A short window forgets them, and reads fewer rows too.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Batch learning trains the model <b>before deployment</b>; with a sensible learning rate full batch training converges smoothly.",
            "A <b>frozen</b> model cannot follow <b>concept drift</b>: its error rises and stays up.",
            "Retraining on <b>recent data</b> recovers sooner and reads a fixed amount; retraining on <b>all</b> data is slower to forget and keeps growing.",
            "<b>Online learning</b> adapts after every record without nightly retrains, but <b>bad data</b> hits it at once: it needs monitoring.",
          ],
          "Deploying a model is the start of looking after it, not the end.",
        ),
      );
    },
  });

  L["ds9-lab"] = {
    sum: "Train a one-weight courier model with full batch gradient descent, deploy it, and keep it accurate through roadworks with nightly retraining or online learning.",
    steps: [
      st(
        "What you will practise",
        "<p>First you train the model <b>before deployment</b>: full batch gradient descent on 24 past deliveries. Then it goes live, and the city changes: from day 4 roadworks make every km slower. You choose how the model keeps up.</p>",
        F.flow([
          { t: "Train", s: "full batch, epochs", c: "blue" },
          { t: "Deploy", s: "predict live", c: "teal" },
          { t: "Drift", s: "roadworks, day 4", c: "rose" },
          { t: "Keep up", s: "retrain or online", c: "violet" },
        ]),
        mc(
          "Training finished before deployment and the model never changes afterwards. What is this approach called?",
          ["Batch learning", "Online learning", "Stochastic learning"],
          "Batch learning uses the available data to train before deployment. Online learning keeps updating after deployment.",
        ),
      ),
      st(
        "Three ways to keep up",
        "<p>A <b>nightly retrain</b> fits the model again from stored data: on <b>all</b> of it, or on a <b>recent window</b>. <b>Online learning</b> needs no retrain: it nudges the weight after every delivery, by the online learning rate.</p>",
        F.compare(
          {
            title: "Retrain on a window",
            c: "blue",
            body: "a fixed amount of recent data each night; old data drops out",
          },
          { title: "Online", c: "violet", body: "update after every record; fast, but bad data hits at once" },
        ),
        mc(
          "Which approach reads the same number of rows every night, however long the app has run?",
          [
            "Retraining on the last 3 days",
            "Retraining on all the data so far",
            "Keeping the model frozen and retraining yearly",
          ],
          "A fixed window always holds 3 days of deliveries. Retraining on everything reads more each night.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
