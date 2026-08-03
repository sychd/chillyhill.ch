import assert from "node:assert/strict";
import test from "node:test";
import { shouldPauseOrbitBackground } from "../src/js/orbit-bg.js";

test("the orbit animation pauses while an opaque reader covers it", () => {
  assert.equal(shouldPauseOrbitBackground({ isReaderOpen: true }), true);
  assert.equal(shouldPauseOrbitBackground({ isReaderOpen: false }), false);
});

test("the orbit animation respects page visibility and reduced motion", () => {
  assert.equal(shouldPauseOrbitBackground({ isDocumentHidden: true }), true);
  assert.equal(shouldPauseOrbitBackground({ prefersReducedMotion: true }), true);
});
