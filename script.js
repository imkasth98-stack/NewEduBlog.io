// ==========================================
// EduNews - JavaScript Functionality
// Theme Switcher, Search, Interest Filter, Modal & Nav
// ==========================================

const THEME_STORAGE_KEY = "edunews-theme";

// Elements
const searchForm = document.querySelector(".search");
const searchInput = searchForm?.querySelector("input");
const searchableCards = [...document.querySelectorAll(".news-card")];
const educationArticles = [...document.querySelectorAll(".article")];
const allContent = [...searchableCards, ...educationArticles];
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const newsletterForm = document.querySelector(".newsletter form");
const modal = document.querySelector("#article-reader");
const modalTitle = document.querySelector("#modal-title");
const modalContent = document.querySelector("#modal-content");
const modalReadPage = document.querySelector("#modal-read-page");
const interestButtons = [...document.querySelectorAll(".interest-btn")];


// ==========================================
// 1. THEME SWITCHER (DARK & LIGHT BUTTON)
// ==========================================

function getSavedOrPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
        return saved;
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("dark-theme");
    } else {
        document.documentElement.removeAttribute("data-theme");
        document.body.classList.remove("dark-theme");
    }

    // Update Header Theme Switcher
    const headerToggle = document.querySelector("#theme-toggle");
    if (headerToggle) {
        headerToggle.setAttribute("aria-checked", String(isDark));
        const label = headerToggle.querySelector(".theme-toggle-label");
        if (label) {
            label.textContent = isDark ? "ងងឹត" : "ពន្លឺ";
        }
        headerToggle.title = isDark ? "ប្តូរទៅ Light Mode (ពន្លឺ)" : "ប្តូរទៅ Dark Mode (ងងឹត)";
    }

    // Update Hero Theme Switcher Pill
    const heroToggle = document.querySelector("#hero-theme-toggle");
    if (heroToggle) {
        heroToggle.setAttribute("aria-checked", String(isDark));
        const heroLabel = heroToggle.querySelector(".pill-text");
        if (heroLabel) {
            heroLabel.textContent = isDark ? "Dark Mode (បើក)" : "Light Mode (បើក)";
        }
        heroToggle.title = isDark ? "ប្តូរទៅ Light Mode" : "ប្តូរទៅ Dark Mode";
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
        // Fallback if localStorage is unavailable
    }
    applyTheme(nextTheme);
}

// Initial theme setup
applyTheme(getSavedOrPreferredTheme());

// Bind click events on all theme buttons
document.querySelectorAll("#theme-toggle, #hero-theme-toggle").forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
});

// React to OS dark/light mode change if user has no saved preference
if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applyTheme(e.matches ? "dark" : "light");
        }
    });
}


// ==========================================
// 2. USER INTERESTS & SEARCH FILTERING
// ==========================================

function updateInterestButtonActiveState(query) {
    const normalized = query.trim().toLocaleLowerCase();
    interestButtons.forEach((btn) => {
        const topic = (btn.dataset.topic || "").trim().toLocaleLowerCase();
        if (!normalized && !topic) {
            btn.classList.add("active");
        } else if (normalized && topic && (normalized.includes(topic) || topic.includes(normalized))) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function showSearchResults(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    let visibleCount = 0;

    allContent.forEach((item) => {
        const matches = !normalizedQuery || item.textContent.toLocaleLowerCase().includes(normalizedQuery);
        item.hidden = !matches;
        if (matches) visibleCount += 1;
    });

    document.querySelector("#news")?.classList.toggle("has-search-results", Boolean(normalizedQuery));
    document.querySelector("#education")?.classList.toggle("has-search-results", Boolean(normalizedQuery));
    document.querySelector("#search-empty")?.remove();

    if (normalizedQuery && visibleCount === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.id = "search-empty";
        emptyMessage.className = "search-empty";
        emptyMessage.textContent = `មិនមានអត្ថបទសម្រាប់ “${query.trim()}” ទេ។`;
        document.querySelector("#news .container")?.append(emptyMessage);
    }

    updateInterestButtonActiveState(query);
}

// Interest buttons event listener
interestButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const topic = btn.dataset.topic || "";
        if (searchInput) searchInput.value = topic;
        showSearchResults(topic);
        if (topic) {
            document.querySelector("#news")?.scrollIntoView({ behavior: "smooth" });
        }
    });
});

searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    showSearchResults(searchInput.value);
    document.querySelector("#news")?.scrollIntoView({ behavior: "smooth" });
});

searchInput?.addEventListener("input", () => showSearchResults(searchInput.value));

document.querySelector("#show-all-news")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    showSearchResults("");
});

document.querySelectorAll(".topic-filter").forEach((topic) => {
    const filterByTopic = () => {
        if (searchInput) searchInput.value = topic.textContent.trim();
        showSearchResults(topic.textContent);
        document.querySelector("#news")?.scrollIntoView({ behavior: "smooth" });
    };

    topic.addEventListener("click", filterByTopic);
    topic.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") filterByTopic();
    });
});


// ==========================================
// 3. MODAL READER
// ==========================================

document.querySelectorAll(".read-article").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        if (modalTitle) modalTitle.textContent = link.dataset.title || "";
        if (modalContent) modalContent.textContent = link.dataset.content || "";
        if (modalReadPage) modalReadPage.href = link.dataset.page || "article.html";
        if (modal) {
            modal.hidden = false;
            document.body.classList.add("modal-open");
            modal.querySelector(".modal-close")?.focus();
        }
    });
});

function closeModal() {
    if (modal) {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
    }
}

modal?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
});


// ==========================================
// 4. MOBILE NAVIGATION
// ==========================================

menuToggle?.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("#primary-nav a").forEach((link) => {
    link.addEventListener("click", () => {
        navigation?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
    });
});


// ==========================================
// 5. NEWSLETTER
// ==========================================

newsletterForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = newsletterForm.querySelector("input");
    const email = emailInput?.value.trim() || "";
    let status = newsletterForm.querySelector(".form-status");

    if (!emailInput?.checkValidity() || !email) {
        emailInput?.focus();
        emailInput?.setCustomValidity("សូមបញ្ចូលអ៊ីមែលដែលត្រឹមត្រូវ");
        emailInput?.reportValidity();
        emailInput?.setCustomValidity("");
        return;
    }

    if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        newsletterForm.append(status);
    }

    status.textContent = "បានចុះឈ្មោះជោគជ័យ! សូមអរគុណ។";
    emailInput.value = "";
});
