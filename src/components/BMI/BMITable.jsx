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
  
  // Absolutes
  const ABS_LIMITS = unit === 'metric' 
    ? { wMax: 650, hMax: 272 } 
    : { wMax: 1433, hMax: 107 };

  const [errorMsg, setErrorMsg] = useState(null);
  const errorTimerRef = useRef(null);

  // Show temporary error message
  const triggerError = (val, type = 'max') => {
      const msg = type === 'max' 
        ? t('validation.maxRange', { max: val })
        : t('validation.minRange', { min: val });
      setErrorMsg(msg);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleCustomRangeChange = (key, val, maxLimit) => {
     if (val === '') {
         setCustomRanges(prev => ({...prev, [key]: ''}));
         return;
     }

     const num = parseInt(val);
     if (isNaN(num)) return;
     
     // Prevent negative values
     if (num < 0) {
         return; // Just ignore negative input
     }

     // Global Minimum Height Rule: 50cm for Metric, 20 inches for Imperial
     const ABS_MIN_HEIGHT = unit === 'metric' ? 50 : 20;
     // Global Minimum Weight Rule: 10kg for Metric, 22 lbs for Imperial
     const ABS_MIN_WEIGHT = unit === 'metric' ? 10 : 22;
     
     if ((key === 'hMin' || key === 'hMax') && num < ABS_MIN_HEIGHT) {
         triggerError(ABS_MIN_HEIGHT, 'min');
         setCustomRanges(prev => ({...prev, [key]: ABS_MIN_HEIGHT.toString()}));
         return;
     }

     if ((key === 'wMin' || key === 'wMax') && num < ABS_MIN_WEIGHT) {
         triggerError(ABS_MIN_WEIGHT, 'min');
         setCustomRanges(prev => ({...prev, [key]: ABS_MIN_WEIGHT.toString()}));
         return;
     }

     if (maxLimit && num > maxLimit) {
         triggerError(maxLimit, 'max');
         setCustomRanges(prev => ({...prev, [key]: maxLimit.toString()}));
         return;
     }
     
     setCustomRanges(prev => ({...prev, [key]: val.toString()}));
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
    const step = unit === 'metric' ? 5 : 10;
    // Safety check needed if user enters weird ranges (e.g. min > max)
    if (wMin <= wMax) {
        for (let i = wMin; i <= wMax; i += step) w.push(i);
    }
    // Only insert EXACT current value if it is within bounds and not already present
    if (currentWeight && !w.includes(currentWeight) && currentWeight >= wMin && currentWeight <= wMax) {
      w.push(currentWeight);
      w.sort((a, b) => a - b);
    }
    return w;
  })();

  const heights = (() => {
    const h = [];
    const step = unit === 'metric' ? 5 : 2;
    if (hMin <= hMax) {
        for (let i = hMin; i <= hMax; i += step) h.push(i);
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
      // Disable auto-scroll on mobile to avoid "snapping" effect
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

      const activeCell = document.getElementById('active-bmi-cell');
      if (activeCell && containerRef.current) {

         const container = containerRef.current;
         const cellTop = activeCell.offsetTop;
         const cellLeft = activeCell.offsetLeft;
         const cellBottom = cellTop + activeCell.offsetHeight;
         const cellRight = cellLeft + activeCell.offsetWidth;

         const containerTop = container.scrollTop;
         const containerLeft = container.scrollLeft;
         const containerBottom = containerTop + container.clientHeight;
         const containerRight = containerLeft + container.clientWidth;

         const isVerticallyVisible = cellTop >= containerTop && cellBottom <= containerBottom;
         const isHorizontallyVisible = cellLeft >= containerLeft && cellRight <= containerRight;

         if (!isVerticallyVisible || !isHorizontallyVisible) {
            container.scrollTo({
              top: cellTop - (container.clientHeight / 2) + (activeCell.clientHeight / 2),
              left: cellLeft - (container.clientWidth / 2) + (activeCell.clientWidth / 2),
              behavior: 'smooth'
            });
         }
      }
    }
  }, [highlightWeight, highlightHeight, zoomLevel]); // Depend on clamped values

  // Helper for Imperial Parsing (Duplicated from BMICalculator for now to keep self-contained)
  const parseImperialHeight = (val) => {
     if (!val) return null;
     const ftInMatch = val.match(/(\d+)'\s*(\d+)/);
     const decimalMatch = val.match(/^(\d+)[\.,](\d+)$/);
     
     if (ftInMatch) {
        return parseInt(ftInMatch[1]) * 12 + parseInt(ftInMatch[2]);
     } else if (decimalMatch) {
        const feet = parseInt(decimalMatch[1]);
        const inches = parseInt(decimalMatch[2]);
        if (feet < 9) {
            return feet * 12 + inches;
        } else {
            return parseFloat(val.replace(',', '.'));
        }
     } else {
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
             if (num < 10) return num * 12;
             return num;
        }
     }
     return null;
  };

  const formatImperialHeight = (val) => {
      if (!val) return '';
      const num = parseFloat(val);
      if (isNaN(num)) return val; // Return as-is if not a cleaner number (e.g. already formatted? though we store nums)
      
      const feet = Math.floor(num / 12);
      const inches = Math.round(num % 12);
      if (inches === 12) return `${feet + 1}'0"`;
      return `${feet}'${inches}"`;
  };

  const handleImperialBlur = (key, val, maxLimit) => {
      let parsed = parseImperialHeight(val);
      if (parsed !== null) {
          if (maxLimit && parsed > maxLimit) parsed = maxLimit;
          // Trigger change with parsed value (inches)
          handleCustomRangeChange(key, parsed);
      }
      // If null/invalid, do nothing or reset? Currently existing logic handles empty string.
  };

  const [inputValues, setInputValues] = useState({ hMin: '', hMax: '' });

  // Sync local inputs with customRanges when opening or when ranges change
  useEffect(() => {
     if (isRangeMenuOpen) {
         if (unit === 'imperial') {
             setInputValues({
                 hMin: customRanges.hMin ? formatImperialHeight(customRanges.hMin) : formatImperialHeight(ranges.hMin),
                 hMax: customRanges.hMax ? formatImperialHeight(customRanges.hMax) : formatImperialHeight(ranges.hMax)
             });
         } else {
             setInputValues({ hMin: '', hMax: '' }); // clear for metric or unused
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
        <div className="flex gap-2 self-end lg:self-auto relative group-range" ref={rangeMenuRef}>
             {/* Custom Range Button */}
             <button
                onClick={() => setIsRangeMenuOpen(!isRangeMenuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all bg-transparent"
                title="Ajustar Rangos"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             </button>

             {/* Popover */}
             {isRangeMenuOpen && (
                 <div className="absolute right-full mr-2 top-0 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-50 w-64">
                    {/* Error Toast inside Popover */}
                    {errorMsg && (
                        <div className="absolute bottom-full mb-2 left-0 w-full bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold text-center z-50 animate-bounce">
                           {errorMsg}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                         <div className="flex flex-col gap-1">
                             <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.weight')} Min ({unit === 'metric' ? 'kg' : 'lb'})</label>
                             <DelayedInput 
                                 className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                                 placeholder={ranges.wMin}
                                 value={customRanges.wMin}
                                 onCommit={(val) => handleCustomRangeChange('wMin', val)}
                             />
                         </div>
                         <div className="flex flex-col gap-1">
                             <label className="text-[10px] text-slate-400 font-bold uppercase">{t('common.weight')} Max ({unit === 'metric' ? 'kg' : 'lb'})</label>
                             <DelayedInput 
                                 className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
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
                                     className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                                     placeholder={ranges.hMin}
                                     value={customRanges.hMin}
                                     onCommit={(val) => handleCustomRangeChange('hMin', val)}
                                 />
                             ) : (
                                 <input 
                                     type="text"
                                     className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
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
                                     className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                                     placeholder={ranges.hMax}
                                     value={customRanges.hMax}
                                     max={ABS_LIMITS.hMax}
                                     onCommit={(val) => handleCustomRangeChange('hMax', val, ABS_LIMITS.hMax)}
                                 />
                             ) : (
                                 <input 
                                     type="text"
                                     className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                                     placeholder={formatImperialHeight(ranges.hMax)}
                                     value={inputValues.hMax}
                                     onChange={(e) => setInputValues({...inputValues, hMax: e.target.value.replace(/[.,]/g, "'")})}
                                     onBlur={(e) => handleImperialBlur('hMax', e.target.value, ABS_LIMITS.hMax)}
                                     onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                 />
                             )}
                         </div>
                     </div>
                 </div>
             )}

             <button 
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all bg-transparent"
              title="Reducir"
            >
              -
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all bg-transparent"
              title="Aumentar"
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
