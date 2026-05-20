/** Applique une palette avec contrastes texte lisibles (admin + vitrine). */

function parseHex(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(hex) {
  const c = parseHex(hex);
  if (!c) return 0.5;
  const [r, g, b] = [c.r, c.g, c.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function textOnBackground(hex) {
  return luminance(hex) > 0.55 ? "#191b23" : "#f8fafc";
}

export function textMutedOnBackground(hex) {
  return luminance(hex) > 0.55 ? "#434654" : "#cbd5e1";
}

export function applyThemePalette(theme) {
  if (!theme) return;
  const root = document.documentElement;
  const primary = theme.primary || "#0052cc";
  const secondary = theme.secondary || primary;
  const surface = theme.surface || "#f8fafc";
  const background = theme.background || "#eef2ff";
  const onSurface = textOnBackground(surface);
  const onSurfaceVariant = textMutedOnBackground(surface);
  const onPrimary = textOnBackground(primary);

  root.style.setProperty("--color-primary", primary);
  root.style.setProperty("--color-primary-container", secondary);
  root.style.setProperty("--color-secondary", secondary);
  root.style.setProperty("--color-secondary-container", secondary);
  root.style.setProperty("--color-surface", surface);
  root.style.setProperty("--color-background", background);
  root.style.setProperty("--color-on-surface", onSurface);
  root.style.setProperty("--color-on-surface-variant", onSurfaceVariant);
  root.style.setProperty("--color-on-primary", onPrimary);
  root.style.setProperty("--color-on-primary-container", onPrimary);
  root.style.setProperty("--color-on-primary-fixed", onPrimary);
  root.style.setProperty("--color-surface-container-low", background);
  root.style.setProperty("--color-surface-container", surface);
  root.style.setProperty("--color-outline-variant", luminance(surface) > 0.55 ? "#c3c6d6" : "#475569");
}
