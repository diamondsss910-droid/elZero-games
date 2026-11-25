
// SUPABASE SETTINGS

const SUPABASE_URL = "https://smmrbxcturglmfvaotsp.supabase.co";

const SUPABASE_KEY = "sb_publishable_CQ1FLyVp5xN7WneaYg9hqA_zpVEIEhc";


// MAIN ELEMENTS

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


// VORTEX DOWNLOAD COUNTER

const vortexCard = document.querySelector(".vortex-card");

let vortexCountElement = null;


// Create counter on the website

if (vortexCard) {
  const gameInfo = vortexCard.querySelector(".game-info");
  const gameFooter = vortexCard.querySelector(".game-card-footer");

  if (gameInfo && gameFooter) {
    const counter = document.createElement("div");

    counter.className = "vortex-download-counter";

    counter.style.display = "flex";
    counter.style.alignItems = "center";
    counter.style.gap = "8px";
    counter.style.margin = "15px 0";
    counter.style.fontSize = "15px";

    const label = document.createElement("span");
    label.dataset.en = "Total Downloads:";
    label.dataset.ar = "إجمالي التحميلات:";

    vortexCountElement = document.createElement("strong");
    vortexCountElement.id = "vortexDownloadCount";
    vortexCountElement.textContent = "...";

    counter.appendChild(label);
    counter.appendChild(vortexCountElement);

    gameInfo.insertBefore(counter, gameFooter);
  }
}


// Get current download count

async function loadVortexDownloads() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/game_downloads?game_name=eq.VorTex&select=downloads`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Could not load download count");
    }

    const data = await response.json();

    if (data.length > 0 && vortexCountElement) {
      vortexCountElement.textContent =
        Number(data[0].downloads).toLocaleString();
    }

  } catch (error) {
    console.error("Download counter error:", error);

    if (vortexCountElement) {
      vortexCountElement.textContent = "—";
    }
  }
}


// Count a download request

async function countVortexDownload() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/increment_vortex_downloads`,
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }
    );

    if (!response.ok) {
      throw new Error("Could not count download");
    }

    const newCount = await response.json();

    if (vortexCountElement) {
      vortexCountElement.textContent =
        Number(newCount).toLocaleString();
    }

  } catch (error) {
    console.error("Download counting error:", error);
  }
}


// Connect the download button

const vortexDownloadButton = document.querySelector(
  '.vortex-card a[download]'
);

if (vortexDownloadButton) {
  vortexDownloadButton.addEventListener("click", () => {
    countVortexDownload();
  });
}


// Restore saved language

const savedLanguage = localStorage.getItem("elzero-language") || "en";
changeLanguage(savedLanguage);


// Load counter when website opens

loadVortexDownloads();


// Refresh counter every 15 seconds

setInterval(loadVortexDownloads, 15000);
