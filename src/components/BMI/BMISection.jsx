
import { useState, useEffect } from 'react';
import BMICalculator from './BMICalculator';
import BMITable from './BMITable';
import BMIImage from './BMIImage';
import BMIResult from './BMIResult';

export default function BMISection() {
  const [weight, setWeight] = useState(70); // Default values for better UX with sliders
  const [height, setHeight] = useState(175);
  const [bmi, setBmi] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'visual'
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;

    if (newUnit === 'imperial') {
      // Metric -> Imperial
      if (weight) setWeight((parseFloat(weight) * 2.20462).toFixed(1));
      if (height) setHeight((parseFloat(height) / 2.54).toFixed(1));
    } else {
      // Imperial -> Metric
      if (weight) setWeight((parseFloat(weight) / 2.20462).toFixed(1));
      if (height) setHeight((parseFloat(height) * 2.54).toFixed(1));
    }
    setUnit(newUnit);
  };

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (w && h) {
      let bmiValue;
      if (unit === 'metric') {
          const heightInMeters = h / 100;
          bmiValue = w / (heightInMeters * heightInMeters);
      } else {
          // Imperial Formula: 703 * weight (lbs) / height (in)^2
          bmiValue = (703 * w) / (h * h);
      }
      setBmi(bmiValue.toFixed(2));
    } else {
      setBmi(null);
    }
  }, [weight, height, unit]);

  return (
    <section className="w-full max-w-[95rem]">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Left Column: Tabs & Content */}
        <div className="flex flex-col w-full lg:w-[450px] flex-none">
           {/* TABS */}
           <div className="flex mb-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <button 
                onClick={() => setActiveTab('calculator')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border-r-2 border-black transition-colors ${activeTab === 'calculator' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
             >
               Calculadora
             </button>
             <button 
                onClick={() => setActiveTab('visual')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'visual' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
             >
               Visual / Sliders
             </button>
           </div>
           
           {/* TAB CONTENT */}
           <div className="mb-0 flex-1 flex flex-col">
             {activeTab === 'calculator' ? (
                <BMICalculator weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} unit={unit} />
             ) : (
                <BMIImage weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} unit={unit} />
             )}
           </div>

           {/* Result Display (Shared) */}
           {/* Old result display removed, moved to bottom */}
        </div>
        
        <div className="w-full lg:flex-1 min-w-0 overflow-hidden flex flex-col">
           {/* Unit Toggle */}
           <div className="flex justify-end mb-4">
              <div className="inline-flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() => handleUnitChange('metric')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${unit === 'metric' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    Metric (kg/cm)
                  </button>
                  <div className="w-[2px] bg-black"></div>
                  <button
                    onClick={() => handleUnitChange('imperial')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${unit === 'imperial' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    Imperial (lb/in)
                  </button>
              </div>
           </div>
           
           <BMITable userWeight={parseFloat(weight)} userHeight={parseFloat(height)} unit={unit} />
        </div>
      </div>
      
      {/* Full Width Result Component */}
      <BMIResult bmi={bmi} />
    </section>
  );
}
