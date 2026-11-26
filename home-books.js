(() => {
  const dialog = document.getElementById("homeBookDialog");
  const books = Array.isArray(window.CHURCH_BOOKS) ? window.CHURCH_BOOKS : [];
  if (!dialog || !books.length) return;
  const byId = new Map(books.map(book => [book.id, book]));

  document.querySelectorAll("[data-home-book]").forEach(link => {
    link.addEventListener("click", event => {
      const book = byId.get(link.dataset.homeBook);
      if (!book) return;
      event.preventDefault();
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
    });
  });

  document.getElementById("closeHomeBook")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
