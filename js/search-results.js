/* Vahweh Design — search results page.
   The query arrives as ?q=… from the header search (a plain GET form). All product cards are already in this page's HTML
   (hidden); this script shows the ones that match, sorts them, and fills in the heading and count. It builds no product markup.
   Matching: every word typed must appear (case-insensitive) in the card's name, category, or data-keywords
   (description, fabric, fit, pattern, colours). In Django this is replaced by a backend query + template loop. */
(function () {
  "use strict";
  const V = window.Vahweh;
  if (!V) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const grid = $("#searchGrid");
  const cards = Array.from(grid.querySelectorAll(".product-col"));

  // URLSearchParams already decodes "+" and %XX; collapse spaces and trim
  const query = (new URLSearchParams(location.search).get("q") || "").replace(/\s+/g, " ").trim();
  const terms = query.toLowerCase().split(" ").filter(Boolean);

  // Show the query in both search fields (header + page) and the heading (as text, never as HTML)
  [$("#searchInput"), $("#srInput")].forEach(i => { if (i) i.value = query; });

  if (!terms.length) {
    document.title = "Search | Vahweh Design";
    $("#srPrompt").hidden = false;
    grid.hidden = true;
    return;
  }

  document.title = "Search results for “" + query + "” | Vahweh Design";
  $("#srTerm").textContent = query;
  $("#srQuery").hidden = false;

  /* ---------- Matching ---------- */
  const text = c => (c.dataset.name + " " + c.dataset.category + " " + (c.dataset.keywords || "")).toLowerCase();
  const nameHit = c => terms.every(t => c.dataset.name.toLowerCase().includes(t));
  const items = cards.map((node, i) => ({
    node: node, order: i, hit: terms.every(t => text(node).includes(t)), inName: nameHit(node),
    price: Number(node.dataset.price), added: node.dataset.added
  }));
  const found = items.filter(p => p.hit);

  /* ---------- Sorting ---------- */
  const SORTS = {
    match: (a, b) => (b.inName - a.inName) || (a.order - b.order),     // name matches first, then the page order
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    newest: (a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0)
  };
  function show(sort) {
    found.sort(SORTS[sort]).forEach(p => { p.node.hidden = false; grid.appendChild(p.node); });
    V.initReveal();
  }

  $("#srCount").textContent = found.length + (found.length === 1 ? " product found" : " products found");
  if (!found.length) {
    grid.hidden = true;
    $("#srEmpty").hidden = false;
    return;
  }
  $("#srBar").hidden = false;
  const sortMenu = V.dropdown($("#sortDd"), value => { sortMenu.select(value); show(value); });
  sortMenu.select("match");
  show("match");
})();
