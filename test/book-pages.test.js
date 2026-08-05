import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderBookIndexPage, renderBookPage } from "../src/components/book-page.js";

const booksPath = "src/books/books.json";
const books = JSON.parse(await readFile(booksPath, "utf8"));

const getTextContent = (html) => {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

for (const book of books) {
  for (const language of Object.keys(book.locales)) {
    test(`${book.id} (${language}) book page renders correctly`, () => {
      const html = renderBookPage({ book, language });
      const locale = book.locales[language];

      assert.ok(html.includes(`<title>${locale.title} — Chilly Hill</title>`));
      assert.ok(html.includes(`class="book-lead">${locale.lead}</p>`));

      // Check multi-paragraph content
      const paragraphs = locale.content.split("\n\n");
      for (const p of paragraphs) {
        // We need to escape some characters if they exist in text for RegExp,
        // but here simple includes should work since we're checking if text is present inside <p>
        assert.ok(
          html.includes(`<p>${p}</p>`),
          `page must contain paragraph: ${p.substring(0, 20)}...`,
        );
      }

      assert.match(html, /<aside class="feedback-request"/);
      assert.match(html, new RegExp(book.amazonLink));

      const subscriptionNote = html.match(
        /<p id="subscribe-note" class="subscribe-note">([\s\S]*?)<\/p>/,
      )?.[1];
      assert.ok(subscriptionNote, "must include subscription note");
      assert.equal(getTextContent(subscriptionNote), locale.subscribeNote);
    });
  }

  test(`${book.id} index page renders correctly`, () => {
    const html = renderBookIndexPage({ book });
    assert.match(html, /<meta http-equiv="refresh" content="0; url=en\/">/);
    assert.match(html, new RegExp(`${book.locales.en.title} — Chilly Hill`));

    for (const lang of Object.keys(book.locales)) {
      assert.match(html, new RegExp(`<a href="${lang}/" lang="${lang}">`));
    }
  });
}
