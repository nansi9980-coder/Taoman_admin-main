import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl } from "../utils/api";
import clsx from "clsx";
import MediaPicker from "../components/MediaPicker";

function parseSectionContent(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const SITE_SECTIONS = [
  { key: "hero", emoji: "🏠", label: "Section Hero", description: "Titre principal et boutons (accueil)" },
  { key: "about", emoji: "🏢", label: "À propos", description: "Texte page À propos" },
  { key: "statistics", emoji: "📊", label: "Statistiques", description: "Chiffres clés (accueil)" },
  { key: "sectors", emoji: "🏗️", label: "Secteurs", description: "Cartes secteurs d'investissement" },
  { key: "testimonials", emoji: "💬", label: "Témoignages", description: "Avis clients (accueil)" },
  { key: "cta", emoji: "📣", label: "Bannière CTA", description: "Appel à l'action" },
  { key: "faq", emoji: "❓", label: "FAQ", description: "Questions fréquentes" },
  { key: "footer", emoji: "🔗", label: "Footer", description: "Pied de page" },
  { key: "contact", emoji: "📞", label: "Coordonnées", description: "Téléphone, email, adresse" },
  { key: "seo", emoji: "🔍", label: "SEO", description: "Meta titre et description" },
];

function ensureItems(content, fallback = [{}]) {
  if (Array.isArray(content?.items) && content.items.length > 0) return content;
  return { ...content, items: fallback };
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg sticky top-0 bg-surface dark:bg-[#12131a] pt-4 pb-2 z-10 border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{title}</h3>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-outline">close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function Contenu() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("section");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState("hero");

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "",
    imageUrl: "",
    actionText: "",
    actionLink: "",
    published: true,
  });

  const [textForm, setTextForm] = useState({
    section: "hero",
    content: {},
  });

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await apiFetch("/content/admin", { token });
      setServices(Array.isArray(data?.services) ? data.services : []);
      setTexts(Array.isArray(data?.texts) ? data.texts : []);
    } catch (e) {
      console.error(e);
      setLoadError(e.message || "Impossible de charger le contenu. Vérifiez la connexion API.");
      setServices([]);
      setTexts([]);
    } finally {
      setLoading(false);
    }
  };

  const hasSectionContent = (key) => texts.some((t) => t.section === key);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const openNewService = () => {
    setModalType("service");
    setSelectedSection(null);
    setEditingItem(null);
    setServiceForm({ title: "", description: "", icon: "", imageUrl: "", actionText: "", actionLink: "", published: true });
    setModalOpen(true);
  };

  const openEditService = (srv) => {
    setModalType("service");
    setSelectedSection(null);
    setEditingItem(srv);
    setServiceForm({
      title: srv.title || "",
      description: srv.description || "",
      icon: srv.icon || "",
      imageUrl: srv.imageUrl || "",
      actionText: srv.actionText || "",
      actionLink: srv.actionLink || "",
      published: srv.published ?? true,
    });
    setModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiFetch(`/content/${editingItem.id}`, { method: "PUT", body: serviceForm, token });
      } else {
        await apiFetch("/content", { method: "POST", body: serviceForm, token });
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteService = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce service ?")) return;
    try {
      await apiFetch(`/content/${id}`, { method: "DELETE", token });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTogglePublish = async (id, currentStatus, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/content/services/${id}`, { method: "PUT", body: { published: !currentStatus }, token });
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const openSectionEditor = (key) => {
    const section = texts.find((item) => item.section === key) || null;
    let content = parseSectionContent(section?.content);
    if (key === "testimonials" && !content.items?.length) {
      content = { items: [{ name: "", role: "", comment: "" }] };
    }
    if (key === "faq" && !content.items?.length) {
      content = { items: [{ question: "", answer: "" }] };
    }
    if (key === "sectors" && !content.items?.length) {
      content = { items: [{ title: "", description: "", imageUrl: "" }] };
    }
    setModalType("section");
    setSelectedSection(key);
    setEditingItem(section);
    setTextForm({ section: key, content });
    setModalOpen(true);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: textForm.section, content: textForm.content },
        token,
      });
      setSaveMessage("Section enregistrée avec succès.");
      setModalOpen(false);
      loadData();
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteSection = async () => {
    if (!hasSectionContent(textForm.section)) return;
    if (!window.confirm(`Supprimer le contenu de la section « ${textForm.section} » ?`)) return;
    try {
      await apiFetch(`/content/texts/${textForm.section}`, { method: "DELETE", token });
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const updateContentField = (patch) => {
    setTextForm((prev) => ({ ...prev, content: { ...prev.content, ...patch } }));
  };

  const updateListItem = (listKey, index, field, value) => {
    setTextForm((prev) => {
      const base = ensureItems(prev.content, []);
      const items = [...(base.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, content: { ...prev.content, items } };
    });
  };

  const addListItem = (listKey, emptyItem) => {
    setTextForm((prev) => {
      const base = ensureItems(prev.content, []);
      return { ...prev, content: { ...prev.content, items: [...(base.items || []), emptyItem] } };
    });
  };

  const removeListItem = (index) => {
    setTextForm((prev) => {
      const items = [...(prev.content?.items || [])];
      items.splice(index, 1);
      return { ...prev, content: { ...prev.content, items } };
    });
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Contenu du site</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Mettez à jour le contenu du site vitrine directement depuis ce tableau de bord.
          </p>
        </div>
        <a
          href="https://taoman-platforme.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary gap-xs w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Voir le site
        </a>
      </div>

      {loadError && (
        <div className="rounded-lg border border-error/30 bg-error-container/10 p-md text-error">
          {loadError}
          <button type="button" onClick={loadData} className="btn-secondary mt-sm text-label-sm">
            Réessayer
          </button>
        </div>
      )}

      {saveMessage && (
        <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-900/20 p-md text-green-800 dark:text-green-200">
          {saveMessage}
        </div>
      )}

      <p className="text-body-md text-on-surface-variant">
        Cliquez sur une <strong>section</strong> pour modifier textes et images. En bas : <strong>cartes de services</strong> (créer, modifier, publier, supprimer).
      </p>

      {/* Sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {SITE_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => openSectionEditor(section.key)}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors rounded-xl border border-outline-variant"
          >
            <span className="text-2xl">{section.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-on-surface flex items-center gap-2 flex-wrap">
                {section.label}
                {hasSectionContent(section.key) && (
                  <span className="badge badge-success text-label-sm">Rempli</span>
                )}
              </p>
              <p className="text-body-sm text-on-surface-variant">{section.description}</p>
            </div>
            <span className="material-symbols-outlined text-outline">edit</span>
          </button>
        ))}
      </div>

      {/* Services section */}
      <div className="mt-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-md">
          <div>
            <h2 className="text-headline-lg text-on-surface dark:text-[#e4e4ef] font-bold">Cartes de services</h2>
            <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
              Gérez les cartes de services affichées sur la page d'accueil
            </p>
          </div>
          <button onClick={openNewService} className="btn-primary gap-xs w-fit">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouveau service
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
            Chargement...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">design_services</span>
            <p className="text-body-md text-on-surface-variant">Aucun service défini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {services.map((srv) => (
              <div key={srv.id} onClick={() => openEditService(srv)} className="card hover:border-primary/50 cursor-pointer transition-colors relative group">
                <div className="flex justify-between items-start mb-sm">
                  {srv.imageUrl ? (
                    <img
                      src={buildUrl(srv.imageUrl)}
                      alt={srv.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-primary bg-primary-container/20 p-sm rounded-lg">
                      {srv.icon || "category"}
                    </span>
                  )}
                  <span className={clsx("badge", srv.published ? "badge-success" : "badge-warning")}>{srv.published ? "Publié" : "Brouillon"}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{srv.title}</h3>
                <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-md">{srv.description}</p>
                <div className="flex items-center gap-xs text-label-sm font-semibold text-primary">
                  {srv.actionText || "En savoir plus"} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleTogglePublish(srv.id, srv.published, e)} className="p-xs bg-surface shadow-sm rounded text-primary hover:bg-primary-container">
                    <span className="material-symbols-outlined text-[18px]">{srv.published ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button onClick={(e) => handleDeleteService(srv.id, e)} className="p-xs bg-surface shadow-sm rounded text-error hover:bg-error-container">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Modal */}
      {modalOpen && modalType === "section" && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Modifier ${SITE_SECTIONS.find(s => s.key === selectedSection)?.label || selectedSection}`}>
          <form onSubmit={handleTextSubmit} className="space-y-md pb-lg">
            {selectedSection === "hero" && (
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Titre (Français)</label>
                    <input
                      required
                      value={textForm.content?.titleFr || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, titleFr: e.target.value}})}
                      className="input-field"
                      placeholder="Titre principal"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Titre (Anglais)</label>
                    <input
                      value={textForm.content?.titleEn || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, titleEn: e.target.value}})}
                      className="input-field"
                      placeholder="Main title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Sous-titre</label>
                  <textarea
                    value={textForm.content?.subtitle || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, subtitle: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description principale"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Bouton principal</label>
                    <input
                      value={textForm.content?.primaryButton || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, primaryButton: e.target.value}})}
                      className="input-field"
                      placeholder="Texte du bouton"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Bouton secondaire</label>
                    <input
                      value={textForm.content?.secondaryButton || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, secondaryButton: e.target.value}})}
                      className="input-field"
                      placeholder="Texte du bouton"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Badge / étiquette</label>
                  <input
                    value={textForm.content?.badge || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, badge: e.target.value}})}
                    className="input-field"
                    placeholder="Texte du badge"
                  />
                </div>
                <MediaPicker
                  label="Image de fond (hero)"
                  value={textForm.content?.heroImage || textForm.content?.backgroundImage || ""}
                  onChange={(url) =>
                    setTextForm({
                      ...textForm,
                      content: { ...textForm.content, heroImage: url, backgroundImage: url },
                    })
                  }
                />
              </div>
            )}

            {selectedSection === "about" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Titre</label>
                  <input
                    required
                    value={textForm.content?.title || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, title: e.target.value}})}
                    className="input-field"
                    placeholder="Titre de la section"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Description</label>
                  <textarea
                    required
                    value={textForm.content?.description || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, description: e.target.value}})}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Description de l'entreprise"
                  />
                </div>
                <MediaPicker
                  label="Image de la section"
                  value={textForm.content?.imageUrl || ""}
                  onChange={(url) =>
                    setTextForm({ ...textForm, content: { ...textForm.content, imageUrl: url } })
                  }
                />
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Mission</label>
                  <textarea className="input-field resize-none" rows={3} value={textForm.content?.mission || ""} onChange={(e) => updateContentField({ mission: e.target.value })} />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Vision</label>
                  <textarea className="input-field resize-none" rows={3} value={textForm.content?.vision || ""} onChange={(e) => updateContentField({ vision: e.target.value })} />
                </div>
              </div>
            )}

            {selectedSection === "statistics" && (
              <div className="space-y-md">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-md p-md border border-outline-variant rounded-lg">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Valeur {index + 1}</label>
                      <input
                        value={textForm.content?.[`value${index}`] || ""}
                        onChange={(e) => setTextForm({...textForm, content: {...textForm.content, [`value${index}`]: e.target.value}})}
                        className="input-field"
                        placeholder="500+"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Label {index + 1}</label>
                      <input
                        value={textForm.content?.[`label${index}`] || ""}
                        onChange={(e) => setTextForm({...textForm, content: {...textForm.content, [`label${index}`]: e.target.value}})}
                        className="input-field"
                        placeholder="Foyers raccordés"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "cta" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Titre</label>
                  <input
                    required
                    value={textForm.content?.title || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, title: e.target.value}})}
                    className="input-field"
                    placeholder="Titre de l'appel à l'action"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Sous-titre</label>
                  <textarea
                    value={textForm.content?.subtitle || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, subtitle: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description de l'appel à l'action"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Texte du bouton</label>
                  <input
                    value={textForm.content?.buttonText || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, buttonText: e.target.value}})}
                    className="input-field"
                    placeholder="Texte du bouton d'action"
                  />
                </div>
                <MediaPicker
                  label="Image de fond CTA"
                  value={textForm.content?.imageUrl || textForm.content?.backgroundImage || ""}
                  onChange={(url) =>
                    setTextForm({ ...textForm, content: { ...textForm.content, imageUrl: url, backgroundImage: url } })
                  }
                />
              </div>
            )}

            {selectedSection === "footer" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Description</label>
                  <textarea
                    required
                    value={textForm.content?.description || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, description: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Texte du footer"
                  />
                </div>
              </div>
            )}

            {selectedSection === "testimonials" && (
              <div className="space-y-md">
                {(ensureItems(textForm.content, [{ name: "", role: "", comment: "" }]).items || []).map((t, index) => (
                  <div key={index} className="p-md border border-outline-variant rounded-lg space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-label-md font-semibold">Témoignage {index + 1}</span>
                      {(textForm.content?.items?.length || 0) > 1 && (
                        <button type="button" onClick={() => removeListItem(index)} className="text-error text-label-sm">Supprimer</button>
                      )}
                    </div>
                    <input className="input-field" placeholder="Nom" value={t.name || ""} onChange={(e) => updateListItem("items", index, "name", e.target.value)} />
                    <input className="input-field" placeholder="Rôle" value={t.role || ""} onChange={(e) => updateListItem("items", index, "role", e.target.value)} />
                    <textarea className="input-field resize-none" rows={3} placeholder="Commentaire" value={t.comment || ""} onChange={(e) => updateListItem("items", index, "comment", e.target.value)} />
                  </div>
                ))}
                <button type="button" onClick={() => addListItem("items", { name: "", role: "", comment: "" })} className="btn-secondary text-label-sm">+ Ajouter un témoignage</button>
              </div>
            )}

            {selectedSection === "sectors" && (
              <div className="space-y-md">
                {(ensureItems(textForm.content, [{ title: "", description: "", imageUrl: "" }]).items || []).map((s, index) => (
                  <div key={index} className="p-md border border-outline-variant rounded-lg space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-label-md font-semibold">Secteur {index + 1}</span>
                      {(textForm.content?.items?.length || 0) > 1 && (
                        <button type="button" onClick={() => removeListItem(index)} className="text-error text-label-sm">Supprimer</button>
                      )}
                    </div>
                    <input className="input-field" placeholder="Titre" value={s.title || ""} onChange={(e) => updateListItem("items", index, "title", e.target.value)} />
                    <textarea className="input-field resize-none" rows={2} placeholder="Description" value={s.description || ""} onChange={(e) => updateListItem("items", index, "description", e.target.value)} />
                    <MediaPicker label="Image" value={s.imageUrl || ""} onChange={(url) => updateListItem("items", index, "imageUrl", url)} />
                  </div>
                ))}
                <button type="button" onClick={() => addListItem("items", { title: "", description: "", imageUrl: "" })} className="btn-secondary text-label-sm">+ Ajouter un secteur</button>
              </div>
            )}

            {selectedSection === "faq" && (
              <div className="space-y-md">
                {(ensureItems(textForm.content, [{ question: "", answer: "" }]).items || []).map((q, index) => (
                  <div key={index} className="p-md border border-outline-variant rounded-lg space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-label-md font-semibold">Question {index + 1}</span>
                      {(textForm.content?.items?.length || 0) > 1 && (
                        <button type="button" onClick={() => removeListItem(index)} className="text-error text-label-sm">Supprimer</button>
                      )}
                    </div>
                    <input className="input-field" placeholder="Question" value={q.question || ""} onChange={(e) => updateListItem("items", index, "question", e.target.value)} />
                    <textarea className="input-field resize-none" rows={3} placeholder="Réponse" value={q.answer || ""} onChange={(e) => updateListItem("items", index, "answer", e.target.value)} />
                  </div>
                ))}
                <button type="button" onClick={() => addListItem("items", { question: "", answer: "" })} className="btn-secondary text-label-sm">+ Ajouter une question</button>
              </div>
            )}

            {selectedSection === "contact" && (
              <div className="space-y-md">
                <input className="input-field" placeholder="Téléphone" value={textForm.content?.phone || ""} onChange={(e) => updateContentField({ phone: e.target.value })} />
                <input className="input-field" type="email" placeholder="Email" value={textForm.content?.email || ""} onChange={(e) => updateContentField({ email: e.target.value })} />
                <input className="input-field" placeholder="Adresse" value={textForm.content?.address || ""} onChange={(e) => updateContentField({ address: e.target.value })} />
                <input className="input-field" placeholder="Horaires" value={textForm.content?.hours || ""} onChange={(e) => updateContentField({ hours: e.target.value })} />
              </div>
            )}

            {selectedSection === "seo" && (
              <div className="space-y-md">
                <input className="input-field" placeholder="Meta titre" value={textForm.content?.metaTitle || ""} onChange={(e) => updateContentField({ metaTitle: e.target.value })} />
                <textarea className="input-field resize-none" rows={3} placeholder="Meta description" value={textForm.content?.metaDescription || ""} onChange={(e) => updateContentField({ metaDescription: e.target.value })} />
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-sm pt-md border-t border-outline-variant">
              {hasSectionContent(textForm.section) && (
                <button type="button" onClick={handleDeleteSection} className="btn-secondary text-error">
                  Supprimer cette section
                </button>
              )}
              <div className="flex gap-sm ml-auto">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary gap-xs">
                  <span className="material-symbols-outlined text-[18px]">save</span>Sauvegarder
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Service Modal */}
      {modalOpen && modalType === "service" && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier le service" : "Nouveau service"}>
          <form onSubmit={handleServiceSubmit} className="space-y-md pb-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="md:col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-xs">Titre du service *</label>
                <input
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Lavage & Entretien Auto"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Icône (Material Symbol)</label>
                <input
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  className="input-field"
                  placeholder="Ex: cleaning_services"
                />
              </div>
              <div className="md:col-span-2">
                <MediaPicker
                  label="Image du service"
                  value={serviceForm.imageUrl}
                  onChange={(url) => setServiceForm({ ...serviceForm, imageUrl: url })}
                />
              </div>
              <div className="row-span-2 md:col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-xs">Description *</label>
                <textarea
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Description de l'offre..."
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Texte d'action</label>
                <input
                  value={serviceForm.actionText}
                  onChange={(e) => setServiceForm({ ...serviceForm, actionText: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Demander un devis"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Lien d'action</label>
                <input
                  value={serviceForm.actionLink}
                  onChange={(e) => setServiceForm({ ...serviceForm, actionLink: e.target.value })}
                  className="input-field"
                  placeholder="Ex: /devis/lavage-auto"
                />
              </div>
            </div>
            <label className="flex items-center gap-sm cursor-pointer mt-sm">
              <input
                type="checkbox"
                checked={serviceForm.published}
                onChange={(e) => setServiceForm({ ...serviceForm, published: e.target.checked })}
                className="w-4 h-4 text-primary bg-surface-container-low border-outline rounded"
              />
              <span className="text-body-md text-on-surface">Publier la carte sur le site</span>
            </label>
            <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary gap-xs">
                <span className="material-symbols-outlined text-[18px]">save</span>Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
