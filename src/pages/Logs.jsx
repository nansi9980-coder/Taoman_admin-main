import { Fragment, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

const actionConfig = {
  login: { label: "Connexion", icon: "login", color: "text-secondary" },
  logout: { label: "Déconnexion", icon: "logout", color: "text-on-surface-variant" },
  create: { label: "Création", icon: "add", color: "text-secondary" },
  update: { label: "Modification", icon: "edit", color: "text-primary" },
  modify: { label: "Modification", icon: "edit", color: "text-primary" },
  delete: { label: "Suppression", icon: "delete", color: "text-error" },
  export: { label: "Export", icon: "download", color: "text-primary" },
  backup: { label: "Sauvegarde", icon: "backup", color: "text-secondary" },
  maintenance: { label: "Maintenance", icon: "settings", color: "text-on-surface-variant" },
  access_denied: { label: "Accès refusé", icon: "block", color: "text-error" },
};

const statusConfig = {
  success: { label: "Succès", icon: "check_circle", bgColor: "bg-secondary/20", textColor: "text-secondary" },
  warning: { label: "Attention", icon: "warning", bgColor: "bg-amber-500/20", textColor: "text-amber-700 dark:text-amber-400" },
  error: { label: "Erreur", icon: "error", bgColor: "bg-error/20", textColor: "text-error" },
};

const defaultAction = { label: "Action", icon: "info", color: "text-on-surface-variant" };
const defaultStatus = statusConfig.success;

function normalizeLog(raw) {
  const ts = raw.createdAt || raw.timestamp;
  let formatted = "—";
  if (ts) {
    try {
      formatted = new Date(ts).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      formatted = String(ts);
    }
  }
  const action = (raw.action || "modify").toLowerCase();
  const status = (raw.status || "success").toLowerCase();
  return {
    id: raw.id ?? raw._id ?? `${raw.user}-${formatted}`,
    timestamp: ts ? new Date(ts).toISOString() : "",
    timestampLabel: formatted,
    user: raw.user || raw.username || "Système",
    action,
    resource: raw.resource || raw.target || "—",
    status: statusConfig[status] ? status : "success",
    ip: raw.ip || "—",
    details: raw.details || raw.message || "—",
  };
}

export default function Logs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  const loadLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError("");
    try {
      const data = await apiFetch("/logs", { token });
      const list = Array.isArray(data) ? data.map(normalizeLog) : [];
      setLogs(list);
    } catch (err) {
      setLoadError(err.message || "Impossible de charger les journaux");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      filter === "tous" ||
      log.action === filter ||
      (filter === "modify" && log.action === "update");
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.user.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "tous" || log.status === statusFilter;
    const matchesDate =
      !dateFilter || (log.timestamp && log.timestamp.startsWith(dateFilter));
    return matchesAction && matchesSearch && matchesStatus && matchesDate;
  });

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  );

  const successCount = logs.filter((l) => l.status === "success").length;
  const warningCount = logs.filter((l) => l.status === "warning").length;
  const errorCount = logs.filter((l) => l.status === "error").length;

  return (
    <div className="space-y-lg max-w-full overflow-x-hidden">
      <div>
        <h1 className="page-title">Journaux d'activité</h1>
        <p className="page-subtitle">Consultez les événements enregistrés sur la plateforme.</p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-md text-error flex flex-wrap items-center gap-md">
          <span>{loadError}</span>
          <button type="button" onClick={loadLogs} className="btn-secondary text-label-sm">
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant">Total</p>
          <p className="text-headline-md font-bold mt-xs">{logs.length}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant">Succès</p>
          <p className="text-headline-md font-bold text-secondary mt-xs">{successCount}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant">Attention</p>
          <p className="text-headline-md font-bold text-amber-600 mt-xs">{warningCount}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant">Erreurs</p>
          <p className="text-headline-md font-bold text-error mt-xs">{errorCount}</p>
        </div>
      </div>

      <div className="card p-md space-y-md">
        <div className="flex flex-col lg:flex-row gap-md">
          <input
            type="text"
            placeholder="Utilisateur, ressource, détails…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1 min-w-0"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field w-full lg:w-auto"
          />
          <button type="button" onClick={loadLogs} className="btn-secondary shrink-0">
            Actualiser
          </button>
        </div>

        <div className="flex flex-wrap gap-sm">
          {[
            { value: "tous", label: "Tous statuts" },
            { value: "success", label: "Succès" },
            { value: "warning", label: "Attention" },
            { value: "error", label: "Erreurs" },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={clsx(
                "px-md py-xs rounded-lg text-label-sm font-medium",
                statusFilter === s.value ? "bg-primary text-on-primary" : "bg-surface-container-low"
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="w-px h-6 bg-outline-variant hidden sm:block" />
          {[
            { value: "tous", label: "Toutes actions" },
            { value: "create", label: "Créations" },
            { value: "update", label: "Modifications" },
            { value: "delete", label: "Suppressions" },
            { value: "login", label: "Connexions" },
          ].map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setFilter(a.value)}
              className={clsx(
                "px-md py-xs rounded-lg text-label-sm font-medium",
                filter === a.value ? "bg-primary text-on-primary" : "bg-surface-container-low"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-xl text-center text-on-surface-variant">Chargement des journaux…</div>
      ) : sortedLogs.length === 0 ? (
        <div className="card p-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-outline opacity-50">history</span>
          <p className="text-body-md text-on-surface-variant mt-md">
            {logs.length === 0
              ? "Aucun événement enregistré pour le moment."
              : "Aucun journal ne correspond aux filtres."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm text-on-surface-variant">
                  <th className="p-md font-semibold">Statut</th>
                  <th className="p-md font-semibold">Action</th>
                  <th className="p-md font-semibold">Utilisateur</th>
                  <th className="p-md font-semibold">Ressource</th>
                  <th className="p-md font-semibold">Date</th>
                  <th className="p-md font-semibold w-10" />
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((log) => {
                  const action = actionConfig[log.action] || defaultAction;
                  const status = statusConfig[log.status] || defaultStatus;
                  const open = expandedId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <tr
                        className={clsx(
                          "border-b border-outline-variant/50 cursor-pointer hover:bg-surface-container-low/80",
                          open && "bg-surface-container-low"
                        )}
                        onClick={() => setExpandedId(open ? null : log.id)}
                      >
                        <td className="p-md">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1 px-sm py-xs rounded-full text-label-sm",
                              status.bgColor,
                              status.textColor
                            )}
                          >
                            <span className="material-symbols-outlined text-[16px]">{status.icon}</span>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-md">
                          <span className={clsx("inline-flex items-center gap-1 font-medium", action.color)}>
                            <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                            {action.label}
                          </span>
                        </td>
                        <td className="p-md text-body-sm">{log.user}</td>
                        <td className="p-md text-body-sm">{log.resource}</td>
                        <td className="p-md text-label-sm text-on-surface-variant whitespace-nowrap">
                          {log.timestampLabel}
                        </td>
                        <td className="p-md">
                          <span
                            className="material-symbols-outlined text-outline"
                            style={{ transform: open ? "rotate(180deg)" : "none" }}
                          >
                            expand_more
                          </span>
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-surface-container-low/50">
                          <td colSpan={6} className="p-md text-body-sm">
                            <p>
                              <strong>IP :</strong> {log.ip}
                            </p>
                            <p className="mt-sm">
                              <strong>Détails :</strong> {log.details}
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
