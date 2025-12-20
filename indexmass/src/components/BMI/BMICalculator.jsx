
import { useState } from 'react';

export default function BMICalculator({ onCalculate }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight && height) {
      onCalculate(weight, height);
    }
  };

  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-xl mb-6 text-center border-b-2 border-black pb-2 uppercase">
        Ingresar Datos
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:bg-black focus:text-white transition-colors placeholder-gray-400 font-bold"
            placeholder="70"
            required
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
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all cursor-pointer"
        >
          Calcular
        </button>
      </form>
    </div>
  );
}
