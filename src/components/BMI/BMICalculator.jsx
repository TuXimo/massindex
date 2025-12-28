import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Helper Component for Imperial Input to handle format state
const ImperialHeightInput = ({ inches, onChange, min, max, onError }) => {
  const [localVal, setLocalVal] = useState("");

  // Helpers
  const format = (val) => {
    if (!val) return "";
    const feet = Math.floor(val / 12);
    const inc = Math.round(val % 12);
    if (inc === 12) return `${feet + 1}'0"`;
    return `${feet}'${inc}"`;
  };

  useEffect(() => {
    setLocalVal(format(inches));
  }, [inches]);

  const handleBlur = () => {
    let val = localVal;
    let parsed = null;

    const ftInMatch = val.match(/(\d+)'\s*(\d+)/);
    const decimalMatch = val.match(/^(\d+)[\.,](\d+)$/);

    if (ftInMatch) {
      parsed = parseInt(ftInMatch[1]) * 12 + parseInt(ftInMatch[2]);
    } else if (decimalMatch) {
      // Heuristic: 5.3 -> 5'3"
      const feet = parseInt(decimalMatch[1]);
      const inches = parseInt(decimalMatch[2]);
      if (feet < 9) {
        parsed = feet * 12 + inches;
      } else {
        parsed = parseFloat(val.replace(",", "."));
      }
    } else {
      const num = parseFloat(val.replace(",", "."));
      if (!isNaN(num)) {
        if (num < 10) {
          parsed = num * 12; // treat as feet
        } else {
          parsed = num; // inches
        }
      }
    }

    if (parsed !== null && !isNaN(parsed)) {
      if (parsed < min) {
        if (onError) onError(min, "min");
        parsed = min;
      }
      if (parsed > max) {
        if (onError) onError(max, "max");
        parsed = max;
      }
      onChange(parsed);
      setLocalVal(format(parsed));
    } else {
      setLocalVal(format(inches));
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value.replace(/[.,]/g, "'"))}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white font-bold text-lg placeholder-slate-600 transition-all"
      placeholder="5'9&quot;"
    />
  );
};

export default function BMICalculator({
  weight,
  height,
  setWeight,
  setHeight,
  unit = "metric",
  ranges,
}) {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState(null);
  const errorTimerRef = useRef(null);

  // Show temporary error message
  const triggerError = (val, type = "max") => {
    const msg =
      type === "max"
        ? t("validation.maxValue", { max: val })
        : t("validation.minValue", { min: val }); // Need to add this key
    setErrorMsg(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 3000);
  };

  // Local state for deferred updates
  const [localWeight, setLocalWeight] = useState(weight);
  const [localHeight, setLocalHeight] = useState(height);

  // Sync local state when props change (e.g. unit switch or external update)
  useEffect(() => {
    setLocalWeight(weight);
  }, [weight]);

  useEffect(() => {
    setLocalHeight(height);
  }, [height]);

  const handleManualInput = (setter) => (e) => {
    let value = e.target.value;

    // Auto-replace comma with dot
    value = value.replace(",", ".");

    // Allow strictly digits and one dot
    if (/[^0-9.]/.test(value)) return;
    if ((value.match(/\./g) || []).length > 1) return;

    if (value.length > 1 && value.startsWith("0") && value[1] !== ".") {
      value = value.replace(/^0+/, "");
    }

    setter(value);
  };

  const commitInput = (val, setter, min, max, type) => {
    if (val === "") {
      setter("");
      return;
    }
    let num = parseFloat(val);
    if (isNaN(num)) {
      setter(""); // or keep previous? let's clear if invalid
      return;
    }

    if (num < min) {
      triggerError(min, "min");
      num = min;
    } else if (num > max) {
      triggerError(max, "max");
      num = max;
    }

    setter(num.toString());
    // Force sync local to formatted/clamped string
    if (type === "weight") setLocalWeight(num.toString());
    if (type === "height") setLocalHeight(num.toString());
  };

  // Limits based on EFFECTIVE ranges pass from parent
  const weightMin = ranges?.wMin || 0;
  const weightMax = ranges?.wMax || (unit === "metric" ? 650 : 1433);
  const heightMin = ranges?.hMin || 0;
  const heightMax = ranges?.hMax || (unit === "metric" ? 272 : 107);

  const handleWeightCommit = () =>
    commitInput(localWeight, setWeight, weightMin, weightMax, "weight");
  const handleHeightCommit = () =>
    commitInput(localHeight, setHeight, heightMin, heightMax, "height");

  return (
    <div className="p-4 lg:p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl flex-1 h-full transition-all duration-300 hover:shadow-2xl hover:border-slate-600 hover:bg-slate-800/60 relative">
      {/* Error Toast styled within component */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-bounce text-center min-w-[200px]">
          {errorMsg}
        </div>
      )}

      <h3 className="font-bold text-lg lg:text-xl mb-4 lg:mb-6 text-center text-white uppercase tracking-wider">
        {t("calculator.title")}
      </h3>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2 text-slate-200">
            {t("calculator.weight")} ({unit === "metric" ? "kg" : "lb"})
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={localWeight}
            onChange={handleManualInput(setLocalWeight)}
            onBlur={handleWeightCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleWeightCommit();
                e.target.blur();
              }
            }}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white font-bold text-lg placeholder-slate-600 transition-all"
            placeholder={unit === "metric" ? "70" : "150"}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-2 text-slate-200">
            {t("calculator.height")} ({unit === "metric" ? "cm" : "in"})
          </label>
          {unit === "metric" ? (
            <input
              type="text"
              inputMode="decimal"
              value={localHeight}
              onChange={handleManualInput(setLocalHeight)}
              onBlur={handleHeightCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleHeightCommit();
                  e.target.blur();
                }
              }}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white font-bold text-lg placeholder-slate-600 transition-all"
              placeholder="175"
              required
            />
          ) : (
            <div className="[&>input]:w-full [&>input]:p-3 [&>input]:bg-slate-900 [&>input]:border [&>input]:border-slate-700 [&>input]:rounded-lg [&>input]:focus:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500/50 [&>input]:focus:border-blue-500 [&>input]:text-white [&>input]:font-bold [&>input]:placeholder-slate-600 [&>input]:transition-all">
              <ImperialHeightInput
                inches={height}
                onChange={setHeight}
                min={heightMin}
                max={heightMax}
                onError={triggerError}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-dashed border-slate-700">
        <p className="text-xs font-bold text-slate-500 uppercase text-center mb-3">
          {t("calculator.formula")}
        </p>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-center">
          <span className="font-bold text-lg block text-slate-200">
            {unit === "metric"
              ? t("calculator.formulaMetric")
              : t("calculator.formulaImperial")}
          </span>
          <span className="text-xs font-bold text-slate-500 block mt-1">
            {unit === "metric" ? "(kg / m²)" : "(lb / in²)"}
          </span>
        </div>
      </div>

      <div className="mt-6 text-xs text-center font-bold text-slate-600 uppercase">
        {t("calculator.autoUpdate")}
      </div>
    </div>
  );
}
