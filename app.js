const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];


// Theme switcher: persist the visitor's preference and respect system theme initially.
const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("modern-church-theme");
const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    const dark = theme === "dark";
    themeToggle.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
    themeToggle.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";
    themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0c1422" : "#f5f3ee");
}
applyTheme(savedTheme || preferredTheme);
themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("modern-church-theme", next);
  applyTheme(next);
});

// Gentle scroll reveals with staggered cards; gracefully falls back when unsupported.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js-motion");
  const revealTargets = $$(".section-heading,.section-top,.welcome-visual,.welcome-copy,.mission-grid > *, .value-card,.media-card,.story-card,.gallery-item,.event-row,.featured-event,.live-copy,.live-player,.book-card,.prayer-grid > *, .visit-grid > *, .contact-grid > *");
  revealTargets.forEach((el, index) => {
    el.dataset.reveal = "";
    if (el.matches(".value-card,.media-card,.story-card,.gallery-item,.event-row,.book-card")) el.dataset.revealDelay = String((index % 4) + 1);
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach(el => revealObserver.observe(el));
}

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
$$(".main-nav a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));

// Media platform filters
$$("[data-media-filter]").forEach(btn => btn.addEventListener("click", () => {
  $$("[data-media-filter]").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  const filter = btn.dataset.mediaFilter;
  $$(".media-card").forEach(card => {
    card.hidden = filter !== "all" && card.dataset.platform !== filter;
  });
}));

// Accessible modal helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModals() {
  $$(".modal.open").forEach(modal => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
  $("#videoFrame").innerHTML = "";
  document.body.style.overflow = "";
}
$$("[data-close-modal]").forEach(el => el.addEventListener("click", closeModals));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

$$("[data-video]").forEach(btn => btn.addEventListener("click", () => {
  const url = btn.dataset.video;
  $("#videoFrame").innerHTML = `<iframe src="${url}?autoplay=1&rel=0" title="Church video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  openModal("videoModal");
}));
$$("[data-image]").forEach(btn => btn.addEventListener("click", () => {
  $("#largeImage").src = btn.dataset.image;
  openModal("imageModal");
}));

// Prayer request demo: opens WhatsApp with a prefilled message.
// Replace this demo number with the church's WhatsApp number in international format.
$("#prayerForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const message = [
    "Prayer request — Modern Church",
    `Name: ${form.get("name") || "Not provided"}`,
    `Mobile: ${form.get("phone") || "Not provided"}`,
    `Category: ${form.get("category")}`,
    `Confidential: ${form.get("confidential") ? "Yes" : "No"}`,
    `Request: ${form.get("message")}`
  ].join("\n");
  const whatsappNumber = "910000000000"; // TODO: replace with church number; country code, no + or spaces.
  $("#prayerFeedback").textContent = "Opening WhatsApp with your request. Press Send in WhatsApp to submit it.";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

// Member modal preview
let memberMode = "login";
$$("[data-open-member]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  openModal("memberModal");
}));
$$("[data-member-tab]").forEach(btn => btn.addEventListener("click", () => {
  memberMode = btn.dataset.memberTab;
  $$("[data-member-tab]").forEach(b => b.classList.toggle("selected", b === btn));
  $("#memberNameWrap").classList.toggle("hidden", memberMode !== "register");
  $("#memberSubmit").textContent = memberMode === "register" ? "Create account" : "Sign in";
  $("#memberMessage").textContent = memberMode === "register"
    ? "Registration is a design preview. Connect verified registration and admin approval before launch."
    : "Member access is a design preview. Connect secure authentication before launch.";
}));
$("#memberForm")?.addEventListener("submit", e => {
  e.preventDefault();
  $("#memberMessage").textContent = "This is a front-end preview. Secure member authentication is not connected yet.";
});

// Lightweight toast for demo links
$$('a[href="#all-media"],a[href="#all-testimonies"],a[href="#all-gallery"],a[href="#all-events"],a[href="#all-books"]').forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const toast = $("#toast");
    toast.textContent = "This section is a homepage preview. The full listing page will be part of the next build phase.";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  });
});
