import { useState, useEffect } from 'react';

// Helper Component for Imperial Input to handle format state
const ImperialHeightInput = ({ inches, onChange, min, max }) => {
  const [localVal, setLocalVal] = useState('');
  
  // Helpers
  const format = (val) => {
    if (!val) return '';
    const feet = Math.floor(val / 12);
    const inc = Math.round(val % 12);
    // If rounded inches is 12, bump feet (edge case)
    if (inc === 12) return `${feet + 1}'0"`;
    return `${feet}'${inc}"`;
  };

  // Sync with parent prop
  useEffect(() => {
     setLocalVal(format(inches));
  }, [inches]);

  const handleBlur = () => {
     // User finished typing, try to parse robustly
     let val = localVal;
     let parsed = null;

     // 1. explicit feet'inches (5'8)
     const ftInMatch = val.match(/(\d+)'\s*(\d+)/);
     
     // 2. decimal/comma format (5.8 or 5,8) -> treat as feet.inches
     // We look for single digit X (1-9) followed by separator and digits Y
     const decimalMatch = val.match(/^(\d+)[\.,](\d+)$/);

     if (ftInMatch) {
        parsed = parseInt(ftInMatch[1]) * 12 + parseInt(ftInMatch[2]);
     } else if (decimalMatch) {
        // Heuristic: 5.3 -> 5'3"
        const feet = parseInt(decimalMatch[1]);
        const inches = parseInt(decimalMatch[2]);
        // reasonable limit for feet usually < 9
        if (feet < 9) {
            parsed = feet * 12 + inches;
        } else {
            // if input is 68.5 -> just inches
            parsed = parseFloat(val.replace(',', '.'));
        }
     } else {
        // Raw number check
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
           // Heuristic: small number (< 8) likely feet? -> 5 -> 5'0"?
           // If user types just "5", is it 5 inches or 5 feet?
           // In height context, 5 inches is impossible. 5 feet (60) is likely.
           // Let's assume < 10 is feet.
           if (num < 10) {
               parsed = num * 12; // treat as feet
           } else {
               parsed = num; // treat as inches
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
        className="w-20 text-center text-xl font-black border-b-2 border-black focus:outline-none focus:bg-gray-100 placeholder-transparent"
      />
  );
};

export default function BMIImage({ weight, height, setWeight, setHeight, unit = 'metric' }) {
  
  // Normalized values for visualization
  const metricWeight = unit === 'metric' ? parseFloat(weight) : parseFloat(weight) / 2.20462;
  const metricHeight = unit === 'metric' ? parseFloat(height) : parseFloat(height) * 2.54;

  // Visualization Logic ...
  const baseRatio = 0.4;
  const currentRatio = (metricWeight && metricHeight) ? (metricWeight / metricHeight) : baseRatio;
  
  let widthScale = 1;
  if (metricWeight && metricHeight) {
     widthScale = 0.5 + (0.5 * (currentRatio / baseRatio)); 
  }
  const heightScale = metricHeight ? (metricHeight / 175) : 1;
  const sliderClasses = "bg-gray-200 rounded-full appearance-none cursor-pointer border-2 border-black accent-black";

  const handleManualInput = (setter, max) => (e) => {
    let value = e.target.value;
    
    // Auto-replace comma with dot for metric convenience
    value = value.replace(',', '.');
    
    // Allow strictly digits and one dot
    if (/[^0-9.]/.test(value)) return;

    // Prevent multiple dots
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
      if (isNaN(num) || num < min) {
          setter(min);
      } else if (num > max) { // Fallback safety
          setter(max);
      }
  };

  // Helpers for Feet/Inches
  const formatFeetInches = (val) => {
    if (!val) return '';
    const feet = Math.floor(val / 12);
    const inches = Math.round(val % 12);
    return `${feet}'${inches}"`;
  };

  const parseFeetInches = (str) => {
    // Try to match 5'8 or 5'8" or 5 8
    const match = str.match(/(\d+)'\s*(\d+)/);
    if (match) {
       return parseInt(match[1]) * 12 + parseInt(match[2]);
    }
    // Fallback: just number (inches)
    return parseFloat(str);
  };

  // Ranges
  const ranges = unit === 'metric' 
    ? { 
        hMin: 140, hMax: 220, hStep: 5,
        wMin: 40, wMax: 160, wStep: 5 
      }
    : {
        hMin: 55, hMax: 87, hStep: 1, // ~140-220 cm (Step 2 means 5'1, 5'3, 5'5...)
        wMin: 90, wMax: 350, wStep: 1 // ~40-160 kg
      };

  const getHeightDisplayValue = () => {
      return unit === 'metric' ? height : formatFeetInches(height);
  };

  const handleHeightChange = (e) => {
      let val = e.target.value;
      if (unit === 'metric') {
          handleManualInput(setHeight, ranges.hMax)(e);
      } else {
          // Allow typing freely, try to parse
          // If valid parse, set it? No, that jumps. 
          // Better UX: strict format or separate fields? 
          // User asked for "5'8"". Let's try to parse on Blur mostly, or if simple format.
          // Actually, standard manual input behavior for text is tricky. 
          // Let's rely on onBlur to fix formatting, but allow typing digits and '
          
          // Strategy: For this inputs, simply allow valid chars.
          const parsed = parseFeetInches(val);
          if (!isNaN(parsed) && parsed > 0) {
              setHeight(parsed);
          }
      }
  };

  // We need a local state for the text input to allow typing "5'"
  // But for now, let's stick to the existing pattern: 
  // The input value must be derived from `height`. 
  // If we type "5'", parsing might fail or return 60.
  // This is complex without a local scratchpad state. 
  // Let's implement a blurred-based parser to avoid fighting the user.
  
  return (
    <div className="flex-col h-full min-h-[500px] flex p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Top Section: Height Slider + Visualization */}
      <div className="flex-1 flex flex-row gap-6 relative min-h-0">
        
        {/* Left: Height Slider (Vertical) */}
        <div className="flex flex-col items-center justify-between h-full py-4 z-10 w-20">
           <label className="text-xs font-bold uppercase mb-4 writing-mode-vertical whitespace-nowrap">
             Altura
           </label>
           <div className="relative flex-1 flex items-center justify-center w-full min-h-[320px]">
              <input
                type="range"
                min={ranges.hMin}
                max={ranges.hMax}
                step={ranges.hStep}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`absolute ${sliderClasses}`}
                style={{ 
                  transform: 'rotate(-90deg)', 
                  width: '300px', // Increased per user request
                  height: '16px', 
                }}
              />
           </div>
           <div className="flex flex-col items-center mt-2 w-full">
               {/* 
                  Switched input type based on unit.
                  For Imperial, we use text to allow 5'8".
                  Logic: On focus/change, user types string. On blur, we parse and set standard height.
                  Problem: `value={height}` will always overwrite with formatted 5'8" on re-render.
                  Solution: We need an "ImperialHeightInput" sub-component or robust handling.
                  Let's use a specialized Input render.
               */}
              {unit === 'metric' ? (
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={height}
                    onChange={handleManualInput(setHeight, ranges.hMax)}
                    onBlur={handleBlur(setHeight, ranges.hMin, ranges.hMax, height)}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    className="w-16 text-center text-xl font-black border-b-2 border-black focus:outline-none focus:bg-gray-100 placeholder-transparent"
                  />
              ) : (
                  <ImperialHeightInput 
                     inches={height} 
                     onChange={setHeight}
                     min={ranges.hMin}
                     max={ranges.hMax}
                  />
              )}
              <span className="text-xs font-bold">{unit === 'metric' ? 'cm' : 'ft/in'}</span>
           </div>
        </div>

        {/* Center: Human Visualization */}
        <div className="flex-1 flex items-end justify-center relative overflow-hidden pb-4 border-b-2 border-black border-dashed">
           
           {/* Background Grid Lines for Scale reference */}
           <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-col justify-between py-8">
              <div className="w-full border-t-2 border-dashed border-black"></div>
              <div className="w-full border-t-2 border-dashed border-black"></div>
              <div className="w-full border-t-2 border-dashed border-black"></div>
              <div className="w-full border-t-2 border-dashed border-black"></div>
              <div className="w-full border-t-2 border-dashed border-black"></div>
           </div>

           {/* Dynamic SVG */}
           {/* We increase the viewBox size to provide padding so the figure doesn't clip when scaling up */}
           <svg 
             viewBox="-100 -200 400 650" 
             preserveAspectRatio="xMidYMax meet"
             className="h-full w-full transition-all duration-300 ease-out"
           >
             {/* Base scaling group to fit baseline figure comfortably */}
             <g transform="translate(100, 420)">
                 <g 
                    transform={`scale(${widthScale}, ${heightScale})`} 
                    className="transition-transform duration-300"
                 >
                    {/* Drawing is centered at X=0, Feet at Y=0, growing upwards (negative Y) */}
                    
                    {/* Head - Center 0, -330 */}
                    <circle cx="0" cy="-330" r="30" fill="black" />
                    
                    {/* Body Shape */}
                    <path 
                      d="M -40,-290 
                         Q -50,-180 -40,-130 
                         L -30,0 
                         L -10,0 
                         L -10,-120 
                         L 10,-120 
                         L 10,0 
                         L 30,0 
                         L 40,-130 
                         Q 50,-180 40,-290 
                         Z" 
                      fill="black" 
                    />
                    
                    {/* Arms */}
                    <path 
                      d="M -45,-280 Q -80,-230 -75,-160 L -55,-160 Q -60,-220 -40,-270 Z" 
                      fill="black" 
                    />
                    <path 
                      d="M 45,-280 Q 80,-230 75,-160 L 55,-160 Q 60,-220 40,-270 Z" 
                      fill="black" 
                    />
                 </g>
             </g>
           </svg>
        </div>

      </div>

      {/* Bottom Section: Weight Slider */}
      <div className="pt-6 px-4">
         <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-bold uppercase">Peso ({unit === 'metric' ? 'kg' : 'lb'})</label>
           <div className="flex items-center gap-1">
             <input 
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={handleManualInput(setWeight, ranges.wMax)}
                onBlur={handleBlur(setWeight, ranges.wMin, ranges.wMax, weight)}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                className="w-16 text-center text-xl font-black border-b-2 border-black focus:outline-none focus:bg-gray-100 placeholder-transparent"
             />
             <span className="text-xl font-black">{unit === 'metric' ? 'kg' : 'lb'}</span>
           </div>
         </div>
         <input
            type="range"
            min={ranges.wMin}
            max={ranges.wMax}
            step={ranges.wStep}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`w-full h-4 ${sliderClasses}`}
          />
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-2">
            <span>{ranges.wMin}{unit === 'metric' ? 'kg' : 'lb'}</span>
            <span>{ranges.wMax}{unit === 'metric' ? 'kg' : 'lb'}</span>
          </div>
      </div>

    </div>
  );
}


