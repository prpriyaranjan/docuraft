export const isVercelPreview = process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
export const isDev = process.env.NODE_ENV !== "production";

// Allow fallbacks when running in a Vercel preview or any non-production environment
export const allowFallbacks = isVercelPreview || isDev;

export default allowFallbacks;
