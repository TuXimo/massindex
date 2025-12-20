
export default function BMITable({ userWeight, userHeight }) {
  const weights = [];
  for (let w = 40; w <= 120; w += 5) {
    weights.push(w);
  }

  const heights = [];
  for (let h = 150; h <= 200; h += 5) {
    heights.push(h);
  }

  const calculateCellBMI = (weight, height) => {
    const hM = height / 100;
    return (weight / (hM * hM)).toFixed(1);
  };

  const isHighlighted = (w, h) => {
    if (!userWeight || !userHeight) return false;
    const weightDiff = Math.abs(userWeight - w);
    const heightDiff = Math.abs(userHeight - h);
    return weightDiff < 2.5 && heightDiff < 2.5; 
  };

  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Tabla de Referencia
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse border-2 border-black">
          <thead>
            <tr>
              <th className="p-2 border-2 border-black bg-black text-white font-bold sticky left-0 z-10">
                ALT \ PESO
              </th>
              {weights.map((w) => (
                <th key={w} className="p-2 border-2 border-black bg-black text-white font-bold min-w-[50px]">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heights.map((h) => (
              <tr key={h}>
                <td className="p-2 border-2 border-black bg-black text-white font-bold sticky left-0 z-10">
                  {h}
                </td>
                {weights.map((w) => {
                  const bmi = calculateCellBMI(w, h);
                  const active = isHighlighted(w, h);
                  return (
                    <td 
                      key={`${h}-${w}`} 
                      className={`p-2 border border-black font-medium ${
                        active 
                          ? 'bg-black text-white font-black text-base ring-2 ring-black relative z-20' 
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
