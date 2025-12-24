
export const getBmiInfo = (weight, height, unit) => {
    // Normalize to metric for calculation
    // weight: kg or lbs
    // height: cm or inches
    
    if (!weight || !height) return { 
        value: 0, 
        color: '#94A3B8', // Slate-400
        tailwindColor: 'text-slate-400',
        bg: 'bg-slate-400',
        shadow: 'shadow-slate-500/50',
        sliderAccent: 'accent-slate-400',
        category: 'N/A'
    };

    let metricWeight = parseFloat(weight);
    let metricHeight = parseFloat(height);

    if (unit === 'imperial') {
        metricWeight = metricWeight / 2.20462;
        metricHeight = metricHeight * 2.54;
    }

    // BMI = kg / m^2
    const hM = metricHeight / 100;
    const bmi = metricWeight / (hM * hM);

    // Categories & Colors
    // Low: <18.5 (Blue)
    if (bmi < 18.5) return { 
        value: bmi, 
        color: '#60A5FA', 
        tailwindColor: 'text-blue-400',
        bg: 'bg-blue-400',
        border: 'border-blue-500', 
        shadow: 'shadow-blue-500/50',
        shadowColor: '#3b82f6', // blue-500 hex approx
        sliderAccent: 'accent-blue-400',
        category: 'Bajo Peso'
    };
    
    // Normal: <25 (Green)
    if (bmi < 25) return { 
        value: bmi, 
        color: '#4ADE80', 
        tailwindColor: 'text-green-400', 
        bg: 'bg-green-400',
        border: 'border-green-500',
        shadow: 'shadow-green-500/50',
        shadowColor: '#22c55e',
        sliderAccent: 'accent-green-400',
        category: 'Peso Normal'
    };

    // Overweight: <30 (Yellow)
    if (bmi < 30) return { 
        value: bmi, 
        color: '#FACC15', 
        tailwindColor: 'text-yellow-400', 
        bg: 'bg-yellow-400', 
        border: 'border-yellow-500',
        shadow: 'shadow-yellow-500/50',
        shadowColor: '#eab308',
        sliderAccent: 'accent-yellow-400',
        category: 'Sobrepeso'
    };

    // Obese I: <35 (Orange)
    if (bmi < 35) return { 
        value: bmi, 
        color: '#FB923C', 
        tailwindColor: 'text-orange-400', 
        bg: 'bg-orange-400', 
        border: 'border-orange-500',
        shadow: 'shadow-orange-500/50',
        shadowColor: '#f97316',
        sliderAccent: 'accent-orange-400',
        category: 'Obesidad I'
    };

    // Obese II: <40 (Red)
    if (bmi < 40) return { 
        value: bmi, 
        color: '#F87171', 
        tailwindColor: 'text-red-400', 
        bg: 'bg-red-400', 
        border: 'border-red-500',
        shadow: 'shadow-red-500/50',
        shadowColor: '#ef4444',
        sliderAccent: 'accent-red-400',
        category: 'Obesidad II'
    };

    // Obese III: >= 40 (Dark Red)
    return { 
        value: bmi, 
        color: '#EF4444', 
        tailwindColor: 'text-red-600', 
        bg: 'bg-red-600', 
        border: 'border-red-700',
        shadow: 'shadow-red-900/50',
        shadowColor: '#991b1b',
        sliderAccent: 'accent-red-600',
        category: 'Obesidad III'
    };
};
