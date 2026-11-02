const languageButton = document.getElementById("languageButton");

let currentLanguage = "en";

function changeLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en";

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  document.body.dir = document.documentElement.dir;

  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.textContent =
      currentLanguage === "ar"
        ? element.dataset.ar
        : element.dataset.en;
  });

  languageButton.textContent =
    currentLanguage === "ar" ? "اللغات" : "Languages";
}

languageButton.addEventListener("click", changeLanguage);
