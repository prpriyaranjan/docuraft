import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeText, validateAmount, isValidTemplateId } from "./validation";

test("sanitizeText collapses whitespace and trims", () => {
  assert.equal(sanitizeText("  hello   world \n"), "hello world");
});

test("validateAmount accepts positive finite numbers", () => {
  assert.equal(validateAmount(5), true);
  assert.equal(validateAmount(0), false);
  assert.equal(validateAmount(NaN), false);
});

test("isValidTemplateId requires length > 2", () => {
  assert.equal(isValidTemplateId("a"), false);
  assert.equal(isValidTemplateId("ab"), false);
  assert.equal(isValidTemplateId("abc"), true);
});
