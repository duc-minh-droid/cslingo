/* Workshop engine: a no-code, hands-on "lab" screen with missions.
     NIC.workshop(root, life, { who, title, intro, missions:[{id, t, d, hint}], build(stage, api) })
   build() draws the workshop's own stage and calls api.done(id) when the learner pulls a mission off.
     api.say(html, mood)   the coach (mascot + speech bubble) talks
     api.done(id)          tick a mission: springs the pip, floats +XP, confetti on the last one
     api.doneIds()         ids ticked so far
   The node dispatches `nic:wk-mission` ({id, n, total}) and `nic:wk-done` so the lesson player can award XP and unlock Continue.
   All classes are wk- prefixed. Motion is transform/opacity only; reduced motion keeps fades. */
(function () {
  const N = NIC,
    { el, qs, qsa } = N;
  const fx = () => N.fx;

  function workshop(root, life, cfg) {
    const M = cfg.missions,
      done = new Set();
    const node = el(`<section class="wk" aria-label="Workshop">
      <div class="wk-top">
        <div class="wk-coach">${N.mascot({ who: cfg.who || "pebble", size: 64, mood: "idle" })}<div class="wk-say" aria-live="polite"></div></div>
        <ol class="wk-missions">${M.map(
          (
            m,
            i,
          ) => `<li class="wk-m" data-id="${m.id}"><span class="wk-pip"><i>${i + 1}</i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span class="wk-mt"><b>${m.t}</b><span>${m.d || ""}</span>${m.hint ? `<details class="wk-hint"><summary>Stuck? Hint</summary><p>${m.hint}</p></details>` : ""}</span></li>`,
        ).join("")}</ol>
      </div>
      <div class="wk-bar" aria-hidden="true">${M.map(() => `<span><i></i></span>`).join("")}</div>
      <div class="wk-stage"></div>
    </section>`);
    root.appendChild(node);
    const say = qs(".wk-say", node),
      mascot = qs(".mascot", node),
      stage = qs(".wk-stage", node);
    let sayT = 0;

    const cur = () => M.find((m) => !done.has(m.id));
    function paint(animate) {
      const c = cur();
      qsa(".wk-m", node).forEach((li) => {
        const id = li.dataset.id,
          d = done.has(id);
        li.classList.toggle("done", d);
        li.classList.toggle("now", !!c && c.id === id);
        li.classList.toggle("later", !d && !(c && c.id === id));
      });
      qsa(".wk-bar span", node).forEach((s, i) => s.classList.toggle("on", done.has(M[i].id)));
      node.classList.toggle("wk-all", done.size === M.length);
      if (animate && fx() && fx().ok && c)
        fx().enter(qs(`.wk-m[data-id="${c.id}"] .wk-mt`, node), { y: 6, x: 0, dur: fx().DUR.l });
    }

    const api = {
      say(html, mood = "idle") {
        say.innerHTML = html;
        say.classList.remove("pulse");
        void say.offsetWidth;
        say.classList.add("pulse");
        if (mascot && N.mascotReact) {
          clearTimeout(sayT);
          N.mascotReact(mascot, mood);
          if (mood !== "idle") sayT = setTimeout(() => mascot.isConnected && N.mascotReact(mascot, "idle"), 2200);
        }
      },
      done(id) {
        if (done.has(id) || !M.some((m) => m.id === id)) return false;
        done.add(id);
        const li = qs(`.wk-m[data-id="${id}"]`, node),
          last = done.size === M.length;
        paint(false);
        if (fx() && fx().ok) {
          fx().springIn(qs(".wk-pip", li), { from: 0.4, bounce: 0.6, dur: 0.5 });
          fx().floatText(qs(".wk-pip", li), "+8 XP", "#ff9600");
          if (last) fx().celebrate(qs(".wk-coach", node), { big: true });
          else if (N.sfx) N.sfx.play("correct");
        }
        if (!last) setTimeout(() => node.isConnected && paint(true), 500);
        node.dispatchEvent(
          new CustomEvent("nic:wk-mission", { bubbles: true, detail: { id, n: done.size, total: M.length } }),
        );
        if (last) {
          api.say(
            `<b>Workshop complete!</b> You did all ${M.length} missions by hand. That's the skill, not the syntax.`,
            "love",
          );
          node.dispatchEvent(new CustomEvent("nic:wk-done", { bubbles: true }));
        }
        return true;
      },
      doneIds: () => [...done],
      total: M.length,
    };
    node.__wk = api;
    paint(false);
    api.say(cfg.intro || "Pick up the first mission and have a go.", "idle");
    cfg.build(stage, api, life);
    return node;
  }

  /** Small shared helpers for workshop stages. */
  const wk = {
    /** A sticker stat: <div class="wk-stat">. Use wk.stat(label, value, tone). */
    stat: (label, value, tone = "") => `<div class="wk-stat ${tone}"><small>${label}</small><b>${value}</b></div>`,
    /** Toggle a transient class (for a one-off CSS animation). */
    flash(node, cls = "wk-flash") {
      if (!node) return;
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
    },
  };

  N.workshop = workshop;
  N.wk = wk;
})();
