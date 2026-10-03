/* Revise tab (#revise): shuffled revision decks drawn from finished sessions via NIC.bank.
   NIC.revisePage(main, life, {names}) renders the page; the session itself runs in NIC.player.revise().
   Preferences (deck size, courses) live in localStorage key `nic.revPrefs`. */
(function () {
  const N = NIC, { el, qs, qsa, store, esc } = N;
  const ICON = `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="currentColor" opacity=".45"/><rect x="7" y="3" width="14" height="15" rx="2.5" fill="currentColor"/><path d="M11 10.5l2 2 4-4.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SIZES = [5, 10, 20];
  const plain = (h) => String(h).replace(/<[^>]+>/g, "");

  /** calm: the page already arrived with a page transition (or only the panel changed), so skip the staggered entrance. */
  function page(main, life, { names = {}, calm = false } = {}) {
    const prefs = { n: 10, subjects: null, ...store.get("nic.revPrefs", {}) };
    const R = store.get("nic.rev", {});
    const pool = N.bank.all({ learnedOnly: true });
    const subjects = [...new Set(pool.map((x) => x.subject))];
    if (prefs.subjects) prefs.subjects = prefs.subjects.filter((s) => subjects.includes(s));
    if (prefs.subjects && !prefs.subjects.length) prefs.subjects = null;
    const inScope = (x) => !prefs.subjects || prefs.subjects.includes(x.subject);

    /** Look back at one round: every question with the right answer and the explanation, missed ones marked, plus "Do these again". */
    function review(r) {
      if (!r || !N.modal) return;
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      const wrong = new Set(r.wrong || []);
      const items = (r.ids || []).map((id) => byId.get(id)).filter(Boolean);
      const T = N.QUIZ_TYPES;
      const cards = items.map((it, k) => {
        const Q = it.Q, miss = wrong.has(it.id);
        let ans = ""; try { ans = T[Q.type || "mcq"].answer(Q); } catch { ans = ""; }
        return `<div class="rv-rq ${miss ? "miss" : "ok"}"><div class="rv-rq-h"><span class="rv-rq-n">${k + 1}</span><span class="rv-rq-tag">${miss ? "Missed" : "Right"}</span></div>
          <div class="rv-rq-q">${Q.q}</div><div class="rv-rq-fig q-pick"></div>
          ${(Q.type || "mcq") === "pick" ? "" : `<div class="rv-rq-a"><b>Answer:</b> ${ans}</div>`}${Q.why ? `<div class="rv-rq-w">${Q.why}</div>` : ""}</div>`;
      }).join("");
      const m = N.modal(`<div class="rv-review"><h2>${when(r.t)}</h2><p class="faint">${r.right}/${r.n} right. ${items.length < r.n ? "Some questions are no longer in the bank." : ""}</p>
        <div class="rv-rq-list">${cards || "<p>These questions are no longer available.</p>"}</div>
        ${items.length ? `<div class="rv-review-go"><button class="btn big primary" data-redo>Do these again</button></div>` : ""}</div>`, { cls: "rv-review-modal" });
      qsa(".rv-rq", m).forEach((card, k) => { const f = items[k].Q.fig; if (f) { const box = qs(".rv-rq-fig", card), Q = items[k].Q; try { typeof f === "function" ? f(box) : (box.innerHTML = f); if (Q.type === "pick") { const want = [].concat(Q.a); qsa("[data-pick]", box).forEach((e) => { e.style.pointerEvents = "none"; if (want.includes(e.dataset.pick)) e.classList.add("pk-right"); }); } } catch { /* the question stays readable without its figure */ } } });
      const redo = qs("[data-redo]", m);
      if (redo) redo.addEventListener("click", () => { m.close(); N.player.revise({ ids: items.map((x) => x.id), home: "practice" }); });
    }

    const head = `<div class="sp-hero u-blue rv-hero">${N.mascot({ who: "chip", size: 130, mood: pool.length ? "determined" : "sleepy", act: pool.length ? "dance" : "sleep", acc: ["propeller"] })}
      <div><h1>Due reviews</h1><p>A shuffled mix from every session you've finished. Get one right and it comes back later; miss it and it comes back soon.</p></div></div>`;
    if (!pool.length) {
      main.appendChild(el(`<div class="page side-page">${head}<div class="card rv-empty"><b>Nothing to revise yet</b><p class="faint">Finish a lesson and its questions join your deck here.</p><a class="btn big primary" href="#home">Go to lessons</a></div></div>`));
      return;
    }

    // an unfinished round: reopen it straight away after a refresh, otherwise offer Continue
    const saved = N.player.revSaved && N.player.revSaved();
    if (saved && !page.booted && !saved.paused) { page.booted = true; setTimeout(() => N.player.revise({ resume: true, ...(saved.opts || {}), home: (saved.opts && saved.opts.home) || "practice" }), 0); }
    page.booted = true;
    const resumeCard = saved ? `<div class="card rv-resume"><div><b>Continue your revision</b><span class="faint">Question ${Math.min(saved.done + 1, saved.ids.length)} of ${saved.ids.length}</span></div><button class="btn primary rv-continue">Continue</button></div>` : "";
    const node = el(`<div class="page side-page">${head}
      ${resumeCard}
      <div class="card rv-setup">
        <div class="rv-row"><b>Courses</b><div class="seg rv-subj">${subjects.length > 1 ? `<button data-s="*">All</button>` : ""}${subjects.map((s) => `<button data-s="${s}">${esc(names[s] || s)}</button>`).join("")}</div></div>
        <div class="rv-row"><b>Questions</b><div class="seg rv-size">${SIZES.map((n) => `<button data-n="${n}">${n}</button>`).join("")}</div></div>
        <button class="btn big primary rv-go">Start revision</button>
      </div>
      <div class="rv-done"><h2>Your rounds</h2><div class="rv-list"></div></div>
    </div>`);
    main.appendChild(node);

    const fx = N.fx || {};
    let painted = false;
    /** The history: one row per finished round, newest first (nic.revRounds, saved by the player when a round completes). */
    const rounds = Object.entries(store.get("nic.revRounds", {})).map(([t, r]) => ({ t: +t, ...r })).sort((a, b) => b.t - a.t).slice(0, 40);
    const when = (t) => { const d = new Date(t), today = new Date(), y = new Date(Date.now() - 864e5), hm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); return d.toDateString() === today.toDateString() ? `Today, ${hm}` : d.toDateString() === y.toDateString() ? `Yesterday, ${hm}` : `${d.toLocaleDateString([], { day: "numeric", month: "short" })}, ${hm}`; };
    const rowHTML = (r) => `<${r.ids ? "button" : "div"} class="rv-sess${r.ids ? " rv-tap" : ""}" data-t="${r.t}"><div class="rv-sess-t"><small>${when(r.t)}</small><b>${r.n} questions</b></div><div class="rv-sess-n"><span class="${r.right / r.n >= 0.8 ? "rv-ok" : "rv-due"}">${r.right}/${r.n} right</span></div></${r.ids ? "button" : "div"}>`;
    const box = qs(".rv-list", node);
    box.innerHTML = rounds.map(rowHTML).join("");
    qsa(".rv-tap", box).forEach((b) => b.addEventListener("click", () => review(rounds.find((r) => String(r.t) === b.dataset.t))));
    qs(".rv-done", node).hidden = !rounds.length;

    function paint() {
      qsa(".rv-subj button", node).forEach((b) => b.classList.toggle("on", b.dataset.s === "*" ? !prefs.subjects : !!prefs.subjects && prefs.subjects.includes(b.dataset.s) || (!prefs.subjects && subjects.length === 1)));
      qsa(".rv-size button", node).forEach((b) => b.classList.toggle("on", +b.dataset.n === prefs.n));
      const go = qs(".rv-go", node), avail = pool.filter(inScope).length;
      go.textContent = "Start revision";
      go.disabled = !avail;
      painted = true;
    }
    const save = () => store.set("nic.revPrefs", { n: prefs.n, subjects: prefs.subjects });
    qsa(".rv-subj button", node).forEach((b) => b.addEventListener("click", () => {
      const s = b.dataset.s;
      if (s === "*") prefs.subjects = null;
      else {
        const cur = new Set(prefs.subjects || []);
        if (!prefs.subjects) cur.clear();
        cur.has(s) ? cur.delete(s) : cur.add(s);
        prefs.subjects = cur.size && cur.size < subjects.length ? [...cur] : null;
      }
      N.sfx && N.sfx.play("select"); save(); paint();
    }));
    qsa(".rv-size button", node).forEach((b) => b.addEventListener("click", () => { prefs.n = +b.dataset.n; N.sfx && N.sfx.play("select"); save(); paint(); }));
    const cont = qs(".rv-continue", node);
    if (cont) cont.addEventListener("click", () => N.player.revise({ resume: true, ...(saved.opts || {}), home: (saved.opts && saved.opts.home) || "practice" }));
    qs(".rv-go", node).addEventListener("click", () => N.player.revise({ home: "practice/due", n: prefs.n, subjects: prefs.subjects }));
    paint();
    if (!calm && fx.enter) fx.enter(Array.from(node.children), { stagger: 0.03 }); // 7 blocks, total stagger under 200ms
  }

  N.revisePage = page;
  N.revisePage.icon = ICON;
})();
