import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl } from "../utils/api";
import clsx from "clsx";
import MediaPicker from "../components/MediaPicker";
import SectionReadOnly from "../components/SectionReadOnly";
import SectionEditorFields from "../components/SectionEditorFields";
import {
  VITRINE_PAGE_GROUPS,
  SITE_SECTION_META,
  SECTION_PREVIEW_PATHS,
  hasSectionRecord,
  prepareContentForEditor,
  getEffectiveSectionContent,
  statsEditorToPayload,
  aboutEditorToPayload,
  sectorsEditorToPayload,
  realisationsEditorToPayload,
} from "../utils/sectionContent";
import { DEFAULT_HOME_SERVICES } from "../utils/homeServicesDefaults";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg sticky top-0 bg-surface dark:bg-[#12131a] pt-4 pb-2 z-10 border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{title}</h3>
          <button type="button" onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container-low transition-colors">
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
  const [seedingServices, setSeedingServices] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savePreviewUrl, setSavePreviewUrl] = useState("");
  const vitrineBase = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_CLIENT_URL || "").replace(/\/$/, "");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("section");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "",
    imageUrl: "",
    actionText: "",
    actionLink: "",
    published: true,
  });

  const [textForm, setTextForm] = useState({ section: "", content: {} });

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await apiFetch("/content/admin", { token });
      setServices(Array.isArray(data?.services) ? data.services : []);
      setTexts(Array.isArray(data?.texts) ? data.texts : []);
    } catch (e) {
      console.error(e);
      setLoadError(e.message || "Impossible de charger le contenu.");
      setServices([]);
      setTexts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const openSectionEditor = (key) => {
    const section = texts.find((t) => t.section === key) || null;
    setModalType("section");
    setSelectedSection(key);
    setEditingItem(section);
    setTextForm({ section: key, content: prepareContentForEditor(key, texts) });
    setModalOpen(true);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    let payload = textForm.content;
    if (textForm.section === "statistics") payload = statsEditorToPayload(textForm.content);
    if (textForm.section === "about") payload = aboutEditorToPayload(textForm.content);
    if (textForm.section === "sectors") payload = sectorsEditorToPayload(textForm.content);
    if (textForm.section === "realisations") payload = realisationsEditorToPayload(textForm.content);
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: textForm.section, content: payload },
        token,
      });
      setSaveMessage("Section enregistrée avec succès.");
      setSavePreviewUrl(
        vitrineBase ? `${vitrineBase}${SECTION_PREVIEW_PATHS[textForm.section] || "/"}` : ""
      );
      setModalOpen(false);
      loadData();
      setTimeout(() => {
        setSaveMessage("");
        setSavePreviewUrl("");
      }, 8000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSection = async () => {
    if (!hasSectionRecord(texts, textForm.section)) return;
    if (!window.confirm(`Supprimer le contenu enregistré de « ${textForm.section} » ?`)) return;
    try {
      await apiFetch(`/content/texts/${textForm.section}`, { method: "DELETE", token });
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateContentField = (patch) => {
    setTextForm((prev) => ({ ...prev, content: { ...prev.content, ...patch } }));
  };

  const setContent = (content) => setTextForm((prev) => ({ ...prev, content }));

  const updateListItem = (index, field, value) => {
    setTextForm((prev) => {
      const items = [...(prev.content?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, content: { ...prev.content, items } };
    });
  };

  const addListItem = (emptyItem) => {
    setTextForm((prev) => ({
      ...prev,
      content: { ...prev.content, items: [...(prev.content?.items || []), emptyItem] },
    }));
  };

  const removeListItem = (index) => {
    setTextForm((prev) => {
      const items = [...(prev.content?.items || [])];
      items.splice(index, 1);
      return { ...prev, content: { ...prev.content, items } };
    });
  };

  const updateNestedList = (listKey, index, field, value) => {
    setTextForm((prev) => {
      const list = [...(prev.content[listKey] || [])];
      if (field === null) {
        list[index] = value;
      } else {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, content: { ...prev.content, [listKey]: list } };
    });
  };

  const addNestedList = (listKey, emptyItem) => {
    setTextForm((prev) => ({
      ...prev,
      content: { ...prev.content, [listKey]: [...(prev.content[listKey] || []), emptyItem] },
    }));
  };

  const removeNestedList = (listKey, index) => {
    setTextForm((prev) => {
      const list = [...(prev.content[listKey] || [])];
      list.splice(index, 1);
      return { ...prev, content: { ...prev.content, [listKey]: list } };
    });
  };

  const openNewService = () => {
    setModalType("service");
    setEditingItem(null);
    setServiceForm({ title: "", description: "", icon: "", imageUrl: "", actionText: "", actionLink: "", published: true });
    setModalOpen(true);
  };

  const openEditService = (srv) => {
    setModalType("service");
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
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteService = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce service ?")) return;
    try {
      await apiFetch(`/content/${id}`, { method: "DELETE", token });
      loadData();
    } catch (err) {
      alert(err.message);
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

  const sortedServices = [...services].sort((a, b) =>
    String(a.icon || "99").localeCompare(String(b.icon || "99"), undefined, { numeric: true }),
  );
  const hasMarketingService = services.some((s) => /marketing/i.test(s.title || ""));

  const seedDefaultServices = async () => {
    if (!window.confirm("Créer les 6 cartes Services professionnels (01 à 06, dont Marketing International) ?")) return;
    setSeedingServices(true);
    try {
      for (const svc of [...DEFAULT_HOME_SERVICES].reverse()) {
        await apiFetch("/content", { method: "POST", body: svc, token });
      }
      setSaveMessage("Les 6 services sont en base — visibles sur l'accueil après publication.");
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSeedingServices(false);
    }
  };

  const addMarketingService = async () => {
    const marketing = DEFAULT_HOME_SERVICES.find((s) => /marketing/i.test(s.title));
    if (!marketing) return;
    setSeedingServices(true);
    try {
      await apiFetch("/content", { method: "POST", body: marketing, token });
      setSaveMessage("Marketing International ajouté.");
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSeedingServices(false);
    }
  };

  const renderServiceCard = (srv, { preview = false, key }) => (
    <div
      key={key}
      onClick={preview ? undefined : () => openEditService(srv)}
      className={clsx(
        "card relative group overflow-hidden p-0",
        preview ? "border-dashed opacity-90" : "hover:border-primary/50 cursor-pointer",
      )}
    >
      <div className="relative">
        {srv.imageUrl ? (
          <img src={buildUrl(srv.imageUrl)} alt={srv.title} className="w-full h-40 object-cover object-center" />
        ) : (
          <div className="w-full h-40 flex flex-col items-center justify-center bg-surface-container-low text-primary gap-1">
            <span className="text-3xl font-black">{srv.icon || "—"}</span>
            {!srv.imageUrl && <span className="text-label-sm text-on-surface-variant">Pas d&apos;image</span>}
          </div>
        )}
        <span
          className={clsx(
            "badge absolute top-2 left-2",
            preview ? "badge-warning" : srv.published ? "badge-success" : "badge-warning",
          )}
        >
          {preview ? "Aperçu vitrine" : srv.published ? "Publié" : "Brouillon"}
        </span>
      </div>
      <div className="p-md pt-sm">
        <p className="text-label-sm text-primary font-bold text-center mb-0.5">{srv.icon ? `Carte ${srv.icon}` : ""}</p>
        <h3 className="font-bold text-on-surface text-center mb-xs">{srv.title}</h3>
        <p className="text-body-sm text-on-surface-variant line-clamp-2 text-center">{srv.description}</p>
        {srv.actionText && (
          <p className="text-label-sm text-primary text-center mt-2 font-semibold">{srv.actionText}</p>
        )}
      </div>
      {!preview && srv.id && (
        <div className="absolute top-2 right-2 flex gap-xs opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => handleTogglePublish(srv.id, srv.published, e)}
            className="p-xs bg-surface shadow-sm rounded text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">{srv.published ? "visibility_off" : "visibility"}</span>
          </button>
          <button type="button" onClick={(e) => handleDeleteService(srv.id, e)} className="p-xs bg-surface shadow-sm rounded text-error">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );

  const sectionLabel = (key) => SITE_SECTION_META[key]?.label || key;

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface font-bold">Contenu du site</h1>
          <p className="text-body-md text-on-surface-variant mt-sm">
            Consultez le contenu affiché sur la vitrine, puis cliquez sur <strong>Modifier</strong> pour l&apos;éditer.
          </p>
        </div>
        <a
          href={vitrineBase || "https://taoman-main.vercel.app/"}
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
          <button type="button" onClick={loadData} className="btn-secondary mt-sm text-label-sm">Réessayer</button>
        </div>
      )}

      <div className="rounded-xl border border-primary/25 bg-primary-container/10 p-md text-body-sm text-on-surface">
        <p className="font-bold text-primary mb-sm">Où modifier les blocs de la page d&apos;accueil</p>
        <ul className="space-y-1 text-on-surface-variant list-disc pl-5">
          <li><strong>Notre impact</strong> (chiffres 30+, 8 secteurs…) → section <strong>Notre impact</strong> dans le groupe Accueil</li>
          <li><strong>Services professionnels</strong> (cartes 01–06) → bloc <strong>Services professionnels</strong> juste ci-dessous</li>
          <li><strong>Réalisations terrain</strong> (carrousel accueil) → section <strong>Réalisations terrain</strong> (séparé des secteurs)</li>
          <li><strong>Nos projets</strong> (menu) = page <strong>Secteurs</strong> → mêmes images que la section <strong>Secteurs</strong></li>
          <li><strong>Vitesse du carrousel</strong> → section <strong>Vitesse défilement médias</strong></li>
          <li><strong>Photos dirigeants</strong> → page <strong>À propos</strong> → Modifier → Équipe dirigeante</li>
        </ul>
      </div>

      {saveMessage && (
        <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-900/20 p-md text-green-800 dark:text-green-200 flex flex-wrap items-center gap-md">
          <span>{saveMessage}</span>
          {savePreviewUrl && (
            <a href={savePreviewUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Voir sur le site →
            </a>
          )}
        </div>
      )}

      <section id="services-pro" className="rounded-xl border-2 border-primary/30 bg-surface p-lg shadow-sm space-y-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💼</span>
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface">Services professionnels</h2>
              <p className="text-body-md text-on-surface-variant mt-sm">
                Grille 3×2 sur l&apos;accueil (cartes 01 à 06) et page Services — dont <strong>Marketing International</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-sm">
            {services.length === 0 && (
              <button
                type="button"
                onClick={seedDefaultServices}
                disabled={seedingServices || loading}
                className="btn-secondary gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">playlist_add</span>
                Créer les 6 services
              </button>
            )}
            {services.length > 0 && !hasMarketingService && (
              <button
                type="button"
                onClick={addMarketingService}
                disabled={seedingServices || loading}
                className="btn-secondary gap-xs"
              >
                + Marketing International
              </button>
            )}
            <button type="button" onClick={openNewService} className="btn-primary gap-xs">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nouveau service
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-on-surface-variant">Chargement des services…</p>
        ) : services.length === 0 ? (
          <>
            <p className="text-body-sm text-on-surface-variant rounded-lg bg-amber-500/10 border border-amber-500/30 p-sm">
              Aucun service en base : la vitrine affiche les <strong>6 cartes par défaut</strong> ci-dessous. Cliquez
              &laquo;&nbsp;Créer les 6 services&nbsp;&raquo; pour les gérer depuis le dash (images, textes, publication).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {DEFAULT_HOME_SERVICES.map((srv) => renderServiceCard(srv, { preview: true, key: srv.icon }))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {sortedServices.map((srv) => renderServiceCard(srv, { key: srv.id }))}
          </div>
        )}
      </section>

      {loading ? (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">Chargement du contenu…</div>
      ) : (
        VITRINE_PAGE_GROUPS.map((group) => (
          <section key={group.id} className="space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-sm border-b border-outline-variant pb-sm">
              <div>
                <h2 className="text-headline-lg font-bold text-on-surface">{group.label}</h2>
                <p className="text-label-sm text-on-surface-variant">Page vitrine : {group.path}</p>
              </div>
              {vitrineBase && (
                <a
                  href={`${vitrineBase}${group.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-label-sm gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Ouvrir {group.path}
                </a>
              )}
            </div>

            <div className="space-y-lg">
              {group.sections.map((sectionKey) => {
                const meta = SITE_SECTION_META[sectionKey] || {};
                const effective = getEffectiveSectionContent(sectionKey, texts);
                const savedInDb = hasSectionRecord(texts, sectionKey);
                return (
                  <article
                    key={sectionKey}
                    className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-md mb-md">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meta.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-on-surface text-headline-sm">{meta.label}</h3>
                          <p className="text-body-sm text-on-surface-variant">{meta.description}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => openSectionEditor(sectionKey)} className="btn-primary gap-xs shrink-0">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Modifier
                      </button>
                    </div>
                    <SectionReadOnly sectionKey={sectionKey} content={effective} savedInDb={savedInDb} />
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {modalOpen && modalType === "section" && selectedSection && (
        <Modal open onClose={() => setModalOpen(false)} title={`Modifier — ${sectionLabel(selectedSection)}`}>
          <form onSubmit={handleTextSubmit} className="space-y-md pb-lg">
            <p className="text-body-sm text-on-surface-variant rounded-lg bg-surface-container-low p-sm">
              Les champs ci-dessous reprennent le contenu actuellement affiché sur le site. Modifiez puis enregistrez.
            </p>
            <SectionEditorFields
              sectionKey={selectedSection}
              content={textForm.content}
              updateContentField={updateContentField}
              updateListItem={updateListItem}
              addListItem={addListItem}
              removeListItem={removeListItem}
              updateNestedList={updateNestedList}
              addNestedList={addNestedList}
              removeNestedList={removeNestedList}
              setContent={setContent}
            />
            <div className="flex flex-wrap justify-between gap-sm pt-md border-t border-outline-variant">
              {hasSectionRecord(texts, textForm.section) && (
                <button type="button" onClick={handleDeleteSection} className="btn-secondary text-error">
                  Supprimer en base
                </button>
              )}
              <div className="flex gap-sm ml-auto">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary gap-xs">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {modalOpen && modalType === "service" && (
        <Modal open onClose={() => setModalOpen(false)} title={editingItem ? "Modifier le service" : "Nouveau service"}>
          <form onSubmit={handleServiceSubmit} className="space-y-md pb-lg">
            {serviceForm.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-outline-variant">
                <img src={buildUrl(serviceForm.imageUrl)} alt={serviceForm.title} className="w-full h-48 object-cover object-center" />
                <p className="text-center font-bold py-2 bg-surface-container-low">{serviceForm.title || "Sans titre"}</p>
              </div>
            )}
            <input required className="input-field" placeholder="Titre *" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
            <input className="input-field" placeholder="Icône Material" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} />
            <textarea required className="input-field resize-none" rows={4} placeholder="Description *" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            <MediaPicker label="Image du service" value={serviceForm.imageUrl} onChange={(url) => setServiceForm({ ...serviceForm, imageUrl: url })} />
            <p className="text-label-sm text-on-surface-variant -mt-2">
              Conseil qualité image : format paysage, minimum 1200x800 px, poids optimisé (&lt; 1.5 Mo).
            </p>
            <input className="input-field" placeholder="Texte bouton" value={serviceForm.actionText} onChange={(e) => setServiceForm({ ...serviceForm, actionText: e.target.value })} />
            <input className="input-field" placeholder="Lien" value={serviceForm.actionLink} onChange={(e) => setServiceForm({ ...serviceForm, actionLink: e.target.value })} />
            <label className="flex items-center gap-sm">
              <input type="checkbox" checked={serviceForm.published} onChange={(e) => setServiceForm({ ...serviceForm, published: e.target.checked })} />
              Publier sur le site
            </label>
            <div className="flex justify-end gap-sm pt-md border-t">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
