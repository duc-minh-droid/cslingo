(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { IC, T, contextCard, foot, fx, game, goldRect, open, pickOne, presenter, reduce, sound, workshopScreen } = pl;
  const N = NIC,
    { qs, qsa, store } = N;

  pl.RENDER = {
    step(node, sc) {
      const s = sc.s,
        L = N.LESSONS[pl.S.mod.id];
      node.innerHTML = `<div class="pl-in pl-read">
        <div class="lesson-step-n">Step ${sc.k + 1} of ${L.steps.length}</div>
        <h1 class="lesson-title">${s.t}</h1>
        <div class="lesson-body">${s.b}</div>
        <div class="lesson-visual"></div>
        ${sc.Q ? `<div class="pl-qwrap"></div>` : ""}</div>`;
      const vis = qs(".lesson-visual", node);
      if (typeof s.v === "function") {
        try {
          s.v(vis, pl.S.life);
        } catch (e) {
          console.error(e);
        }
      } else if (s.v) vis.innerHTML = s.v;
      if (sc.Q) {
        pl.askQ(qs(".pl-qwrap", node), sc, { compact: true });
      } else foot("continue", { onGo: pl.next });
    },
    q(node, sc) {
      node.innerHTML = `<div class="pl-in pl-quiz">${sc.retry ? `<div class="pl-tag orange pl-prev">${IC.retry}Previous mistake</div>` : sc.revTag ? (sc.revId && pl.studyTarget(sc.mod) ? `<button class="pl-tag blue pl-tag-study" data-study title="Study this lesson, then come back">${IC.book}<span>${sc.revTag}</span></button>` : `<div class="pl-tag blue">${sc.revTag}</div>`) : sc.practice ? `<div class="pl-tag violet">Practice</div>` : sc.pred ? `<div class="pl-tag violet">Predict first</div>` : sc.check ? `<div class="pl-tag green">Quick check</div>` : pl.S.kind === "boss" ? `<div class="pl-tag orange">Question ${sc.bossIdx + 1} of ${pl.S.boss.qs.length}</div>` : ""}<div class="pl-qwrap"></div></div>`;
      contextCard(node, sc);
      pl.askQ(qs(".pl-qwrap", node), sc, {});
      if (sc.retry) pl.addSkip();
      const study = qs("[data-study]", node);
      if (study) study.onclick = () => pl.studyThenReturn(sc);
    },
    try(node, sc) {
      node.classList.add("wide");
      if (sc.workshop) return workshopScreen(node, sc);
      node.innerHTML = `<div class="pl-in pl-try"><div class="pl-try-head">${N.mascot({ who: pl.S.who, size: 64, act: "wave" })}<div><div class="pl-tag orange">Try it yourself</div><h1>See it working</h1></div></div>
        <div class="pl-try-grid"><div class="pl-try-demo"></div>${sc.guide ? `<aside class="pl-try-side"></aside>` : ""}</div></div>`;
      qs(".pl-try-demo", node).appendChild(pl.S.demo);
      if (pl.S.holder) {
        pl.S.holder.remove();
        pl.S.holder = null;
      }
      setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 60);
      if (sc.guide) {
        const g = N.guide(sc.guide);
        g.removeAttribute("id");
        qs(".pl-try-side", node).appendChild(g);
        // phones: the checklist is a sticky chip above the demo; tap it to open
        const head = qs(".card-head", g);
        head.setAttribute("role", "button");
        head.setAttribute("tabindex", "0");
        head.addEventListener("click", () => g.classList.toggle("open"));
        // pressing a demo button ticks the step that names it in bold ("Press <b>Run</b>…")
        const items = qsa(".guide-item", g).map((b) => ({
          b,
          keys: qsa("b", b)
            .map((x) => x.textContent.trim().toLowerCase())
            .filter(Boolean),
        }));
        qs(".pl-try-demo", node).addEventListener(
          "click",
          (e) => {
            const btn = e.target.closest("button, input[type=checkbox], input[type=range], select");
            if (!btn) return;
            const label = (
              btn.textContent ||
              btn.getAttribute("aria-label") ||
              (btn.closest("label") && btn.closest("label").textContent) ||
              ""
            )
              .trim()
              .toLowerCase();
            if (!label) return;
            const hit = items.find(
              (it) =>
                !it.b.classList.contains("done") &&
                it.keys.some((k) => k.length > 1 && (label === k || label.includes(k) || k.includes(label))),
            );
            if (hit)
              pl.S.life.timeout(() => {
                if (pl.S && hit.b.isConnected) hit.b.click();
              }, 250);
          },
          true,
        );
        g.addEventListener("nic:guide-done", () => {
          if (!pl.S || pl.S.demoXP) return;
          pl.S.demoXP = true;
          pl.S.xp += 5;
          game().track("demo");
          if (fx()) fx().floatText(qs(".guide-count", g) || g, "+5 XP", "#ff9600");
          foot("continue", {
            onGo: pl.next,
            fb: `<div class="pl-fb-row">${N.mascot({ who: "chip", size: 52, mood: "love" })}<b>Demo complete! +5 XP</b></div>`,
          });
        });
      }
      foot("continue", {
        onGo: pl.next,
        fb: sc.guide ? `<span class="faint">Tick the list as you go, then continue.</span>` : "",
      });
    },
    recap(node) {
      node.innerHTML = `<div class="pl-in pl-read">${presenter("Here's what to remember.", "happy")}<div class="pl-recap"></div></div>`;
      qs(".pl-recap", node).appendChild(pl.S.recap);
      foot("continue", { onGo: pl.next });
    },
    mistakes(node) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "berry", size: 150, mood: "determined", acc: ["detective", "monocle"] })}<h1>Let's fix your mistakes</h1><p class="lede">A second go makes it stick.</p></div>`;
      sound("pop");
      foot("continue", { onGo: pl.next });
    },
    bossIntro(node) {
      const B = pl.S.boss,
        kinds = [...new Set(B.qs.map((Q) => T()[Q.type || "mcq"].label))];
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: pl.S.who, size: 150, mood: "determined", acc: ["crown"], act: "dance" })}
        <div class="pl-tag orange">Boss quiz</div><h1>${pl.S.mod.title}</h1><p class="lede">${B.lede || ""}</p>
        <div class="pl-kinds"><b>${B.qs.length} questions</b>${kinds.map((k) => `<span class="pl-kind">${k}</span>`).join("")}</div>${pl.S.refHTML ? `<div class="card pl-ref-card">${pl.S.refHTML}</div>` : ""}</div>`;
      foot("continue", { label: "Start", onGo: pl.next });
    },
    hype(node, sc) {
      const pal = ["sprout", "pebble", "byte", "blaze", "chip", "berry"].filter((w) => w !== pl.S.who);
      const buddy = pal[((sc.n / 5) % pal.length) | 0];
      const lines = [
        ["That's " + sc.n + " in a row!", "I am SO proud of you!"],
        [sc.n + " in a row?!", "You're on fire today!"],
        ["Unstoppable!", sc.n + " right, no misses!"],
      ][(sc.n / 5 - 1) % 3];
      node.innerHTML = `<div class="pl-in pl-center pl-hype">
        <div class="ph-stage">
          <div class="ph-who ph-a"><div class="bubble ph-bub">${lines[0]}</div>${N.mascot({ who: pl.S.who, size: 150, mood: "laugh", act: "dance", acc: ["party"] })}</div>
          <div class="ph-who ph-b"><div class="bubble ph-bub">${lines[1]}</div>${N.mascot({ who: buddy, size: 130, mood: "love", act: "spin", acc: ["crown"] })}</div>
        </div></div>`;
      sound("streak");
      if (fx()) {
        const F = fx();
        setTimeout(() => F.lottieAt(qs(".ph-stage", node), "combo", { size: 180, dy: -40 }), 150);
        if (F.ok && !reduce())
          qsa(".ph-bub", node).forEach((b, k) =>
            F.clean(
              b,
              F.animate(
                b,
                { opacity: [0, 1], transform: ["translateY(10px) scale(0.8)", "translateY(0px) scale(1)"] },
                { ...F.SPRING_POP, delay: 0.2 + k * 0.35 },
              ),
            ),
          );
      }
      foot("continue", { onGo: pl.next });
    },
    reviseIntro(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "chip", size: 150, mood: "determined", acc: ["propeller"], act: "dance" })}
        <div class="pl-tag blue">Revision</div><h1>${sc.n} mixed questions</h1><p class="lede">Shuffled from ${sc.mods} session${sc.mods === 1 ? "" : "s"} you've finished. Questions you miss come back sooner.</p></div>`;
      foot("continue", { label: "Start", onGo: pl.next });
    },
    practiceIntro(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "berry", size: 150, mood: "determined", acc: ["headphones"], act: "headbang" })}
        <div class="pl-tag violet">Practice</div><h1>${sc.n} quick questions</h1><p class="lede">${sc.fixes ? `${sc.fixes} of them are things you got wrong before.` : "A mixed refresh from the lessons you've finished."}</p></div>`;
      foot("continue", { label: "Start", onGo: pl.next });
    },
    note(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: sc.who || pl.S.who, size: 140, mood: sc.mood || "think" })}<h1>${sc.t || ""}</h1><p class="lede">${sc.b || ""}</p></div>`;
      foot("continue", { onGo: () => pl.close() });
    },
    bossResult(node) {
      const B = pl.S.boss,
        key = (i) => `${B.id}-${i}`,
        st = store.get("nic.quiz", {}),
        n = B.qs.length;
      const c = B.qs.filter((_, i) => st[key(i)] && st[key(i)].ok).length,
        pct = c / n;
      const miss = B.qs.map((Q, i) => [Q, i]).filter(([, i]) => st[key(i)] && !st[key(i)].ok);
      const msg =
        pct === 1
          ? "Perfect. This one is locked in."
          : pct >= 0.8
            ? "Pass! Skim the misses, then move on."
            : "Not yet. Review the misses and have another go.";
      const R = 54,
        L = 2 * Math.PI * R;
      node.innerHTML = `<div class="pl-in pl-center">
        <div class="pl-ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--line)" stroke-width="14"/><circle class="ring-fg" cx="70" cy="70" r="${R}" fill="none" stroke="${pct >= 0.8 ? "#58cc02" : "#ff9600"}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}" transform="rotate(-90 70 70)"/></svg>
          <div class="ring-n"><b id="brN">0</b><span>/ ${n}</span></div>${N.mascot({ who: pl.S.who, size: 70, mood: "idle", acc: pct === 1 ? ["crown"] : [], cls: "ring-m" })}</div>
        <h1>${pct >= 0.8 ? "Boss beaten!" : "Boss still standing"}</h1><p class="lede">${msg}</p>
        ${miss.length ? `<div class="pl-miss">${miss.map(([Q, i]) => `<div class="pl-miss-row"><span class="pl-tag rose">Q${i + 1}</span><div><div>${Q.q}</div><div class="faint">Answer: <b>${T()[Q.type || "mcq"].answer(Q)}</b></div></div></div>`).join("")}</div>` : ""}
        <div class="controls pl-center-row">${miss.length ? `<button class="btn" data-retry="miss">Retry the ${miss.length} missed</button>` : ""}<button class="btn ghost" data-retry="all">Retry everything</button></div></div>`;
      const fg = qs(".ring-fg", node);
      if (fx() && fx().ok && !reduce())
        fx().animate(fg, { strokeDashoffset: [L, L * (1 - pct)] }, { duration: 1, delay: 0.2, ease: fx().EASE });
      else fg.setAttribute("stroke-dashoffset", L * (1 - pct));
      if (fx()) fx().count(qs("#brN", node), c, { from: 0, dur: 0.9 });
      setTimeout(() => N.mascotReact(qs(".ring-m", node), pct === 1 ? "love" : pct >= 0.8 ? "happy" : "sad"), 900);
      if (pct === 1 && fx()) setTimeout(() => fx().celebrate(qs(".pl-ring", node), { big: true }), 900);
      if (pct >= 0.8 && fx()) setTimeout(() => fx().lottieAt(qs(".pl-ring", node), "trophy", { size: 220 }), 1000);
      if (pct === 1) game().unlock("perfect");
      pl.S.bossPct = pct;
      qsa("[data-retry]", node).forEach((b) =>
        b.addEventListener("click", () => {
          const s2 = store.get("nic.quiz", {});
          (b.dataset.retry === "all" ? B.qs.map((_, i) => i) : miss.map(([, i]) => i)).forEach(
            (i) => delete s2[key(i)],
          );
          store.set("nic.quiz", s2);
          const mod = pl.S.mod,
            o = pl.S.opts;
          pl.close(true);
          open(mod, o);
        }),
      );
      foot("continue", {
        onGo: () => {
          pl.S.i++;
          pl.finish();
        },
      });
    },
    complete(node) {
      const acc = pl.S.firstTotal ? pl.S.firstRight / pl.S.firstTotal : 1;
      const secs = Math.round((Date.now() - pl.S.start) / 1000);
      const lessonXP =
        pl.S.kind === "practice" || pl.S.kind === "revise"
          ? 5
          : pl.S.kind === "boss"
            ? pl.S.bossPct >= 0.8
              ? 20
              : 5
            : pl.S.review
              ? 5
              : 10;
      const total = pl.S.xp + lessonXP;
      game().award(total, pl.S.kind);
      const res = game().lessonDone({ acc, review: pl.S.review, kind: pl.S.kind });
      pl.S.streakRes = res;
      const others = ["sprout", "pebble", "byte", "blaze", "chip", "berry"].filter((w) => w !== pl.S.who);
      const hats = N.cast ? N.cast.HATS.slice().sort(() => Math.random() - 0.5) : [];
      const acts = ["dance", "juggle", "spin", "dance", "headbang"];
      const label = acc === 1 ? "Amazing" : acc >= 0.9 ? "Great" : acc >= 0.7 ? "Good" : "Keep going";
      node.innerHTML = `<div class="pl-in pl-center pl-done">
        <div class="pd-cast">${others
          .slice(0, 2)
          .map((w, k) => N.mascot({ who: w, size: 78, mood: "happy", act: acts[k], acc: [hats[k]] }))
          .join("")}
          ${N.mascot({ who: pl.S.who, size: 150, mood: "laugh", act: "dance", acc: ["party"], cls: "pd-star" })}
          ${others
            .slice(2, 4)
            .map((w, k) =>
              N.mascot({ who: w, size: 78, mood: k ? "love" : "happy", act: acts[k + 2], acc: [hats[k + 2]] }),
            )
            .join("")}</div>
        <h1 class="pd-title">${pl.S.kind === "practice" ? "Practice complete!" : pl.S.kind === "revise" ? "Revision complete!" : pl.S.kind === "boss" ? (pl.S.bossPct >= 0.8 ? "Boss beaten!" : "Quiz complete!") : acc === 1 ? pickOne(["Learning legend!", "Flawless!", "Perfect lesson!"]) : acc >= 0.8 ? pickOne(["Lesson complete!", "Nicely done!", "Brain gains!"]) : "Lesson complete!"}</h1>
        ${pl.S.kind === "boss" && pl.S.bossScore ? `<div class="pd-boss">${pl.S.bossPerfect ? "Perfect score" : "Score"}: <b>${pl.S.bossScore}</b></div>` : ""}
        <div class="pd-cards">
          <div class="pd-card c-gold" data-xp="${total}"><b>Total XP</b><span>${IC.bolt}<i data-v="${total}">0</i></span></div>
          <div class="pd-card c-green"><b>${label}</b><span>${IC.target}<i data-v="${Math.round(acc * 100)}">0</i>%</span></div>
          <div class="pd-card c-blue"><b>${secs < 180 ? "Speedy" : "Time"}</b><span>${IC.clock}<i class="pd-time">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</i></span></div>
        </div></div>`;
      sound("fanfare");
      if (fx()) setTimeout(() => fx().celebrate(qs(".pd-title", node), { big: true, silent: true }), 250);
      if (pl.S.bossPerfect && fx())
        setTimeout(() => fx().lottieAt(qs(".pd-star", node) || qs(".pd-title", node), "trophy", { size: 220 }), 700);
      pl.S.xpTotal = total;
      qsa(".pd-card", node).forEach((card, k) =>
        setTimeout(
          () => {
            const i = qs("i[data-v]", card),
              F = fx();
            if (!F || !F.ok) {
              card.style.opacity = 1;
              if (i) i.textContent = i.dataset.v;
              return;
            }
            if (i) F.count(i, +i.dataset.v, { from: 0, dur: 0.7 }); // count() sets the final value at once under reduced motion
            const shown = () => (card.style.opacity = 1); // .pd-card starts at opacity 0 in CSS, so opacity stays inline
            if (reduce()) {
              F.animate(card, { opacity: [0, 1] }, { duration: F.DUR.m })
                .finished.then(shown)
                .catch(shown);
              return;
            } // fade only, no ticks
            let t = 0;
            const iv = setInterval(() => {
              sound("tick");
              if (++t > 5) clearInterval(iv);
            }, 90);
            F.clean(card, F.animate(card, { transform: ["scale(0.7)", "scale(1)"], opacity: [0, 1] }, F.SPRING_POP), [
              "transform",
            ])
              .finished.then(shown)
              .catch(shown);
          },
          reduce() ? 300 + k * 120 : 500 + k * 260,
        ),
      );
      qs(".pl-combo", pl.S.root).classList.remove("on", "mini");
      if (pl.S.kind === "lesson") {
        const d = store.get("nic.lessonDone", {});
        d[pl.S.mod.id] = true;
        store.set("nic.lessonDone", d);
        const p = store.get("nic.lessonPos", {});
        delete p[pl.S.mod.id];
        store.set("nic.lessonPos", p);
        window.dispatchEvent(new Event("nic:progress"));
      }
      N.lastFinished = pl.S.mod.id;
      pl.S.completed = true;
      foot("continue", {
        onGo: () => {
          pl.S.goldRect = goldRect();
          res.firstToday ? (pl.S.screens.push({ kind: "streak" }), pl.next()) : pl.close();
        },
      });
      pl.S.go.classList.add("pl-go-blue"); // Duolingo's lesson-complete button is blue
    },
    streak(node) {
      const r = pl.S.streakRes,
        wk = game().week();
      node.innerHTML = `<div class="pl-in pl-center pl-streak">
        <div class="ps-flame">${N.mascot({ who: "blaze", size: 170, mood: "laugh", act: "dance", acc: r.streak >= 7 ? ["crown"] : ["shades"] })}</div>
        <div class="ps-num"><b id="psN">${r.streakFrom}</b></div><h1>day streak!</h1>
        <div class="ps-week">${wk.map((d) => `<div class="ps-day ${d.on ? "on" : ""} ${d.today ? "today" : ""}"><span>${d.label}</span><i>${d.on ? IC.ok : ""}</i></div>`).join("")}</div>
        <p class="lede">${r.streak === 1 ? "Day one. Come back tomorrow to keep it going." : "Practise every day to keep your streak alive."}</p></div>`;
      sound("flame");
      if (fx()) fx().lottie(qs(".ps-flame", node), "flame", { cls: "ps-lottie" });
      setTimeout(() => {
        const nEl = qs("#psN", node);
        const F = fx();
        if (F) {
          F.count(nEl, r.streak, { from: r.streakFrom, dur: 0.6 });
          F.bump(qs(".ps-num", node), { scale: 1.5 });
        } else nEl.textContent = r.streak;
        const t = qs(".ps-day.today", node);
        if (t && F && F.ok && !reduce())
          F.clean(t, F.animate(t, { transform: ["scale(0.5)", "scale(1)"] }, F.SPRING_POP), ["transform"]);
        sound("streak");
      }, 450);
      foot("continue", { onGo: () => pl.close() });
    },
  };
})();
