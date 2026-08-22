import test from "node:test";
import assert from "node:assert/strict";

import { createDownloadToken, verifyDownloadToken } from "./security";

test("create and verify download token roundtrip", () => {
  const token = createDownloadToken({ templateId: "resume-modern-001", paymentId: "upi_1234", amount: 5 });
  const payload = verifyDownloadToken(token);

  assert.equal(payload.templateId, "resume-modern-001");
  assert.equal(payload.paymentId, "upi_1234");
  assert.equal(payload.amount, 5);
  assert.ok(payload.exp && payload.exp > Math.floor(Date.now() / 1000));
});
import test from "node:test";
import assert from "node:assert/strict";

import { getTemplateById } from "@/data/templates";
import { buildUpiPaymentLink, buildUpiQrCodeUrl } from "./payment";
import { createDownloadToken, verifyDownloadToken } from "./security";

test("download token round trip remains valid for a verified payment", () => {
  const token = createDownloadToken({
    templateId: "resume-modern-001",
    paymentId: "pay_demo_123",
    amount: 5,
  });

  const decoded = verifyDownloadToken(token);

  assert.equal(decoded.templateId, "resume-modern-001");
  assert.equal(decoded.paymentId, "pay_demo_123");
  assert.equal(decoded.amount, 5);
});

test("missing template ids return undefined instead of falling back silently", () => {
  assert.equal(getTemplateById("missing-template"), undefined);
  assert.equal(getTemplateById("resume-modern-001")?.id, "resume-modern-001");
});

test("upi deep link uses the seller UPI id for direct transfers", () => {
  const link = buildUpiPaymentLink({
    amount: 5,
    templateName: "Modern Professional",
    orderId: "docucraft-order-1",
  });

  assert.match(link, /pa=9472946712%40ybl/);
  assert.match(link, /am=5/);
  assert.match(link, /tn=DocuCraft%20Modern%20Professional/);
});

test("upi qr code uses the direct merchant payment link", () => {
  const qrUrl = buildUpiQrCodeUrl({
    amount: 5,
    templateName: "Modern Professional",
    orderId: "docucraft-order-1",
  });

  assert.match(qrUrl, /api\.qrserver\.com/);
  assert.match(qrUrl, /9472946712%2540ybl/);
});
