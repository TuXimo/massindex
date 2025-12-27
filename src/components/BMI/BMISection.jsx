
import { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../context/ConfigContext';
import BMICalculator from './BMICalculator';
import BMITable from './BMITable';
import BMIImage from './BMIImage';
import BMIResult from './BMIResult';
import BMIControls from './BMIControls';
import { getBmiInfo } from '../../utils/bmiUtils';

export default function BMISection() {
  const [weight, setWeight] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bmi_weight') || '';
    return '';
  }); 
  const [height, setHeight] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bmi_height') || '';
    return '';
  });
  const [bmi, setBmi] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('active_tab');
        if (saved) return saved;
        return window.innerWidth < 1024 ? 'calculator' : 'visual';
    }
    return 'visual';
  });
  
  // Persist Active Tab
  useEffect(() => {
     localStorage.setItem('active_tab', activeTab);
  }, [activeTab]);
  const [unit, setUnit] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bmi_unit') || 'metric';
    return 'metric';
  }); 

  // Persist BMI Data
  useEffect(() => {
    localStorage.setItem('bmi_weight', weight);
    localStorage.setItem('bmi_height', height);
    localStorage.setItem('bmi_unit', unit);
  }, [weight, height, unit]);

  const { language, setLanguage, userConfig, setThemeColor } = useConfig();
  
  // Calculate BMI Info dynamically for styling controls
  // We pass userConfig to allow future calculation updates for children
  const bmiInfo = getBmiInfo(weight, height, unit, userConfig);

  useEffect(() => {
     if (bmiInfo?.color) {
         setThemeColor(bmiInfo.color);
     }
  }, [bmiInfo.color, setThemeColor]);

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

  const sectionRef = useRef(null);

  useEffect(() => {
    // Determine if we should smooth scroll or instant scroll
    // For initial load, it might be better to just jump or wait a tick
    const timer = setTimeout(() => {
        if (sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100); // Small delay to ensure render
    return () => clearTimeout(timer);
  }, []);

  /* 
   * Enhanced Input Handlers 
   * Requirement: If user enters one value (e.g. Height), autofill the other (e.g. Weight) with default
   * Defaults: Weight=70kg (154lbs), Height=175cm (69in)
   */
  const handleWeightChange = (newVal) => {
    setWeight(newVal);
    // If we have a new weight value and height is currently empty, autofill height
    if (newVal && !height) {
        setHeight(unit === 'metric' ? '175' : '69'); 
    }
  };

  const handleHeightChange = (newVal) => {
    setHeight(newVal);
    // If we have a new height value and weight is currently empty, autofill weight
    if (newVal && !weight) {
        setWeight(unit === 'metric' ? '70' : '154');
    }
  };

  return (
    <section id="bmi-main-view" ref={sectionRef} className="w-full max-w-[95rem] min-h-auto lg:min-h-[800px] flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch flex-1 min-h-0">
        {/* Left Column (Inputs & Visual) */}
        <div className="flex flex-col w-full lg:w-[450px] flex-none gap-4 lg:gap-6">
           
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

           {/* BOX 2: Visualization / Info */}
           <div className="flex-none min-h-[400px]">
             {activeTab === 'calculator' ? (
                <BMICalculator 
                    weight={weight} 
                    height={height} 
                    setWeight={handleWeightChange} 
                    setHeight={handleHeightChange} 
                    unit={unit} 
                />
             ) : (
                <BMIImage 
                    weight={weight} 
                    height={height} 
                    setWeight={handleWeightChange} 
                    setHeight={handleHeightChange} 
                    unit={unit} 
                    userConfig={userConfig} // Pass config
                />
             )}
           </div>
        </div>
        
        {/* Right Column (Result & Table) */}
        <div className="w-full lg:flex-1 min-w-0 overflow-hidden flex flex-col gap-4 lg:gap-6">
           
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
                 userConfig={userConfig}
              />
           </div>
        </div>
      </div>
    </section>
  );
}
