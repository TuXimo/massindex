

export default function BMIImage({ weight, height, setWeight, setHeight }) {
  // Base scales (reference: 175cm, 70kg, BMI ~22.8)
  // Tuned: 135 ensures that at 210cm the figure touches the top line roughly
  const heightScale = height / 135;
  
  // Width now depends on BMI, not just weight.
  // Reference BMI (22.85 for 175cm/70kg) -> scale 1
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const widthScale = bmi / 22.85;

  // Common Slider Classes for consistency
  const sliderClasses = "bg-gray-200 rounded-full appearance-none cursor-pointer border-2 border-black accent-black";

  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full min-h-[500px]">
      
      {/* Top Section: Height Slider + Visualization */}
      <div className="flex-1 flex flex-row gap-6 relative min-h-0">
        
        {/* Left: Height Slider (Vertical) */}
        <div className="flex flex-col items-center justify-between h-full py-4 z-10 w-20">
           <label className="text-xs font-bold uppercase mb-4 writing-mode-vertical whitespace-nowrap">Altura</label>
           <div className="relative flex-1 flex items-center justify-center w-full min-h-[320px]">
              <input
                type="range"
                min="140"
                max="220"
                step="1"
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
           <span className="text-xl font-black mt-2 w-full text-center">{height} <br/><span className="text-xs">cm</span></span>
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
           <label className="text-xs font-bold uppercase">Peso (kg)</label>
           <span className="text-xl font-black">{weight} kg</span>
         </div>
         <input
            type="range"
            min="40"
            max="160"
            step="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`w-full h-4 ${sliderClasses}`}
          />
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-2">
            <span>40kg</span>
            <span>160kg</span>
          </div>
      </div>

    </div>
  );
}


