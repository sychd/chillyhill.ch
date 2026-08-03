import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  { path: "src/index.html", url: "https://chillyhill.ch/", isHome: true },
  { path: "src/about/index.html", url: "https://chillyhill.ch/about/" },
  { path: "src/blog/index.html", url: "https://chillyhill.ch/blog/" },
  {
    path: "src/books/magic-mushrooms-101/index.html",
    url: "https://chillyhill.ch/books/magic-mushrooms-101/",
  },
  {
    path: "src/books/magic-mushrooms-101/en/index.html",
    url: "https://chillyhill.ch/books/magic-mushrooms-101/en/",
  },
  {
    path: "src/books/magic-mushrooms-101/de/index.html",
    url: "https://chillyhill.ch/books/magic-mushrooms-101/de/",
  },
  {
    path: "src/books/magic-mushrooms-101/ru/index.html",
    url: "https://chillyhill.ch/books/magic-mushrooms-101/ru/",
  },
  {
    path: "src/books/magic-mushrooms-101/uk/index.html",
    url: "https://chillyhill.ch/books/magic-mushrooms-101/uk/",
  },
];

for (const page of pages) {
  test(`${page.path} starts its main navigation with the home page`, async () => {
    const html = await readFile(page.path, "utf8");
    const navigation = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
    const firstLink = navigation?.match(/<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/);

    assert.ok(firstLink, "main navigation must contain a link");
    assert.equal(firstLink[3], "Home");
    assert.equal(new URL(firstLink[1], page.url).pathname, "/");
    assert.equal(firstLink[2].includes('aria-current="page"'), page.isHome === true);
  });
}
