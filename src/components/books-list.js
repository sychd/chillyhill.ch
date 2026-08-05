export function renderBooksList({ books, language }) {
  const labels = {
    en: { title: "Books", nav: "Main navigation" },
    ru: { title: "Книги", nav: "Основная навигация" },
    de: { title: "Bücher", nav: "Hauptnavigation" },
    uk: { title: "Книги", nav: "Основна навігація" },
  };
  const label = labels[language] || labels.en;

  const booksHtml = books
    .map((book) => {
      const locale = book.locales.en; // Always use English cover and title as requested
      return `
      <div class="book-item">
        <a href="/books/${book.id}/en/">
          <div class="book-item-cover-wrapper">
            <img src="/assets/books/${book.id}-en/cover.webp" alt="${locale.title}" class="book-item-cover">
          </div>
          <span class="book-item-title">${locale.title}</span>
        </a>
      </div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${label.title} — Chilly Hill</title>
    <link rel="icon" href="../assets/svg/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../css/main.css" />
    <style>
      .books-main {
        padding-top: 4rem;
        padding-bottom: 4rem;
      }
      .books-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 3rem;
        margin-top: 3rem;
      }
      .book-item {
        width: 240px;
        text-align: center;
      }
      .book-item-cover-wrapper {
        aspect-ratio: 1410 / 2250;
        background-color: #f0f4f8;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .book-item:hover .book-item-cover-wrapper {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3);
      }
      .book-item-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .book-item-title {
        display: block;
        margin-top: 1.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        text-decoration: none;
      }
      .book-item a {
        text-decoration: none;
      }
      @media (max-width: 600px) {
        .books-grid {
          justify-content: center;
        }
        .book-item {
          width: 100%;
          max-width: 280px;
        }
      }
    </style>
    <script type="module" src="../js/main.js"></script>
  </head>
  <body class="books-page">
    <svg id="orbit-background" class="orbit-background" viewBox="0 0 1200 1200" aria-hidden="true" focusable="false"></svg>
    
    <!-- @site-header active-page="books" language="${language}" -->

    <main class="books-main max-w-container">
      <h1>${label.title}</h1>
      <div class="books-grid">
        ${booksHtml}
      </div>
    </main>

    <footer class="site-footer">
      <small>&copy; <span id="current-year"></span> Chilly Hill</small>
    </footer>
  </body>
</html>`;
}
