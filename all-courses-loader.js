// all-courses-loader.js

document.addEventListener("DOMContentLoaded", function () {
  // --- UI Setup Functions ---
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

  // --- Page-Specific Logic ---
  function loadCourseGrid() {
    const coursesGrid = document.getElementById("courses-grid");
    // Safety check for data
    if (typeof courseDetails === "undefined") {
      coursesGrid.innerHTML =
        "<p>Error: Could not load course data. Please check file paths.</p>";
      return;
    }

    for (const key in courseDetails) {
      const course = courseDetails[key];
      const cardLink = document.createElement("a");
      cardLink.className = "course-card";
      // Use the relative path fix here as well
      cardLink.href = `./course-template.html?course=${key}`;

      cardLink.innerHTML = `
        <img src="${
          course.image || "https://placehold.co/60x60/0a4d68/FFF?text=Course"
        }" alt="${course.name}">
        <div class="course-card-text">
            <h3>${course.name}</h3>
            <p>${course.description}</p>
        </div>
      `;
      coursesGrid.appendChild(cardLink);
    }
  }

  // Search functionality
  function setupCourseSearch() {
    const searchInput = document.getElementById("course-search");
    const noResultsMessage = document.getElementById("no-courses-found");

    if (!searchInput) return;

    searchInput.addEventListener("keyup", () => {
      const query = searchInput.value.toLowerCase().trim();
      const courseCards = document.querySelectorAll(".course-card");
      let foundCount = 0;

      courseCards.forEach((card) => {
        const cardText = card.textContent.toLowerCase();
        if (cardText.includes(query)) {
          card.style.display = "flex";
          foundCount++;
        } else {
          card.style.display = "none";
        }
      });

      // Show or hide the 'no results' message
      if (foundCount === 0 && query) {
        noResultsMessage.style.display = "block";
      } else {
        noResultsMessage.style.display = "none";
      }
    });
  }

  // --- Execution ---
  setupHamburgerMenu();
  setupThemeSwitcher();
  loadCourseGrid(); // Must run first to create the cards
  setupCourseSearch(); // Then set up the search to filter those cards
});