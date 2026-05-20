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
} from "../utils/sectionContent";

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
                    className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm"
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

      <div className="mt-xl pt-xl border-t border-outline-variant">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-md">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Cartes de services</h2>
            <p className="text-body-md text-on-surface-variant mt-sm">Affichées sur l&apos;accueil et la page Services</p>
          </div>
          <button type="button" onClick={openNewService} className="btn-primary gap-xs w-fit">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouveau service
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-on-surface-variant py-lg text-center border border-dashed rounded-xl">Aucun service — les cartes par défaut s&apos;affichent sur la vitrine.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => openEditService(srv)}
                className="card hover:border-primary/50 cursor-pointer relative group"
              >
                <div className="flex justify-between items-start mb-sm">
                  {srv.imageUrl ? (
                    <img src={buildUrl(srv.imageUrl)} alt={srv.title} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-primary bg-primary-container/20 p-sm rounded-lg">
                      {srv.icon || "category"}
                    </span>
                  )}
                  <span className={clsx("badge", srv.published ? "badge-success" : "badge-warning")}>
                    {srv.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <h3 className="font-semibold text-on-surface mb-xs">{srv.title}</h3>
                <p className="text-body-sm text-on-surface-variant line-clamp-3">{srv.description}</p>
                <div className="absolute top-2 right-2 flex gap-xs opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={(e) => handleTogglePublish(srv.id, srv.published, e)} className="p-xs bg-surface shadow-sm rounded text-primary">
                    <span className="material-symbols-outlined text-[18px]">{srv.published ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button type="button" onClick={(e) => handleDeleteService(srv.id, e)} className="p-xs bg-surface shadow-sm rounded text-error">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <input required className="input-field" placeholder="Titre *" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
            <input className="input-field" placeholder="Icône Material" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} />
            <textarea required className="input-field resize-none" rows={4} placeholder="Description *" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            <MediaPicker label="Image du service" value={serviceForm.imageUrl} onChange={(url) => setServiceForm({ ...serviceForm, imageUrl: url })} />
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
