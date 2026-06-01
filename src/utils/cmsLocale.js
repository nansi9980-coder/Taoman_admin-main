/**
 * CMS multilingue — même format que la vitrine (locales par langue).
 */
export const CMS_LOCALE_VERSION = 2;
export const CMS_EDIT_LANGUAGES = [
  { code: 'FR', label: 'Français' },
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'PT', label: 'Português' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'AR', label: 'العربية' },
  { code: 'ZH', label: '中文' },
];

export function isMultiLocaleContent(content) {
  return Boolean(content && typeof content === 'object' && content.locales && typeof content.locales === 'object');
}

export function unwrapLocales(content) {
  if (!content || typeof content !== 'object') return { FR: {} };
  if (isMultiLocaleContent(content)) return { ...content.locales };
  return { FR: content };
}

export function wrapLocalePayload(existingRaw, language, payload) {
  const locales = unwrapLocales(existingRaw);
  return {
    _v: CMS_LOCALE_VERSION,
    locales: {
      ...locales,
      [language]: payload,
    },
  };
}

export function getLocaleSlice(rawContent, language = 'FR') {
  const locales = unwrapLocales(rawContent);
  const slice = locales[language];
  if (slice && typeof slice === 'object' && Object.keys(slice).length > 0) return slice;
  if (language !== 'FR' && locales.FR) return locales.FR;
  return {};
}
