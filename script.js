const filterButtons = [...document.querySelectorAll(".filter-button")];
const paperCards = [...document.querySelectorAll(".paper-card, .case-card")];
const revealTargets = [
  ...document.querySelectorAll(".section, .paper-card, .case-card, .media-card, .research-card, .hero-panel"),
];
const feedbackGrid = document.querySelector("[data-feedback-grid]");
const feedbackQuotesScript = document.querySelector("#feedback-quotes");

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

function shuffle(values) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadFeedbackQuotes() {
  if (!feedbackGrid) {
    return;
  }

  try {
    let rawQuotes = [];
    const source = feedbackGrid.dataset.feedbackSource;
    if (source) {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (response.ok) {
          rawQuotes = await response.json();
        }
      } catch (error) {
        console.warn("Unable to load external feedback quotes.", error);
      }
    }

    if (!rawQuotes.length && feedbackQuotesScript) {
      rawQuotes = JSON.parse(feedbackQuotesScript.textContent || "[]");
    }

    const normalizedQuotes = rawQuotes
      .map((entry) => {
        if (typeof entry === "string") {
          return { category: "general", quote: entry.trim() };
        }
        return {
          category: (entry.category || "general").trim(),
          quote: (entry.quote || "").trim(),
        };
      })
      .filter((entry) => entry.quote);
    const uniqueQuotes = [
      ...new Map(normalizedQuotes.map((entry) => [entry.quote, entry])).values(),
    ];
    const courseQuotes = uniqueQuotes.filter((entry) => entry.category === "course");
    const instructorQuotes = uniqueQuotes.filter((entry) => entry.category === "instructor");
    const balancedQuotes = [
      ...shuffle(courseQuotes).slice(0, 3),
      ...shuffle(instructorQuotes).slice(0, 3),
    ];
    const fallbackQuotes = shuffle(uniqueQuotes).slice(0, 6);
    const selectedQuotes = balancedQuotes.length === 6 ? shuffle(balancedQuotes) : fallbackQuotes;
    feedbackGrid.innerHTML = selectedQuotes
      .map((entry) => `<blockquote>“${entry.quote}”</blockquote>`)
      .join("");
  } catch (error) {
    console.warn("Unable to rotate feedback quotes.", error);
  }
}

loadFeedbackQuotes();

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
