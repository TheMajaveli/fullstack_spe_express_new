import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('cinenoir-lang') : null;

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: savedLang || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    try {
      localStorage.setItem('cinenoir-lang', lng);
    } catch {}
  }
});

export default i18n;
