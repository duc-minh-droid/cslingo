/* Lecture 2 · Why EAs, scene 09-update: the Update step of the EA loop. The same twelve solutions (ten old, two children) go
   through three update rules, one after the other, each starting from the same twelve bars:
   1) replace everyone (S5, the best old one, is LOST), 2) merge and keep the best 10 (S5 kept, S1 and S10 drop out),
   3) replace the weakest (S1 and S10 give way to S11 and S12, mean 0.39 to 0.49, the loop closes).
   Story (local seconds): rule 1 0.7-3.9, rule 2 4.0-8.1, rule 3 8.2-11.5; between rules a short cross-fade back to the twelve bars.
   Every order, mean and kept/dropped list comes from L2.updateRules(). */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { ramp, clamp, lerp, flash, ease: E } = V;

  // ---- data (all computed by the helpers, checked here)
  const RULES = L2.updateRules();
  const ITEMS = L2.POP.concat(L2.KIDS);
  const IDS = ITEMS.map((q) => q.id);
  const OLD = L2.POP.map((q) => q.id);
  const [C1, C2] = L2.KIDS.map((q) => q.id); // S11, S12
  const BEST = RULES.replaceAll.bestOld; // S5
  const MERGE_SLOT = Object.fromEntries(RULES.merge.order.map((id, i) => [id, i]));
  const WEAK_SLOT = Object.fromEntries(RULES.weakest.slots.map((id, i) => [id, i]));
  const GONE = RULES.weakest.replaced; // S1, S10
  const MEAN = [RULES.weakest.meanBefore, RULES.weakest.meanAfter];
  if (BEST !== "S5" || !RULES.replaceAll.bestLost || !RULES.merge.bestKept || !RULES.weakest.bestKept)
    throw new Error("scene 09: the update rules changed");
  if (RULES.merge.dropped.join() !== "S1,S10" || RULES.merge.kept.length !== 10 || MERGE_SLOT[C2] !== 9)
    throw new Error("scene 09: merge result changed");
  if (MEAN.join() !== "0.39,0.49" || RULES.merge.meanAfter !== 0.49) throw new Error("scene 09: means changed");

  // ---- layout (stage px)
  const BASE = 548;
  const SCALE = 320;
  const slotX = (s) => 60 + 72 * s;
  const CUT_X = slotX(9.5); // 744: between the tenth and the eleventh bar
  const TAG = { x: 468, y: 126 };
  const f1 = (n) => n.toFixed(1);
  const lin = (t, a, b) => ramp(t, a, b, E.lin);
  const pop = (t, a, d = 0.35) => E.pop(lin(t, a, a + d));
  // the three rule tags, the number badge sits in each (32 px text)
  const RULE_TAGS = [
    ["Replace everyone", "grey"],
    ["Merge, keep the best 10", "orange"],
    ["Replace the weakest", "purple"],
  ];

  V.scene({
    kicker: "THE EA LOOP",
    title: ["Update: who stays", "in the population?"],
    dur: 12,
    caps: [
      [0.8, 3.4, "Replace everyone: the best can be lost."],
      [4.2, 7.6, "Merge, keep the best 10: the best survives."],
      [8.4, 10.0, "Replace the weakest: the best survives too."],
      [10.2, 11.5, "Then repeat the loop."],
    ],
    build(stage) {
      const strip = L2.loopStrip(stage, { x: 48, y: 0, w: 840 });
      const pop12 = L2.bars(stage, { items: ITEMS, x: 24, base: BASE, pitch: 72, w: 60, scale: SCALE });

      // extras: placeholder outlines for the unknown children, the cut line
      const holes = [2, 3, 5, 6, 7, 8, 9].map((slot) => ({
        slot,
        el: V.h("div", {
          style: {
            position: "absolute",
            boxSizing: "border-box",
            left: `${slotX(slot) - 30}px`,
            top: `${BASE - 56}px`,
            width: "60px",
            height: "56px",
            border: "3px dashed var(--grey-edge, #afafaf)",
            borderRadius: "14px",
          },
        }),
      }));
      holes.forEach((q) => {
        q.el.style.borderColor = L5.tone("grey").edge;
        stage.append(q.el);
      });
      const cut = V.h("div", {
        style: {
          position: "absolute",
          left: `${CUT_X - 2}px`,
          top: "190px",
          width: "0",
          height: "0",
          borderLeft: `4px dashed ${L5.tone("orange").c}`,
          boxSizing: "border-box",
        },
      });
      stage.append(cut);

      // rule tags (one visible at a time) with a small number badge
      const tags = RULE_TAGS.map(([text, tone], i) => {
        const num = V.h("span", {
          text: String(i + 1),
          style: {
            width: "40px",
            height: "40px",
            boxSizing: "border-box",
            borderRadius: "50%",
            border: "3px solid",
            borderColor: L5.tone(tone).edge,
            background: "var(--panel)",
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "900",
            marginRight: "12px",
            verticalAlign: "middle",
          },
        });
        return L2.tag(stage, {
          kids: [num, V.h("span", { text })],
          tone,
          size: 32,
          x: TAG.x,
          y: TAG.y,
          anchor: "c",
          lip: true,
          pad: "4px 20px 6px 12px",
        });
      });

      // SVG layer: the cross, ticks, arrow
      const svg = L5.svg(stage);
      const crossG = L5.cross(slotX(4), BASE - 144, 90, "red", { w: 9 });
      const tickG = L5.tick(slotX(1), 196, 44, "green", { w: 8 });
      const tick3 = L5.tick(slotX(4), 196, 44, "green", { w: 8 });
      const avgArrow = L5.arrow(0, 0, 0, 0, "grey", 1, { w: 5, head: 16 });
      svg.append(crossG, tickG, tick3);

      // badges
      const lostBadge = L5.badge(stage, { x: slotX(4) - 145, y: 172, w: 290, h: 60, invalid: "best lost" });
      const keptBadge = L5.badge(stage, { x: 468 - 145, y: 172, w: 290, h: 60, valid: "best kept" });

      // average row (rule 3): label, 0.39, arrow, 0.49
      const AVG = { x: 560, y: 190 };
      const avgLabel = L2.tag(stage, {
        text: "average",
        tone: "grey",
        x: AVG.x - 190,
        y: AVG.y,
        anchor: "l",
        size: 28,
      });
      const avgFrom = L2.tag(stage, {
        text: MEAN[0].toFixed(2),
        tone: "grey",
        x: AVG.x - 66,
        y: AVG.y,
        anchor: "c",
        size: 28,
      });
      const avgTo = L2.tag(stage, {
        text: MEAN[1].toFixed(2),
        tone: "green",
        solid: true,
        x: AVG.x + 96,
        y: AVG.y,
        anchor: "c",
        size: 28,
      });
      const arrowG = L5.arrow(AVG.x - 20, AVG.y, AVG.x + 44, AVG.y, "grey", 1, { w: 6, head: 18 });
      svg.append(arrowG);
      void avgArrow;

      // ---- bar states per phase (lt = seconds on the phase's own clock, a = the cross-fade opacity)
      const base = (id) => (OLD.includes(id) ? { tone: "grey" } : { tone: "purple", solid: true });
      const setAll = (fn, a) => IDS.forEach((id) => pop12.set(id, { ...base(id), ...fn(id), o: (fn(id).o ?? 1) * a }));

      // rule 1 (t in seconds from the scene start)
      function bars1(t) {
        return (id) => {
          const i = OLD.indexOf(id);
          if (i < 0) {
            const e = ramp(t, 1.9, 2.6, E.inOut);
            return { slot: lerp(id === C1 ? 10 : 11, id === C1 ? 0 : 1, e) };
          }
          const e = lin(t, 1.1 + 0.07 * i, 1.37 + 0.07 * i);
          if (id === BEST) {
            return e > 0 ? { tone: "red", dash: true, value: false, nameTone: "red" } : {};
          }
          return { grow: 1 - e, o: 1 - e, value: e > 0 ? false : undefined };
        };
      }
      // rule 2
      function bars2(t) {
        return (id) => {
          const d = Math.abs(MERGE_SLOT[id] - IDS.indexOf(id));
          const e = ramp(t, 4.4 + 0.04 * d, 5.0 + 0.04 * d, E.inOut);
          const st = { slot: lerp(IDS.indexOf(id), MERGE_SLOT[id], e) };
          if (RULES.merge.dropped.includes(id)) {
            const k = lin(t, 6.0, 6.8);
            if (k > 0)
              Object.assign(st, {
                tone: "red",
                dy: 60 * k,
                s: 1 - 0.3 * k,
                o: 1 - k,
                value: k > 0.8 ? false : undefined,
              });
          } else {
            const r = ramp(t, 6.9, 7.5);
            Object.assign(st, { ring: r, ringTone: "green" });
          }
          return st;
        };
      }
      // rule 3
      function bars3(t) {
        return (id) => {
          const st = {};
          if (GONE.includes(id)) {
            const pulse = flash(t, 8.6, 9.0);
            const k = lin(t, 9.0, 9.9);
            return {
              tone: "red",
              s: (1 + 0.14 * pulse) * (1 - 0.4 * k),
              grow: 1 - k,
              o: 1 - k,
              value: k > 0.2 ? false : undefined,
            };
          }
          if (!OLD.includes(id)) {
            const e = ramp(t, 9.0, 9.9, E.inOut);
            st.slot = lerp(IDS.indexOf(id), WEAK_SLOT[id], e);
          }
          return st;
        };
      }

      return (t) => {
        // which rule is on screen and how visible it is
        let ph = 1;
        let a = 1 - lin(t, 3.55, 3.75);
        if (t >= 3.75) {
          ph = 2;
          a = Math.min(lin(t, 3.75, 3.95), 1 - lin(t, 7.7, 7.9));
        }
        if (t >= 7.9) {
          ph = 3;
          a = lin(t, 7.9, 8.1);
        }
        setAll(ph === 1 ? bars1(t) : ph === 2 ? bars2(t) : bars3(t), a);

        // tags: only the current rule's tag, popped in at its start
        const tagAt = [0.7, 4.0, 8.2];
        tags.forEach((tg, i) => {
          const on = ph === i + 1;
          const k = pop(t, tagAt[i], 0.3);
          tg.set({ s: 0.8 + 0.2 * k, o: on ? clamp(k * 3) * a : 0 });
        });

        // rule 1 extras
        const p1 = ph === 1 ? a : 0;
        holes.forEach((q, i) => {
          const k = pop(t, 2.4 + 0.04 * i, 0.3);
          V.place(q.el, { s: 0.8 + 0.2 * k, o: clamp(k * 3) * p1 });
        });
        L5.drawOn(crossG, lin(t, 1.9, 2.3));
        V.place(crossG, { o: p1 });
        lostBadge(p1 > 0 ? "invalid" : "none", pop(t, 2.9, 0.4));
        lostBadge.el.style.opacity = String(clamp(lostBadge.el.style.opacity || 1) * p1);

        // rule 2 extras
        const p2 = ph === 2 ? a : 0;
        const cutK = ramp(t, 5.5, 5.9);
        cut.style.height = `${(600 - 190) * cutK}px`;
        V.show(cut, cutK > 0 ? p2 : 0);
        L5.drawOn(tickG, lin(t, 7.0, 7.4));
        V.place(tickG, { o: p2 });
        const kk = pop(t, 7.0, 0.4);
        keptBadge(p2 > 0 && t > 6.9 ? "valid" : "none", kk);
        keptBadge.el.style.opacity = String(clamp(keptBadge.el.style.opacity || 1) * p2);

        // rule 3 extras
        const p3 = ph === 3 ? a : 0;
        L5.drawOn(tick3, lin(t, 9.9, 10.3));
        V.place(tick3, { o: p3 });
        const avK = pop(t, 10.0, 0.4);
        const avAll = p3 * clamp(avK * 3);
        [avLabelSet, avFromSet, avToSet].forEach((fn) => fn(avK, avAll));
        L5.drawOn(arrowG, lin(t, 10.15, 10.5));
        V.place(arrowG, { o: avAll > 0 ? p3 : 0 });

        // the loop strip: Update is lit, then the return arrow draws and Select pulses
        const loop = lin(t, 10.4, 11.3);
        const sel = t >= 11.1;
        strip.update({ k: 1, active: sel ? 0 : 2, pulse: sel ? flash(t, 11.1, 11.5) : 0, loop });

        function avLabelSet(k, o) {
          avgLabel.set({ s: 0.85 + 0.15 * k, o });
        }
        function avFromSet(k, o) {
          avgFrom.set({ s: 0.85 + 0.15 * k, o });
        }
        function avToSet(k, o) {
          avgTo.set({ s: 0.85 + 0.15 * k, o });
        }
        void f1;
      };
    },
  });
})();
