import { buildUrl } from "../utils/api";

function Img({ url, alt, className = "w-20 h-20 rounded-lg object-cover" }) {
  if (!url) return null;
  const src = url.startsWith("http") ? url : buildUrl(url);
  return <img src={src} alt={alt || ""} className={className} />;
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <p className="text-body-sm text-on-surface">
      <span className="font-semibold text-on-surface-variant">{label}: </span>
      {value}
    </p>
  );
}

export default function SectionReadOnly({ sectionKey, content, savedInDb }) {
  const sourceBadge = savedInDb ? (
    <span className="badge badge-success text-label-sm">Enregistré en base</span>
  ) : (
    <span className="badge badge-warning text-label-sm">Affiché sur le site (défaut vitrine)</span>
  );

  const wrap = (children) => (
    <div className="space-y-sm text-body-sm">
      <div className="mb-sm">{sourceBadge}</div>
      {children}
    </div>
  );

  switch (sectionKey) {
    case "hero":
      return wrap(
        <>
          <Row label="Badge" value={content.badgeMain} />
          <p className="text-label-sm text-on-surface-variant">{(content.badges || []).join(" · ")}</p>
          <p className="text-headline-sm font-bold text-on-surface">
            {content.title} <span className="font-normal text-on-surface-variant">{content.subtitle}</span>
          </p>
          <p className="text-on-surface-variant whitespace-pre-wrap">{content.description}</p>
          <Row label="Bouton 1" value={content.btn1} />
          <Row label="Bouton 2" value={content.btn2} />
          <Row label="Légende image" value={content.imageCaption} />
          {content.heroImage && <Img url={content.heroImage} alt="Hero" className="max-h-32 rounded-lg object-cover" />}
        </>
      );

    case "statistics": {
      const items = Array.isArray(content.items) ? content.items : [];
      return wrap(
        <div className="grid grid-cols-2 gap-sm">
          {items.map((s, i) => (
            <div key={i} className="p-sm rounded-lg bg-surface-container-low border border-outline-variant/40">
              <p className="font-bold text-primary">{s.value}</p>
              <p className="text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>
      );
    }

    case "about":
      return wrap(
        <>
          <p className="text-headline-sm font-bold">{content.title}</p>
          <p className="text-on-surface-variant whitespace-pre-wrap">{content.description}</p>
          {content.imageUrl && <Img url={content.imageUrl} className="max-h-40 rounded-xl object-cover" />}
          <Row label="Mission" value={content.mission} />
          <Row label="Vision" value={content.vision} />
          {(content.heroHighlights || []).length > 0 && (
            <ul className="list-disc pl-5 text-on-surface-variant">
              {content.heroHighlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          <p className="font-semibold mt-sm">{content.valuesTitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {(content.values || []).map((v, i) => (
              <div key={i} className="p-sm border border-outline-variant/30 rounded-lg">
                <span className="text-primary font-bold">{v.icon}</span> <strong>{v.title}</strong>
                <p className="text-on-surface-variant text-label-sm">{v.description}</p>
              </div>
            ))}
          </div>
          <p className="font-semibold mt-sm">{content.timelineTitle}</p>
          {(content.timeline || []).map((t, i) => (
            <p key={i} className="text-on-surface-variant">
              <strong className="text-primary">{t.year}</strong> — {t.event}
            </p>
          ))}
          <p className="font-semibold mt-sm">{content.leadersTitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            {(content.leaders || []).map((l, i) => (
              <div key={i} className="text-center p-sm border border-outline-variant/30 rounded-xl">
                {l.photoUrl ? (
                  <Img url={l.photoUrl} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-sm" />
                ) : (
                  <div className="w-24 h-24 mx-auto mb-sm rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                    {(l.name || "?")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </div>
                )}
                <p className="font-bold">{l.name}</p>
                <p className="text-primary text-label-sm">{l.role}</p>
                <p className="text-on-surface-variant text-label-sm mt-xs">{l.bio}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm mt-sm">
            {(content.stats || []).map((s, i) => (
              <div key={i} className="text-center p-sm bg-primary-container/20 rounded-lg">
                <p className="font-bold text-primary">{s.number}</p>
                <p className="text-label-sm text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
          {content.cta && (
            <div className="mt-sm p-sm border border-dashed border-outline-variant rounded-lg">
              <p className="font-bold">{content.cta.title}</p>
              <p className="text-on-surface-variant">{content.cta.description}</p>
              <p className="text-label-sm text-primary">{content.cta.buttonText}</p>
            </div>
          )}
        </>
      );

    case "sectors":
    case "testimonials":
    case "realisations":
      return wrap(
        <div className="space-y-md">
          {sectionKey === "realisations" && content.footerText && (
            <p className="text-body-sm text-on-surface-variant italic border-l-4 border-primary pl-3">{content.footerText}</p>
          )}
          <div
            className={
              sectionKey === "sectors"
                ? "grid grid-cols-2 sm:grid-cols-3 gap-md"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md"
            }
          >
            {(content.items || []).map((item, i) => {
              const label = item.title || item.name || `Élément ${i + 1}`;
              const vitrineBase = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_CLIENT_URL || "").replace(/\/$/, "");
              const staticUrl =
                sectionKey === "realisations" && !item.imageUrl && item.staticPreview && vitrineBase
                  ? `${vitrineBase}${item.staticPreview}`
                  : "";
              const previewUrl = item.imageUrl || staticUrl;
              const hasImage = Boolean(previewUrl);
              return (
                <div key={item.slug || item.id || item.title || i} className="rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container-lowest">
                  {hasImage ? (
                    <Img url={previewUrl} className="w-full h-32 object-cover" alt={label} />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-surface-container-low text-on-surface-variant text-label-sm">
                      Pas d&apos;image
                    </div>
                  )}
                  <div className="p-sm text-center">
                    {sectionKey === "sectors" && (
                      <p className="text-label-sm text-primary font-bold mb-0.5">Secteur {String(i + 1).padStart(2, "0")}</p>
                    )}
                    {sectionKey === "realisations" && (
                      <p className="text-label-sm text-primary font-bold mb-0.5">Slide {String(i + 1).padStart(2, "0")}</p>
                    )}
                    <p className="font-bold text-on-surface text-sm leading-tight">{label}</p>
                    {item.category && <p className="text-label-sm text-primary mt-0.5">{item.category}</p>}
                    {item.role && <p className="text-label-sm text-primary mt-0.5">{item.role}</p>}
                    {sectionKey === "realisations" && item.progress !== undefined && (
                      <p className="text-label-sm text-on-surface-variant mt-1">{item.progress}%</p>
                    )}
                    {(item.description || item.comment) && (
                      <p className="text-label-sm text-on-surface-variant mt-1 line-clamp-2">{item.description || item.comment}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "mediaSettings":
      return wrap(
        <>
          <Row label="Intervalle autoplay" value={`${content.autoplayInterval ?? 4500} ms`} />
          <Row label="Durée transition" value={`${content.transitionMs ?? 800} ms`} />
          <Row label="Autoplay" value={(content.autoplayEnabled ?? true) ? "Activé" : "Désactivé"} />
          <Row label="Pause au survol" value={(content.pauseOnHover ?? true) ? "Activée" : "Désactivée"} />
        </>
      );

    case "faq":
      return wrap(
        <div className="space-y-sm">
          {(content.items || []).length === 0 ? (
            <p className="text-on-surface-variant italic">Aucune question en base — la page FAQ sera vide.</p>
          ) : (
            (content.items || []).map((q, i) => (
              <details key={i} className="p-sm border border-outline-variant/30 rounded-lg">
                <summary className="font-semibold cursor-pointer">{q.question}</summary>
                <p className="mt-sm text-on-surface-variant whitespace-pre-wrap">{q.answer}</p>
              </details>
            ))
          )}
        </div>
      );

    case "cta":
      return wrap(
        <>
          <p className="font-bold text-lg">{content.title}</p>
          <p className="text-on-surface-variant">{content.subtitle}</p>
          <p className="text-primary font-semibold">{content.buttonText}</p>
          {(content.imageUrl || content.backgroundImage) && (
            <Img url={content.imageUrl || content.backgroundImage} className="max-h-28 rounded-lg object-cover" />
          )}
        </>
      );

    case "footer":
      return wrap(<p className="whitespace-pre-wrap text-on-surface-variant">{content.description}</p>);

    case "contact":
      return wrap(
        <>
          <Row label="Téléphone" value={content.phone} />
          <Row label="Email" value={content.email} />
          <Row label="Adresse" value={content.address} />
          <Row label="Horaires" value={content.hours} />
        </>
      );

    case "seo":
      return wrap(
        <>
          <Row label="Meta titre" value={content.metaTitle} />
          <Row label="Meta description" value={content.metaDescription} />
        </>
      );

    case "investment":
    case "investmentTie":
    case "servicesPage":
      return wrap(
        <>
          <Row label="Badge" value={content.badge} />
          <p className="font-bold text-lg">{content.title}</p>
          {content.subtitle && <p className="text-primary font-semibold">{content.subtitle}</p>}
          <p className="text-on-surface-variant whitespace-pre-wrap">{content.description}</p>
          {(content.stats || []).map((s, i) => (
            <p key={i} className="text-label-sm">
              <strong>{s.value || s.label}</strong> — {s.label || s.value}
            </p>
          ))}
          {content.btn1 && (
            <p className="text-label-sm text-primary">
              {content.btn1} · {content.btn2}
            </p>
          )}
        </>
      );

    case "legal":
    case "privacy":
    case "terms":
      return wrap(
        <>
          <p className="font-bold text-lg">{content.title}</p>
          <p className="text-on-surface-variant">{content.subtitle}</p>
          {(content.blocks || []).map((b, i) => (
            <div key={i} className="mt-sm p-sm border border-outline-variant/30 rounded-lg">
              <p className="font-semibold">{b.title}</p>
              <p className="text-label-sm text-on-surface-variant line-clamp-4 whitespace-pre-wrap">{b.body}</p>
              {b.listItems?.length > 0 && (
                <ul className="text-label-sm list-disc pl-4 mt-xs">
                  {b.listItems.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {content.footerNote && <p className="text-label-sm italic">{content.footerNote}</p>}
        </>
      );

    case "jobs":
      return wrap(
        <>
          <p className="font-bold text-lg">{content.title}</p>
          <p className="text-on-surface-variant">{content.subtitle}</p>
          <Row label="Titre filtres" value={content.filterTitle} />
          <Row label="Message vide" value={content.emptyMessage} />
          <p className="text-label-sm">{(content.categories || []).map((c) => c.label).join(" · ")}</p>
        </>
      );

    case "devisLavage":
    case "devisDemenagement":
    case "devisBureaux":
    case "devisClimatisation":
      return wrap(
        <>
          <p className="font-bold text-lg">{content.title}</p>
          <p className="text-on-surface-variant">{content.subtitle}</p>
        </>
      );

    default:
      return wrap(<p className="text-on-surface-variant">Section non reconnue</p>);
  }
}
