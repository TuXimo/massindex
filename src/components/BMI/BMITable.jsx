import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSliderRanges } from '../../utils/bmiUtils';

export default function BMITable({ userWeight, userHeight, unit = 'metric', onSelect, userConfig = {} }) {
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

  // Range definitions
  const wMin = ranges?.wMin || (unit === 'metric' ? 40 : 90);
  const wMax = ranges?.wMax || (unit === 'metric' ? 160 : 350);
  const hMin = ranges?.hMin || (unit === 'metric' ? 140 : 55);
  const hMax = ranges?.hMax || (unit === 'metric' ? 220 : 87);

  const currentWeight = userWeight ? parseFloat(userWeight) : null;
  const currentHeight = userHeight ? parseFloat(userHeight) : null;

  // Clamping for Highlight
  // If value is out of bounds, clamp to the nearest edge (min or max)
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
    for (let i = wMin; i <= wMax; i += step) w.push(i);
    // Only insert EXACT current value if it is within bounds and not already present
    if (currentWeight && !w.includes(currentWeight) && currentWeight >= wMin && currentWeight <= wMax) {
      w.push(currentWeight);
    }
    return w.sort((a, b) => a - b);
  })();

  const heights = (() => {
    const h = [];
    const step = unit === 'metric' ? 5 : 2;
    for (let i = hMin; i <= hMax; i += step) h.push(i);
    if (currentHeight && !h.includes(currentHeight) && currentHeight >= hMin && currentHeight <= hMax) {
      h.push(currentHeight);
    }
    return h.sort((a, b) => a - b);
  })();

  const calculateCellBMI = (weight, height) => {
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
        <div className="flex gap-2 self-end lg:self-auto">
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
