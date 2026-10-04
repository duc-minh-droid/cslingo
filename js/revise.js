/* Revise tab (#revise): shuffled revision decks drawn from finished sessions via NIC.bank.
   NIC.revisePage(main, life, {names}) renders the page; the session itself runs in NIC.player.revise().
   Preferences (deck size, courses) live in localStorage key `nic.revPrefs`; a round in progress in `csl.revSession` (see savedRound). */
(function () {
  const N = NIC,
    { el, qs, qsa, store, esc } = N;
  const STALE = 24 * 36e5; // a saved round older than this is dropped: yesterday's half-finished deck isn't "your round" any more
  let navigated = false; // true once the hash has changed since the page loaded: then Practice is being visited, not refreshed
  window.addEventListener("hashchange", () => (navigated = true));
  /** The saved round (csl.revSession) if it is still worth resuming, else null (and an old one is cleared).
      The player stores {ids, t (round key = first start), elapsed (active ms), done, right, wrong, xp, paused, opts}, plus `at`
      (when it was last saved) once the player writes it; before that the start time stands in. */
  function savedRound() {
    const r = N.player && N.player.revSaved && N.player.revSaved();
    if (!r) return null;
    const last = +r.at || +r.t || 0;
    if (last && Date.now() - last > STALE) {
      const pl = N.shared && N.shared.enginePlayer;
      try {
        pl && pl.revWrite ? pl.revWrite(null) : localStorage.removeItem("csl.revSession");
      } catch {
        /* storage blocked: it just stays */
      }
      return null;
    }
    return r;
  }
  const ICON = `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="currentColor" opacity=".45"/><rect x="7" y="3" width="14" height="15" rx="2.5" fill="currentColor"/><path d="M11 10.5l2 2 4-4.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SIZES = [5, 10, 20];

  /** calm: the page already arrived with a page transition (or only the panel changed), so skip the staggered entrance. */
  function page(main, life, { names = {}, calm = false } = {}) {
    if (!N.bank.loaded()) {
      // the question lists load on first use: show a quiet placeholder, then build the page
      const wait = el(
        `<div class="page side-page"><div class="card rv-loading"><b>Getting your questions ready</b><span class="faint">One moment.</span></div></div>`,
      );
      main.appendChild(wait);
      N.bank.load().then(
        () => {
          if (wait.isConnected) {
            wait.remove();
            page(main, life, { names, calm });
          }
        },
        () => {
          wait.innerHTML = `<div class="card rv-loading"><b>Couldn't load the questions</b><span class="faint">Check your connection and reopen this tab.</span></div>`;
        },
      );
      return;
    }
    const prefs = { n: 10, subjects: null, ...store.get("nic.revPrefs", {}) };
    const pool = N.bank.all({ learnedOnly: true });
    const subjects = [...new Set(pool.map((x) => x.subject))];
    if (prefs.subjects) prefs.subjects = prefs.subjects.filter((s) => subjects.includes(s));
    if (prefs.subjects && !prefs.subjects.length) prefs.subjects = null;
    const inScope = (x) => !prefs.subjects || prefs.subjects.includes(x.subject);

    /** Look back at one round, inside its dropdown: every question with the right answer and the explanation, missed ones
        marked, plus "Do these again". Built the first time the row is opened. */
    function review(r, host) {
      if (!r) return;
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      const wrong = new Set(r.wrong || []);
      const items = (r.ids || []).map((id) => byId.get(id)).filter(Boolean);
      const T = N.QUIZ_TYPES;
      const cards = items
        .map((it, k) => {
          const Q = it.Q,
            miss = wrong.has(it.id);
          let ans;
          try {
            ans = T[Q.type || "mcq"].answer(Q);
          } catch {
            ans = "";
          }
          return `<div class="rv-rq ${miss ? "miss" : "ok"}"><div class="rv-rq-h"><span class="rv-rq-n">${k + 1}</span><span class="rv-rq-tag">${miss ? "Missed" : "Right"}</span></div>
          <div class="rv-rq-q">${Q.q}</div><div class="rv-rq-fig q-pick"></div>
          ${(Q.type || "mcq") === "pick" ? "" : `<div class="rv-rq-a"><b>Answer:</b> ${ans}</div>`}${Q.why ? `<div class="rv-rq-w">${Q.why}</div>` : ""}</div>`;
        })
        .join("");
      const m = host;
      m.innerHTML = `<div class="rv-review">${items.length < r.n ? `<p class="faint">Some questions are no longer in the bank.</p>` : ""}
        <div class="rv-rq-list">${cards || "<p>These questions are no longer available.</p>"}</div>
        ${items.length ? `<div class="rv-review-go"><button class="btn big primary" data-redo>Do these again</button></div>` : ""}</div>`;
      qsa(".rv-rq", m).forEach((card, k) => {
        const f = items[k].Q.fig;
        if (f) {
          const box = qs(".rv-rq-fig", card),
            Q = items[k].Q;
          try {
            typeof f === "function" ? f(box) : (box.innerHTML = f);
            if (Q.type === "pick") {
              const want = [].concat(Q.a);
              qsa("[data-pick]", box).forEach((e) => {
                e.style.pointerEvents = "none";
                if (want.includes(e.dataset.pick)) e.classList.add("pk-right");
              });
            }
          } catch {
            /* the question stays readable without its figure */
          }
        }
      });
      const redo = qs("[data-redo]", m);
      if (redo)
        redo.addEventListener("click", () => {
          startRound(() => N.player.revise({ ids: items.map((x) => x.id), home: "practice" }));
        });
    }

    const app = N.shared.engineApp || {},
      here = app.SUBJECTS && app.SUBJECTS[app.course]; // the course the learner is in (empty-state link)
    const hero = (h, p) =>
      `<div class="sp-hero u-blue rv-hero">${N.mascot({ who: "chip", size: 130, mood: pool.length ? "determined" : "sleepy", act: pool.length ? "dance" : "sleep", acc: ["propeller"] })}
      <div><h1 class="rv-h">${h}</h1><p class="rv-p">${p}</p></div></div>`;
    const EXPLAIN =
      "A shuffled mix from every lesson you've finished. Get one right and it comes back later; miss it and it comes back soon.";
    if (!pool.length) {
      main.appendChild(
        el(
          `<div class="page side-page">${hero("Nothing to revise yet", EXPLAIN)}<div class="card rv-empty"><b>Finish a lesson first</b><p class="faint">Its questions join your deck here.</p><a class="btn big primary" href="#${esc(here ? here.home : "home")}">Go to ${here ? esc(here.name) + " " : ""}lessons</a></div></div>`,
        ),
      );
      return;
    }

    // an unfinished round: a refresh reopens it straight away; arriving here some other way (or after the round went stale) offers Continue
    const saved = savedRound();
    const resume = () =>
      N.player.revise({ resume: true, ...(saved.opts || {}), home: (saved.opts && saved.opts.home) || "practice" });
    if (saved && !page.booted && !navigated && !saved.paused) {
      page.booted = true;
      setTimeout(resume, 0);
    }
    page.booted = true;
    const qNo = saved ? `Question ${Math.min((saved.done || 0) + 1, saved.ids.length)} of ${saved.ids.length}` : "";
    const where = qNo + ((+saved?.elapsed || 0) >= 6e4 ? ` · ${Math.round(saved.elapsed / 6e4)} min so far` : "");
    const resumeCard = saved
      ? `<div class="card rv-resume"><div><b>Continue your revision</b><span class="faint">${where}</span></div><button class="btn primary rv-continue">Continue</button></div>`
      : "";
    const node = el(`<div class="page side-page">${hero("Revision", EXPLAIN)}
      <div class="rv-stats" role="group"></div>
      ${resumeCard}
      <div class="card rv-setup">
        <div class="rv-row"><b>Courses</b><div class="seg rv-subj">${subjects.length > 1 ? `<button data-s="*">All</button>` : ""}${subjects.map((s) => `<button data-s="${s}">${esc(names[s] || s)}</button>`).join("")}</div></div>
        <div class="rv-row"><b>Questions</b><div class="seg rv-size">${SIZES.map((n) => `<button data-n="${n}">${n}</button>`).join("")}</div></div>
        <button class="btn big rv-go"></button>
      </div>
      <div class="rv-done"><h2>Your rounds</h2><div class="rv-list"></div></div>
    </div>`);
    main.appendChild(node);

    /** Start a round. With a saved one waiting, ask first: starting replaces it (the answers already given still count). */
    function startRound(begin) {
      if (!saved) return begin();
      if (!N.modal) return confirm(`Replace your saved round? You're on ${qNo.toLowerCase()}.`) && begin();
      const m = N.modal(
        `<div class="rv-ask" role="alertdialog" aria-labelledby="rv-ask-h"><h2 id="rv-ask-h">Replace your saved round?</h2>
          <p>You're on ${qNo.toLowerCase()}. A new round drops your place in it. Answers you've already given still count.</p>
          <button class="btn big primary" data-keep>Keep my round</button><button class="btn big ghost" data-new>Start a new round</button></div>`,
        { cls: "rv-ask-modal" },
      );
      qs("[data-keep]", m).addEventListener("click", () => m.close());
      qs("[data-new]", m).addEventListener("click", () => {
        m.close();
        begin();
      });
    }
    const fx = N.fx || {};
    /** The history: one row per finished round, newest first (nic.revRounds, saved by the player when a round completes). */
    const rounds = Object.entries(store.get("nic.revRounds", {}))
      .map(([t, r]) => ({ t: +t, ...r }))
      .sort((a, b) => b.t - a.t)
      .slice(0, 40);
    const when = (t) => {
      const d = new Date(t),
        today = new Date(),
        y = new Date(Date.now() - 864e5),
        hm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return d.toDateString() === today.toDateString()
        ? `Today, ${hm}`
        : d.toDateString() === y.toDateString()
          ? `Yesterday, ${hm}`
          : `${d.toLocaleDateString([], { day: "numeric", month: "short" })}, ${hm}`;
    };
    const rowHTML = (r) => {
      const head = `<div class="rv-sess-t"><small>${when(r.t)}</small><b>${r.n} questions</b></div><div class="rv-sess-n"><span class="${r.right / r.n >= 0.8 ? "rv-ok" : "rv-due"}">${r.right}/${r.n} right</span></div>`;
      return r.ids
        ? `<details class="rv-round" data-t="${r.t}"><summary class="rv-sess rv-tap">${head}</summary><div class="rv-round-body"></div></details>`
        : `<div class="rv-sess" data-t="${r.t}">${head}</div>`;
    };
    const box = qs(".rv-list", node);
    box.innerHTML = rounds.map(rowHTML).join("");
    qsa(".rv-round", box).forEach((d) =>
      d.addEventListener("toggle", () => {
        const body = qs(".rv-round-body", d);
        if (d.open && !body.firstChild)
          review(
            rounds.find((r) => String(r.t) === d.dataset.t),
            body,
          );
      }),
    );
    qs(".rv-done", node).hidden = !rounds.length;

    /** Everything that depends on the chosen courses: the heading, the due / mastered / accuracy row and the main button. */
    function paint() {
      qsa(".rv-subj button", node).forEach((b) =>
        b.classList.toggle(
          "on",
          b.dataset.s === "*"
            ? !prefs.subjects
            : (!!prefs.subjects && prefs.subjects.includes(b.dataset.s)) || (!prefs.subjects && subjects.length === 1),
        ),
      );
      qsa(".rv-size button", node).forEach((b) => b.classList.toggle("on", +b.dataset.n === prefs.n));
      const st = N.bank.stats({ subjects: prefs.subjects }),
        unseen = st.available - st.seen,
        next = N.bank.nextDue({ subjects: prefs.subjects });
      const dueN = `${st.dueSeen} review${st.dueSeen === 1 ? "" : "s"} due`;
      const [h, p] = saved
        ? ["Pick up where you left off", "Your round is saved. Continue it, or start a new one below."]
        : st.dueSeen
          ? [dueN, EXPLAIN]
          : st.seen
            ? [
                "All caught up",
                `Nothing is due${next ? `, and your next review is ${N.bank.whenLabel(next)}` : ""}. ${unseen ? "You can still try new questions." : "You can still practise anyway."}`,
              ]
            : ["Start revising", EXPLAIN];
      qs(".rv-h", node).textContent = h;
      qs(".rv-p", node).textContent = p;
      const pct = st.seen ? `${Math.round(st.accuracy * 100)}%` : "–";
      const stats = qs(".rv-stats", node);
      stats.setAttribute(
        "aria-label",
        `${st.dueSeen} due, ${st.mastered} mastered, ${st.seen ? pct + " right" : "none answered yet"}`,
      );
      stats.innerHTML = `<div class="rv-st ${st.dueSeen ? "due" : st.seen ? "clear" : ""}"><b>${st.dueSeen}</b><span>due</span></div><div class="rv-st"><b>${st.mastered}</b><span>mastered</span></div><div class="rv-st"><b>${pct}</b><span>right</span></div>`;
      const go = qs(".rv-go", node),
        avail = pool.filter(inScope).length;
      go.textContent = saved
        ? "Start a new round"
        : st.dueSeen
          ? `Review ${Math.min(prefs.n, st.dueSeen)} due`
          : st.seen
            ? unseen
              ? "Try new questions"
              : "Practise anyway"
            : "Start revision";
      go.classList.toggle("primary", !saved); // a round waiting to be continued is the main action
      go.classList.toggle("ghost", !!saved);
      go.disabled = !avail;
    }
    const save = () => store.set("nic.revPrefs", { n: prefs.n, subjects: prefs.subjects });
    qsa(".rv-subj button", node).forEach((b) =>
      b.addEventListener("click", () => {
        const s = b.dataset.s;
        if (s === "*") prefs.subjects = null;
        else {
          const cur = new Set(prefs.subjects || []);
          if (!prefs.subjects) cur.clear();
          cur.has(s) ? cur.delete(s) : cur.add(s);
          prefs.subjects = cur.size && cur.size < subjects.length ? [...cur] : null;
        }
        N.sfx && N.sfx.play("select");
        save();
        paint();
      }),
    );
    qsa(".rv-size button", node).forEach((b) =>
      b.addEventListener("click", () => {
        prefs.n = +b.dataset.n;
        N.sfx && N.sfx.play("select");
        save();
        paint();
      }),
    );
    const cont = qs(".rv-continue", node);
    if (cont) cont.addEventListener("click", resume);
    qs(".rv-go", node).addEventListener("click", () =>
      startRound(() => N.player.revise({ home: "practice/due", n: prefs.n, subjects: prefs.subjects })),
    );
    paint();
    if (!calm && fx.enter) fx.enter(Array.from(node.children), { stagger: 0.03 }); // 7 blocks, total stagger under 200ms
  }

  N.revisePage = page;
  N.revisePage.icon = ICON;
})();
