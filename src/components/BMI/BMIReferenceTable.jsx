import { useTranslation } from 'react-i18next';
import { getBmiInfo } from '../../utils/bmiUtils';

export default function BMIReferenceTable({ bmi }) {
  const { t } = useTranslation();
  
  // Parse BMI to determine active row
  const currentBmi = bmi ? parseFloat(bmi) : null;
  
  const getRowStyle = (min, max) => {
    if (currentBmi === null) return "text-bmi-muted border-slate-800/50"; // Default
    
    const isActive = (max === null && currentBmi >= min) || (max !== null && currentBmi >= min && currentBmi < max);
    
    if (!isActive) return "text-bmi-muted border-slate-800/50 opacity-60";
    
    // Active styling matching the screenshot
    return "bg-slate-800/60 text-white border-none shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-sm transform scale-[1.02] z-10 font-bold border-l-4";
  };
  
  const getActiveIndicator = (min, max, colorClass) => {
      if (currentBmi === null) return null;
      const isActive = (max === null && currentBmi >= min) || (max !== null && currentBmi >= min && currentBmi < max);
      if (!isActive) return null;
      
      return (
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass} rounded-r-full shadow-[0_0_8px_currentColor]`} />
      );
  };
  
  const rows = [
    { 
      min: 0, 
      max: 18.5, 
      label: "< 18.5", 
      classification: t('result.categories.underweight'), 
      desc: t('table.referenceList.descriptions.underweight'),
      color: "text-blue-400",
      border: "bg-blue-500"
    },
    { 
      min: 18.5, 
      max: 25, 
      label: "18.5 - 24.9", 
      classification: t('result.categories.normal'), 
      desc: t('table.referenceList.descriptions.normal'),
      color: "text-green-400",
      border: "bg-green-500"
    },
    { 
      min: 25, 
      max: 30, 
      label: "25.0 - 29.9", 
      classification: t('result.categories.overweight'), 
      desc: t('table.referenceList.descriptions.overweight'),
      color: "text-yellow-400",
      border: "bg-yellow-500"
    },
    { 
      min: 30, 
      max: 35, 
      label: "30.0 - 34.9", 
      classification: t('result.categories.obesity1'), 
      desc: t('table.referenceList.descriptions.obesity1'),
      color: "text-orange-400",
      border: "bg-orange-500"
    },
    { 
      min: 35, 
      max: 40, 
      label: "35.0 - 39.9", 
      classification: t('result.categories.obesity2'), 
      desc: t('table.referenceList.descriptions.obesity2'),
      color: "text-red-400",
      border: "bg-red-500"
    },
    { 
      min: 40, 
      max: null, 
      label: "> 40.0", 
      classification: t('result.categories.obesity3'), 
      desc: t('table.referenceList.descriptions.obesity3'),
      color: "text-red-600",
      border: "bg-red-600"
    },
  ];

  return (
    <div className="w-full h-full overflow-auto scrollbar-hide p-2 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full max-w-3xl border border-slate-700 rounded-xl overflow-hidden bg-[#050a09]">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-800 bg-[#070F13] text-xs font-bold uppercase tracking-wider text-bmi-muted">
                <div>{t('table.referenceList.headers.range')}</div>
                <div>{t('table.referenceList.headers.classification')}</div>
                <div className="text-right">{t('table.referenceList.headers.description')}</div>
            </div>
            
            {/* Body */}
            <div className="flex flex-col">
                {rows.map((row, idx) => (
                    <div 
                        key={idx} 
                        className={`grid grid-cols-3 gap-4 p-4 border-b last:border-0 border-slate-800/50 transition-all duration-300 relative ${getRowStyle(row.min, row.max)}`}
                    >   
                        {getActiveIndicator(row.min, row.max, row.border)}
                        
                        <div className="font-mono font-bold text-sm flex items-center">
                            {row.label}
                        </div>
                        <div className={`font-bold text-sm flex items-center ${
                             (row.max === null && currentBmi >= row.min) || (row.max !== null && currentBmi >= row.min && currentBmi < row.max) ? row.color : ''
                        }`}>
                            {row.classification}
                        </div>
                        <div className="text-xs flex items-center justify-end text-bmi-muted">
                           {row.desc}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
