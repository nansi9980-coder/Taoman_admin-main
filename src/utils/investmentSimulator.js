/**
 * Même moteur de calcul que la vitrine (taoman-main).
 */

export const PLACEMENT_KEYS = [
  "Diversifie",
  "BTP & Immobilier",
  "Agro Business",
  "Commerce général",
  "Logistique & Transports",
  "Numérique & Services",
];

export function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function getRateForPlacement(placement, config) {
  const rates = config?.sectorRates || {};
  const rate = rates[placement];
  if (rate != null && rate !== "") return String(rate);
  return config?.annualRate ?? "18";
}

export function computeInvestmentResults(inputs) {
  const {
    investment,
    duration,
    annualRate,
    monthlyContribution,
    compoundFrequency,
    inflation,
    taxRate,
    minInvestment = 0,
    maxDuration = 10,
  } = inputs;

  const capital = Math.max(toPositiveNumber(investment), toPositiveNumber(minInvestment) || 0);
  const months = Math.min(
    Math.max(Number(duration) || 1, 1),
    Math.max(Number(maxDuration) || 10, 1),
  );
  const rate = toPositiveNumber(annualRate) / 100;
  const monthly = toPositiveNumber(monthlyContribution);
  const frequency = Math.max(Number(compoundFrequency) || 12, 1);
  const monthlyRate = Math.pow(1 + rate / frequency, frequency / 12) - 1;
  const inflationRate = toPositiveNumber(inflation) / 100 / 12;
  const tax = toPositiveNumber(taxRate) / 100;

  let balance = capital;
  const rows = [];
  let totalInterest = 0;
  let totalTax = 0;

  for (let month = 1; month <= months; month += 1) {
    const startBalance = balance;
    const interest = balance * monthlyRate;
    const taxAmount = interest * tax;
    const monthlyNetGain = interest - taxAmount;
    balance = balance + interest - taxAmount + monthly;
    totalInterest += interest;
    totalTax += taxAmount;
    rows.push({
      month,
      startBalance,
      contribution: monthly,
      interest,
      taxAmount,
      monthlyNetGain,
      balance,
      realBalance: balance / Math.pow(1 + inflationRate, month),
    });
  }

  const totalMonthlyContributions = monthly * months;
  const totalContributions = capital + totalMonthlyContributions;
  const finalCapital = rows.at(-1)?.balance || capital;
  const profit = finalCapital - totalContributions;
  const roi = totalContributions > 0 ? (profit / totalContributions) * 100 : 0;

  return {
    capital,
    months,
    monthly,
    totalContributions,
    totalInterest,
    totalTax,
    finalCapital,
    realFinalCapital: rows.at(-1)?.realBalance || capital,
    profit,
    roi,
    annualizedReturn:
      months > 0
        ? (Math.pow(finalCapital / Math.max(totalContributions, 1), 12 / months) - 1) * 100
        : 0,
    rows,
  };
}

export function formatSimulatorMoney(value) {
  try {
    return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
  } catch {
    return `${Math.round(value)} FCFA`;
  }
}
