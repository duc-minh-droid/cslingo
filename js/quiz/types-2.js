(function () {
  const quiz = (NIC.shared.engineQuiz = NIC.shared.engineQuiz || {});
  const { correct, fmtNum, optOrder, same, seeded } = quiz;
  const N = NIC;
  const { qs, qsa, esc } = N;

  const TYPES = {
    mcq: {
      label: "Choose one",
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts" role="radiogroup">${optOrder(Q)
          .map(
            (k, pos) =>
              `<button class="opt" role="radio" aria-checked="false" data-k="${k}"><span class="opt-l">${String.fromCharCode(65 + pos)}</span><span>${Q.o[k]}</span></button>`,
          )
          .join("")}</div>`;
        qsa(".opt", box).forEach((b) => (b.onclick = () => submit(+b.dataset.k)));
      },
      grade: (Q, v) => v === Q.a,
      reveal(Q, box, v, ok) {
        const at = (k) => qs(`.opt[data-k="${k}"]`, box);
        qsa(".opt", box).forEach((b) => {
          const k = +b.dataset.k;
          b.disabled = true;
          if (k === Q.a) b.classList.add("right");
          else if (k === v) b.classList.add("wrong");
        });
        return ok ? at(Q.a) : at(v);
      },
      answer: (Q) => Q.o[Q.a],
    },
    multi: {
      label: "Select all that apply",
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts">${optOrder(Q)
          .map(
            (k) =>
              `<button class="opt multi" data-k="${k}" aria-pressed="false"><span class="opt-l opt-box"></span><span>${Q.o[k]}</span></button>`,
          )
          .join("")}</div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const chk = qs("[data-check]", box);
        qsa(".opt", box).forEach(
          (b) =>
            (b.onclick = () => {
              b.classList.toggle("sel");
              b.setAttribute("aria-pressed", b.classList.contains("sel"));
              chk.disabled = !qs(".opt.sel", box);
            }),
        );
        chk.onclick = () =>
          submit(
            qsa(".opt", box)
              .filter((b) => b.classList.contains("sel"))
              .map((b) => +b.dataset.k)
              .sort((x, y) => x - y),
          );
      },
      grade: (Q, v) => same([...v].sort(), [...Q.a].sort()),
      reveal(Q, box, v) {
        qsa(".opt", box).forEach((b) => {
          const k = +b.dataset.k;
          b.disabled = true;
          const should = Q.a.includes(k),
            did = v.includes(k);
          b.classList.toggle("sel", did);
          if (should && did) b.classList.add("right");
          else if (did) b.classList.add("wrong");
          else if (should) b.classList.add("missed");
        });
        const c = qs("[data-check]", box);
        if (c) c.remove();
      },
      answer: (Q) => Q.a.map((k) => Q.o[k]).join(" · "),
    },
    // No typed answers, ever: a legacy num question is shown as tap-to-pick options far enough apart to choose by estimating.
    // Write new questions as mcq with hand-picked distractors instead (AGENTS.md).
    num: {
      label: "Choose one",
      opts(Q) {
        const a = +Q.ans,
          int = Number.isInteger(a),
          r = (v) => (int ? Math.round(v) : +v.toPrecision(3));
        const c = a === 0 ? [0, 1, 2, 10] : [a / 2, a, a * 2, a * 10].map(r);
        return [...new Set(c.map((v) => (v === r(a) ? a : v)))].sort((x, y) => x - y);
      },
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts" role="radiogroup">${TYPES.num
          .opts(Q)
          .map(
            (v, pos) =>
              `<button class="opt" role="radio" aria-checked="false" data-v="${v}"><span class="opt-l">${String.fromCharCode(65 + pos)}</span><span>${fmtNum(v)}${Q.unit ? " " + Q.unit : ""}</span></button>`,
          )
          .join("")}</div>`;
        qsa(".opt", box).forEach((b) => (b.onclick = () => submit(+b.dataset.v)));
      },
      grade: (Q, v) => Math.abs(v - Q.ans) <= (Q.tol ?? 1e-9),
      reveal(Q, box, v, ok) {
        let hit = null;
        qsa(".opt", box).forEach((b) => {
          const x = +b.dataset.v;
          b.disabled = true;
          if (Math.abs(x - Q.ans) <= (Q.tol ?? 1e-9)) b.classList.add("right");
          else if (x === v) {
            b.classList.add("wrong");
            hit = b;
          }
        });
        return ok ? qs(".opt.right", box) : hit;
      },
      answer: (Q) => fmtNum(Q.ans) + (Q.unit ? " " + Q.unit : ""),
    },
    slider: {
      label: "Estimate — drag the slider",
      render(Q, box, submit) {
        const mid = Q.start ?? (Q.min + Q.max) / 2;
        box.innerHTML = `<div class="q-slider"><input type="range" min="${Q.min}" max="${Q.max}" step="${Q.step}" value="${mid}" aria-label="estimate"><output>${fmtNum(mid)}${Q.unit ? " " + Q.unit : ""}</output></div><div class="q-live"></div><div class="q-actions"><button class="btn primary" data-check>Lock it in</button></div>`;
        const r = qs("input", box),
          out = qs("output", box),
          live = qs(".q-live", box);
        const upd = () => {
          out.textContent = fmtNum(+r.value) + (Q.unit ? " " + Q.unit : "");
          if (Q.live) live.innerHTML = Q.live(+r.value);
        };
        r.oninput = upd;
        upd();
        qs("[data-check]", box).onclick = () => submit(+r.value);
      },
      grade: (Q, v) => Math.abs(v - Q.ans) <= Q.tol,
      reveal(Q, box, v, ok) {
        const r = qs("input", box);
        r.value = v;
        r.disabled = true;
        r.dispatchEvent(new Event("input"));
        r.oninput = null;
        qs(".q-slider", box).classList.add(ok ? "right" : "wrong");
        const c = qs("[data-check]", box);
        if (c) c.remove();
        if (Q.live) qs(".q-live", box).innerHTML = Q.live(Q.ans);
        correct(
          box,
          `${ok ? "Within range." : "Not quite."} Target: <b>${fmtNum(Q.ans)}${Q.unit ? " " + Q.unit : ""}</b> <span class="faint">(±${fmtNum(Q.tol)})</span>`,
        );
        return qs(".q-slider", box);
      },
      answer: (Q) => `≈ ${fmtNum(Q.ans)}${Q.unit ? " " + Q.unit : ""}`,
    },
    order: {
      label: "Put these in order",
      render(Q, box, submit, idKey) {
        const pool = seeded(Q.items, idKey);
        box.innerHTML = `<div class="q-order"><div class="qo-slots">${Q.items.map((_, k) => `<div class="qo-slot"><span class="qo-n">${k + 1}</span><span class="qo-v faint">tap an item below</span></div>`).join("")}</div>
          <div class="qo-pool">${pool.map(([t, i]) => `<button class="chip-btn" data-i="${i}">${t}</button>`).join("")}</div></div><div class="q-actions"><button class="btn ghost small" data-undo>Undo</button><button class="btn primary" data-check disabled>Check</button></div>`;
        const placed = [];
        const draw = () => {
          qsa(".qo-slot", box).forEach((s, k) => {
            const v = qs(".qo-v", s);
            if (placed[k] !== undefined) {
              v.innerHTML = Q.items[placed[k]];
              v.classList.remove("faint");
              s.classList.add("filled");
            } else {
              v.textContent = k === placed.length ? "tap an item below" : "";
              v.classList.add("faint");
              s.classList.remove("filled");
            }
          });
          qsa(".qo-pool .chip-btn", box).forEach((b) => (b.disabled = placed.includes(+b.dataset.i)));
          qs("[data-check]", box).disabled = placed.length !== Q.items.length;
        };
        qsa(".qo-pool .chip-btn", box).forEach(
          (b) =>
            (b.onclick = () => {
              placed.push(+b.dataset.i);
              draw();
              if (N.fx) N.fx.pop(qsa(".qo-slot", box)[placed.length - 1]);
            }),
        );
        qs("[data-undo]", box).onclick = () => {
          placed.pop();
          draw();
        };
        qs("[data-check]", box).onclick = () => submit(placed.slice());
        draw();
      },
      grade: (Q, v) => v.every((x, k) => x === k),
      reveal(Q, box, v) {
        qsa(".qo-slot", box).forEach((s, k) => {
          qs(".qo-v", s).innerHTML = Q.items[v[k]] + (v[k] === k ? "" : ` <span class="qo-fix">→ ${Q.items[k]}</span>`);
          qs(".qo-v", s).classList.remove("faint");
          s.classList.add(v[k] === k ? "right" : "wrong");
        });
        // the emptied pool fades away, then leaves the layout
        const pool = qs(".qo-pool", box);
        pool.classList.add("m-ghost");
        if (N.fx && N.fx.exit) N.fx.exit(pool, { scale: 0.98, dur: N.fx.DUR.s }).then(() => pool.remove());
        else pool.remove();
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => Q.items.map((t, k) => `${k + 1}. ${t}`).join("  "),
    },
    match: {
      label: "Tap the matching pairs",
      /* Duolingo style: tap one tile on each side. A right pair flashes green and fades out; a wrong pair flashes red.
         Answer value: {pairs:[right index per left], miss: wrong tries}. Right = no wrong tries (an array of indices also grades). */
      render(Q, box, submit, idKey) {
        const rights = seeded(
          Q.pairs.map((p) => p[1]),
          idKey + "m",
        );
        box.innerHTML = `<div class="q-match"><div class="qm-col">${Q.pairs.map(([l], k) => `<button class="qm-t qm-l" data-k="${k}">${l}</button>`).join("")}</div>
          <div class="qm-col">${rights.map(([r, i]) => `<button class="qm-t qm-r" data-i="${i}">${r}</button>`).join("")}</div></div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const chk = qs("[data-check]", box);
        let pick = { l: null, r: null },
          miss = 0,
          done = 0;
        const tryPair = () => {
          if (!pick.l || !pick.r) return;
          const L = pick.l,
            R = pick.r;
          pick = { l: null, r: null };
          if (+L.dataset.k === +R.dataset.i) {
            [L, R].forEach((b) => {
              b.classList.remove("sel");
              b.classList.add("good");
              b.disabled = true;
              if (N.fx && N.fx.bounce) N.fx.bounce(b);
            });
            N.sfx && N.sfx.play("select");
            setTimeout(
              () =>
                [L, R].forEach((b) => {
                  b.classList.remove("good");
                  b.classList.add("gone");
                }),
              450,
            );
            if (++done === Q.pairs.length) {
              chk.disabled = false;
              N.sfx && N.sfx.play("check");
            }
          } else {
            miss++;
            [L, R].forEach((b) => {
              b.classList.remove("sel");
              b.classList.add("bad");
              if (N.fx) N.fx.shake(b);
            });
            N.sfx && N.sfx.play("retry");
            setTimeout(() => [L, R].forEach((b) => b.classList.remove("bad")), 320); // ends with the shake
          }
        };
        qsa(".qm-t", box).forEach(
          (b) =>
            (b.onclick = () => {
              if (b.disabled) return;
              const side = b.classList.contains("qm-l") ? "l" : "r";
              if (pick[side] === b) {
                pick[side] = null;
                b.classList.remove("sel");
                return;
              }
              if (pick[side]) pick[side].classList.remove("sel");
              pick[side] = b;
              b.classList.add("sel");
              b.setAttribute("aria-pressed", "true");
              if (!(pick.l && pick.r)) N.sfx && N.sfx.play("tap");
              tryPair();
            }),
        );
        chk.onclick = () => submit({ pairs: Q.pairs.map((_, k) => k), miss });
      },
      grade: (Q, v) => (Array.isArray(v) ? v.every((x, k) => x === k) : v && v.miss === 0),
      reveal(Q, box, v, ok) {
        qsa(".qm-t", box).forEach((b) => {
          b.disabled = true;
          b.classList.remove("gone");
          b.classList.add(ok ? "right" : "shown");
        });
        if (!ok && v && v.miss)
          correct(box, `${v.miss} wrong pairing${v.miss === 1 ? "" : "s"} on the way. The pairs are:`);
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) =>
        Q.pairs
          .map(([l, r]) => `${String(l).replace(/<[^>]+>/g, "")} → ${String(r).replace(/<[^>]+>/g, "")}`)
          .join(" · "),
    },
    cat: {
      label: "Sort into the right bucket",
      render(Q, box, submit) {
        box.innerHTML = `<div class="q-cat">${Q.items.map(([t], k) => `<div class="qc-row" data-k="${k}"><span class="qc-t">${t}</span><span class="seg qc-seg">${Q.buckets.map((b, j) => `<button data-j="${j}">${b}</button>`).join("")}</span></div>`).join("")}</div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const val = Q.items.map(() => -1),
          chk = qs("[data-check]", box);
        qsa(".qc-row", box).forEach((r) =>
          qsa("button", r).forEach(
            (b) =>
              (b.onclick = () => {
                val[+r.dataset.k] = +b.dataset.j;
                qsa("button", r).forEach((x) => x.classList.toggle("on", x === b));
                chk.disabled = val.includes(-1);
              }),
          ),
        );
        chk.onclick = () => submit(val.slice());
      },
      grade: (Q, v) => v.every((x, k) => x === Q.items[k][1]),
      reveal(Q, box, v) {
        qsa(".qc-row", box).forEach((r, k) => {
          qsa("button", r).forEach((b, j) => {
            b.disabled = true;
            b.classList.toggle("on", j === v[k]);
            if (j === Q.items[k][1]) b.classList.add("right");
            else if (j === v[k]) b.classList.add("wrong");
          });
          r.classList.add(v[k] === Q.items[k][1] ? "right" : "wrong");
        });
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) =>
        Q.buckets
          .map(
            (b, j) =>
              `${b}: ${Q.items
                .filter((i) => i[1] === j)
                .map((i) => String(i[0]).replace(/<[^>]+>/g, ""))
                .join(", ")}`,
          )
          .join(" · "),
    },
    pick: {
      label: "Click on the diagram",
      /* A rounded highlight around the element's whole box (SVG), instead of stroking every shape inside it. */
      ring(e, state) {
        const old = e.querySelector(":scope > .pk-ring");
        if (old) old.remove();
        if (!state || !e.getBBox || !(e instanceof SVGGElement)) return;
        const bb = e.getBBox();
        if (!bb.width || !bb.height) return;
        const pad = 5,
          w = bb.width + pad * 2,
          h = bb.height + pad * 2;
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("class", `pk-ring ${state}`);
        r.setAttribute("x", bb.x - pad);
        r.setAttribute("y", bb.y - pad);
        r.setAttribute("width", w);
        r.setAttribute("height", h);
        r.setAttribute("rx", Math.min(12, Math.min(w, h) / 2));
        e.appendChild(r);
      },
      render(Q, box, submit) {
        const multi = Array.isArray(Q.a);
        box.innerHTML = `<div class="q-pick">${typeof Q.fig === "function" ? "" : Q.fig}</div>${multi ? `<div class="q-actions"><span class="faint" data-count></span><button class="btn primary" data-check disabled>Check</button></div>` : ""}`;
        if (typeof Q.fig === "function") Q.fig(qs(".q-pick", box));
        const els = qsa("[data-pick]", box),
          sel = new Set();
        els.forEach((e) => {
          e.classList.add("pickable");
          e.setAttribute("tabindex", "0");
          e.setAttribute("role", "button");
          const act = () => {
            if (!multi) return submit(e.dataset.pick);
            sel.has(e.dataset.pick) ? sel.delete(e.dataset.pick) : sel.add(e.dataset.pick);
            els.forEach((x) => {
              x.classList.toggle("sel", sel.has(x.dataset.pick));
              TYPES.pick.ring(x, sel.has(x.dataset.pick) ? "sel" : "");
            });
            qs("[data-check]", box).disabled = !sel.size;
            qs("[data-count]", box).textContent = `${sel.size} selected`;
          };
          e.addEventListener("click", act);
          e.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              act();
            }
          });
        });
        if (multi) qs("[data-check]", box).onclick = () => submit([...sel].sort());
      },
      grade: (Q, v) => (Array.isArray(Q.a) ? same([...v].sort(), [...Q.a].sort()) : v === Q.a),
      reveal(Q, box, v) {
        const want = [].concat(Q.a),
          got = [].concat(v);
        qsa("[data-pick]", box).forEach((e) => {
          const p = e.dataset.pick;
          e.classList.remove("pickable", "sel");
          e.removeAttribute("tabindex");
          e.style.pointerEvents = "none";
          const state = want.includes(p)
            ? got.includes(p)
              ? "pk-right"
              : "pk-missed"
            : got.includes(p)
              ? "pk-wrong"
              : "";
          if (state) e.classList.add(state);
          TYPES.pick.ring(e, state);
        });
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => [].concat(Q.a).join(", "),
    },
    bug: {
      label: "Click the faulty line",
      render(Q, box, submit) {
        box.innerHTML = `<div class="q-code">${Q.code.map((ln, k) => `<button class="qc-line" data-k="${k}"><span class="qc-n">${k + 1}</span><code>${esc(ln)}</code></button>`).join("")}</div>`;
        qsa(".qc-line", box).forEach((b) => (b.onclick = () => submit(+b.dataset.k)));
      },
      grade: (Q, v) => v === Q.a,
      reveal(Q, box, v) {
        qsa(".qc-line", box).forEach((b, k) => {
          b.disabled = true;
          if (k === Q.a) b.classList.add("right");
          else if (k === v) b.classList.add("wrong");
        });
      },
      answer: (Q) => `line ${Q.a + 1}: ${Q.code[Q.a].trim()}`,
    },
  };
  Object.assign(quiz, { TYPES });
})();
