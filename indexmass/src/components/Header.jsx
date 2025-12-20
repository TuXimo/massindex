export default function Header() {
  return (
    <header className="w-full py-6 border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-black">
          Índice de Masa Muscular
        </h1>
        <div className="text-sm font-bold uppercase tracking-widest border border-black px-2 py-1">
          Calculadora
        </div>
      </div>
    </header>
  );
}
