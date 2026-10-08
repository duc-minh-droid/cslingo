/* Phase 4 · scene 01-title: the title card (4 s). Same look as VID.titleCard (cards.js), but written out here because the phase
   name "Minimum Spanning Trees" is too long for its 92 px headline (it wraps onto the sub line): 80 px, one line. */
(function () {
  const V = window.VID;
  const { h, place, ramp, ease } = V;
  V.scene({
    bare: true,
    dur: 4,
    build(stage) {
      const mascot = V.mascot("byte", { size: 300, mood: "happy" });
      mascot.style.left = "390px";
      mascot.style.top = "170px";
      const k = h("div", {
        class: "v-kicker",
        text: "Algorithms · Phase 4",
        style: { left: "0", width: "1080px", top: "520px", textAlign: "center", fontSize: "30px" },
      });
      const t = h("div", {
        class: "v-title-line",
        text: "Minimum Spanning Trees",
        style: {
          position: "absolute",
          left: "0",
          width: "1080px",
          top: "578px",
          textAlign: "center",
          whiteSpace: "nowrap",
          fontSize: "80px",
          lineHeight: "1.05",
        },
      });
      const s = h("div", {
        class: "v-text dim",
        text: "The cheapest way to connect everything",
        style: {
          left: "0",
          width: "1080px",
          top: "704px",
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
      stage.append(mascot, k, t, s, pill);
      return (lt) => {
        const m = ramp(lt, 0.1, 0.9, ease.pop);
        place(mascot, { y: (1 - m) * 40, s: 0.6 + 0.4 * m, o: ramp(lt, 0.1, 0.4) });
        place(k, { y: (1 - ramp(lt, 0.5, 0.9)) * 14, o: ramp(lt, 0.5, 0.9) });
        place(t, { y: (1 - ramp(lt, 0.6, 1.1)) * 26, o: ramp(lt, 0.6, 1.1) });
        place(s, { y: (1 - ramp(lt, 0.9, 1.4)) * 18, o: ramp(lt, 0.9, 1.4) });
        place(pill, { s: 0.8 + 0.2 * ramp(lt, 1.2, 1.7, ease.pop), o: ramp(lt, 1.2, 1.5) });
      };
    },
  });
})();
