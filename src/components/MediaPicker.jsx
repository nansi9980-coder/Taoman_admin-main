import { useEffect, useState } from "react";
import clsx from "clsx";
import { apiFetch, buildUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function resolveMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return buildUrl(url);
}

export default function MediaPicker({ value, onChange, label = "Image" }) {
  const { token } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch("/media", { token })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setMedia(
          list.filter((m) => !m.type || String(m.type).startsWith("image/"))
        );
      })
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [token]);

  const displayUrl = resolveMediaUrl(value);

  return (
    <div className="space-y-sm">
      <span className="text-label-md text-on-surface-variant">{label}</span>
      {displayUrl && (
        <div className="relative w-full max-w-xs">
          <img
            src={displayUrl}
            alt="Aperçu"
            className="w-full h-32 object-cover rounded-lg border border-outline-variant"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded bg-error text-white text-label-sm"
          >
            Retirer
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary text-label-sm"
      >
        {open ? "Masquer la médiathèque" : "Choisir depuis la médiathèque"}
      </button>
      {open && (
        <div className="border border-outline-variant rounded-lg p-md max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-body-sm text-on-surface-variant">Chargement...</p>
          ) : media.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Aucune image. Uploadez-en dans Médiathèque.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-sm">
              {media.map((item) => {
                const url = resolveMediaUrl(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url || url);
                      setOpen(false);
                    }}
                    className={clsx(
                      "rounded-lg overflow-hidden border-2 transition-colors",
                      value === item.url ? "border-primary" : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <img src={url} alt={item.name} className="w-full h-16 object-cover" />
                    <p className="text-label-sm truncate px-1 py-0.5">{item.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
