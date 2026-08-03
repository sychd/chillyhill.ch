const FONT_SIZE = {
  default: 100,
  min: 80,
  max: 160,
  step: 10,
};

const LOCATION_BREAK_LENGTH = 1600;

const CHAPTER_SELECTOR = "section.level1:not(.toc-title):not(.unlisted)";

const READER_THEME = {
  body: {
    width: "100% !important",
    "max-width": "48rem !important",
    "margin-left": "auto !important",
    "margin-right": "auto !important",
    "padding-left": "clamp(1.25rem, 6vw, 4rem) !important",
    "padding-right": "clamp(1.25rem, 6vw, 4rem) !important",
  },
  [CHAPTER_SELECTOR]: {
    "padding-top": "clamp(3rem, 8vh, 5rem)",
  },
  [`${CHAPTER_SELECTOR}::before`]: {
    display: "block",
    width: "4rem",
    height: "1px",
    margin: "0 auto clamp(2.5rem, 6vh, 4rem)",
    background: "#d8dde5",
    content: '""',
  },
  [`${CHAPTER_SELECTOR} > h1:first-child`]: {
    "margin-bottom": "clamp(2rem, 5vh, 3.5rem)",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    openButton: document.getElementById("open-reader-btn"),
    closeButton: document.getElementById("close-reader-btn"),
    modal: document.getElementById("reader-modal"),
    epubLink: document.getElementById("epub-download-link"),
    decreaseFontButton: document.getElementById("decrease-font-btn"),
    increaseFontButton: document.getElementById("increase-font-btn"),
    fontSizeValue: document.getElementById("font-size-value"),
    previousPageButton: document.getElementById("previous-page-btn"),
    nextPageButton: document.getElementById("next-page-btn"),
    pageStatus: document.getElementById("reader-page-status"),
    progressStatus: document.getElementById("reader-progress-status"),
  };

  if (Object.values(elements).some((element) => !element)) return;

  const epubUrl = elements.epubLink.getAttribute("href");
  let book = null;
  let rendition = null;
  let latestLocation = null;
  let locationsReady = false;
  let fontSize = FONT_SIZE.default;
  let previouslyFocusedElement = null;
  let isNavigating = false;

  const updateFontControls = () => {
    elements.fontSizeValue.value = `${fontSize}%`;
    elements.fontSizeValue.textContent = `${fontSize}%`;
    elements.decreaseFontButton.disabled = fontSize === FONT_SIZE.min;
    elements.increaseFontButton.disabled = fontSize === FONT_SIZE.max;
  };

  const setFontSize = (nextFontSize) => {
    fontSize = Math.min(FONT_SIZE.max, Math.max(FONT_SIZE.min, nextFontSize));
    rendition?.themes.fontSize(`${fontSize}%`);
    updateFontControls();
  };

  const formatPageStatus = (currentPage, totalPages) => {
    return elements.pageStatus.dataset.pageTemplate
      .replace("{current}", currentPage.toLocaleString())
      .replace("{total}", totalPages.toLocaleString());
  };

  const updateReadingPosition = (location = latestLocation) => {
    latestLocation = location;

    const readerReady = Boolean(rendition && location);
    elements.previousPageButton.disabled =
      isNavigating || !readerReady || Boolean(location?.atStart);
    elements.nextPageButton.disabled = isNavigating || !readerReady || Boolean(location?.atEnd);

    if (!locationsReady || !book || !location?.start?.cfi) return;

    const totalPages = book.locations.length();
    const currentCfi = location.atEnd ? location.end.cfi : location.start.cfi;
    const locationIndex = book.locations.locationFromCfi(currentCfi);

    if (totalPages === 0 || locationIndex < 0) return;

    const currentPage = location.atEnd ? totalPages : Math.min(locationIndex + 1, totalPages);
    const percentage = location.atEnd ? 1 : book.locations.percentageFromCfi(currentCfi);

    elements.pageStatus.textContent = formatPageStatus(currentPage, totalPages);
    elements.progressStatus.textContent = `${Math.round((percentage ?? 0) * 100)}%`;
  };

  const prepareLocations = async () => {
    const storageKey = `${book.key()}-locations`;
    let locationsLoaded = false;

    try {
      const storedLocations = localStorage.getItem(storageKey);

      if (storedLocations) {
        book.locations.load(storedLocations);
        locationsLoaded = book.locations.length() > 0;
      }
    } catch {
      // Storage can be unavailable in private browsing; generation still works in memory.
    }

    if (!locationsLoaded) {
      await book.locations.generate(LOCATION_BREAK_LENGTH);

      try {
        localStorage.setItem(storageKey, book.locations.save());
      } catch {
        // Reading does not depend on caching generated locations.
      }
    }

    locationsReady = true;
    updateReadingPosition(rendition.currentLocation());
  };

  const showReaderError = () => {
    elements.previousPageButton.disabled = true;
    elements.nextPageButton.disabled = true;
    elements.pageStatus.textContent = elements.pageStatus.dataset.errorLabel;
    elements.progressStatus.textContent = "";
  };

  const initializeReader = async () => {
    if (typeof window.ePub !== "function" || !epubUrl) {
      showReaderError();
      return;
    }

    book = window.ePub(epubUrl);
    rendition = book.renderTo("epub-viewer", {
      width: "100%",
      height: "100%",
      manager: "default",
      flow: "paginated",
      spread: "none",
    });

    rendition.themes.default(READER_THEME);
    rendition.themes.fontSize(`${fontSize}%`);
    rendition.on("relocated", updateReadingPosition);
    rendition.on("keyup", handleKeyPress);

    try {
      await rendition.display();
      await book.ready;
      await prepareLocations();
    } catch {
      showReaderError();
    }
  };

  const openReader = () => {
    previouslyFocusedElement = document.activeElement;
    elements.modal.classList.add("is-open");
    elements.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("reader-is-open");
    elements.closeButton.focus();

    if (!rendition) void initializeReader();
  };

  const closeReader = () => {
    elements.modal.classList.remove("is-open");
    elements.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("reader-is-open");
    previouslyFocusedElement?.focus();
  };

  const navigate = async (direction) => {
    if (!rendition || isNavigating) return;

    isNavigating = true;
    updateReadingPosition();

    try {
      await rendition[direction]();
    } finally {
      isNavigating = false;
      updateReadingPosition(rendition.currentLocation());
    }
  };

  function handleKeyPress(event) {
    if (!elements.modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeReader();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      void navigate("prev");
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      void navigate("next");
    }
  }

  updateFontControls();

  elements.openButton.addEventListener("click", openReader);
  elements.closeButton.addEventListener("click", closeReader);
  elements.decreaseFontButton.addEventListener("click", () => {
    setFontSize(fontSize - FONT_SIZE.step);
  });
  elements.increaseFontButton.addEventListener("click", () => {
    setFontSize(fontSize + FONT_SIZE.step);
  });
  elements.previousPageButton.addEventListener("click", () => {
    void navigate("prev");
  });
  elements.nextPageButton.addEventListener("click", () => {
    void navigate("next");
  });
  document.addEventListener("keydown", handleKeyPress);
});
