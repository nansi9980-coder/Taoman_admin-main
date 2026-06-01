import { useMemo, useState } from "react";
import {
  computeInvestmentResults,
  formatSimulatorMoney,
  getRateForPlacement,
  PLACEMENT_KEYS,
} from "../utils/investmentSimulator";

/**
 * Aperçu temps réel — recalcul à chaque modification des champs admin.
 */
export default function SimulatorAdminPreview({ config }) {
  const [previewPlacement, setPreviewPlacement] = useState("Diversifie");

  const effectiveRate = useMemo(
    () => getRateForPlacement(previewPlacement, config),
    [previewPlacement, config],
  );

  const results = useMemo(
    () =>
      computeInvestmentResults({
        investment: config.investment,
        duration: config.duration,
        annualRate: effectiveRate,
        monthlyContribution: config.monthlyContribution,
        compoundFrequency: config.compoundFrequency,
        inflation: config.inflation,
        taxRate: config.taxRate,
        minInvestment: config.minInvestment,
        maxDuration: config.maxDuration,
      }),
    [
      config.investment,
      config.duration,
      config.monthlyContribution,
      config.compoundFrequency,
      config.inflation,
      config.taxRate,
      config.minInvestment,
      config.maxDuration,
      effectiveRate,
    ],
  );

  const maxChart = useMemo(
    () => Math.max(...results.rows.map((r) => r.balance), results.capital, 1),
    [results],
  );

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-surface-container-low p-lg sticky top-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm mb-md">
        <div>
          <p className="text-label-sm font-bold uppercase tracking-wider text-primary">Aperçu en direct</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">
            Identique au site — mise à jour à chaque frappe
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-label-sm font-semibold text-emerald-800 dark:text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          Live
        </span>
      </div>

      <label className="block text-label-md text-on-surface-variant mb-xs">Secteur testé (aperçu)</label>
      <select
        className="input-field mb-lg"
        value={previewPlacement}
        onChange={(e) => setPreviewPlacement(e.target.value)}
      >
        {PLACEMENT_KEYS.map((p) => (
          <option key={p} value={p}>
            {p} — {getRateForPlacement(p, config)} %
          </option>
        ))}
      </select>

      <div className="rounded-lg bg-[#07111f] text-white p-md mb-lg">
        <p className="text-label-sm text-white/60">Capital final estimé</p>
        <p className="text-headline-lg font-bold text-cyan-200 mt-xs">
          {formatSimulatorMoney(results.finalCapital)}
        </p>
        <p className="text-body-sm text-white/70 mt-sm">
          {results.months} mois · taux {effectiveRate} % · capital engagé{" "}
          {formatSimulatorMoney(results.totalContributions)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-sm mb-lg">
        {[
          ["ROI", `${results.roi.toFixed(2)} %`],
          ["Bénéfice net", formatSimulatorMoney(results.profit)],
          ["Rend. annualisé", `${results.annualizedReturn.toFixed(2)} %`],
          ["Capital réel", formatSimulatorMoney(results.realFinalCapital)],
          ["Intérêts bruts", formatSimulatorMoney(results.totalInterest)],
          ["Fiscalité", formatSimulatorMoney(results.totalTax)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant/50 bg-surface p-sm">
            <p className="text-label-sm text-on-surface-variant">{label}</p>
            <p className="text-label-md font-bold text-on-surface mt-xs">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-label-sm font-semibold text-on-surface-variant mb-sm">Projection mensuelle</p>
      <div className="flex h-32 items-end gap-1 rounded-lg bg-surface p-sm border border-outline-variant/40">
        {results.rows.map((row) => (
          <div key={row.month} className="flex flex-1 flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-t bg-primary transition-all duration-200"
              style={{ height: `${Math.max((row.balance / maxChart) * 100, 8)}%` }}
              title={formatSimulatorMoney(row.balance)}
            />
            <span className="text-[10px] text-on-surface-variant">{row.month}</span>
          </div>
        ))}
      </div>

      <p className="text-label-sm font-semibold text-on-surface-variant mt-lg mb-sm">Détail par mois</p>
      <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-outline-variant/40">
        <table className="w-full text-left text-label-sm min-w-[520px]">
          <thead className="bg-surface sticky top-0">
            <tr className="text-on-surface-variant">
              <th className="p-2">Mois</th>
              <th className="p-2">Intérêt</th>
              <th className="p-2">Impôt</th>
              <th className="p-2">Capital fin</th>
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row) => (
              <tr key={row.month} className="border-t border-outline-variant/30">
                <td className="p-2 font-semibold">{row.month}</td>
                <td className="p-2 text-emerald-700">{formatSimulatorMoney(row.interest)}</td>
                <td className="p-2 text-red-700">{formatSimulatorMoney(row.taxAmount)}</td>
                <td className="p-2 font-bold">{formatSimulatorMoney(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
