import React from 'react';
import { useTranslation } from 'react-i18next';

export default function BMIControls({ 
  activeTab, 
  setActiveTab, 
  unit, 
  handleUnitChange, 
  language, 
  setLanguage,
  bmiInfo
}) {
  const { t } = useTranslation();
  
  // Dynamic Text Style for Active State
  const activeTextStyle = {
    color: bmiInfo.color
  };

  // Border Style for the slider to match active color subtly (optional, or just keep it dark)
  const sliderStyle = {
    backgroundColor: '#0f172a', // slate-950 equivalent
    border: `1px solid ${bmiInfo.color}40`,
    boxShadow: `0 0 15px ${bmiInfo.color}20`
  };
  
  // Helper to get button class
  const getButtonClass = (isActive) => 
      `relative z-20 w-full h-full text-[12px] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 
       bg-transparent border-none hover:border-none focus:outline-none focus:ring-0 whitespace-nowrap
       ${language === 'ja' ? '' : 'tracking-widest'}
       ${isActive ? '' : 'text-slate-400 hover:text-white'}`;

  // Container Class
  // Added p-[3px] to create a "track" effect which helps the "shape" feel more deliberate
  const containerClass = "bg-slate-900/40 rounded-full grid grid-cols-2 relative border border-slate-700/50 backdrop-blur-md overflow-hidden h-[50px] p-[3px]";

  // Slider Class
  // inset-y-[3px] to match the padding
  const sliderClass = `absolute inset-y-[3px] w-[calc(50%-3px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-10`;

  return (
    <div className="p-6 bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-2xl flex flex-col justify-center gap-6 h-full relative overflow-hidden">
         {/* Subtle background glow matching BMI */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-transparent to-transparent opacity-50 z-0"></div>
         <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 transition-colors duration-500" style={{ backgroundColor: bmiInfo.color }}></div>

         {/* Mode Toggle */}
         <div className="z-10 relative">
             <div className={containerClass}>
                {/* Sliding Background */}
                <div 
                    className={`${sliderClass} ${activeTab === 'visual' ? 'left-[calc(50%+1.5px)]' : 'left-[3px]'}`}
                    style={sliderStyle}
                ></div>

                <button 
                   onClick={() => setActiveTab('calculator')}
                   className={getButtonClass(activeTab === 'calculator')}
                   style={activeTab === 'calculator' ? activeTextStyle : {}}
                >
                  {/* IMPROVED CALCULATOR ICON */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m-6.063-16.658l.26-1.477" opacity="0" /> {/* Hidden filler to keep viewbox check */}
                     <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 11h2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 14h2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h2" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h2" />
                  </svg>
                  <span>{t('controls.calculator')}</span>
                </button>
                <button 
                   onClick={() => setActiveTab('visual')}
                   className={getButtonClass(activeTab === 'visual')}
                   style={activeTab === 'visual' ? activeTextStyle : {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('controls.visual')}</span>
                </button>
             </div>
         </div>

         {/* Unit Toggle */}
         <div className="z-10 relative">
             <div className={containerClass}>
                <div 
                     className={`${sliderClass} ${unit === 'imperial' ? 'left-[calc(50%+1.5px)]' : 'left-[3px]'}`}
                     style={sliderStyle}
                ></div>
                <button 
                   onClick={() => handleUnitChange('metric')}
                   className={getButtonClass(unit === 'metric')}
                   style={unit === 'metric' ? activeTextStyle : {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                  </svg>
                  <span>{t('controls.metric')}</span>
                </button>
                <button 
                   onClick={() => handleUnitChange('imperial')}
                   className={getButtonClass(unit === 'imperial')}
                   style={unit === 'imperial' ? activeTextStyle : {}}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0I12 21M12 20.25h.008v.008H12v-.008z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6h13.5" />
                   </svg>
                  <span>{t('controls.imperial')}</span>
                </button>
             </div>
         </div>

         
    </div>
  );
}
