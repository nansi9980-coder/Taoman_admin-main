/**
 * Slides du carrousel « Réalisations terrain » — titres alignés sur la vitrine.
 * imageUrl = vide tant que non défini dans le CMS ; staticPreview = fichier actuel sur le site.
 */
export const REALISATION_SLIDE_TEMPLATES = [
  {
    id: "conducteur-01",
    title: "Conducteur TAOMAN 01",
    category: "Logistique",
    progress: 80,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-01.png",
  },
  {
    id: "transport-02",
    title: "Équipe de transport 02",
    category: "Transport",
    progress: 72,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-02.png",
  },
  {
    id: "lavage-03",
    title: "Centre de lavage 03",
    category: "Lavage Auto",
    progress: 88,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-03.png",
  },
  {
    id: "terrain-04",
    title: "Intervention terrain 04",
    category: "Équipe terrain",
    progress: 76,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-04.png",
  },
  {
    id: "flotte-05",
    title: "Flotte opérationnelle 05",
    category: "Logistique",
    progress: 92,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-05.png",
  },
  {
    id: "agro-06",
    title: "Commerce agro 06",
    category: "Agro & Commerce",
    progress: 70,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-06.png",
  },
  {
    id: "btp-07",
    title: "Projet BTP 07",
    category: "BTP & Infrastructure",
    progress: 85,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-07.png",
  },
  {
    id: "agro-08",
    title: "Agro Business 08",
    category: "Agro Business",
    progress: 60,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-08.png",
  },
  {
    id: "reseau-09",
    title: "Réseau Transport 09",
    category: "Logistique",
    progress: 95,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-09.png",
  },
  {
    id: "digital-10",
    title: "Solution Digitale 10",
    category: "Numérique",
    progress: 100,
    imageUrl: "",
    staticPreview: "/realisations/taoman-realisation-10.png",
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

export function inferRealisationId(item) {
  if (!item) return null;
  if (item.id && REALISATION_SLIDE_TEMPLATES.some((t) => t.id === item.id)) return item.id;
  const key = normalizeTitleKey(item.title);
  if (!key) return null;
  const byTitle = REALISATION_SLIDE_TEMPLATES.find((t) => {
    const tk = normalizeTitleKey(t.title);
    return tk === key || tk.includes(key) || key.includes(tk);
  });
  return byTitle?.id || null;
}

/** Fusion CMS → liste complète des slides éditables (comme les 6 secteurs). */
export function mergeRealisationCmsItems(cmsList = [], templates = REALISATION_SLIDE_TEMPLATES) {
  const byId = new Map();
  (Array.isArray(cmsList) ? cmsList : []).forEach((item) => {
    const id = inferRealisationId(item);
    if (!id) return;
    const prev = byId.get(id);
    byId.set(id, prev ? { ...prev, ...item, id } : { ...item, id });
  });

  const merged = templates.map((t) => {
    const cms = byId.get(t.id);
    return {
      id: t.id,
      title: cms?.title?.trim() || t.title,
      category: cms?.category?.trim() || t.category,
      progress: cms?.progress ?? t.progress,
      imageUrl: cms?.imageUrl || "",
      staticPreview: t.staticPreview,
    };
  });

  const extras = (Array.isArray(cmsList) ? cmsList : []).filter((item) => !inferRealisationId(item));
  extras.forEach((item, i) => {
    merged.push({
      id: item.id || `extra-${i}`,
      title: item.title || `Réalisation ${i + 1}`,
      category: item.category || "Terrain",
      progress: item.progress ?? 70,
      imageUrl: item.imageUrl || "",
      staticPreview: "",
    });
  });

  return merged;
}

export function realisationsEditorToPayload(content = {}) {
  const items = mergeRealisationCmsItems(content.items || [])
    .filter((item) => item.imageUrl?.trim() || item.title?.trim())
    .map(({ id, title, category, progress, imageUrl }) => ({
      id,
      title,
      category,
      progress: progress ?? 70,
      imageUrl: imageUrl || "",
    }));
  return {
    footerText: content.footerText || "",
    items,
  };
}
