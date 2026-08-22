export const SELLER_UPI_ID = "9472946712@ybl";

export function buildUpiPaymentLink({
  amount,
  templateName,
  orderId,
}: {
  amount: number;
  templateName: string;
  orderId: string;
}) {
  const cleanName = templateName.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "DocuCraft";
  const params = [
    ["pa", SELLER_UPI_ID],
    ["pn", "DocuCraft"],
    ["am", String(amount)],
    ["cu", "INR"],
    ["tn", `DocuCraft ${cleanName}`],
    ["mc", ""],
    ["mode", "02"],
    ["purpose", "00"],
    ["orgid", ""],
    ["url", ""],
    ["tr", orderId],
  ]
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `upi://pay?${params}`;
}

export function buildUpiQrCodeUrl({
  amount,
  templateName,
  orderId,
}: {
  amount: number;
  templateName: string;
  orderId: string;
}) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    buildUpiPaymentLink({ amount, templateName, orderId }),
  )}`;
}
