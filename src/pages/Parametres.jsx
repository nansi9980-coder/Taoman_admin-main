import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl, resolveMediaUrl } from "../utils/api";
import MediaPicker from "../components/MediaPicker";
import { parseSectionContent } from "../utils/sectionContent";
import { textOnBackground } from "../utils/applyThemePalette";
import SimulatorAdminPreview from "../components/SimulatorAdminPreview";
import { PLACEMENT_KEYS } from "../utils/investmentSimulator";

const DEFAULT_SIMULATOR = {
  investment: "500000",
  duration: "10",
  annualRate: "18",
  monthlyContribution: "50000",
  compoundFrequency: "12",
  inflation: "3",
  taxRate: "5",
  minInvestment: "500000",
  maxDuration: "10",
  defaultMode: "avance",
  sectorRates: {
    Diversifie: "18",
    "BTP & Immobilier": "16",
    "Agro Business": "14",
    "Commerce général": "15",
    "Logistique & Transports": "17",
    "Numérique & Services": "19",
  },
  features: [
    { icon: "🔒", title: "Sécurisé", desc: "Vos données sont protégées et chiffrées" },
    { icon: "📈", title: "Transparent", desc: "Suivi en temps réel de vos investissements" },
    { icon: "⚡", title: "Rapide", desc: "Investissez en moins de 5 minutes" },
  ],
};

async function themeRequest(path, options = {}) {
  const res = await fetch(buildUrl(path), options);
  if (!res.ok) {
    let message = res.statusText || "Erreur serveur";
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function Parametres() {
  const { activePalette, fetchActiveTheme } = useTheme();
  const { token } = useAuth();
  const [themes, setThemes] = useState([]);
  const [themesError, setThemesError] = useState("");
  const [themeBusy, setThemeBusy] = useState(false);
  const [simulator, setSimulator] = useState(DEFAULT_SIMULATOR);
  const [branding, setBranding] = useState({ logoUrl: "" });
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingSimulator, setSavingSimulator] = useState(false);

  const loadThemes = async () => {
    setThemesError("");
    try {
      const list = await themeRequest("/theme");
      setThemes(Array.isArray(list) ? list : []);
    } catch (e) {
      setThemes([]);
      setThemesError(e.message || "Impossible de charger les palettes.");
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch("/content/texts", { token })
      .then((texts) => {
        if (!Array.isArray(texts)) return;
        const sim = texts.find((t) => t.section === "simulator");
        const brand = texts.find((t) => t.section === "branding");
        if (sim) {
          const parsed = parseSectionContent(sim.content);
          setSimulator({
            ...DEFAULT_SIMULATOR,
            ...parsed,
            sectorRates: { ...DEFAULT_SIMULATOR.sectorRates, ...(parsed.sectorRates || {}) },
            features: parsed.features?.length ? parsed.features : DEFAULT_SIMULATOR.features,
          });
        }
        if (brand) setBranding(parseSectionContent(brand.content));
      })
      .catch(console.error);
  }, [token]);

  const notifyCmsUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("taoman-cms-updated"));
    }
  };

  const handleSetTheme = async (id) => {
    setThemeBusy(true);
    setSaveError("");
    try {
      await themeRequest(`/theme/active/${id}`, { method: "PUT" });
      await fetchActiveTheme();
      await loadThemes();
      setSaveMsg("Palette appliquée sur l'admin et la vitrine.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message || "Impossible d'appliquer cette palette.");
    } finally {
      setThemeBusy(false);
    }
  };

  const handleInitThemes = async () => {
    setThemeBusy(true);
    setSaveError("");
    try {
      await themeRequest("/theme/init", { method: "POST" });
      await fetchActiveTheme();
      await loadThemes();
      setSaveMsg("Palettes initialisées.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message || "Échec de l'initialisation des palettes.");
    } finally {
      setThemeBusy(false);
    }
  };

  const handleSeedPresets = async () => {
    setThemeBusy(true);
    setSaveError("");
    try {
      await themeRequest("/theme/seed-presets", { method: "POST" });
      await fetchActiveTheme();
      await loadThemes();
      setSaveMsg("Nouvelles palettes ajoutées ou mises à jour.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message || "Échec de l'ajout des palettes.");
    } finally {
      setThemeBusy(false);
    }
  };

  const saveSimulator = async () => {
    if (!token) {
      setSaveError("Session expirée. Reconnectez-vous.");
      return;
    }
    setSavingSimulator(true);
    setSaveError("");
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: "simulator", content: simulator },
        token,
      });
      setSaveMsg("Paramètres simulateur enregistrés (page /investissement/simulateur).");
      notifyCmsUpdated();
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSavingSimulator(false);
    }
  };

  const saveBranding = async () => {
    if (!token) {
      setSaveError("Session expirée. Reconnectez-vous.");
      return;
    }
    setSavingBranding(true);
    setSaveError("");
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: "branding", content: branding },
        token,
      });
      setSaveMsg("Logo enregistré (vitrine et barre latérale mises à jour).");
      notifyCmsUpdated();
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSavingBranding(false);
    }
  };

  const updateFeature = (idx, field, value) => {
    const features = [...(simulator.features || [])];
    features[idx] = { ...features[idx], [field]: value };
    setSimulator((s) => ({ ...s, features }));
  };

  const addFeature = () => {
    setSimulator((s) => ({
      ...s,
      features: [...(s.features || []), { icon: "✨", title: "", desc: "" }],
    }));
  };

  const removeFeature = (idx) => {
    setSimulator((s) => ({
      ...s,
      features: (s.features || []).filter((_, i) => i !== idx),
    }));
  };

  const logoPreview = branding.logoUrl ? resolveMediaUrl(branding.logoUrl) : "/logo.png";

  return (
    <div className="space-y-lg animate-fadeIn p-lg">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Palettes, logo, simulateur d'investissement.</p>
      </div>

      {saveMsg && (
        <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-900/20 p-md text-green-800 dark:text-green-200">
          {saveMsg}
        </div>
      )}
      {saveError && (
        <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-900/20 p-md text-red-800 dark:text-red-200">
          {saveError}
        </div>
      )}

      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Logo du site</h3>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Si le logo ne s'affiche pas dans la barre latérale, uploadez-le ici (Cloudinary). Il remplace le logo sur la vitrine.
        </p>
        <div className="flex items-center gap-md mb-md">
          <img
            src={logoPreview}
            alt="Logo"
            className="w-16 h-16 object-contain rounded-lg border border-outline-variant bg-white p-1"
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
          <p className="text-label-sm text-on-surface-variant">Aperçu actuel</p>
        </div>
        <MediaPicker
          label="Image logo"
          value={branding.logoUrl || ""}
          onChange={(url) => setBranding({ logoUrl: url })}
        />
        <button
          type="button"
          onClick={saveBranding}
          disabled={savingBranding || !token}
          className="btn-primary mt-md disabled:opacity-50"
        >
          {savingBranding ? "Enregistrement…" : "Enregistrer le logo"}
        </button>
      </div>

      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Palettes de couleurs</h3>
        <p className="text-body-md text-on-surface-variant mb-md">
          Modifie l'apparence de l'admin et du site vitrine (mode clair et sombre). Les textes s'adaptent pour rester lisibles.
        </p>
        {themesError && (
          <p className="text-body-sm text-red-600 dark:text-red-400 mb-md">{themesError}</p>
        )}
        <div className="flex flex-wrap gap-sm mb-lg">
          {themes.length === 0 && (
            <button
              type="button"
              onClick={handleInitThemes}
              disabled={themeBusy}
              className="btn-primary disabled:opacity-50"
            >
              {themeBusy ? "Traitement…" : "Initialiser les palettes"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSeedPresets}
            disabled={themeBusy}
            className="btn-secondary disabled:opacity-50"
          >
            {themeBusy ? "Traitement…" : "Ajouter les palettes recommandées"}
          </button>
        </div>

        {themes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {themes.map((t) => {
              const textColor = textOnBackground(t.surface);
              const isActive = activePalette?.id === t.id;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => !themeBusy && handleSetTheme(t.id)}
                  onKeyDown={(e) => e.key === "Enter" && !themeBusy && handleSetTheme(t.id)}
                  className={`rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                    isActive
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-outline-variant hover:border-primary/50"
                  } ${themeBusy ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <div className="flex justify-between items-center p-md pb-sm bg-surface">
                    <h4 className="font-semibold text-on-surface">{t.name}</h4>
                    {isActive && (
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                  <div className="flex gap-1 px-md pb-sm">
                    <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: t.primary }} title="Primaire" />
                    <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: t.secondary }} title="Secondaire" />
                  </div>
                  <div
                    className="mx-md mb-md rounded-lg p-md border border-outline-variant/40"
                    style={{ backgroundColor: t.surface, color: textColor }}
                  >
                    <p className="text-label-sm font-bold mb-xs" style={{ color: t.primary }}>
                      Aperçu titre
                    </p>
                    <p className="text-body-sm opacity-90">
                      Texte lisible sur le fond — bouton exemple
                    </p>
                    <span
                      className="inline-block mt-sm px-md py-xs rounded-lg text-label-sm font-semibold"
                      style={{ backgroundColor: t.primary, color: textOnBackground(t.primary) }}
                    >
                      Action
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card max-w-6xl">
        <h3 className="font-headline-md text-headline-md mb-md">Simulateur d'investissement</h3>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Paramètres de la page <code className="text-primary">/investissement/simulateur</code>. L&apos;aperçu à droite
          se met à jour en temps réel ; cliquez sur Enregistrer pour publier sur le site.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-xl items-start">
          <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {[
            ["investment", "Capital initial (FCFA)"],
            ["minInvestment", "Montant minimum (FCFA)"],
            ["duration", "Durée par défaut (mois)"],
            ["maxDuration", "Durée maximum (mois)"],
            ["annualRate", "Taux annuel par défaut (%)"],
            ["monthlyContribution", "Versement mensuel (FCFA)"],
            ["compoundFrequency", "Capitalisation / an (1, 4, 12, 365)"],
            ["inflation", "Inflation (%)"],
            ["taxRate", "Fiscalité (%)"],
            ["defaultMode", "Mode par défaut (simple, avance, professionnel)"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
              <input
                className="input-field"
                value={simulator[key] ?? ""}
                onChange={(e) => setSimulator((s) => ({ ...s, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <h4 className="font-semibold text-on-surface mt-xl mb-md">Taux par secteur (%)</h4>
        <p className="text-body-sm text-on-surface-variant mb-md">
          Lorsque l'utilisateur change le type de placement, le taux annuel est mis à jour automatiquement.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {PLACEMENT_KEYS.map((placement) => (
            <div key={placement}>
              <label className="block text-label-md text-on-surface-variant mb-xs">{placement}</label>
              <input
                className="input-field"
                type="number"
                step="0.1"
                value={simulator.sectorRates?.[placement] ?? ""}
                onChange={(e) =>
                  setSimulator((s) => ({
                    ...s,
                    sectorRates: { ...s.sectorRates, [placement]: e.target.value },
                  }))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-sm mt-xl mb-md">
          <h4 className="font-semibold text-on-surface">Cartes « avantages » (bas de page simulateur)</h4>
          <button type="button" onClick={addFeature} className="btn-secondary text-sm">
            + Ajouter une carte
          </button>
        </div>
        <div className="space-y-md">
          {(simulator.features || []).map((feat, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-sm border border-outline-variant/40 rounded-lg p-md items-end">
              <input
                className="input-field"
                placeholder="Emoji / icône"
                value={feat.icon ?? ""}
                onChange={(e) => updateFeature(idx, "icon", e.target.value)}
              />
              <input
                className="input-field"
                placeholder="Titre"
                value={feat.title ?? ""}
                onChange={(e) => updateFeature(idx, "title", e.target.value)}
              />
              <input
                className="input-field"
                placeholder="Description"
                value={feat.desc ?? ""}
                onChange={(e) => updateFeature(idx, "desc", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="btn-secondary text-error shrink-0"
                title="Supprimer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveSimulator}
          disabled={savingSimulator || !token}
          className="btn-primary mt-lg disabled:opacity-50"
        >
          {savingSimulator ? "Enregistrement…" : "Enregistrer le simulateur"}
        </button>
          </div>

          <SimulatorAdminPreview config={simulator} />
        </div>
      </div>
    </div>
  );
}
