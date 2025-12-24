
import { useState, useEffect } from 'react';
import BMICalculator from './BMICalculator';
import BMITable from './BMITable';
import BMIImage from './BMIImage';
import BMIResult from './BMIResult';
import BMIControls from './BMIControls';
import { getBmiInfo } from '../../utils/bmiUtils';

export default function BMISection() {
  const [weight, setWeight] = useState(70); 
  const [height, setHeight] = useState(175);
  const [bmi, setBmi] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'visual'
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'

  const [language, setLanguage] = useState('es'); // 'en' or 'es'

  // Calculate BMI Info dynamically for styling controls
  const bmiInfo = getBmiInfo(weight, height, unit);

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
    // Only used to set the numeric BMI state for Result component
    if (bmiInfo.value > 0) {
      setBmi(bmiInfo.value.toFixed(2));
    } else {
      setBmi(null);
    }
  }, [weight, height, unit]);

  const handleTableSelect = (w, h) => {
    setWeight(w);
    setHeight(h);
  };

  return (
    <section className="w-full max-w-[95rem] min-h-[800px] flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch flex-1 min-h-0">
        {/* Left Column (Inputs & Visual) */}
        <div className="flex flex-col w-full lg:w-[450px] flex-none gap-6">
           
           {/* BOX 1: Controls (Yellow Box equivalent) */}
           <div className="flex-none">
             <BMIControls 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                unit={unit}
                handleUnitChange={handleUnitChange}
                language={language}
                setLanguage={setLanguage}
                bmiInfo={bmiInfo}
             />
           </div>

           {/* BOX 2: Visualization / Info (Red Box equivalent with inputs) */}
           <div className="flex-none min-h-[400px]">
             {activeTab === 'calculator' ? (
                <BMICalculator weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} unit={unit} />
             ) : (
                <BMIImage weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} unit={unit} />
             )}
           </div>
        </div>
        
        {/* Right Column (Result & Table) */}
        <div className="w-full lg:flex-1 min-w-0 overflow-hidden flex flex-col gap-6">
           
           {/* BOX 3: Result */}
           <div className="flex-none">
              <BMIResult bmi={bmi} />
           </div>

           {/* BOX 4: Table */}
           <div className="flex-1 min-h-0">
              <BMITable 
                 userWeight={weight} 
                 userHeight={height} 
                 unit={unit}
                 onSelect={handleTableSelect}
              />
           </div>
        </div>
      </div>
    </section>
  );
}
