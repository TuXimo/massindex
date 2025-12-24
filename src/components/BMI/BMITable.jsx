import { useRef, useEffect } from 'react';

export default function BMITable({ userWeight, userHeight }) {
  const containerRef = useRef(null);

  const weights = [];
  for (let w = 40; w <= 160; w += 5) {
    weights.push(w);
  }

  const heights = [];
  for (let h = 140; h <= 220; h += 5) {
    heights.push(h);
  }

  const calculateCellBMI = (weight, height) => {
    const hM = height / 100;
    return (weight / (hM * hM)).toFixed(1);
  };

  const isHighlighted = (w, h) => {
    if (!userWeight || !userHeight) return false;
    // Find the closest step (multiple of 5)
    const closestWeight = Math.round(userWeight / 5) * 5;
    const closestHeight = Math.round(userHeight / 5) * 5;
    return w === closestWeight && h === closestHeight;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (userWeight && userHeight) {
      const activeCell = document.getElementById('active-bmi-cell');
      if (activeCell && containerRef.current) {
         // Smooth scroll to the active cell
         activeCell.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
         });
      }
    }
  }, [userWeight, userHeight]);

  return (
    <div className="w-full max-w-full overflow-hidden p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Tabla de Referencia
      </h3>
      
      <div className="w-full overflow-x-auto border-r-2 border-black" ref={containerRef}>
          <table className="w-full text-xs text-center border-collapse border-2 border-black">
            <thead>
              <tr>
                <th className="p-1 border-2 border-black bg-black text-white font-bold sticky left-0 z-10 h-9 w-9 min-w-[2.25rem] text-[0.6rem] leading-3">
                  ALT \ PESO
                </th>
                {weights.map((w) => (
                  <th key={w} className="p-1 border-2 border-black bg-black text-white font-bold min-w-[2.25rem] h-9 w-9 text-xs">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heights.map((h) => (
                <tr key={h}>
                  <td className="p-1 border-2 border-black bg-black text-white font-bold sticky left-0 z-10 h-9 w-9 min-w-[2.25rem] text-xs">
                    {h}
                  </td>
                  {weights.map((w) => {
                    const bmi = calculateCellBMI(w, h);
                    const active = isHighlighted(w, h);
                    return (
                      <td 
                        key={`${h}-${w}`} 
                        id={active ? "active-bmi-cell" : undefined}
                        className={`p-1 border border-black font-medium h-9 w-9 text-[0.65rem] ${
                          active 
                            ? 'bg-black text-white font-black ring-2 ring-black relative z-20' 
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
