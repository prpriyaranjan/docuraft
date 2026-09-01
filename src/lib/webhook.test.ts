import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// Set the secret before importing the route so it reads the env var at module init
process.env.RAZORPAY_KEY_SECRET = "test_secret_123";

test("webhook verifies signature and returns ok", async () => {
  const payload = {
    event: "payment.captured",
    payload: {
      payment: { entity: { id: "pay_test_1", amount: 500, order_id: "order_test_1" } },
    },
  };

  const bodyText = JSON.stringify(payload);

  // compute expected signature using same secret
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(bodyText).digest("hex");

  const { POST } = await import("@/app/api/payments/webhook/route");

  const req = new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    body: bodyText,
    headers: { "x-razorpay-signature": expected },
  });

  const res = await POST(req as unknown as Request);
  const data = await res.json();

  assert.deepEqual(data, { ok: true });
});
