import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSliderRanges } from '../../utils/bmiUtils';
import BMIReferenceTable from './BMIReferenceTable';


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
        return window.innerWidth < 1024 ? 1.4 : 1;
    }
    return 1;
  });

  useEffect(() => {
    localStorage.setItem('table_zoom', zoomLevel);
  }, [zoomLevel]);

  useEffect(() => {
    localStorage.setItem('table_zoom', zoomLevel);
  }, [zoomLevel]);

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return window.innerWidth < 1024 ? 'list' : 'grid';
    }
    return 'grid';
  });




  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);
  const lastProps = useRef({ w: userWeight, h: userHeight, u: unit });
  const highlightTimerRef = useRef(null);
  const lastTapRef = useRef(0); // Track tap timing for custom double-tap
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
        return window.innerWidth >= 1024;
    }
    return true;
  });

  const handleCellInteraction = (w, h) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
       triggerHighlight();
       if (onSelect) onSelect(w, h);
       lastTapRef.current = 0;
    } else {
       lastTapRef.current = now;
    }
  };

  // Recalculate ranges for table consistently with sliders
  const ranges = useMemo(() => {
     return getSliderRanges(unit, userConfig?.mode, userConfig?.age);
  }, [unit, userConfig?.mode, userConfig?.age]);

  const triggerHighlight = () => {
    // Disable highlight animation on mobile/tablet to reduce visual noise
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    
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
      // Force scroll on both mobile and desktop if needed
      
      const activeCell = document.getElementById('active-bmi-cell');
      if (activeCell && containerRef.current) {
         const container = containerRef.current;
         const cellTop = activeCell.offsetTop;
         const cellLeft = activeCell.offsetLeft;
         const cellHeight = activeCell.offsetHeight;
         const cellWidth = activeCell.offsetWidth;
         
         // Sticky offset calculation (approx 2.25rem * zoom)
         const rem = 16; // Assumption
         const stickyOffset = 2.25 * zoomLevel * rem;

         // Viewport boundaries (accounting for sticky headers)
         const visibleTop = container.scrollTop + stickyOffset;
         const visibleBottom = container.scrollTop + container.clientHeight;
         const visibleLeft = container.scrollLeft + stickyOffset;
         const visibleRight = container.scrollLeft + container.clientWidth;

         const isVerticallyVisible = cellTop >= visibleTop && (cellTop + cellHeight) <= visibleBottom;
         const isHorizontallyVisible = cellLeft >= visibleLeft && (cellLeft + cellWidth) <= visibleRight;

         if (!isVerticallyVisible || !isHorizontallyVisible) {
            // Scroll to center, but ensure we don't put it *under* the sticky header if centering puts it high
            // Actually centering usually handles it, but let's be robust.
            // Center target:
            let targetTop = cellTop - (container.clientHeight / 2) + (cellHeight / 2);
            let targetLeft = cellLeft - (container.clientWidth / 2) + (cellWidth / 2);

            container.scrollTo({
              top: targetTop,
              left: targetLeft,
              behavior: 'smooth'
            });
         }
      }
    }
  }, [highlightWeight, highlightHeight, zoomLevel, isExpanded]);

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
      <div className="w-full max-w-full p-6 bg-bmi-card backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl relative group transition-all duration-300 hover:shadow-2xl hover:border-slate-700 hover:bg-bmi-card/60">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-700 pb-2 mb-6 gap-4 lg:gap-0">
        <div className="flex justify-between items-center w-full lg:w-auto">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1">
                <h3 className="font-bold text-xl uppercase text-white tracking-wider flex items-baseline gap-2 shrink-0 flex-wrap">
                  {userConfig?.mode === 'child' ? t('table.pediatric') : t('table.reference')} 
                  {unit === 'imperial' && <span className="text-bmi-muted text-sm whitespace-nowrap">{t('table.imperial')}</span>}
                  {unit === 'metric' && <span className="text-bmi-muted text-sm whitespace-nowrap">{t('table.metric')}</span>}
                </h3>
                {userConfig?.mode === 'child' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-bmi-accent uppercase opacity-90 mt-1 sm:mt-0">
                        <span className="bg-bmi-accent/10 px-2 py-1 rounded border border-bmi-accent/20 whitespace-nowrap">
                            {userConfig.age} {t('table.years')}
                        </span>
                        <span className="bg-bmi-accent/10 px-2 py-1 rounded border border-bmi-accent/20 whitespace-nowrap">
                            {userConfig.gender === 'male' ? 'M' : 'F'}
                        </span>
                    </div>
                )}
            </div>

            {/* Mobile Toggle (Chevron) - Discrete */}
            <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors shrink-0 ml-2 rounded-full active:bg-slate-800/50 outline-none"
               title={isExpanded ? "Collapse" : "Expand"}
            >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                 </svg>
            </button>
        </div>
        
        
        



        {isExpanded && (
        <div className="flex items-center rounded-lg p-1 self-end lg:ml-auto gap-1 relative z-[80]">
             {/* Group 1: Settings (Hidden for Children AND List Mode) */}
             {userConfig?.mode !== 'child' && viewMode === 'grid' && (
                  <div className="relative group-range flex items-center" ref={rangeMenuRef}>
                     <button
                         onClick={() => setIsRangeMenuOpen(!isRangeMenuOpen)}
                         className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 bg-[#1a1a1a] hover:bg-slate-800 transition-all"
                         title={t('table.settings')}
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', stroke: '#ffffff' }} className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <line x1="4" x2="20" y1="12" y2="12"/>
                             <line x1="4" x2="20" y1="6" y2="6"/>
                             <line x1="4" x2="20" y1="18" y2="18"/>
                             <circle cx="15" cy="12" r="2" fill="currentColor"/>
                             <circle cx="9" cy="6" r="2" fill="currentColor"/>
                             <circle cx="17" cy="18" r="2" fill="currentColor"/>
                         </svg>
                     </button>
                     
                     {isRangeMenuOpen && (
                         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:block">
                             <div className="w-full max-w-sm bg-[#070F13] border border-slate-700 rounded-xl shadow-2xl overflow-hidden lg:w-64 lg:rounded-lg lg:scale-100 animate-in fade-in zoom-in-95 duration-200">
                                  
                                  {/* Mobile Header */}
                                  <div className="flex justify-between items-center p-4 border-b border-slate-800 lg:hidden">
                                     <h3 className="font-bold text-white uppercase tracking-wider text-sm">{t('table.ranges')}</h3>
                                     <button onClick={() => setIsRangeMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                     </button>
                                  </div>

                                  <div className="p-4 lg:p-3">
                                      {/* Error Toast */}
                                      {errorMsg && (
                                         <div className="mb-3 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold text-center animate-bounce">
                                            {errorMsg}
                                         </div>
                                      )}
                                      
                                      {/* Ranges Section */}
                                      <h4 className="text-xs font-bold text-bmi-muted uppercase mb-3 border-b border-slate-700 pb-1 hidden lg:block">{t('table.ranges')}</h4>
                                      <div className="grid grid-cols-2 gap-3 mb-2">
                                           <div className="flex flex-col gap-1">
                                               <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.weight')} {t('table.min')} ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                               <DelayedInput 
                                                   className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                   placeholder={ranges.wMin}
                                                   value={customRanges.wMin}
                                                   onCommit={(val) => handleCustomRangeChange('wMin', val)}
                                               />
                                           </div>
                                           <div className="flex flex-col gap-1">
                                               <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.weight')} {t('table.max')} ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                               <DelayedInput 
                                                   className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                   placeholder={ranges.wMax}
                                                   value={customRanges.wMax}
                                                   max={ABS_LIMITS.wMax}
                                                   onCommit={(val) => handleCustomRangeChange('wMax', val, ABS_LIMITS.wMax)}
                                               />
                                           </div>
                                           <div className="flex flex-col gap-1">
                                               <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.height')} {t('table.min')} ({unit === 'metric' ? 'cm' : 'in'})</label>
                                               {unit === 'metric' ? (
                                                   <DelayedInput 
                                                       className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                       placeholder={ranges.hMin}
                                                       value={customRanges.hMin}
                                                       onCommit={(val) => handleCustomRangeChange('hMin', val)}
                                                   />
                                               ) : (
                                                   <input 
                                                       type="text"
                                                       inputMode="decimal"
                                                       className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                       placeholder={formatImperialHeight(ranges.hMin)}
                                                       value={inputValues.hMin}
                                                       onChange={(e) => setInputValues({...inputValues, hMin: e.target.value.replace(/[.,]/g, "'")})}
                                                       onBlur={(e) => handleImperialBlur('hMin', e.target.value)}
                                                       onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                                   />
                                               )}
                                           </div>
                                            <div className="flex flex-col gap-1">
                                               <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.height')} {t('table.max')} ({unit === 'metric' ? 'cm' : 'in'})</label>
                                               {unit === 'metric' ? (
                                                   <DelayedInput 
                                                       className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                       placeholder={ranges.hMax}
                                                       value={customRanges.hMax}
                                                       max={ABS_LIMITS.hMax}
                                                       onCommit={(val) => handleCustomRangeChange('hMax', val, ABS_LIMITS.hMax)}
                                                   />
                                               ) : (
                                                   <input 
                                                       type="text"
                                                       inputMode="decimal"
                                                       className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
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
                                          <h4 className="text-xs font-bold text-bmi-muted uppercase mb-3 border-b border-slate-700 pb-1">{t('table.intervals')}</h4>
                                          <div className="grid grid-cols-2 gap-3 mb-1">
                                             <div className="flex flex-col gap-1">
                                                 <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.weight')} ({unit === 'metric' ? 'kg' : 'lb'})</label>
                                                 <DelayedInput 
                                                     className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                     placeholder={effectiveRanges.wStep}
                                                     value={customRanges.wStep}
                                                     onCommit={(val) => handleStepChange('wStep', val, 0.5, 10)}
                                                 />
                                                 <span className="text-[9px] text-slate-500">{t('table.limits', { min: 0.5, max: 10 })}</span>
                                             </div>
                                             <div className="flex flex-col gap-1">
                                                 <label className="text-[10px] text-bmi-muted font-bold uppercase">{t('common.height')} ({unit === 'metric' ? 'cm' : 'in'})</label>
                                                 {unit === 'metric' ? (
                                                     <DelayedInput 
                                                         className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                         placeholder={effectiveRanges.hStep}
                                                         value={customRanges.hStep}
                                                         onCommit={(val) => handleStepChange('hStep', val, 0.5, 10)}
                                                      />
                                                 ) : (
                                                     <input 
                                                         type="text"
                                                         inputMode="decimal"
                                                         className="w-full bg-bmi-input border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-bmi-accent outline-none"
                                                         placeholder={formatImperialHeight(effectiveRanges.hStep)}
                                                         value={inputValues.hStep || customRanges.hStep}
                                                         onChange={(e) => {
                                                              const val = e.target.value.replace(/[.,]/g, "'");
                                                              setInputValues(prev => ({...prev, hStep: val}));
                                                         }}
                                                         onBlur={(e) => handleImperialBlur('hStep', e.target.value, 5, true)}
                                                         onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                                     />
                                                 )}
                                                 <span className="text-[9px] text-slate-500">{unit === 'metric' ? t('table.limits', { min: 0.5, max: 10 }) : t('table.limits', { min: "0'1\"", max: "0'5\"" })}</span>
                                             </div>
                                          </div>
                                      </div>
                                  </div>
                             </div>
                         </div>
                     )}
                     
                     <div className="h-6 w-px bg-slate-800/50 mx-2 hidden lg:block"></div>
                  </div>
             )}

             {/* Group 2: Zoom Controls */}
             {viewMode === 'grid' && (
             <div className="flex items-center">
                  <button 
                    onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 bg-[#1a1a1a] hover:bg-slate-800 transition-all mr-1"
                    title={t('table.zoomOut')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', stroke: '#ffffff' }} className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                        <line x1="8" x2="14" y1="11" y2="11"/>
                    </svg>
                  </button>
                  <button 
                    onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 bg-[#1a1a1a] hover:bg-slate-800 transition-all"
                    title={t('table.zoomIn')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', stroke: '#ffffff' }} className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                        <line x1="11" x2="11" y1="8" y2="14"/>
                        <line x1="8" x2="14" y1="11" y2="11"/>
                    </svg>
                  </button>
                  <div className="h-6 w-px bg-slate-800/50 mx-2 hidden lg:block"></div>
             </div>
             )}

             {/* Group 3: View Mode Toggle (Now on Far Right) */}
             <div className="flex items-center">
                 <button
                   onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                   className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                       viewMode === 'list' ? 'bg-slate-800 border-slate-600 shadow-inner' : 'border-slate-600 bg-[#1a1a1a] hover:bg-slate-800'
                   }`}
                   title={viewMode === 'grid' ? "Ver lista de referencia" : "Ver tabla detallada"}
                 >
                    {viewMode === 'grid' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', stroke: '#ffffff' }} className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <line x1="8" x2="21" y1="6" y2="6"/>
                           <line x1="8" x2="21" y1="12" y2="12"/>
                           <line x1="8" x2="21" y1="18" y2="18"/>
                           <line x1="3" x2="3.01" y1="6" y2="6"/>
                           <line x1="3" x2="3.01" y1="12" y2="12"/>
                           <line x1="3" x2="3.01" y1="18" y2="18"/>
                       </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', stroke: '#ffffff' }} className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                    )}
                 </button>
             </div>
        </div>
        )}



      </div>
      
       {isExpanded && viewMode === 'list' && (
           <BMIReferenceTable bmi={calculateCellBMI(userWeight, userHeight)} />
       )}

       {isExpanded && viewMode === 'grid' && (
       <>
       <div 
         className={`w-full overflow-auto rounded-xl border border-slate-700/50 aspect-square lg:aspect-auto max-h-[500px] scrollbar-hide relative ${isDragging ? 'cursor-grabbing' : ''}`} 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
          <table className="w-full text-xs text-center border-separate border-spacing-[2px]" style={{ fontSize: `${0.85 * zoomLevel}rem` }}>
            <thead>
              <tr>
                <th 
                  style={{ width: `${3.2 * zoomLevel}rem`, minWidth: `${3.2 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                  className="p-1 bg-[#050a09] text-bmi-muted font-bold sticky left-0 top-0 z-[60] leading-3 shadow-md border-b border-transparent"
                >
                  {unit === 'metric' ? t('table.headers.metric') : t('table.headers.imperial')}
                </th>
                {weights.map((w) => {
                   const isColActive = showHighlight && highlightWeight === w;
                   return (
                    <th 
                      key={w} 
                      style={{ width: `${3.2 * zoomLevel}rem`, minWidth: `${3.2 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                      className={`p-1 font-bold sticky top-0 z-[50] transition-all duration-300 relative ${isColActive ? 'bg-slate-800 text-bmi-accent shadow-md' : 'bg-[#050a09] text-bmi-muted'}`}
                    >
                      {isColActive && (
                          <div className="absolute top-0 left-1 right-1 h-[4px] bg-bmi-accent rounded-b-full shadow-[0_0_10px_rgba(46,189,94,0.5)]"></div>
                      )}
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
                      style={{ width: `${3.2 * zoomLevel}rem`, minWidth: `${3.2 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                      className={`p-1 font-bold sticky left-0 z-[40] transition-all duration-300 shadow-md relative group-row ${isRowActive ? 'bg-slate-800 text-bmi-accent' : 'bg-[#050a09] text-bmi-muted'}`}
                    >
                      {isRowActive && (
                          <div className="absolute left-0 top-1 bottom-1 w-[4px] bg-bmi-accent rounded-r-full shadow-[0_0_10px_rgba(46,189,94,0.5)]"></div>
                      )}
                      {formatHeight(h)}
                    </td>
                    {weights.map((w) => {
                      const bmi = calculateCellBMI(w, h);
                      const isColActive = showHighlight && highlightWeight === w;
                      const active = isHighlighted(w, h);
                      
                      const getBMIColorClass = (val) => {
                        const v = parseFloat(val);
                        if (v < 18.5) return 'bg-blue-500'; 
                        if (v < 25) return 'bg-green-500'; 
                        if (v < 30) return 'bg-yellow-500'; 
                        if (v < 35) return 'bg-orange-500'; 
                        if (v < 40) return 'bg-red-500'; 
                        return 'bg-red-700'; 
                      };

                      const colorClass = getBMIColorClass(bmi);
                      
                      let cellStateClasses = `${colorClass} text-white font-bold rounded-md`;
                      
                      if (active) {
                          // precise intersection
                          cellStateClasses = "bg-white text-slate-900 font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.6)] z-20 scale-110 rounded-lg transform duration-200 border-2 border-transparent";
                      } else if (isRowActive || isColActive) {
                          // In the crosshair - pop slightly but keep color
                          cellStateClasses = `${colorClass} text-white font-bold brightness-110 scale-105 z-10 rounded-md shadow-sm`; 
                      } else if (showHighlight) {
                          // Background noise - dim it
                          cellStateClasses += " opacity-30 grayscale-[0.3] scale-95 blur-[0.5px] transition-all duration-500";
                      } else {
                          // Standard idle
                          cellStateClasses += " transition-transform duration-200 hover:scale-105 hover:brightness-110 hover:shadow-lg hover:z-10";
                      }

                      return (
                        <td 
                          key={`${h}-${w}`} 
                          id={active ? "active-bmi-cell" : undefined}
                          onClick={() => handleCellInteraction(w, h)}
                          style={{ width: `${3.2 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem`, touchAction: 'manipulation' }}
                          className={`cursor-pointer select-none outline-none relative ${cellStateClasses}`}
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
       </>
       )}
    </div>
  );
}
