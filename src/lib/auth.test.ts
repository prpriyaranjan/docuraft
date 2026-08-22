import test from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword, signToken, verifyToken } from "./auth";

test("password hashing and verification", async () => {
  const hash = await hashPassword("secret123");
  const ok = await verifyPassword("secret123", hash);
  assert.equal(ok, true);
});

test("sign and verify token roundtrip", () => {
  const token = signToken({ userId: "user_1", email: "test@example.com" });
  const payload = verifyToken(token);

  assert.equal(payload.userId, "user_1");
  assert.equal(payload.email, "test@example.com");
});
