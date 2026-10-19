/* Lecture 6 · scene 01-title: the title card (4 s). Same look and timing as VID.titleCard (cards.js), but written out here because
   "Consistency and consensus" is too long for one line at the card's 92 px: it is set on two lines of 92 px, with the mascot, the
   kicker and the sub line moved up to make room. Pebble is the Data Science mascot. */
(function () {
  const V = window.VID;
  const { h, place, ramp, ease } = V;
  V.scene({
    bare: true,
    dur: 4,
    build(stage) {
      const mascot = V.mascot("pebble", { size: 250, mood: "happy" });
      mascot.style.left = "415px";
      mascot.style.top = "84px";
      const k = h("div", {
        class: "v-kicker",
        text: "Data Science · Lecture 6",
        style: { left: "0", width: "1080px", top: "372px", textAlign: "center", fontSize: "30px" },
      });
      const line = (text, top) =>
        h("div", {
          class: "v-title-line",
          text,
          style: {
            position: "absolute",
            left: "0",
            width: "1080px",
            top: `${top}px`,
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: "92px",
            lineHeight: "1.05",
          },
        });
      const t1 = line("Consistency", 420);
      const t2 = line("and consensus", 520);
      const s = h("div", {
        class: "v-text dim",
        text: "How copies agree when things go wrong",
        style: {
          left: "0",
          width: "1080px",
          top: "672px",
          textAlign: "center",
          whiteSpace: "normal",
          fontSize: "40px",
        },
      });
      const pill = h("div", {
        class: "v-tag solid c-green",
        text: "CSLingo · explainer",
        style: { left: "400px", top: "850px" },
      });
      stage.append(mascot, k, t1, t2, s, pill);
      return (lt) => {
        const m = ramp(lt, 0.1, 0.9, ease.pop);
        place(mascot, { y: (1 - m) * 40, s: 0.6 + 0.4 * m, o: ramp(lt, 0.1, 0.4) });
        place(k, { y: (1 - ramp(lt, 0.5, 0.9)) * 14, o: ramp(lt, 0.5, 0.9) });
        place(t1, { y: (1 - ramp(lt, 0.6, 1.1)) * 26, o: ramp(lt, 0.6, 1.1) });
        place(t2, { y: (1 - ramp(lt, 0.72, 1.22)) * 26, o: ramp(lt, 0.72, 1.22) });
        place(s, { y: (1 - ramp(lt, 1.0, 1.5)) * 18, o: ramp(lt, 1.0, 1.5) });
        place(pill, { s: 0.8 + 0.2 * ramp(lt, 1.3, 1.8, ease.pop), o: ramp(lt, 1.3, 1.6) });
      };
    },
  });
})();
