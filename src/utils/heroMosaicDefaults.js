/** Mosaïque hero accueil (3 images + encart KPI) */
export const HERO_MOSAIC_TILES = [
  { id: "logistics", tag: "Logistique", title: "Flotte multi-utilitaires", imageUrl: "" },
  { id: "services", tag: "Services", title: "Lavage premium", imageUrl: "" },
  { id: "teams", tag: "Équipes", title: "Conducteurs certifiés", imageUrl: "" },
];

export const HERO_MOSAIC_KPI_DEFAULTS = {
  liveLabel: "Live",
  livePill: "Suivi temps réel",
  kpiPercent: 96,
  kpiLabel: "satisfaction client",
};

export function mergeHeroMosaicTiles(cmsTiles = []) {
  const byId = new Map();
  (Array.isArray(cmsTiles) ? cmsTiles : []).forEach((item) => {
    const id = item?.id && HERO_MOSAIC_TILES.some((t) => t.id === item.id) ? item.id : null;
    if (!id) return;
    byId.set(id, { ...byId.get(id), ...item, id });
  });
  return HERO_MOSAIC_TILES.map((t) => {
    const cms = byId.get(t.id);
    return {
      id: t.id,
      tag: cms?.tag?.trim() || t.tag,
      title: cms?.title?.trim() || t.title,
      imageUrl: cms?.imageUrl || "",
    };
  });
}

export function mergeHeroMosaicBlock(mosaic = {}) {
  return {
    ...HERO_MOSAIC_KPI_DEFAULTS,
    ...mosaic,
    liveLabel: mosaic.liveLabel ?? HERO_MOSAIC_KPI_DEFAULTS.liveLabel,
    livePill: mosaic.livePill ?? HERO_MOSAIC_KPI_DEFAULTS.livePill,
    kpiPercent: mosaic.kpiPercent ?? HERO_MOSAIC_KPI_DEFAULTS.kpiPercent,
    kpiLabel: mosaic.kpiLabel ?? HERO_MOSAIC_KPI_DEFAULTS.kpiLabel,
    tiles: mergeHeroMosaicTiles(mosaic.tiles),
  };
}

export function heroEditorToPayload(content = {}) {
  const mosaic = mergeHeroMosaicBlock(content.mosaic || {});
  return {
    badgeMain: content.badgeMain || content.badge || "",
    badges: Array.isArray(content.badges) ? content.badges : [],
    title: content.title || "",
    subtitle: content.subtitle || "",
    description: content.description || "",
    btn1: content.btn1 || "",
    btn2: content.btn2 || "",
    imageCaption: content.imageCaption || "",
    heroImage: content.heroImage || content.backgroundImage || "",
    backgroundImage: content.heroImage || content.backgroundImage || "",
    mosaic,
  };
}
