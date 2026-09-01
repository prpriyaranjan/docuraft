import { NextRequest } from "next/server";

// Simple in-memory rate limiter (use Redis in production)
const requests = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyPrefix: "api",
};

// Helper to extract headers from both NextRequest and standard Request
function getHeaders(request: Request | NextRequest): Headers {
  return request.headers;
}

export function rateLimit(
  request: Request | NextRequest,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const cfg = { ...defaultConfig, ...config };
  
  // Get client identifier (IP + User-Agent for better uniqueness)
  const headers = getHeaders(request);
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")
    || "anonymous";
  const userAgent = headers.get("user-agent") || "";
  const key = `${cfg.keyPrefix}:${ip}:${userAgent.slice(0, 50)}`;

  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    // First request or window expired
    requests.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { allowed: true, remaining: cfg.maxRequests - 1, resetAt: now + cfg.windowMs };
  }

  if (record.count >= cfg.maxRequests) {
    // Rate limited
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment counter
  record.count++;
  requests.set(key, record);
  return { allowed: true, remaining: cfg.maxRequests - record.count, resetAt: record.resetAt };
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    "X-RateLimit-Limit": defaultConfig.maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
  };
}

// Specific rate limiters for sensitive endpoints
export const authRateLimit = (request: Request | NextRequest) =>
  rateLimit(request, { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "auth" }); // 5 requests per 15 min

export const paymentRateLimit = (request: Request | NextRequest) =>
  rateLimit(request, { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: "payment" }); // 10 requests per min

export const apiRateLimit = (request: Request | NextRequest) =>
  rateLimit(request, { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: "api" }); // 60 requests per min

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requests.entries()) {
    if (now > record.resetAt) {
      requests.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes