/* Vahweh Design — Coming Soon */
(function () {
  "use strict";

  /* ---- Gold particles (few, slow, skipped for reduced motion) ---- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = document.getElementById("particles");
  if (wrap && !reduce) {
    const count = window.innerWidth < 576 ? 10 : 18;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 3 + Math.random() * 5;
      p.className = "particle";
      p.style.width = p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.setProperty("--x", (Math.random() * 80 - 40) + "px");
      p.style.setProperty("--o", (0.25 + Math.random() * 0.4).toFixed(2));
      p.style.animationDuration = (16 + Math.random() * 18) + "s";
      p.style.animationDelay = (-Math.random() * 30) + "s";
      frag.appendChild(p);
    }
    wrap.appendChild(frag);
  }
})();
