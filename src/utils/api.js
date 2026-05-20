export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function buildUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
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
    const message = data?.message || data?.error || response.statusText || "Erreur API";
    throw new Error(message);
  }

  return data;
}
