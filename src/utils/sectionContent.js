import cmsV2Defaults from "../data/cms-v2-defaults.json";

const CMS_V2_KEYS = [
  "legal",
  "privacy",
  "terms",
  "jobs",
  "devisLavage",
  "devisDemenagement",
  "devisBureaux",
  "devisClimatisation",
];

/** Clés legacy en base (seed) → clés admin / vitrine */
export const LEGACY_SECTION_KEYS = {
  hero: ["heroBanner"],
  statistics: ["investmentStats"],
};

export const SECTION_PREVIEW_PATHS = {
  hero: "/",
  about: "/about",
  faq: "/faq",
  realisations: "/",
  mediaSettings: "/",
  contact: "/contact",
  cta: "/",
  footer: "/",
  seo: "/",
  statistics: "/",
  sectors: "/",
  testimonials: "/",
  investment: "/investissement",
  investmentTie: "/investissement/tie",
  servicesPage: "/services",
  legal: "/mentions-legales",
  privacy: "/confidentialite",
  terms: "/termes-conditions",
  jobs: "/jobs",
  devisLavage: "/lavage-auto/devis",
  devisDemenagement: "/demenagement/devis",
  devisBureaux: "/entretien/bureaux",
  devisClimatisation: "/entretien/climatisation",
};

export const VITRINE_PAGE_GROUPS = [
  {
    id: "home",
    label: "Accueil",
    path: "/",
    sections: ["hero", "statistics", "sectors", "realisations", "testimonials", "cta", "mediaSettings"],
  },
  {
    id: "about",
    label: "À propos",
    path: "/about",
    sections: ["about"],
  },
  {
    id: "investment",
    label: "Investissement",
    path: "/investissement",
    sections: ["investment", "investmentTie"],
  },
  {
    id: "services",
    label: "Services",
    path: "/services",
    sections: ["servicesPage"],
  },
  {
    id: "global",
    label: "Site global",
    path: "/",
    sections: ["faq", "contact", "footer", "seo"],
  },
  {
    id: "legal",
    label: "Pages légales",
    path: "/mentions-legales",
    sections: ["legal", "privacy", "terms"],
  },
  {
    id: "jobs",
    label: "Emplois",
    path: "/jobs",
    sections: ["jobs"],
  },
  {
    id: "devis",
    label: "Formulaires devis",
    path: "/services",
    sections: ["devisLavage", "devisDemenagement", "devisBureaux", "devisClimatisation"],
  },
];

export const SITE_SECTION_META = {
  hero: { emoji: "🏠", label: "Bandeau Hero", description: "Titre, badges et boutons (accueil)" },
  about: { emoji: "🏢", label: "Page À propos", description: "Mission, équipe dirigeante, parcours" },
  statistics: { emoji: "📊", label: "Notre impact", description: "Chiffres clés de la section impact" },
  sectors: { emoji: "🏗️", label: "Secteurs", description: "Cartes secteurs d'investissement" },
  realisations: { emoji: "🖼️", label: "Réalisations terrain", description: "Images, titres et texte pro sous la galerie" },
  mediaSettings: { emoji: "⚙️", label: "Vitesse défilement médias", description: "Autoplay et options de défilement" },
  testimonials: { emoji: "💬", label: "Témoignages", description: "Avis clients" },
  cta: { emoji: "📣", label: "Bannière CTA", description: "Appel à l'action accueil" },
  faq: { emoji: "❓", label: "FAQ", description: "Questions fréquentes" },
  footer: { emoji: "🔗", label: "Footer", description: "Pied de page" },
  contact: { emoji: "📞", label: "Coordonnées", description: "Téléphone, email, adresse" },
  seo: { emoji: "🔍", label: "SEO", description: "Meta titre et description" },
  investment: { emoji: "💰", label: "Page Investissement", description: "Hero et textes /investissement" },
  investmentTie: { emoji: "📈", label: "Programme TIE", description: "Page /investissement/tie" },
  servicesPage: { emoji: "🛠️", label: "Intro Services", description: "Hero page /services" },
  legal: { emoji: "⚖️", label: "Mentions légales", description: "Textes /mentions-legales" },
  privacy: { emoji: "🔒", label: "Confidentialité", description: "Textes /confidentialite" },
  terms: { emoji: "📜", label: "Termes & conditions", description: "Textes /termes-conditions" },
  jobs: { emoji: "💼", label: "Page Emplois", description: "Hero et textes /jobs" },
  devisLavage: { emoji: "🚗", label: "Devis lavage auto", description: "Hero /lavage-auto/devis" },
  devisDemenagement: { emoji: "📦", label: "Devis déménagement", description: "Hero /demenagement/devis" },
  devisBureaux: { emoji: "🏢", label: "Devis bureaux", description: "Hero /entretien/bureaux" },
  devisClimatisation: { emoji: "❄️", label: "Devis climatisation", description: "Hero /entretien/climatisation" },
};

const ABOUT_DEFAULTS = {
  title: "TAOMAN Groupe Investissement construit une plateforme de confiance.",
  description:
    "Notre ambition est de relier services terrain, investissement structuré, reporting et accompagnement client dans une expérience claire.",
  imageUrl: "",
  mission:
    "Offrir des services professionnels de qualité supérieure et créer des opportunités d'investissement transparentes qui transforment les vies de nos clients.",
  vision:
    "Être le leader régional dans la gestion d'investissements et les services professionnels, reconnu pour notre intégrité et notre excellence.",
  heroHighlights: [
    "Services opérationnels",
    "Investissement structuré",
    "Reporting investisseur",
    "Support humain",
  ],
  valuesTitle: "Nos Valeurs Fondamentales",
  values: [
    { icon: "01", title: "Excellence", description: "Qualité irréprochable dans chaque service et investissement" },
    { icon: "02", title: "Transparence", description: "Communication claire et honnête avec tous nos partenaires" },
    { icon: "03", title: "Innovation", description: "Solutions modernes, mesurables et orientées données" },
    { icon: "04", title: "Professionnalisme", description: "Équipe expérimentée et certifiée" },
  ],
  timelineTitle: "Notre Parcours",
  timeline: [
    { year: "2018", event: "Fondation de TAOMAN Groupe Investissement" },
    { year: "2020", event: "Lancement du programme d'investissement" },
    { year: "2022", event: "500K+ FCFA investis" },
    { year: "2024", event: "Expansion régionale" },
  ],
  leadersTitle: "Notre Équipe Dirigeante",
  leaders: [
    { name: "Kofi Mensah", role: "Directeur Général", bio: "Expert avec plus de 15 ans d'expérience dans le secteur financier.", photoUrl: "" },
    { name: "Ama Osei", role: "Directrice Financière", bio: "Expert avec plus de 15 ans d'expérience dans le secteur financier.", photoUrl: "" },
    { name: "Benjamin Tano", role: "Chef Opérations", bio: "Expert avec plus de 15 ans d'expérience dans le secteur financier.", photoUrl: "" },
  ],
  stats: [
    { number: "4", label: "Pôles de services" },
    { number: "10", label: "Mois de projection" },
    { number: "24h", label: "Délai de réponse cible" },
    { number: "PDF", label: "Reporting investisseur" },
  ],
  cta: {
    title: "Rejoignez l'écosystème TAOMAN Groupe Investissement",
    description: "Découvrez comment nous pouvons contribuer à votre succès.",
    buttonText: "Commencer maintenant",
  },
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

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const out = { ...base };
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    const bv = base[k];
    if (Array.isArray(pv)) {
      out[k] = pv.length ? pv : bv;
    } else if (pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object") {
      out[k] = deepMerge(bv, pv);
    } else if (pv !== undefined && pv !== null && pv !== "") {
      out[k] = pv;
    }
  }
  return out;
}

export function getDefaultSectionContent(key) {
  switch (key) {
    case "hero":
      return {
        badgeMain: "Entreprise TAOMAN Groupe Investissement",
        badges: ["KYC & conformité", "Reporting PDF", "Mobile Money", "Alertes WhatsApp"],
        title: "TAOMAN Groupe Investissement",
        subtitle: "la plateforme qui relie capital, services et exécution terrain",
        description:
          "TAOMAN Groupe Investissement met l'entreprise au centre : projets réels, réalisations visibles, simulation claire, dashboard investisseur et suivi transparent.",
        btn1: "Simuler mon rendement",
        btn2: "Voir nos services",
        imageCaption: "Projets suivis sur le terrain",
        heroImage: "",
        backgroundImage: "",
      };
    case "statistics":
      return {
        items: [
          { label: "Ticket minimum", value: "500K FCFA", icon: "01" },
          { label: "Horizon maximum", value: "10 mois", icon: "02" },
          { label: "Suivi portefeuille", value: "24/7", icon: "03" },
          { label: "Reporting investisseur", value: "PDF + Web", icon: "04" },
        ],
      };
    case "sectors":
      return {
        items: [
          { title: "BTP & Immobilier", description: "Projets de construction durable", imageUrl: "" },
          { title: "Agro & Énergie", description: "Agriculture moderne et énergies renouvelables", imageUrl: "" },
          { title: "Transport & Logistique", description: "Solutions logistiques intégrées", imageUrl: "" },
          { title: "Marketing International", description: "Visibilité de marque, acquisition internationale et croissance export", imageUrl: "" },
        ],
      };
    case "realisations":
      return {
        footerText:
          "TAOMAN Group Investment transforme les opérations terrain en résultats mesurables : chaque réalisation est suivie, documentée et alignée sur nos standards de qualité.",
        items: [],
      };
    case "mediaSettings":
      return {
        autoplayInterval: 4500,
        autoplayEnabled: true,
        pauseOnHover: true,
        transitionMs: 800,
        showIndicators: true,
        showArrows: true,
        kenBurns: true,
      };
    case "testimonials":
      return {
        items: [
          {
            name: "Jean Tchakondo",
            role: "Investisseur Privé",
            comment:
              "TAOMAN Groupe Investissement offre une transparence exceptionnelle. J'ai augmenté mes revenus mensuels de manière constante.",
          },
          {
            name: "Marie Sefako",
            role: "PDG - Groupe Import",
            comment: "Service d'entretien impeccable et équipe professionnelle. Je recommande vivement TAOMAN Groupe Investissement!",
          },
        ],
      };
    case "cta":
      return {
        title: "Prêt à investir avec TAOMAN ?",
        subtitle: "Rejoignez des centaines d'investisseurs qui font confiance à notre plateforme.",
        buttonText: "Commencer maintenant",
        imageUrl: "",
        backgroundImage: "",
      };
    case "faq":
      return { items: [] };
    case "footer":
      return {
        description:
          "TAOMAN Groupe Investissement — services professionnels et investissement structuré pour particuliers et entreprises.",
      };
    case "contact":
      return {
        phone: "+228 90 42 13 77",
        email: "contact@taoman.com",
        address: "Lomé, Togo",
        hours: "Lun - Dim : 08h00 - 20h00",
      };
    case "seo":
      return {
        metaTitle: "TAOMAN Groupe Investissement",
        metaDescription: "Services professionnels et investissement structuré — TAOMAN Groupe Investissement.",
      };
    case "about":
      return JSON.parse(JSON.stringify(ABOUT_DEFAULTS));
    case "investment":
      return {
        badge: "Investissement structuré",
        title: "TAOMAN Groupe Investissement",
        description:
          "Une plateforme claire pour comprendre les projets, simuler les intérêts, suivre le capital et recevoir un reporting exploitable.",
        stats: [
          { value: "500K FCFA", label: "Ticket minimum" },
          { value: "10 mois", label: "Horizon maximum demandé" },
          { value: "3 modes", label: "Simulation simple, avancée, pro" },
          { value: "24/7", label: "Suivi portefeuille après connexion" },
        ],
      };
    case "investmentTie":
      return {
        badge: "TAOMAN TIE",
        title: "TAOMAN Groupe Investissement",
        subtitle: "Bâtissez votre indépendance financière",
        description:
          "Une opportunité transformative pour les investisseurs recherchant des rendements durables et un impact communautaire significatif à Lomé et au-delà.",
        stats: [
          { label: "Investissement Minimum", value: "500K FCFA", icon: "💰" },
          { label: "Rendement Moyen", value: "150K FCFA/mois", icon: "📈" },
          { label: "Délai Retour", value: "10 mois", icon: "⏱️" },
          { label: "Retour Total Moyen", value: "2M FCFA", icon: "🎯" },
        ],
      };
    case "servicesPage":
      return {
        badge: "Services opérationnels",
        title: "Des services terrain clairs, rapides et suivis.",
        description:
          "TAOMAN Groupe Investissement combine équipes terrain, devis structurés, qualité contrôlée et suivi client pour les particuliers, entreprises et investisseurs.",
        btn1: "Demander un devis",
        btn2: "Voir l'investissement",
      };
    default:
      if (CMS_V2_KEYS.includes(key) && cmsV2Defaults[key]) {
        return JSON.parse(JSON.stringify(cmsV2Defaults[key]));
      }
      return {};
  }
}

function mergeContentBlocks(defaultBlocks = [], apiBlocks = []) {
  if (!apiBlocks?.length) return defaultBlocks;
  const maxLen = Math.max(defaultBlocks.length, apiBlocks.length);
  const out = [];
  for (let i = 0; i < maxLen; i++) {
    out.push({ ...defaultBlocks[i], ...apiBlocks[i] });
  }
  return out;
}

export function getEffectiveSectionContent(key, texts) {
  const record = findSectionRecord(texts, key);
  const fromApi = parseSectionContent(record?.content);
  const defaults = getDefaultSectionContent(key);
  if (!record) return JSON.parse(JSON.stringify(defaults));

  if (key === "hero") {
    return normalizeHeroForEditor(deepMerge(getDefaultSectionContent("hero"), fromApi));
  }
  if (key === "statistics") {
    if (Array.isArray(fromApi) && fromApi.length) {
      return { items: fromApi };
    }
    const merged = deepMerge(defaults, fromApi);
    if (Array.isArray(merged.items) && merged.items.length) return merged;
    return defaults;
  }
  if (key === "about") {
    return deepMerge(ABOUT_DEFAULTS, fromApi);
  }
  const merged = deepMerge(defaults, fromApi);
  if (merged.blocks) {
    merged.blocks = mergeContentBlocks(defaults.blocks, fromApi.blocks);
  }
  if (key === "jobs" && fromApi.categories?.length) {
    merged.categories = fromApi.categories;
  }
  return merged;
}

export function prepareContentForEditor(key, texts) {
  const effective = getEffectiveSectionContent(key, texts);
  if (key === "hero") return normalizeHeroForEditor(effective);
  if (key === "statistics") {
    if (Array.isArray(effective.items) && effective.items.length) {
      return normalizeStatsForEditor(effective.items);
    }
    return normalizeStatsForEditor(effective);
  }
  if (key === "about") return normalizeAboutForEditor(effective);
  if (["sectors", "testimonials", "faq", "realisations"].includes(key)) {
    const items = effective.items?.length ? effective.items : getDefaultSectionContent(key).items || [{}];
    return { ...effective, items };
  }
  if (["legal", "privacy", "terms"].includes(key)) {
    const blocks = effective.blocks?.length ? effective.blocks : getDefaultSectionContent(key).blocks || [{ title: "", body: "" }];
    return { ...effective, blocks };
  }
  if (key === "jobs") {
    return {
      ...effective,
      categories: effective.categories?.length ? effective.categories : getDefaultSectionContent("jobs").categories,
    };
  }
  return effective;
}

export function normalizeAboutForEditor(content = {}) {
  const d = ABOUT_DEFAULTS;
  return {
    title: content.title || d.title,
    description: content.description || content.subtitle || d.description,
    imageUrl: content.imageUrl || "",
    mission: content.mission || d.mission,
    vision: content.vision || d.vision,
    heroHighlights:
      Array.isArray(content.heroHighlights) && content.heroHighlights.length
        ? content.heroHighlights
        : d.heroHighlights,
    valuesTitle: content.valuesTitle || d.valuesTitle,
    values: content.values?.length ? content.values : d.values,
    timelineTitle: content.timelineTitle || d.timelineTitle,
    timeline: content.timeline?.length ? content.timeline : d.timeline,
    leadersTitle: content.leadersTitle || d.leadersTitle,
    leaders: content.leaders?.length ? content.leaders : d.leaders,
    stats: content.stats?.length ? content.stats : d.stats,
    cta: deepMerge(d.cta, content.cta || {}),
  };
}

export function aboutEditorToPayload(content) {
  return normalizeAboutForEditor(content);
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
    imageCaption: content.imageCaption || "Projets suivis sur le terrain",
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
  if (Array.isArray(content?.items)) {
    return normalizeStatsForEditor(content.items);
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
  const c = getEffectiveSectionContent(key, texts);
  switch (key) {
    case "hero": {
      const h = normalizeHeroForEditor(c);
      return [h.title, h.subtitle].filter(Boolean).join(" · ");
    }
    case "statistics": {
      const stats = Array.isArray(c.items) ? c.items : [];
      return stats.map((s) => `${s.label}: ${s.value}`).join(" · ") || "—";
    }
    case "about":
      return `${c.title?.slice(0, 40)}… · ${(c.leaders || []).length} dirigeant(s)`;
    case "sectors":
    case "testimonials":
    case "faq":
      return (c.items || [])
        .slice(0, 2)
        .map((i) => i.title || i.name || i.question || "")
        .filter(Boolean)
        .join(" · ");
    case "cta":
      return [c.title, c.buttonText].filter(Boolean).join(" · ");
    case "footer":
      return (c.description || "").slice(0, 80);
    case "contact":
      return [c.phone, c.email].filter(Boolean).join(" · ");
    case "seo":
      return c.metaTitle || "—";
    case "investment":
    case "investmentTie":
    case "servicesPage":
      return [c.title, c.badge].filter(Boolean).join(" · ");
    case "legal":
    case "privacy":
    case "terms":
      return `${c.title} · ${(c.blocks || []).length} bloc(s)`;
    case "jobs":
      return [c.title, c.subtitle?.slice(0, 40)].filter(Boolean).join(" · ");
    case "devisLavage":
    case "devisDemenagement":
    case "devisBureaux":
    case "devisClimatisation":
      return c.title || "—";
    default:
      return hasSectionRecord(texts, key) ? "Contenu enregistré" : "Défaut vitrine";
  }
}
