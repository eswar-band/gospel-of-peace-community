(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const grid = $("#galleryGrid");
  const count = $("#galleryCount");
  const empty = $("#galleryEmpty");
  const search = $("#gallerySearch");
  const monthFilter = $("#galleryMonth");
  const yearFilter = $("#galleryYear");
  const categoryFilter = $("#galleryCategory");
  const sort = $("#gallerySort");
  const dialog = $("#galleryDialog");
  const dialogImage = $("#galleryDialogImage");
  const items = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
  const monthName = value => new Intl.DateTimeFormat("en", {month:"long"}).format(new Date("2026-" + value + "-01T12:00:00"));
  const dateLabel = value => new Intl.DateTimeFormat("en", {day:"numeric",month:"long",year:"numeric"}).format(new Date(value + "T12:00:00"));
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function populateFilters() {
    const validDates = items.filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item.date || ""));
    const months = [...new Set(validDates.map(item => item.date.slice(5,7)))].sort();
    const years = [...new Set(validDates.map(item => item.date.slice(0,4)))].sort((a,b) => b.localeCompare(a));
    const categories = [...new Set(items.map(item => item.category))].sort((a,b) => a.localeCompare(b));
    months.forEach(value => monthFilter.add(new Option(monthName(value), value)));
    years.forEach(value => yearFilter.add(new Option(value, value)));
    categories.forEach(value => categoryFilter.add(new Option(value, value)));
  }

  function openGalleryItem(item) {
    $("#galleryDialogCategory").textContent = item.category;
    $("#galleryDialogTitle").textContent = item.title;
    dialogImage.src = item.image;
    dialogImage.alt = item.alt;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(item.date || "") ? dateLabel(item.date) : item.date;
    $("#galleryDialogCaption").textContent = item.description + " · " + date;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else window.open(item.image, "_blank", "noopener");
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const filtered = items.filter(item => {
      const searchable = [item.title,item.category,item.description,item.alt].join(" ").toLocaleLowerCase();
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(item.date || "");
      const matchesText = !term || searchable.includes(term);
      const matchesMonth = monthFilter.value === "all" || (validDate && item.date.slice(5,7) === monthFilter.value);
      const matchesYear = yearFilter.value === "all" || (validDate && item.date.slice(0,4) === yearFilter.value);
      const matchesCategory = categoryFilter.value === "all" || item.category === categoryFilter.value;
      return matchesText && matchesMonth && matchesYear && matchesCategory;
    }).sort((a,b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      return sort.value === "title" ? a.title.localeCompare(b.title) : sort.value === "oldest" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    });

    grid.replaceChildren();
    filtered.forEach(item => {
      const card = make("button","gallery-card");
      card.type = "button";
      card.setAttribute("aria-label","View photo: " + item.title);
      const img = make("img");
      img.src = item.image;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error",() => {
        img.remove();
        card.style.background = "linear-gradient(135deg,#6b879d,#1b304b)";
      },{once:true});
      const copy = make("span","gallery-card-copy");
      copy.append(make("small","",item.category),make("strong","",item.title),make("span","",item.description));
      card.append(img,copy);
      card.addEventListener("click",() => openGalleryItem(item));
      grid.append(card);
    });

    count.textContent = filtered.length + (filtered.length === 1 ? " moment" : " moments") + " found";
    $("#galleryResultsLabel").textContent = filtered.length ? "Browse community moments" : "No matching moments";
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
  $("#clearGallery").addEventListener("click",clearFilters);
  $("#clearGalleryEmpty").addEventListener("click",clearFilters);
  $("#closeGalleryDialog").addEventListener("click",() => dialog.close());
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