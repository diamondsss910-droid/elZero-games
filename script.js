
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

  const reviewInput = document.getElementById("vortexReviewComment");

  if (reviewInput) {
    reviewInput.placeholder =
      language === "ar"
        ? reviewInput.dataset.placeholderAr
        : reviewInput.dataset.placeholderEn;
  }

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

const vortexCountElement = document.getElementById("vortexDownloadCount");


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
        body: JSON.stringify({}),
        keepalive: true
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


// VORTEX REVIEWS SYSTEM

let selectedVortexRating = 0;

const ratingButtons = document.querySelectorAll(".rating-star");
const reviewInput = document.getElementById("vortexReviewComment");
const submitReviewButton = document.getElementById("submitVortexReview");

const averageElement = document.getElementById("vortexAverage");
const averageStarsElement = document.getElementById("vortexAverageStars");
const reviewCountElement = document.getElementById("vortexReviewCount");
const reviewsList = document.getElementById("vortexReviewsList");
const reviewMessage = document.getElementById("vortexReviewMessage");


// Display selected stars

function updateSelectedStars() {
  ratingButtons.forEach(button => {
    const rating = Number(button.dataset.rating);

    button.classList.toggle(
      "active",
      rating <= selectedVortexRating
    );

    button.setAttribute(
      "aria-pressed",
      String(rating <= selectedVortexRating)
    );
  });
}


// Select a rating

ratingButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedVortexRating = Number(button.dataset.rating);
    updateSelectedStars();
  });
});


// Display average stars

function createStars(rating) {
  const roundedRating = Math.round(rating);

  return "★".repeat(roundedRating) +
         "☆".repeat(5 - roundedRating);
}


// Load reviews and calculate average

async function loadVortexReviews() {
  try {
    // Get all ratings for an accurate average

    const averageResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vortex_reviews?select=rating`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!averageResponse.ok) {
      throw new Error("Could not load rating summary");
    }

    const allRatings = await averageResponse.json();

    const totalRatings = allRatings.length;

    const average =
      totalRatings > 0
        ? allRatings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
        : 0;

    if (averageElement) {
      averageElement.textContent = average.toFixed(1);
    }

    if (averageStarsElement) {
      averageStarsElement.textContent = createStars(average);
    }

    if (reviewCountElement) {
      const language = document.documentElement.lang;

      reviewCountElement.textContent =
        language === "ar"
          ? `${totalRatings} تقييم`
          : `${totalRatings} ratings`;
    }


    // Get latest 20 reviews

    const reviewsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vortex_reviews?select=rating,comment,created_at&order=created_at.desc&limit=20`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!reviewsResponse.ok) {
      throw new Error("Could not load reviews");
    }

    const reviews = await reviewsResponse.json();

    if (!reviewsList) return;

    reviewsList.replaceChildren();

    if (reviews.length === 0) {
      const emptyMessage = document.createElement("p");

      emptyMessage.textContent =
        document.documentElement.lang === "ar"
          ? "لا توجد تقييمات حتى الآن. كن أول من يقيّم اللعبة!"
          : "No reviews yet. Be the first to review!";

      reviewsList.appendChild(emptyMessage);
      return;
    }


    // Display reviews safely

    reviews.forEach(review => {
      const item = document.createElement("div");
      item.className = "review-item";

      const stars = document.createElement("div");
      stars.className = "review-item-stars";
      stars.textContent = createStars(review.rating);

      item.appendChild(stars);

      if (review.comment) {
        const comment = document.createElement("p");
        comment.className = "review-item-comment";

        // textContent prevents HTML from being executed
        comment.textContent = review.comment;

        item.appendChild(comment);
      }

      reviewsList.appendChild(item);
    });

  } catch (error) {
    console.error("Reviews error:", error);

    if (reviewsList) {
      reviewsList.textContent =
        document.documentElement.lang === "ar"
          ? "تعذر تحميل التقييمات."
          : "Could not load reviews.";
    }
  }
}


// Submit a review

if (submitReviewButton) {
  submitReviewButton.addEventListener("click", async () => {

    if (selectedVortexRating === 0) {
      reviewMessage.textContent =
        document.documentElement.lang === "ar"
          ? "اختار عدد النجوم أولاً."
          : "Please select a star rating first.";

      return;
    }

    const comment = reviewInput.value.trim();

    submitReviewButton.disabled = true;

    reviewMessage.textContent =
      document.documentElement.lang === "ar"
        ? "جاري إرسال تقييمك..."
        : "Submitting your review...";

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/vortex_reviews`,
        {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            rating: selectedVortexRating,
            comment: comment || null
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      reviewMessage.textContent =
        document.documentElement.lang === "ar"
          ? "تم إرسال تقييمك بنجاح! شكراً لك."
          : "Your review was submitted successfully. Thank you!";

      selectedVortexRating = 0;
      updateSelectedStars();

      reviewInput.value = "";

      await loadVortexReviews();

    } catch (error) {
      console.error("Submit review error:", error);

      reviewMessage.textContent =
        document.documentElement.lang === "ar"
          ? "حصل خطأ أثناء إرسال التقييم. حاول مرة أخرى."
          : "Could not submit your review. Please try again.";

    } finally {
      submitReviewButton.disabled = false;
    }
  });
}


// RESTORE LANGUAGE

const savedLanguage = localStorage.getItem("elzero-language") || "en";
changeLanguage(savedLanguage);


// LOAD DATA

loadVortexDownloads();
loadVortexReviews();


// Refresh data every 30 seconds

setInterval(loadVortexDownloads, 15000);
setInterval(loadVortexReviews, 30000);
