import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bookPages = ["en", "de", "ru", "uk"];

const getTextContent = (html) => {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

for (const language of bookPages) {
  test(`${language} book page presents the promotion and subscription context`, async () => {
    const html = await readFile(
      `src/books/magic-mushrooms-101/${language}/index.html`,
      "utf8",
    );
    const promotion = html.match(
      /<aside class="feedback-request"[\s\S]*?<\/aside>/,
    )?.[0];
    const subscriptionNote = html.match(
      /<p id="subscribe-note" class="subscribe-note">([\s\S]*?)<\/p>/,
    )?.[1];

    assert.ok(promotion, "book page must include a promotional banner");
    assert.match(promotion, /href="mailto:chillyhill@proton\.me"/);
    assert.ok(
      getTextContent(promotion).length > 40,
      "promotion must include useful copy",
    );

    assert.ok(
      subscriptionNote,
      "subscription form must have an introductory note",
    );
    assert.ok(
      getTextContent(subscriptionNote).length > 20,
      "subscription note must contain visible text",
    );
    assert.match(
      html,
      /src="https:\/\/chillyhill\.substack\.com\/embed\?transparent=1"/,
    );
  });
}
