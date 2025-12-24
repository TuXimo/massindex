import { useRef, useEffect, useState } from 'react';

export default function BMITable({ userWeight, userHeight, unit = 'metric', onSelect }) {
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

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

  const currentWeight = userWeight;
  const currentHeight = userHeight;

  const weights = (() => {
    const w = [];
    if (unit === 'metric') {
        for (let i = 40; i <= 160; i += 5) w.push(i);
        if (currentWeight && !w.includes(currentWeight) && currentWeight >= 40 && currentWeight <= 160) {
          w.push(currentWeight);
        }
    } else {
        // Imperial: roughly 90lbs (40kg) to 350lbs (160kg)
        for (let i = 90; i <= 350; i += 10) w.push(i);
        if (currentWeight && !w.includes(currentWeight) && currentWeight >= 90 && currentWeight <= 350) {
           w.push(currentWeight);
        }
    }
    return w.sort((a, b) => a - b);
  })();

  const heights = (() => {
    const h = [];
    if (unit === 'metric') {
        for (let i = 140; i <= 220; i += 5) h.push(i);
        if (currentHeight && !h.includes(currentHeight) && currentHeight >= 140 && currentHeight <= 220) {
          h.push(currentHeight);
        }
    } else {
        // Imperial: 55 inches (4'7") to 87 inches (7'3")
        for (let i = 55; i <= 87; i += 2) h.push(i);
        if (currentHeight && !h.includes(currentHeight) && currentHeight >= 55 && currentHeight <= 87) {
           h.push(currentHeight);
        }
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
    if (!currentWeight || !currentHeight) return false;
    return w === currentWeight && h === currentHeight;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (currentWeight && currentHeight) {
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
  }, [currentWeight, currentHeight, zoomLevel]); // Depend on converted values

  return (
    <div className="w-full max-w-full overflow-hidden p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
      <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-6">
        <h3 className="font-black text-xl uppercase">
          Tabla de Referencia {unit === 'imperial' && '(Imperial)'}
        </h3>
        <div className="flex gap-2">

            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="w-8 h-8 flex items-center justify-center border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
              title="Reducir"
            >
              -
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
              className="w-8 h-8 flex items-center justify-center border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
              title="Aumentar"
            >
              +
            </button>
        </div>
      </div>
      
      <div 
        className={`w-full overflow-auto border-r-2 border-b-2 border-black max-h-[500px] scrollbar-hide relative ${isDragging ? 'cursor-grabbing' : ''}`} 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
          <table className="w-full text-xs text-center border-collapse border-2 border-black" style={{ fontSize: `${0.6 * zoomLevel}rem` }}>
            <thead>
              <tr>
                <th 
                  style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                  className="p-1 border-2 border-black bg-black text-white font-bold sticky left-0 top-0 z-50 leading-3"
                >
                  {unit === 'metric' ? 'ALT \\ PESO' : 'HGT \\ WGT'}
                </th>
                {weights.map((w) => (
                  <th 
                    key={w} 
                    style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                    className="p-1 border-2 border-black bg-black text-white font-bold sticky top-0 z-40"
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heights.map((h) => (
                <tr key={h}>
                  <td 
                    style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                    className="p-1 border-2 border-black bg-black text-white font-bold sticky left-0 z-30"
                  >
                    {formatHeight(h)}
                  </td>
                  {weights.map((w) => {
                    const bmi = calculateCellBMI(w, h);
                    const active = isHighlighted(w, h);

                    const getBMIColor = (val) => {
                      const v = parseFloat(val);
                      if (v < 18.5) return 'bg-blue-200';
                      if (v < 25) return 'bg-green-200';
                      if (v < 30) return 'bg-yellow-200';
                      if (v < 35) return 'bg-orange-200';
                      if (v < 40) return 'bg-red-200';
                      return 'bg-red-400';
                    };

                    return (
                      <td 
                        key={`${h}-${w}`} 
                        id={active ? "active-bmi-cell" : undefined}
                        onDoubleClick={() => onSelect && onSelect(w, h)}
                        style={{ width: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                        className={`p-1 border border-black font-medium select-none ${
                          active 
                            ? 'bg-black text-white font-black ring-2 ring-black relative z-10' 
                            : `${getBMIColor(bmi)} hover:bg-white hover:z-10 relative`
                        }`}
                      >
                        {bmi}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-center">
        * Encuentra la intersección de tu altura y peso.
      </div>
    </div>
  );
}
