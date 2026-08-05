import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const booksPath = "src/books/books.json";
const books = JSON.parse(await readFile(booksPath, "utf8"));

test("books.json structure is valid", () => {
  assert.ok(Array.isArray(books), "books.json must be an array");

  for (const book of books) {
    assert.ok(book.id, "book must have an id");
    assert.ok(book.amazonLink, `book ${book.id} must have an amazonLink`);
    assert.ok(book.locales, `book ${book.id} must have locales`);

    const languages = Object.keys(book.locales);
    assert.ok(languages.length > 0, `book ${book.id} must have at least one language`);

    for (const lang of languages) {
      const locale = book.locales[lang];
      const requiredFields = [
        "title",
        "description",
        "lead",
        "content",
        "downloadPdf",
        "downloadEpub",
        "readOnline",
        "feedbackCopy",
        "feedbackLink",
        "coverAlt",
        "subscribeNote",
        "langLabel",
        "languageNames",
      ];

      for (const field of requiredFields) {
        assert.ok(locale[field], `book ${book.id} language ${lang} must have field ${field}`);
      }

      // Check that languageNames contains entries for all available languages of this book
      for (const bookLang of languages) {
        assert.ok(
          locale.languageNames[bookLang],
          `book ${book.id} language ${lang} must have name for ${bookLang} in languageNames`,
        );
      }
    }
  }
});
