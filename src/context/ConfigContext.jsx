import { createContext, useState, useContext } from 'react';
import i18n from '../i18n/i18n';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      // If we have a saved language, use it.
      if (saved) { 
        i18n.changeLanguage(saved);
        return saved; 
      }
    }
    return 'es';
  });
  const [themeColor, setThemeColor] = useState('#60A5FA'); // Default Blue-400

  const setLanguage = (lang) => {
    if (typeof lang === 'function') {
        setLanguageState(prev => {
            const newLang = lang(prev);
            i18n.changeLanguage(newLang);
            localStorage.setItem('language', newLang);
            return newLang;
        });
    } else {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    }
  };
  const [userConfig, setUserConfig] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_config');
        if (saved) return JSON.parse(saved);
    }
    return {
        mode: 'adult', // 'adult' | 'child'
        age: '',       // years
        gender: 'male', // 'male' | 'female'
    };
  });

  const updateConfig = (key, value) => {
    setUserConfig(prev => {
        const newConfig = { ...prev, [key]: value };
        localStorage.setItem('user_config', JSON.stringify(newConfig));
        return newConfig;
    });
  };

  return (
    <ConfigContext.Provider value={{ language, setLanguage, userConfig, updateConfig, themeColor, setThemeColor }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
