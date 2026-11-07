/* Vahweh Design — wishlist page.
   The wishlist itself (localStorage "vahweh_wishlist", the heart buttons, the header counts) lives in js/home.js.
   Every product card is already in this page's HTML (inside <template id="wishlistCatalog">); this file copies the saved ones
   into the grid and removes a card again when its heart is toggled. */
(function () {
  "use strict";
  const V = window.Vahweh;
  if (!V) return;

  const grid = document.getElementById("wishlistGrid");
  const empty = document.getElementById("wlEmpty");
  const count = document.getElementById("wlCount");
  const catalog = document.getElementById("wishlistCatalog").content;

  const setCount = n => { count.textContent = n ? "(" + n + (n === 1 ? " Item" : " Items") + ")" : ""; };
  function showEmpty() {
    grid.hidden = true; grid.replaceChildren(); empty.hidden = false; setCount(0);
  }

  // Saved ids that no longer match a product are dropped
  const cards = Array.from(catalog.querySelectorAll(".product-col"));
  V.pruneWishlist(cards.map(c => c.dataset.productId));

  // Most recently saved first
  const saved = V.getWishlist().reverse();
  if (!saved.length) showEmpty();
  else {
    saved.forEach(id => { const card = cards.find(c => c.dataset.productId === id); if (card) grid.appendChild(card.cloneNode(true)); });
    grid.hidden = false; empty.hidden = true;
    setCount(saved.length);
    V.renderWish();
    V.initReveal();
  }

  // A heart toggled on this page removes that card (the cart is not touched)
  V.onWishChange(() => {
    const keep = new Set(V.getWishlist());
    grid.querySelectorAll(".product-col").forEach(col => {
      if (keep.has(col.dataset.productId) || col.classList.contains("is-leaving")) return;
      col.classList.add("is-leaving");
      setTimeout(() => { col.remove(); if (!grid.children.length) showEmpty(); }, V.reduceMotion ? 0 : 300);
    });
    setCount(keep.size);
  });
})();
