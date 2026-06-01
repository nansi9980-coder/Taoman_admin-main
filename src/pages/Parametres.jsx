import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl } from "../utils/api";
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

export default function Parametres() {
  const { activePalette, fetchActiveTheme } = useTheme();
  const { token } = useAuth();
  const [themes, setThemes] = useState([]);
  const [simulator, setSimulator] = useState(DEFAULT_SIMULATOR);
  const [branding, setBranding] = useState({ logoUrl: "" });
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch(buildUrl("/theme"))
      .then((res) => res.json())
      .then(setThemes)
      .catch(console.error);
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

  const handleSetTheme = async (id) => {
    try {
      await fetch(buildUrl(`/theme/active/${id}`), { method: "PUT" });
      await fetchActiveTheme();
      setSaveMsg("Palette appliquée sur l'admin et la vitrine.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const reloadThemes = async () => {
    const res = await fetch(buildUrl("/theme"));
    setThemes(await res.json());
    await fetchActiveTheme();
  };

  const handleInitThemes = async () => {
    try {
      await fetch(buildUrl("/theme/init"), { method: "POST" });
      await reloadThemes();
      setSaveMsg("Palettes initialisées.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedPresets = async () => {
    try {
      await fetch(buildUrl("/theme/seed-presets"), { method: "POST" });
      await reloadThemes();
      setSaveMsg("Nouvelles palettes ajoutées ou mises à jour.");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSimulator = async () => {
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: "simulator", content: simulator },
        token,
      });
      setSaveMsg("Paramètres simulateur enregistrés (page /investissement/simulateur).");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("taoman-cms-updated"));
      }
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

  const saveBranding = async () => {
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: "branding", content: branding },
        token,
      });
      setSaveMsg("Logo enregistré (vitrine + admin après refresh).");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

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

      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Logo du site</h3>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Si le logo ne s'affiche pas dans la barre latérale, uploadez-le ici (Cloudinary). Il remplace le logo sur la vitrine.
        </p>
        <div className="flex items-center gap-md mb-md">
          <img
            src={branding.logoUrl ? buildUrl(branding.logoUrl) : "/logo.png"}
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
        <button type="button" onClick={saveBranding} className="btn-primary mt-md">
          Enregistrer le logo
        </button>
      </div>

      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Palettes de couleurs</h3>
        <p className="text-body-md text-on-surface-variant mb-md">
          Modifie l'apparence de l'admin et du site vitrine. Les textes s'adaptent automatiquement pour rester lisibles.
        </p>
        <div className="flex flex-wrap gap-sm mb-lg">
          {themes.length === 0 && (
            <button type="button" onClick={handleInitThemes} className="btn-primary">
              Initialiser les palettes
            </button>
          )}
          <button type="button" onClick={handleSeedPresets} className="btn-secondary">
            Ajouter les palettes recommandées
          </button>
        </div>

        {themes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {themes.map((t) => {
              const textColor = textOnBackground(t.surface);
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSetTheme(t.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetTheme(t.id)}
                  className={`rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                    activePalette?.id === t.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-outline-variant hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-center p-md pb-sm bg-surface">
                    <h4 className="font-semibold text-on-surface">{t.name}</h4>
                    {activePalette?.id === t.id && (
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

        <h4 className="font-semibold text-on-surface mb-md">Cartes « avantages » (bas de page simulateur)</h4>
        <div className="space-y-md">
          {(simulator.features || []).map((feat, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-sm border border-outline-variant/40 rounded-lg p-md">
              <input
                className="input-field"
                placeholder="Emoji / icône"
                value={feat.icon ?? ""}
                onChange={(e) => {
                  const features = [...(simulator.features || [])];
                  features[idx] = { ...features[idx], icon: e.target.value };
                  setSimulator((s) => ({ ...s, features }));
                }}
              />
              <input
                className="input-field"
                placeholder="Titre"
                value={feat.title ?? ""}
                onChange={(e) => {
                  const features = [...(simulator.features || [])];
                  features[idx] = { ...features[idx], title: e.target.value };
                  setSimulator((s) => ({ ...s, features }));
                }}
              />
              <input
                className="input-field sm:col-span-1"
                placeholder="Description"
                value={feat.desc ?? ""}
                onChange={(e) => {
                  const features = [...(simulator.features || [])];
                  features[idx] = { ...features[idx], desc: e.target.value };
                  setSimulator((s) => ({ ...s, features }));
                }}
              />
            </div>
          ))}
        </div>

        <button type="button" onClick={saveSimulator} className="btn-primary mt-lg">
          Enregistrer le simulateur
        </button>
          </div>

          <SimulatorAdminPreview config={simulator} />
        </div>
      </div>
    </div>
  );
}
