import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { apiFetch, API_BASE } from "../utils/api";
import { parseSectionContent, findSectionRecord } from "../utils/sectionContent";

const emptySiteContact = { phone: "", email: "", address: "", hours: "" };

export default function Contact() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [siteContact, setSiteContact] = useState(emptySiteContact);
  const [siteContactOpen, setSiteContactOpen] = useState(true);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteSaveMsg, setSiteSaveMsg] = useState("");

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch("/contacts", { token });
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const loadSiteContact = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch("/content/admin", { token });
      const texts = Array.isArray(data?.texts) ? data.texts : [];
      const record = findSectionRecord(texts, "contact");
      if (record) {
        setSiteContact({ ...emptySiteContact, ...parseSectionContent(record.content) });
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadSiteContact();
  }, [loadSiteContact]);

  const saveSiteContact = async (e) => {
    e.preventDefault();
    setSiteSaving(true);
    setSiteSaveMsg("");
    try {
      await apiFetch("/content/texts", {
        method: "POST",
        body: { section: "contact", content: siteContact },
        token,
      });
      setSiteSaveMsg("Coordonnées enregistrées — visibles sur la page Contact du site.");
      setTimeout(() => setSiteSaveMsg(""), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSiteSaving(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE, { transports: ["websocket"], auth: { token } });
    socket.on("newContact", (contact) => {
      if (!contact?.id) {
        fetchContacts();
        return;
      }
      setContacts((prev) => {
        if (prev.some((c) => c.id === contact.id)) return prev;
        return [contact, ...prev];
      });
    });
    return () => socket.disconnect();
  }, [token, fetchContacts]);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkTreated = async (id) => {
    try {
      await apiFetch(`/contacts/${id}`, {
        method: "PUT",
        token,
        body: { status: "traité" },
      });
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "traité" } : c)));
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm("Supprimer cette demande de contact ?")) return;
    try {
      await apiFetch(`/contacts/${id}`, { method: "DELETE", token });
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) {
      alert("Erreur suppression: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-lg min-h-0">
      {/* Coordonnées site vitrine */}
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setSiteContactOpen((o) => !o)}
          className="w-full flex items-center justify-between p-md text-left hover:bg-surface-container-low"
        >
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Coordonnées affichées sur le site</h2>
            <p className="text-body-sm text-on-surface-variant mt-xs">
              Téléphone, email, adresse et horaires (page Contact + footer vitrine)
            </p>
          </div>
          <span className="material-symbols-outlined text-outline">
            {siteContactOpen ? "expand_less" : "expand_more"}
          </span>
        </button>
        {siteContactOpen && (
          <form onSubmit={saveSiteContact} className="p-md pt-0 border-t border-outline-variant space-y-md">
            {siteSaveMsg && (
              <p className="text-label-sm text-secondary font-medium">{siteSaveMsg}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-xs">Téléphone</label>
                <input
                  className="input-field"
                  value={siteContact.phone}
                  onChange={(e) => setSiteContact((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+228 90 42 13 77"
                />
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-xs">Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={siteContact.email}
                  onChange={(e) => setSiteContact((s) => ({ ...s, email: e.target.value }))}
                  placeholder="contact@taoman.com"
                />
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-xs">Adresse</label>
                <input
                  className="input-field"
                  value={siteContact.address}
                  onChange={(e) => setSiteContact((s) => ({ ...s, address: e.target.value }))}
                  placeholder="Lomé, Togo"
                />
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-xs">Horaires</label>
                <input
                  className="input-field"
                  value={siteContact.hours}
                  onChange={(e) => setSiteContact((s) => ({ ...s, hours: e.target.value }))}
                  placeholder="Lun - Dim : 08h00 - 20h00"
                />
              </div>
            </div>
            <button type="submit" disabled={siteSaving} className="btn-primary gap-xs w-fit">
              <span className="material-symbols-outlined text-[18px]">save</span>
              {siteSaving ? "Enregistrement…" : "Enregistrer les coordonnées"}
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-lg min-h-[480px] lg:min-h-[calc(100vh-320px)]">
      {/* Contacts Sidebar */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden max-h-[70vh] lg:max-h-none">
        {/* Header */}
        <div className="p-md border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-sm">
            Messages reçus (formulaire)
          </h2>
          <input
            type="text"
            placeholder="Chercher un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={clsx(
              "w-full px-md py-sm rounded-lg border border-outline-variant",
              "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "focus:outline-none focus:border-primary"
            )}
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-md text-center text-outline">Chargement...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-md text-center text-outline">
              {searchQuery ? "Aucun contact trouvé" : "Aucune demande de contact"}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={clsx(
                  "w-full p-md border-b border-outline-variant text-left transition-colors duration-150",
                  selectedContact?.id === contact.id
                    ? "bg-primary-fixed dark:bg-[#0040a2]"
                    : "hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                )}
              >
                <div className="flex items-center justify-between mb-xs">
                  <h3 className={clsx(
                    "font-semibold text-body-sm truncate",
                    selectedContact?.id === contact.id
                      ? "text-primary dark:text-[#b2c5ff]"
                      : "text-on-surface dark:text-[#e4e4ef]"
                  )}>
                    {contact.name}
                  </h3>
                  <span className="text-label-sm text-outline">
                    {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className={clsx(
                  "text-label-sm truncate mb-xs",
                  selectedContact?.id === contact.id
                    ? "text-primary dark:text-[#b2c5ff]"
                    : "text-outline"
                )}>
                  {contact.subject}
                </p>
                <p className={clsx(
                  "text-label-sm truncate",
                  selectedContact?.id === contact.id
                    ? "text-primary dark:text-[#b2c5ff]"
                    : "text-outline"
                )}>
                  {contact.email}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contact Detail */}
      <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        {selectedContact ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">
                  {selectedContact.name}
                </h2>
                <p className="text-body-sm text-outline">{selectedContact.email}</p>
                <p className="text-label-sm text-outline">
                  Reçu le {new Date(selectedContact.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-sm">
                {selectedContact.status !== "traité" && (
                  <button onClick={() => handleMarkTreated(selectedContact.id)} className="btn-secondary gap-xs">
                    Marquer traité
                  </button>
                )}
                <button
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="btn-danger gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Supprimer
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-lg overflow-y-auto">
              <div className="space-y-lg">
                {/* Subject */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                    Sujet: {selectedContact.subject}
                  </h3>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-label-sm text-outline mb-xs">Téléphone</p>
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef]">
                      {selectedContact.phone || "Non fourni"}
                    </p>
                  </div>
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-label-sm text-outline mb-xs">Email</p>
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef]">
                      {selectedContact.email}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                    Message
                  </h3>
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm pt-md border-t border-outline-variant">
                  <button className="btn-primary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">email</span>
                    Répondre par email
                  </button>
                  <button className="btn-secondary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                    Appeler
                  </button>
                  <button className="btn-secondary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Créer client
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-outline mb-md">contact_mail</span>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                Sélectionnez une demande de contact
              </h3>
              <p className="text-body-sm text-outline">
                Cliquez sur une demande dans la liste pour voir les détails
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}