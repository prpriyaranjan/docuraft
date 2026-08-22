import { test, expect, request as playwrightRequest } from '@playwright/test';
import crypto from 'crypto';

test('webhook endpoint accepts signed payload', async ({ request }) => {
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: { entity: { id: 'pay_e2e_1', amount: 1000, order_id: 'order_e2e_1' } },
    },
  };

  const body = JSON.stringify(payload);
  const secret = process.env.RAZORPAY_KEY_SECRET ?? 'test_secret_123';
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  const res = await request.post('/api/payments/webhook', {
    data: body,
    headers: { 'content-type': 'application/json', 'x-razorpay-signature': signature },
  });

  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toEqual({ ok: true });
});
