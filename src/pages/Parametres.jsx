import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl } from "../utils/api";
import MediaPicker from "../components/MediaPicker";
import { parseSectionContent } from "../utils/sectionContent";

const DEFAULT_SIMULATOR = {
  investment: "500000",
  duration: "10",
  annualRate: "18",
  monthlyContribution: "50000",
  compoundFrequency: "12",
  inflation: "3",
  taxRate: "5",
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
        if (sim) setSimulator({ ...DEFAULT_SIMULATOR, ...parseSectionContent(sim.content) });
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

  const handleInitThemes = async () => {
    try {
      await fetch(buildUrl("/theme/init"), { method: "POST" });
      const res = await fetch(buildUrl("/theme"));
      setThemes(await res.json());
      await fetchActiveTheme();
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
      setSaveMsg("Paramètres simulateur enregistrés.");
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
        <p className="text-body-md text-on-surface-variant mb-lg">
          Modifie l'apparence de l'admin et du site vitrine (couleur principale).
        </p>

        {themes.length === 0 ? (
          <button onClick={handleInitThemes} className="btn-primary">
            Initialiser les thèmes par défaut
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {themes.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSetTheme(t.id)}
                className={`p-md rounded-xl border-2 cursor-pointer transition-all ${
                  activePalette?.id === t.id
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-center mb-sm">
                  <h4 className="font-semibold text-on-surface">{t.name}</h4>
                  {activePalette?.id === t.id && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
                <div className="flex gap-xs">
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.primary }} title="Primary" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.secondary }} title="Secondary" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.surface }} title="Surface" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.background }} title="Background" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Simulateur d'investissement (vitrine)</h3>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Valeurs par défaut de la page /investissement/simulateur
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {[
            ["investment", "Capital initial (FCFA)"],
            ["duration", "Durée max (mois)"],
            ["annualRate", "Taux annuel (%)"],
            ["monthlyContribution", "Versement mensuel (FCFA)"],
            ["compoundFrequency", "Capitalisation / an"],
            ["inflation", "Inflation (%)"],
            ["taxRate", "Fiscalité (%)"],
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
        <button type="button" onClick={saveSimulator} className="btn-primary mt-lg">
          Enregistrer le simulateur
        </button>
      </div>
    </div>
  );
}
