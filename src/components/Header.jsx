import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsModal from './SettingsModal';
import { useConfig } from '../context/ConfigContext';

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGearHovered, setIsGearHovered] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage, themeColor } = useConfig();
  const langMenuRef = useRef(null);

  const { t } = useTranslation();
  const languages = ['es', 'en', 'fr', 'it', 'de', 'ja', 'hi', 'zh', 'ar'];

  // Close lang menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full py-6 lg:py-8 bg-transparent relative z-20 flex flex-col lg:block items-center gap-4 lg:gap-0">
      {/* Buttons: Static on mobile (order-2), Absolute on desktop */}
      <div className="order-2 lg:order-none relative lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2 flex items-center gap-3 z-30">
             
             {/* Language Dropdown */}
             <div className="relative" ref={langMenuRef}>
                 <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className={`flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800/80 font-bold px-3 py-2 rounded-lg border transition-colors backdrop-blur-sm ${isLangOpen ? 'border-blue-500/50 text-white' : 'border-slate-700/50 text-slate-300'}`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>{language.toUpperCase()}</span>
                    <svg    
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isLangOpen ? 'rotate-180 text-white' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                 </button>

                 {/* Dropdown Menu */}
                 <div 
                    className={`absolute right-0 top-full mt-2 w-max min-w-[100px] bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl shadow-slate-950/50 overflow-hidden transition-all duration-200 transform origin-top-right z-50 ${isLangOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}
                 >
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang);
                                    setIsLangOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-white/5 transition-colors ${language === lang ? 'bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
                                style={language === lang ? { color: themeColor } : {}}
                            >
                                <span>{lang.toUpperCase()}</span>
                                {language === lang && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3" style={{ color: themeColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                 </div>
             </div>

             <button 
                onClick={() => setIsSettingsOpen(true)}
                onMouseEnter={() => setIsGearHovered(true)}
                onMouseLeave={() => setIsGearHovered(false)}
                className="flex items-center justify-center p-2 bg-slate-900/50 hover:bg-slate-800/80 text-white rounded-lg border border-slate-700/50 transition-all backdrop-blur-sm group" // text-white by default
                style={{ borderColor: isSettingsOpen ? themeColor : undefined }} // Optional: highlight border if open
             >
                 <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180"
                    style={{ color: (isGearHovered || isSettingsOpen) ? themeColor : undefined }} // Color on hover or open
                 > 
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
             </button>
      </div>

      <div className="order-1 lg:order-none max-w-6xl mx-auto px-6 flex justify-center items-center relative w-full lg:w-auto">
        <div 
            className="group cursor-pointer"
            onClick={() => {
                const element = document.getElementById('bmi-main-view');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }}
        >
            <h1 className="text-3xl lg:text-4xl font-bold tracking-widest uppercase text-slate-200 drop-shadow-sm transition-opacity group-hover:opacity-80">
            {t('header.title')}
            </h1>
        </div>

        

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </header>
  );
}
