/* Vahweh Design — Dresses listing page: filtering, sorting and pagination.
   The product cards are plain HTML inside #productGrid. This script only reads their data-* attributes
   (data-category, data-price, data-old-price, data-added, data-name), then shows, hides and reorders the cards. */
(function () {
  "use strict";
  const V = window.Vahweh;
  if (!V) return;

  const PAGE_SIZE = 8;   // products per page
  const SORTS = {
    featured: null,      // the order the cards have in the HTML
    newest: (a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "name-asc": (a, b) => a.name.localeCompare(b.name)
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = V.esc;
  const grid = $("#productGrid");
  const el = {
    count: $("#resultCount"), pager: $("#pager"), empty: $("#emptyState"), chips: $("#activeFilters"), panel: $("#filters"),
    badge: $("#filterBadge"), apply: $("#filterApply"), sale: $("#fSale")
  };

  /* ---------- Index of the cards already in the page ---------- */
  const items = $$(".product-col", grid).map((node, i) => ({
    node: node, order: i, name: node.dataset.name, category: node.dataset.category,
    price: Number(node.dataset.price), old: Number(node.dataset.oldPrice) || 0, added: node.dataset.added
  }));
  const onSale = p => p.old > p.price;

  // Filter options are checkboxes in the HTML
  const catInputs = $$('input[data-f="cat"]'), priceInputs = $$('input[data-f="price"]');
  const bands = priceInputs.map(i => ({ min: Number(i.dataset.min), max: i.dataset.max ? Number(i.dataset.max) : Infinity, label: i.nextElementSibling.textContent }));
  const inBand = (p, i) => p.price >= bands[i].min && p.price < bands[i].max;

  /* ---------- State (kept in the URL so links and reloads keep the selection) ---------- */
  const state = { cats: new Set(), prices: new Set(), sale: false, sort: "featured", page: 1 };

  function readURL() {
    const u = new URLSearchParams(location.search);
    const known = catInputs.map(i => i.value);
    (u.get("category") || "").split(",").forEach(c => { if (known.includes(c)) state.cats.add(c); });
    (u.get("price") || "").split(",").forEach(i => { if (bands[+i] && i !== "") state.prices.add(+i); });
    state.sale = u.get("sale") === "1";
    if (SORTS.hasOwnProperty(u.get("sort"))) state.sort = u.get("sort");
    state.page = Math.max(1, parseInt(u.get("page"), 10) || 1);
  }
  function writeURL() {
    const u = new URLSearchParams();
    if (state.cats.size) u.set("category", Array.from(state.cats).join(","));
    if (state.prices.size) u.set("price", Array.from(state.prices).join(","));
    if (state.sale) u.set("sale", "1");
    if (state.sort !== "featured") u.set("sort", state.sort);
    if (state.page > 1) u.set("page", state.page);
    const qs = u.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) { /* e.g. file:// previews */ }
  }

  /* ---------- Filtering / sorting ---------- */
  // `skip` leaves one filter out so each option can show how many pieces it would add.
  function matches(p, skip) {
    return (skip === "cat" || !state.cats.size || state.cats.has(p.category)) &&
      (skip === "price" || !state.prices.size || Array.from(state.prices).some(i => inBand(p, i))) &&
      (skip === "sale" || !state.sale || onSale(p));
  }
  function view() {
    const list = items.filter(p => matches(p));
    return list.sort(SORTS[state.sort] || ((a, b) => a.order - b.order));
  }
  const countWhere = (skip, test) => items.filter(p => matches(p, skip) && test(p)).length;

  /* ---------- Filter panel ---------- */
  function setCount(input, n, selected) {
    input.nextElementSibling.nextElementSibling.textContent = n;
    input.disabled = n === 0 && !selected;            // nothing to gain from an option that matches no pieces
    input.closest(".check").classList.toggle("is-disabled", input.disabled);
  }
  function syncFilters() {
    catInputs.forEach(i => { i.checked = state.cats.has(i.value); setCount(i, countWhere("cat", p => p.category === i.value), i.checked); });
    priceInputs.forEach((i, k) => { i.checked = state.prices.has(k); setCount(i, countWhere("price", p => inBand(p, k)), i.checked); });
    el.sale.checked = state.sale;
    setCount(el.sale, countWhere("sale", onSale), state.sale);
  }
  function renderChips() {
    const chips = [];
    state.cats.forEach(c => chips.push(["cat:" + c, c]));
    state.prices.forEach(i => chips.push(["price:" + i, bands[i].label]));
    if (state.sale) chips.push(["sale", "On offer"]);
    el.chips.hidden = !chips.length;
    el.chips.innerHTML = chips.length
      ? chips.map(([k, label]) => '<button type="button" class="chip-f" data-remove="' + esc(k) + '" aria-label="Remove filter ' + esc(label) + '">' + esc(label) +
        ' <svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button>').join("") +
        '<button type="button" class="chip-f chip-f--clear" data-clear-filters>Clear all</button>'
      : "";
    const n = state.cats.size + state.prices.size + (state.sale ? 1 : 0);
    el.badge.textContent = n;
    el.badge.hidden = n === 0;
  }

  /* ---------- Pagination ---------- */
  function pageNumbers(cur, total) {
    const nums = Array.from(new Set([1, total, cur - 1, cur, cur + 1])).filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push("…"); out.push(n); });
    return out;
  }
  function renderPager(pages) {
    el.pager.hidden = pages <= 1;
    if (pages <= 1) { el.pager.innerHTML = ""; return; }
    const cur = state.page;
    el.pager.innerHTML =
      '<button type="button" class="pager__btn" data-page="' + (cur - 1) + '"' + (cur === 1 ? " disabled" : "") + ' aria-label="Previous page"><svg class="i" aria-hidden="true"><use href="#i-prev"/></svg><span>Previous</span></button>' +
      '<div class="pager__nums">' + pageNumbers(cur, pages).map(n => n === "…"
        ? '<span class="pager__gap" aria-hidden="true">…</span>'
        : '<button type="button" class="pager__num' + (n === cur ? " is-active" : "") + '" data-page="' + n + '"' + (n === cur ? ' aria-current="page"' : "") + ' aria-label="Page ' + n + '">' + n + "</button>").join("") + "</div>" +
      '<button type="button" class="pager__btn" data-page="' + (cur + 1) + '"' + (cur === pages ? " disabled" : "") + ' aria-label="Next page"><span>Next</span><svg class="i" aria-hidden="true"><use href="#i-next"/></svg></button>';
  }

  /* ---------- Render: reorder + show / hide the existing cards ---------- */
  function render() {
    const list = view();
    const total = list.length, pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PAGE_SIZE, shown = list.slice(start, start + PAGE_SIZE);

    const visible = new Set(shown);
    list.forEach(p => grid.appendChild(p.node));                                // matching cards, in sorted order…
    items.forEach(p => { if (!list.includes(p)) grid.appendChild(p.node); });   // …then the ones that do not match
    items.forEach(p => { p.node.hidden = !visible.has(p); });

    el.empty.hidden = total > 0;
    el.count.textContent = total
      ? (pages > 1 ? "Showing " + (start + 1) + "–" + (start + shown.length) + " of " + total : total) + " piece" + (total === 1 && pages <= 1 ? "" : "s")
      : "0 pieces";
    el.apply.textContent = total ? "Show " + total + " piece" + (total === 1 ? "" : "s") : "No pieces found";
    syncSortUI();
    syncFilters();
    renderChips();
    renderPager(pages);
    V.initReveal();
    writeURL();
    return total;
  }
  const update = resetPage => { if (resetPage) state.page = 1; return render(); };

  /* ---------- Filter events ---------- */
  el.panel.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.f === "cat") t.checked ? state.cats.add(t.value) : state.cats.delete(t.value);
    else if (t.dataset.f === "price") { const i = priceInputs.indexOf(t); t.checked ? state.prices.add(i) : state.prices.delete(i); }
    else if (t === el.sale) state.sale = t.checked;
    else return;
    update(true);
  });

  /* ---------- Sort dropdown (markup is in the HTML; js/home.js provides the behaviour) ---------- */
  const sortMenu = V.dropdown($("#sortDd"), value => { if (value !== state.sort) { state.sort = value; update(true); } });
  const syncSortUI = () => sortMenu.select(state.sort);

  /* ---------- Clear / chips / pager / filter drawer (one delegated click handler) ---------- */
  function clearAll() {
    state.cats.clear(); state.prices.clear(); state.sale = false;
    update(true);
  }
  document.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("#filterOpen")) { V.showDrawer(el.panel); return; }
    if (t.closest("[data-clear-filters]")) { clearAll(); return; }
    const rm = t.closest("[data-remove]");
    if (rm) {
      const [kind, val] = rm.dataset.remove.split(/:(.*)/s);
      if (kind === "cat") state.cats.delete(val);
      else if (kind === "price") state.prices.delete(+val);
      else if (kind === "sale") state.sale = false;
      update(true);
      return;
    }
    const pg = t.closest("[data-page]");
    if (pg && !pg.disabled) {
      state.page = +pg.dataset.page;
      render();
      $(".listing__bar").scrollIntoView({ behavior: V.reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });

  // Sidebar on desktop, drawer below 992px
  const desktop = window.matchMedia("(min-width: 992px)");
  function syncPanel() {
    if (desktop.matches) { if (V.isDrawerOpen(el.panel)) V.hideDrawer(); el.panel.removeAttribute("aria-hidden"); }
    else if (!V.isDrawerOpen(el.panel)) el.panel.setAttribute("aria-hidden", "true");
  }
  desktop.addEventListener("change", syncPanel);

  /* ---------- Init ---------- */
  readURL();
  syncPanel();
  render();
})();
