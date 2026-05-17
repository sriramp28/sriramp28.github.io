const filterButtons = [...document.querySelectorAll(".filter-button")];
const paperCards = [...document.querySelectorAll(".paper-card, .case-card")];
const revealTargets = [
  ...document.querySelectorAll(".section, .paper-card, .case-card, .media-card, .research-card, .hero-panel"),
];

function setFilter(filter) {
  for (const button of filterButtons) {
    button.classList.toggle("active", button.dataset.filter === filter);
  }

  for (const card of paperCards) {
    const tags = (card.dataset.tags || "").split(/\s+/);
    const visible = filter === "all" || tags.includes(filter);
    card.classList.toggle("hidden", !visible);
  }
}

for (const button of filterButtons) {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.08 },
);

for (const target of revealTargets) {
  target.classList.add("reveal");
  observer.observe(target);
}
