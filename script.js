const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const page = document.body.dataset.page;
const contactForm = document.querySelector(".contact-form");

if (toggle && header) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  if (link.dataset.nav === page) {
    link.classList.add("is-active");
  }

  link.addEventListener("click", () => {
    header?.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert(contactForm.dataset.alertMessage || "這是展示版表單。提供正式信箱或 API 後，我可以幫你接上真正的詢價流程。");
  });
}


const swapSvgPlaceholdersToJpg = async () => {
  const images = [...document.querySelectorAll('img.media-image[src$=".svg"]')];

  await Promise.all(
    images.map(async (img) => {
      const jpgSrc = img.getAttribute("src").replace(/\.svg$/i, ".jpg");

      try {
        const response = await fetch(jpgSrc, { method: "HEAD", cache: "no-store" });
        if (response.ok) {
          img.src = jpgSrc;
        }
      } catch {
        // Keep the SVG placeholder when JPG is unavailable.
      }
    })
  );
};

swapSvgPlaceholdersToJpg();
