import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { useConfig } from '../context/ConfigContext';

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { language, setLanguage } = useConfig();

  return (
    <header className="w-full py-8 bg-transparent relative z-20">
      {/* Botones Absolutos a la derecha de toda la pantalla */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-30">
             <button 
                onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
                className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 font-bold px-3 py-2 rounded-lg border border-slate-700/50 transition-colors backdrop-blur-sm"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{language.toUpperCase()}</span>
             </button>

             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center p-2 bg-slate-900/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all backdrop-blur-sm group"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
             </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 flex justify-center items-center relative">
        <div 
            className="group cursor-pointer"
            onClick={() => {
                const element = document.getElementById('bmi-main-view');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }}
        >
            <h1 className="text-4xl font-bold tracking-widest uppercase text-slate-200 drop-shadow-sm transition-opacity group-hover:opacity-80">
            Índice de Masa Muscular
            </h1>
        </div>

        

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </header>
  );
}
