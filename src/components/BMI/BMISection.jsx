
import { useState, useEffect, useRef, useMemo } from 'react';
import { useConfig } from '../../context/ConfigContext';
import BMICalculator from './BMICalculator';
import BMITable from './BMITable';
import BMIImage from './BMIImage';
import BMIResult from './BMIResult';
import BMIControls from './BMIControls';
import { getBmiInfo, getSliderRanges } from '../../utils/bmiUtils';

export default function BMISection() {
  const { language, setLanguage, userConfig, setThemeColor } = useConfig();
  
  /* 
   * STATE INITIALIZATION ORDER IS CRITICAL 
   * Unit must be initialized first to validate Weight/Height against default ranges.
   */
  
  const [unit, setUnit] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bmi_unit') || 'metric';
    return 'metric';
  });

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

  const [weight, setWeight] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bmi_weight');
        if (saved) {
            // Validate against DEFAULT ranges (since custom ranges are not persisted)
            const defaults = getSliderRanges(unit, userConfig?.mode, userConfig?.age);
            const val = parseFloat(saved);
            if (!isNaN(val) && val >= defaults.wMin && val <= defaults.wMax) {
                return saved;
            }
            // If out of bounds of default (e.g. was set using custom ranges), reset to empty (default)
        }
    }
    return '';
  }); 

  const [height, setHeight] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bmi_height');
        if (saved) {
             const defaults = getSliderRanges(unit, userConfig?.mode, userConfig?.age);
             const val = parseFloat(saved);
             if (!isNaN(val) && val >= defaults.hMin && val <= defaults.hMax) {
                 return saved;
             }
        }
    }
    return '';
  });

  const [bmi, setBmi] = useState(null);

  // Custom Ranges State (Hoisted from BMITable)
  const [customRanges, setCustomRanges] = useState({ wMin: '', wMax: '', hMin: '', hMax: '' });

  // Hoisted Effective Ranges Calculation
  // We compute this here so all children (Calculator, Table, Image) share the exact same limits
  const effectiveRanges = useMemo(() => {
     const defaults = getSliderRanges(unit, userConfig?.mode, userConfig?.age);
     return {
         wMin: customRanges.wMin !== '' ? parseInt(customRanges.wMin) : defaults.wMin,
         wMax: customRanges.wMax !== '' ? parseInt(customRanges.wMax) : defaults.wMax,
         hMin: customRanges.hMin !== '' ? parseInt(customRanges.hMin) : defaults.hMin,
         hMax: customRanges.hMax !== '' ? parseInt(customRanges.hMax) : defaults.hMax,
         wStep: defaults.wStep,
         hStep: defaults.hStep
     };
  }, [unit, userConfig?.mode, userConfig?.age, customRanges]);

  // Persist BMI Data
  useEffect(() => {
    localStorage.setItem('bmi_weight', weight);
    localStorage.setItem('bmi_height', height);
    localStorage.setItem('bmi_unit', unit);
  }, [weight, height, unit]);

  // Store original metric values to prevent precision loss on round-trip (Metric -> Imperial -> Metric)
  const preservedMetricValues = useRef(null);

  // Handle unit change (convert values)
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;

    if (newUnit === 'imperial') {
      // Metric -> Imperial
      // Save current Metric values before conversion to preserve precision later
      preservedMetricValues.current = { weight, height };

      if (weight) setWeight((parseFloat(weight) * 2.20462).toFixed(1));
      if (height) setHeight((parseFloat(height) / 2.54).toFixed(1));
      
      setCustomRanges(prev => ({
          wMin: prev.wMin ? Math.round(parseInt(prev.wMin) * 2.20462).toString() : '',
          wMax: prev.wMax ? Math.round(parseInt(prev.wMax) * 2.20462).toString() : '',
          hMin: prev.hMin ? Math.round(parseInt(prev.hMin) / 2.54).toString() : '',
          hMax: prev.hMax ? Math.round(parseInt(prev.hMax) / 2.54).toString() : ''
      }));

    } else {
      // Imperial -> Metric
      
      // Weight Restore Logic
      let newWeight = '';
      if (weight) {
          // Calculate what the "raw" conversion would be
          const rawConverted = (parseFloat(weight) / 2.20462).toFixed(1);
          
          // Check if we have a preserved value
          if (preservedMetricValues.current?.weight) {
              const original = preservedMetricValues.current.weight;
              // Check if the current Imperial weight is effectively the same as what the Original Metric would have become
              // i.e. Has the user changed the weight in Imperial mode?
              const originalAsImperial = (parseFloat(original) * 2.20462).toFixed(1);
              
              if (originalAsImperial === weight) {
                  // User hasn't changed it (or changed it back to exact same), so restore the precise original
                  newWeight = original;
              } else {
                  newWeight = rawConverted;
              }
          } else {
              newWeight = rawConverted;
          }
      }
      setWeight(newWeight);

      // Height Restore Logic
      let newHeight = '';
      if (height) {
          const rawConverted = (parseFloat(height) * 2.54).toFixed(1);

          if (preservedMetricValues.current?.height) {
              const original = preservedMetricValues.current.height;
              const originalAsImperial = (parseFloat(original) / 2.54).toFixed(1);
              
              if (originalAsImperial === height) {
                  newHeight = original;
              } else {
                  newHeight = rawConverted;
              }
          } else {
              newHeight = rawConverted;
          }
      }
      setHeight(newHeight);


      setCustomRanges(prev => ({
          wMin: prev.wMin ? Math.round(parseInt(prev.wMin) / 2.20462).toString() : '',
          wMax: prev.wMax ? Math.round(parseInt(prev.wMax) / 2.20462).toString() : '',
          hMin: prev.hMin ? Math.round(parseInt(prev.hMin) * 2.54).toString() : '',
          hMax: prev.hMax ? Math.round(parseInt(prev.hMax) * 2.54).toString() : ''
      }));
    }
    setUnit(newUnit);
  };

  // Calculate BMI Info dynamically for styling controls
  // We pass userConfig to allow future calculation updates for children
  const bmiInfo = getBmiInfo(weight, height, unit, userConfig);

  useEffect(() => {
     if (bmiInfo?.color) {
         setThemeColor(bmiInfo.color);
     }
  }, [bmiInfo.color, setThemeColor]);

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
                    ranges={effectiveRanges} // Pass effective ranges for validation
                />
             ) : (
                <BMIImage 
                    weight={weight} 
                    height={height} 
                    setWeight={handleWeightChange} 
                    setHeight={handleHeightChange} 
                    unit={unit} 
                    userConfig={userConfig} // Pass config
                    customRanges={customRanges}
                    effectiveRanges={effectiveRanges} // Optimization: pass pre-calculated
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
                 customRanges={customRanges}
                 setCustomRanges={setCustomRanges}
                 effectiveRanges={effectiveRanges} // Optimization: pass pre-calculated
              />
           </div>
        </div>
      </div>
    </section>
  );
}
