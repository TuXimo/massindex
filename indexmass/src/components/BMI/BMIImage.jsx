
export default function BMIImage({ weight, height, setWeight, setHeight }) {
  return (
    <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center min-h-[150px] mb-6 border-b-2 border-black border-dashed pb-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto border-4 border-black border-dashed rounded-full flex items-center justify-center mb-4 bg-gray-50">
             <span className="text-xl font-black">IMG</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest">Visual: {weight || '--'}kg / {height || '--'}cm</p>
        </div>
      </div>
      
      <div className="space-y-6">
         <div>
          <label className="block text-xs font-bold uppercase mb-2 flex justify-between">
            <span>Peso</span>
            <span>{weight || 0} kg</span>
          </label>
          <input
            type="range"
            min="40"
            max="120"
            step="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-black accent-black"
          />
        </div>

         <div>
          <label className="block text-xs font-bold uppercase mb-2 flex justify-between">
            <span>Altura</span>
            <span>{height || 0} cm</span>
          </label>
          <input
            type="range"
            min="150"
            max="200"
            step="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-black accent-black"
          />
        </div>
      </div>
    </div>
  );
}
