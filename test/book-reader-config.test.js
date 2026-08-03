import assert from "node:assert/strict";
import test from "node:test";
import {
  createReaderRenderOptions,
  READER_THEME,
  resizeRenditionToContainer,
} from "../src/js/book-reader-config.js";

test("the reader always renders a single paginated page", () => {
  assert.deepEqual(createReaderRenderOptions(), {
    width: "100%",
    height: "100%",
    manager: "default",
    flow: "paginated",
    spread: "none",
    allowScriptedContent: false,
  });
});

test("each rendition receives independent mutable settings", () => {
  const firstOptions = createReaderRenderOptions();
  const secondOptions = createReaderRenderOptions();

  firstOptions.width = 320;
  firstOptions.flow = "scrolled";

  assert.notEqual(firstOptions, secondOptions);
  assert.equal(firstOptions.width, 320);
  assert.equal(firstOptions.flow, "scrolled");
  assert.equal(secondOptions.width, "100%");
  assert.equal(secondOptions.flow, "paginated");
});

test("the EPUB document width includes its responsive page gutters", () => {
  assert.equal(READER_THEME.html.width, "100% !important");
  assert.equal(READER_THEME.html["max-width"], "100% !important");
  assert.equal(READER_THEME.html["overflow-x"], "hidden !important");
  assert.equal(READER_THEME.body.width, "100% !important");
  assert.equal(READER_THEME.body["box-sizing"], "border-box !important");
  assert.equal(READER_THEME.body["overflow-wrap"], "anywhere");
});

test("the rendition follows the visible reader container size", () => {
  const resizeCalls = [];
  const rendition = {
    resize: (width, height) => resizeCalls.push({ width, height }),
  };

  assert.equal(
    resizeRenditionToContainer(rendition, { clientWidth: 321.8, clientHeight: 600.9 }),
    true,
  );
  assert.deepEqual(resizeCalls, [{ width: 321, height: 600 }]);
});

test("a hidden reader is not resized to zero", () => {
  const rendition = { resize: () => assert.fail("resize must not be called") };

  assert.equal(resizeRenditionToContainer(rendition, { clientWidth: 0, clientHeight: 600 }), false);
});
