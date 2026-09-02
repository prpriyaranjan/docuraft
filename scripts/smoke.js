const base = process.env.BASE_URL || 'http://localhost:3002';
const headers = { 'Content-Type': 'application/json' };

async function post(path, body, token) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, body: json };
}

(async () => {
  console.log('Base URL:', base);

  console.log('\n1) Registering a test user');
  const reg = await post('/api/auth/register', { email: 'smoke@test.local', password: 'password', name: 'Smoke' });
  console.log('Status:', reg.status);
  console.log('Body:', JSON.stringify(reg.body, null, 2));

  const token = reg.body && reg.body.token ? reg.body.token : null;
  if (!token) {
    console.error('No token received from register; aborting further smoke tests.');
    process.exit(reg.status === 201 || reg.status === 200 ? 0 : 1);
  }

  console.log('\n2) Creating a Razorpay order (via API)');
  const pay = await post('/api/payments/razorpay', { amount: 1000, receipt: 'smoke-receipt' }, token);
  console.log('Status:', pay.status);
  console.log('Body:', JSON.stringify(pay.body, null, 2));

  console.log('\n3) Creating an order record');
  const ord = await post('/api/orders', { templateId: 'tmpl_test', amount: 1000, paymentId: pay.body?.id ?? 'smoke_payment_1' }, token);
  console.log('Status:', ord.status);
  console.log('Body:', JSON.stringify(ord.body, null, 2));

  process.exit(0);
})();
