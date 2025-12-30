import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Scale } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import BMICalculator from '../components/BMI/BMICalculator';
import BMIResult from '../components/BMI/BMIResult';
import { getBmiInfo } from '../utils/bmiUtils';

export default function CalculatorPage() {
  const { t } = useTranslation();
  const { language, userConfig } = useConfig();

  // State
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);

  // Calculate BMI Info for result
  const bmiInfo = getBmiInfo(weight, height, unit, userConfig);

  useEffect(() => {
    if (bmiInfo.value > 0) {
      setBmi(bmiInfo.value.toFixed(2));
    } else {
      setBmi(null);
    }
  }, [bmiInfo.value]);

  // Handle Unit Change
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    
    // Convert values
    if (newUnit === 'imperial') {
      if (weight) setWeight((parseFloat(weight) * 2.20462).toFixed(1));
      if (height) setHeight((parseFloat(height) / 2.54).toFixed(1));
    } else {
        if (weight) setWeight((parseFloat(weight) / 2.20462).toFixed(1));
        if (height) setHeight((parseFloat(height) * 2.54).toFixed(1));
    }
    setUnit(newUnit);
  };

  return (
    <div className="min-h-screen bg-bmi-bg p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Simple Unit Toggle */}
        <div className="bg-black/40 rounded-xl p-1 flex border border-slate-700/50 backdrop-blur-md">
            <button
                onClick={() => handleUnitChange('metric')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    unit === 'metric' 
                    ? 'bg-bmi-accent/20 text-bmi-accent border border-bmi-accent/50 shadow-[0_0_15px_rgba(var(--bmi-accent-rgb),0.2)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <Ruler className="w-4 h-4" />
                {t('controls.metric')}
            </button>
            <button
                onClick={() => handleUnitChange('imperial')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    unit === 'imperial' 
                    ? 'bg-bmi-accent/20 text-bmi-accent border border-bmi-accent/50 shadow-[0_0_15px_rgba(var(--bmi-accent-rgb),0.2)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <Scale className="w-4 h-4" />
                {t('controls.imperial')}
            </button>
        </div>

        {/* Calculator */}
        <BMICalculator 
            weight={weight}
            height={height}
            setWeight={setWeight}
            setHeight={setHeight}
            unit={unit}
            ranges={null} // Default limits
        />

        {/* Result */}
        <div className={!bmi ? 'opacity-50 pointer-events-none grayscale' : ''}>
             <BMIResult bmi={bmi} />
        </div>
        
      </div>
    </div>
  );
}
