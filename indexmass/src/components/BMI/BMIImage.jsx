
export default function BMIImage() {
  return (
    <div className="p-6 border-2 border-black bg-white flex-1 flex items-center justify-center min-h-[200px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto border-4 border-black border-dashed rounded-full flex items-center justify-center mb-4">
           <span className="text-2xl font-black">?</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest">Referencia Visual</p>
      </div>
    </div>
  );
}
