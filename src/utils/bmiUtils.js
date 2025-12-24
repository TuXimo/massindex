
export const getBmiInfo = (weight, height, unit, userConfig = null) => {
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

    // TODO: Add Logic for Children Percentiles here if userConfig.mode === 'child'
    // For now, we reuse adult categories as placeholder but with a note
    // Real implementation would require lookup tables (WHO/CDC)
    
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

export const getSliderRanges = (unit, mode, age) => {
    // Default Adult Ranges
    const defaultMetric = { hMin: 140, hMax: 220, hStep: 5, wMin: 40, wMax: 160, wStep: 5 };
    const defaultImperial = { hMin: 55, hMax: 87, hStep: 2, wMin: 90, wMax: 350, wStep: 10 }; // h in inches, w in lbs

    if (mode !== 'child') {
        return unit === 'metric' ? defaultMetric : defaultImperial;
    }

    // Child Ranges logic
    // Age: 2 - 20
    const cleanAge = parseInt(age);
    
    // Fallback if NaN or out of bounds (though typical input logic prevents this)
    if (isNaN(cleanAge) || cleanAge < 2) return unit === 'metric' ? defaultMetric : defaultImperial;

    // Heuristic Formulas for Ranges
    // Height (cm) approx: 
    // 2yo: 80-95cm
    // 10yo: 130-150cm
    // Min Range ~ -20% of avg, Max ~ +20%
    
    // Very rough growth curve tracking for SLIDER BOUNDARIES (not medical limits)
    // hMin = 70 + (age * 4) -> 2y=78, 10y=110, 18y=142
    // hMax = 100 + (age * 6) -> 2y=112, 10y=160, 18y=208
    
    // Weight (kg) approx:
    // 2yo: 10-15kg
    // 10yo: 30-45kg
    // wMin = 8 + (age * 1.5) -> 2y=11, 10y=23, 18y=35
    // wMax = 20 + (age * 5) -> 2y=30, 10y=70, 18y=110 (allows overweight range)

    let hMin, hMax, wMin, wMax;

    if (unit === 'metric') {
        hMin = 70 + (cleanAge * 3.5);
        hMax = 100 + (cleanAge * 6.5);
        wMin = 8 + (cleanAge * 1.5);
        wMax = 20 + (cleanAge * 6); // Allow headroom for obesity checking
        
        // Floor/Ceil and Stephens
        return {
            hMin: Math.floor(hMin),
            hMax: Math.ceil(hMax),
            hStep: 5,
            wMin: Math.floor(wMin),
            wMax: Math.ceil(wMax),
            wStep: 5
        };
    } else {
        // Imperial
        // Convert metric heuristic to imperial
        hMin = (70 + (cleanAge * 3.5)) / 2.54;
        hMax = (100 + (cleanAge * 6.5)) / 2.54;
        wMin = (8 + (cleanAge * 1.5)) * 2.2;
        wMax = (20 + (cleanAge * 6)) * 2.2;

        return {
            hMin: Math.floor(hMin),
            hMax: Math.ceil(hMax),
            hStep: 2, // inches (matches table step)
            wMin: Math.floor(wMin),
            wMax: Math.ceil(wMax),
            wStep: 10 // lbs (matches table step)
        };
    }
};
