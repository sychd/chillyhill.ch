import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderBooksList } from "../src/components/books-list.js";

const booksPath = "src/books/books.json";
const books = JSON.parse(await readFile(booksPath, "utf8"));

test("books list renders correctly for English", () => {
  const html = renderBooksList({ books, language: "en" });

  assert.match(html, /<title>Books — Chilly Hill<\/title>/);
  assert.match(html, /<h1>Books<\/h1>/);

  for (const book of books) {
    assert.match(html, new RegExp(`/books/${book.id}/en/`));
    assert.match(html, new RegExp(book.locales.en.title));
  }
});

test("books list renders correctly for Russian", () => {
  const html = renderBooksList({ books, language: "ru" });

  assert.match(html, /<title>Книги — Chilly Hill<\/title>/);
  assert.match(html, /<h1>Книги<\/h1>/);

  // Titles and links should still be in English as per requirements
  for (const book of books) {
    assert.match(html, new RegExp(`/books/${book.id}/en/`));
    assert.match(html, new RegExp(book.locales.en.title));
  }
});
