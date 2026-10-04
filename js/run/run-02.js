(function () {
  const runner = (NIC.shared.engineRun = NIC.shared.engineRun || {});
  const { DUR, FX, G, I, SPEEDS, graphScene, reduce, rn } = runner;
  const N = NIC;

  function run(box, life, o) {
    const who = o.who || (N.player && N.player.state && N.player.state().who) || "sprout";
    const root =
      N.el(`<div class="rn" tabindex="0" role="group" aria-label="Step-through figure. Arrow keys step, space plays.">
      <div class="rn-grid ${o.code ? "has-code" : ""}"><div class="rn-stage"></div>${o.code ? `<ol class="rn-code">${o.code.map((l, n) => `<li data-n="${n + 1}"><code>${N.esc(l)}</code></li>`).join("")}</ol>` : ""}</div>
      <div class="rn-dock"><div class="rn-cap">${N.mascot ? N.mascot({ who, size: 46, mood: "idle", cls: "rn-m" }) : ""}<div class="rn-bubble" aria-live="polite" aria-atomic="true"><span class="rn-n"></span><span class="rn-t"></span></div></div>
      <div class="rn-ask" role="group" aria-label="Predict" hidden></div><div class="rn-sr" role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="rn-bar">
        <button class="rn-b" data-a="back" aria-label="Step back">${I.back}</button>
        <button class="rn-b rn-play" data-a="play" aria-label="Play">${I.play}</button>
        <button class="rn-b" data-a="next" aria-label="Step forward">${I.next}</button>
        <input class="rn-scrub" type="range" min="0" max="1" value="0" aria-label="Scrub through the steps">
        <button class="rn-b rn-speed" data-a="speed" aria-label="Speed 1×">1×</button>
        <button class="rn-b" data-a="again" aria-label="Restart">${I.again}</button>
      </div></div></div>`);
    box.appendChild(root);
    const $ = (s) => root.querySelector(s);
    const stage = $(".rn-stage"),
      cap = $(".rn-t"),
      num = $(".rn-n"),
      scrub = $(".rn-scrub"),
      askBox = $(".rn-ask"),
      said = $(".rn-sr"), // a screen reader hears the question and its result here (the box itself is hidden between asks)
      playBtn = $(".rn-play");
    let frames = [],
      i = 0,
      playing = false,
      timer = 0,
      speed = o.speed || 1,
      tl = null,
      asking = null;
    const answered = new Set();

    const api = {
      root,
      stage,
      recompute(msg = "Recomputed. Replaying from the start.") {
        stop();
        compute();
        goto(0, true);
        if (N.fx && msg) N.fx.toast(msg, { tone: "blue", ms: 1500 });
      },
      drag: (el, h) => dragger(el, h),
      edit: (el, h) => editor(el, h),
      get i() {
        return i;
      },
      get frames() {
        return frames;
      },
    };
    const scene = o.build(stage, api);
    function compute() {
      frames = [...o.frames(scene)];
      answered.clear();
      scrub.max = Math.max(0, frames.length - 1);
    }

    function paint(k, instant) {
      if (tl) tl.progress(1).kill();
      const g = G();
      tl = g ? g.timeline() : null;
      const f = frames[k],
        c = { tl, instant: instant || reduce() || !g, prev: frames[k - 1] || null, i: k };
      try {
        o.draw(scene, f, c);
      } catch (e) {
        console.error(e);
      }
      num.textContent = `${k + 1}/${frames.length}`;
      if (cap.innerHTML !== (f.cap || "")) {
        cap.innerHTML = f.cap || "";
        const x = FX();
        if (!c.instant && x)
          x.clean(
            cap,
            x.animate(
              cap,
              { opacity: [0, 1], transform: ["translateY(4px)", "translateY(0px)"] },
              { duration: DUR.m, ease: x.EASE },
            ),
          );
      }
      root.querySelectorAll(".rn-code li").forEach((li, n) => li.classList.toggle("on", n === f.line));
      scrub.value = k;
      scrub.setAttribute("aria-valuetext", `Step ${k + 1} of ${frames.length}`);
      scrub.style.setProperty("--p", frames.length > 1 ? k / (frames.length - 1) : 1);
      $('[data-a="back"]').disabled = k === 0;
      $('[data-a="next"]').disabled = k === frames.length - 1;
      if (f.mood && root.querySelector(".rn-m") && N.mascotReact) N.mascotReact(root.querySelector(".rn-m"), f.mood);
    }
    function goto(k, instant) {
      i = Math.max(0, Math.min(frames.length - 1, k));
      paint(i, instant);
    }

    /** Step forward; a frame with an unanswered `ask` pauses for the learner's guess first. */
    function forward() {
      if (asking) return false;
      if (i >= frames.length - 1) {
        stop();
        return false;
      }
      const f = frames[i + 1];
      if (f.ask && !answered.has(i + 1)) {
        ask(i + 1);
        return false;
      }
      goto(i + 1);
      N.sfx && N.sfx.play("tick");
      if (i === frames.length - 1) {
        stop();
        N.sfx && N.sfx.play("check");
      }
      return true;
    }
    function tick() {
      if (!playing) return;
      if (forward()) timer = life.timeout(tick, 1300 / speed);
    }
    function play() {
      if (i >= frames.length - 1) goto(0, true);
      playing = true;
      playBtn.innerHTML = I.pause;
      playBtn.setAttribute("aria-label", "Pause");
      tick();
    }
    function stop() {
      playing = false;
      clearTimeout(timer);
      playBtn.innerHTML = I.play;
      playBtn.setAttribute("aria-label", "Play");
    }

    const plainText = (h) =>
      String(h ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\$+/g, "") // maths marks
        .replace(/\s+/g, " ")
        .trim();
    /** Say something to a screen reader: clear the live region, then fill it a moment later so repeats are heard too. */
    function say(html) {
      said.textContent = "";
      life.timeout(() => (said.textContent = plainText(html)), 40);
    }
    /** The words a target shows, one text piece at a time ("B" and "4" read as "B 4", not "B4"). */
    function shown(e) {
      const out = [],
        w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim()) out.push(n.nodeValue.trim());
      return out.join(" ");
    }
    /** A pick target's name: what it shows (with its key in front when the text doesn't already carry it). */
    function pickName(p) {
      const t = plainText(p.getAttribute("aria-label") || shown(p)),
        key = p.dataset.k;
      return t && (!key || t.includes(key)) ? t : key ? (t ? `${key}: ${t}` : key) : t || "option";
    }
    const PICK_ATTRS = ["tabindex", "role", "aria-label"];

    function ask(k) {
      const A = frames[k].ask,
        wasPlaying = playing;
      clearTimeout(timer);
      asking = { k, A, wasPlaying };
      const picks = [...stage.querySelectorAll(A.pick)];
      // each target is reachable and named for the keyboard and a screen reader (Enter or Space picks it)
      asking.was = picks.map((p) => [p, PICK_ATTRS.map((a) => p.getAttribute(a))]);
      picks.forEach((p) => {
        p.classList.add("rn-pickable");
        p.setAttribute("tabindex", "0");
        p.setAttribute("role", "button");
        p.setAttribute("aria-label", pickName(p));
      });
      askBox.hidden = false;
      askBox.classList.remove("m-ghost");
      askBox.innerHTML = `<div class="rn-q"><span class="rn-qtag">Predict</span>${A.q}</div><button class="rn-skip">Show me</button>`;
      say(`Predict. ${A.q} Choose a highlighted part with Tab, then Enter, or press Show me.`);
      // when the keyboard asked for this step, it carries on there: the first target takes focus
      const at = document.activeElement;
      if (picks[0] && at && root.contains(at) && at.matches(":focus-visible")) picks[0].focus({ preventScroll: true });
      N.sfx && N.sfx.play("pop");
      const x = FX();
      if (x)
        x.clean(
          askBox,
          reduce()
            ? x.animate(askBox, { opacity: [0, 1] }, { duration: DUR.s })
            : x.animate(
                askBox,
                { opacity: [0, 1], transform: ["translateY(6px) scale(0.97)", "translateY(0px) scale(1)"] },
                x.SPRING_UI,
              ),
        );
      const m = root.querySelector(".rn-m");
      if (m && N.mascotReact) N.mascotReact(m, "determined");
      askBox.querySelector(".rn-skip").onclick = () => resolve(null);
      asking.onPick = (e) => {
        const p = e.target.closest(A.pick);
        if (p && stage.contains(p)) resolve(p.dataset.k);
      };
      stage.addEventListener("click", asking.onPick);
    }
    function resolve(v) {
      if (!asking) return;
      const { k, A, wasPlaying } = asking,
        right = [].concat(A.a).map(String);
      stage.removeEventListener("click", asking.onPick);
      const hadFocus = stage.contains(document.activeElement) || askBox.contains(document.activeElement); // a target or Show me
      asking.was.forEach(([p, old]) => {
        p.classList.remove("rn-pickable");
        PICK_ATTRS.forEach((a, n) => (old[n] === null ? p.removeAttribute(a) : p.setAttribute(a, old[n])));
      });
      const ok = v !== null && right.includes(String(v)),
        skipped = v === null;
      answered.add(k);
      asking = null;
      const m = root.querySelector(".rn-m");
      if (!skipped) {
        N.sfx && N.sfx.play(ok ? "correct" : "wrong");
        if (m && N.mascotReact) N.mascotReact(m, ok ? "happy" : "surprised");
        if (ok && N.game) {
          N.game.award(1, "predict");
          N.game.track("predict");
        }
      }
      askBox.innerHTML = `<div class="rn-res ${skipped ? "" : ok ? "ok" : "no"}"><b>${skipped ? "Here's what happens." : ok ? "Spot on!" : `Not quite: it's ${right.join(" or ")}.`}</b> ${A.why || ""}</div>`;
      say(askBox.innerHTML);
      if (FX()) FX().reveal(askBox.firstElementChild);
      goto(k);
      if (hadFocus) {
        // the control that had focus (a target, or Show me) is going away: carry on from Next (or the figure at the last step)
        const nx = $('[data-a="next"]');
        (nx && !nx.disabled ? nx : root).focus({ preventScroll: true });
      }
      life.timeout(
        () => {
          if (!asking) hideAsk();
          if (wasPlaying && playing) timer = life.timeout(tick, 1300 / speed);
        },
        ok || skipped ? 2200 : 3400,
      );
    }
    /** Fade the ask/result box out, then hide it (unless a new ask took it over meanwhile). */
    function hideAsk() {
      if (askBox.hidden) return;
      const x = FX();
      if (!x) {
        askBox.hidden = true;
        return;
      }
      askBox.classList.add("m-ghost");
      x.exit(askBox, { y: 4, scale: 0.98 }).then(() => {
        askBox.classList.remove("m-ghost");
        if (asking) return;
        askBox.hidden = true;
        const clear = () => {
          if (asking) return;
          askBox.style.opacity = "";
          askBox.style.transform = "";
        };
        clear();
        requestAnimationFrame(() => setTimeout(clear, 0)); // Motion can write its last frame a frame late
      });
    }

    // ---------- direct manipulation ----------
    function svgPoint(svg, e) {
      const p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    function dragger(el, h) {
      el.classList.add("rn-drag");
      el.addEventListener("pointerdown", (e) => {
        if (asking) return;
        e.preventDefault();
        stop();
        el.setPointerCapture(e.pointerId);
        el.classList.add("rn-dragging");
        const svg = el.ownerSVGElement,
          vb = svg.viewBox.baseVal;
        const mv = (ev) => {
          const p = svgPoint(svg, ev);
          h.move(Math.max(4, Math.min(vb.width - 4, p.x)), Math.max(4, Math.min(vb.height - 4, p.y)));
        };
        const up = () => {
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
          el.classList.remove("rn-dragging");
          h.end && h.end();
        };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
    }
    let pop = null;
    const EDIT_BASE = "translate(-50%, -100%)"; // .rn-edit's CSS transform
    function editor(el, h) {
      el.classList.add("rn-editable");
      el.addEventListener("click", (e) => {
        if (asking) return;
        e.stopPropagation();
        stop();
        closeEdit();
        const r = el.getBoundingClientRect(),
          rr = root.getBoundingClientRect();
        pop = N.el(
          `<div class="rn-edit" style="left:${r.left - rr.left + r.width / 2}px;top:${r.top - rr.top - 8}px"><button data-d="-1">−</button><b>${h.get()}</b><button data-d="1">+</button></div>`,
        );
        root.appendChild(pop);
        // spring up out of the weight; the CSS transform (anchor above the weight) stays in every frame
        const x = FX();
        if (x)
          x.clean(
            pop,
            reduce()
              ? x.animate(pop, { opacity: [0, 1] }, { duration: DUR.s })
              : x.animate(
                  pop,
                  {
                    opacity: [0, 1],
                    transform: [`${EDIT_BASE} translateY(6px) scale(0.8)`, `${EDIT_BASE} translateY(0px) scale(1)`],
                  },
                  x.SPRING_POP,
                ),
          );
        const val = pop.querySelector("b");
        pop.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const b = ev.target.closest("button");
          if (!b) return;
          const v = Math.max(h.min ?? -Infinity, Math.min(h.max ?? Infinity, h.get() + +b.dataset.d * (h.step || 1)));
          h.set(v);
          val.textContent = v;
          N.sfx && N.sfx.play("select");
          clearTimeout(pop._t);
          pop._t = setTimeout(() => api.recompute(), 450);
        });
      });
    }
    /** Close the weight editor with a short exit; a new one can open straight away. */
    function closeEdit() {
      if (!pop) return;
      const p = pop;
      pop = null;
      const x = FX();
      if (!x) {
        p.remove();
        return;
      }
      p.classList.add("m-ghost");
      x.exit(p, { y: 4, scale: 0.9, base: EDIT_BASE }).then(() => p.remove());
    }
    const closePop = (e) => {
      if (pop && !pop.contains(e.target)) closeEdit();
    };
    document.addEventListener("pointerdown", closePop);
    life.onCleanup(() => {
      document.removeEventListener("pointerdown", closePop);
      stop();
      if (tl) tl.kill();
    });

    // ---------- controls ----------
    root.querySelector(".rn-bar").addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]");
      if (!b) return;
      const a = b.dataset.a;
      if (a === "play") {
        playing ? stop() : play();
        N.sfx && N.sfx.play("tap");
      } else if (a === "next") {
        stop();
        forward();
      } else if (a === "back") {
        stop();
        if (asking) return;
        goto(i - 1);
        N.sfx && N.sfx.play("back");
      } else if (a === "again") {
        stop();
        goto(0, true);
        N.sfx && N.sfx.play("back");
      } else if (a === "speed") {
        speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
        b.textContent = speed + "×";
        b.setAttribute("aria-label", `Speed ${speed}×`);
        N.sfx && N.sfx.play("select");
      }
    });
    scrub.addEventListener("input", () => {
      stop();
      if (!asking) goto(+scrub.value, true);
    });
    root.addEventListener("keydown", (e) => {
      if (e.target.closest("input")) return;
      const k = e.key,
        pk = asking && e.target.closest && e.target.closest(".rn-pickable");
      if (pk && stage.contains(pk) && (k === "Enter" || k === " ")) {
        resolve(pk.dataset.k);
      } else if (k === "ArrowRight") {
        stop();
        forward();
      } else if (k === "ArrowLeft") {
        stop();
        if (!asking) goto(i - 1);
      } else if (k === " " && e.target === root) {
        // Space plays only from the figure itself: on a button inside it, Space presses that button
        playing ? stop() : play();
      } else return;
      e.preventDefault();
      e.stopPropagation();
    });

    root.__rn = {
      n: () => frames.length,
      i: () => i,
      /** For tools/smoke.js: play to the end, answering each ask correctly. */
      async runAll() {
        const errs = [];
        for (let g = 0; g < 400 && i < frames.length - 1; g++) {
          if (!forward() && asking) {
            const a = String([].concat(asking.A.a)[0]),
              t = [...stage.querySelectorAll(asking.A.pick)].find((p) => p.dataset.k === a);
            if (!t) {
              errs.push(`ask at frame ${asking.k}: no element for answer ${a}`);
              resolve(null);
            } else t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
          if (/NaN|undefined/.test(cap.textContent)) errs.push(`frame ${i}: "${cap.textContent}"`);
        }
        askBox.hidden = true;
        if (frames.length < 2) errs.push("runner has fewer than 2 frames");
        return errs;
      },
    };
    compute();
    goto(0, true);
    if (o.autoplay && !reduce()) life.timeout(play, 900);
    return api;
  }

  N.fig.run = run;
  N.fig.rn = rn;
  N.fig.graphScene = graphScene;
})();
