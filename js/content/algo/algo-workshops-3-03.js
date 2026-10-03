/* Algorithms, Phase 3 workshop: 3.W "Corner hunt" (no code). Part 3 of 4: the interactions.
   cornerPlay(c, api) wires the three modes (try plans, slide the profit line, walk corners) and the mission checks. */
(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});
  const { SPAN, U, X0, Y0, bestOf, fxOn, legal, lhs, nice, polygon, pt, rules, same, snd, zOf } = partScope;
  const N = NIC,
    { qs } = N;

  function cornerPlay(c, api) {
    const { $, m, paint, plot, say, svg, zSlide } = c;

    const flags = { feas: false, infeas: false };
    /* ----- missions ----- */
    const noCapBest = () => {
      const p = polygon(rules({ ...m, capOn: false }));
      return { p, b: bestOf(p, m) };
    };
    function check() {
      if (flags.feas && flags.infeas) api.done("plan");
      if (m.mode === "line") {
        const gap = c.best.z - m.z;
        if (gap >= -1e-7 && gap < 0.26) api.done("slide");
      }
      if (m.moved && c.best.idx.some((i) => same(c.poly[i], m.walk))) api.done("walk");
      const nb = noCapBest();
      if (!m.capOn && c.best.idx.length === 1 && !same(c.poly[c.best.idx[0]], [4, 3]) && nb.b.idx.length === 1)
        api.done("jump");
      if (m.capOn && c.best.idx.length >= 1) {
        const bp = c.poly[c.best.idx[0]],
          base = nb.p[nb.b.idx[0]];
        if (Math.abs(bp[1] - m.cap) < 1e-6 && !same(bp, base) && !same(bp, [4, 3])) api.done("cap");
      }
    }
    /* ----- interactions ----- */
    function setMode(v) {
      m.mode = v;
      paint();
      api.say(
        {
          plan: "Drag the dot around. Green is legal; outside it, a rule is broken and its line turns red.",
          line: "Slide the profit up. Every plan on the line earns the same. Where does it stop being possible?",
          walk: "You start at the origin. Step to a neighbouring corner only if it <b>earns more</b>.",
        }[v],
        "idle",
      );
      check();
    }
    // plan mode: drag
    let drag = false;
    const toData = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      const q = p.matrixTransform(svg.getScreenCTM().inverse());
      return [Math.max(0, Math.min(SPAN - 0.05, (q.x - X0) / U)), Math.max(0, Math.min(SPAN - 0.05, (Y0 - q.y) / U))];
    };
    const snapP = (p) => [Math.round(p[0] * 20) / 20, Math.round(p[1] * 20) / 20];
    svg.addEventListener("pointerdown", (e) => {
      if (m.mode !== "plan") return;
      drag = true;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (x) {
        /* ignore */
      }
      m.P = snapP(toData(e));
      paint();
      e.preventDefault();
    });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      m.P = snapP(toData(e));
      paint();
    });
    const release = () => {
      if (!drag) return;
      drag = false;
      judgePlan();
    };
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    $("[data-pi]").addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] }[e.key];
      if (!d) return;
      e.preventDefault();
      m.P = [Math.max(0, Math.min(SPAN - 0.05, m.P[0] + d[0])), Math.max(0, Math.min(SPAN - 0.05, m.P[1] + d[1]))];
      paint();
      clearTimeout(judgePlan.t);
      judgePlan.t = setTimeout(judgePlan, 400);
    });
    function judgePlan() {
      const bad = c.rs.filter((r) => lhs(r, m.P) > r.lim + 1e-6),
        z = zOf(m.P, m);
      if (bad.length) {
        flags.infeas = true;
        snd("wrong");
        if (fxOn()) N.fx.shake($("[data-pi]"));
        const r = bad[0];
        api.say(
          `Illegal plan: <b>${r.t.toLowerCase()}</b> needs ${r.f} = ${nice(lhs(r, m.P))}, but only ${nice(r.lim)} is available${bad.length > 1 ? `. It breaks ${bad.length} rules in all` : ""}. Outside the green area means at least one rule is broken.`,
          "sad",
        );
        say(
          `<b>Not allowed.</b> A plan is legal only if <b>every</b> rule holds at once. ${bad.map((q) => `<b>${q.t}</b>: ${q.f} = ${nice(lhs(q, m.P))} &gt; ${nice(q.lim)}`).join(" · ")}.`,
        );
      } else {
        flags.feas = true;
        snd("select");
        api.say(
          `Legal plan ${pt(m.P)} earning <b>£${nice(z)}</b>. The best corner earns £${nice(c.best.z)}: can you beat your own plan and stay in the green?`,
          z >= c.best.z - 1e-7 ? "love" : "happy",
        );
        say(
          `<b>Legal.</b> Every rule has room left or is exactly at its limit. Try to push the dot to a plan that earns more without leaving the green.`,
        );
      }
      check();
    }
    // slide the profit line
    zSlide.onInput((v) => {
      m.z = v;
      paint();
      const g = legal(c.poly, m, v);
      if (!g) {
        say(
          `<b>No legal plan earns £${nice(v)}.</b> The line has left the green area. The best you can do is <b>£${nice(c.best.z)}</b>, at the last corner it touched.`,
        );
      } else if (g.len > 0.02) {
        say(
          `Every plan on this line earns <b>£${nice(v)}</b>: from ${pt(g.a)} to ${pt(g.b)}. Slide it further out: there is still room.`,
        );
      } else {
        say(
          `The line touches <b>one corner only</b>, ${pt(g.a)}. Nudge it any further and it leaves the region: <b>£${nice(v)}</b> is the most you can earn.`,
        );
      }
      check();
    });
    zSlide.querySelector("input").addEventListener("change", () => {
      const gap = c.best.z - m.z;
      if (gap < -1e-7) {
        api.say(
          `Too far: nothing legal earns £${nice(m.z)}. Slide back until the line just touches the green area.`,
          "think",
        );
        snd("wrong");
      } else if (gap < 0.26) {
        api.say(
          `Right on the edge: the line touches just the corner ${pt(c.poly[c.best.idx[0]])}${c.best.idx.length > 1 ? " and its neighbour (a tie)" : ""}. <b>The best plan is always a corner.</b>`,
          "love",
        );
        snd("correct");
      } else if (legal(c.poly, m, m.z) && m.z > c.best.z * 0.6)
        api.say("Close. There is still green left beyond this line, so you can earn more.", "idle");
    });
    // walk the corners
    function tapCorner(i) {
      if (m.mode !== "walk") {
        return;
      }
      const n = c.poly.length,
        cur = c.poly.findIndex((p) => same(p, m.walk)),
        tgt = c.poly[i];
      if (i === cur) return;
      const zc = zOf(m.walk, m),
        zt = zOf(tgt, m),
        nb = [(cur + 1) % n, (cur + n - 1) % n];
      const g = qs(`[data-i="${i}"]`, plot);
      if (!nb.includes(i)) {
        snd("wrong");
        if (g && fxOn()) N.fx.shake(g);
        api.say(
          `${pt(tgt)} is not next door. Simplex only walks along an <b>edge</b> to a neighbouring corner.`,
          "think",
        );
        say(
          `From ${pt(m.walk)} you can reach ${pt(c.poly[nb[0]])} and ${pt(c.poly[nb[1]])} in one step. Tap one of those.`,
        );
        return;
      }
      if (zt <= zc + 1e-9) {
        snd("wrong");
        if (g && fxOn()) N.fx.shake(g);
        api.say(
          `Downhill: profit would ${zt < zc - 1e-9 ? `fall from £${nice(zc)} to £${nice(zt)}` : `stay at £${nice(zc)}`}. Simplex only steps to a corner that <b>earns more</b>.`,
          "sad",
        );
        say(
          `${pt(tgt)} earns £${nice(zt)}, not more than £${nice(zc)}. Look at the corner table and pick a neighbour with a bigger profit.`,
        );
        return;
      }
      m.walk = tgt.slice();
      m.trail.push(tgt.slice());
      m.moved++;
      snd("step");
      paint();
      const i2 = c.poly.findIndex((p) => same(p, m.walk)),
        nb2 = [(i2 + 1) % n, (i2 + n - 1) % n],
        ups = nb2.filter((k) => zOf(c.poly[k], m) > zt + 1e-9),
        ties = nb2.filter((k) => Math.abs(zOf(c.poly[k], m) - zt) < 1e-7);
      if (!ups.length) {
        api.say(
          `Uphill: £${nice(zc)} to <b>£${nice(zt)}</b>. Both neighbours earn less${ties.length ? " or the same" : ""}, so there is nowhere better to go: <b>this corner is optimal.</b>`,
          "love",
        );
        say(
          `<b>Stop.</b> No neighbouring corner beats £${nice(zt)}. That is simplex's stopping rule: no edge improves the profit.`,
        );
      } else {
        api.say(
          `Uphill: £${nice(zc)} to <b>£${nice(zt)}</b>. ${ups.length} neighbour${ups.length > 1 ? "s" : ""} still ${ups.length > 1 ? "earn" : "earns"} more, so keep walking.`,
          "happy",
        );
        say(
          `At ${pt(tgt)} with £${nice(zt)}. Neighbours: ${nb2.map((k) => `${pt(c.poly[k])} earns £${nice(zOf(c.poly[k], m))}`).join(" and ")}.`,
        );
      }
      check();
    }
    qs("[data-wreset]", plot).onclick = () => {
      m.walk = [0, 0];
      m.trail = [[0, 0]];
      m.moved = 0;
      snd("back");
      paint();
      say("Back at the origin: nothing made, nothing earned.");
    };
    Object.assign(c, { check, noCapBest, setMode, tapCorner });
  }
  Object.assign(partScope, { cornerPlay });
})();
