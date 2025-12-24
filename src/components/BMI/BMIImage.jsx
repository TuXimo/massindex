import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSliderRanges } from '../../utils/bmiUtils';

// Helper Component for Imperial Input to handle format state
const ImperialHeightInput = ({ inches, onChange, min, max, placeholder }) => {
  const [localVal, setLocalVal] = useState('');
  
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
        const feet = parseInt(decimalMatch[1]);
        const inches = parseInt(decimalMatch[2]);
        if (feet < 9) { parsed = feet * 12 + inches; }
        else { parsed = parseFloat(val.replace(',', '.')); }
     } else {
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
           if (num < 10) { parsed = num * 12; }
           else { parsed = num; }
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
        placeholder={placeholder}
        className="w-20 text-center text-xl font-black border-b-2 border-slate-600 bg-transparent text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
      />
  );
};

export default function BMIImage({ weight, height, setWeight, setHeight, unit = 'metric', userConfig = {} }) {
  const { t } = useTranslation();
  
  // Normalized values for visualization
  const metricWeight = unit === 'metric' ? parseFloat(weight) : parseFloat(weight) / 2.20462;
  const metricHeight = unit === 'metric' ? parseFloat(height) : parseFloat(height) * 2.54;

  // Visualization Logic ...
  const baseRatio = 0.4;
  const currentRatio = (metricWeight && metricHeight) ? (metricWeight / metricHeight) : baseRatio;
  
  let widthScale = 1;
  if (metricWeight && metricHeight) {
     widthScale = 0.5 + (0.65 * (currentRatio / baseRatio)); 
  }
  const heightScale = metricHeight ? (metricHeight / 175) : 1;
  // Calculate BMI for dynamic coloring
  const getBmiData = (w, h) => {
    if (!w || !h) return { color: '#94A3B8', tailwindColor: 'bg-slate-400' }; // Default Slate
    let val;
    if (unit === 'metric') {
        const hM = h / 100;
        val = w / (hM * hM);
    } else {
        val = (703 * w) / (h * h);
    }
    
    // Low: <18.5 (Blue), Normal: <25 (Green), Over: <30 (Yellow), Ob1: <35 (Orange), Ob2: <40 (Red), Ob3: >=40 (Dark Red)
    // Using Tailwind palette colors for mapped values
    if (val < 18.5) return { color: '#60A5FA', tailwindColor: 'text-blue-400', sliderAccent: 'accent-blue-400', shadow: 'shadow-blue-500/50' };
    if (val < 25) return { color: '#4ADE80', tailwindColor: 'text-green-400', sliderAccent: 'accent-green-400', shadow: 'shadow-green-500/50' };
    if (val < 30) return { color: '#FACC15', tailwindColor: 'text-yellow-400', sliderAccent: 'accent-yellow-400', shadow: 'shadow-yellow-500/50' };
    if (val < 35) return { color: '#FB923C', tailwindColor: 'text-orange-400', sliderAccent: 'accent-orange-400', shadow: 'shadow-orange-500/50' };
    if (val < 40) return { color: '#F87171', tailwindColor: 'text-red-400', sliderAccent: 'accent-red-400', shadow: 'shadow-red-500/50' };
    return { color: '#EF4444', tailwindColor: 'text-red-500', sliderAccent: 'accent-red-500', shadow: 'shadow-red-900/50' };
  };

  const bmiStyle = getBmiData(metricWeight, unit === 'metric' ? height : parseFloat(height)); 
  // Note: For imperial, height 'value' in state might be just inches if parsed correctly. 
  // But wait, in ImperialHeightInput we setHeight with inches (number).
  // In `BMISection`, we parse float. 
  // So here, `metricWeight` is already kg. `metricHeight` is cm.
  // The helper `getBmiData` effectively duplicates logic but we can just use the calculated `metricWeight` and `metricHeight` (converted to meters for metric formula).
  // Actually easier: use `metricWeight` and `metricHeight`.
  
  const getBmiFromMetric = () => {
     if (!metricWeight || !metricHeight) return { color: '#94A3B8', tailwindColor: 'text-slate-400', sliderAccent: 'accent-slate-400' };
     const bmi = metricWeight / ((metricHeight/100) ** 2);
     if (bmi < 18.5) return { color: '#60A5FA', tailwindColor: 'text-blue-400', sliderAccent: 'accent-blue-400', bg: 'bg-blue-400' };
     if (bmi < 25) return { color: '#4ADE80', tailwindColor: 'text-green-400', sliderAccent: 'accent-green-400', bg: 'bg-green-400' };
     if (bmi < 30) return { color: '#FACC15', tailwindColor: 'text-yellow-400', sliderAccent: 'accent-yellow-400', bg: 'bg-yellow-400' };
     if (bmi < 35) return { color: '#FB923C', tailwindColor: 'text-orange-400', sliderAccent: 'accent-orange-400', bg: 'bg-orange-400' };
     if (bmi < 40) return { color: '#F87171', tailwindColor: 'text-red-400', sliderAccent: 'accent-red-400', bg: 'bg-red-400' };
     return { color: '#EF4444', tailwindColor: 'text-red-600', sliderAccent: 'accent-red-600', bg: 'bg-red-600' };
  };
  
  const visualStyle = getBmiFromMetric();

  // Custom Slider formatting
  // We want a thick track. Standard input[type=range] is hard to style thick without custom CSS.
  // We'll use a class that gives it a standard sleek look, and reliance on accent color.
  const sliderClasses = `w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer ${visualStyle.sliderAccent} transition-colors duration-300`;

  const handleManualInput = (setter, max) => (e) => {
    let value = e.target.value;
    value = value.replace(',', '.');
    if (/[^0-9.]/.test(value)) return;
    if ((value.match(/\./g) || []).length > 1) return;
    if (value === '') { setter(''); return; }
    if (value.length > 1 && value.startsWith('0') && value[1] !== '.') value = value.replace(/^0+/, '');
    setter(value);
  };

  const handleBlur = (setter, min, max, value) => () => {
      const num = parseFloat(value);
      if (isNaN(num) || num < min) { setter(min); }
      else if (num > max) { setter(max); }
  };

  const formatFeetInches = (val) => {
    if (!val) return '';
    const feet = Math.floor(val / 12);
    const inches = Math.round(val % 12);
    return `${feet}'${inches}"`;
  };

  const parseFeetInches = (str) => {
    const match = str.match(/(\d+)'\s*(\d+)/);
    if (match) return parseInt(match[1]) * 12 + parseInt(match[2]);
    return parseFloat(str);
  };

  // Calculate dynamic ranges based on mode (adult/child) and age
  const ranges = useMemo(() => {
     return getSliderRanges(unit, userConfig.mode, userConfig.age);
  }, [unit, userConfig.mode, userConfig.age]);

  return (
    <div className="flex-col flex p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl">
      
      {/* Top Section: Height Slider + Visualization */}
      <div className="flex-1 flex flex-row gap-6 relative min-h-0">
        
        {/* Left: Height Slider (Vertical) */}
        <div className="flex flex-col items-center justify-between h-full py-4 z-10 w-20">
           <label className="text-xs font-bold uppercase mb-4 writing-mode-vertical whitespace-nowrap text-slate-200">
             {t('common.height')}
           </label>
           <div className="relative flex-1 flex items-center justify-center w-full min-h-[280px]">
              <input
                type="range"
                min={ranges.hMin}
                max={ranges.hMax}
                step={ranges.hStep}
                value={height === '' ? (unit === 'metric' ? 175 : 69) : height}
                onChange={(e) => setHeight(e.target.value)}
                className={`absolute ${sliderClasses}`}
                style={{ 
                  transform: 'rotate(-90deg)', 
                  width: '280px', 
                }}
              />
           </div>
           <div className="flex flex-col items-center mt-2 w-full">
              {unit === 'metric' ? (
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={height}
                    onChange={handleManualInput(setHeight, ranges.hMax)}
                    onBlur={handleBlur(setHeight, ranges.hMin, ranges.hMax, height)}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    placeholder="175"
                    className="w-16 text-center text-xl font-black border-b-2 border-slate-600 bg-transparent text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
              ) : (
                  <div className='[&>input]:bg-transparent [&>input]:text-white [&>input]:border-slate-600 [&>input]:w-20 [&>input]:text-center [&>input]:text-xl [&>input]:font-black [&>input]:border-b-2 [&>input]:focus:outline-none'>
                    <ImperialHeightInput 
                       inches={height} 
                       onChange={setHeight}
                       min={ranges.hMin}
                       max={ranges.hMax}
                       placeholder="5'9&quot;"
                    />
                  </div>
              )}
              <span className="text-xs font-bold text-slate-500">{unit === 'metric' ? 'cm' : 'ft/in'}</span>
           </div>
        </div>

        {/* Center: Human Visualization */}
        <div className="flex-1 flex items-end justify-center relative overflow-hidden pb-4 border-b border-dashed border-slate-700">
           
            {/* Background Ruler Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col justify-between py-8">
               {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-full border-t border-slate-400 flex justify-between px-2">
                     <span className="text-[10px] -mt-2 text-slate-500">{220 - (i * 8)}cm</span>
                  </div>
               ))}
            </div>

            {/* Dynamic SVG with Glow Effect */}
            <svg 
              viewBox="-100 -60 400 520" 
              preserveAspectRatio="xMidYMax meet"
              className="h-full w-full transition-all duration-300 ease-out drop-shadow-2xl z-10"
              style={{ filter: `drop-shadow(0 0 15px ${visualStyle.color}40)` }} 
            >
              <g transform="translate(100, 430)">
                  {/* Shadow */}
                  <ellipse cx="0" cy="20" rx="80" ry="15" fill="#000" opacity="0.2" filter="blur(5px)" />
                  
                  <g 
                     transform={`scale(${widthScale}, ${heightScale})`} 
                     className="transition-transform duration-300"
                  >
                     {/* Head */}
                     <circle cx="0" cy="-330" r="30" fill={visualStyle.color} />
                     
                     {/* Body */}
                     <path 
                       d="M -40,-290 Q -50,-180 -40,-130 L -30,0 L -10,0 L -10,-120 L 10,-120 L 10,0 L 30,0 L 40,-130 Q 50,-180 40,-290 Z" 
                       fill={visualStyle.color} 
                     />
                     
                     {/* Arms */}
                     <path d="M -45,-280 Q -80,-230 -75,-160 L -55,-160 Q -60,-220 -40,-270 Z" fill={visualStyle.color} />
                     <path d="M 45,-280 Q 80,-230 75,-160 L 55,-160 Q 60,-220 40,-270 Z" fill={visualStyle.color} />
                  </g>
              </g>
            </svg>
        </div>

      </div>

      {/* Bottom Section: Weight Slider */}
      <div className="pt-6 px-4">
         <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-bold uppercase text-slate-200">{t('common.weight')} ({unit === 'metric' ? 'kg' : 'lb'})</label>
           <div className="flex items-center gap-1">
             <input 
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={handleManualInput(setWeight, ranges.wMax)}
                onBlur={handleBlur(setWeight, ranges.wMin, ranges.wMax, weight)}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                placeholder={unit === 'metric' ? "70" : "154"}
                className="w-16 text-center text-xl font-black border-b-2 border-slate-600 bg-transparent text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
             />
             <span className="text-xl font-black text-slate-500">{unit === 'metric' ? 'kg' : 'lb'}</span>
           </div>
         </div>
         <input
            type="range"
            min={ranges.wMin}
            max={ranges.wMax}
            step={ranges.wStep}
            value={weight === '' ? (unit === 'metric' ? 70 : 154) : weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`${sliderClasses}`}
          />
          <div className="flex justify-between text-xs font-bold text-slate-600 mt-2">
            <span>{ranges.wMin}{unit === 'metric' ? 'kg' : 'lb'}</span>
            <span>{ranges.wMax}{unit === 'metric' ? 'kg' : 'lb'}</span>
          </div>
      </div>

    </div>
  );
}


