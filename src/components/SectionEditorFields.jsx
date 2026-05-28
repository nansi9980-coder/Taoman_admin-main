import MediaPicker from "./MediaPicker";

function ensureItems(content, fallback = [{}]) {
  if (Array.isArray(content?.items) && content.items.length > 0) return content;
  return { ...content, items: fallback };
}

export default function SectionEditorFields({
  sectionKey,
  content,
  updateContentField,
  updateListItem,
  addListItem,
  removeListItem,
  updateNestedList,
  addNestedList,
  removeNestedList,
  setContent,
}) {
  if (sectionKey === "hero") {
    return (
      <div className="space-y-md">
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs">Badge principal</label>
          <input required value={content.badgeMain || ""} onChange={(e) => updateContentField({ badgeMain: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs">Badges (virgules)</label>
          <input
            value={(content.badges || []).join(", ")}
            onChange={(e) =>
              updateContentField({
                badges: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Titre ligne 1</label>
            <input required value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Titre ligne 2</label>
            <input value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs">Description</label>
          <textarea value={content.description || ""} onChange={(e) => updateContentField({ description: e.target.value })} rows={4} className="input-field resize-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <input className="input-field" placeholder="Bouton 1" value={content.btn1 || ""} onChange={(e) => updateContentField({ btn1: e.target.value })} />
          <input className="input-field" placeholder="Bouton 2" value={content.btn2 || ""} onChange={(e) => updateContentField({ btn2: e.target.value })} />
        </div>
        <input className="input-field" placeholder="Légende image" value={content.imageCaption || ""} onChange={(e) => updateContentField({ imageCaption: e.target.value })} />
        <MediaPicker label="Image hero" value={content.heroImage || ""} onChange={(url) => updateContentField({ heroImage: url, backgroundImage: url })} />
      </div>
    );
  }

  if (sectionKey === "about") {
    const highlights = content.heroHighlights || [];
    return (
      <div className="space-y-md max-h-[70vh] overflow-y-auto pr-sm">
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs">Titre hero</label>
          <input required value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} className="input-field" />
        </div>
        <textarea required value={content.description || ""} onChange={(e) => updateContentField({ description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Description" />
        <MediaPicker label="Image hero" value={content.imageUrl || ""} onChange={(url) => updateContentField({ imageUrl: url })} />
        <textarea value={content.mission || ""} onChange={(e) => updateContentField({ mission: e.target.value })} rows={2} className="input-field resize-none" placeholder="Mission" />
        <textarea value={content.vision || ""} onChange={(e) => updateContentField({ vision: e.target.value })} rows={2} className="input-field resize-none" placeholder="Vision" />
        <div>
          <label className="block text-label-md font-semibold mb-xs">Encadrés hero (liste)</label>
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-sm mb-xs">
              <input className="input-field flex-1" value={h} onChange={(e) => updateNestedList("heroHighlights", i, null, e.target.value)} />
              {highlights.length > 1 && (
                <button type="button" className="text-error text-label-sm" onClick={() => removeNestedList("heroHighlights", i)}>×</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("heroHighlights", "")}>+ Encadré</button>
        </div>
        <input className="input-field" value={content.valuesTitle || ""} onChange={(e) => updateContentField({ valuesTitle: e.target.value })} placeholder="Titre section valeurs" />
        {(content.values || []).map((v, i) => (
          <div key={i} className="p-md border border-outline-variant rounded-lg space-y-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-label-md">Valeur {i + 1}</span>
              {(content.values?.length || 0) > 1 && (
                <button type="button" className="text-error text-label-sm" onClick={() => removeNestedList("values", i)}>Supprimer</button>
              )}
            </div>
            <input className="input-field" placeholder="Icône (01)" value={v.icon || ""} onChange={(e) => updateNestedList("values", i, "icon", e.target.value)} />
            <input className="input-field" placeholder="Titre" value={v.title || ""} onChange={(e) => updateNestedList("values", i, "title", e.target.value)} />
            <textarea className="input-field resize-none" rows={2} placeholder="Description" value={v.description || ""} onChange={(e) => updateNestedList("values", i, "description", e.target.value)} />
          </div>
        ))}
        <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("values", { icon: "", title: "", description: "" })}>+ Valeur</button>
        <input className="input-field" value={content.timelineTitle || ""} onChange={(e) => updateContentField({ timelineTitle: e.target.value })} placeholder="Titre parcours" />
        {(content.timeline || []).map((t, i) => (
          <div key={i} className="p-md border border-outline-variant rounded-lg grid grid-cols-2 gap-sm">
            <input className="input-field" placeholder="Année" value={t.year || ""} onChange={(e) => updateNestedList("timeline", i, "year", e.target.value)} />
            <input className="input-field" placeholder="Événement" value={t.event || ""} onChange={(e) => updateNestedList("timeline", i, "event", e.target.value)} />
            {(content.timeline?.length || 0) > 1 && (
              <button type="button" className="col-span-2 text-error text-label-sm text-left" onClick={() => removeNestedList("timeline", i)}>Supprimer</button>
            )}
          </div>
        ))}
        <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("timeline", { year: "", event: "" })}>+ Étape parcours</button>
        <input className="input-field" value={content.leadersTitle || ""} onChange={(e) => updateContentField({ leadersTitle: e.target.value })} placeholder="Titre équipe dirigeante" />
        {(content.leaders || []).map((l, i) => (
          <div key={i} className="p-md border border-primary/30 rounded-lg space-y-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-label-md">Dirigeant {i + 1}</span>
              {(content.leaders?.length || 0) > 1 && (
                <button type="button" className="text-error text-label-sm" onClick={() => removeNestedList("leaders", i)}>Supprimer</button>
              )}
            </div>
            <input className="input-field" placeholder="Nom" value={l.name || ""} onChange={(e) => updateNestedList("leaders", i, "name", e.target.value)} />
            <input className="input-field" placeholder="Rôle" value={l.role || ""} onChange={(e) => updateNestedList("leaders", i, "role", e.target.value)} />
            <textarea className="input-field resize-none" rows={2} placeholder="Bio" value={l.bio || ""} onChange={(e) => updateNestedList("leaders", i, "bio", e.target.value)} />
            <MediaPicker label="Photo dirigeant" value={l.photoUrl || ""} onChange={(url) => updateNestedList("leaders", i, "photoUrl", url)} />
          </div>
        ))}
        <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("leaders", { name: "", role: "", bio: "", photoUrl: "" })}>+ Dirigeant</button>
        {(content.stats || []).map((s, i) => (
          <div key={i} className="grid grid-cols-2 gap-sm p-sm border border-outline-variant rounded-lg">
            <input className="input-field" placeholder="Chiffre" value={s.number || ""} onChange={(e) => updateNestedList("stats", i, "number", e.target.value)} />
            <input className="input-field" placeholder="Label" value={s.label || ""} onChange={(e) => updateNestedList("stats", i, "label", e.target.value)} />
          </div>
        ))}
        <div className="p-md border border-dashed border-outline-variant rounded-lg space-y-sm">
          <p className="font-semibold text-label-md">CTA bas de page</p>
          <input className="input-field" placeholder="Titre CTA" value={content.cta?.title || ""} onChange={(e) => updateContentField({ cta: { ...content.cta, title: e.target.value } })} />
          <textarea className="input-field resize-none" rows={2} placeholder="Description" value={content.cta?.description || ""} onChange={(e) => updateContentField({ cta: { ...content.cta, description: e.target.value } })} />
          <input className="input-field" placeholder="Texte bouton" value={content.cta?.buttonText || ""} onChange={(e) => updateContentField({ cta: { ...content.cta, buttonText: e.target.value } })} />
        </div>
      </div>
    );
  }

  if (sectionKey === "statistics") {
    return (
      <div className="space-y-md">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="grid grid-cols-2 gap-md p-md border border-outline-variant rounded-lg">
            <input className="input-field" placeholder={`Valeur ${index + 1}`} value={content[`value${index}`] || ""} onChange={(e) => setContent({ ...content, [`value${index}`]: e.target.value })} />
            <input className="input-field" placeholder={`Label ${index + 1}`} value={content[`label${index}`] || ""} onChange={(e) => setContent({ ...content, [`label${index}`]: e.target.value })} />
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === "mediaSettings") {
    return (
      <div className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant">Intervalle autoplay (ms)</label>
            <input
              type="number"
              min={1000}
              step={100}
              className="input-field"
              value={content.autoplayInterval ?? 4500}
              onChange={(e) => updateContentField({ autoplayInterval: Number(e.target.value || 4500) })}
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant">Durée transition (ms)</label>
            <input
              type="number"
              min={100}
              step={50}
              className="input-field"
              value={content.transitionMs ?? 800}
              onChange={(e) => updateContentField({ transitionMs: Number(e.target.value || 800) })}
            />
          </div>
        </div>
        <label className="flex items-center gap-sm">
          <input type="checkbox" checked={content.autoplayEnabled ?? true} onChange={(e) => updateContentField({ autoplayEnabled: e.target.checked })} />
          Activer le défilement automatique
        </label>
        <label className="flex items-center gap-sm">
          <input type="checkbox" checked={content.pauseOnHover ?? true} onChange={(e) => updateContentField({ pauseOnHover: e.target.checked })} />
          Pause au survol
        </label>
      </div>
    );
  }

  if (["legal", "privacy", "terms"].includes(sectionKey)) {
    const blocks = content.blocks?.length ? content.blocks : [{ title: "", body: "", listItems: [] }];
    return (
      <div className="space-y-md max-h-[70vh] overflow-y-auto pr-sm">
        <input className="input-field" placeholder="Titre page" value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} />
        <input className="input-field" placeholder="Sous-titre" value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} />
        {sectionKey === "terms" && (
          <input className="input-field" placeholder="Note pied de page" value={content.footerNote || ""} onChange={(e) => updateContentField({ footerNote: e.target.value })} />
        )}
        {blocks.map((block, index) => (
          <div key={index} className="p-md border border-outline-variant rounded-lg space-y-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-label-md">Bloc {index + 1}</span>
              {blocks.length > 1 && (
                <button type="button" className="text-error text-label-sm" onClick={() => removeNestedList("blocks", index)}>Supprimer</button>
              )}
            </div>
            <input className="input-field" placeholder="Titre du bloc" value={block.title || ""} onChange={(e) => updateNestedList("blocks", index, "title", e.target.value)} />
            <textarea className="input-field resize-none" rows={4} placeholder="Texte" value={block.body || ""} onChange={(e) => updateNestedList("blocks", index, "body", e.target.value)} />
            <textarea
              className="input-field resize-none text-label-sm"
              rows={3}
              placeholder="Liste à puces (une ligne par élément)"
              value={(block.listItems || []).join("\n")}
              onChange={(e) =>
                updateNestedList(
                  "blocks",
                  index,
                  "listItems",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
            <input className="input-field text-label-sm" placeholder="Texte complément (optionnel)" value={block.footer || ""} onChange={(e) => updateNestedList("blocks", index, "footer", e.target.value)} />
          </div>
        ))}
        <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("blocks", { title: "", body: "", listItems: [] })}>+ Ajouter un bloc</button>
      </div>
    );
  }

  if (sectionKey === "jobs") {
    return (
      <div className="space-y-md">
        <input className="input-field" value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} placeholder="Titre hero" />
        <textarea className="input-field resize-none" rows={3} value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} placeholder="Sous-titre" />
        <input className="input-field" value={content.filterTitle || ""} onChange={(e) => updateContentField({ filterTitle: e.target.value })} placeholder="Titre zone filtres" />
        <textarea className="input-field resize-none" rows={2} value={content.emptyMessage || ""} onChange={(e) => updateContentField({ emptyMessage: e.target.value })} placeholder="Message si aucune offre" />
        <p className="text-label-md font-semibold">Catégories de filtres</p>
        {(content.categories || []).map((cat, i) => (
          <div key={i} className="grid grid-cols-2 gap-sm p-sm border rounded-lg">
            <input className="input-field" placeholder="value (ex: btp)" value={cat.value || ""} onChange={(e) => updateNestedList("categories", i, "value", e.target.value)} />
            <input className="input-field" placeholder="Label" value={cat.label || ""} onChange={(e) => updateNestedList("categories", i, "label", e.target.value)} />
          </div>
        ))}
        <button type="button" className="btn-secondary text-label-sm" onClick={() => addNestedList("categories", { value: "", label: "" })}>+ Catégorie</button>
      </div>
    );
  }

  if (["devisLavage", "devisDemenagement", "devisBureaux", "devisClimatisation"].includes(sectionKey)) {
    return (
      <div className="space-y-md">
        <input required className="input-field" value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} placeholder="Titre hero" />
        <textarea className="input-field resize-none" rows={3} value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} placeholder="Sous-titre" />
      </div>
    );
  }

  if (["investment", "investmentTie", "servicesPage"].includes(sectionKey)) {
    return (
      <div className="space-y-md">
        <input className="input-field" placeholder="Badge" value={content.badge || ""} onChange={(e) => updateContentField({ badge: e.target.value })} />
        <input required className="input-field" placeholder="Titre" value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} />
        {sectionKey === "investmentTie" && (
          <input className="input-field" placeholder="Sous-titre" value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} />
        )}
        <textarea className="input-field resize-none" rows={4} value={content.description || ""} onChange={(e) => updateContentField({ description: e.target.value })} />
        {sectionKey === "servicesPage" && (
          <>
            <input className="input-field" placeholder="Bouton 1" value={content.btn1 || ""} onChange={(e) => updateContentField({ btn1: e.target.value })} />
            <input className="input-field" placeholder="Bouton 2" value={content.btn2 || ""} onChange={(e) => updateContentField({ btn2: e.target.value })} />
          </>
        )}
        {(content.stats || []).map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-sm p-sm border rounded-lg">
            <input className="input-field" placeholder="Valeur" value={s.value || ""} onChange={(e) => updateNestedList("stats", i, "value", e.target.value)} />
            <input className="input-field" placeholder="Label" value={s.label || ""} onChange={(e) => updateNestedList("stats", i, "label", e.target.value)} />
            <input className="input-field" placeholder="Icon" value={s.icon || ""} onChange={(e) => updateNestedList("stats", i, "icon", e.target.value)} />
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === "cta") {
    return (
      <div className="space-y-md">
        <input required className="input-field" value={content.title || ""} onChange={(e) => updateContentField({ title: e.target.value })} placeholder="Titre" />
        <textarea className="input-field resize-none" rows={3} value={content.subtitle || ""} onChange={(e) => updateContentField({ subtitle: e.target.value })} />
        <input className="input-field" value={content.buttonText || ""} onChange={(e) => updateContentField({ buttonText: e.target.value })} />
        <MediaPicker label="Image fond" value={content.imageUrl || content.backgroundImage || ""} onChange={(url) => updateContentField({ imageUrl: url, backgroundImage: url })} />
      </div>
    );
  }

  if (sectionKey === "footer") {
    return (
      <textarea required className="input-field resize-none" rows={4} value={content.description || ""} onChange={(e) => updateContentField({ description: e.target.value })} />
    );
  }

  if (sectionKey === "contact") {
    return (
      <div className="space-y-md">
        <input className="input-field" value={content.phone || ""} onChange={(e) => updateContentField({ phone: e.target.value })} placeholder="Téléphone" />
        <input className="input-field" value={content.email || ""} onChange={(e) => updateContentField({ email: e.target.value })} placeholder="Email" />
        <input className="input-field" value={content.address || ""} onChange={(e) => updateContentField({ address: e.target.value })} placeholder="Adresse" />
        <input className="input-field" value={content.hours || ""} onChange={(e) => updateContentField({ hours: e.target.value })} placeholder="Horaires" />
      </div>
    );
  }

  if (sectionKey === "seo") {
    return (
      <div className="space-y-md">
        <input className="input-field" value={content.metaTitle || ""} onChange={(e) => updateContentField({ metaTitle: e.target.value })} placeholder="Meta titre" />
        <textarea className="input-field resize-none" rows={3} value={content.metaDescription || ""} onChange={(e) => updateContentField({ metaDescription: e.target.value })} />
      </div>
    );
  }

  if (["testimonials", "sectors", "faq", "realisations"].includes(sectionKey)) {
    const empty =
      sectionKey === "faq"
        ? { question: "", answer: "" }
        : sectionKey === "testimonials"
          ? { name: "", role: "", comment: "" }
          : sectionKey === "realisations"
            ? { title: "", category: "", progress: 70, imageUrl: "" }
            : { title: "", description: "", imageUrl: "" };
    return (
      <div className="space-y-md">
        {sectionKey === "realisations" && (
          <textarea
            className="input-field resize-none"
            rows={3}
            value={content.footerText || ""}
            onChange={(e) => updateContentField({ footerText: e.target.value })}
            placeholder="Texte professionnel affiché sous la section Réalisations terrain"
          />
        )}
        {(ensureItems(content, [empty]).items || []).map((item, index) => (
          <div key={index} className="p-md border border-outline-variant rounded-lg space-y-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-label-md">Élément {index + 1}</span>
              {(content.items?.length || 0) > 1 && (
                <button type="button" onClick={() => removeListItem(index)} className="text-error text-label-sm">Supprimer</button>
              )}
            </div>
            {sectionKey === "faq" ? (
              <>
                <input className="input-field" value={item.question || ""} onChange={(e) => updateListItem(index, "question", e.target.value)} />
                <textarea className="input-field resize-none" rows={3} value={item.answer || ""} onChange={(e) => updateListItem(index, "answer", e.target.value)} />
              </>
            ) : sectionKey === "testimonials" ? (
              <>
                <input className="input-field" value={item.name || ""} onChange={(e) => updateListItem(index, "name", e.target.value)} />
                <input className="input-field" value={item.role || ""} onChange={(e) => updateListItem(index, "role", e.target.value)} />
                <textarea className="input-field resize-none" rows={3} value={item.comment || ""} onChange={(e) => updateListItem(index, "comment", e.target.value)} />
              </>
            ) : sectionKey === "realisations" ? (
              <>
                <input className="input-field" placeholder="Titre de l'image" value={item.title || ""} onChange={(e) => updateListItem(index, "title", e.target.value)} />
                <input className="input-field" placeholder="Catégorie" value={item.category || ""} onChange={(e) => updateListItem(index, "category", e.target.value)} />
                <input className="input-field" type="number" min={0} max={100} placeholder="Progression %" value={item.progress ?? 70} onChange={(e) => updateListItem(index, "progress", Number(e.target.value || 70))} />
                <MediaPicker label="Image réalisation" value={item.imageUrl || ""} onChange={(url) => updateListItem(index, "imageUrl", url)} />
              </>
            ) : (
              <>
                <input className="input-field" value={item.title || ""} onChange={(e) => updateListItem(index, "title", e.target.value)} />
                <textarea className="input-field resize-none" rows={2} value={item.description || ""} onChange={(e) => updateListItem(index, "description", e.target.value)} />
                <MediaPicker label="Image" value={item.imageUrl || ""} onChange={(url) => updateListItem(index, "imageUrl", url)} />
                {sectionKey === "sectors" && (
                  <p className="text-label-sm text-on-surface-variant">
                    Recommandé : image nette 1400x1000 px minimum, ratio paysage.
                  </p>
                )}
              </>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addListItem(empty)} className="btn-secondary text-label-sm">+ Ajouter</button>
      </div>
    );
  }

  return <p className="text-on-surface-variant">Éditeur non disponible pour cette section.</p>;
}
