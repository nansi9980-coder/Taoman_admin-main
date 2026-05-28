/** Cartes détaillées page /services (lavage, déménagement, etc.) */
export const OPERATIONAL_SERVICE_TEMPLATES = [
  {
    id: "lavage",
    title: "Lavage automobile & moto",
    description:
      "Nettoyage intérieur et extérieur premium, vitres, jantes, pneus, polissage carrosserie. En centre TAOMAN ou en mobile à domicile.",
    badge: "Populaire",
    sla: "45 – 90 min",
    priceFrom: "Dès 3 500 FCFA",
    bullets: ["Lavage extérieur + intérieur complet", "Polish, lustrage et protection carrosserie", "Contrats flotte avec planning hebdomadaire"],
    href: "/lavage-auto/devis",
    imageUrl: "",
    published: true,
  },
  {
    id: "demenagement",
    title: "Déménagement & aménagement",
    description:
      "Déménagement de particuliers, d'entreprises et institutionnels. Emballage, transport sécurisé Lomé – sous-région CEDEAO.",
    badge: "Équipe dédiée",
    sla: "Sur rendez-vous",
    priceFrom: "Dès 45 000 FCFA",
    bullets: ["Visite technique gratuite et devis détaillé", "Cartons, papier bulle et couvertures fournis", "Trajet Lomé – Kara – Cotonou – Accra disponible"],
    href: "/demenagement/devis",
    imageUrl: "",
    published: true,
  },
  {
    id: "entretien-bureaux",
    title: "Entretien des bureaux",
    description:
      "Nettoyage professionnel régulier de bureaux, commerces, cliniques et écoles. Contrats journaliers, hebdomadaires ou mensuels.",
    badge: "Contrat pro",
    sla: "Journalier / hebdo",
    priceFrom: "Sur devis",
    bullets: ["Équipe identifiée en uniforme TAOMAN", "Produits écologiques et matériel professionnel", "Reporting mensuel et contrôle qualité"],
    href: "/entretien/bureaux",
    imageUrl: "",
    published: true,
  },
  {
    id: "mecanique",
    title: "Mécanique automobile",
    description:
      "Atelier multimarques : entretien préventif, vidange, freins, diagnostic OBD. Contrats flotte avec carnet de suivi.",
    badge: "Atelier pro",
    sla: "Devis 24h",
    priceFrom: "Devis transparent",
    bullets: ["Diagnostic électronique multimarques", "Pièces neuves ou reconditionnées", "Suivi flotte avec carnet d'entretien digital"],
    href: "/contact?topic=info&service=mecanique",
    imageUrl: "",
    published: true,
  },
  {
    id: "transport",
    title: "Transport & livraison",
    description:
      "Flotte de camions, fourgons, utilitaires et VTC. Transport B2B, livraison dernier kilomètre, navettes inter-villes.",
    badge: "Flotte propre",
    sla: "Lomé & sous-région",
    priceFrom: "Tarifs km",
    bullets: ["Livraison du dernier kilomètre à Lomé", "Transport B2B vers Cotonou, Accra, Ouaga", "Suivi GPS et confirmation de livraison"],
    href: "/contact?topic=info&service=transport",
    imageUrl: "",
    published: true,
  },
  {
    id: "climatisation",
    title: "Climatisation & froid",
    description:
      "Installation, entretien et dépannage de climatiseurs split et VRV. Maintenance vitrines réfrigérées et chambres froides.",
    badge: "Maintenance",
    sla: "Intervention 48h",
    priceFrom: "Dès 15 000 FCFA",
    bullets: ["Installation split et VRV résidentiel / pro", "Recharge gaz et nettoyage filtres", "Contrats maintenance préventive"],
    href: "/contact?topic=info&service=climatisation",
    imageUrl: "",
    published: true,
  },
  {
    id: "conciergerie",
    title: "Conciergerie & gardiennage",
    description:
      "Gardiennage, accueil visiteurs, gestion courrier, petite manutention pour résidences et entreprises.",
    badge: "Nouveau",
    sla: "24/7 disponible",
    priceFrom: "Sur devis",
    bullets: ["Gardiennage jour / nuit", "Accueil visiteurs et gestion accès", "Conciergerie d'immeuble clés en main"],
    href: "/contact?topic=info&service=conciergerie",
    imageUrl: "",
    published: true,
  },
  {
    id: "audits",
    title: "Audits & Reporting",
    description:
      "Audits financiers, opérationnels et conformité KYC. Reporting structuré conforme SYSCOA et CEDEAO.",
    badge: "Conformité",
    sla: "7 – 21 jours",
    priceFrom: "Sur devis",
    bullets: ["Audit financier et opérationnel des PME", "Reporting investisseur structuré", "Conformité KYC, AML, SYSCOA et CEDEAO"],
    href: "/contact?topic=info&service=audit",
    imageUrl: "",
    published: true,
  },
];

export function mergeOperationalServices(cmsList = []) {
  const byId = new Map();
  (Array.isArray(cmsList) ? cmsList : []).forEach((item) => {
    const id = item?.id && OPERATIONAL_SERVICE_TEMPLATES.some((t) => t.id === item.id) ? item.id : null;
    if (!id) return;
    const prev = byId.get(id);
    const bullets = Array.isArray(item.bullets)
      ? item.bullets
      : typeof item.bullets === "string"
        ? item.bullets.split("\n").map((s) => s.trim()).filter(Boolean)
        : prev?.bullets || [];
    byId.set(id, { ...prev, ...item, id, bullets });
  });

  return OPERATIONAL_SERVICE_TEMPLATES.map((t) => {
    const cms = byId.get(t.id);
    if (!cms) return { ...t };
    return {
      ...t,
      ...cms,
      id: t.id,
      bullets: cms.bullets?.length ? cms.bullets : t.bullets,
      published: cms.published !== false,
    };
  });
}

export function operationalServicesEditorToPayload(content = {}) {
  const items = mergeOperationalServices(content.items || []).map((item) => ({
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    badge: item.badge || "",
    sla: item.sla || "",
    priceFrom: item.priceFrom || "",
    bullets: Array.isArray(item.bullets) ? item.bullets : [],
    href: item.href || "",
    imageUrl: item.imageUrl || "",
    published: item.published !== false,
  }));
  return { items };
}
