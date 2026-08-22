import test from "node:test";
import assert from "node:assert/strict";

import { buildAuthPayload, getAuthEndpoint } from "./auth-ui";

test("login uses the login endpoint and trimmed payload", () => {
  assert.equal(getAuthEndpoint("login"), "/api/auth/login");
  assert.deepEqual(
    buildAuthPayload("login", { name: "Ada", email: "ada@example.com", password: "secret123" }),
    { email: "ada@example.com", password: "secret123" },
  );
});

test("register uses the register endpoint and includes the name", () => {
  assert.equal(getAuthEndpoint("register"), "/api/auth/register");
  assert.deepEqual(
    buildAuthPayload("register", { name: "Ada", email: "ada@example.com", password: "secret123" }),
    {
      name: "Ada",
      email: "ada@example.com",
      password: "secret123",
    },
  );
});
