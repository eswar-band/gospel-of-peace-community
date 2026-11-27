/* Shared small-screen form behavior and reliable return-to-top navigation. */
(() => {
  "use strict";

  // Use a real scroll action so the footer link works consistently across browsers.
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href="#top"]');
    if (!link) return;
    event.preventDefault();
    try {
      window.scrollTo({ top: 0, left: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
    if (window.location.hash === "#top" && history.replaceState) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });
})();
