/** Clés legacy en base (seed) → clés admin / vitrine */
export const LEGACY_SECTION_KEYS = {
  hero: ["heroBanner"],
  statistics: ["investmentStats"],
};

export function parseSectionContent(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function findSectionRecord(texts, key) {
  const keys = [key, ...(LEGACY_SECTION_KEYS[key] || [])];
  return texts.find((t) => keys.includes(t.section)) || null;
}

export function hasSectionRecord(texts, key) {
  return Boolean(findSectionRecord(texts, key));
}

export function normalizeHeroForEditor(content = {}) {
  const badges = Array.isArray(content.badges)
    ? content.badges
    : typeof content.badges === "string"
      ? content.badges.split(",").map((s) => s.trim()).filter(Boolean)
      : ["KYC & conformité", "Reporting PDF", "Mobile Money", "Alertes WhatsApp"];

  return {
    badgeMain:
      content.badgeMain ||
      content.badge ||
      "Entreprise TAOMAN Groupe Investissement",
    badges,
    title: content.title || content.titleFr || "",
    subtitle: content.subtitle || content.titleEn || "",
    description: content.description || "",
    btn1: content.btn1 || content.primaryButton || "Commencer à investir",
    btn2: content.btn2 || content.secondaryButton || "Voir nos services",
    imageCaption:
      content.imageCaption ||
      content.imageCaption ||
      "Projets suivis sur le terrain",
    heroImage: content.heroImage || content.backgroundImage || "",
    backgroundImage: content.heroImage || content.backgroundImage || "",
  };
}

export function normalizeStatsForEditor(content) {
  if (Array.isArray(content)) {
    const out = {};
    content.slice(0, 4).forEach((item, i) => {
      out[`value${i}`] = item.value ?? "";
      out[`label${i}`] = item.label ?? "";
      out[`icon${i}`] = item.icon ?? "";
    });
    return out;
  }
  return { ...content };
}

export function statsEditorToPayload(content) {
  const items = [0, 1, 2, 3]
    .map((i) => ({
      label: content[`label${i}`] || "",
      value: content[`value${i}`] || "",
      icon: content[`icon${i}`] || String(i + 1).padStart(2, "0"),
    }))
    .filter((s) => s.label || s.value);
  return items.length ? items : content;
}

export function getSectionPreview(key, texts) {
  const record = findSectionRecord(texts, key);
  const c = parseSectionContent(record?.content);

  switch (key) {
    case "hero": {
      const h = normalizeHeroForEditor(c);
      return [
        h.badgeMain,
        ...(h.badges || []).slice(0, 2),
        `${h.title} / ${h.subtitle}`.trim(),
        h.description,
        `${h.btn1} · ${h.btn2}`,
      ]
        .filter(Boolean)
        .join(" · ");
    }
    case "statistics": {
      const stats = Array.isArray(c)
        ? c
        : [0, 1, 2, 3]
            .map((i) => ({ label: c[`label${i}`], value: c[`value${i}`] }))
            .filter((s) => s.label || s.value);
      return stats.map((s) => `${s.label}: ${s.value}`).join(" · ") || "—";
    }
    case "sectors":
    case "testimonials":
    case "faq":
      return (c.items || [])
        .slice(0, 2)
        .map((i) => i.title || i.name || i.question || "")
        .filter(Boolean)
        .join(" · ");
    case "cta":
      return [c.title, c.subtitle, c.buttonText].filter(Boolean).join(" · ");
    case "footer":
      return c.description || "—";
    case "contact":
      return [c.phone, c.email, c.address].filter(Boolean).join(" · ");
    case "seo":
      return [c.metaTitle, c.metaDescription].filter(Boolean).join(" · ");
    case "about":
      return [c.title, c.mission].filter(Boolean).join(" · ");
    default:
      return record ? "Contenu enregistré" : "";
  }
}
