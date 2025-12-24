import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { userConfig, updateConfig } = useConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-blue-500/10 overflow-hidden transform transition-all">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 relative z-10">
            {/* Mode: Default vs Child/Teen */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-3">Modo de Cálculo</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => updateConfig('mode', 'adult')}
                        className={`py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${userConfig.mode === 'adult' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Adulto Standard
                    </button>
                    <button 
                         onClick={() => updateConfig('mode', 'child')}
                         className={`py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${userConfig.mode === 'child' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Niño / Adolescente
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1">
                    {userConfig.mode === 'adult' ? 'Cálculo de IMC estándar para mayores de 20 años.' : 'Cálculo ajustado por percentiles (OMS/CDC) para 2 a 19 años.'}
                </p>
            </div>

            {/* Extra Params (Only if Child Mode) */}
            <div className={`space-y-4 transition-all duration-300 ${userConfig.mode === 'child' ? 'opacity-100 max-h-96' : 'opacity-50 max-h-0 overflow-hidden grayscale pointer-events-none'}`}>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Edad (2-20 Años)</label>
                        <input 
                            type="number" 
                            inputMode="numeric"
                            min="2"
                            max="20"
                            value={userConfig.age} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d{0,2}$/.test(val)) {
                                    updateConfig('age', val);
                                }
                            }}
                            onBlur={() => {
                                let val = parseInt(userConfig.age);
                                if (isNaN(val) || val < 2) val = 2;
                                if (val > 20) val = 20;
                                updateConfig('age', val.toString());
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-700"
                            placeholder="10"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Sexo biológico</label>
                        <div className="flex bg-slate-950 border border-slate-700 rounded-lg p-1 h-[50px]">
                            <button 
                                onClick={() => updateConfig('gender', 'male')}
                                className={`flex-1 rounded-md flex items-center justify-center transition-all ${userConfig.gender === 'male' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <circle cx="9" cy="14" r="5" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 10.5L20 3m0 0h-5m5 0v5" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => updateConfig('gender', 'female')}
                                className={`flex-1 rounded-md flex items-center justify-center transition-all ${userConfig.gender === 'female' ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5m0 0l-4.5-4.5m4.5 4.5l4.5-4.5" opacity="0" /> 
                                    {/* Venus */}
                                     <circle cx="12" cy="9" r="4.5" />
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5v6" />
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 16.5h5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                 </div>
                 <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                     <p className="text-[11px] text-yellow-200/80 leading-relaxed">
                         <strong className="text-yellow-400">Nota:</strong> El cálculo para menores utiliza tablas de crecimiento (percentiles) que requieren edad y sexo precisos para ser válidos.
                     </p>
                 </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end items-center gap-4">
            {userConfig.mode === 'child' && (parseInt(userConfig.age) < 2 || parseInt(userConfig.age) > 20 || !userConfig.age) && (
                <span className="text-xs text-red-400 font-bold animate-pulse">
                    Edad válida requerida (2-20)
                </span>
            )}
            <button 
                onClick={onClose}
                disabled={userConfig.mode === 'child' && (parseInt(userConfig.age) < 2 || parseInt(userConfig.age) > 20 || !userConfig.age)}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
            >
                Listo
            </button>
        </div>
      </div>
    </div>
  );
}
