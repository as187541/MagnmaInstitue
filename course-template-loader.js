document.addEventListener("DOMContentLoaded", function () {
  // --- UI Setup Functions (Hamburger Menu and Theme Switcher) ---
  function setupUI() {
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
      });
    }

    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme =
          body.getAttribute("data-theme") || "professional";
        const newTheme =
          currentTheme === "original" ? "professional" : "original";
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    }
    const savedTheme = localStorage.getItem("theme") || "original";
    body.setAttribute("data-theme", savedTheme);
  }

  // --- Dynamic Content Loading Logic ---
  function loadCourseContent() {
    // Get all the necessary DOM elements first
    const container = document.getElementById("colleges-container");
    const noResultsMessage = document.getElementById("no-results-message");
    const courseTitleEl = document.getElementById("course-title");
    const courseDescriptionEl = document.getElementById("course-description");
    const collegesHeadingEl = document.getElementById("colleges-heading");

    // Helper function to render a list of colleges into the grid
    const renderColleges = (collegesToRender) => {
      container.innerHTML = ""; // Clear any previous results
      if (collegesToRender && collegesToRender.length > 0) {
        noResultsMessage.style.display = "none";
        collegesToRender.forEach((college) => {
          // Use a relative path to ensure the link works correctly locally
          const collegeCardHTML = `
            <a href="./college-template.html?id=${college.id}" class="college-item">
              <div class="college-image-wrapper">
                <img src="${college.logoImage}" alt="${college.name} Logo">
              </div>
              <div class="college-item-text">
                 <h3>${college.name}</h3>
                 <p>${college.location}</p>
              </div>
            </a>`;
          container.insertAdjacentHTML("beforeend", collegeCardHTML);
        });
      } else {
        noResultsMessage.style.display = "block";
      }
    };

    // Get the course key from the URL (e.g., 'mbbs', 'btech')
    const urlParams = new URLSearchParams(window.location.search);
    const courseKey = urlParams.get("course");

    // Check if the required data objects exist
    if (typeof courseDetails === "undefined" || typeof colleges === "undefined") {
      console.error("Error: 'courseDetails' or 'colleges' data not found. Check if script files are loaded.");
      courseTitleEl.textContent = "Error Loading Data";
      return;
    }

    const courseInfo = courseDetails[courseKey];

    if (courseInfo) {
      // Update basic page info from course-details.js
      document.title = `${courseInfo.name} - Magnma Institute`;
      courseTitleEl.textContent = courseInfo.name;
      courseDescriptionEl.textContent = courseInfo.description;
      collegesHeadingEl.textContent = `Colleges Offering ${courseInfo.name}`;

      // --- B.Tech Specific Logic ---
      if (courseKey === "btech") {
        const filterContainer = document.getElementById("specialization-filter-container");
        const selectDropdown = document.getElementById("btech-specialization-select");
        filterContainer.style.display = "block"; // Show the filter UI

        // Populate dropdown with specializations from course-details.js
        selectDropdown.innerHTML = `<option value="all">All Specializations</option>`;
        courseInfo.specializations.forEach((spec) => {
          const option = document.createElement("option");
          option.value = `B.Tech in ${spec}`;
          option.textContent = spec;
          selectDropdown.appendChild(option);
        });

        // This function will be called on page load and when the dropdown changes
        const filterAndRenderBtech = () => {
          const selectedSpec = selectDropdown.value;
          let matchingColleges = [];

          for (const collegeId in colleges) {
            const college = colleges[collegeId];
            if (college.courses) {
              if (selectedSpec === "all") {
                // If "All" is selected, find any college offering any B.Tech course
                if (college.courses.some((c) => c.toLowerCase().startsWith("b.tech"))) {
                  matchingColleges.push({ id: collegeId, ...college });
                }
              } else {
                // If a specific specialization is selected, find an exact match
                if (college.courses.includes(selectedSpec)) {
                  matchingColleges.push({ id: collegeId, ...college });
                }
              }
            }
          }
          renderColleges(matchingColleges);
        };

        // Attach event listener to the dropdown
        selectDropdown.addEventListener("change", filterAndRenderBtech);

        // Perform the initial render when the page loads
        filterAndRenderBtech();

      } else {
        // --- Logic for all other courses (non-B.Tech) ---
        const matchingColleges = [];
        for (const collegeId in colleges) {
          const college = colleges[collegeId];
          // Check if the college's course list includes the current course key
          if (
            college.courses &&
            college.courses.map((c) => c.toLowerCase()).includes(courseKey.toLowerCase())
          ) {
            matchingColleges.push({ id: collegeId, ...college });
          }
        }
        renderColleges(matchingColleges);
      }
    } else {
      // Handle case where the course key from the URL is not found
      courseTitleEl.textContent = "Course Not Found";
      collegesHeadingEl.style.display = "none";
      noResultsMessage.style.display = "block";
      noResultsMessage.querySelector("p").textContent =
        "The course you are looking for does not exist. Please check the URL or navigate from our courses page.";
    }
  }

  // --- Execution ---
  setupUI();
  loadCourseContent();
});