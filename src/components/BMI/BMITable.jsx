import { useRef, useEffect, useState } from 'react';

export default function BMITable({ userWeight, userHeight }) {
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const weights = (() => {
    const w = [];
    for (let i = 40; i <= 160; i += 5) w.push(i);
    if (userWeight && !w.includes(userWeight) && userWeight >= 40 && userWeight <= 160) {
      w.push(userWeight);
    }
    return w.sort((a, b) => a - b);
  })();

  const heights = (() => {
    const h = [];
    for (let i = 140; i <= 220; i += 5) h.push(i);
    if (userHeight && !h.includes(userHeight) && userHeight >= 140 && userHeight <= 220) {
      h.push(userHeight);
    }
    return h.sort((a, b) => a - b);
  })();

  const calculateCellBMI = (weight, height) => {
    const hM = height / 100;
    return (weight / (hM * hM)).toFixed(1);
  };

  const isHighlighted = (w, h) => {
    if (!userWeight || !userHeight) return false;
    return w === userWeight && h === userHeight;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (userWeight && userHeight) {
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
  }, [userWeight, userHeight, zoomLevel]);

  return (
    <div className="w-full max-w-full overflow-hidden p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
      <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-6">
        <h3 className="font-black text-xl uppercase">
          Tabla de Referencia
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
      
      <div className="w-full overflow-auto border-r-2 border-b-2 border-black max-h-[500px] scrollbar-hide relative" ref={containerRef}>
          <table className="w-full text-xs text-center border-collapse border-2 border-black" style={{ fontSize: `${0.6 * zoomLevel}rem` }}>
            <thead>
              <tr>
                <th 
                  style={{ width: `${2.25 * zoomLevel}rem`, minWidth: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                  className="p-1 border-2 border-black bg-black text-white font-bold sticky left-0 top-0 z-50 leading-3"
                >
                  ALT \ PESO
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
                    {h}
                  </td>
                  {weights.map((w) => {
                    const bmi = calculateCellBMI(w, h);
                    const active = isHighlighted(w, h);
                    return (
                      <td 
                        key={`${h}-${w}`} 
                        id={active ? "active-bmi-cell" : undefined}
                        style={{ width: `${2.25 * zoomLevel}rem`, height: `${2.25 * zoomLevel}rem` }}
                        className={`p-1 border border-black font-medium ${
                          active 
                            ? 'bg-black text-white font-black ring-2 ring-black relative z-10' 
                            : 'bg-white hover:bg-gray-100'
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
