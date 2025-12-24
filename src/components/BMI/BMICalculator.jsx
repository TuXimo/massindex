
export default function BMICalculator({ weight, height, setWeight, setHeight }) {
  
  // No submit handler needed as we update parent state directly

  const handleManualInput = (setter) => (e) => {
    let value = e.target.value;
    
    // Allow empty string for better UX while deleting
    if (value === '') {
        setter('');
        return;
    }

    // Remove leading zeros unless it's a decimal starting with 0 (e.g. 0.5)
    if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
       value = value.replace(/^0+/, '');
    }

    setter(value);
  };

  const handleBlur = (setter, min, max, value) => () => {
      const num = parseFloat(value);
      // Min limit or NaN -> Min
      if (isNaN(num) || num < min) {
          setter(min);
      } else if (num > max) { 
          // Max limit
          setter(max);
      }
  };

  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 h-full">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Calculadora
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={handleManualInput(setWeight)}
            onBlur={handleBlur(setWeight, 0, 650, weight)}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder="70"
            required
            min="0"
            max="650"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Altura (cm)</label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={handleManualInput(setHeight)}
            onBlur={handleBlur(setHeight, 0, 272, height)}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder="175"
            required
            min="0"
            max="272"
          />
        </div>
      </div>
      
       <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
           <p className="text-xs font-bold text-gray-500 uppercase text-center mb-3">Fórmula</p>
           <div className="bg-gray-100 p-3 border-2 border-black text-center">
             <span className="font-black text-lg block">IMC = Peso / Altura²</span>
             <span className="text-xs font-bold text-gray-500 block mt-1">(kg / m²)</span>
           </div>
       </div>

        <div className="mt-6 text-xs text-center font-bold text-gray-500 uppercase">
          * Los resultados se actualizan automáticamente
       </div>
    </div>
  );
}
