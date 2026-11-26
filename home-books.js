(() => {
  const dialog = document.getElementById("homeBookDialog");
  const books = Array.isArray(window.CHURCH_BOOKS) ? window.CHURCH_BOOKS : [];
  const byId = new Map(books.map(book => [book.id, book]));

  // Delegation keeps homepage cards interactive even if their markup changes.
  document.addEventListener("click", event => {
    const link = event.target.closest("[data-home-book]");
    if (!link) return;

    // Book cards always open details here; never navigate away from the homepage.
    event.preventDefault();
    event.stopPropagation();

    const book = byId.get(link.dataset.homeBook);
    if (!dialog || !book) return;

    document.getElementById("homeBookCategory").textContent =
      book.category + " · " + (book.access === "paid" ? "PAID MEMBERS" : "FREE");
    document.getElementById("homeBookTitle").textContent = book.title;
    document.getElementById("homeBookAuthor").textContent = "By " + book.author + " · " + book.year;
    document.getElementById("homeBookDescription").textContent = book.description;
    document.getElementById("homeBookAccess").textContent = book.access === "paid"
      ? "This publication is reserved for verified paid members. Secure membership access will be available when the membership service is connected."
      : "This publication is free. Its authorized reading file will be added when supplied.";
    document.getElementById("homeBookCover").textContent = book.title;
    if (!dialog.open) dialog.showModal();
  }, true);

  document.getElementById("closeHomeBook")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
