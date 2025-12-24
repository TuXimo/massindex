
export default function BMICalculator({ weight, height, setWeight, setHeight }) {
  
  // No submit handler needed as we update parent state directly
  
  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 h-full">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Calculadora
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder="70"
            required
            min="40"
            max="160"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Altura (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder="175"
            required
            min="140"
            max="220"
          />
        </div>
      </div>
      
       <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
           <p className="text-xs font-bold text-gray-500 uppercase text-center mb-3">Fórmula</p>
           <div className="bg-gray-100 p-3 border-2 border-black text-center">
             <span className="font-black text-lg block">IMC = Peso / Altura²</span>
             <span className="text-xs font-bold text-gray-500 block mt-1">(kg / m²)</span>
           </div>
       </div>

        <div className="mt-6 text-xs text-center font-bold text-gray-500 uppercase">
          * Los resultados se actualizan automáticamente
       </div>
    </div>
  );
}
