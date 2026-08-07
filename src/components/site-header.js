const navigationItems = [
  { id: "home", href: "/", label: "Home" },
  {
    id: "books",
    href: "/books/",
    label: "Books",
  },
  { id: "blog", href: "/blog/", label: "Blog" },
  { id: "about", href: "/about/", label: "About" },
];

const labelsByLanguage = {
  de: {
    home: "Chilly Hill Startseite",
    navigation: "Hauptnavigation",
  },
  en: {
    home: "Chilly Hill home",
    navigation: "Main navigation",
  },
  it: {
    home: "Pagina iniziale di Chilly Hill",
    navigation: "Navigazione principale",
  },
  ru: {
    home: "На главную Chilly Hill",
    navigation: "Основная навигация",
  },
  uk: {
    home: "На головну Chilly Hill",
    navigation: "Основна навігація",
  },
};

const siteHeaderMarkerPattern =
  /^([\t ]*)<!-- @site-header active-page="([^"]+)" language="([^"]+)" -->$/gm;

const assertSupportedConfiguration = ({ activePage, language }) => {
  if (!navigationItems.some((item) => item.id === activePage)) {
    throw new Error(`Unsupported active site navigation page: ${activePage}`);
  }

  if (!Object.hasOwn(labelsByLanguage, language)) {
    throw new Error(`Unsupported site header language: ${language}`);
  }
};

const indentHtml = (html, indentation) => {
  return html
    .split("\n")
    .map((line) => (line ? `${indentation}${line}` : ""))
    .join("\n");
};

export function renderSiteHeader({ activePage, language }) {
  assertSupportedConfiguration({ activePage, language });

  const labels = labelsByLanguage[language];
  const navigation = navigationItems
    .map((item) => {
      const currentPageAttribute = item.id === activePage ? ' aria-current="page"' : "";

      return `    <a href="${item.href}"${currentPageAttribute}>${item.label}</a>`;
    })
    .join("\n");

  return `<header class="site-header max-w-container">
  <a class="home-link" href="/" aria-label="${labels.home}">
    <img src="/assets/svg/favicon.svg" alt="" width="24" height="24">
    <span>Chilly Hill</span>
  </a>

  <nav class="site-nav" aria-label="${labels.navigation}">
${navigation}
  </nav>
</header>`;
}

export function renderSiteHeaderMarker(html, sourceName = "HTML document") {
  let markerCount = 0;
  const renderedHtml = html.replace(
    siteHeaderMarkerPattern,
    (_marker, indentation, activePage, language) => {
      markerCount += 1;

      return indentHtml(renderSiteHeader({ activePage, language }), indentation);
    },
  );

  if (markerCount > 1) {
    throw new Error(`${sourceName} must not contain more than one site header marker.`);
  }

  return renderedHtml;
}
