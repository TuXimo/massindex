export default function Header() {
  return (
    <header className="w-full py-8 bg-transparent relative z-20">
      <div className="max-w-6xl mx-auto px-6 flex justify-center items-center relative">
        <div 
            className="group cursor-pointer"
            onClick={() => {
                const element = document.getElementById('bmi-main-view');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }}
        >
            <h1 className="text-4xl font-bold tracking-widest uppercase text-slate-200 drop-shadow-sm transition-opacity group-hover:opacity-80">
            Índice de Masa Muscular
            </h1>
        </div>

        {/* Language Selector */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
             <button className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 font-bold px-3 py-2 rounded-lg border border-slate-700/50 transition-colors backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0-18a9 9 0 018.716 6.747M12 3a9.004 9.004 0 00-8.716 6.747M12 3c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9m9-9h-9m9 0a9 9 0 01-9 9m9-9H3m9 0a9 9 0 00-9 9m9-9H3m9 0a9 9 0 01-9-9m9 9H3m9 0a9 9 0 00-9-9" />
                </svg>
                <span>ES</span>
             </button>
        </div>
      </div>
    </header>
  );
}
