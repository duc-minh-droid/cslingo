/* Algorithms, Phase 3 workshop: 3.W "Corner hunt" (no code). Part 4 of 4: the rule sliders, and cornerHunt() itself.
   cornerRules(c, api) tilts the profit line and adds the demand cap; cornerHunt() puts the three parts together. */
(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});
  const { cornerPlay, cornerView, fxOn, nice, pt, same, snd } = partScope;
  const N = NIC,
    { qs } = N;

  function cornerRules(c, api) {
    const { buildGeometry, cSlide, capBtn, capSlide, check, m, noCapBest, paint, read, say } = c;

    const onRules = (flash) => {
      buildGeometry(flash);
      paint();
      check();
      const key = c.best.idx.map((i) => pt(c.poly[i])).join("|");
      if (c.lastBest && key !== c.lastBest && flash !== "init") {
        if (fxOn()) N.fx.pop && N.fx.pop(qs(".aw3-stats", read));
      }
      c.lastBest = key;
    };
    cSlide.onInput((v) => {
      m.c2 = v;
      onRules(false);
      const tie = c.best.idx.length > 1;
      if (tie)
        say(
          `<b>A tie!</b> With Y at £${nice(v)}, ${c.best.idx.map((i) => pt(c.poly[i])).join(" and ")} both earn £${nice(c.best.z)}. The profit line lies along the whole edge between them, so every point on it is optimal.`,
        );
      else
        say(
          `With Y at £${nice(v)} the best corner is <b>${pt(c.poly[c.best.idx[0]])}</b> earning £${nice(c.best.z)}. The optimum stays on a corner however you tilt the line.`,
        );
    });
    cSlide.querySelector("input").addEventListener("change", () => {
      if (c.best.idx.length > 1) {
        api.say(
          `A tie between two corners: the profit line now runs <b>parallel</b> to that edge. Nudge the price either way and the optimum snaps to one end.`,
          "wink",
        );
        return;
      }
      if (!same(c.poly[c.best.idx[0]], [4, 3]) && !m.capOn)
        api.say(
          `The optimum <b>jumped</b> to ${pt(c.poly[c.best.idx[0]])}. It never slides along: it moves corner to corner as the profit line tilts.`,
          "surprised",
        );
    });
    capBtn.onclick = () => {
      m.capOn = !m.capOn;
      capBtn.setAttribute("aria-pressed", m.capOn);
      capBtn.classList.toggle("on", m.capOn);
      capBtn.textContent = m.capOn ? "Remove demand cap" : "Add demand cap";
      capSlide.hidden = !m.capOn;
      snd("tap");
      onRules(true);
      if (m.capOn) {
        const nb = noCapBest(),
          bp = c.poly[c.best.idx[0]];
        say(
          same(bp, nb.p[nb.b.idx[0]])
            ? `The cap y ≤ ${nice(m.cap)} cuts nothing off the optimum ${pt(bp)}: it has <b>slack</b>. Drag the cap down to squeeze the region.`
            : `The cap changes the answer: the best corner is now ${pt(bp)}.`,
        );
        api.say(
          "A new rule. At the current optimum, is it <b>binding</b> (holding you back) or does it have slack? Drag the cap down to find out.",
          "think",
        );
      } else say("Cap removed: back to two rules.");
    };
    capSlide.onInput((v) => {
      m.cap = v;
      onRules(false);
      const bp = c.poly[c.best.idx[0]],
        binding = Math.abs(bp[1] - m.cap) < 1e-6;
      const nb = noCapBest(),
        moved = !same(bp, nb.p[nb.b.idx[0]]);
      if (binding && moved) {
        say(
          `<b>Binding.</b> The cap now stops you at ${pt(bp)}, earning £${nice(c.best.z)} instead of £${nice(nb.b.z)}. A binding rule costs you profit; loosening it would earn more.`,
        );
      } else if (!moved)
        say(`The optimum is still ${pt(bp)}. The cap has <b>slack</b> here: loosening or removing it changes nothing.`);
      else say(`Optimum ${pt(bp)}, £${nice(c.best.z)}.`);
    });
    capSlide.querySelector("input").addEventListener("change", () => {
      const bp = c.poly[c.best.idx[0]],
        nb = noCapBest();
      if (Math.abs(bp[1] - m.cap) < 1e-6 && !same(bp, nb.p[nb.b.idx[0]]))
        api.say(
          `The cap is <b>binding</b>: it now forms part of the best corner ${pt(bp)}. The old optimum was squeezed out.`,
          "happy",
        );
      else api.say("The cap is still slack: the best corner hasn't moved. Drag it lower.", "idle");
    });
  }

  function cornerHunt(stage, api) {
    const c = cornerView(stage);
    cornerPlay(c, api);
    cornerRules(c, api);
    c.buildGeometry(false);
    c.paint();
    c.lastBest = c.best.idx.map((i) => pt(c.poly[i])).join("|");
  }
  Object.assign(partScope, { cornerHunt });
})();
