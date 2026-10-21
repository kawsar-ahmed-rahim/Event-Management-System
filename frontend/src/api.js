const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

// The token is sent as a Bearer header. This works across different domains
// (e.g. two *.vercel.app projects) where third-party cookies are often blocked.
export const tokenStore = {
  get: () => localStorage.getItem("token"),
  set: (t) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(path, { method = "GET", body, params } = {}) {
  const url = new URL(BASE + path);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, credentials: "include" });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || "Something went wrong", res.status, data?.errors);
  return data;
}
