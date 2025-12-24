import { createContext, useState, useContext } from 'react';
import i18n from '../i18n/i18n';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [language, setLanguageState] = useState('es'); // 'es' | 'en'
  const [themeColor, setThemeColor] = useState('#60A5FA'); // Default Blue-400

  const setLanguage = (lang) => {
    if (typeof lang === 'function') {
        setLanguageState(prev => {
            const newLang = lang(prev);
            i18n.changeLanguage(newLang);
            return newLang;
        });
    } else {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
    }
  };
  const [userConfig, setUserConfig] = useState({
    mode: 'adult', // 'adult' | 'child'
    age: '',       // years
    gender: 'male', // 'male' | 'female'
  });

  const updateConfig = (key, value) => {
    setUserConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ConfigContext.Provider value={{ language, setLanguage, userConfig, updateConfig, themeColor, setThemeColor }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
