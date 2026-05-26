/* ╔══════════════════════════════════════════════╗
   ║  Digital Badges Portfolio – Application JS   ║
   ╚══════════════════════════════════════════════╝ */

// ── Badge Data ──
// Replace these with your real badges. Each entry populates a card.
const badges = [
  // ─── Certifications (proctored exams) ───
  {
    tier: "certification",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    credentialId: "XXXXX",
    description:
      "Validates foundational understanding of AWS Cloud concepts, services, security, architecture, pricing, and support.",
    skills: ["AWS", "Cloud Concepts", "Security", "Billing & Pricing"],
    verifyUrl: "https://www.credly.com/badges/",
    image: "badges/aws-cloud-practitioner-certification.png",
  },
  {
    tier: "certification",
    title: "CompTIA Linux+",
    issuer: "CompTIA",
    credentialId: "XXXXX",
    description:
      "Validates competencies in system administration, security, scripting, containers, troubleshooting, and automation on Linux systems.",
    skills: ["Linux", "System Administration", "Security", "Shell Scripting", "Troubleshooting"],
    verifyUrl: "https://www.credly.com/badges/",
    image: "badges/comptia-linux-plus-certification.png",
  },

  // ─── Courses (online learning completions) ───
  {
    tier: "course",
    title: "AWS Academy Accredited Educator",
    issuer: "Amazon Web Services",
    credentialId: "XXXXX",
    description:
      "Recognizes educators who have completed AWS Academy training and are accredited to deliver AWS curriculum.",
    skills: ["AWS", "Cloud Education", "Curriculum Delivery"],
    verifyUrl: "https://www.credly.com/badges/",
    image: "badges/aws-academy-accredited-educator.png",
  },
  {
    tier: "course",
    title: "Google Project Management Certificate",
    issuer: "Google",
    credentialId: "XXXXX",
    description:
      "Covers the foundations of project management including Agile methodologies, strategic communication, and stakeholder management.",
    skills: ["Project Management", "Agile", "Scrum", "Stakeholder Management"],
    verifyUrl: "https://www.coursera.org/account/accomplishments/",
    image: "badges/google-project-management-certificate-of-completion.png",
  },
];

// ── Render ──
function createBadgeCard(badge, index) {
  const isCert = badge.tier === "certification";
  const card = document.createElement("div");
  card.className = "badge-card";
  card.dataset.tier = badge.tier;
  card.dataset.index = index;
  card.style.transitionDelay = `${(index % 8) * 60}ms`;

  const skillsHtml = badge.skills
    .slice(0, 4)
    .map((s) => `<span class="badge-card__skill">${s}</span>`)
    .join("");

  card.innerHTML = `
    <div class="badge-card__top">
      <img class="badge-card__image" src="${badge.image}" alt="${badge.title}" loading="lazy"
           onerror="this.onerror=null;this.src='data:image/svg+xml,${encodeURIComponent(generatePlaceholderSvg(badge.title, isCert))}';" />
      <div class="badge-card__info">
        <div class="badge-card__title">${badge.title}</div>
        <div class="badge-card__issuer">${badge.issuer}</div>
      </div>
    </div>
    <div class="badge-card__skills">${skillsHtml}</div>
    <div class="badge-card__bottom">
      <span class="badge-card__tag ${isCert ? "badge-card__tag--cert" : "badge-card__tag--course"}">
        ${isCert ? "Certification" : "Course"}
      </span>
    </div>
  `;

  card.addEventListener("click", () => openModal(badge));
  return card;
}

function generatePlaceholderSvg(title, isCert) {
  const initials = title
    .split(/[\s\-–]+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const color = isCert ? "#6c5ce7" : "#00cec9";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="16" fill="${color}20"/>
    <text x="60" y="66" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="32" fill="${color}">${initials}</text>
  </svg>`;
}


function populateGrid() {
  const certGrid = document.getElementById("cert-grid");
  const courseGrid = document.getElementById("course-grid");
  certGrid.innerHTML = "";
  courseGrid.innerHTML = "";

  badges.forEach((badge, i) => {
    const card = createBadgeCard(badge, i);
    if (badge.tier === "certification") certGrid.appendChild(card);
    else courseGrid.appendChild(card);
  });

  requestAnimationFrame(() => {
    document.querySelectorAll(".badge-card").forEach((c) => c.classList.add("visible"));
  });
}

// ── Hero Stats Counter ──
function animateStats() {
  const certs = badges.filter((b) => b.tier === "certification").length;
  const courses = badges.filter((b) => b.tier === "course").length;
  const providers = new Set(badges.map((b) => b.issuer.split("–")[0].trim())).size;

  const map = { certifications: certs, courses: courses, providers: providers };

  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = map[el.dataset.count] || 0;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 35);
  });
}

// ── Filtering + Search ──
function applyFilters() {
  const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
  const query = document.querySelector(".filters__search-input").value.toLowerCase();

  const certSection = document.getElementById("certifications");
  const courseSection = document.getElementById("courses");

  certSection.classList.toggle("hidden", activeFilter === "course");
  courseSection.classList.toggle("hidden", activeFilter === "certification");

  document.querySelectorAll(".badge-card").forEach((card) => {
    const idx = parseInt(card.dataset.index);
    const badge = badges[idx];
    const matchesFilter =
      activeFilter === "all" || badge.tier === activeFilter;
    const matchesSearch =
      !query ||
      badge.title.toLowerCase().includes(query) ||
      badge.issuer.toLowerCase().includes(query) ||
      badge.skills.some((s) => s.toLowerCase().includes(query));

    card.classList.toggle("hidden", !(matchesFilter && matchesSearch));
  });

  [certSection, courseSection].forEach((section) => {
    if (section.classList.contains("hidden")) return;
    const grid = section.querySelector(".badge-grid");
    const visible = grid.querySelectorAll(".badge-card:not(.hidden)");
    const existing = grid.querySelector(".no-results");
    if (visible.length === 0 && !existing) {
      const msg = document.createElement("div");
      msg.className = "no-results";
      msg.textContent = "No badges match your search.";
      grid.appendChild(msg);
    } else if (visible.length > 0 && existing) {
      existing.remove();
    }
  });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

document.querySelector(".filters__search-input").addEventListener("input", applyFilters);

// ── Modal ──
function openModal(badge) {
  const isCert = badge.tier === "certification";
  const modal = document.getElementById("modal");

  const imgContainer = document.getElementById("modal-image");
  imgContainer.className = `modal__badge-image ${isCert ? "cert-glow" : "course-glow"}`;
  imgContainer.innerHTML = `<img src="${badge.image}" alt="${badge.title}"
    onerror="this.onerror=null;this.src='data:image/svg+xml,${encodeURIComponent(generatePlaceholderSvg(badge.title, isCert))}';" />`;

  const tierEl = document.getElementById("modal-tier");
  tierEl.textContent = isCert ? "Professional Certification" : "Course Completion";
  tierEl.className = `modal__tier ${isCert ? "cert" : "course"}`;

  document.getElementById("modal-title").textContent = badge.title;
  document.getElementById("modal-issuer").textContent = badge.issuer;
  document.getElementById("modal-desc").textContent = badge.description;
  document.getElementById("modal-cred").textContent = badge.credentialId;
  document.getElementById("modal-skills").textContent = badge.skills.join(", ");
  document.getElementById("modal-link").href = badge.verifyUrl;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelector(".modal__close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ── Scroll-reveal (Intersection Observer) ──
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".badge-card").forEach((card) => {
    card.classList.remove("visible");
    observer.observe(card);
  });
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  populateGrid();
  animateStats();
  setupScrollReveal();
});
