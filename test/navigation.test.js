import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderSiteHeader, renderSiteHeaderMarker } from "../src/components/site-header.js";

const pages = [
  {
    path: "src/index.html",
    activePage: "home",
    language: "en",
    activeLabel: "Home",
    navigationLabel: "Main navigation",
  },
  {
    path: "src/about/index.html",
    activePage: "about",
    language: "en",
    activeLabel: "About",
    navigationLabel: "Main navigation",
  },
  {
    path: "src/blog/index.html",
    activePage: "blog",
    language: "en",
    activeLabel: "Blog",
    navigationLabel: "Main navigation",
  },
];

const bookLanguages = [
  { language: "en", navigationLabel: "Main navigation" },
  { language: "de", navigationLabel: "Hauptnavigation" },
  { language: "ru", navigationLabel: "Основная навигация" },
  { language: "uk", navigationLabel: "Основна навігація" },
];

for (const langConfig of bookLanguages) {
  test(`${langConfig.language} books page header renders accessible navigation`, () => {
    const header = renderSiteHeader({
      activePage: "books",
      language: langConfig.language,
    });
    const navigation = header.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
    const links = navigation?.match(/<a [^>]+>[^<]+<\/a>/g) ?? [];
    const activeLinks = links.filter((link) => link.includes('aria-current="page"'));

    assert.ok(navigation, "header must contain the main navigation");
    assert.match(navigation, new RegExp(`aria-label="${langConfig.navigationLabel}"`));
    assert.equal(activeLinks.length, 1);
    assert.ok(activeLinks[0].includes(">Books</a>"));
  });
}

for (const page of pages) {
  test(`${page.path} configures the shared site header`, async () => {
    const html = await readFile(page.path, "utf8");
    const marker = `<!-- @site-header active-page="${page.activePage}" language="${page.language}" -->`;

    assert.ok(html.includes(marker), "page must declare its shared header context");
    assert.doesNotMatch(html, /<header class="site-header/);
  });

  test(`${page.language} ${page.activePage} header renders accessible navigation`, () => {
    const header = renderSiteHeader({
      activePage: page.activePage,
      language: page.language,
    });
    const navigation = header.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
    const links = navigation?.match(/<a [^>]+>[^<]+<\/a>/g) ?? [];
    const activeLinks = links.filter((link) => link.includes('aria-current="page"'));

    assert.ok(navigation, "header must contain the main navigation");
    assert.match(navigation, new RegExp(`aria-label="${page.navigationLabel}"`));
    assert.match(links[0], /<a href="\/"(?: aria-current="page")?>Home<\/a>/);
    assert.equal(activeLinks.length, 1);
    assert.ok(activeLinks[0].endsWith(`>${page.activeLabel}</a>`));
  });
}

test("site header marker is replaced while preserving its indentation", () => {
  const source = [
    "<body>",
    '  <!-- @site-header active-page="home" language="en" -->',
    "</body>",
  ].join("\n");

  const rendered = renderSiteHeaderMarker(source, "example.html");

  assert.doesNotMatch(rendered, /@site-header/);
  assert.match(rendered, /\n {2}<header class="site-header max-w-container">/);
  assert.match(rendered, /\n {4}<nav class="site-nav"/);
});
