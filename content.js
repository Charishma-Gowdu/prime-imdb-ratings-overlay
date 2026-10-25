
(() => {
  console.log("🔥 PRIME IMDb CONTENT SCRIPT IS RUNNING");

  const CARD_SELECTOR = 'article[data-testid="card"]';

  function addRatingBadge(card) {
    if (card.querySelector(".prime-imdb-badge")) return;

    const rawTitle = card.getAttribute("data-card-title")?.trim();
    if (!rawTitle) return;

    const title = rawTitle
        .replace(/\s*-\s*Season\s+\d+$/i, "")
        .trim();

    console.log("Original title:", rawTitle, "| Search title:", title);

    const entityType = card.getAttribute("data-card-entity-type");

    console.log("Raw entity type:", entityType, "| Title:", title);

    const normalizedType = entityType?.toLowerCase() || "";

    const mediaType =
        normalizedType.includes("tv show") ||
        normalizedType.includes("series")
            ? "series"
            : "movie";

    console.log("Title:",title,"| Type:",mediaType);

    const packshot = card.querySelector('[data-testid="packshot"]');
    if (!packshot) return;

    const badge = document.createElement("div");
    badge.className = "prime-imdb-badge";
    chrome.runtime.sendMessage(
        {
            type: "GET_IMDB_RATING",
            title: title,
            mediaType: mediaType
        },
        response => {
            if (chrome.runtime.lastError) {
                console.error(
                    "Extension messaging error:",
                    chrome.runtime.lastError.message
                );
                badge.textContent = "⭐ IMDb: N/A";
                return;
            }
            console.log("OMDb lookup details:", JSON.stringify({
                title,
                mediaType,
                response
            }, null, 2));

            if (!response?.success) {
                console.warn("Rating lookup failed:", {
                    title,
                    mediaType,
                    reason: response?.error
                });
            }
            if(response && response.success) {
                badge.textContent = `⭐ IMDb: ${response.rating}`;
                badge.title = `${response.title} - IMDb rating: ${response.rating}`;
            } else {
                badge.textContent = "⭐ IMDb: N/A";
                badge.title = response?.error || "IMDb rating unavailable";
            }
        }
    );

    Object.assign(badge.style, {
      position: "absolute",
      top: "8px",
      left: "8px",
      zIndex: "999",
      background: "#f5c518",
      color: "#111",
      padding: "5px 8px",
      borderRadius: "5px",
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      pointerEvents: "none"
    });

    if (getComputedStyle(packshot).position === "static") {
      packshot.style.position = "relative";
    }

    packshot.appendChild(badge);
  }

  function scanCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach(addRatingBadge);
  }

  scanCards();

  const observer = new MutationObserver(scanCards);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log("Prime IMDb extension initialized");
})();