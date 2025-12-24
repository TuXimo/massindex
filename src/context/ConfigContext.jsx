import { createContext, useState, useContext } from 'react';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [language, setLanguage] = useState('es'); // 'es' | 'en'
  const [userConfig, setUserConfig] = useState({
    mode: 'adult', // 'adult' | 'child'
    age: '',       // years
    gender: 'male', // 'male' | 'female'
  });

  const updateConfig = (key, value) => {
    setUserConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ConfigContext.Provider value={{ language, setLanguage, userConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
