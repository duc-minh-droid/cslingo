(function () {
  const quiz = (NIC.shared.engineQuiz = NIC.shared.engineQuiz || {});
  const { TYPES } = quiz;
  const N = NIC;
  const { el, qs, qsa, store, header, matrixHTML } = N;

  /** Register a boss quiz. B = {id, subject?, lecture, title, blurb, lede, qs, matrix?, aside?} */
  const DEFS = {};
  N.__bossQ = (id, i) => DEFS[id].qs[i]; // used by tools/boss-test.js
  N.bossDef = (id) => DEFS[id]; // the lesson player runs boss quizzes from these definitions
  N.registerBoss = (B) =>
    (DEFS[B.id] = B) &&
    N.register({
      id: B.id,
      subject: B.subject,
      lecture: B.lecture,
      order: 99,
      num: "Boss",
      title: B.title,
      blurb: B.blurb,
      qCount: B.qs.length,
      render(root) {
        root.appendChild(header(this, B.lede));
        const n = B.qs.length,
          key = (i) => `${B.id}-${i}`;
        const get = () => {
          const s = store.get("nic.quiz", {});
          // drop answers saved by the old multiple-choice-only engine (plain numbers)
          let dirty = false;
          B.qs.forEach((_, i) => {
            if (key(i) in s && typeof s[key(i)] !== "object") {
              delete s[key(i)];
              dirty = true;
            }
          });
          if (dirty) store.set("nic.quiz", s);
          return s;
        };
        const fx = N.fx || {};
        const kinds = [...new Set(B.qs.map((Q) => TYPES[Q.type || "mcq"].label))];
        const top =
          el(`<div class="card boss-top"><div class="boss-meta"><div><small>Score</small><b id="sc">0</b><span class="faint"> / ${n}</span></div>
          <div class="boss-bar"><span id="bar"></span></div><button class="btn ghost small" id="retry">Start over</button></div>
        <div class="boss-dots">${B.qs.map((Q, i) => `<button data-i="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("")}</div>
        <div class="boss-kinds faint">${kinds.length} question styles: ${kinds.join(" · ")}</div></div>`);
        root.appendChild(top);
        if (B.matrix)
          root.appendChild(
            el(
              `<div class="card"><div class="card-head"><h3>Distance matrix (Lecture 3)</h3><span class="faint">keep this handy</span></div><div style="max-width:360px">${matrixHTML()}</div></div>`,
            ),
          );
        if (B.aside) root.appendChild(el(`<div class="card boss-aside">${B.aside}</div>`));
        const stage = el(`<div class="boss-stage"></div>`);
        root.appendChild(stage);
        const firstOpen = () => {
          const s = get();
          return B.qs.findIndex((_, i) => !(key(i) in s));
        };
        let cur = Math.max(0, firstOpen()),
          swapTok = 0;
        const stats = () => {
          const s = get();
          let c = 0,
            a = 0;
          B.qs.forEach((_, i) => {
            if (key(i) in s) {
              a++;
              if (s[key(i)].ok) c++;
            }
          });
          return { c, a };
        };
        function upd() {
          const { c, a } = stats(),
            s = get();
          fx.count ? fx.count(qs("#sc", top), c) : (qs("#sc", top).textContent = c);
          qs("#bar", top).style.transform = `scaleX(${a / n})`;
          qsa(".boss-dots button", top).forEach((b, i) => {
            b.className = key(i) in s ? (s[key(i)].ok ? "ok" : "no") : "";
            if (i === cur && cur < n) b.classList.add("cur");
          });
        }
        function showQ(i, dir) {
          cur = i;
          const Q = B.qs[i],
            T = TYPES[Q.type || "mcq"],
            s = get();
          const node =
            el(`<div class="card predict boss-q qt-${Q.type || "mcq"}"><div class="card-head"><span class="tag violet">Question ${i + 1} of ${n}</span><span class="tag">${T.label}</span></div>
          <div class="q">${Q.q}</div><div class="q-fig"></div><div class="q-body"></div>
          ${Q.hint ? `<div class="q-hint"><button class="btn ghost small" data-hint>Need a nudge?</button><div class="q-hint-t" hidden>${Q.hint}</div></div>` : ""}
          <div class="explain"></div>
          <div class="boss-nav"><button class="btn ghost small" data-go="-1" ${i === 0 ? "disabled" : ""}>Previous</button><button class="btn primary" data-go="1" style="display:none">${i === n - 1 ? "See results" : "Next question"}</button></div></div>`);
          const figBox = qs(".q-fig", node),
            body = qs(".q-body", node);
          if (Q.fig && Q.type !== "pick") typeof Q.fig === "function" ? Q.fig(figBox) : (figBox.innerHTML = Q.fig);
          const hb = qs("[data-hint]", node);
          if (hb)
            hb.onclick = () => {
              qs(".q-hint-t", node).hidden = false;
              hb.remove();
              if (fx.reveal) fx.reveal(qs(".q-hint-t", node));
            };
          const reveal = (v, ok, first) => {
            node.classList.add("answered");
            const focus = T.reveal(Q, body, v, ok);
            const h = qs(".q-hint", node);
            if (h) h.remove();
            const ex = qs(".explain", node);
            N.feedback(
              ex,
              ok ? "ok" : "no",
              `<span class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct!" : "Not quite."}</span>${Q.why}`,
              first,
            );
            qs('[data-go="1"]', node).style.display = "";
            if (first && fx.reveal) {
              fx.reveal(ex);
              if (focus) ok ? (fx.bounce || fx.pop)(focus) : fx.shake(focus);
            }
          };
          T.render(
            Q,
            body,
            (v) => {
              const ok = T.grade(Q, v);
              const st = get();
              st[key(i)] = { v, ok };
              store.set("nic.quiz", st);
              reveal(v, ok, true);
              upd();
              window.dispatchEvent(new Event("nic:progress"));
            },
            key(i),
          );
          if (key(i) in s) reveal(s[key(i)].v, s[key(i)].ok, false);
          qsa("[data-go]", node).forEach((b) =>
            b.addEventListener("click", () => {
              const g = +b.dataset.go;
              if (i + g >= n) results();
              else showQ(i + g, g);
            }),
          );
          // the old question leaves first, then the new one runs a single entrance (a slide; its figure draws itself)
          const tok = ++swapTok,
            old = stage.firstElementChild;
          const put = () => {
            if (tok !== swapTok) return;
            stage.innerHTML = "";
            stage.appendChild(node);
            if (fx.play) fx.play(node);
            if (dir && fx.ok && fx.animate && fx.clean) {
              const r = fx.reduce && fx.reduce();
              fx.clean(
                node,
                fx.animate(
                  node,
                  r
                    ? { opacity: [0, 1] }
                    : { opacity: [0, 1], transform: [`translateX(${18 * dir}px)`, "translateX(0px)"] },
                  { duration: fx.DUR.m, ease: fx.EASE },
                ),
              );
            }
          };
          if (old && dir && fx.ok && fx.exit) {
            old.classList.add("m-ghost");
            fx.exit(old, { x: -12 * dir, scale: 1, dur: fx.DUR.xs }).then(put);
          } else put();
          upd();
        }
        function results() {
          cur = n;
          swapTok++; // cancels a question swap still waiting on its exit
          const { c, a } = stats(),
            s = get(),
            pct = c / n;
          const missed = B.qs.map((Q, i) => [Q, i]).filter(([, i]) => key(i) in s && !s[key(i)].ok);
          const msg =
            a < n
              ? "Some questions are still unanswered. Use the numbers above to jump back."
              : pct === 1
                ? "Perfect. This one is locked in."
                : pct >= 0.8
                  ? "Pass: solid grasp. Skim the misses below, then move on."
                  : "Not yet. Revisit the modules behind the misses, then try again.";
          const mood = a < n ? "think" : pct >= 0.8 ? "happy" : "sad";
          const node =
            el(`<div class="card boss-result">${N.mascot ? N.mascot({ size: 120, mood: "idle", cls: "br-mascot" }) : ""}<div class="br-score"><b id="rs">0</b><span>/ ${n}</span></div><p class="lede" style="margin:6px 0 16px">${msg}</p>
          ${missed.length ? `<h3>Review what you missed</h3>${missed.map(([Q, i]) => `<div class="br-miss"><button class="btn small ghost" data-i="${i}">Q${i + 1}</button><div><div>${Q.q}</div><div class="faint" style="margin-top:4px">Answer: <b style="color:var(--teal-ink)">${TYPES[Q.type || "mcq"].answer(Q)}</b></div></div></div>`).join("")}` : ""}
          <div class="controls" style="margin-top:14px">${missed.length ? `<button class="btn primary" id="rm">Retry the ${missed.length} missed</button>` : ""}<button class="btn ghost" id="ra">Retry everything</button></div></div>`);
          stage.innerHTML = "";
          stage.appendChild(node);
          if (fx.enter) fx.enter(node, { y: 10 });
          fx.count ? fx.count(qs("#rs", node), c, { from: 0, dur: 0.8 }) : (qs("#rs", node).textContent = c);
          if (N.mascotReact) setTimeout(() => N.mascotReact(node, mood), 350);
          if (pct === 1 && fx.celebrate) setTimeout(() => fx.celebrate(qs(".br-score", node), { big: true }), 500);
          qsa(".br-miss [data-i]", node).forEach((b) => (b.onclick = () => showQ(+b.dataset.i, -1)));
          const rm = qs("#rm", node);
          if (rm)
            rm.onclick = () => {
              const st = get();
              missed.forEach(([, i]) => delete st[key(i)]);
              store.set("nic.quiz", st);
              showQ(missed[0][1], 1);
            };
          qs("#ra", node).onclick = reset;
          upd();
        }
        function reset() {
          const st = get();
          B.qs.forEach((_, i) => delete st[key(i)]);
          store.set("nic.quiz", st);
          showQ(0, -1);
        }
        qsa(".boss-dots button", top).forEach(
          (b) =>
            (b.onclick = () => {
              const k = +b.dataset.i;
              if (k !== cur) showQ(k, k > cur ? 1 : -1);
            }),
        );
        qs("#retry", top).onclick = reset;
        firstOpen() === -1 ? results() : showQ(cur, 0);
      },
    });
  N.QUIZ_TYPES = TYPES;
})();
