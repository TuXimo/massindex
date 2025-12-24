
import { useState, useEffect } from 'react';

// Helper Component for Imperial Input to handle format state
const ImperialHeightInput = ({ inches, onChange, min, max }) => {
  const [localVal, setLocalVal] = useState('');
  
  // Helpers
  const format = (val) => {
    if (!val) return '';
    const feet = Math.floor(val / 12);
    const inc = Math.round(val % 12);
    if (inc === 12) return `${feet + 1}'0"`;
    return `${feet}'${inc}"`;
  };

  useEffect(() => {
     setLocalVal(format(inches));
  }, [inches]);

  const handleBlur = () => {
     let val = localVal;
     let parsed = null;

     const ftInMatch = val.match(/(\d+)'\s*(\d+)/);
     const decimalMatch = val.match(/^(\d+)[\.,](\d+)$/);

     if (ftInMatch) {
        parsed = parseInt(ftInMatch[1]) * 12 + parseInt(ftInMatch[2]);
     } else if (decimalMatch) {
        // Heuristic: 5.3 -> 5'3"
        const feet = parseInt(decimalMatch[1]);
        const inches = parseInt(decimalMatch[2]);
        if (feet < 9) {
            parsed = feet * 12 + inches;
        } else {
            parsed = parseFloat(val.replace(',', '.'));
        }
     } else {
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
             if (num < 10) {
               parsed = num * 12; // treat as feet
           } else {
               parsed = num; // inches
           }
        }
     }

     if (parsed !== null && !isNaN(parsed)) {
        if (parsed < min) parsed = min;
        if (parsed > max) parsed = max;
        onChange(parsed);
        setLocalVal(format(parsed));
     } else {
        setLocalVal(format(inches));
     }
  };

  return (
      <input
        type="text" 
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
        placeholder="5'9&quot;"
      />
  );
};

export default function BMICalculator({ weight, height, setWeight, setHeight, unit = 'metric' }) {
  
  // No submit handler needed as we update parent state directly

  const handleManualInput = (setter) => (e) => {
    let value = e.target.value;
    
    // Auto-replace comma with dot
    value = value.replace(',', '.');
    
    // Allow strictly digits and one dot
    if (/[^0-9.]/.test(value)) return;
    if ((value.match(/\./g) || []).length > 1) return;

    if (value === '') {
        setter('');
        return;
    }

    // Remove leading zeros
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

  // Limits based on unit
  const limits = unit === 'metric' 
    ? { weightMax: 650, heightMax: 272 }
    : { weightMax: 1433, heightMax: 107 }; // approx 650kg / 272cm

  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 h-full">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Calculadora
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Peso ({unit === 'metric' ? 'kg' : 'lb'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={handleManualInput(setWeight)}
            onBlur={handleBlur(setWeight, 0, limits.weightMax, weight)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder={unit === 'metric' ? "70" : "150"}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Altura ({unit === 'metric' ? 'cm' : 'in'})</label>
          {unit === 'metric' ? (
              <input
                type="text"
                inputMode="decimal"
                value={height}
                onChange={handleManualInput(setHeight)}
                onBlur={handleBlur(setHeight, 0, limits.heightMax, height)}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
                placeholder="175"
                required
              />
          ) : (
              <ImperialHeightInput 
                 inches={height}
                 onChange={setHeight}
                 min={0}
                 max={limits.heightMax}
              />
          )}
        </div>
      </div>
      
       <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
           <p className="text-xs font-bold text-gray-500 uppercase text-center mb-3">Fórmula</p>
           <div className="bg-gray-100 p-3 border-2 border-black text-center">
             <span className="font-black text-lg block">
                {unit === 'metric' ? 'IMC = Peso / Altura²' : 'IMC = 703 × Peso / Altura²'}
             </span>
             <span className="text-xs font-bold text-gray-500 block mt-1">
                {unit === 'metric' ? '(kg / m²)' : '(lb / in²)'}
             </span>
           </div>
       </div>

        <div className="mt-6 text-xs text-center font-bold text-gray-500 uppercase">
          * Los resultados se actualizan automáticamente
       </div>
    </div>
  );
}
