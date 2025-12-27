import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSliderRanges } from '../../utils/bmiUtils';

// Helper Component for Delayed Input (Commit on Blur/Enter)
const DelayedInput = ({ value, onCommit, max, placeholder, type = "number", className }) => {
   const [localVal, setLocalVal] = useState(value);
   
   // Sync with parent when it changes externally
   useEffect(() => {
     setLocalVal(value);
   }, [value]);

   const handleChange = (e) => setLocalVal(e.target.value);
   
   const handleCommit = () => {
      onCommit(localVal);
   };

   return (
       <input
          type={type}
          className={className}
          placeholder={placeholder}
          value={localVal}
          max={max}
          onChange={handleChange}
          onBlur={handleCommit}
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  handleCommit();
                  e.target.blur();
              }
          }}
       />
   );
};

export default function BMITable({ userWeight, userHeight, unit = 'metric', onSelect, userConfig = {}, customRanges, setCustomRanges, effectiveRanges: effectiveRangesProp }) {

  const { t } = useTranslation();
  const containerRef = useRef(null);
  
  // Default Zoom: Higher on mobile (1.2), normal on desktop (1.0)
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('table_zoom');
        if (saved) return parseFloat(saved);
        return window.innerWidth < 1024 ? 1.2 : 1;
    }
    return 1;
  });

  useEffect(() => {
    localStorage.setItem('table_zoom', zoomLevel);
  }, [zoomLevel]);


  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);
  const lastProps = useRef({ w: userWeight, h: userHeight, u: unit });
  const highlightTimerRef = useRef(null);

  // Recalculate ranges for table consistently with sliders
  const ranges = useMemo(() => {
     return getSliderRanges(unit, userConfig?.mode, userConfig?.age);
  }, [unit, userConfig?.mode, userConfig?.age]);

  const triggerHighlight = () => {
    setShowHighlight(true);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setShowHighlight(false), 1500);
  };


  useEffect(() => {
    const weightChanged = userWeight !== lastProps.current.w;
    const heightChanged = userHeight !== lastProps.current.h;
    const unitChanged = unit !== lastProps.current.u;
    
    // Skip if nothing changed (handling initial render & strict mode)
    if (!weightChanged && !heightChanged && !unitChanged) return;

    // Update refs
    lastProps.current = { w: userWeight, h: userHeight, u: unit };

    // If unit changed, don't trigger highlight
    if (unitChanged) return;

    triggerHighlight();
  }, [userWeight, userHeight, unit]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX); 
    const walkY = (y - startY);
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  // Conversion Helpers
  const kgToLbs = (kg) => kg * 2.20462;
  const cmToInches = (cm) => cm / 2.54;
  
  // Format helpers
  const formatHeight = (val) => {
      if (unit === 'metric') return val;
      // Convert inches to Ft'In"
      const feet = Math.floor(val / 12);
      const inches = Math.round(val % 12);
      return `${feet}'${inches}"`;
  };

  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const rangeMenuRef = useRef(null);

  // Close range menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (rangeMenuRef.current && !rangeMenuRef.current.contains(event.target)) {
            setIsRangeMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Merge default ranges with custom ranges - NOW RECEIVED FROM PARENT (Optimization)
  // If we didn't receive it (e.g. strict mode or legacy), we recalc, but we should receive it.
  const effectiveRanges = effectiveRangesProp || useMemo(() => {
     const defaults = ranges; // from getSliderRanges via useMemo above
     return {
         wMin: customRanges.wMin !== '' ? parseInt(customRanges.wMin) : defaults.wMin,
         wMax: customRanges.wMax !== '' ? parseInt(customRanges.wMax) : defaults.wMax,
         hMin: customRanges.hMin !== '' ? parseInt(customRanges.hMin) : defaults.hMin,
         hMax: customRanges.hMax !== '' ? parseInt(customRanges.hMax) : defaults.hMax,
     };
  }, [ranges, customRanges]);

  // Range definitions (using effective ranges)
  const wMin = effectiveRanges.wMin;
  const wMax = effectiveRanges.wMax;
  const hMin = effectiveRanges.hMin;
  const hMax = effectiveRanges.hMax;
  const wStep = effectiveRanges.wStep; // New
  const hStep = effectiveRanges.hStep; // New
  
  // Absolutes
  const ABS_LIMITS = unit === 'metric' 
    ? { wMax: 650, hMax: 272 } 
    : { wMax: 1433, hMax: 107 };

  const [errorMsg, setErrorMsg] = useState(null);
  const errorTimerRef = useRef(null);

  // Show temporary error message
  const triggerError = (val, type = 'max') => {
      // Re-use keys or add generic "Invalid Value"
      const msg = type === 'max' 
        ? t('validation.maxRange', { max: val })
        : t('validation.minRange', { min: val });
      setErrorMsg(msg);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMsg(null), 3000);
  };
  
  const handleCustomRangeChange = (key, val, maxOverride) => {
       if (val === '') {
           setCustomRanges(prev => ({...prev, [key]: ''}));
           return;
       }
       let num = parseFloat(val);
       if (isNaN(num)) return;

       const limit = maxOverride || (key.startsWith('w') ? ABS_LIMITS.wMax : ABS_LIMITS.hMax);
       if (limit && num > limit) {
           triggerError(limit, 'max');
           num = limit;
       }
       
       if (key.startsWith('h')) {
           const minH = unit === 'metric' ? 50 : 21; 
           if (num < minH) {
               triggerError(minH, 'min');
               num = minH;
           }
       } else if (key.startsWith('w')) {
           const minW = unit === 'metric' ? 20 : 45;
           if (num < minW) {
               triggerError(minW, 'min');
               num = minW;
           }
       }
       
       setCustomRanges(prev => ({...prev, [key]: String(num)}));
  };

  // Handle Steps Change
  const handleStepChange = (key, val, min, max) => {
      if (val === '') {
          setCustomRanges(prev => ({...prev, [key]: ''}));
          return;
      }
      let num = parseFloat(val);
      if (isNaN(num)) return;
      
      if (num < min) {
          triggerError(min, 'min');
          num = min;
      }
      if (num > max) {
          triggerError(max, 'max');
          num = max;
      }
      setCustomRanges(prev => ({...prev, [key]: num.toString()}));
  };

  const currentWeight = userWeight ? parseFloat(userWeight) : null;
  const currentHeight = userHeight ? parseFloat(userHeight) : null;

  // Clamping for Highlight
  const highlightWeight = useMemo(() => {
    if (currentWeight === null) return null;
    if (currentWeight < wMin) return wMin;
    if (currentWeight > wMax) return wMax;
    return currentWeight;
  }, [currentWeight, wMin, wMax]);

  const highlightHeight = useMemo(() => {
    if (currentHeight === null) return null;
    if (currentHeight < hMin) return hMin;
    if (currentHeight > hMax) return hMax;
    return currentHeight;
  }, [currentHeight, hMin, hMax]);


  const weights = (() => {
    const w = [];
    const step = wStep || (unit === 'metric' ? 5 : 10);
    
    if (wMin <= wMax && step > 0) {
        // Precision safe loop
        let current = wMin;
        while (current <= wMax + 0.0001) { // 0.0001 epsilon
             // Round to avoid floating point drift
             const val = Math.round(current * 100) / 100;
             if (val <= wMax) w.push(val);
             current += step;
        }
    }
    // Exact match insertion
    if (currentWeight && !w.includes(currentWeight) && currentWeight >= wMin && currentWeight <= wMax) {
      w.push(currentWeight);
      w.sort((a, b) => a - b);
    }
    return w;
  })();

  const heights = (() => {
    const h = [];
    const step = hStep || (unit === 'metric' ? 5 : 2);
    
    if (hMin <= hMax && step > 0) {
        let current = hMin;
        while (current <= hMax + 0.0001) {
             const val = Math.round(current * 100) / 100;
             if (val <= hMax) h.push(val);
             current += step;
        }
    }
    if (currentHeight && !h.includes(currentHeight) && currentHeight >= hMin && currentHeight <= hMax) {
      h.push(currentHeight);
      h.sort((a, b) => a - b);
    }
    return h;
  })();



  const calculateCellBMI = (weight, height) => {
    if (!height || height <= 0) return "-";
    if (unit === 'metric') {
        const hM = height / 100;
        return (weight / (hM * hM)).toFixed(1);
    } else {
        // Imperial: 703 * weight (lbs) / height (in)^2
        return ((703 * weight) / (height * height)).toFixed(1);
    }
  };

  const isHighlighted = (w, h) => {
    if (highlightWeight === null || highlightHeight === null) return false;
    // Compare against the clamped "highlight" values, not the raw input
    return w === highlightWeight && h === highlightHeight;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (highlightWeight && highlightHeight) {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

      const activeCell = document.getElementById('active-bmi-cell');
      if (activeCell && containerRef.current) {
         const container = containerRef.current;
         const cellTop = activeCell.offsetTop;
         const cellLeft = activeCell.offsetLeft;
         // Center logic...
         const containerTop = container.scrollTop;
         
         const isVerticallyVisible = cellTop >= containerTop && (cellTop + activeCell.offsetHeight) <= (containerTop + container.clientHeight);
         const isHorizontallyVisible = activeCell.offsetLeft >= container.scrollLeft && (activeCell.offsetLeft + activeCell.offsetWidth) <= (container.scrollLeft + container.clientWidth);

         if (!isVerticallyVisible || !isHorizontallyVisible) {
            container.scrollTo({
              top: cellTop - (container.clientHeight / 2) + (activeCell.clientHeight / 2),
              left: cellLeft - (container.clientWidth / 2) + (activeCell.clientWidth / 2),
              behavior: 'smooth'
            });
         }
      }
    }
  }, [highlightWeight, highlightHeight, zoomLevel]);

  // Helper for Imperial Parsing
  const parseImperialHeight = (val) => {
     if (!val) return null;
     const ftInMatch = val.match(/(\d+)'\s*(\d+)/);
     const decimalMatch = val.match(/^(\d+)[\.,](\d+)$/);
     if (ftInMatch) {
        return parseInt(ftInMatch[1]) * 12 + parseInt(ftInMatch[2]);
     } else if (decimalMatch) {
         const feet = parseInt(decimalMatch[1]);
         const inches = parseInt(decimalMatch[2]);
         if (feet < 9) return feet * 12 + inches;
         return parseFloat(val.replace(',', '.'));
     } else {
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) return num < 10 ? num * 12 : num;
     }
     return null;
  };

  const formatImperialHeight = (val) => {
      if (!val) return '';
      const num = parseFloat(val);
      if (isNaN(num)) return val;
      const feet = Math.floor(num / 12);
      const inches = Math.round(num % 12);
      if (inches === 12) return `${feet + 1}'0"`;
      return `${feet}'${inches}"`;
  };

  const handleImperialBlur = (key, val, maxLimit, isStep = false) => {
      let parsed = parseImperialHeight(val);
      if (parsed !== null) {
          if (maxLimit && parsed > maxLimit) parsed = maxLimit;
          
          if (isStep) {
             // For steps, enforce min 1 inch (approx 3cm but technically 1 inch in imperial logic)
             // handleStepChange takes (key, valString, min, max)
             // We use 1 as min, and maxLimit (or 12) as max.
             handleStepChange(key, parsed.toString(), 1, maxLimit || 12);
          } else {
             handleCustomRangeChange(key, parsed);
          }
      }
  };

  const [inputValues, setInputValues] = useState({ hMin: '', hMax: '', hStep: '' });
  useEffect(() => {
     if (isRangeMenuOpen) {
         if (unit === 'imperial') {
             setInputValues({
                 hMin: customRanges.hMin ? formatImperialHeight(customRanges.hMin) : '',
                 hMax: customRanges.hMax ? formatImperialHeight(customRanges.hMax) : '',
                 hStep: customRanges.hStep ? formatImperialHeight(customRanges.hStep) : ''
             });
         } else {
             setInputValues({ hMin: '', hMax: '', hStep: '' }); 
         }
     }
  }, [isRangeMenuOpen, customRanges, ranges, unit]);



  return (
      <div className="w-full max-w-full overflow-hidden p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl relative group transition-all duration-300 hover:shadow-2xl hover:border-slate-600 hover:bg-slate-800/60">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-700 pb-2 mb-6 gap-4 lg:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
            <h3 className="font-bold text-xl uppercase text-white tracking-wider flex items-baseline gap-2 shrink-0">
              {userConfig?.mode === 'child' ? t('table.pediatric') : t('table.reference')} 
              {unit === 'imperial' && <span className="text-slate-500 text-sm">{t('table.imperial')}</span>}
              {unit === 'metric' && <span className="text-slate-500 text-sm">{t('table.metric')}</span>}
            </h3>
            {userConfig?.mode === 'child' && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase opacity-90 mt-1 sm:mt-0">
                    <span className="bg-blue-900/40 px-2 py-1 rounded border border-blue-500/20 whitespace-nowrap">
                        {userConfig.age} {t('table.years')}
                    </span>
                    <span className="bg-blue-900/40 px-2 py-1 rounded border border-blue-500/20 whitespace-nowrap">
                        {userConfig.gender === 'male' ? 'M' : 'F'}
                    </span>
                </div>
            )}
        </div>


        {/* Zoom Controls (Outside of range groups) */}
        <div className="flex rounded-lg p-1 self-end lg:self-auto ml-2 gap-1 relative z-50">
             {/* Unified Settings Button - Hidden for Children */}
             {userConfig?.mode !== 'child' && (
                  <div className="relative group-range" ref={rangeMenuRef}>
                     <button
                         onClick={() => setIsRangeMenuOpen(!isRangeMenuOpen)}
                         className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all bg-transparent border-none outline-none"
                         title={t('table.settings')}
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0h-3.75M3 16.5h3.75m9.75 0h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0h-3.75m-9.75 0H15m4.125 0a1.5 1.5 0 01-3 0" />
                         </svg>
                     </button>
                     {isRangeMenuOpen && (
                         <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-50 w-64">
                             {/* Error Toast inside Popover */}
                             {errorMsg && (
                                 <div className="absolute bottom-full mb-2 left-0 w-full bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold text-center z-50 animate-bounce">
                                    {errorMsg}
                                 </div>
                             )}
                             
                             {/* Ranges Section */}
                             <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 border-b border-slate-700 pb-1">Rangos</h4>
                             <div className="grid grid-cols-2 gap-3 mb-2">
                                  <div className="flex flex-col gap-1">
                                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.weight')} Min ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                      <DelayedInput 
                                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                          placeholder={ranges.wMin}
                                          value={customRanges.wMin}
                                          onCommit={(val) => handleCustomRangeChange('wMin', val)}
                                      />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.weight')} Max ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                      <DelayedInput 
                                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                          placeholder={ranges.wMax}
                                          value={customRanges.wMax}
                                          max={ABS_LIMITS.wMax}
                                          onCommit={(val) => handleCustomRangeChange('wMax', val, ABS_LIMITS.wMax)}
                                      />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.height')} Min ({unit === 'metric' ? 'cm' : 'in'})</label>
                                      {unit === 'metric' ? (
                                          <DelayedInput 
                                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                              placeholder={ranges.hMin}
                                              value={customRanges.hMin}
                                              onCommit={(val) => handleCustomRangeChange('hMin', val)}
                                          />
                                      ) : (
                                          <input 
                                              type="text"
                                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                              placeholder={formatImperialHeight(ranges.hMin)}
                                              value={inputValues.hMin}
                                              onChange={(e) => setInputValues({...inputValues, hMin: e.target.value.replace(/[.,]/g, "'")})}
                                              onBlur={(e) => handleImperialBlur('hMin', e.target.value)}
                                              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                          />
                                      )}
                                  </div>
                                   <div className="flex flex-col gap-1">
                                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.height')} Max ({unit === 'metric' ? 'cm' : 'in'})</label>
                                      {unit === 'metric' ? (
                                          <DelayedInput 
                                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                              placeholder={ranges.hMax}
                                              value={customRanges.hMax}
                                              max={ABS_LIMITS.hMax}
                                              onCommit={(val) => handleCustomRangeChange('hMax', val, ABS_LIMITS.hMax)}
                                          />
                                      ) : (
                                          <input 
                                              type="text"
                                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                              placeholder={formatImperialHeight(ranges.hMax)}
                                              value={inputValues.hMax}
                                              onChange={(e) => setInputValues({...inputValues, hMax: e.target.value.replace(/[.,]/g, "'")})}
                                              onBlur={(e) => handleImperialBlur('hMax', e.target.value, ABS_LIMITS.hMax)}
                                              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                          />
                                      )}
                                  </div>
                             </div>

                             {/* Intervals Section */}
                             <div className="border-t border-slate-700 my-4 pt-3">
                                 <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 border-b border-slate-700 pb-1">Intervalos</h4>
                                 <div className="grid grid-cols-2 gap-3 mb-1">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.weight')} ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                        <DelayedInput 
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                            placeholder={effectiveRanges.wStep}
                                            value={customRanges.wStep}
                                            onCommit={(val) => handleStepChange('wStep', val, 0.5, 10)}
                                        />
                                        <span className="text-[9px] text-slate-500">Min 0.5 - Max 10</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.height')} ({unit === 'metric' ? 'cm' : 'in'})</label>
                                        {unit === 'metric' ? (
                                            <DelayedInput 
                                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                                placeholder={effectiveRanges.hStep}
                                                value={customRanges.hStep}
                                                onCommit={(val) => handleStepChange('hStep', val, 0.5, 10)}
                                             />
                                        ) : (
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                                placeholder={formatImperialHeight(effectiveRanges.hStep)}
                                                value={inputValues.hStep || customRanges.hStep}
                                                onChange={(e) => {
                                                     const val = e.target.value.replace(/[.,]/g, "'");
                                                     // Simplified for steps: allow direct typing or formatted
                                                     setInputValues(prev => ({...prev, hStep: val}));
                                                }}
                                                onBlur={(e) => handleImperialBlur('hStep', e.target.value, 5, true)}
                                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                            />
                                        )}
                                        <span className="text-[9px] text-slate-500">{unit === 'metric' ? 'Min 0.5 - Max 10' : "Min 0'1\" - Max 0'5\""}</span>
                                    </div>
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
             )}

             <button 
               onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
               className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all bg-transparent"
               title={t('table.zoomOut')}
             >
               -
             </button>
             <button 
               onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
               className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all bg-transparent"
               title={t('table.zoomIn')}
             >
               +
             </button>
        </div>



      </div>
      
      <div 
        className={`w-full overflow-auto rounded-xl border border-slate-700/50 max-h-[500px] scrollbar-hide relative ${isDragging ? 'cursor-grabbing' : ''}`} 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
          <table className="w-full text-xs text-center border-separate border-spacing-0" style={{ fontSize: `${0.6 * zoomLevel}rem` }}>
            <thead>
              <tr>
                <th 
                  style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                  className="p-1 bg-slate-950 text-slate-400 font-bold sticky left-0 top-0 z-50 leading-3 shadow-[2px_2px_10px_rgba(0,0,0,0.5)]"
                >
                  {unit === 'metric' ? t('table.headers.metric') : t('table.headers.imperial')}
                </th>
                {weights.map((w) => {
                   const isColActive = showHighlight && highlightWeight === w;
                   return (
                    <th 
                      key={w} 
                      style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                      className={`p-1 bg-slate-950 font-bold sticky top-0 z-40 transition-colors duration-300 ${isColActive ? 'text-white' : 'text-slate-400'}`}
                    >
                      {w}
                    </th>
                   );
                })}
              </tr>
            </thead>
            <tbody>
              {heights.map((h) => {
                const isRowActive = showHighlight && highlightHeight === h;
                return (
                  <tr key={h}>
                    <td 
                      style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                      className={`p-1 bg-slate-950 font-bold sticky left-0 z-30 transition-colors duration-300 shadow-[2px_0_10px_rgba(0,0,0,0.3)] ${isRowActive ? 'text-white' : 'text-slate-400'}`}
                    >
                      {formatHeight(h)}
                    </td>
                    {weights.map((w) => {
                      const bmi = calculateCellBMI(w, h);
                      const isColActive = showHighlight && highlightWeight === w;
                      const active = isHighlighted(w, h);
                      
                      // Highlight logic: if active -> Glow. If row/col active -> brighter. Else -> standard.
                      
                      const getBMIColorClass = (val) => {
                        const v = parseFloat(val);
                        if (v < 18.5) return 'bg-blue-500/80'; // Low
                        if (v < 25) return 'bg-green-500/80'; // Normal
                        if (v < 30) return 'bg-yellow-500/80'; // Over
                        if (v < 35) return 'bg-orange-500/80'; // Ob1
                        if (v < 40) return 'bg-red-500/80'; // Ob2
                        return 'bg-red-700/80'; // Ob3
                      };

                      const colorClass = getBMIColorClass(bmi);
                      
                      // Dynamic opacity/brightness based on selection
                      // If this cell is in the active Row OR active Column, we make it fully opaque.
                      // If it's the specific INTERSECTION, we add a glow.
                      // Otherwise, slight transparency or dimmed? 
                      // Actually, solid colors look better. Let's rely on borders/shadows for highlight.

                      let cellStateClasses = `${colorClass} text-white font-bold`;
                      
                      if (active) {
                          // precise intersection
                          cellStateClasses = "bg-white text-slate-900 font-black shadow-[0_0_15px_rgba(255,255,255,0.7)] z-20 scale-110 rounded-sm";
                      } else if (isRowActive || isColActive) {
                          // In the crosshair
                          cellStateClasses = `${colorClass.replace('/80', '')} text-white font-bold brightness-125 z-10`; // remove opacity, brighten
                      } else if (showHighlight) {
                          // Background noise ONLY when highlighting is active
                          cellStateClasses += " opacity-40 grayscale-[0.5] transition-all duration-300";
                      } else {
                          // Standard vibrant state when idle
                          cellStateClasses += " transition-all duration-300 hover:brightness-110";
                      }

                      return (
                        <td 
                          key={`${h}-${w}`} 
                          id={active ? "active-bmi-cell" : undefined}
                          onDoubleClick={() => {
                            triggerHighlight();
                            if (onSelect) onSelect(w, h);
                          }}
                          style={{ width: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem`, touchAction: 'manipulation' }}
                          className={`p-1 cursor-pointer select-none border-none outline-none ${cellStateClasses}`}
                        >
                          {bmi}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-center text-slate-500">
        {t('table.footer')}
      </div>
    </div>
  );
}
