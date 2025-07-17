// index-loader.js

document.addEventListener("DOMContentLoaded", function () {
  // --- FUNCTION TO BUILD THE FEATURED COLLEGES GRID ---
  function buildCollegeGrid() {
    const collegesGrid = document.getElementById("main-colleges-grid");
    const viewMoreContainer = document.querySelector(
      "#college .view-more-container"
    );

    // Safety check in case the grid or data is missing
    if (!collegesGrid || typeof colleges === "undefined") {
      if (viewMoreContainer) viewMoreContainer.style.display = "none";
      return;
    }

    const INITIAL_DISPLAY_COUNT = 10; // Set how many featured colleges to show on the homepage.
    const allCollegeKeys = Object.keys(colleges);

    // 1. Filter the keys to get only the colleges marked as "featured".
    const featuredCollegeKeys = allCollegeKeys.filter(
      (key) => colleges[key].featured === true
    );

    // 2. Take a slice of the *featured* keys to ensure we don't show more than the limit.
    const collegesToDisplayKeys = featuredCollegeKeys.slice(
      0,
      INITIAL_DISPLAY_COUNT
    );

    // 3. Hide the "View More" button if the total number of colleges is less than or equal to the display limit.
    if (allCollegeKeys.length <= INITIAL_DISPLAY_COUNT) {
      if (viewMoreContainer) {
        viewMoreContainer.style.display = "none";
      }
    }

    // 4. Loop through the final list of featured colleges and build the cards.
    collegesToDisplayKeys.forEach((collegeId) => {
      const college = colleges[collegeId];
      const cardLink = document.createElement("a");
      // Use the relative path fix here as well for consistency and robustness
      cardLink.href = `./college-template.html?id=${collegeId}`;
      cardLink.className = "college-item";
      const img = document.createElement("img");
      const logoSrc =
        college.logoImage || (college.images && college.images[0]) || "";
      img.src = logoSrc;
      img.alt = `${college.name} Logo`;
      const textDiv = document.createElement("div");
      textDiv.className = "college-item-text";
      textDiv.innerHTML = `<h3>${college.name}</h3><p>${
        college.location.split(",")[0]
      }</p>`;
      cardLink.appendChild(img);
      cardLink.appendChild(textDiv);
      collegesGrid.appendChild(cardLink);

      // Hover slideshow logic
      let slideshowInterval;
      const allImages = [logoSrc, ...(college.images || [])].filter(Boolean);
      let currentIndex = 0;

      cardLink.addEventListener("mouseenter", () => {
        if (allImages.length <= 1) return;
        img.classList.add("slideshow-active");
        slideshowInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % allImages.length;
          img.src = allImages[currentIndex];
        }, 2000);
      });

      cardLink.addEventListener("mouseleave", () => {
        if (allImages.length <= 1) return;
        clearInterval(slideshowInterval);
        img.classList.remove("slideshow-active");
        img.src = logoSrc;
        currentIndex = 0;
      });
    });
  }

  // --- GENERAL UI SETUP FUNCTIONS ---
  function setupHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
      });
    }
  }

  function setupThemeSwitcher() {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = body.getAttribute("data-theme") || "professional";
        const newTheme =
          currentTheme === "original" ? "professional" : "original";
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    }
    const savedTheme = localStorage.getItem("theme") || "original";
    body.setAttribute("data-theme", savedTheme);
  }

  function setupSectionalSearch(inputId, itemSelector, noResultsId) {
    const searchInput = document.getElementById(inputId);
    const noResultsMessage = document.getElementById(noResultsId);
    if (!searchInput) return;

    searchInput.addEventListener("keyup", () => {
      const query = searchInput.value.toLowerCase().trim();
      const items = document.querySelectorAll(itemSelector);
      let itemsFound = 0;

      items.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        const isVisible = itemText.includes(query);
        const displayStyle = item.classList.contains("college-item")
          ? "block"
          : "flex";
        item.style.display = isVisible ? displayStyle : "none";
        if (isVisible) itemsFound++;
      });

      if (noResultsMessage) {
        noResultsMessage.style.display =
          itemsFound === 0 && query ? "block" : "none";
      }
    });
  }

  function setupInteractiveMap() {
    const officeBoxes = document.querySelectorAll(".office-box");
    const mapIframe = document.getElementById("office-map");

    if (!officeBoxes.length || !mapIframe) return;

    officeBoxes.forEach((box) => {
      box.addEventListener("click", function () {
        officeBoxes.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        const newMapSrc = this.dataset.mapSrc;
        if (newMapSrc && mapIframe.src !== newMapSrc) {
          mapIframe.src = newMapSrc;
        }
      });
    });
  }

  // --- Execution Order ---
  setupHamburgerMenu();
  setupThemeSwitcher();
  buildCollegeGrid();
  setupSectionalSearch(
    "college-search",
    "#main-colleges-grid .college-item",
    "no-colleges-found"
  );
  setupSectionalSearch(
    "course-search",
    "#main-courses-grid .course-card",
    "no-courses-found"
  );
  setupInteractiveMap();
});