
import { useTranslation } from 'react-i18next';

export default function BMIResult({ bmi }) {
    const { t } = useTranslation();
  if (!bmi) return null;

  const bmiNum = parseFloat(bmi);
  let category = '';
  let message = '';
  let accentColor = '';
  let badgeColor = '';

  if (bmiNum < 18.5) {
    category = t('result.categories.underweight');
    message = t('result.messages.underweight');
    accentColor = 'border-blue-500 shadow-blue-500/20';
    badgeColor = 'bg-blue-500';
  } else if (bmiNum >= 18.5 && bmiNum < 25) {
    category = t('result.categories.normal');
    message = t('result.messages.normal');
    accentColor = 'border-green-500 shadow-green-500/20';
    badgeColor = 'bg-green-500';
  } else if (bmiNum >= 25 && bmiNum < 30) {
    category = t('result.categories.overweight');
    message = t('result.messages.overweight');
    accentColor = 'border-yellow-500 shadow-yellow-500/20';
    badgeColor = 'bg-yellow-500';
  } else if (bmiNum >= 30 && bmiNum < 35) {
    category = t('result.categories.obesity1');
    message = t('result.messages.obesity1');
    accentColor = 'border-orange-500 shadow-orange-500/20';
    badgeColor = 'bg-orange-500';
  } else if (bmiNum >= 35 && bmiNum < 40) {
    category = t('result.categories.obesity2');
    message = t('result.messages.obesity2');
    accentColor = 'border-red-500 shadow-red-500/20';
    badgeColor = 'bg-red-500';
  } else {
    category = t('result.categories.obesity3');
    message = t('result.messages.obesity3');
    accentColor = 'border-red-700 shadow-red-900/20';
    badgeColor = 'bg-red-700';
  }

  return (
    <div className={`mt-8 p-6 bg-slate-800/50 backdrop-blur-sm border-l-8 ${accentColor} rounded-r-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t('result.analysisResult')}
          </p>
          <h2 className="text-4xl font-bold uppercase tracking-tighter text-white">
            {category}
          </h2>
        </div>
        
        <div className="flex-1 border-slate-700/50 md:pl-6 text-center md:text-left flex flex-col md:items-end">
             <div className={`inline-block px-4 py-2 ${badgeColor} text-white font-black text-xl mb-2 rounded-lg shadow-lg`}>
                {t('result.bmi')} {bmi}
             </div>
             <p className="font-medium text-sm leading-relaxed text-slate-300 md:text-right max-w-md">
                {message}
             </p>
        </div>
      </div>
    </div>
  );
}
