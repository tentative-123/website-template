function getValueByPath(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source);
}

function applyContentFields(content) {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.field);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-placeholder]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.placeholder);
    if (typeof value === "string") {
      element.setAttribute("placeholder", value);
    }
  });

  document.querySelectorAll("[data-meta-content]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.metaContent);
    if (typeof value === "string") {
      element.setAttribute("content", value);
    }
  });

  document.querySelectorAll("[data-mailto]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.mailto);
    if (typeof value === "string") {
      element.setAttribute("href", `mailto:${value}`);
    }
  });

  document.querySelectorAll("[data-href]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.href);
    if (typeof value === "string") {
      element.setAttribute("href", value);
    }
  });

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    const alertMessage = getValueByPath(content, "contact.form_alert");
    if (typeof alertMessage === "string") {
      contactForm.dataset.alertMessage = alertMessage;
    }
  }

  document.documentElement.lang = getCurrentLanguage() === "en" ? "en" : "zh-Hant";
}

function updateLanguageToggle(language) {
  document.querySelectorAll("[data-language-option]").forEach((button) => {
    const isActive = button.dataset.languageOption === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

document.querySelectorAll("[data-language-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.languageOption;
    window.ContentStore.setCurrentLanguage(language);
    window.location.reload();
  });
});

function getCurrentLanguage() {
  return window.ContentStore.getCurrentLanguage();
}

const currentLanguage = getCurrentLanguage();
updateLanguageToggle(currentLanguage);

window.ContentStore.loadResolvedContent(currentLanguage)
  .then((content) => {
    applyContentFields(content);
  })
  .catch((error) => {
    console.error(error);
  });
