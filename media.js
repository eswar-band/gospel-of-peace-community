(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const grid = $("#mediaGrid");
  const count = $("#mediaCount");
  const empty = $("#mediaEmpty");
  const search = $("#mediaSearch");
  const platform = $("#platformFilter");
  const category = $("#categoryFilter");
  const sort = $("#sortOrder");
  const dialog = $("#videoDialog");
  const frame = $("#videoFrame");
  const dialogTitle = $("#videoDialogTitle");
  const closeVideo = $("#closeVideo");
  const items = Array.isArray(window.MEDIA_ITEMS) ? window.MEDIA_ITEMS : [];

  const formatDate = value => new Intl.DateTimeFormat("en", {day:"numeric",month:"short",year:"numeric"}).format(new Date(value + "T12:00:00"));
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    let filtered = items.filter(item => {
      const matchesText = !term || [item.title,item.description,item.category,item.platform].join(" ").toLocaleLowerCase().includes(term);
      const matchesPlatform = platform.value === "all" || item.platform === platform.value;
      const matchesCategory = category.value === "all" || item.category === category.value;
      return matchesText && matchesPlatform && matchesCategory;
    });
    filtered.sort((a,b) => sort.value === "title" ? a.title.localeCompare(b.title) : sort.value === "oldest" ? a.publishedAt.localeCompare(b.publishedAt) : b.publishedAt.localeCompare(a.publishedAt));

    grid.replaceChildren();
    filtered.forEach(item => {
      const card = make("article","library-card");
      card.tabIndex = 0;
      card.setAttribute("role","button");
      card.setAttribute("aria-label","Play video: " + item.title);
      const art = make("div","library-art library-art--" + item.art);
      const thumbnailUrl = item.thumbnail || (item.platform === "YouTube" && item.videoId
        ? "https://i.ytimg.com/vi/" + encodeURIComponent(item.videoId) + "/hqdefault.jpg"
        : "");
      if (thumbnailUrl) {
        const thumbnail = make("img","library-thumbnail");
        thumbnail.src = thumbnailUrl;
        thumbnail.alt = "";
        thumbnail.loading = "lazy";
        thumbnail.decoding = "async";
        thumbnail.addEventListener("error",() => thumbnail.remove(),{once:true});
        art.append(thumbnail);
      }
      const platformTag = make("span","library-platform",item.platform);
      const icon = make("span","library-art-icon","▶");
      icon.setAttribute("aria-hidden","true");
      const duration = make("span","library-duration",item.duration);
      art.append(platformTag,icon,duration);

      const body = make("div","library-card-body");
      const meta = make("div","library-meta");
      meta.append(make("span","",item.category),make("span","",formatDate(item.publishedAt)));
      const title = make("h3","",item.title);
      const description = make("p","",item.description);
      const watch = make("span","library-watch","▶  Play video");
      watch.setAttribute("aria-hidden","true");
      body.append(meta,title,description,watch);
      card.append(art,body);
      const play = () => openVideo(item);
      card.addEventListener("click",play);
      card.addEventListener("keydown",event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
      grid.append(card);
    });

    count.textContent = filtered.length + (filtered.length === 1 ? " item" : " items") + " found";
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
    grid.setAttribute("aria-busy","false");
  }

  function openVideo(item) {
    dialogTitle.textContent = item.title;
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(item.videoId) + "?autoplay=1&rel=0";
    iframe.title = item.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else window.open(iframe.src,"_blank","noopener");
  }

  function clearFilters() {
    search.value = "";
    platform.value = "all";
    category.value = "all";
    sort.value = "newest";
    render();
    search.focus();
  }

  [search,platform,category,sort].forEach(control => control.addEventListener(control === search ? "input" : "change",render));
  $("#clearFilters").addEventListener("click",clearFilters);
  $("#emptyClear").addEventListener("click",clearFilters);
  closeVideo.addEventListener("click",() => dialog.close());
  dialog.addEventListener("click",event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close",() => frame.replaceChildren());

  const themeToggle = $("#themeToggle");
  const themeKey = "gospel-peace-theme";
  const legacyThemeKey = "modern-church-theme";
  const themePreference = window.matchMedia?.("(prefers-color-scheme: dark)");
  function savedTheme() {
    try { return localStorage.getItem(themeKey) || localStorage.getItem(legacyThemeKey); }
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
  const stored = savedTheme();
  applyTheme(stored || (themePreference?.matches ? "dark" : "light"));
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
