export function renderBookPage({ book, language }) {
  const locale = book.locales[language];
  const otherLanguages = Object.keys(book.locales);

  const languageSwitcher = otherLanguages
    .map((lang) => {
      const isCurrent = lang === language;
      const href = isCurrent ? "./" : `../${lang}/`;
      const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
      return `<a href="${href}" lang="${lang}" hreflang="${lang}"${ariaCurrent}>${lang.toUpperCase()}</a>`;
    })
    .join("\n        ");

  const assetPath = `../../../assets/books/${book.id}-${language}`;

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${locale.description}" />
    <meta name="theme-color" content="#f7fbff" />

    <meta property="og:type" content="book" />
    <meta property="og:title" content="${locale.title} — Chilly Hill" />
    <meta property="og:description" content="${locale.description}" />
    <meta property="og:url" content="https://chillyhill.ch/books/${book.id}/${language}/" />
    <meta property="og:image" content="https://chillyhill.ch/assets/books/${book.id}-${language}/cover.webp" />
    <meta property="og:image:alt" content="${locale.coverAlt}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${locale.title} — Chilly Hill" />
    <meta name="twitter:description" content="${locale.description}" />
    <meta name="twitter:image" content="https://chillyhill.ch/assets/books/${book.id}-${language}/cover.webp" />
    <meta name="twitter:image:alt" content="${locale.coverAlt}" />

    <title>${locale.title} — Chilly Hill</title>

    <link rel="canonical" href="https://chillyhill.ch/books/${book.id}/${language}/" />
    ${otherLanguages
      .map(
        (lang) =>
          `<link rel="alternate" hreflang="${lang}" href="https://chillyhill.ch/books/${book.id}/${lang}/" />`,
      )
      .join("\n    ")}
    <link rel="alternate" hreflang="x-default" href="https://chillyhill.ch/books/${book.id}/en/" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />

    <link rel="icon" href="../../../assets/svg/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="../../../favicon.ico" sizes="any" />
    <link rel="stylesheet" href="../../../css/main.css" />
    <link rel="stylesheet" href="../../../css/book.css" />

    <script type="module" src="../../../js/main.js"></script>
  </head>
  <body class="book-page">
    <svg id="orbit-background" class="orbit-background" viewBox="0 0 1200 1200" aria-hidden="true" focusable="false"></svg>

    <!-- @site-header active-page="books" language="${language}" -->

    <div class="book-language-row max-w-container">
      <nav class="language-switcher" aria-label="${locale.langLabel}">
        ${languageSwitcher}
      </nav>
    </div>

    <main class="book-main max-w-container">
      <article class="book-hero" aria-labelledby="book-title">
        <div class="book-copy">
          <h1 id="book-title">${locale.title}</h1>
          <p class="book-lead">${locale.lead}</p>
          ${locale.content
            .split("\n\n")
            .map((p) => `<p>${p}</p>`)
            .join("\n          ")}

          <div class="download-actions" aria-label="Download or read the book">
            <a class="button button-primary" href="${assetPath}/${book.id}-${language}.pdf" download>
              <span>${locale.downloadPdf}</span>
            </a>
            <a class="button button-secondary" href="${assetPath}/${book.id}-${language}.epub" download>
              <span>${locale.downloadEpub}</span>
            </a>
            <a class="button button-secondary" href="${assetPath}/${book.id}-${language}.pdf" target="_blank" rel="noopener noreferrer">
              <span>${locale.readOnline}</span>
            </a>
          </div>
        </div>

        <figure class="book-cover">
          <img class="book-cover-image" src="${assetPath}/cover.webp" alt="${locale.coverAlt}" width="1410" height="2250" decoding="async" />
        </figure>
      </article>

      <aside class="feedback-request" aria-label="Feedback request">
        <p class="feedback-request-copy">${locale.feedbackCopy}</p>
        <a class="feedback-request-link" target="_blank" rel="noopener noreferrer" href="${book.amazonLink}">${locale.feedbackLink}</a>
      </aside>

      <section class="subscribe-section" aria-labelledby="subscribe-note">
        <p id="subscribe-note" class="subscribe-note">${locale.subscribeNote}</p>

        <iframe class="subscribe-embed" src="https://chillyhill.substack.com/embed?transparent=1" title="Subscribe to Chilly Hill" width="480" height="150" scrolling="no" loading="lazy"></iframe>
      </section>
    </main>

    <footer class="site-footer">
      <small>&copy; <span id="current-year"></span> Chilly Hill</small>
    </footer>
  </body>
</html>`;
}

export function renderBookIndexPage({ book }) {
  const languages = Object.keys(book.locales);
  const localeEn = book.locales.en;

  const links = languages
    .map((lang) => {
      const label = localeEn.languageNames[lang] || lang;
      return `<a href="${lang}/" lang="${lang}">${label}</a>`;
    })
    .join(",\n      ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=en/">
    <title>${localeEn.title} — Chilly Hill</title>
    <link rel="canonical" href="https://chillyhill.ch/books/${book.id}/en/">
  </head>
  <body>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="../../">Home</a>
    </nav>
    <p>
      Continue to the ${links} version.
    </p>
  </body>
</html>`;
}
