import crypto from "crypto";

const secret = process.env.AUTH_SECRET ?? "docucraft-dev-secret";

export type DownloadTokenPayload = {
  templateId: string;
  paymentId: string;
  amount: number;
  exp?: number;
};

function encodeValue(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeValue(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createDownloadToken(payload: Omit<DownloadTokenPayload, "exp">) {
  const now = Math.floor(Date.now() / 1000);
  const data = {
    ...payload,
    exp: now + 60 * 60 * 24,
  };

  const header = encodeValue(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeValue(JSON.stringify(data));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyDownloadToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [header, body, signature] = parts;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) {
    throw new Error("Invalid token");
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(decodeValue(body)) as DownloadTokenPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}
