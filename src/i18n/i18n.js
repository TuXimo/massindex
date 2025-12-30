import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import it from '../locales/it.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';
import ar from '../locales/ar.json';
import fil from '../locales/fil.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  de: { translation: de },
  ja: { translation: ja },
  hi: { translation: hi },
  zh: { translation: zh },
  ar: { translation: ar },
  fil: { translation: fil },
  tl: { translation: fil }, // Alias for Tagalog
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
