(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});
  const { PY, autocomplete, editorKeys, esc, fx, highlight, pyBoot, runOne, same, show } = lab;
  const N = NIC,
    { el, qs, qsa } = N;

  /** A draggable divider between the left column and the editor (like LeetCode). Drag, use the arrow keys, or double-click to reset.
      The width is remembered in localStorage (csl.split). Only shown where the two columns sit side by side. */
  function splitter(wk) {
    const KEY = "csl.split",
      DEF = 46,
      MIN = 25,
      MAX = 70;
    let pct = DEF;
    try {
      const v = parseFloat(localStorage.getItem(KEY));
      if (v >= MIN && v <= MAX) pct = v;
    } catch {
      /* storage unavailable */
    }
    const h = el(
      `<div class="cl-split" role="separator" aria-orientation="vertical" aria-label="Resize panels" tabindex="0" title="Drag to resize, double-click to reset"><i></i></div>`,
    );
    wk.appendChild(h);
    const apply = (v, save) => {
      pct = Math.max(MIN, Math.min(MAX, v));
      wk.style.setProperty("--cl-l", pct + "%");
      h.setAttribute("aria-valuenow", Math.round(pct));
      if (save) {
        try {
          localStorage.setItem(KEY, String(pct));
        } catch {
          /* ignore */
        }
      }
    };
    apply(pct, false);
    let drag = null,
      raf = 0;
    const ping = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => window.dispatchEvent(new Event("nic:resize")));
    };
    h.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, w: wk.getBoundingClientRect().width, p: pct };
      document.body.classList.add("cl-dragging");
      h.classList.add("on");
    });
    h.addEventListener("pointermove", (e) => {
      if (!drag) return;
      apply(drag.p + ((e.clientX - drag.x) / drag.w) * 100, false);
      ping();
    });
    const end = () => {
      if (!drag) return;
      drag = null;
      document.body.classList.remove("cl-dragging");
      h.classList.remove("on");
      apply(pct, true);
      ping();
    };
    h.addEventListener("pointerup", end);
    h.addEventListener("pointercancel", end);
    h.addEventListener("dblclick", () => {
      apply(DEF, true);
      ping();
    });
    h.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        apply(pct + (e.key === "ArrowRight" ? 2 : -2), true);
        ping();
      } else if (e.key === "Home") {
        apply(DEF, true);
        ping();
      }
    });
  }

  let labs = 0;
  function codelab(root, life, cfg) {
    const kbdId = `cl-kbd-${++labs}`,
      tests = cfg.tests,
      results = tests.map(() => null);
    let sel = 0,
      playing = false,
      pos = 0,
      tick = 0,
      hintN = 0,
      busy = false,
      watched = false,
      usedSolution = false; // "Use it" loaded the model answer: don't say the learner wrote it (until Reset)
    const missions = [
      ...tests.map((t, i) => ({ id: "t" + i, t: "Pass: " + t.name, d: t.desc || "", hint: t.hint })),
      ...(cfg.watch
        ? [
            {
              id: "watch",
              t: "Watch your code run",
              d: "Once a test passes, press <b>Play</b> under the picture and watch it to the end.",
            },
          ]
        : []),
      ...(cfg.missions || []),
    ];

    return N.workshop(root, life, {
      who: cfg.who,
      intro: cfg.intro,
      missions,
      finish: () =>
        `<b>Code lab complete!</b> All ${missions.length} missions done. ${
          usedSolution
            ? "Step through the solution and work out why each line is there."
            : "That's working code you wrote."
        }`,
      build(stage, api) {
        const card = el(`<div class="wk-card cl cl-edcard">
          <h3>Your code<span class="wk-sp"></span><button class="btn small ghost" data-reset>Reset</button></h3>
          ${cfg.brief ? `<div class="wk-note cl-brief">${cfg.brief}</div>` : ""}
          <div class="cl-ed"><div class="cl-gut" aria-hidden="true"></div><div class="cl-wrap"><pre class="cl-hl" aria-hidden="true"></pre><textarea class="cl-ta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor" aria-describedby="${kbdId}"></textarea></div></div>
          <p class="cl-kbd faint" id="${kbdId}">Tab indents. Press <kbd>Esc</kbd> then <kbd>Tab</kbd> to leave the editor.</p>
          <div class="wk-row cl-bar"><button class="btn primary" data-run>Run tests</button><button class="btn" data-hint>Hint</button><span class="cl-hintn faint"></span><span class="cl-pystat" data-py>Python: loading…</span><span class="wk-sp" style="flex:1"></span><details class="cl-sol"><summary class="btn small ghost">Show solution</summary><pre class="cl-solpre"></pre><button class="btn small" data-use>Use it</button></details></div>
          <div class="cl-hint" data-hintbox></div>
          <div class="cl-ex" data-ex></div>
          </div>`);
        const testCard = el(
          `<div class="wk-card cl-testcard"><h3>Tests<span class="wk-sp"></span><span class="faint cl-tsum" data-tsum></span></h3><div class="cl-tests" data-tests></div></div>`,
        );
        const vis =
          el(`<div class="wk-card cl-vis"><h3>Watch it run<span class="wk-sp"></span><span class="faint cl-tname" data-tname></span></h3>
          <div class="cl-stage" data-stage></div>
          <div class="cl-cap wk-note" data-cap>Run your code, then watch each step here.</div>
          <div class="cl-ctl"><button class="btn small" data-first aria-label="First step">⏮</button><button class="btn small" data-prev aria-label="Step back">◀</button><button class="btn small primary" data-play>Play</button><button class="btn small" data-next aria-label="Step forward">▶</button><input type="range" min="0" max="0" value="0" data-scrub aria-label="Scrub through the run"><span class="mono faint" data-step>0 / 0</span></div></div>`);
        stage.append(testCard, vis, card);
        const wkNode = stage.closest(".wk");
        if (wkNode) {
          wkNode.classList.add("wk-code");
          splitter(wkNode);
        }

        const ta = qs(".cl-ta", card),
          pre = qs(".cl-hl", card),
          gut = qs(".cl-gut", card),
          wrap = qs(".cl-wrap", card),
          sandbox = qs("[data-stage]", vis);
        const paint = () => {
          pre.innerHTML = highlight(ta.value);
          const n = ta.value.split("\n").length;
          gut.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join("");
          wrap.style.height = gut.style.height = `${Math.max(300, n * 21 + 24)}px`;
        };
        const sync = () => {
          pre.scrollTop = ta.scrollTop;
          pre.scrollLeft = ta.scrollLeft;
          gut.scrollTop = ta.scrollTop;
        };
        ta.value = cfg.starter;
        qs(".cl-solpre", card).textContent = cfg.solution || "";
        ta.addEventListener("input", paint);
        ta.addEventListener("scroll", sync);
        const params = ((cfg.starter.match(/def\s+\w+\s*\(([^)]*)\)/) || [])[1] || "")
          .split(",")
          .map((x) => x.trim().split(/[=:]/)[0].trim())
          .filter(Boolean);
        const pyChip = qs("[data-py]", card),
          pyState = (ok) => {
            if (!pyChip.isConnected) return;
            pyChip.textContent = ok ? "Python ready" : "Python unavailable";
            pyChip.classList.toggle("ok", !!ok);
            pyChip.classList.toggle("bad", !ok);
          },
          pyLoading = () => {
            pyChip.textContent = "Python: loading…";
            pyChip.classList.remove("ok", "bad");
          };
        if (PY.loaded) pyState(true);
        pyBoot().then((w) => pyState(!!w));
        const ac = autocomplete(ta, wrap, [...params, cfg.entry, ...(cfg.complete || [])]);
        life.onCleanup(() => ac.destroy());
        editorKeys(ta, () => run(), ac);
        paint();
        if (!cfg.solution) qs(".cl-sol", card).hidden = true;

        // ----- the picture -----
        let handle = cfg.scene.build(sandbox, tests[sel]);
        const cap = qs("[data-cap]", vis),
          scrub = qs("[data-scrub]", vis),
          stepEl = qs("[data-step]", vis),
          playBtn = qs("[data-play]", vis);
        const frames = () => (results[sel] && results[sel].frames) || [];
        function showFrame(i, animate) {
          const fr = frames();
          pos = Math.max(0, Math.min(fr.length, i));
          scrub.max = fr.length;
          scrub.value = pos;
          stepEl.textContent = `${pos} / ${fr.length}`;
          if (!pos) {
            cfg.scene.reset
              ? cfg.scene.reset(handle, tests[sel])
              : cfg.scene.frame(handle, null, { i: 0, animate: false, frames: fr, test: tests[sel] });
            cap.innerHTML = fr.length
              ? "Press <b>Play</b> or step forward."
              : "Run your code, then watch each step here.";
            return;
          }
          const f = fr[pos - 1];
          cfg.scene.frame(handle, f, { i: pos - 1, animate: !!animate, frames: fr, test: tests[sel] });
          cap.innerHTML =
            (cfg.scene.caption ? cfg.scene.caption(f, { i: pos - 1, frames: fr, test: tests[sel] }) : f && f.cap) || "";
        }
        function stop() {
          playing = false;
          clearTimeout(tick);
          playBtn.textContent = pos >= frames().length && frames().length ? "Replay" : "Play";
        }
        function step() {
          if (!playing) return;
          if (pos >= frames().length) {
            stop();
            if (results[sel] && results[sel].pass && !watched && cfg.watch) {
              watched = true;
              api.done("watch");
            }
            return;
          }
          showFrame(pos + 1, true);
          tick = life.timeout(
            step,
            (fx() && fx().ok ? 480 : 120) * (frames()[pos - 1] && frames()[pos - 1].slow ? 1.6 : 1),
          );
        }
        playBtn.onclick = () => {
          if (!frames().length) {
            api.say(
              "Nothing to play yet. Press <b>Run tests</b> first, and make sure your code calls <code>trace</code> (the starter already does).",
              "think",
            );
            return;
          }
          if (playing) {
            stop();
            return;
          }
          if (pos >= frames().length) showFrame(0);
          playing = true;
          playBtn.textContent = "Pause";
          step();
        };
        qs("[data-next]", vis).onclick = () => {
          stop();
          showFrame(pos + 1, true);
          if (pos >= frames().length && results[sel] && results[sel].pass && !watched && cfg.watch) {
            watched = true;
            api.done("watch");
          }
        };
        qs("[data-prev]", vis).onclick = () => {
          stop();
          showFrame(pos - 1, false);
        };
        qs("[data-first]", vis).onclick = () => {
          stop();
          showFrame(0);
        };
        scrub.oninput = () => {
          stop();
          showFrame(+scrub.value, false);
        };

        // ----- tests -----
        const testsEl = qs("[data-tests]", testCard);
        // ----- example input and output (the selected test; after a run, what your code returned too) -----
        const exEl = qs("[data-ex]", card);
        function drawExample() {
          const t = tests[sel],
            r = results[sel];
          const code = (v) => `<code>${esc(show(v, 700))}</code>`;
          const inputs = t.args
            .map((a, i) => `<div class="cl-exrow"><span>${esc(params[i] || "arg" + (i + 1))}</span>${code(a)}</div>`)
            .join("");
          exEl.innerHTML = `<div class="cl-exh"><b>Example</b><span class="cl-extabs">${tests.map((x, i) => `<button class="cl-extab ${i === sel ? "on" : ""}" data-x="${i}" title="${esc(x.name)}">${i + 1}</button>`).join("")}</span><span class="faint">${esc(t.name)}</span></div>
            <div class="cl-exbody"><div class="cl-excol"><small>Input</small>${inputs}</div><div class="cl-excol"><small>Expected output</small><div class="cl-exrow out">${code(t.expect)}</div>${r ? `<small>Your code returned</small><div class="cl-exrow ${r.pass ? "okk" : "bad"}">${r.error ? `<code>${esc(r.error)}</code>` : code(r.out)}</div>` : ""}</div></div>`;
          qsa("[data-x]", exEl).forEach((b) => (b.onclick = () => select(+b.dataset.x)));
        }
        function drawTests() {
          testsEl.innerHTML = tests
            .map((t, i) => {
              const r = results[i],
                st = !r ? "idle" : r.pass ? "ok" : "no";
              return `<button class="cl-test ${st} ${i === sel ? "sel" : ""}" data-i="${i}"><span class="cl-dot">${st === "ok" ? "✓" : st === "no" ? "✗" : i + 1}</span><span class="cl-tt"><b>${t.name}</b>${!r ? `<span>${t.desc || ""}</span>` : r.pass ? `<span>got <code>${esc(show(r.out))}</code></span>` : r.error ? `<span class="bad">${esc(r.error)}</span>` : `<span class="bad">got <code>${esc(show(r.out))}</code>, wanted <code>${esc(show(t.expect))}</code></span>`}</span></button>`;
            })
            .join("");
          qsa("[data-i]", testsEl).forEach((b) => (b.onclick = () => select(+b.dataset.i)));
          const ok = results.filter((r) => r && r.pass).length;
          qs("[data-tsum]", testCard).textContent = results.some(Boolean) ? `${ok} of ${tests.length} pass` : "";
        }
        function select(i) {
          stop();
          sel = i;
          qs("[data-tname]", vis).textContent = tests[i].name;
          sandbox.innerHTML = "";
          handle = cfg.scene.build(sandbox, tests[i]);
          drawTests();
          drawExample();
          showFrame(0);
        }
        async function run() {
          if (N.sfx) N.sfx.play("run");
          if (busy) return;
          busy = true;
          stop();
          const btn = qs("[data-run]", card);
          btn.disabled = true;
          btn.textContent = PY.loaded ? "Running…" : "Loading Python…";
          if (!PY.loaded) pyLoading();
          const code = ta.value;
          let pass = 0,
            noPy = null;
          for (let i = 0; i < tests.length; i++) {
            const t = tests[i],
              r = await runOne(code, cfg.entry, t.args);
            btn.textContent = "Running…";
            if (!card.isConnected) return;
            pyState(!r.noPy);
            r.pass = r.ok && (t.cmp ? t.cmp(r.out, t.expect) : same(r.out, t.expect));
            if (r.pass) pass++;
            results[i] = r;
            if (r.pass) api.done("t" + i);
            if (r.noPy) {
              // Python itself is missing: asking again for every test would only repeat the same failure
              noPy = r;
              for (let j = i + 1; j < tests.length; j++) results[j] = null;
              break;
            }
          }
          busy = false;
          btn.disabled = false;
          btn.textContent = "Run tests";
          const firstBad = results.findIndex((r) => !r.pass);
          sel = firstBad >= 0 ? firstBad : sel;
          select(sel);
          if (frames().length) {
            playing = true;
            playBtn.textContent = "Pause";
            showFrame(0);
            step();
          }
          if (noPy) api.say(`<b>${esc(noPy.error)}</b>`, "sad");
          else if (pass === tests.length)
            api.say(
              `<b>All ${tests.length} tests pass!</b> That's a working ${cfg.noun || "algorithm"}${
                usedSolution ? ". Step through it and work out why each line is there." : " you wrote yourself."
              }`,
              "love",
            );
          else if (results.some((r) => r && r.slow))
            api.say("One run never finished. Check that every loop gets closer to stopping.", "think");
          else if (results[firstBad].error)
            api.say(`Your code hit an error: <b>${esc(results[firstBad].error)}</b>`, "sad");
          else
            api.say(
              `${pass} of ${tests.length} pass. Look at the failing test: what did your code return, and what was wanted?`,
              pass ? "think" : "sad",
            );
          if (fx() && fx().ok && pass === tests.length) fx().celebrate(btn, { silent: true });
          if (N.sfx) N.sfx.play(pass === tests.length ? "correct" : "wrong");
        }
        qs("[data-run]", card).onclick = run;
        qs("[data-reset]", card).onclick = () => {
          ta.value = cfg.starter;
          usedSolution = false;
          paint();
          api.say("Code reset to the starter.", "idle");
        };
        qs("[data-use]", card).onclick = () => {
          ta.value = cfg.solution;
          usedSolution = true;
          paint();
          qs(".cl-sol", card).open = false;
          api.say(
            "Solution loaded. Press <b>Run tests</b>, then step through it and work out why each line is there.",
            "happy",
          );
        };
        qs("[data-hint]", card).onclick = () => {
          const hs = cfg.hints || [];
          if (!hs.length) return;
          const box = qs("[data-hintbox]", card);
          box.innerHTML = `<b>Hint ${(hintN % hs.length) + 1} of ${hs.length}:</b> ${hs[hintN % hs.length]}`;
          hintN++;
          fx() && fx().ok && fx().enter(box, { y: 6, dur: 0.2 });
        };
        if (!(cfg.hints || []).length) qs("[data-hint]", card).hidden = true;
        select(0);
      },
    });
  }

  N.codelab = codelab;
  N.codelab.show = show;
})();
