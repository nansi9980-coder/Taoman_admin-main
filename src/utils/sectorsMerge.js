/** Les 6 secteurs vitrine — ordre et slugs canoniques (alignés sur taoman-main) */
export const SECTOR_TEMPLATES = [
  { slug: "logistique-transports", title: "Logistique & Transports", description: "Flottes, déménagement, distribution" },
  { slug: "agro-business", title: "Agro Business", description: "Production et transformation agricole" },
  { slug: "commerce-general", title: "Commerce général", description: "Import, distribution et négoce" },
  { slug: "btp-immobilier", title: "BTP & Immobilier", description: "Construction et immobilier" },
  { slug: "numerique-services", title: "Numérique & Services", description: "Digital et services aux entreprises" },
  { slug: "marketing-international", title: "Marketing International", description: "Visibilité et croissance export" },
];

const SLUG_RULES = [
  { slug: "marketing-international", match: (k) => k.includes("marketing") },
  { slug: "btp-immobilier", match: (k) => k.includes("btp") || k.includes("immobilier") },
  { slug: "agro-business", match: (k) => k.includes("agro") || k.includes("energie") || k.includes("énergie") },
  { slug: "commerce-general", match: (k) => k.includes("commerce") || k.includes("negoce") || k.includes("négoce") },
  {
    slug: "numerique-services",
    match: (k) => k.includes("numerique") || k.includes("numérique") || k.includes("digital") || k.includes("innovation"),
  },
  {
    slug: "logistique-transports",
    match: (k) => k.includes("logistique") || k.includes("transport") || k.includes("mobilite") || k.includes("mobilité"),
  },
];

function normalizeTitleKey(title = "") {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function inferSectorSlug(item) {
  if (!item) return null;
  const raw = item.slug?.trim();
  if (raw && SECTOR_TEMPLATES.some((t) => t.slug === raw)) return raw;
  const key = normalizeTitleKey(item.title);
  if (!key) return null;
  for (const rule of SLUG_RULES) {
    if (rule.match(key)) return rule.slug;
  }
  return null;
}

/** Fusionne les données CMS (4 anciennes cartes, etc.) sur les 6 slugs — sans fusion par position */
export function mergeSectorCmsItems(cmsList = [], templates = SECTOR_TEMPLATES) {
  const bySlug = new Map();

  (Array.isArray(cmsList) ? cmsList : []).forEach((item) => {
    const slug = inferSectorSlug(item);
    if (!slug) return;
    const prev = bySlug.get(slug);
    bySlug.set(slug, prev ? { ...prev, ...item, slug } : { ...item, slug });
  });

  return templates.map((t) => {
    const cms = bySlug.get(t.slug);
    return {
      slug: t.slug,
      title: cms?.title?.trim() || t.title,
      description: cms?.description?.trim() || t.description,
      imageUrl: cms?.imageUrl || "",
    };
  });
}

export function sectorsEditorToPayload(content = {}) {
  return { items: mergeSectorCmsItems(content.items) };
}
