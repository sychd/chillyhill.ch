import "./orbit-bg.js";

const imageSources = [
  "assets/images/1.png",
  "assets/images/2.png",
  "assets/images/3.png",
  "assets/images/4.png",
  "assets/images/5.png",
  "assets/images/6.png",
];

const minIntervalMs = 3_000;
const maxIntervalMs = 15_000;
const imageFadeMs = 400;

const imageElements = Array.from(document.querySelectorAll("[data-rotating-image]"));
const yearElement = document.querySelector("#current-year");

let deck = [];
let activeImageIndex = 0;
let currentSource = imageElements[activeImageIndex]?.getAttribute("src") ?? "";
let rotationTimer = 0;

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

function shuffle(values) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function refillDeck() {
  deck = shuffle(imageSources.filter((source) => source !== currentSource));
}

function randomInterval() {
  return Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
}

function nextImageSource() {
  if (deck.length === 0) {
    refillDeck();
  }

  return deck.shift();
}

function preloadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(source);
    image.onerror = reject;
    image.src = source;
  });
}

async function rotateImage() {
  if (imageElements.length < 2 || imageSources.length < 2) {
    return;
  }

  const nextSource = nextImageSource();

  try {
    await preloadImage(nextSource);
  } catch {
    scheduleRotation();
    return;
  }

  const nextImageIndex = activeImageIndex === 0 ? 1 : 0;
  const currentImage = imageElements[activeImageIndex];
  const nextImage = imageElements[nextImageIndex];

  nextImage.src = nextSource;
  nextImage.alt = "Abstract Chilly Hill visual";
  nextImage.removeAttribute("aria-hidden");
  currentImage.alt = "";
  currentImage.setAttribute("aria-hidden", "true");

  nextImage.classList.add("is-entering");

  requestAnimationFrame(() => {
    nextImage.classList.add("is-active");
  });

  window.setTimeout(() => {
    currentImage.classList.remove("is-active");
    nextImage.classList.remove("is-entering");
  }, imageFadeMs);

  activeImageIndex = nextImageIndex;
  currentSource = nextSource;
  scheduleRotation();
}

function scheduleRotation() {
  window.clearTimeout(rotationTimer);
  rotationTimer = window.setTimeout(rotateImage, randomInterval());
}

if (imageElements.length > 1 && imageSources.length > 1) {
  refillDeck();
  scheduleRotation();
}
