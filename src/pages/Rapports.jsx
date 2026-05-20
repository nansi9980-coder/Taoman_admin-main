import { useState } from 'react';
import { buildUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const REPORT_TYPES = [
  { value: 'quotes', label: 'Devis' },
  { value: 'clients', label: 'Clients' },
  { value: 'investments', label: 'Investissements' },
  { value: 'global', label: 'Rapport global' },
];

export default function Rapports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [reportType, setReportType] = useState("global");

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildUrl(`/reports/generate/${reportType}`), {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, notes }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Erreur génération');
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Erreur génération');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || "Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl animate-fadeIn">
      <h1 className="text-3xl font-bold mb-2 text-on-surface">Rapports & Exports</h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        Rédigez un titre et des notes, choisissez le type de rapport, puis générez le PDF.
      </p>

      <div className="space-y-6">
        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Titre du rapport</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre personnalisé"
            className="input-field w-full mt-2"
          />
        </label>

        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes ou instructions pour le rapport"
            rows={6}
            className="input-field w-full mt-2 resize-none"
          />
        </label>

        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Type de rapport</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="input-field w-full mt-2"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={generateReport}
          disabled={loading}
          className="btn-primary w-full sm:w-auto gap-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">
            {loading ? 'progress_activity' : 'download'}
          </span>
          {loading ? 'Génération...' : 'Générer et télécharger le PDF'}
        </button>
      </div>
    </div>
  );
}
