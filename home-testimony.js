(() => {
  const dialog = document.getElementById("homeTestimonyDialog");
  if (!dialog || !Array.isArray(window.TESTIMONIES)) return;
  const items = window.TESTIMONIES;
  const byId = new Map(items.map(item => [item.id, item]));
  const formatDate = value => new Intl.DateTimeFormat("en", {day:"numeric",month:"long",year:"numeric"}).format(new Date(value + "T12:00:00"));
  const openStory = item => {
    document.getElementById("homeTestimonyMeta").textContent = item.category + " · " + formatDate(item.publishedAt);
    document.getElementById("homeTestimonyTitle").textContent = item.title;
    document.getElementById("homeTestimonyQuote").textContent = "“" + item.quote + "”";
    document.getElementById("homeTestimonyBody").textContent = item.story;
    document.getElementById("homeTestimonyAuthor").textContent = "Shared by " + item.author;
    if (!dialog.open) dialog.showModal();
  };
  document.querySelectorAll("[data-home-story]").forEach(link => {
    link.addEventListener("click", event => {
      const item = byId.get(link.dataset.homeStory);
      if (!item) return;
      event.preventDefault();
      openStory(item);
    });
  });
  document.getElementById("closeHomeTestimony")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
