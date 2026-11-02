
const languageButton = document.getElementById("languageButton");
const languageOptions = document.getElementById("languageOptions");
const themeButton = document.getElementById("themeButton");

// LANGUAGE SYSTEM

function changeLanguage(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.textContent =
      language === "ar"
        ? element.dataset.ar
        : element.dataset.en;
  });

  localStorage.setItem("elzero-language", language);
  languageOptions.hidden = true;
  languageButton.setAttribute("aria-expanded", "false");
}

// Open and close language menu

languageButton.addEventListener("click", event => {
  event.stopPropagation();

  const isOpen = !languageOptions.hidden;
  languageOptions.hidden = isOpen;
  languageButton.setAttribute("aria-expanded", String(!isOpen));
});

// Select language

languageOptions.querySelectorAll("[data-language]").forEach(button => {
  button.addEventListener("click", () => {
    changeLanguage(button.dataset.language);
  });
});

// Close menu when clicking outside

document.addEventListener("click", event => {
  if (!event.target.closest(".language-menu")) {
    languageOptions.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
  }
});

// Restore saved language

const savedLanguage = localStorage.getItem("elzero-language") || "en";
changeLanguage(savedLanguage);


// DARK AND LIGHT MODE

function changeTheme(theme) {
  document.documentElement.dataset.theme = theme;

  themeButton.textContent = theme === "dark" ? "☀" : "☾";

  themeButton.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );

  localStorage.setItem("elzero-theme", theme);
}

// Restore saved theme

const savedTheme = localStorage.getItem("elzero-theme") || "light";
changeTheme(savedTheme);

// Toggle theme

themeButton.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  changeTheme(currentTheme === "dark" ? "light" : "dark");
});
