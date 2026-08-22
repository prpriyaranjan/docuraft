const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export type RazorpayOrder = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
};

export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const url = "https://api.razorpay.com/v1/orders";
  const body = { amount: amountInPaise, currency: "INR", receipt };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Razorpay order creation failed: ${text}`);
  }

  const data = (await resp.json()) as RazorpayOrder;
  return data;
}
