

export default function BMIControls({ 
  activeTab, 
  setActiveTab, 
  unit, 
  handleUnitChange, 
  language, 
  setLanguage,
  bmiInfo
}) {
  
  // Dynamic glow style based on BMI status
  const glowStyle = {
     backgroundColor: bmiInfo.color,
     boxShadow: `0 0 15px ${bmiInfo.color}60`
  };
  
  // Function to get active classes
  const getActiveClass = (isActive) => 
      `relative z-10 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors duration-300 flex items-center justify-center gap-2 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`;

  // Container Class - removed padding
  const containerClass = "bg-slate-900/40 rounded-full grid relative border border-slate-700/50 backdrop-blur-md overflow-hidden";

  return (
    <div className="p-6 bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-2xl flex flex-col justify-center gap-6 h-full relative overflow-hidden">
         {/* Subtle background glow matching BMI */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-transparent to-transparent opacity-50 z-0"></div>
         <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 transition-colors duration-500" style={{ backgroundColor: bmiInfo.color }}></div>

         {/* Mode Toggle */}
         <div className="z-10 relative">
             <div className={`${containerClass} grid-cols-2`}>
                <div 
                    className={`absolute inset-y-0 w-[calc(50%+1px)] transition-all duration-300 ease-out ${activeTab === 'visual' ? 'left-[calc(50%-1px)]' : 'left-0'}`}
                    style={glowStyle}
                ></div>
                <button 
                   onClick={() => setActiveTab('calculator')}
                   className={getActiveClass(activeTab === 'calculator')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.008v.008h-.008V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5m-7.5 3h7.5M3 12h18M3 9h18M3 6h18M3 3h18" /> 
                  </svg>
                  <span>Calc</span>
                </button>
                <button 
                   onClick={() => setActiveTab('visual')}
                   className={getActiveClass(activeTab === 'visual')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Visual</span>
                </button>
             </div>
         </div>

         {/* Unit Toggle */}
         <div className="z-10 relative">
             <div className={`${containerClass} grid-cols-2`}>
                <div className={`absolute inset-y-0 w-[calc(50%+1px)] transition-all duration-300 ease-out ${unit === 'imperial' ? 'left-[calc(50%-1px)]' : 'left-0'}`}
                     style={glowStyle}
                ></div>
                <button 
                   onClick={() => handleUnitChange('metric')}
                   className={getActiveClass(unit === 'metric')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                  </svg>
                  <span>Metric</span>
                </button>
                <button 
                   onClick={() => handleUnitChange('imperial')}
                   className={getActiveClass(unit === 'imperial')}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0I12 21M12 20.25h.008v.008H12v-.008z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6h13.5" />
                   </svg>
                  <span>Imperial</span>
                </button>
             </div>
         </div>

         
    </div>
  );
}
