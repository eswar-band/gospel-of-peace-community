(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const grid = $("#testimoniesGrid");
  const count = $("#testimoniesCount");
  const empty = $("#testimoniesEmpty");
  const search = $("#testimonySearch");
  const monthFilter = $("#monthFilter");
  const yearFilter = $("#yearFilter");
  const categoryFilter = $("#storyCategoryFilter");
  const sort = $("#storySort");
  const dialog = $("#testimonyDialog");
  const items = Array.isArray(window.TESTIMONIES) ? window.TESTIMONIES : [];
  const monthName = value => new Intl.DateTimeFormat("en", {month:"long"}).format(new Date(value + "-01T12:00:00"));
  const dateLabel = value => new Intl.DateTimeFormat("en", {day:"numeric",month:"long",year:"numeric"}).format(new Date(value + "T12:00:00"));
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function populateFilters() {
    const months = [...new Set(items.map(item => item.publishedAt.slice(5, 7)))].sort();
    const years = [...new Set(items.map(item => item.publishedAt.slice(0, 4)))].sort((a,b) => b.localeCompare(a));
    const categories = [...new Set(items.map(item => item.category))].sort((a,b) => a.localeCompare(b));
    months.forEach(value => monthFilter.add(new Option(monthName("2026-" + value), value)));
    years.forEach(value => yearFilter.add(new Option(value, value)));
    categories.forEach(value => categoryFilter.add(new Option(value, value)));
  }

  function openStory(item) {
    $("#dialogStoryMeta").textContent = item.category + " · " + dateLabel(item.publishedAt);
    $("#dialogStoryTitle").textContent = item.title;
    $("#dialogStoryQuote").textContent = "“" + item.quote + "”";
    $("#dialogStoryBody").textContent = item.story;
    $("#dialogStoryAuthor").textContent = "Shared by " + item.author;
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const filtered = items.filter(item => {
      const searchable = [item.title,item.excerpt,item.quote,item.story,item.category,item.author].join(" ").toLocaleLowerCase();
      const matchesText = !term || searchable.includes(term);
      const matchesMonth = monthFilter.value === "all" || item.publishedAt.slice(5,7) === monthFilter.value;
      const matchesYear = yearFilter.value === "all" || item.publishedAt.slice(0,4) === yearFilter.value;
      const matchesCategory = categoryFilter.value === "all" || item.category === categoryFilter.value;
      return matchesText && matchesMonth && matchesYear && matchesCategory;
    }).sort((a,b) => sort.value === "title" ? a.title.localeCompare(b.title) : sort.value === "oldest" ? a.publishedAt.localeCompare(b.publishedAt) : b.publishedAt.localeCompare(a.publishedAt));

    grid.replaceChildren();
    filtered.forEach(item => {
      const card = make("article","testimony-card");
      const top = make("div","testimony-card-top");
      top.append(make("span","testimony-category",item.category),make("time","testimony-date",dateLabel(item.publishedAt)));
      const quoteMark = make("div","testimony-quote-mark","“");
      quoteMark.setAttribute("aria-hidden","true");
      const title = make("h3","",item.title);
      const excerpt = make("p","",item.excerpt);
      const bottom = make("div","testimony-card-bottom");
      bottom.append(make("span","testimony-author",item.author));
      const read = make("button","testimony-read","Read story ↗");
      read.type = "button";
      read.setAttribute("aria-label","Read full testimony: " + item.title);
      read.addEventListener("click",() => openStory(item));
      bottom.append(read);
      card.append(top,quoteMark,title,excerpt,bottom);
      grid.append(card);
    });
    count.textContent = filtered.length + (filtered.length === 1 ? " story" : " stories") + " found";
    $("#testimoniesResultsLabel").textContent = filtered.length ? "Browse community stories" : "No matching stories";
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
    grid.setAttribute("aria-busy","false");
  }

  function clearFilters() {
    search.value = "";
    monthFilter.value = "all";
    yearFilter.value = "all";
    categoryFilter.value = "all";
    sort.value = "newest";
    render();
    search.focus();
  }

  populateFilters();
  [search,monthFilter,yearFilter,categoryFilter,sort].forEach(control => control.addEventListener(control === search ? "input" : "change",render));
  $("#clearTestimonyFilters").addEventListener("click",clearFilters);
  $("#clearEmptyFilters").addEventListener("click",clearFilters);
  $("#closeTestimony").addEventListener("click",() => dialog.close());
  dialog.addEventListener("click",event => { if (event.target === dialog) dialog.close(); });

  const themeToggle = $("#themeToggle");
  const themeKey = "gospel-peace-theme";
  const themePreference = window.matchMedia?.("(prefers-color-scheme: dark)");
  function savedTheme() {
    try { return localStorage.getItem(themeKey) || localStorage.getItem("modern-church-theme"); }
    catch { return null; }
  }
  function applyTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeToggle.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
    themeToggle.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";
    themeToggle.setAttribute("aria-label","Switch to " + (dark ? "light" : "dark") + " mode");
    themeToggle.setAttribute("aria-pressed",String(dark));
    $('meta[name="theme-color"]').content = dark ? "#0c1422" : "#f5f3ee";
  }
  applyTheme(savedTheme() || (themePreference?.matches ? "dark" : "light"));
  themeToggle.addEventListener("click",() => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(themeKey,next); } catch {}
    applyTheme(next);
  });
  themePreference?.addEventListener?.("change",event => { if (!savedTheme()) applyTheme(event.matches ? "dark" : "light"); });

  const menuToggle = $("#menuToggle");
  const nav = $("#mainNav");
  menuToggle.addEventListener("click",() => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded",String(open));
    menuToggle.setAttribute("aria-label",open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click",() => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
    menuToggle.setAttribute("aria-label","Open navigation");
  }));

  render();
})();
