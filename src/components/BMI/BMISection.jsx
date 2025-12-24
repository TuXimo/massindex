
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

  useEffect(() => {
    if (weight && height) {
      const heightInMeters = parseFloat(height) / 100;
      const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(2));
    } else {
      setBmi(null);
    }
  }, [weight, height]);

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
                <BMICalculator weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} />
             ) : (
                <BMIImage weight={weight} height={height} setWeight={setWeight} setHeight={setHeight} />
             )}
           </div>

           {/* Result Display (Shared) */}
           {/* Old result display removed, moved to bottom */}
        </div>
        
        <div className="w-full lg:flex-1 min-w-0">
           <BMITable userWeight={parseFloat(weight)} userHeight={parseFloat(height)} />
        </div>
      </div>
      
      {/* Full Width Result Component */}
      <BMIResult bmi={bmi} />
    </section>
  );
}
