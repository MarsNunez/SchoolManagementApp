export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchJSON(path, options = {}) {
  const mergedHeaders = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("staffProfile");
      } catch {}
      // Optional immediate redirect for unauthorized
      if (!options?.suppressRedirect) {
        try { window.location.assign("/login"); } catch {}
      }
    }
    const message = data?.message || data?.error || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}
