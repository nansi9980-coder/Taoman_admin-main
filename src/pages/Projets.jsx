import { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { apiFetch, API_BASE, resolveMediaUrl } from "../utils/api";

const STATUS_META = {
  nouveau: { badge: "badge-warning", label: "Nouveau" },
  "en cours": { badge: "badge-info", label: "En cours" },
  traité: { badge: "badge-success", label: "Traité" },
  refusé: { badge: "badge-error", label: "Refusé" },
};

export default function Projets() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch("/project-submissions", { token });
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE, {
      transports: ["polling", "websocket"],
      auth: { token },
      reconnection: true,
    });
    socket.on("newProjectSubmission", (submission) => {
      setProjects((prev) => {
        if (prev.some((p) => p.id === submission.id)) return prev;
        return [submission, ...prev];
      });
    });
    return () => socket.disconnect();
  }, [token]);

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.projectName?.toLowerCase().includes(q) ||
      p.contactName?.toLowerCase().includes(q) ||
      p.sector?.toLowerCase().includes(q) ||
      p.contactEmail?.toLowerCase().includes(q)
    );
  });

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/project-submissions/${id}`, {
        method: "PUT",
        token,
        body: { status },
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      if (selected?.id === id) setSelected((p) => ({ ...p, status }));
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette soumission ?")) return;
    try {
      await apiFetch(`/project-submissions/${id}`, { method: "DELETE", token });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      /* ignore */
    }
  };

  const statusMeta = STATUS_META[selected?.status] || STATUS_META.nouveau;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h2 className="page-title">Projets soumis</h2>
        <p className="page-subtitle">Demandes d'investissement via le formulaire vitrine</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg min-h-[480px] lg:min-h-[calc(100vh-220px)]">
        <div className="w-full lg:w-80 shrink-0 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden max-h-[70vh] lg:max-h-none">
          <div className="p-md border-b border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-sm">
              Soumissions ({projects.length})
            </h3>
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-md text-center text-outline">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-md text-center text-outline">
                {searchQuery ? "Aucun projet trouvé" : "Aucune soumission"}
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={clsx(
                    "w-full p-md border-b border-outline-variant text-left transition-colors",
                    selected?.id === p.id
                      ? "bg-primary-fixed dark:bg-[#0040a2]"
                      : "hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                  )}
                >
                  <div className="flex items-center justify-between mb-xs gap-sm">
                    <h4 className="font-semibold text-body-sm truncate">{p.projectName}</h4>
                    <span className="text-label-sm text-outline shrink-0">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-label-sm text-outline truncate">{p.sector}</p>
                  <p className="text-label-sm text-outline truncate">{p.contactName}</p>
                  {p.status !== "nouveau" && (
                    <span className={clsx("badge mt-xs inline-block", STATUS_META[p.status]?.badge || "badge-info")}>
                      {STATUS_META[p.status]?.label || p.status}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-lg">
          {selected ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-md mb-lg">
                <div>
                  <p className="text-label-sm text-outline uppercase tracking-wider mb-xs">Projet #{selected.id}</p>
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">
                    {selected.projectName}
                  </h3>
                  <p className="text-body-sm text-outline mt-xs">
                    Reçu le {new Date(selected.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <span className={clsx("badge", statusMeta.badge)}>{statusMeta.label}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                <InfoBlock label="Secteur" value={selected.sector} />
                <InfoBlock label="Localisation" value={selected.location} />
                <InfoBlock label="Ticket recherché" value={selected.amount || "—"} />
                <InfoBlock label="Horizon" value={selected.horizon || "—"} />
                <InfoBlock label="Site web" value={selected.website || "—"} />
              </div>

              <div className="mb-lg">
                <p className="text-label-md text-outline uppercase tracking-wider mb-sm">Description</p>
                <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] whitespace-pre-wrap leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div className="rounded-lg bg-surface-container-low dark:bg-[#282a36] p-md mb-lg">
                <p className="text-label-md text-outline uppercase tracking-wider mb-sm">Contact</p>
                <p className="text-body-sm font-semibold text-on-surface">{selected.contactName}</p>
                <p className="text-body-sm text-outline">{selected.contactEmail}</p>
                <p className="text-body-sm text-outline">{selected.contactPhone}</p>
              </div>

              {selected.attachmentUrl && (
                <a
                  href={resolveMediaUrl(selected.attachmentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-xs text-primary hover:underline mb-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                  Télécharger le document joint
                </a>
              )}

              <div className="flex flex-wrap gap-sm pt-md border-t border-outline-variant">
                {selected.status === "nouveau" && (
                  <button onClick={() => updateStatus(selected.id, "en cours")} className="btn-secondary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    Prendre en charge
                  </button>
                )}
                {selected.status !== "traité" && (
                  <button onClick={() => updateStatus(selected.id, "traité")} className="btn-primary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Marquer traité
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)} className="btn-secondary gap-xs text-error">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center text-outline">
              <span className="material-symbols-outlined text-[48px] mb-md opacity-40">rocket_launch</span>
              <p>Sélectionnez une soumission pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-label-sm text-outline uppercase tracking-wider mb-xs">{label}</p>
      <p className="text-body-sm font-medium text-on-surface dark:text-[#e4e4ef]">{value}</p>
    </div>
  );
}
