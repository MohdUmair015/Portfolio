const themeButton = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const footerYear = document.querySelector("#footer-year");
const projectImages = document.querySelectorAll(".project-image");
const imageModal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#modal-image");
const modalCaption = document.querySelector("#modal-caption");
const closeModalButton = document.querySelector("#close-modal");
const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const mainContent = document.querySelector("#main-content");
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".site-footer");
const skipLink = document.querySelector(".skip-link");
let lastFocusedElement;

function getBackgroundElements() {
  return [skipLink, siteHeader, mainContent, siteFooter].filter(Boolean);
}

function setBackgroundInert(isInert) {
  const elements = getBackgroundElements();
  elements.forEach((el) => {
    if (isInert) {
      el.setAttribute("aria-hidden", "true");
      if ("inert" in el) el.inert = true;
    } else {
      el.removeAttribute("aria-hidden");
      if ("inert" in el) el.inert = false;
    }
  });
}

function setTheme(theme, savePreference = true) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  themeButton?.setAttribute("aria-pressed", String(isDark));
  themeButton?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeColor?.setAttribute("content", isDark ? "#17211d" : "#f7f5ee");

  if (savePreference) localStorage.setItem("theme", theme);
}

function applyInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme || (prefersDark.matches ? "dark" : "light"), Boolean(savedTheme));
}

function openMobileMenu() {
  if (!mobileNavToggle || !primaryNav) return;
  mobileNavToggle.setAttribute("aria-expanded", "true");
  mobileNavToggle.setAttribute("aria-label", "Close navigation menu");
  primaryNav.classList.add("is-open");
}

function closeMobileMenu(returnFocus = false) {
  if (!mobileNavToggle || !primaryNav || !primaryNav.classList.contains("is-open")) return;
  mobileNavToggle.setAttribute("aria-expanded", "false");
  mobileNavToggle.setAttribute("aria-label", "Open navigation menu");
  primaryNav.classList.remove("is-open");
  if (returnFocus) mobileNavToggle.focus();
}

function closeImageModal() {
  if (!imageModal || imageModal.hidden) return;

  imageModal.hidden = true;
  modalImage.src = "";
  modalImage.alt = "";
  modalCaption.textContent = "";
  setBackgroundInert(false);
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

mobileNavToggle?.addEventListener("click", () => {
  const isOpen = primaryNav?.classList.contains("is-open");
  if (isOpen) {
    closeMobileMenu(false);
  } else {
    openMobileMenu();
  }
});

themeButton?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark-theme") ? "light" : "dark");
});

prefersDark.addEventListener("change", (event) => {
  if (!localStorage.getItem("theme")) {
    setTheme(event.matches ? "dark" : "light", false);
  }
});

if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

projectImages.forEach((image) => {
  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Expand ${image.alt}`);

  const openImageModal = () => {
    if (!imageModal || !modalImage || !modalCaption) return;

    lastFocusedElement = document.activeElement;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modalCaption.textContent = image.alt;
    imageModal.hidden = false;
    setBackgroundInert(true);
    closeModalButton?.focus();
  };

  image.addEventListener("click", openImageModal);
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageModal();
    }
  });
});

closeModalButton?.addEventListener("click", closeImageModal);
imageModal?.addEventListener("click", (event) => {
  if (event.target === imageModal) closeImageModal();
});

imageModal?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeImageModal();
    return;
  }

  if (event.key === "Tab") {
    const focusable = imageModal.querySelectorAll(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    if (focusable.length === 1) {
      event.preventDefault();
      focusable[0].focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!imageModal.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (imageModal && !imageModal.hidden) {
      closeImageModal();
    } else if (primaryNav?.classList.contains("is-open")) {
      closeMobileMenu(true);
    }
  }
});

document.addEventListener("click", (event) => {
  if (
    primaryNav?.classList.contains("is-open") &&
    !primaryNav.contains(event.target) &&
    !mobileNavToggle?.contains(event.target)
  ) {
    closeMobileMenu(false);
  }
});

document.querySelector(".logo")?.addEventListener("click", (event) => {
  event.preventDefault();
  closeMobileMenu(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu(false);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.35 },
);

sections.forEach((section) => observer.observe(section));
applyInitialTheme();
