
export default function BMIResult({ bmi }) {
  if (!bmi) return null;

  const bmiNum = parseFloat(bmi);
  let category = '';
  let message = '';
  let colorClass = '';

  if (bmiNum < 18.5) {
    category = 'Bajo Peso';
    message = 'Tu IMC está por debajo del rango saludable. Es recomendable consultar con un especialista.';
    colorClass = 'bg-blue-200';
  } else if (bmiNum >= 18.5 && bmiNum < 25) {
    category = 'Peso Normal';
    message = '¡Excelente! Tienes un peso saludable. Mantén tus buenos hábitos.';
    colorClass = 'bg-green-200';
  } else if (bmiNum >= 25 && bmiNum < 30) {
    category = 'Sobrepeso';
    message = 'Tu IMC indica sobrepeso. Pequeños cambios en tu dieta y actividad pueden ayudar.';
    colorClass = 'bg-yellow-200';
  } else if (bmiNum >= 30 && bmiNum < 35) {
    category = 'Obesidad I';
    message = 'Tu IMC indica obesidad grado I. Es importante cuidar tu salud cardiovascular.';
    colorClass = 'bg-orange-200';
  } else if (bmiNum >= 35 && bmiNum < 40) {
    category = 'Obesidad II';
    message = 'Tu IMC indica obesidad grado II. Consulta a un médico para un plan personalizado.';
    colorClass = 'bg-red-200';
  } else {
    category = 'Obesidad III';
    message = 'Tu IMC indica obesidad mórbida. Es crucial buscar orientación médica prioritaria.';
    colorClass = 'bg-red-400';
  }

  return (
    <div className={`mt-8 p-6 border-2 border-black ${colorClass} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            Resultado del Análisis
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            {category}
          </h2>
        </div>
        
        <div className="flex-1 border-l-0 md:border-l-2 border-black md:pl-6 text-center md:text-left">
             <div className="inline-block p-2 bg-black text-white font-black text-xl mb-2">
                IMC: {bmi}
             </div>
             <p className="font-medium text-sm leading-relaxed">
                {message}
             </p>
        </div>
      </div>
    </div>
  );
}
