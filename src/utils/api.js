export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

let onUnauthorized = null;

/** Appelé sur 401 — ex. déconnexion automatique (AuthContext) */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === "function" ? handler : null;
}

export function buildUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** URL affichable pour images (Cloudinary, chemins /uploads, etc.) */
export function resolveMediaUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("//")
  ) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  }
  return buildUrl(trimmed);
}

export async function apiFetch(path, options = {}) {
  const { token, headers = {}, body, ...rest } = options;
  const mergedHeaders = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    cache: "no-store",
    ...rest,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    headers: {
      ...mergedHeaders,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  // 304 + cache navigateur corrompu → ERR_CACHE_READ_FAILURE (Chrome)
  if (response.status === 304) {
    throw new Error("Réponse en cache invalide — rechargez la page (Ctrl+Shift+R)");
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  let data = null;
  if (isJson) {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
    }
    const message =
      response.status === 401
        ? "Session expirée ou non autorisée. Reconnectez-vous."
        : data?.message || data?.error || response.statusText || "Erreur API";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}
