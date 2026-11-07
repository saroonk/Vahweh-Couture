/* Vahweh Design — product detail page (product-detail.html).
   Every product's full page content is already HTML: one <article class="pdp-product" data-product-id="…"> per product.
   This script keeps the article matching ?id= (and removes the others), then adds the interaction:
   gallery + zoom, colour / size / quantity, Add to Cart, WhatsApp, tabs and the related-products row (cards copied from #productCatalog). */
(function () {
  "use strict";
  const V = window.Vahweh;
  if (!V) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const id = new URLSearchParams(location.search).get("id");
  const blocks = $$(".pdp-product");
  const root = blocks.find(b => b.dataset.productId === id);
  blocks.forEach(b => { if (b !== root) b.remove(); });
  if (!root) {
    document.title = "Product not found | Vahweh Design";
    $("#pdpMissing").hidden = false;
    return;
  }
  root.hidden = false;

  const p = V.readProduct(root);
  document.title = p.name + " | Vahweh Design";
  const meta = $('meta[name="description"]');
  if (meta) meta.content = p.name + " — " + root.dataset.description;

  /* ---------- Gallery: thumbnails, fade, zoom ---------- */
  const box = $(".pdp-zoom", root), img = $("img", box), thumbs = $$(".pdp-thumb", root);
  img.loading = "eager"; img.fetchPriority = "high";                       // the visible product photo is not lazy-loaded

  function showImage(thumb) {
    thumbs.forEach(t => { const on = t === thumb; t.classList.toggle("is-active", on); on ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"); });
    zoomOut();
    img.classList.add("is-fading");
    const next = new Image();
    next.onload = next.onerror = () => { img.src = thumb.dataset.src; img.alt = thumb.dataset.alt; img.classList.remove("is-fading"); };
    next.src = thumb.dataset.src;
  }
  root.addEventListener("click", e => { const t = e.target.closest(".pdp-thumb"); if (t) showImage(t); });

  // Zoom: mouse hover follows the cursor; touch / keyboard toggles it (and a finger drag pans while zoomed)
  let raf = 0, lastType = "mouse";
  function origin(x, y) {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = box.getBoundingClientRect();
      img.style.transformOrigin = Math.min(100, Math.max(0, (x - r.left) / r.width * 100)) + "% " + Math.min(100, Math.max(0, (y - r.top) / r.height * 100)) + "%";
    });
  }
  function zoomIn(x, y) { box.classList.add("is-zoom"); origin(x, y); }
  function zoomOut() { box.classList.remove("is-zoom"); img.style.transformOrigin = ""; }
  box.addEventListener("pointerdown", e => { lastType = e.pointerType; });
  box.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") zoomIn(e.clientX, e.clientY); });
  box.addEventListener("pointermove", e => { if (box.classList.contains("is-zoom")) origin(e.clientX, e.clientY); });
  box.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") zoomOut(); });
  box.addEventListener("click", e => {
    if (lastType === "mouse") return;                      // hover already handles mouse users
    box.classList.contains("is-zoom") ? zoomOut() : zoomIn(e.clientX, e.clientY);
  });
  box.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const r = box.getBoundingClientRect(); box.classList.contains("is-zoom") ? zoomOut() : zoomIn(r.left + r.width / 2, r.top + r.height / 2); }
    else if (e.key === "Escape") zoomOut();
  });

  /* ---------- Colour, size, quantity (state is read from the buttons in the HTML) ---------- */
  const swatches = $$(".swatch", root), chips = $$(".chip", root);
  const sizeGroup = $("[data-size-group]", root), errEl = $(".pdp__error", root), qtyEl = $(".pdp-qty", root);
  let qty = 1;
  const selected = list => list.find(b => b.classList.contains("is-active"));
  const color = () => { const s = selected(swatches); return s ? s.dataset.color : ""; };
  const size = () => { const s = selected(chips); return s ? s.dataset.size : ""; };

  function choose(list, btn) {
    list.forEach(b => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
  }
  root.addEventListener("click", e => {
    const sw = e.target.closest(".swatch");
    if (sw) { choose(swatches, sw); $(".pdp-color-name", root).textContent = sw.dataset.color; return; }
    const ch = e.target.closest(".chip");
    if (ch && !ch.disabled) { choose(chips, ch); errEl.hidden = true; return; }
    if (e.target.closest(".pdp-minus")) { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; }
    else if (e.target.closest(".pdp-plus")) { qty = Math.min(V.maxQty, qty + 1); qtyEl.textContent = qty; }
  });

  /* ---------- Purchase actions ---------- */
  function ready() {
    if (sizeGroup && !size()) {
      errEl.hidden = false;
      sizeGroup.classList.remove("is-error"); void sizeGroup.offsetWidth; sizeGroup.classList.add("is-error");
      const first = chips.find(c => !c.disabled);
      if (first) first.focus();
      return false;
    }
    return true;
  }
  $(".pdp-add", root).addEventListener("click", () => { if (ready()) V.addToCart(p, size(), color(), qty); });
  $(".pdp-wa", root).addEventListener("click", () => {
    if (ready()) V.openWhatsApp(V.productMessage(p, { size: size(), color: color(), qty: qty, url: location.href.split("#")[0] }));
  });

  /* ---------- Wishlist (the heart is handled by the shared .wish-btn logic in js/home.js) ---------- */
  const wishText = $(".pdp-wish__text", root);
  const syncWishText = () => { wishText.textContent = V.getWishlist().includes(p.id) ? "Saved to Wishlist" : "Add to Wishlist"; };
  V.onWishChange(syncWishText);

  /* ---------- Tabs ---------- */
  const tabs = $$('[role="tab"]', root);
  function selectTab(t, focus) {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) t.focus();
  }
  const tablist = $(".tabs", root);
  tablist.addEventListener("click", e => { const t = e.target.closest('[role="tab"]'); if (t) selectTab(t); });
  tablist.addEventListener("keydown", e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const to = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (to !== null) { e.preventDefault(); selectTab(tabs[(to + tabs.length) % tabs.length], true); }
  });

  /* ---------- Related products: copy the matching cards that are already in the page ---------- */
  const catalog = $("#productCatalog").content;
  const relatedGrid = $(".pdp-related-grid", root);
  root.dataset.related.split(/\s+/).forEach(rid => {
    const card = catalog.querySelector('.product-col[data-product-id="' + rid + '"]');
    if (card && rid !== p.id) relatedGrid.appendChild(card.cloneNode(true));
  });

  V.renderWish();
  syncWishText();
  V.initReveal();
})();
