document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const heroMedia = document.querySelector(".hero__media");
let scrollTicking = false;

function updateScrollEffects() {
  const scrollY = window.scrollY;

  header?.classList.toggle("is-scrolled", scrollY > 28);

  if (heroMedia && !reducedMotion) {
    const parallaxOffset = Math.min(scrollY * 0.16, 90);
    heroMedia.style.setProperty("--parallax-y", `${parallaxOffset}px`);
  }

  scrollTicking = false;
}

function requestScrollUpdate() {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollEffects);
    scrollTicking = true;
  }
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
updateScrollEffects();

// Mobile navigation
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  navigation.classList.remove("is-open");
  header?.classList.remove("menu-is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";

  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Fermer le menu" : "Ouvrir le menu");
  navigation?.classList.toggle("is-open", willOpen);
  header?.classList.toggle("menu-is-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
    closeMenu();
    menuToggle?.focus();
  }
});

// Progressive reveal animations
const revealElements = document.querySelectorAll("[data-reveal]");

revealElements.forEach((element) => {
  const delay = Number(element.dataset.revealDelay || 0);
  element.style.setProperty("--reveal-delay", `${delay}ms`);
});

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -45px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-revealed"));
}

// Keep the current section highlighted in the navigation.
const observedSections = document.querySelectorAll("main > section[id]");
const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]:not(.nav-cta)');

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-35% 0px -55%",
      threshold: 0,
    },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

// Portfolio filters
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card[data-category]");
const projectCount = document.querySelector("[data-project-count]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const activeFilter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const shouldShow = activeFilter === "all" || categories.includes(activeFilter);

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
        card.classList.remove("is-filtering");
        void card.offsetWidth;
        card.classList.add("is-filtering");
      }
    });

    if (projectCount) projectCount.textContent = String(visibleCount);
  });
});

filterButtons.forEach((button, index) => {
  button.setAttribute("aria-pressed", String(index === 0));
});

// Detailed quote form transition
const formModeButtons = document.querySelectorAll("[data-form-mode]");
const formModeControl = document.querySelector(".form-mode");
const detailedFields = document.querySelector("[data-detailed-fields]");
const requestType = document.querySelector("[data-request-type]");

function setFormMode(mode) {
  const isDetailed = mode === "detailed";

  formModeButtons.forEach((button) => {
    const isActive = button.dataset.formMode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  formModeControl?.classList.toggle("is-detailed", isDetailed);
  detailedFields?.classList.toggle("is-open", isDetailed);
  detailedFields?.setAttribute("aria-hidden", String(!isDetailed));

  if (detailedFields) {
    detailedFields.disabled = !isDetailed;
  }

  if (requestType) {
    requestType.value = isDetailed ? "Demande de devis détaillé" : "Contact rapide";
  }
}

formModeButtons.forEach((button) => {
  button.addEventListener("click", () => setFormMode(button.dataset.formMode));
});

setFormMode("simple");

// Portfolio lightbox
const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxTriggers = document.querySelectorAll("[data-lightbox]");

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
}

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    const title = trigger.dataset.title || "Réalisation France BTP";
    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = title;
    lightboxCaption.textContent = title;
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener("close", () => {
  if (lightboxImage) lightboxImage.src = "";
});
