
import { useState } from 'react';
import BMICalculator from './BMICalculator';
import BMITable from './BMITable';
import BMIImage from './BMIImage';

export default function BMISection() {
  const [bmi, setBmi] = useState(null);
  const [userWeight, setUserWeight] = useState(null);
  const [userHeight, setUserHeight] = useState(null);

  const handleCalculate = (weight, height) => {
    const heightInMeters = parseFloat(height) / 100;
    const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(2));
    setUserWeight(parseFloat(weight));
    setUserHeight(parseFloat(height));
  };

  return (
    <section className="w-full max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Calculator & Image */}
        <div className="flex flex-col gap-8 w-full lg:w-1/3">
           <BMICalculator onCalculate={handleCalculate} />
           <BMIImage />
           {/* Result Display */}
           {bmi && (
            <div className="text-center p-6 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-lg font-bold uppercase tracking-widest mb-1">Tu Resultado</p>
              <span className="font-black text-5xl">{bmi}</span>
            </div>
          )}
        </div>
        
        {/* Right Column: Large Grid Table */}
        <div className="w-full lg:w-2/3">
           <BMITable userWeight={userWeight} userHeight={userHeight} />
        </div>
      </div>
    </section>
  );
}
