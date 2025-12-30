import { useTranslation } from 'react-i18next';
import { Calculator, User, Ruler, Scale } from 'lucide-react';

export default function BMIControls({
  activeTab,
  setActiveTab,
  unit,
  handleUnitChange,
  language,
  bmiInfo
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-bmi-card backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col gap-6 relative overflow-hidden">

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bmi-bg via-transparent to-transparent opacity-50" />
      <div
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 transition-colors duration-500"
        style={{ backgroundColor: bmiInfo.color }}
      />

      {/* Mode toggle */}
      <ToggleGroup
        value={activeTab}
        onChange={setActiveTab}
        activeColor={bmiInfo.color}
        language={language}
        options={[
          {
            value: 'calculator',
            label: t('controls.calculator'),
            icon: <Calculator className="w-4 h-4" />
          },
          {
            value: 'visual',
            label: t('controls.visual'),
            icon: <User className="w-4 h-4" />
          }
        ]}
      />

      {/* Unit toggle */}
      <ToggleGroup
        value={unit}
        onChange={handleUnitChange}
        activeColor={bmiInfo.color}
        language={language}
        options={[
          {
            value: 'metric',
            label: t('controls.metric'),
            icon: <Ruler className="w-4 h-4" />
          },
          {
            value: 'imperial',
            label: t('controls.imperial'),
            icon: <Scale className="w-4 h-4" />
          }
        ]}
      />
    </div>
  );
}


function ToggleGroup({
  value,
  onChange,
  options,
  activeColor,
  language
}) {
  const containerClass =
    "bg-black/40 rounded-xl flex w-full p-1 gap-1 border border-slate-700/50 backdrop-blur-md";

  return (
    <div className={containerClass} role="tablist">
      {options.map((opt) => {
        const isActive = value === opt.value;
        
        // Dynamic styles for active state
        const activeStyle = isActive ? {
          backgroundColor: `${activeColor}40`, // Increased opacity to 25% (hex 40 is ~25%)
          color: activeColor,
          borderColor: `${activeColor}60`,
          boxShadow: `0 0 15px ${activeColor}25`
        } : {};

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-lg text-[10px] sm:text-[12px] font-bold uppercase transition-all duration-300 border border-transparent py-2 sm:py-3 min-w-0
              ${language === 'ja' ? '' : 'tracking-widest'}
              ${isActive ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}
            `}
            style={activeStyle}
            role="tab"
            aria-selected={isActive}
          >
            <div className="flex-shrink-0">
              {opt.icon}
            </div>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

