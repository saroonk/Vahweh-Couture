/* Vahweh Design — shared site script (loaded on every page).
   Product content (cards, hero slides, images) lives in the HTML. This file only handles interaction:
   header search, mobile menu / cart drawers, cart, wishlist, WhatsApp messages, hero rotation and scroll reveal. */
(function () {
  "use strict";

  /* =========================  CONFIGURATION  ========================= */
  const CONFIG = {
    // WhatsApp business number: digits only, with country code, e.g. "919876543210".
    // PLACEHOLDER — leave "" until the real number is available (WhatsApp then opens a chat picker).
    whatsappNumber: "",
    instagramUrl: "",   // e.g. "https://instagram.com/youraccount"
    facebookUrl: "",    // e.g. "https://facebook.com/yourpage"
    currency: "₹",
    maxQty: 10,

    heroInterval: 6500        // hero auto-rotation, ms
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = n => CONFIG.currency + Number(n).toLocaleString("en-IN");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // A product is described by data-* attributes on its card (.product-col) or product block (.pdp-product)
  const readProduct = el => {
    const c = el && el.closest(".product-col, .pdp-product");
    return c ? { id: c.dataset.productId, name: c.dataset.name, price: Number(c.dataset.price), image: c.dataset.image || "" } : null;
  };

  function store(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- WhatsApp ---------- */
  function openWhatsApp(message) {
    const num = String(CONFIG.whatsappNumber).replace(/\D/g, "");
    const url = "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }
  function productMessage(p, o) {
    o = o || {};
    let m = "Hello Vahweh Design,\n\nI'm interested in this product:\n\n" + p.name + "\nReference: " + p.id + "\n";
    if (o.size) m += "Size: " + o.size + "\n";
    if (o.color) m += "Colour: " + o.color + "\n";
    if (o.qty) m += "Quantity: " + o.qty + "\n";
    m += "Price: " + money(p.price) + (o.qty > 1 ? " each" : "") + "\n";
    if (o.url) m += "Link: " + o.url + "\n";
    return m + "\nPlease share availability and help me place the order.";
  }
  /* ---------- Social links ---------- */
  // Placeholder links (empty config URL) are intercepted in the delegated click handler below.
  $$("[data-social]").forEach(a => {
    const url = CONFIG[a.dataset.social + "Url"];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; }
  });

  /* ---------- Search panel (animated with CSS; no [hidden] toggling) ---------- */
  const searchPanel = $("#searchPanel"), searchBtn = $("#searchToggle"), searchInput = $("#searchInput");
  let searchOpen = false;
  function setSearch(open, returnFocus) {
    if (open === searchOpen) return;
    searchOpen = open;
    searchPanel.classList.toggle("open", open);
    searchPanel.setAttribute("aria-hidden", String(!open));
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus({ preventScroll: true });
    else if (returnFocus) searchBtn.focus({ preventScroll: true });
  }

  /* ---------- Drawers / backdrop ---------- */
  const backdrop = $("#backdrop");
  const navDrawer = $("#navDrawer");
  const cartDrawer = $("#cartDrawer");
  const menuBtn = $("#menuOpen");
  let openDrawer = null, lastFocus = null, backdropTimer = 0;

  function focusables(root) {
    return $$("a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])", root).filter(el => el.offsetParent !== null);
  }
  function showDrawer(d) {
    setSearch(false);
    if (openDrawer && openDrawer !== d) hideDrawer(true);
    if (!openDrawer) lastFocus = document.activeElement;
    openDrawer = d;
    clearTimeout(backdropTimer);
    backdrop.hidden = false;
    requestAnimationFrame(() => { backdrop.classList.add("show"); d.classList.add("open"); });
    d.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    menuBtn.setAttribute("aria-expanded", String(d === navDrawer));
    setTimeout(() => { const f = focusables(d)[0]; if (f && openDrawer === d) f.focus(); }, 60);
  }
  function hideDrawer(keepLock) {
    if (!openDrawer) return;
    const d = openDrawer;
    openDrawer = null;
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
    if (keepLock) return;
    backdropTimer = setTimeout(() => { backdrop.hidden = true; }, 380);
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  // One keydown listener for Escape (search, drawers) and the drawer focus trap
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && searchOpen) { setSearch(false, true); return; }
    if (!openDrawer) return;
    if (e.key === "Escape") { hideDrawer(); return; }
    if (e.key === "Tab") {
      const f = focusables(openDrawer);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Close the mobile menu if the viewport grows past the mobile breakpoint
  window.matchMedia("(min-width: 992px)").addEventListener("change", e => { if (e.matches && openDrawer === navDrawer) hideDrawer(); });

  /* ---------- Sticky header (toggle class only when the state changes) ---------- */
  const header = $("#siteHeader");
  let scrolled = false;
  function onScroll() {
    const s = window.scrollY > 40;
    if (s !== scrolled) { scrolled = s; header.classList.toggle("scrolled", s); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Cart ---------- */
  // localStorage "vahweh_cart": [{ key, id, name, price, image, size, color, qty }] — one line per product + size + colour
  let cart = [];
  const lineKey = (id, size, color) => [id, size || "", color || ""].join("|");
  (function restoreCart() {
    const saved = store("vahweh_cart", []);
    (Array.isArray(saved) ? saved : []).forEach(i => {
      const qty = i ? Math.floor(i.qty) : 0;
      if (!i || typeof i.id !== "string" || typeof i.name !== "string" || !(Number(i.price) > 0) || !(qty > 0)) return;   // ignore invalid / outdated lines
      const key = lineKey(i.id, i.size, i.color), line = cart.find(c => c.key === key);
      if (line) line.qty = Math.min(CONFIG.maxQty, line.qty + qty);
      else cart.push({ key: key, id: i.id, name: i.name, price: Number(i.price), image: i.image || "", size: i.size || "", color: i.color || "", qty: Math.min(CONFIG.maxQty, qty) });
    });
  })();
  // Wishlist = array of product ids in localStorage ("vahweh_wishlist"); duplicates are dropped on load
  const savedWish = store("vahweh_wishlist", []);
  let wish = (Array.isArray(savedWish) ? savedWish : []).filter((id, i, a) => typeof id === "string" && a.indexOf(id) === i);
  const wishListeners = [];

  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = () => cart.reduce((n, i) => n + i.qty * i.price, 0);

  function addToCart(p, size, color, qty) {
    qty = qty || 1;
    const key = lineKey(p.id, size, color), line = cart.find(i => i.key === key);
    if (line) line.qty = Math.min(CONFIG.maxQty, line.qty + qty);
    else cart.push({ key: key, id: p.id, name: p.name, price: p.price, image: p.image, size: size || "", color: color || "", qty: Math.min(CONFIG.maxQty, qty) });
    persistCart();
    toast(p.name + " added to your bag");
  }
  function persistCart() { save("vahweh_cart", cart); renderCart(); }

  const thumb = i => '<span class="ph tone-3' + (i.image ? " has-img" : "") + ' thumb">' +
    (i.image ? '<img src="' + esc(i.image) + '" alt="" width="76" height="98" loading="lazy" decoding="async">' : "") + "</span>";

  const cartBody = $("#cartBody"), cartFoot = $("#cartFoot"), cartHeadCount = $("#cartHeadCount"), cartSubtotal = $("#cartSubtotal");
  const cartBadges = $$("[data-cart-count]"), wishBadges = $$("[data-wish-count]");
  function renderCart() {
    const n = cartCount();
    cartBadges.forEach(el => { el.textContent = n; el.hidden = n === 0; });
    cartHeadCount.textContent = n ? "(" + n + ")" : "";
    const body = cartBody, foot = cartFoot;
    if (!cart.length) {
      foot.hidden = true;
      body.innerHTML = '<div class="cart__empty"><svg class="i" aria-hidden="true"><use href="#i-bag"/></svg><h3>Your bag is empty</h3><p>Discover something beautiful and it will appear here.</p><a class="btn-vd btn-vd--dark" href="#new-arrivals" data-close-link>Start Exploring</a></div>';
      return;
    }
    foot.hidden = false;
    body.innerHTML = cart.map(i => {
      const p = i;
      const opts = [i.size && "Size: " + i.size, i.color && "Colour: " + i.color].filter(Boolean).join(" · ");
      return '<div class="cart-item" data-key="' + esc(i.key) + '">' + thumb(i) +
        '<div class="cart-item__info"><h3>' + esc(p.name) + "</h3>" +
        (opts ? '<p class="cart-item__opts">' + esc(opts) + "</p>" : "") +
        '<p class="cart-item__price">' + money(p.price) + "</p>" +
        '<div class="qty qty--sm"><button type="button" data-act="dec" aria-label="Decrease quantity"' + (i.qty <= 1 ? " disabled" : "") + '>−</button><output>' + i.qty + '</output><button type="button" data-act="inc" aria-label="Increase quantity"' + (i.qty >= CONFIG.maxQty ? " disabled" : "") + ">+</button></div></div>" +
        '<div class="cart-item__side"><button type="button" class="cart-item__remove" data-act="rm" aria-label="Remove ' + esc(p.name) + '"><svg class="i" aria-hidden="true"><use href="#i-trash"/></svg></button><strong>' + money(p.price * i.qty) + "</strong></div></div>";
    }).join("");
    cartSubtotal.textContent = money(cartTotal());
  }
  function cartAction(btn) {
    const line = cart.find(i => i.key === btn.closest(".cart-item").dataset.key);
    if (!line) return;
    if (btn.dataset.act === "inc") line.qty = Math.min(CONFIG.maxQty, line.qty + 1);
    if (btn.dataset.act === "dec") line.qty = Math.max(1, line.qty - 1);
    if (btn.dataset.act === "rm") cart = cart.filter(i => i !== line);
    persistCart();
  }
  $("#cartOrder").addEventListener("click", () => {
    if (!cart.length) return;
    let m = "Hello Vahweh Design,\n\nI would like to place an order:\n\n";
    cart.forEach((i, idx) => {
      const p = i;
      m += (idx + 1) + ". " + p.name + "\n";
      if (i.size) m += "   Size: " + i.size + "\n";
      if (i.color) m += "   Colour: " + i.color + "\n";
      m += "   Quantity: " + i.qty + "\n";
      m += "   Price: " + money(p.price) + (i.qty > 1 ? " each" : "") + "\n\n";
    });
    m += "Total: " + money(cartTotal()) + "\n\nPlease assist me with placing this order.";
    openWhatsApp(m); // cart is intentionally NOT cleared: opening WhatsApp does not confirm the order was sent.
  });

  /* ---------- Wishlist ---------- */
  function renderWish() {
    wishBadges.forEach(el => { el.textContent = wish.length; el.hidden = wish.length === 0; });
    $$(".wish-btn").forEach(b => {
      const on = wish.includes(b.dataset.productId);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
      const p = readProduct(b);
      if (p) b.setAttribute("aria-label", (on ? "Remove " : "Add ") + p.name + (on ? " from" : " to") + " wishlist");
      b.querySelector("use").setAttribute("href", on ? "#i-heart-on" : "#i-heart");
    });
  }
  function toggleWish(id) {
    const i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast("Removed from wishlist"); }
    else { wish.push(id); toast("Saved to your wishlist"); }
    save("vahweh_wishlist", wish);
    renderWish();
    wishListeners.forEach(fn => fn());
  }
  // Single delegated click handler for the whole page
  document.addEventListener("click", e => {
    const t = e.target;
    const hit = sel => t.closest(sel);
    // Outside click closes the search; clicks inside the panel or on its toggle are ignored here
    if (searchOpen && !hit("#searchPanel, #searchToggle")) setSearch(false);

    if (hit("#searchToggle")) { setSearch(!searchOpen); return; }
    if (hit("#searchClose")) { setSearch(false, true); return; }
    if (hit("#menuOpen")) { showDrawer(navDrawer); return; }
    if (hit("#cartOpen, [data-open-cart]")) { showDrawer(cartDrawer); return; }
    if (hit("[data-close-drawer], #backdrop, .drawer__nav a, [data-close-link]")) { hideDrawer(); return; }
    const act = hit("#cartBody [data-act]");
    if (act) { cartAction(act); return; }

    const enq = hit("[data-wa-enquiry]");
    if (enq) {
      if (enq.getAttribute("href") !== "#contact") { e.preventDefault(); openWhatsApp("Hello Vahweh Design, I would like to know more about your collections."); }
      return;
    }
    const soc = hit("[data-social]");
    if (soc && !CONFIG[soc.dataset.social + "Url"]) { e.preventDefault(); toast("This link will be available soon."); return; }

    const wishBtn = hit(".wish-btn");
    if (wishBtn) { toggleWish(wishBtn.dataset.productId); return; }
    const add = hit("[data-add]");
    if (add) { addToCart(readProduct(add)); return; }
    const wa = hit("[data-wa]");
    if (wa) openWhatsApp(productMessage(readProduct(wa)));
  });

  /* ---------- Search: the header form (and the one on the results page) is a plain GET form to search-results.html ---------- */
  // JavaScript only tidies the text and stops an empty search from being submitted.
  document.addEventListener("submit", e => {
    const form = e.target.closest("[data-search-form]");
    if (!form) return;
    const input = form.elements.q;
    input.value = input.value.replace(/\s+/g, " ").trim();
    if (!input.value) { e.preventDefault(); toast("Please type something to search for."); input.focus(); }
  });

  /* ---------- Styled dropdown (markup lives in the HTML; used by the sort menus) ---------- */
  function dropdown(dd, onPick) {
    const btn = $(".dd__btn", dd), label = btn.firstElementChild, menu = $(".dd__menu", dd), opts = $$("li", menu);
    let active = 0;
    const isOpen = () => dd.classList.contains("open");
    function setActive(i) {
      active = (i + opts.length) % opts.length;
      opts.forEach((li, k) => li.classList.toggle("is-active", k === active));
      menu.setAttribute("aria-activedescendant", opts[active].id);
    }
    function open() { dd.classList.add("open"); btn.setAttribute("aria-expanded", "true"); setActive(active); menu.focus({ preventScroll: true }); }
    function close(refocus) { if (!isOpen()) return; dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); if (refocus) btn.focus({ preventScroll: true }); }
    function pick(i) { close(true); onPick(opts[i].dataset.value); }
    btn.addEventListener("click", () => (isOpen() ? close(true) : open()));
    btn.addEventListener("keydown", e => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); } });
    menu.addEventListener("keydown", e => {
      const k = e.key;
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); setActive(active + (k === "ArrowDown" ? 1 : -1)); }
      else if (k === "Home" || k === "End") { e.preventDefault(); setActive(k === "Home" ? 0 : opts.length - 1); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); pick(active); }
      else if (k === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (k === "Tab") close();
    });
    menu.addEventListener("click", e => { const li = e.target.closest("li"); if (li) pick(opts.indexOf(li)); });
    menu.addEventListener("pointermove", e => { const li = e.target.closest("li"); if (li) setActive(opts.indexOf(li)); });
    document.addEventListener("click", e => { if (!dd.contains(e.target)) close(); });
    return { select: value => opts.forEach((li, i) => { const on = li.dataset.value === value; li.setAttribute("aria-selected", String(on)); if (on) { active = i; label.textContent = li.textContent; } }) };
  }

  /* ---------- Hero slider ---------- */
  (function hero() {
    if (!$("#hero")) return;
    const wrap = $("#heroSlides"), dotsEl = $("#heroDots"), root = $("#hero");
    const slides = $$(".slide", wrap), dots = $$("button", dotsEl);
    let idx = 0, timer = null, inView = true;

    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle("active", i === idx); s.setAttribute("aria-hidden", String(i !== idx)); $$("a", s).forEach(a => a.tabIndex = i === idx ? 0 : -1); });
      dots.forEach((d, i) => d.setAttribute("aria-selected", String(i === idx)));
    }
    function play() { stop(); if (!reduceMotion && inView && !document.hidden) timer = setInterval(() => go(idx + 1), CONFIG.heroInterval); }
    function stop() { clearInterval(timer); timer = null; }
    go(0); play();

    $("#heroNext").addEventListener("click", () => { go(idx + 1); play(); });
    $("#heroPrev").addEventListener("click", () => { go(idx - 1); play(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); play(); }));
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", play);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : play());
    if ("IntersectionObserver" in window) new IntersectionObserver(en => { inView = en[0].isIntersecting; inView ? play() : stop(); }).observe(root);

    let x0 = null, y0 = null;
    root.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; stop(); }, { passive: true });
    root.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? idx + 1 : idx - 1);
      x0 = null; play();
    }, { passive: true });
    root.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { go(idx + 1); play(); }
      if (e.key === "ArrowLeft") { go(idx - 1); play(); }
    });
  })();

  /* ---------- Scroll reveal ---------- */
  let revealIO = null;
  function initReveal() {
    const items = $$(".reveal:not(.in)");
    if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("in")); return; }
    revealIO = revealIO || new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(i => revealIO.observe(i));
  }

  /* ---------- Init ---------- */
  // Coming back to a page from the browser's back/forward cache: re-read cart and wishlist from storage
  window.addEventListener("pageshow", e => { if (e.persisted) location.reload(); });
  renderCart();
  renderWish();
  initReveal();

  // Shared pieces used by listing.js, product-detail.js and wishlist.js
  window.Vahweh = {
    maxQty: CONFIG.maxQty, esc: esc, money: money, readProduct: readProduct, addToCart: addToCart, openWhatsApp: openWhatsApp, productMessage: productMessage,
    toast: toast, renderWish: renderWish, initReveal: initReveal, showDrawer: showDrawer, hideDrawer: hideDrawer, reduceMotion: reduceMotion,
    isDrawerOpen: d => openDrawer === d,
    getWishlist: () => wish.slice(), onWishChange: fn => { wishListeners.push(fn); },
    pruneWishlist: valid => { wish = wish.filter(id => valid.includes(id)); save("vahweh_wishlist", wish); renderWish(); },
    dropdown: dropdown
  };
})();
