export const isProd = () => process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

export const getClientOrigins = () =>
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
